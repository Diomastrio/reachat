/* eslint-disable no-unused-vars */
import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useAssignmentStore } from "../store/useAssignmentStore";
import { useAuthStore } from "../store/useAuthStore";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  File,
  ImagePlus,
  Loader,
  Upload,
  UserCircle,
  X,
} from "lucide-react";
import { assignmentService } from "../lib/assignmentService";
// import FileComp from "../components/FileComp";
import toast from "react-hot-toast";
import { formatDate, formatTimeRemaining } from "../lib/utils";

const AssignmentDetailPage = () => {
  const { id } = useParams();
  const {
    currentAssignment,
    getAssignmentById,
    isLoading,
    submitAssignment,
    gradeSubmission,
  } = useAssignmentStore();
  const { authUser } = useAuthStore();
  const fileInputRef = useRef(null);

  const [submissionContent, setSubmissionContent] = useState("");
  const [submissionAttachments, setSubmissionAttachments] = useState([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState([]);
  const [viewSubmission, setViewSubmission] = useState(null);
  const [gradeData, setGradeData] = useState({ score: "", feedback: "" });
  const [previewFile, setPreviewFile] = useState(null);

  useEffect(() => {
    getAssignmentById(id);
  }, [id, getAssignmentById]);

  if (isLoading || !currentAssignment) {
    return (
      <div className="h-screen pt-20 flex items-center justify-center">
        <Loader className="size-8 animate-spin" />
      </div>
    );
  }

  const isCreator = currentAssignment.creatorId._id === authUser._id;
  const isAssignedToMe = currentAssignment.assignedTo.some(
    (user) => user._id === authUser._id
  );
  const mySubmission = currentAssignment.submissions.find(
    (sub) => sub.userId._id === authUser._id
  );
  const isPastDue = new Date(currentAssignment.dueDate) < new Date();

  // Update the handleAttachmentChange function to better match CreateAssignmentPage
  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const validFiles = [];
    const newPreviews = [];

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Max size is 5MB.`);
        return;
      }

      // Check file type
      if (!allowedTypes.includes(file.type)) {
        toast.error(
          `File ${file.name} has an invalid type. Only PDF and DOC/DOCX files are allowed.`
        );
        return;
      }

      // Add valid file to arrays
      validFiles.push(file);
      newPreviews.push({
        name: file.name,
        type: file.type,
        size: file.size,
      });
    });

    // Update state with valid files
    setAttachmentPreviews((prev) => [...prev, ...newPreviews]);
    setSubmissionAttachments((prev) => [...prev, ...validFiles]);
  };

  // Add a function to preview files
  const handlePreviewFile = (file, fileName) => {
    setPreviewFile({ file, fileName });
  };

  // Add a function to close preview
  const closePreview = () => {
    setPreviewFile(null);
  };

  const removeAttachment = (index) => {
    setAttachmentPreviews((prev) => prev.filter((_, i) => i !== index));
    setSubmissionAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!submissionContent.trim()) {
      return toast.error("Please add some content to your submission");
    }

    try {
      // Use the submitAssignmentWithFiles method from the service
      await assignmentService.submitAssignmentWithFiles(currentAssignment._id, {
        content: submissionContent,
        attachments: submissionAttachments,
      });

      setSubmissionContent("");
      setSubmissionAttachments([]);
      setAttachmentPreviews([]);

      // Refresh assignment data
      getAssignmentById(currentAssignment._id);
    } catch (error) {
      console.error("Failed to submit assignment:", error);
      toast.error(error.message || "Failed to submit assignment");
    }
  };

  const handleGradeSubmit = async (submissionId) => {
    if (!gradeData.score || isNaN(Number(gradeData.score))) {
      return toast.error("Please enter a valid score");
    }

    try {
      await gradeSubmission(currentAssignment._id, submissionId, gradeData);

      setViewSubmission(null);
      setGradeData({ score: "", feedback: "" });
    } catch (error) {
      console.error("Failed to grade submission:", error);
    }
  };

  return (
    <div className="h-screen pt-20 pb-10">
      <div className="max-w-4xl mx-auto p-4">
        {/* Back button */}
        <Link
          to="/assignments"
          className="flex items-center gap-2 text-sm mb-6"
        >
          <ArrowLeft className="size-4" />
          Back to assignments
        </Link>

        <div className="bg-base-100 rounded-lg shadow overflow-hidden">
          {/* Assignment header */}
          <div className="p-6 border-b border-base-300">
            <div className="flex items-start justify-between">
              <h1 className="text-2xl font-bold">{currentAssignment.title}</h1>
              <div>
                {isCreator ? (
                  <span className="badge badge-primary">Your Assignment</span>
                ) : mySubmission ? (
                  <span className="badge badge-success">Submitted</span>
                ) : isPastDue ? (
                  <span className="badge badge-error">Past Due</span>
                ) : (
                  <span className="badge badge-warning">Pending</span>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <UserCircle className="size-4 text-base-content/70" />
                <span>Created by: {currentAssignment.creatorId.fullName}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-base-content/70" />
                <span>Due: {formatDate(currentAssignment.dueDate)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="size-4 text-base-content/70" />
                <span>Created: {formatDate(currentAssignment.createdAt)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="size-4 text-base-content/70" />
                <span>
                  {isPastDue ? "Overdue by " : "Time remaining: "}
                  {formatTimeRemaining(currentAssignment.dueDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Assignment content */}
          <div className="p-6">
            <h2 className="text-lg font-medium mb-3">Description</h2>
            <p className="whitespace-pre-wrap mb-6">
              {currentAssignment.description}
            </p>

            {currentAssignment.attachments.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-medium mb-3">Attachments</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentAssignment.attachments.map((attachment, index) => {
                    return (
                      <a
                        key={index}
                        href={`/api/assignments/${id}/files/assignment/${attachment._id}`}
                        download={
                          attachment.filename || `attachment-${index + 1}`
                        }
                        className="flex items-center gap-2 p-3 border rounded-lg hover:bg-base-200 transition-colors"
                      >
                        <File className="size-5 flex-shrink-0" />
                        <span className="flex-1 truncate">
                          {attachment.filename || `Attachment ${index + 1}`}
                        </span>
                        <Download className="size-4" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Submissions section */}
            {isCreator && currentAssignment.submissions.length > 0 && (
              <div className="mt-8">
                <h2 className="text-lg font-medium mb-3">
                  Submissions ({currentAssignment.submissions.length})
                </h2>
                <div className="space-y-4">
                  {currentAssignment.submissions.map((submission) => (
                    <div key={submission._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={submission.userId.profilePic || "/avatar.png"}
                            alt={submission.userId.fullName}
                            className="size-8 rounded-full object-cover"
                          />
                          <span className="font-medium">
                            {submission.userId.fullName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-base-content/70">
                            Submitted: {formatDate(submission.submittedAt)}
                          </span>
                          {submission.grade?.score !== undefined ? (
                            <span className="badge badge-success">
                              Graded: {submission.grade.score}/100
                            </span>
                          ) : (
                            <span className="badge badge-warning">
                              Not Graded
                            </span>
                          )}
                        </div>
                      </div>

                      {viewSubmission === submission._id ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-base-200 rounded-lg">
                            <p className="whitespace-pre-wrap">
                              {submission.content}
                            </p>
                          </div>

                          {/* Update this section in your component where you display attachments */}
                          {submission.attachments?.length > 0 && (
                            <div className="mt-3">
                              <h3 className="text-sm font-medium mb-2">
                                Attachments
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {submission.attachments?.map(
                                  (attachment, idx) => (
                                    <a
                                      key={idx}
                                      href={`/api/assignments/files/${attachment.filename}`}
                                      download={
                                        attachment.originalname ||
                                        `attachment-${idx + 1}`
                                      }
                                      className="flex items-center gap-2 p-2 border rounded-lg hover:bg-base-200 transition-colors"
                                    >
                                      <File className="size-4 flex-shrink-0" />
                                      <span className="flex-1 truncate text-sm">
                                        {attachment.originalname ||
                                          `Attachment ${idx + 1}`}
                                      </span>
                                      <Download className="size-3" />
                                    </a>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                          {!submission.grade?.score && (
                            <div className="p-4 bg-base-200 rounded-lg mt-4">
                              <h3 className="text-sm font-medium mb-3">
                                Grade Submission
                              </h3>
                              <div className="space-y-3">
                                <div className="form-control">
                                  <label className="label">
                                    <span className="label-text">
                                      Score (out of 100)
                                    </span>
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    className="input input-bordered"
                                    value={gradeData.score}
                                    onChange={(e) =>
                                      setGradeData({
                                        ...gradeData,
                                        score: e.target.value,
                                      })
                                    }
                                  />
                                </div>

                                <div className="form-control">
                                  <label className="label">
                                    <span className="label-text">
                                      Feedback (optional)
                                    </span>
                                  </label>
                                  <textarea
                                    className="textarea textarea-bordered"
                                    value={gradeData.feedback}
                                    onChange={(e) =>
                                      setGradeData({
                                        ...gradeData,
                                        feedback: e.target.value,
                                      })
                                    }
                                  ></textarea>
                                </div>

                                <div className="flex justify-end gap-2">
                                  <button
                                    className="btn btn-sm btn-outline"
                                    onClick={() => setViewSubmission(null)}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() =>
                                      handleGradeSubmit(submission._id)
                                    }
                                  >
                                    Submit Grade
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {submission.grade?.score !== undefined && (
                            <div className="p-4 bg-base-200 rounded-lg mt-4">
                              <h3 className="text-sm font-medium mb-2">
                                Grade Details
                              </h3>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span>Score:</span>
                                  <span className="font-medium">
                                    {submission.grade.score}/100
                                  </span>
                                </div>
                                {submission.grade.feedback && (
                                  <div>
                                    <span className="block mb-1">
                                      Feedback:
                                    </span>
                                    <p className="text-sm p-2 bg-base-300 rounded">
                                      {submission.grade.feedback}
                                    </p>
                                  </div>
                                )}
                                <div className="text-xs text-base-content/70 text-right">
                                  Graded on:{" "}
                                  {formatDate(submission.grade.gradedAt)}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex justify-end">
                            <button
                              className="btn btn-sm btn-ghost"
                              onClick={() => setViewSubmission(null)}
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => setViewSubmission(submission._id)}
                          >
                            View Submission
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* My submission section */}
            {isAssignedToMe && (
              <div className="mt-8 border-t pt-6">
                <h2 className="text-lg font-medium mb-3">
                  {mySubmission ? "Your Submission" : "Submit Your Work"}
                </h2>

                {mySubmission ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-base-200 rounded-lg">
                      <p className="whitespace-pre-wrap">
                        {mySubmission.content}
                      </p>
                    </div>

                    {mySubmission.attachments?.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium mb-2">
                          Your Attachments
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {mySubmission.attachments.map((attachment, idx) => {
                            return (
                              <a
                                key={idx}
                                href={attachment}
                                download={`my-attachment-${idx + 1}`}
                                className="flex items-center gap-2 p-2 border rounded-lg hover:bg-base-200 transition-colors"
                              >
                                <File className="size-4 flex-shrink-0" />
                                <span className="flex-1 truncate text-sm">
                                  Attachment {idx + 1}
                                </span>
                                <Download className="size-3" />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="text-sm text-base-content/70">
                      Submitted on: {formatDate(mySubmission.submittedAt)}
                    </div>

                    {mySubmission.grade && (
                      <div className="p-4 bg-base-200 rounded-lg mt-4">
                        <h3 className="text-sm font-medium mb-2">Your Grade</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Score:</span>
                            <span className="font-medium">
                              {mySubmission.grade.score}/100
                            </span>
                          </div>
                          {mySubmission.grade.feedback && (
                            <div>
                              <span className="block mb-1">Feedback:</span>
                              <p className="text-sm p-2 bg-base-300 rounded">
                                {mySubmission.grade.feedback}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : isPastDue ? (
                  <div className="p-4 bg-error/10 text-error rounded-lg">
                    <p>
                      The deadline for this assignment has passed. You can no
                      longer submit your work.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">
                          Your Answer
                        </span>
                      </label>
                      <textarea
                        className="textarea textarea-bordered h-32"
                        placeholder="Write your answer here..."
                        value={submissionContent}
                        onChange={(e) => setSubmissionContent(e.target.value)}
                      ></textarea>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">
                          Attachments (Optional)
                        </span>
                      </label>
                      {/* Update the file upload section */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="btn btn-outline btn-sm gap-2"
                        >
                          <ImagePlus className="size-4" />
                          Add Files
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          className="hidden"
                          onChange={handleAttachmentChange}
                        />
                        <span className="text-xs text-base-content/60">
                          Only PDF and DOC/DOCX files (max 5MB)
                        </span>
                      </div>

                      {attachmentPreviews.length > 0 && (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {attachmentPreviews.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 border rounded-lg bg-base-200"
                            >
                              <div className="flex-1 flex items-center gap-2 overflow-hidden">
                                <File className="size-4 flex-shrink-0" />
                                <span className="text-xs truncate">
                                  {file.name}
                                </span>
                              </div>
                              <button
                                type="button"
                                className="btn btn-xs btn-circle"
                                onClick={() => removeAttachment(index)}
                              >
                                <X className="size-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button type="submit" className="btn btn-primary">
                        <Upload className="size-4 mr-2" />
                        Submit Assignment
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetailPage;
