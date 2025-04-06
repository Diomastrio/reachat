import { useRouteError, Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

const ErrorPage = () => {
  const error = useRouteError();

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="max-w-md w-full bg-base-100 p-8 rounded-lg shadow-lg text-center">
        <AlertTriangle className="mx-auto size-16 text-error mb-4" />

        <h1 className="text-3xl font-bold mb-4">¡Ups! Ocurrió un error</h1>

        <div className="bg-base-200 p-4 rounded-md mb-6 text-left">
          <p className="font-mono text-sm">
            {error?.statusText || error?.message || "Algo salió mal"}
          </p>
          {error?.status && (
            <p className="font-mono text-sm mt-2">
              Código de estado: {error.status}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <p>Lo sentimos, ha ocurrido un error inesperado.</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => window.location.reload()}
              className="btn btn-outline"
            >
              Reintentar
            </button>
            <Link to="/" className="btn btn-primary">
              Ir al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
