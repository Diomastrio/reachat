import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAssignmentStore } from "../store/useAssignmentStore";
import { useChatStore } from "../store/useChatStore";
import { Calendar, File, ImagePlus, Loader, X } from "lucide-react";
import toast from "react-hot-toast";

const CreateAssignmentPage = () => {
  const { createAssignment, isLoading } = useAssignmentStore();
  const { users, getUsers } = useChatStore();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    assignedTo: [],
    attachments: [],
  });

  const [attachmentPreviews, setAttachmentPreviews] = useState([]);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUserSelection = (userId) => {
    setFormData((prev) => {
      const assignedTo = prev.assignedTo.includes(userId)
        ? prev.assignedTo.filter((id) => id !== userId)
        : [...prev.assignedTo, userId];

      return { ...prev, assignedTo };
    });
  };

  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        // 5MB limit
        toast.error(`File ${file.name} is too large. Max size is 5MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachmentPreviews((prev) => [
          ...prev,
          {
            name: file.name,
            preview: reader.result,
            type: file.type,
          },
        ]);

        setFormData((prev) => ({
          ...prev,
          attachments: [...prev.attachments, reader.result],
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index) => {
    setAttachmentPreviews((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      return toast.error("Title is required");
    }

    if (!formData.description.trim()) {
      return toast.error("Description is required");
    }

    if (!formData.dueDate) {
      return toast.error("Due date is required");
    }

    if (formData.assignedTo.length === 0) {
      return toast.error("Please assign this to at least one user");
    }

    try {
      const assignment = await createAssignment(formData);
      if (assignment) {
        navigate(`/assignments/${assignment._id}`);
      }
    } catch (error) {
      console.error("Failed to create assignment:", error);
    }
  };

  return (
    <div className="h-screen pt-20">
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-base-100 rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Create New Assignment</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Title</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input input-bordered w-full"
                placeholder="Assignment title"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Description</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="textarea textarea-bordered w-full h-32"
                placeholder="Detailed assignment description..."
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Due Date</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="w-5 h-5 text-base-content/40" />
                </div>
                <input
                  type="datetime-local"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="input input-bordered w-full pl-10"
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Assign To</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {users.map((user) => (
                  <label
                    key={user._id}
                    className={`
                      flex items-center gap-2 p-2 rounded-lg cursor-pointer border
                      ${
                        formData.assignedTo.includes(user._id)
                          ? "border-primary bg-primary/10"
                          : "border-base-300"
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={formData.assignedTo.includes(user._id)}
                      onChange={() => handleUserSelection(user._id)}
                    />
                    <div className="flex items-center gap-2">
                      <img
                        src={user.profilePic || "/avatar.png"}
                        alt={user.fullName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-sm">{user.fullName}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Attachments</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-outline gap-2"
                >
                  <ImagePlus className="size-4" />
                  Add Attachments
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleAttachmentChange}
                />
                <span className="text-xs text-base-content/60">
                  Max size: 5MB per file
                </span>
              </div>

              {attachmentPreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {attachmentPreviews.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 border rounded-lg bg-base-200"
                    >
                      <div className="flex-1 flex items-center gap-2 overflow-hidden">
                        <File className="size-5 flex-shrink-0" />
                        <span className="text-sm truncate">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-circle"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate("/assignments")}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader className="size-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Assignment"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAssignmentPage;
