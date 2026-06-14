import { useAuth } from "../context/AuthContext";

export default function PendingProfile() {
  const { authError, logout } = useAuth();

  return (
    <section className="container mt-5">
      <div className="card auth-card">
        <div className="card-body">
          <h1 className="fw-bold">Cuenta pendiente</h1>
          <p className="lead">Tu cuenta aun no fue asignada por un administrador.</p>
          <p className="text-muted">
            Ya iniciaste sesion con Firebase, pero todavia no existe un perfil local habilitado en el sistema.
          </p>
          {authError && <div className="alert alert-warning">{authError}</div>}
          <button type="button" className="btn btn-outline-danger" onClick={logout}>
            Cerrar sesion
          </button>
        </div>
      </div>
    </section>
  );
}

