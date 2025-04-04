/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuizStore } from "../store/useQuizStore";
import { useAuthStore } from "../store/useAuthStore";
import {
  ArrowLeft,
  Clock,
  Loader,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

const TakeQuizPage = () => {
  const { id: quizId } = useParams();
  const navigate = useNavigate();
  const {
    currentQuiz,
    getQuizById,
    startQuizAttempt,
    submitQuizAttempt,
    isLoading,
  } = useQuizStore();
  const { authUser } = useAuthStore();

  const [attemptData, setAttemptData] = useState(null);
  const [currentAnswers, setCurrentAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        await getQuizById(quizId);
      } catch (error) {
        toast.error("Error al cargar el cuestionario");
        navigate("/quizzes");
      }
    };

    loadQuiz();
  }, [quizId, getQuizById, navigate]);

  useEffect(() => {
    const startQuiz = async () => {
      if (!currentQuiz) return;

      try {
        const data = await startQuizAttempt(quizId);
        setAttemptData(data);

        if (data.timeLimit) {
          setTimeLeft(data.timeLimit * 60);
        }

        // Initialize answers object
        const initialAnswers = {};
        data.questions.forEach((question) => {
          initialAnswers[question._id] =
            question.type === "multiple-choice" ||
            question.type === "true-false"
              ? { selectedOptions: [] }
              : { textAnswer: "" };
        });

        setCurrentAnswers(initialAnswers);
      } catch (error) {
        toast.error("Error al iniciar el cuestionario");
        navigate(`/quizzes/${quizId}`);
      }
    };

    if (currentQuiz && !attemptData) {
      startQuiz();
    }
  }, [currentQuiz, attemptData, quizId, startQuizAttempt, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft]);

  const handleOptionSelect = (questionId, optionId) => {
    setCurrentAnswers((prev) => {
      const question = attemptData.questions.find((q) => q._id === questionId);
      let selectedOptions = [...(prev[questionId]?.selectedOptions || [])];

      if (question.type === "true-false") {
        // For true-false, only one option can be selected
        selectedOptions = [optionId];
      } else {
        // For multiple choice, toggle selection
        const optionIndex = selectedOptions.indexOf(optionId);
        if (optionIndex === -1) {
          selectedOptions.push(optionId);
        } else {
          selectedOptions.splice(optionIndex, 1);
        }
      }

      return {
        ...prev,
        [questionId]: { selectedOptions },
      };
    });
  };

  const handleTextAnswer = (questionId, text) => {
    setCurrentAnswers((prev) => ({
      ...prev,
      [questionId]: { textAnswer: text },
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Format answers for submission
      const formattedAnswers = Object.entries(currentAnswers).map(
        ([questionId, answer]) => ({
          questionId,
          selectedOptions: answer.selectedOptions || [],
          textAnswer: answer.textAnswer || "",
        })
      );

      // Submit answers
      const result = await submitQuizAttempt(
        attemptData.attemptId,
        formattedAnswers
      );

      // Clear timer if it's running
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Navigate to results page
      navigate(`/quizzes/${quizId}/results`, {
        state: {
          result,
          attemptId: attemptData.attemptId,
        },
      });
    } catch (error) {
      toast.error("Error al enviar respuestas");
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  if (isLoading || !currentQuiz || !attemptData) {
    return (
      <div className="h-screen pt-20 flex items-center justify-center">
        <Loader className="size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen pt-20 pb-10">
      <div className="max-w-3xl mx-auto p-4">
        {/* Quiz header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to={`/quizzes/${quizId}`}
            className="flex items-center gap-2 text-sm"
            onClick={(e) => {
              if (
                !window.confirm(
                  "¿Seguro que deseas salir? Tu progreso se perderá."
                )
              ) {
                e.preventDefault();
              }
            }}
          >
            <ArrowLeft className="size-4" />
            Cancelar cuestionario
          </Link>

          {timeLeft !== null && (
            <div className="flex items-center gap-2">
              <Clock
                className={`size-4 ${
                  timeLeft < 60 ? "text-error animate-pulse" : ""
                }`}
              />
              <span
                className={`font-mono ${
                  timeLeft < 60 ? "text-error font-bold" : ""
                }`}
              >
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
        </div>

        <div className="bg-base-100 rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-base-300">
            <h1 className="text-2xl font-bold">{currentQuiz.title}</h1>
            <p className="mt-2 text-sm text-base-content/70">
              Responde a todas las preguntas y haz clic en
              &ldquo;Finalizar&quot; cuando hayas terminado.
            </p>
          </div>

          <div className="p-6">
            {attemptData.questions.map((question, index) => (
              <div
                key={question._id}
                className="mb-8 pb-8 border-b border-base-200 last:border-0 last:pb-0 last:mb-0"
              >
                <div className="flex items-start gap-2">
                  <span className="bg-base-300 size-6 flex items-center justify-center rounded-full text-sm font-medium">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium mb-3">
                      {question.text}
                    </h3>

                    {/* Multiple choice or true/false options */}
                    {(question.type === "multiple-choice" ||
                      question.type === "true-false") && (
                      <div className="space-y-2">
                        {question.options.map((option) => (
                          <label
                            key={option._id}
                            className={`
                              flex items-center gap-3 p-3 rounded-lg cursor-pointer border
                              ${
                                currentAnswers[
                                  question._id
                                ]?.selectedOptions?.includes(option._id)
                                  ? "border-primary bg-primary/10"
                                  : "border-base-300 hover:bg-base-200"
                              }
                            `}
                          >
                            <input
                              type={
                                question.type === "true-false"
                                  ? "radio"
                                  : "checkbox"
                              }
                              className={
                                question.type === "true-false"
                                  ? "radio"
                                  : "checkbox"
                              }
                              checked={currentAnswers[
                                question._id
                              ]?.selectedOptions?.includes(option._id)}
                              onChange={() =>
                                handleOptionSelect(question._id, option._id)
                              }
                            />
                            <span>{option.text}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Short answer */}
                    {question.type === "short-answer" && (
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        placeholder="Tu respuesta..."
                        value={currentAnswers[question._id]?.textAnswer || ""}
                        onChange={(e) =>
                          handleTextAnswer(question._id, e.target.value)
                        }
                      />
                    )}

                    {/* Long answer */}
                    {question.type === "long-answer" && (
                      <textarea
                        className="textarea textarea-bordered w-full h-32"
                        placeholder="Tu respuesta..."
                        value={currentAnswers[question._id]?.textAnswer || ""}
                        onChange={(e) =>
                          handleTextAnswer(question._id, e.target.value)
                        }
                      />
                    )}

                    <div className="text-right mt-2 text-sm">
                      <span className="text-base-content/70">
                        {question.points} punto
                        {question.points !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-end mt-6">
              <button
                onClick={handleSubmit}
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="size-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Finalizar y enviar"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeQuizPage;
