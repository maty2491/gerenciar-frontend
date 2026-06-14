import { useState, useEffect } from "react";
import FormInterviews from "../pages/FormInterviews";
import CandidatesHistory from "./CandidatesHistory";
import { auth } from "../services/firebase.js";
import { getIdToken } from "firebase/auth";

const Interviews = () => {
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [scheduledInterviews, setScheduledInterviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [selectedInterview, setSelectedInterview] = useState(null);

  // Estado auxiliar para cuando queramos editar a alguien desde el Historial
  const [interviewToEdit, setInterviewToEdit] = useState(null);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const token = await getIdToken(currentUser, true);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/interviews`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const resData = await response.json();

      if (resData.success) {
        setScheduledInterviews(resData.data);
      } else if (Array.isArray(resData)) {
        setScheduledInterviews(resData);
      }
    } catch (error) {
      console.error("🚨 Error al traer entrevistas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  // FUNCIÓN GENÉRICA PARA ACTUALIZAR ESTADOS (Completar / Archivar)
  const handleUpdateStatus = async (id, nuevoEstado, mensajeAlerta) => {
    try {
      const currentUser = auth.currentUser;
      const token = await getIdToken(currentUser, true);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/interviews/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ resultado: nuevoEstado })
      });

      if (response.ok) {
        alert(mensajeAlerta);
        fetchInterviews();
      }
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  const handleBackToMenu = () => {
    setShowForm(false);
    setShowHistory(false);
    setInterviewToEdit(null);
    setFilterName("");
    fetchInterviews();
  };

  // Función puente para cuando el Historial pida editar un registro
  const handleTriggerEditFromHistory = (candidate) => {
    setInterviewToEdit(candidate);
    setShowHistory(false);
    setShowForm(true);
  };
  // FILTRADO 

  const filteredInterviews = scheduledInterviews
    .filter((interview) => {
      if (!interview.fechaEntrevista) return false;

      // 1. Control de Fecha Futura
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fechaCita = new Date(interview.fechaEntrevista + "T00:00:00");
      const esProxima = fechaCita >= hoy;

      // 2. Filtro rápido por nombre
      const matchesName = interview.candidateName
        ? interview.candidateName.toLowerCase().includes(filterName.toLowerCase())
        : true;

      // 3. SI YA FUE EVALUADO O CANCELADO, NO VA EN AGENDA ACTIVA
      const estaActivo = interview.resultado !== "Evaluado" && interview.resultado !== "Cancelado / Archivado";

      return esProxima && matchesName && estaActivo;
    })
    .sort((a, b) => new Date(a.fechaEntrevista) - new Date(b.fechaEntreversible));

  if (showForm) {
    return (
      <div className="container-fluid p-4">
        <div className="d-flex align-items-center mb-4">
          <button className="btn btn-gerenciar-secondary btn-sm me-3" onClick={handleBackToMenu}>
            <i className="bi bi-arrow-left"></i> Volver al Menú
          </button>
          <h3 className="mb-0 text-dark fw-bold">
            {interviewToEdit ? `Modificar Expediente: ${interviewToEdit.candidateName}` : "Nueva Evaluación de Candidato"}
          </h3>
        </div>
        <FormInterviews interviewData={interviewToEdit} onSaveSuccess={handleBackToMenu} />
      </div>
    );
  }

  if (showHistory) {
    return (
      <div className="container-fluid p-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div>
            <h2 className="text-gerenciar fw-bold mb-1">
              Historial General de Candidatos
            </h2>
            <p className="text-soft mb-0">
              Registro completo de entrevistas y evaluaciones.
            </p>
          </div>

          <button
            className="btn btn-gerenciar-secondary mt-3 mt-md-0"
            onClick={handleBackToMenu}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Volver
          </button>
        </div>
        <CandidatesHistory onRefreshNeeded={fetchInterviews} />
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h3 className="text-gerenciar fw-bold mb-1">Gestión de Entrevistas Próximas</h3>
          <p className="text-soft mb-0">Panel operativo diario basado en fechas de agenda.</p>
        </div>
        <div>
          <button
            className="btn btn-gerenciar-outline d-flex align-items-center gap-2"
            onClick={() => setShowHistory(true)}
          >
            <i className="bi bi-folder-symlink"></i>
            Ver Historial Completo
          </button>
        </div>
      </div>

      {/* FILTRO NOMBRE */}
      <div className="card border-0 shadow-sm p-3 mb-4 bg-white">
        <div className="row">
          <div className="col-12 col-md-4">
            <label className="form-label small fw-bold text-secondary">Filtrar Agenda por Nombre</label>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0 text-muted"><i className="bi bi-search"></i></span>
              <input type="text" className="form-control bg-light border-start-0" placeholder="Escribí el nombre del postulante..." value={filterName} onChange={(e) => setFilterName(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 align-items-start">
        {/* PANEL IZQUIERDO */}
        <div className="col-12 col-md-8">
          <div className="card border-0 shadow-sm p-4 bg-white">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-secundario text-gerenciar p-2 rounded-3 me-3"><i className="bi bi-calendar-event fs-4"></i></div>
              <h5 className="card-title mb-0 fw-bold text-secondary">Citas Activas</h5>
            </div>
            <hr className="text-muted opacity-25 my-2" />

            <div className="card-body px-0 py-2" style={{ maxHeight: "500px", overflowY: "auto" }}>
              {loading ? (
                <div className="text-center py-4"><div className="spinner-border text-primary spinner-border-sm"></div></div>
              ) : filteredInterviews.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-calendar-x fs-2 text-muted opacity-50 mb-2 d-block"></i>
                  <p className="text-muted mb-0 small">No hay entrevistas próximas activas.</p>
                </div>
              ) : (
                <div className="w-100 pe-2">
                  {filteredInterviews.map((interview) => (
                    <div key={interview._id} className="p-3 border rounded mb-3 bg-light shadow-sm">
                      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                        <div>
                          <h6 className="text-gerenciar fw-bold">Candidato: <span className="text-gerenciar">{interview.candidateName}</span></h6>
                          <h6 className="text-gerenciar fw-bold">Puesto: <span className="badge bg-red-subtle text-white">{interview.puesto}</span></h6>
                          {interview.cvUrl && (
                            <a href={interview.cvUrl} target="_blank" rel="noopener noreferrer" className="btn btn-link btn-sm text-decoration-none p-0 d-inline-flex align-items-center gap-1 fw-semibold ">
                              <h6><span className="text-danger"><i className="bi bi-file-earmark-pdf-fill"></i>  Ver CV</span></h6>
                            </a>
                          )}
                        </div>
                        <div className="text-end">
                          <h6 className="badge bg-red-subtle text-white d-block p-2">Cita: {interview.fechaEntrevista}</h6>
                          <span className="text-warning small">{"★".repeat(Number(interview.rating || 0))}</span>
                        </div>
                      </div>

                      <div className="d-flex justify-content-end gap-2 mt-3 pt-2 border-top border-2 border-white">
                        <button className="btn btn-xs btn-outline-primary px-2 py-1 small" onClick={() => setSelectedInterview(interview)}>
                          <i className="bi bi-eye"></i> Ver Detalle
                        </button>


                        <button className="btn btn-xs btn-primary text-white px-2 py-1 small" onClick={() => handleUpdateStatus(interview._id, "Evaluado", "Entrevista completada correctamente. Pasó al historial.")}>
                          <i className="bi bi-check-circle"></i> Completar
                        </button>


                        <button className="btn btn-xs btn-outline-secondary px-2 py-1 small" onClick={() => handleUpdateStatus(interview._id, "Cancelado / Archivado", "Entrevista archivada/cancelada.")}>
                          <i className="bi bi-archive"></i> Cancelar/Archivar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm p-4 bg-white">
            <h5 className="fw-bold text-secondary mb-3">Nueva Evaluación</h5>
            <p className="text-muted small">Carga un nuevo prospecto directamente en la agenda operativa.</p>
            <button className="btn btn-gerenciar-primary w-100 py-2 fw-bold" onClick={() => setShowForm(true)}>
              <i className="bi bi-clipboard-check me-2"></i> Iniciar Registro
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DETALLES */}
      {selectedInterview && (
        <div className="modal d-block bg-dark bg-opacity-50 align-items-center" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primario text-white">
                <h5 className="modal-title fw-bold"><i className="bi bi-person-lines-fill me-2"></i>Datos de {selectedInterview.candidateName}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedInterview(null)}></button>
              </div>
              <div className="modal-body p-4 bg-secundario">
                <div className="row g-3">
                  <div className="col-md-6"><strong>DNI:</strong> <p className="bg-white p-2 rounded border small">{selectedInterview.dni || "No cargado"}</p></div>
                  <div className="col-md-6"><strong>Email:</strong> <p className="bg-white p-2 rounded border small">{selectedInterview.email || "No cargado"}</p></div>
                  <div className="col-md-4"><strong>Teléfono:</strong> <p className="bg-white p-2 rounded border small">{selectedInterview.telefono || "No cargado"}</p></div>
                  <div className="col-md-8"><strong>Domicilio:</strong> <p className="bg-white p-2 rounded border small">{selectedInterview.domicilio || "No cargado"}</p></div>
                  <div className="col-md-6"><strong>Entrevistador:</strong> <p className="bg-white p-2 rounded border small">{selectedInterview.entrevistador}</p></div>
                  <div className="col-md-6"><strong>Puesto:</strong> <p className="bg-white p-2 rounded border small text-primary fw-bold">{selectedInterview.puesto}</p></div>
                  <div className="col-12"><strong>Observaciones:</strong><div className="bg-white p-3 rounded border small text-secondary" style={{ whiteSpace: "pre-wrap" }}>{selectedInterview.resumen || "Sin observaciones."}</div></div>
                </div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary btn-sm" onClick={() => setSelectedInterview(null)}>Cerrar</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Interviews;