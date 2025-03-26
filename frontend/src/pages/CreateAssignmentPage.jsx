import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAssignmentStore } from "../store/useAssignmentStore";
import { useChatStore } from "../store/useChatStore";
import { Calendar, File as FileIcon, ImagePlus, Loader, X } from "lucide-react";
import toast from "react-hot-toast";

const CreateAssignmentPage = () => {
  const { createAssignment, isLoading } = useAssignmentStore();
  const { users, getUsers } = useChatStore();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Fix: initialize attachments as an array, not a string
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    assignedTo: [],
    attachments: [], // FIXED: initialize as array
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

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const validFiles = [];
    const newPreviews = [];

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(
          `El archivo ${file.name} es demasiado grande. El tamaño máximo es 5MB.`
        );
        return;
      }

      // Check file type
      if (!allowedTypes.includes(file.type)) {
        toast.error(
          `El archivo ${file.name} tiene un tipo inválido. Solo se permiten archivos PDF y DOC/DOCX.`
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
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles],
    }));
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

    // Debug: Log form data before submission
    console.log("Datos del formulario antes de enviar:", formData);

    if (!formData.title.trim()) {
      return toast.error("El título es obligatorio");
    }

    if (!formData.description.trim()) {
      return toast.error("La descripción es obligatoria");
    }

    if (!formData.dueDate) {
      return toast.error("La fecha de entrega es obligatoria");
    }

    if (formData.assignedTo.length === 0) {
      return toast.error("Por favor, asigna esto a al menos un usuario");
    }

    try {
      // Create FormData object for file uploads
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("dueDate", formData.dueDate);

      // Add assigned users
      formData.assignedTo.forEach((userId) => {
        formDataToSend.append("assignedTo", userId);
      });

      // Add attachment files if they exist
      if (formData.attachments && formData.attachments.length > 0) {
        formData.attachments.forEach((file) => {
          // Change "attachments" to "files" to match what multer expects in the backend
          formDataToSend.append("files", file); // CHANGED FROM "attachments" to "files"
        });
      }

      // Debug: Log formDataToSend entries
      for (const [key, value] of formDataToSend.entries()) {
        console.log(`${key}: ${value}`);
      }

      // Add right before sending to server
      console.log("Enviando datos de la tarea al servidor");
      for (const [key, value] of formDataToSend.entries()) {
        console.log(`${key}: ${value instanceof File ? value.name : value}`);
      }

      const assignment = await createAssignment(formDataToSend);
      if (assignment) {
        navigate(`/assignments/${assignment._id}`);
      }
    } catch (error) {
      console.error("Error al crear la tarea:", error);
      toast.error(error.message || "Error al crear la tarea");
    }
  };

  return (
    <div className="h-screen pt-20">
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-base-100 rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Crear Nueva Tarea</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Título</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input input-bordered w-full"
                placeholder="Título de la tarea"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Descripción</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="textarea textarea-bordered w-full h-32"
                placeholder="Descripción detallada de la tarea..."
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Fecha de entrega</span>
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
                <span className="label-text font-medium">Asignar a</span>
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
                <span className="label-text font-medium">
                  Archivos adjuntos
                </span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-outline gap-2"
                >
                  <ImagePlus className="size-4" />
                  Agregar Archivos
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
                  Solo archivos PDF y DOC/DOCX (máximo 5MB)
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
                        <FileIcon className="size-5 flex-shrink-0" />
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
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader className="size-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Tarea"
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
