import { useEffect, useState } from "react";
import { useQuizStore } from "../store/useQuizStore";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Clock,
  Loader,
  PlusCircle,
  CheckCircle,
  BookOpenCheck,
  Calendar,
} from "lucide-react";
import { formatDate } from "../lib/utils";

const QuizzesPage = () => {
  const {
    quizzes,
    getQuizzes,
    isLoading,
    subscribeToQuizEvents,
    unsubscribeFromQuizEvents,
  } = useQuizStore();
  const { authUser } = useAuthStore();
  const [filter, setFilter] = useState("all"); // "all", "created", "assigned", "completed"

  useEffect(() => {
    getQuizzes();
    subscribeToQuizEvents();

    return () => unsubscribeFromQuizEvents();
  }, [getQuizzes, subscribeToQuizEvents, unsubscribeFromQuizEvents]);

  const filteredQuizzes = quizzes.filter((quiz) => {
    const isCreator = quiz.creatorId._id === authUser._id;
    const isAssignedToMe = quiz.assignedTo?.some(
      (user) => user._id === authUser._id
    );

    switch (filter) {
      case "created":
        return isCreator;
      case "assigned":
        return isAssignedToMe;
      default:
        return true;
    }
  });

  return (
    <div className="h-screen pt-20">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Cuestionarios</h1>
          <Link to="/quizzes/create" className="btn btn-primary btn-sm">
            <PlusCircle className="size-4 mr-2" />
            Crear Cuestionario
          </Link>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            className={`btn btn-sm ${
              filter === "all" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setFilter("all")}
          >
            Todos
          </button>
          <button
            className={`btn btn-sm ${
              filter === "created" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setFilter("created")}
          >
            Creados por mí
          </button>
          <button
            className={`btn btn-sm ${
              filter === "assigned" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setFilter("assigned")}
          >
            Asignados a mí
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="size-8 animate-spin" />
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="text-center py-12 bg-base-200 rounded-lg">
            <BookOpen className="size-12 mx-auto mb-4 text-base-content/50" />
            <h3 className="text-lg font-medium mb-2">
              No se encontraron cuestionarios
            </h3>
            <p className="text-base-content/60">
              {filter === "all"
                ? "Aún no hay cuestionarios."
                : `No hay cuestionarios que coincidan con el filtro "${filter}".`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQuizzes.map((quiz) => {
              const isCreator = quiz.creatorId._id === authUser._id;

              return (
                <Link
                  key={quiz._id}
                  to={`/quizzes/${quiz._id}`}
                  className="card bg-base-100 hover:shadow-md transition-shadow border"
                >
                  <div className="card-body">
                    <div className="flex justify-between items-start">
                      <h2 className="card-title text-base break-words">
                        {quiz.title}
                      </h2>
                      {isCreator ? (
                        <span className="badge badge-primary">
                          Tu cuestionario
                        </span>
                      ) : (
                        <span className="badge badge-info">Asignado</span>
                      )}
                    </div>

                    <p className="text-sm line-clamp-2 mb-2">
                      {quiz.description || "Sin descripción"}
                    </p>

                    <div className="flex flex-wrap gap-1 text-xs">
                      <div className="flex items-center gap-1 text-base-content/70">
                        <BookOpenCheck className="size-3" />
                        <span>Preguntas: {quiz.questions.length}</span>
                      </div>

                      {quiz.timeLimit && (
                        <div className="flex items-center gap-1 text-base-content/70">
                          <Clock className="size-3" />
                          <span>Tiempo: {quiz.timeLimit} min</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-base-content/70">
                        <CheckCircle className="size-3" />
                        <span>Mínimo para aprobar: {quiz.passScore}%</span>
                      </div>

                      <div className="flex items-center gap-1 text-base-content/70">
                        <Calendar className="size-3 flex-shrink-0" />
                        <span className="truncate">
                          Fecha: {formatDate(quiz.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizzesPage;
