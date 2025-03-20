import Assignment from "../models/assign.model.js";
import User from "../models/user.model.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import { uploadFileToMongoDB } from "../lib/mongoFileUpload.js";

export const createAssignment = async (req, res) => {
  try {
    const {
      title,
      description,
      dueDate,
      assignedTo,
      attachments = [],
    } = req.body;
    const creatorId = req.user._id;

    // Validate input
    if (
      !title ||
      !description ||
      !dueDate ||
      !assignedTo ||
      !assignedTo.length
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Upload attachments to MongoDB if any
    const uploadedAttachments = [];
    if (attachments.length > 0) {
      for (const attachment of attachments) {
        try {
          const fileObject = await uploadFileToMongoDB(attachment);
          uploadedAttachments.push(fileObject);
        } catch (error) {
          console.error("File upload error:", error);
          return res.status(400).json({ error: "Failed to upload attachment" });
        }
      }
    }

    const newAssignment = new Assignment({
      creatorId,
      title,
      description,
      dueDate,
      assignedTo,
      attachments: uploadedAttachments,
    });

    await newAssignment.save();

    // Notify assigned users
    for (const userId of assignedTo) {
      const receiverSocketId = getReceiverSocketId(userId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newAssignment", {
          assignmentId: newAssignment._id,
          creator: req.user.fullName,
          title: newAssignment.title,
        });
      }
    }

    res.status(201).json(newAssignment);
  } catch (error) {
    console.error("Error in createAssignment controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAssignments = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get assignments created by this user or assigned to this user
    const assignments = await Assignment.find({
      $or: [{ creatorId: userId }, { assignedTo: userId }],
    })
      .populate("creatorId", "fullName profilePic")
      .populate("assignedTo", "fullName profilePic");

    res.status(200).json(assignments);
  } catch (error) {
    console.error("Error in getAssignments controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findById(id)
      .populate("creatorId", "fullName profilePic")
      .populate("assignedTo", "fullName profilePic")
      .populate("submissions.userId", "fullName profilePic");

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    res.status(200).json(assignment);
  } catch (error) {
    console.error("Error in getAssignmentById controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const submitAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, attachments = [] } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Check if user is assigned to this assignment
    if (!assignment.assignedTo.includes(userId)) {
      return res
        .status(403)
        .json({ error: "You are not assigned to this assignment" });
    }

    // Check if user has already submitted
    const existingSubmission = assignment.submissions.find(
      (sub) => sub.userId.toString() === userId.toString()
    );

    if (existingSubmission) {
      return res
        .status(400)
        .json({ error: "You have already submitted this assignment" });
    }

    // Process attachments if any
    const processedAttachments = [];
    if (attachments.length > 0) {
      for (const attachment of attachments) {
        try {
          const fileObject = await uploadFileToMongoDB(attachment);
          processedAttachments.push(fileObject);
        } catch (error) {
          console.error("File upload error:", error);
          return res.status(400).json({ error: "Failed to upload attachment" });
        }
      }
    }

    // Add submission
    assignment.submissions.push({
      userId,
      content,
      attachments: processedAttachments,
    });

    await assignment.save();

    // Notify creator
    const creatorSocketId = getReceiverSocketId(assignment.creatorId);
    if (creatorSocketId) {
      io.to(creatorSocketId).emit("newSubmission", {
        assignmentId: assignment._id,
        student: req.user.fullName,
        title: assignment.title,
      });
    }

    res.status(201).json(assignment);
  } catch (error) {
    console.error("Error in submitAssignment controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const gradeSubmission = async (req, res) => {
  try {
    const { id, submissionId } = req.params;
    const { score, feedback } = req.body;
    const userId = req.user._id;

    // Validate input
    if (score === undefined || score === null) {
      return res.status(400).json({ error: "Score is required" });
    }

    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    // Check if user is the creator
    if (assignment.creatorId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "Only the creator can grade submissions" });
    }

    // Find submission
    const submission = assignment.submissions.id(submissionId);

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    // Update grade
    submission.grade = {
      score,
      feedback: feedback || "",
      gradedAt: new Date(),
    };

    await assignment.save();

    // Notify student
    const studentSocketId = getReceiverSocketId(submission.userId);
    if (studentSocketId) {
      io.to(studentSocketId).emit("submissionGraded", {
        assignmentId: assignment._id,
        title: assignment.title,
        score: score,
      });
    }

    res.status(200).json(assignment);
  } catch (error) {
    console.error("Error in gradeSubmission controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const submitAssignmentWithFiles = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { content, attachmentData } = req.body;
    const userId = req.user._id;

    // Process file if provided
    let attachments = [];
    if (attachmentData && Array.isArray(attachmentData)) {
      // Process multiple files
      for (const fileData of attachmentData) {
        const fileObject = await uploadFileToMongoDB(fileData);
        attachments.push(fileObject);
      }
    } else if (attachmentData) {
      // Process single file
      const fileObject = await uploadFileToMongoDB(attachmentData);
      attachments.push(fileObject);
    }

    // Find the assignment and add submission
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Create submission object
    const submission = {
      userId,
      content,
      attachments,
      submittedAt: new Date(),
    };

    // Add submission to assignment
    assignment.submissions.push(submission);
    await assignment.save();

    res.status(200).json(assignment);
  } catch (error) {
    console.error("Error submitting assignment:", error);
    res.status(500).json({ message: "Error submitting assignment" });
  }
};
