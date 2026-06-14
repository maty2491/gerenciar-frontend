import { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { auth } from "../services/firebase.js";
import { getIdToken } from "firebase/auth";

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para el Modal de creación
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fechaEvento, setFechaEvento] = useState("");
  const [horaEvento, setHoraEvento] = useState("");
  const [type, setType] = useState("Reunión");
  const [sending, setSending] = useState(false);

  const calendarRef = useRef(null);

  // 1️⃣ Obtener todos los eventos (pasados y futuros) para el almanaque
  const fetchAllEvents = async () => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const token = await getIdToken(currentUser, true);

      // Enviamos ?all=true para que el backend salte el filtro de fecha de hoy
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/events?all=true`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const resData = await response.json();

      if (resData.success) {
        // Transformamos los datos de MongoDB al formato que exige FullCalendar
        const formatted = resData.data.map(event => ({
          id: event._id,
          title: `[${event.type}] ${event.title}`,
          start: `${event.fechaEvento}T${event.horaEvento}`, // Combina fecha y hora en formato ISO string
          extendedProps: {
            description: event.description,
            createdBy: event.createdBy,
            type: event.type
          },
          // Color dinámico según el tipo de evento
          backgroundColor: event.type === "Reunión" ? "#0d6efd" : event.type === "Capacitación" ? "#ffc107" : "#198754",
          borderColor: event.type === "Reunión" ? "#0d6efd" : event.type === "Capacitación" ? "#ffc107" : "#198754",
          textColor: event.type === "Capacitación" ? "#000" : "#fff"
        }));
        setEvents(formatted);
      }
    } catch (error) {
      console.error("Error cargando eventos en el almanaque:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllEvents();
  }, []);

  // 2️⃣ Al hacer clic en un día del calendario, se autocompleta la fecha y abre el modal
  const handleDateClick = (arg) => {
    setFechaEvento(arg.dateStr); // arg.dateStr viene en formato "YYYY-MM-DD"
    setHoraEvento("09:00"); // Ponemos una hora por defecto sutil
    setShowModal(true);
  };

  // 3️⃣ Guardar el evento en el Backend
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!title || !fechaEvento || !horaEvento) return alert("Completá los campos obligatorios.");

    try {
      setSending(true);
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const token = await getIdToken(currentUser, true);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, fechaEvento, horaEvento, type })
      });

      const resData = await response.json();

      if (resData.success) {
        // Reset form
        setTitle("");
        setDescription("");
        setShowModal(false);
        // Recargamos el calendario completo
        fetchAllEvents();
      } else {
        alert(resData.message || "Error al guardar evento.");
      }
    } catch (error) {
      console.error("Error al enviar evento:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="container py-4">

      <div className="card border-0 shadow-sm bg-white p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="fw-bold text-gerenciar mb-1">
              <i className="bi bi-calendar3 me-2"></i>
              Calendario Corporativo
            </h1>

            <p className="text-muted mb-0">
              Gestión de reuniones, capacitaciones y eventos internos.
            </p>

            <hr className="mt-3" />
          </div>
          {loading && (
            <div className="badge bg-light text-dark border">
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
              />
              Cargando
            </div>
          )}
        </div>

        {/* 📅 EL ALMANAQUE DE FULLCALENDAR */}
        <div className="bg-light rounded-3 p-3 border">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale="es" // Idioma español
            buttonText={{ today: "Hoy" }}
            events={events}
            dateClick={handleDateClick}
            headerToolbar={{
              left: window.innerWidth < 768 ? "prev,next" : "prev,next today",
              center: "title",
              right: ""
            }}
            height="auto"
            eventClick={(info) => {
              // Por ahora mostramos un alert simple con la descripción al hacer clic en un evento armado
              alert(`Evento: ${info.event.title}\nCreado por: ${info.event.extendedProps.createdBy}\nDescripción: ${info.event.extendedProps.description || "Sin descripción"}`);
            }}
          />
        </div>
      </div>

      {/* 📝 MODAL PARA AGENDAR DESDE EL ALMANAQUE */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold text-gerenciar">
                  <i className="bi bi-calendar-plus me-2"></i>
                  Nueva Actividad
                </h5>

                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateEvent}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-bold text-gerenciar small">Título de la Actividad *</label>
                    <input type="text" className="form-control" placeholder="Ej: Reunión, Entrevista, etc" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold text-gerenciar small">Descripción / Notas</label>
                    <textarea className="form-control" rows="2" placeholder="Detalles del evento..." value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                  </div>
                  <div className="row">
                    <div className="col-6 mb-3">
                      <label className="form-label fw-bold text-gerenciar small">Fecha</label>
                      <input type="date" className="form-control" value={fechaEvento} onChange={(e) => setFechaEvento(e.target.value)} required />
                    </div>
                    <div className="col-6 mb-3">
                      <label className="form-label fw-bold text-gerenciar small">Hora *</label>
                      <input type="time" className="form-control" value={horaEvento} onChange={(e) => setHoraEvento(e.target.value)} required />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold text-gerenciar small">Tipo de Evento</label>
                    <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                      <option value="Reunión">
                        Reunión
                      </option>

                      <option value="Capacitación">
                        Capacitación
                      </option>

                      <option value="Corporativo">
                        Evento Corporativo
                      </option>
                      <option value="Entrevista">
                        Entrevista
                      </option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button
                    type="button"
                    className="btn btn-gerenciar-outline"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="btn btn-gerenciar-primary"
                    disabled={sending}
                  >
                    {sending ? "Guardando..." : "Agendar Actividad"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Calendar;
