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
      return toast.error("Por favor, agrega contenido a tu envío");
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
      toast.error(error.message || "Error al enviar la tarea");
    }
  };

  const handleGradeSubmit = async (submissionId) => {
    if (!gradeData.score || isNaN(Number(gradeData.score))) {
      return toast.error("Por favor, ingresa una puntuación válida");
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
          Volver a asignaciones
        </Link>

        <div className="bg-base-100 rounded-lg shadow overflow-hidden">
          {/* Assignment header */}
          <div className="p-4 sm:p-6 border-b border-base-300">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <h1 className="text-xl sm:text-2xl font-bold">
                {currentAssignment.title}
              </h1>
              <div>
                {isCreator ? (
                  <span className="badge badge-primary">Tu tarea</span>
                ) : mySubmission ? (
                  <span className="badge badge-success">Enviado</span>
                ) : isPastDue ? (
                  <span className="badge badge-error">Vencida</span>
                ) : (
                  <span className="badge badge-warning">Pendiente</span>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
              <div className="flex items-center gap-2">
                <UserCircle className="size-4 text-base-content/70 flex-shrink-0" />
                <span className="truncate">
                  Creado por: {currentAssignment.creatorId.fullName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-base-content/70" />
                <span>Entrega: {formatDate(currentAssignment.dueDate)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="size-4 text-base-content/70" />
                <span>Creado: {formatDate(currentAssignment.createdAt)}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="size-4 text-base-content/70" />
                <span>
                  {isPastDue ? "Vencida por " : "Tiempo restante: "}
                  {formatTimeRemaining(currentAssignment.dueDate)}
                </span>
              </div>
            </div>

            <h2 className="text-lg font-medium mb-3">Descripción</h2>
            <p className="whitespace-pre-wrap break-words mb-6">
              {currentAssignment.description}
            </p>

            {currentAssignment.attachments.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-medium mb-3">Adjuntos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentAssignment.attachments.map((attachment, index) => {
                    return (
                      <a
                        key={index}
                        href={attachment.url} // Replace existing path with direct Supabase URL
                        download={
                          attachment.originalname || `adjunto-${index + 1}`
                        }
                        className="flex items-center gap-2 p-3 border rounded-lg hover:bg-base-200 transition-colors"
                      >
                        <File className="size-5 flex-shrink-0" />
                        <span className="flex-1 truncate">
                          {attachment.originalname || `Adjunto ${index + 1}`}
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
                  Envíos ({currentAssignment.submissions.length})
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
                            Enviado: {formatDate(submission.submittedAt)}
                          </span>
                          {submission.grade?.score !== undefined ? (
                            <span className="badge badge-success">
                              Calificado: {submission.grade.score}/100
                            </span>
                          ) : (
                            <span className="badge badge-warning">
                              No calificado
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
                                Adjuntos
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {submission.attachments?.map(
                                  (attachment, idx) => (
                                    <a
                                      key={idx}
                                      href={attachment.url} // Replace existing path with direct Supabase URL
                                      download={
                                        attachment.originalname ||
                                        `adjunto-${idx + 1}`
                                      }
                                      className="flex items-center gap-2 p-2 border rounded-lg hover:bg-base-200 transition-colors"
                                    >
                                      <File className="size-4 flex-shrink-0" />
                                      <span className="flex-1 truncate text-sm">
                                        {attachment.originalname ||
                                          `Adjunto ${idx + 1}`}
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
                                Calificar envío
                              </h3>
                              <div className="space-y-3">
                                <div className="form-control">
                                  <label className="label">
                                    <span className="label-text">
                                      Puntuación (sobre 100)
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
                                      Comentarios (opcional)
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
                                    Cancelar
                                  </button>
                                  <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() =>
                                      handleGradeSubmit(submission._id)
                                    }
                                  >
                                    Enviar calificación
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {submission.grade?.score !== undefined && (
                            <div className="p-4 bg-base-200 rounded-lg mt-4">
                              <h3 className="text-sm font-medium mb-2">
                                Detalles de calificación
                              </h3>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span>Puntuación:</span>
                                  <span className="font-medium">
                                    {submission.grade.score}/100
                                  </span>
                                </div>
                                {submission.grade.feedback && (
                                  <div>
                                    <span className="block mb-1">
                                      Comentarios:
                                    </span>
                                    <p className="text-sm p-2 bg-base-300 rounded">
                                      {submission.grade.feedback}
                                    </p>
                                  </div>
                                )}
                                <div className="text-xs text-base-content/70 text-right">
                                  Calificado el:{" "}
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
                              Cerrar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => setViewSubmission(submission._id)}
                          >
                            Ver envío
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
                  {mySubmission ? "Tu envío" : "Envia tu trabajo"}
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
                          Tus archivos adjuntos
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {mySubmission.attachments?.map((attachment, idx) => {
                            return (
                              <a
                                key={idx}
                                href={attachment.url} // Replace existing path with direct Supabase URL
                                download={attachment.originalname}
                                className="flex items-center gap-2 p-2 border rounded-lg hover:bg-base-200 transition-colors"
                              >
                                <File className="size-4 flex-shrink-0" />
                                <span className="flex-1 truncate text-sm">
                                  {attachment.originalname ||
                                    `Adjunto ${idx + 1}`}
                                </span>
                                <Download className="size-3" />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="text-sm text-base-content/70">
                      Enviado el: {formatDate(mySubmission.submittedAt)}
                    </div>

                    {mySubmission.grade && (
                      <div className="p-4 bg-base-200 rounded-lg mt-4">
                        <h3 className="text-sm font-medium mb-2">
                          Tu calificación
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Puntuación:</span>
                            <span className="font-medium">
                              {mySubmission.grade.score}/100
                            </span>
                          </div>
                          {mySubmission.grade.feedback && (
                            <div>
                              <span className="block mb-1">Comentarios:</span>
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
                      El plazo para esta tarea ha vencido. Ya no puedes enviar
                      tu trabajo.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">
                          Tu respuesta
                        </span>
                      </label>
                      <textarea
                        className="textarea textarea-bordered h-32"
                        placeholder="Escribe tu respuesta aquí..."
                        value={submissionContent}
                        onChange={(e) => setSubmissionContent(e.target.value)}
                      ></textarea>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-medium">
                          Archivos Adjuntos (Opcional)
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
                        Enviar Tarea
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
