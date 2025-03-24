import { useState } from "react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../lib/axios.js"; // Use your configured axios instance

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axiosInstance.post("/auth/forgot-password", {
        email,
      });
      setMessage(
        response.data.message ||
          "Si el correo existe, recibirás un enlace para restablecer tu contraseña."
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Ocurrió un error. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12">
      <div className="w-full max-w-md p-8 space-y-6  rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center ">
          Recuperar Contraseña
        </h2>

        {message && (
          <div className="p-4 rounded-md  border-l-4 border-green-500">
            {message}
          </div>
        )}

        {error && (
          <div className="p-4 rounded-md  border-l-4 border-red-500 ">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4  font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
              loading ? " cursor-not-allowed" : " hover:bg-blue-700"
            }`}
          >
            {loading ? "Enviando..." : "Enviar Enlace de Recuperación"}
          </button>
        </form>

        <div className="text-center">
          <Link
            to="/login"
            className="text-sm font-medium  hover:text-blue-800"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
