import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);

  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await axiosInstance.get(`/auth/reset-password/${token}/verify`);
        setValidToken(true);
      } catch (err) {
        setError("El enlace es inválido o ha expirado");
        console.error("Token verification error:", err);
        setValidToken(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError("Las contraseñas no coinciden");
    }

    setLoading(true);
    setError("");

    try {
      await axiosInstance.post(`/auth/reset-password/${token}`, {
        password,
      });
      setMessage("Tu contraseña ha sido actualizada correctamente");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Ocurrió un error al restablecer la contraseña"
      );
    } finally {
      setLoading(false);
    }
  };

  if (error && !validToken) {
    return (
      <div className="flex items-center justify-center min-h-screen  px-4 py-12">
        <div className="w-full max-w-md p-8 space-y-6  rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-center ">
            Error de Restablecimiento
          </h2>
          <div className="p-4 rounded-md  border-l-4 border-red-500 ">
            {error}
          </div>
          <div className="text-center">
            <Link
              to="/forgot-password"
              className="text-sm font-medium  hover:text-blue-800"
            >
              Solicitar un nuevo enlace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-12">
      <div className="w-full max-w-md p-8 space-y-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center ">
          Crear Nueva Contraseña
        </h2>

        {message && (
          <div className="p-4 rounded-md  border-l-4 border-green-500 ">
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
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
            >
              Nueva Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium mb-1"
            >
              Confirmar Contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="6"
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
            {loading ? "Actualizando..." : "Actualizar Contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
