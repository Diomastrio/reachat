/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useQuizStore } from "../store/useQuizStore";
import { useAuthStore } from "../store/useAuthStore";
import {
  ArrowLeft,
  Loader,
  CheckCircle,
  X,
  BarChart,
  Users,
  Clock,
  AlarmCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatDate } from "../lib/utils";
import toast from "react-hot-toast";

const QuizResultsPage = () => {
  const { id: quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentQuiz,
    getQuizById,
    quizStatistics,
    getQuizStatistics,
    isLoading,
  } = useQuizStore();
  const { authUser } = useAuthStore();

  const [attemptResult, setAttemptResult] = useState(
    location.state?.result || null
  );
  const [showQuestionsStats, setShowQuestionsStats] = useState(false);
  const [showStudentsList, setShowStudentsList] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        await getQuizById(quizId);
        // After getting the quiz, we can check if we're the creator
        // but we don't need to include currentQuiz in dependencies
        const quiz = useQuizStore.getState().currentQuiz;

        if (quiz?.creatorId?._id === authUser._id) {
          await getQuizStatistics(quizId);
        }
      } catch (error) {
        toast.error("Error al cargar datos del cuestionario");
      }
    };

    loadData();
    // Remove currentQuiz from dependencies
  }, [quizId, getQuizById, getQuizStatistics, authUser._id]);

  if (isLoading || !currentQuiz) {
    return (
      <div className="h-screen pt-20 flex items-center justify-center">
        <Loader className="size-8 animate-spin" />
      </div>
    );
  }

  const isCreator = currentQuiz.creatorId._id === authUser._id;

  // Format time in minutes and seconds
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins > 0 ? `${mins}m` : ""} ${secs}s`;
  };

  return (
    <div className="h-screen pt-20 pb-10">
      <div className="max-w-4xl mx-auto p-4">
        {/* Back button */}
        <Link
          to={`/quizzes/${quizId}`}
          className="flex items-center gap-2 text-sm mb-6"
        >
          <ArrowLeft className="size-4" />
          Volver al cuestionario
        </Link>

        <div className="bg-base-100 rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-base-300">
            <h1 className="text-2xl font-bold">
              Resultados: {currentQuiz.title}
            </h1>
            {!isCreator && (
              <div className="mt-2 text-sm text-base-content/70">
                Revisa tus resultados y respuestas a continuación.
              </div>
            )}
          </div>

          <div className="p-6">
            {/* Student's individual result */}
            {attemptResult && (
              <div className="mb-8">
                <div
                  className={`
                  p-6 rounded-lg text-center
                  ${attemptResult.passed ? "bg-success/20" : "bg-error/20"}
                `}
                >
                  <div className="flex justify-center mb-4">
                    {attemptResult.passed ? (
                      <CheckCircle className="size-16 text-success" />
                    ) : (
                      <X className="size-16 text-error" />
                    )}
                  </div>
                  <h2 className="text-2xl font-bold mb-1">
                    {attemptResult.percentageScore.toFixed(1)}%
                  </h2>
                  <p className="text-lg">
                    {attemptResult.passed ? "¡Aprobado!" : "No aprobado"}
                  </p>
                  <div className="text-sm mt-3">
                    Puntuación: {attemptResult.totalScore}/
                    {attemptResult.maxScore} puntos
                  </div>
                  <div className="text-sm mt-1">
                    Tiempo utilizado: {formatTime(attemptResult.timeSpent)}
                  </div>
                </div>
              </div>
            )}

            {/* Instructor's statistics */}
            {isCreator && quizStatistics && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-base-200 p-4 rounded-lg flex flex-col items-center text-center">
                    <Users className="size-8 mb-2 text-primary" />
                    <div className="font-medium">Intentos</div>
                    <div className="text-2xl font-bold">
                      {quizStatistics.totalAttempts}
                    </div>
                    <div className="text-xs text-base-content/70">
                      {quizStatistics.completedAttempts} completados
                    </div>
                  </div>

                  <div className="bg-base-200 p-4 rounded-lg flex flex-col items-center text-center">
                    <BarChart className="size-8 mb-2 text-primary" />
                    <div className="font-medium">Promedio</div>
                    <div className="text-2xl font-bold">
                      {quizStatistics.averageScore.toFixed(1)}%
                    </div>
                  </div>

                  <div className="bg-base-200 p-4 rounded-lg flex flex-col items-center text-center">
                    <CheckCircle className="size-8 mb-2 text-primary" />
                    <div className="font-medium">Tasa de aprobación</div>
                    <div className="text-2xl font-bold">
                      {quizStatistics.passRate.toFixed(1)}%
                    </div>
                  </div>

                  <div className="bg-base-200 p-4 rounded-lg flex flex-col items-center text-center">
                    <Clock className="size-8 mb-2 text-primary" />
                    <div className="font-medium">Tiempo promedio</div>
                    <div className="text-2xl font-bold">
                      {formatTime(quizStatistics.averageTime)}
                    </div>
                  </div>
                </div>

                {/* Questions statistics */}
                <div className="border rounded-lg overflow-hidden">
                  <div
                    className="p-4 bg-base-200 flex justify-between items-center cursor-pointer"
                    onClick={() => setShowQuestionsStats(!showQuestionsStats)}
                  >
                    <h3 className="font-medium">Estadísticas por pregunta</h3>
                    {showQuestionsStats ? (
                      <ChevronUp className="size-5" />
                    ) : (
                      <ChevronDown className="size-5" />
                    )}
                  </div>

                  {showQuestionsStats && (
                    <div className="p-4">
                      <div className="overflow-x-auto">
                        <table className="table table-sm w-full">
                          <thead>
                            <tr>
                              <th>Pregunta</th>
                              <th>Tipo</th>
                              <th>Respuestas</th>
                              <th>Correctas</th>
                              <th>Precisión</th>
                            </tr>
                          </thead>
                          <tbody>
                            {quizStatistics.questionStats.map((stat, index) => (
                              <tr key={stat.questionId}>
                                <td>
                                  {index + 1}. {stat.text}
                                </td>
                                <td>
                                  {stat.type === "multiple-choice"
                                    ? "Opción múltiple"
                                    : stat.type === "true-false"
                                    ? "Verdadero/Falso"
                                    : stat.type === "short-answer"
                                    ? "Respuesta corta"
                                    : "Respuesta larga"}
                                </td>
                                <td>{stat.totalAnswers}</td>
                                <td>{stat.correctAnswers}</td>
                                <td>{stat.accuracy.toFixed(1)}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                {/* Student attempts list */}
                <div className="border rounded-lg overflow-hidden">
                  <div
                    className="p-4 bg-base-200 flex justify-between items-center cursor-pointer"
                    onClick={() => setShowStudentsList(!showStudentsList)}
                  >
                    <h3 className="font-medium">Intentos de estudiantes</h3>
                    {showStudentsList ? (
                      <ChevronUp className="size-5" />
                    ) : (
                      <ChevronDown className="size-5" />
                    )}
                  </div>

                  {showStudentsList && (
                    <div className="p-4">
                      {quizStatistics.attempts.length === 0 ? (
                        <p className="text-center py-4 text-base-content/70">
                          Aún no hay intentos registrados
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="table table-sm w-full">
                            <thead>
                              <tr>
                                <th>Estudiante</th>
                                <th>Puntuación</th>
                                <th>Estado</th>
                                <th>Tiempo</th>
                                <th>Fecha</th>
                              </tr>
                            </thead>
                            <tbody>
                              {quizStatistics.attempts.map((attempt) => (
                                <tr key={attempt.id}>
                                  <td className="flex items-center gap-2">
                                    <img
                                      src={
                                        attempt.user.profilePic || "/avatar.png"
                                      }
                                      alt=""
                                      className="size-6 rounded-full object-cover"
                                    />
                                    <span>{attempt.user.fullName}</span>
                                  </td>
                                  <td>{attempt.score?.toFixed(1)}%</td>
                                  <td>
                                    {attempt.status === "completed" ? (
                                      <span
                                        className={`badge ${
                                          attempt.passed
                                            ? "badge-success"
                                            : "badge-error"
                                        }`}
                                      >
                                        {attempt.passed
                                          ? "Aprobado"
                                          : "No aprobado"}
                                      </span>
                                    ) : (
                                      <span className="badge badge-warning">
                                        {attempt.status}
                                      </span>
                                    )}
                                  </td>
                                  <td>{formatTime(attempt.timeSpent || 0)}</td>
                                  <td>{formatDate(attempt.completedAt)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Return button */}
            <div className="flex justify-center mt-8">
              <Link to="/quizzes" className="btn btn-outline">
                Volver a cuestionarios
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResultsPage;
