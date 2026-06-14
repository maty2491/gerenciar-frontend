import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PendingProfile from "../pages/PendingProfile";

export default function ProtectedRoute({ children }) {
  const { authError, loading, profileStatus, user } = useAuth();
  const location = useLocation();

  if (loading || profileStatus === "loading") {
    return (
      <section className="container mt-5">
        <div className="alert alert-info">Cargando sesion...</div>
      </section>
    );
  }

  if (profileStatus === "config-error") {
    return (
      <section className="container mt-5">
        <div className="alert alert-danger">{authError || "Firebase no esta configurado."}</div>
      </section>
    );
  }

  if (profileStatus === "pending-profile") {
    return <PendingProfile />;
  }

  if (profileStatus === "denied") {
    return (
      <section className="container mt-5">
        <div className="alert alert-warning">{authError || "Acceso denegado."}</div>
      </section>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
