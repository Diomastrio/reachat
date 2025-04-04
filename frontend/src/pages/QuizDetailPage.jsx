/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuizStore } from "../store/useQuizStore";
import { useAuthStore } from "../store/useAuthStore";
import {
  ArrowLeft,
  Clock,
  Loader,
  CheckCircle,
  BookOpen,
  User,
  Calendar,
  BarChart,
} from "lucide-react";
import { formatDate } from "../lib/utils";
import toast from "react-hot-toast";

const QuizDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentQuiz, getQuizById, isLoading } = useQuizStore();
  const { authUser } = useAuthStore();
  const [quizResults, setQuizResults] = useState(null);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        await getQuizById(id);
      } catch (error) {
        toast.error("Error al cargar el cuestionario");
      }
    };

    loadQuiz();
  }, [id, getQuizById]);

  if (isLoading || !currentQuiz) {
    return (
      <div className="h-screen pt-20 flex items-center justify-center">
        <Loader className="size-8 animate-spin" />
      </div>
    );
  }

  const isCreator = currentQuiz.creatorId._id === authUser._id;
  const isAssignedToMe = currentQuiz.assignedTo?.some(
    (user) => user._id === authUser._id
  );

  const handleStartQuiz = () => {
    navigate(`/quizzes/${id}/take`);
  };

  return (
    <div className="h-screen pt-20 pb-10">
      <div className="max-w-4xl mx-auto p-4">
        {/* Back button */}
        <Link to="/quizzes" className="flex items-center gap-2 text-sm mb-6">
          <ArrowLeft className="size-4" />
          Volver a cuestionarios
        </Link>

        <div className="bg-base-100 rounded-lg shadow overflow-hidden">
          {/* Quiz header */}
          <div className="p-4 sm:p-6 border-b border-base-300">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <h1 className="text-xl sm:text-2xl font-bold">
                {currentQuiz.title}
              </h1>
              <div>
                {isCreator ? (
                  <span className="badge badge-primary">Tu cuestionario</span>
                ) : (
                  <span className="badge badge-info">Asignado</span>
                )}
              </div>
            </div>
          </div>

          {/* Quiz content */}
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
              <div className="flex items-center gap-2">
                <User className="size-4 text-base-content/70 flex-shrink-0" />
                <span className="truncate">
                  Creado por: {currentQuiz.creatorId.fullName}
                </span>
              </div>

              {currentQuiz.timeLimit && (
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-base-content/70" />
                  <span>Tiempo límite: {currentQuiz.timeLimit} minutos</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-base-content/70" />
                <span>Creado: {formatDate(currentQuiz.createdAt)}</span>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle className="size-4 text-base-content/70" />
                <span>Mínimo para aprobar: {currentQuiz.passScore}%</span>
              </div>
            </div>

            <h2 className="text-lg font-medium mb-3">Descripción</h2>
            <p className="whitespace-pre-wrap break-words mb-6">
              {currentQuiz.description || "Sin descripción"}
            </p>

            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="size-5 text-base-content/70" />
              <span className="font-medium">
                {currentQuiz.questions.length} Preguntas
              </span>
            </div>

            {/* Quiz actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end mt-8">
              {isCreator && (
                <Link to={`/quizzes/${id}/results`} className="btn btn-outline">
                  <BarChart className="size-4 mr-2" />
                  Ver estadísticas
                </Link>
              )}

              {(isAssignedToMe || currentQuiz.isPublic) && (
                <button onClick={handleStartQuiz} className="btn btn-primary">
                  Iniciar cuestionario
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizDetailPage;
