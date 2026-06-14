import { useAuth } from "../context/AuthContext";
import DashboardNews from "../components/DashboardNews"; // Asegurá la ruta correcta
import CalendarNotifications from "../components/CalendarNotifications"; // El que creamos abajo

const Dashboard = () => {
  const { user } = useAuth();
  const name = user?.name ? `${user.name.charAt(0).toUpperCase()}${user.name.slice(1)}` : "Usuario";

  return (
    <section className="container py-4">
      {/* TARJETA DE BIENVENIDA E INFO DE CUENTA */}
      <div className="card border-0 shadow-sm mb-4 bg-white">
        <div className="card-body p-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              <h1 className="fw-bold text-gerenciar mb-1 fs-2">
                Bienvenido, {name}
              </h1>
              <p className="text-muted mb-0">
                Este es tu panel de control de Gerenciar. Acá encontrarás la actividad del día.
              </p>
              <div className="d-flex gap-3 mt-3 text-secondary small">
                <span><strong className="text-dark">Rol:</strong> {user?.role || "No asignado"}</span>
                <span className="text-muted">|</span>
                <span><strong className="text-dark">Sector:</strong> {user?.sector || "No asignado"}</span>
              </div>
            </div>
            <div className="col-md-4 text-md-end mt-3 mt-md-0">
              <span className="badge bg-primario fs-6 px-3 py-2 shadow-sm">
                <i className="bi bi-circle-fill text-success me-2 small"></i>Usuario activo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DINÁMICA: NOVEDADES Y CALENDARIO */}
      <div className="row">
        {/* Columna Izquierda: Entrevistas Recientes (60% de ancho en pantallas grandes) */}
        <div className="col-12 col-lg-7 mb-4">
          <DashboardNews />
        </div>

        {/* Columna Derecha: Avisos del Calendario (40% de ancho en pantallas grandes) */}
        <div className="col-12 col-lg-5 mb-4">
          <CalendarNotifications />
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
