import { useState, useEffect } from "react";
import { auth } from "../services/firebase.js";
import { getIdToken } from "firebase/auth";

const DashboardNews = () => {
  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcoming = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        const token = await getIdToken(currentUser, true);

        const response = await fetch("http://localhost:3000/api/interviews", {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` }
        });
        const resData = await response.json();
        const data = resData.success ? resData.data : resData;

        // Filtramos para mostrar los candidatos que están agendados o pendientes
        const news = data.filter(c => 
          !c.resultado || 
          c.resultado === "Agendado" || 
          c.resultado.includes("Pendiente") || 
          c.resultado.includes("Avanza")
        );

        // Mostramos solo los 5 más recientes en el tablero
        setUpcomingInterviews(news.slice(0, 5));
      } catch (error) {
        console.error("Error cargando novedades:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcoming();
  }, []);

  return (
    <div className="card border-0 shadow-sm bg-white p-4 h-100">
      <div className="d-flex align-items-center mb-3">
        <div className="bg-secundario bg-opacity-10 text-gerenciar p-2 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
          <i className="bi bi-bell-fill fs-5"></i>
        </div>
        <div>
          <h5 className="mb-0 fw-bold text-gerenciar">Novedades del Panel</h5>
          <small className="text-muted">Próximas entrevistas agendadas</small>
        </div>
      </div>

      <hr className="text-muted opacity-25 mt-2 mb-3" />

      {loading ? (
        <div className="text-center py-3">
          <div className="spinner-border text-primary spinner-border-sm"></div>
        </div>
      ) : upcomingInterviews.length === 0 ? (
        <div className="text-center py-4 text-muted bg-light rounded">
          No hay entrevistas pendientes para mostrar hoy.
        </div>
      ) : (
        <div className="list-group list-group-flush">
          {upcomingInterviews.map((item) => (
            <div key={item._id} className="list-group-item px-0 py-3 bg-transparent border-0 d-flex justify-content-between align-items-start" style={{ borderBottom: "1px dashed rgba(0, 0, 0, 0.08)" }}>
              <div className="d-flex gap-3">
                <div className="bg-light p-2 rounded text-center d-flex flex-column justify-content-center" style={{ minWidth: "50px", height: "50px" }}>
                  <i className="bi bi-person-badge text-secondary fs-4"></i>
                </div>
                <div>
                  <h6 className="mb-1 fw-bold text-dark">{item.candidateName}</h6>
                  <p className="mb-0 text-muted small">
                    <span className="badge bg-secondary-subtle text-secondary me-2">{item.puesto}</span>
                    <i className="bi bi-person me-1"></i> {item.entrevistador || "Sin asignar"}
                  </p>
                </div>
              </div>
              <div className="text-end">
                <span className="badge bg-primary-subtle text-primary mb-1 d-block small">
                  <i className="bi bi-calendar-event me-1"></i> {item.fechaEntrevista || "Fecha s/e"}
                </span>
                <small className="text-muted d-block" style={{ fontSize: "0.75rem" }}>
                  {item.resultado || "Agendado"}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardNews; // 👈 Esto es lo que le faltaba al archivo para que Dashboard.jsx no tire error