import { useAuth } from "../context/AuthContext";

const Welcome = () => {
  const { user } = useAuth();
  const name = user?.name ? `${user.name.charAt(0).toUpperCase()}${user.name.slice(1)}` : "Usuario";

  return (
    <section className="container mt-5">
      <div className="card auth-card">
        <div className="card-body">
          <h1 className="fw-bold">Hola, {name}</h1>
          <p className="lead">Que deseas hacer el dia de hoy?</p>
          <p className="mt-3 text-muted">Bienvenido al panel de administracion.</p>
        </div>
      </div>
    </section>
  );
};

export default Welcome;
