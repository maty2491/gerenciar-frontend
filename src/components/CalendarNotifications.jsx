import { useState, useEffect } from "react";
import { auth } from "../services/firebase.js";
import { getIdToken } from "firebase/auth";

const CalendarNotifications = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        const token = await getIdToken(currentUser, true);

        // GET simple: el backend filtra y solo nos da los eventos vigentes
        const response = await fetch("http://localhost:3000/api/events", {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` }
        });
        const resData = await response.json();
        
        if (resData.success) {
          setEvents(resData.data);
        }
      } catch (error) {
        console.error("Error cargando eventos en el dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Formateador visual de fecha (ej: "2026-06-15" -> "15" y "Jun")
  const formatEventDate = (dateStr) => {
    if (!dateStr) return { day: "--", month: "---" };
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const [year, month, day] = dateStr.split("-");
    const monthIndex = parseInt(month, 10) - 1;
    return {
      day: day,
      month: meses[monthIndex] || "S/E"
    };
  };

  return (
    <div className="card border-0 shadow-sm bg-white p-4 h-100">
      <div className="d-flex align-items-center mb-3">
        <div className="bg-secundario bg-opacity-10 text-gerenciar p-2 rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
          <i className="bi bi-calendar-event fs-5"></i>
        </div>
        <div>
          <h5 className="mb-0 fw-bold text-gerenciar">Eventos de la Empresa</h5>
          <small className="text-muted">Próximas actividades en agenda</small>
        </div>
      </div>

      <hr className="text-muted opacity-25 mt-2 mb-3" />

      {loading ? (
        <div className="text-center py-3">
          <div className="spinner-border text-warning spinner-border-sm"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-4 text-muted bg-light rounded">
           No hay eventos corporativos programados.
        </div>
      ) : (
        <div className="d-flex flex-column gap-3" style={{ maxHeight: "380px", overflowY: "auto" }}>
          {events.map((event) => {
            const { day, month } = formatEventDate(event.fechaEvento);
            return (
              <div key={event._id} className="p-3 rounded bg-light border-start border-4 border-warning d-flex justify-content-between align-items-center">
                <div>
                  <span className="badge bg-warning text-dark mb-1" style={{ fontSize: "0.65rem" }}>
                    {event.type?.toUpperCase()}
                  </span>
                  <h6 className="mb-0 fw-bold text-dark" style={{ fontSize: "0.9rem" }}>{event.title}</h6>
                  <small className="text-muted">
                    <i className="bi bi-clock me-1"></i>{event.horaEvento} Hs | <i className="bi bi-person me-1"></i>{event.createdBy}
                  </small>
                </div>
                <div className="text-center bg-white shadow-sm rounded px-2 py-1" style={{ minWidth: "55px" }}>
                  <span className="d-block fw-bold text-gerenciar lh-1 mb-0 fs-5">{day}</span>
                  <span className="text-muted text-uppercase" style={{ fontSize: "0.65rem" }}>{month}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CalendarNotifications;