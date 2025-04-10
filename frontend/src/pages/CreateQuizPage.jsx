/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuizStore } from "../store/useQuizStore";
import { useChatStore } from "../store/useChatStore";
import {
  Loader,
  Plus,
  Minus,
  Clock,
  Trash,
  ArrowLeft,
  Save,
} from "lucide-react";
import toast from "react-hot-toast";

const CreateQuizPage = () => {
  const navigate = useNavigate();
  const { createQuiz, isLoading } = useQuizStore();
  const { users, getUsers } = useChatStore();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    timeLimit: 30,
    assignedTo: [],
    isPublic: false,
    passScore: 60,
    shuffleQuestions: false,
    questions: [],
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    text: "",
    type: "multiple-choice",
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
    correctAnswer: "",
    points: 1,
  });

  useEffect(() => {
    // Fetch users that can be assigned to quizzes
    getUsers();
  }, [getUsers]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      return toast.error("El título es obligatorio");
    }

    // Filter out questions that are explicitly marked as not included
    const includedQuestions = formData.questions.filter(
      (q) => q.included !== false
    );

    if (includedQuestions.length === 0) {
      return toast.error("Debes incluir al menos una pregunta");
    }

    try {
      // Create a new object with only included questions
      const quizToSubmit = {
        ...formData,
        questions: includedQuestions,
      };

      const newQuiz = await createQuiz(quizToSubmit);
      if (newQuiz) {
        navigate(`/quizzes/${newQuiz._id}`);
      }
    } catch (error) {
      console.error("Error al crear cuestionario:", error);
    }
  };

  const handleAddQuestion = () => {
    // Validar pregunta actual
    if (!currentQuestion.text.trim()) {
      return toast.error("La pregunta no puede estar vacía");
    }

    if (
      currentQuestion.type === "multiple-choice" ||
      currentQuestion.type === "true-false"
    ) {
      const hasCorrectOption = currentQuestion.options.some(
        (opt) => opt.isCorrect
      );
      if (!hasCorrectOption) {
        return toast.error("Debes marcar al menos una opción correcta");
      }

      const emptyOptions = currentQuestion.options.some(
        (opt) => !opt.text.trim()
      );
      if (emptyOptions) {
        return toast.error("Todas las opciones deben tener texto");
      }
    }

    if (
      currentQuestion.type === "short-answer" &&
      !currentQuestion.correctAnswer.trim()
    ) {
      return toast.error("Debes proporcionar una respuesta correcta");
    }

    // Añadir pregunta al formulario
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion, included: true }],
    }));

    // Resetear formulario de pregunta actual
    setCurrentQuestion({
      text: "",
      type: "multiple-choice",
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
      correctAnswer: "",
      points: 1,
    });
  };

  const handleRemoveQuestion = (index) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const toggleQuestionInclusion = (index) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, included: !q.included } : q
      ),
    }));
  };

  const handleOptionChange = (index, value) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) =>
        i === index ? { ...opt, text: value } : opt
      ),
    }));
  };

  const handleCorrectOptionChange = (index) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => ({
        ...opt,
        isCorrect: i === index ? !opt.isCorrect : opt.isCorrect,
      })),
    }));
  };

  const addOption = () => {
    if (currentQuestion.options.length >= 10) {
      return toast.error("Máximo 10 opciones por pregunta");
    }

    setCurrentQuestion((prev) => ({
      ...prev,
      options: [...prev.options, { text: "", isCorrect: false }],
    }));
  };

  const removeOption = (index) => {
    if (currentQuestion.options.length <= 2) {
      return toast.error("Mínimo 2 opciones requeridas");
    }

    setCurrentQuestion((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleUserSelection = (userId) => {
    setFormData((prev) => {
      const assignedTo = prev.assignedTo.includes(userId)
        ? prev.assignedTo.filter((id) => id !== userId)
        : [...prev.assignedTo, userId];

      return { ...prev, assignedTo };
    });
  };

  return (
    <div className="h-full pt-20 pb-10">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => navigate("/quizzes")}
            className="btn btn-circle btn-ghost btn-sm"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="text-2xl font-bold">Crear Cuestionario</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-base-100 rounded-lg border p-6 mb-8">
            <h2 className="text-lg font-medium mb-4">Información general</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Título</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Título del cuestionario"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Tiempo límite (minutos)
                  </span>
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    value={formData.timeLimit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        timeLimit: parseInt(e.target.value) || "",
                      })
                    }
                    placeholder="30"
                    min="0"
                  />
                  <span className="text-sm text-base-content/70 ml-2">
                    0 = Sin límite
                  </span>
                </div>
              </div>
            </div>

            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text font-medium">Descripción</span>
              </label>
              <textarea
                className="textarea textarea-bordered"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descripción del cuestionario"
                rows="3"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Puntuación para aprobar (%)
                  </span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
                  value={formData.passScore}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      passScore: parseInt(e.target.value) || 60,
                    })
                  }
                  placeholder="60"
                  min="0"
                  max="100"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Opciones</span>
                </label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={formData.shuffleQuestions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shuffleQuestions: e.target.checked,
                        })
                      }
                    />
                    <span>Mezclar preguntas</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) =>
                        setFormData({ ...formData, isPublic: e.target.checked })
                      }
                    />
                    <span>Cuestionario público</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="form-control mt-4">
              <label className="label">
                <span className="label-text font-medium">
                  Asignar a usuarios
                </span>
              </label>

              <div className="mb-3 flex items-center gap-2">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => {
                    // Clear assigned users when making quiz public
                    const isPublic = e.target.checked;
                    setFormData({
                      ...formData,
                      isPublic,
                      assignedTo: isPublic ? [] : formData.assignedTo,
                    });
                  }}
                />
                <span>Hacer cuestionario público (disponible para todos)</span>
              </div>

              {!formData.isPublic ? (
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
              ) : (
                <div className="bg-info/10 p-4 rounded-lg border border-info/30">
                  <p>
                    Este cuestionario será accesible para todos los usuarios. No
                    es necesario asignar usuarios específicos.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-base-100 rounded-lg border p-6 mb-8">
            <h2 className="text-lg font-medium mb-4">
              Preguntas añadidas ({formData.questions.length}) - Seleccionadas (
              {formData.questions.filter((q) => q.included !== false).length})
            </h2>

            {/* Add random question selection feature */}
            {formData.questions.length > 0 && (
              <div className="flex flex-wrap gap-3 items-center mb-4 p-3 bg-base-200 rounded-lg">
                <span className="text-sm font-medium">
                  Selección aleatoria:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    className="input input-bordered input-sm w-24"
                    placeholder="Cantidad"
                    min="1"
                    max={formData.questions.length}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      const validValue = Math.min(
                        Math.max(1, value || 1),
                        formData.questions.length
                      );
                      e.target.value = validValue;
                    }}
                    id="randomQuestionCount"
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      const count = parseInt(
                        document.getElementById("randomQuestionCount").value ||
                          "0"
                      );
                      if (count > 0 && count <= formData.questions.length) {
                        // Shuffle and select random questions
                        const questionIndices = Array.from(
                          { length: formData.questions.length },
                          (_, i) => i
                        );
                        for (let i = questionIndices.length - 1; i > 0; i--) {
                          const j = Math.floor(Math.random() * (i + 1));
                          [questionIndices[i], questionIndices[j]] = [
                            questionIndices[j],
                            questionIndices[i],
                          ];
                        }

                        // Select the first 'count' questions
                        const selectedIndices = new Set(
                          questionIndices.slice(0, count)
                        );

                        // Update formData to mark selected questions
                        setFormData((prev) => ({
                          ...prev,
                          questions: prev.questions.map((q, idx) => ({
                            ...q,
                            included: selectedIndices.has(idx),
                          })),
                        }));

                        toast.success(
                          `Se seleccionaron aleatoriamente ${count} preguntas`
                        );
                      } else {
                        toast.error(
                          "Por favor ingresa un número válido de preguntas"
                        );
                      }
                    }}
                  >
                    Seleccionar aleatoriamente
                  </button>
                </div>
                <span className="text-xs text-base-content/70">
                  Selecciona un número y haz clic para elegir preguntas
                  aleatorias
                </span>
              </div>
            )}

            {formData.questions.length === 0 ? (
              <div className="text-center py-8 bg-base-200 rounded-lg">
                <p>
                  No hay preguntas añadidas. Usa el formulario de abajo para
                  crear preguntas.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.questions.map((question, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 relative ${
                      question.included === false
                        ? "opacity-60 bg-base-200"
                        : ""
                    }`}
                  >
                    <div className="flex justify-between mb-2">
                      <button
                        type="button"
                        className={`btn btn-sm ${
                          question.included !== false
                            ? "btn-primary"
                            : "btn-outline"
                        }`}
                        onClick={() => toggleQuestionInclusion(index)}
                      >
                        {question.included !== false ? "Incluida" : "Excluida"}
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-circle"
                        onClick={() => handleRemoveQuestion(index)}
                      >
                        <Trash className="size-4" />
                      </button>
                    </div>

                    <h3 className="font-medium mb-2">
                      {index + 1}. {question.text}
                    </h3>

                    {/* Rest of your question display code */}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-base-100 rounded-lg border p-6 mb-8">
            <h2 className="text-lg font-medium mb-4">Añadir nueva pregunta</h2>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">
                  Texto de la pregunta
                </span>
              </label>
              <input
                type="text"
                className="input input-bordered"
                value={currentQuestion.text}
                onChange={(e) =>
                  setCurrentQuestion({
                    ...currentQuestion,
                    text: e.target.value,
                  })
                }
                placeholder="¿Cuál es la pregunta?"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Tipo de pregunta
                  </span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={currentQuestion.type}
                  onChange={(e) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      type: e.target.value,
                      // Resetear opciones si cambia el tipo
                      options:
                        e.target.value === "multiple-choice" ||
                        e.target.value === "true-false"
                          ? e.target.value === "true-false"
                            ? [
                                { text: "Verdadero", isCorrect: false },
                                { text: "Falso", isCorrect: false },
                              ]
                            : [
                                { text: "", isCorrect: false },
                                { text: "", isCorrect: false },
                              ]
                          : [],
                    })
                  }
                >
                  <option value="multiple-choice">Opción múltiple</option>
                  <option value="true-false">Verdadero/Falso</option>
                  <option value="short-answer">Respuesta corta</option>
                  <option value="long-answer">Respuesta larga</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Puntos</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
                  value={currentQuestion.points}
                  onChange={(e) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      points: parseInt(e.target.value) || 1,
                    })
                  }
                  placeholder="1"
                  min="1"
                />
              </div>
            </div>

            {(currentQuestion.type === "multiple-choice" ||
              currentQuestion.type === "true-false") && (
              <div className="mt-4">
                <label className="label">
                  <span className="label-text font-medium">Opciones</span>
                  {currentQuestion.type === "multiple-choice" && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={addOption}
                      >
                        <Plus className="size-4" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={() =>
                          removeOption(currentQuestion.options.length - 1)
                        }
                      >
                        <Minus className="size-4" />
                      </button>
                    </div>
                  )}
                </label>

                <div className="space-y-2">
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={option.isCorrect}
                        onChange={() => handleCorrectOptionChange(index)}
                      />
                      <input
                        type="text"
                        className="input input-bordered flex-1"
                        value={option.text}
                        onChange={(e) =>
                          handleOptionChange(index, e.target.value)
                        }
                        placeholder={`Opción ${index + 1}`}
                        disabled={currentQuestion.type === "true-false"}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentQuestion.type === "short-answer" && (
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text font-medium">
                    Respuesta correcta
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={currentQuestion.correctAnswer}
                  onChange={(e) =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      correctAnswer: e.target.value,
                    })
                  }
                  placeholder="Respuesta correcta"
                />
              </div>
            )}

            <div className="mt-4">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddQuestion}
              >
                <Plus className="size-4 mr-2" />
                Añadir Pregunta
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/quizzes")}
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
                <>
                  <Save className="size-4 mr-2" />
                  Guardar Cuestionario
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuizPage;
