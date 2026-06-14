import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import imgLogin from "../assets/img-log.jpeg";
import imgLogo from "../assets/logoRed.png";

function getFirebaseLoginMessage(error) {
  if (error?.code === "auth/popup-closed-by-user") {
    return "Se canceló el inicio de sesión. Intenta nuevamente.";
  }

  if (error?.code === "auth/network-request-failed") {
    return "Error de red. Verifica tu conexión e intenta otra vez.";
  }

  if (error?.code === "auth/operation-not-allowed") {
    return "Google Sign-In no está habilitado en Firebase Auth. Habilítalo en la consola de Firebase.";
  }

  return error?.message || "No se pudo iniciar sesión.";
}

const Login = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, profileStatus, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  if (user && profileStatus === "ready") {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      await login();
      navigate(from, { replace: true });
    } catch (loginError) {
      setError(getFirebaseLoginMessage(loginError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid vh-100 p-0">
      <div className="row g-0 h-100">

        {/* LADO IZQUIERDO */}
        <div
          className="d-none d-lg-flex col-lg-7 login-image"
          style={{
            backgroundImage: `url(${imgLogin})`
          }}
        >
          <div className="login-overlay">
            <div className="login-image-content">

              <h1 className="display-4 fw-bold text-white">
                GERENCIAR SRL
              </h1>

              <p className="lead text-white">
                Gestión de equipos de trabajo
              </p>
            </div>
          </div>
        </div>

        {/* LADO DERECHO */}
        <div className="col-12 col-lg-5 login-panel">
          <div className="login-wrapper">
            <div className="login-card">
              <div className="text-center mb-4">
                <img
                  src={imgLogo}
                  alt="Logo"
                  className="mb-3"
                  style={{ width: "70px" }}
                />

                <h2 className="fw-bold">
                  Iniciar sesión
                </h2>

                <p className="text-muted">
                  Accede con tu cuenta de Google.
                </p>

              </div>

              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              <button
                type="button"
                className="btn btn-gerenciar-primary w-100 py-3"
                onClick={handleLogin}
                disabled={loading}
              >
                <i className="bi bi-google me-2"></i>

                {loading
                  ? "Ingresando..."
                  : "Ingresar con Google"}
              </button>
              <div className="text-center mt-4">
                <small className="text-muted">
                  © {new Date().getFullYear()} ·Gerenciar SRL·
                </small>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Login;
