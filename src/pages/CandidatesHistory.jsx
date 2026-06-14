import { useState, useEffect } from "react";
import { auth } from "../services/firebase.js";
import { getIdToken } from "firebase/auth";

const CandidatesHistory = ({ onRefreshNeeded }) => {
  const [allCandidates, setAllCandidates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados para Filtros
  const [search, setSearch] = useState("");
  const [filterPuesto, setFilterPuesto] = useState("");
  const [filterResultado, setFilterResultado] = useState("");
  const [filterRating, setFilterRating] = useState("");

  // 🛠️ ESTADOS PARA EL MODAL DE EDICIÓN
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCandidateId, setEditingCandidateId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    candidateName: "",
    dni: "",
    fechaNacimiento: "",
    telefono: "",
    domicilio: "",
    email: "",
    puesto: "",
    fechaEntrevista: "",
    entrevistador: "",
    resumen: "",
    resultado: "",
    rating: ""
  });
  const [saving, setSaving] = useState(false);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const token = await getIdToken(currentUser, true);

      const response = await fetch("http://localhost:3000/api/interviews", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const resData = await response.json();
      setAllCandidates(resData.success ? resData.data : resData);
    } catch (error) {
      console.error("Error cargando el histórico:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // 🛠️ FUNCIÓN AL HACER CLIC EN EL BOTÓN EDITAR (ABRE MODAL Y PRECARGA DATOS)
  const handleOpenEditModal = (candidate) => {
    setEditingCandidateId(candidate._id);
    setEditFormData({
      candidateName: candidate.candidateName || "",
      dni: candidate.dni || "",
      fechaNacimiento: candidate.fechaNacimiento ? candidate.fechaNacimiento.split("T")[0] : "",
      telefono: candidate.telefono || "",
      domicilio: candidate.domicilio || "",
      email: candidate.email || "",
      puesto: candidate.puesto || "",
      fechaEntrevista: candidate.fechaEntrevista ? candidate.fechaEntrevista.split("T")[0] : "",
      entrevistador: candidate.entrevistador || "",
      resumen: candidate.resumen || "",
      resultado: candidate.resultado || "",
      rating: candidate.rating || ""
    });
    setShowEditModal(true);
  };

  // MANEJO DE CAMBIOS EN INPUTS DEL MODAL
  const handleModalChange = (e) => {
    const { id, name, value } = e.target;
    const fieldName = id || name;
    setEditFormData({ ...editFormData, [fieldName]: value });
  };

  const handleModalRatingChange = (value) => {
    setEditFormData({ ...editFormData, rating: value });
  };

  // 🛠️ ENVÍO DE DATOS MODIFICADOS (PUT)
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const currentUser = auth.currentUser;
      const token = await getIdToken(currentUser, true);

      const response = await fetch(`http://localhost:3000/api/interviews/${editingCandidateId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });

      const resData = await response.json();

      if (response.ok) {
        alert("¡Datos del candidato actualizados con éxito!");
        setShowEditModal(false);
        loadAllData(); // Recarga la tabla local
        if (onRefreshNeeded) onRefreshNeeded(); // Sincroniza la vista de Interviews
      } else {
        alert(`Error al actualizar: ${resData.message}`);
      }
    } catch (error) {
      console.error("🚨 Error modificando candidato:", error);
      alert("Error de red al intentar guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  // FUNCIÓN PARA ELIMINAR DE MONGO
  const handleDeleteCandidate = async (id, name) => {
    if (!window.confirm(`⚠️ ¿Estás COMPLETAMENTE SEGURO de que querés borrar a ${name}? Esta acción eliminará permanentemente su registro del servidor.`)) return;

    try {
      const currentUser = auth.currentUser;
      const token = await getIdToken(currentUser, true);

      const response = await fetch(`http://localhost:3000/api/interviews/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      const resData = await response.json();
      if (response.ok) {
        alert(resData.message || "Registro eliminado.");
        loadAllData();
        if (onRefreshNeeded) onRefreshNeeded();
      } else {
        alert("No se pudo eliminar el registro: " + resData.message);
      }
    } catch (error) {
      console.error("Error al eliminar candidato:", error);
    }
  };

  const filtered = allCandidates.filter((c) => {
    const matchesName = c.candidateName ? c.candidateName.toLowerCase().includes(search.toLowerCase()) : true;
    const matchesPuesto = filterPuesto ? c.puesto === filterPuesto : true;
    const matchesResultado = filterResultado ? (c.resultado && c.resultado.includes(filterResultado)) : true;
    const matchesRating = filterRating ? String(c.rating) === filterRating : true;

    return matchesName && matchesPuesto && matchesResultado && matchesRating;
  });

  return (
    <>
      {/* PANEL DE FILTROS */}
      <div className="card border-0 shadow-sm p-3 mb-4 bg-white">
        <div className="row g-3">
          <div className="col-12 col-md-3">
            <label className="form-label small fw-bold text-secondary">Buscar Candidato</label>
            <input type="text" className="form-control form-control-sm bg-light" placeholder="Nombre..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label small fw-bold text-secondary">Filtrar por Puesto</label>
            <select className="form-select form-select-sm bg-light" value={filterPuesto} onChange={(e) => setFilterPuesto(e.target.value)}>
              <option value="">Todos los puestos</option>
              <option value="Administrativo">Administrativo</option>
              <option value="Atención al cliente (Call Center)">Atención al cliente (Call Center)</option>
              <option value="Técnico de Mantenimiento">Técnico de Mantenimiento</option>
              <option value="Marketing Digital">Marketing Digital</option>
              <option value="Gerente/Jefe de Área">Gerente/Jefe de Área</option>
            </select>
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label small fw-bold text-secondary">Filtrar por Estado</label>
            <select className="form-select form-select-sm bg-light" value={filterResultado} onChange={(e) => setFilterResultado(e.target.value)}>
              <option value="">Todos los estados</option>
              <option value="Evaluado">Evaluado (Completado)</option>
              <option value="Cancelado / Archivado">Cancelado / Archivado</option>
              <option value="Avanza a 2da instancia">Avanza a 2da instancia</option>
              <option value="Contratación directa sugerida">Contratación sugerida</option>
              <option value="Rechazado">Rechazado</option>
            </select>
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label small fw-bold text-secondary">Calificación</label>
            <select className="form-select form-select-sm bg-light" value={filterRating} onChange={(e) => setFilterRating(e.target.value)}>
              <option value="">Cualquiera</option>
              <option value="5">5 estrellas</option>
              <option value="4">4 estrellas</option>
              <option value="3">3 estrellas</option>
              <option value="2">2 estrellas</option>
              <option value="1">1 estrella</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLA HISTÓRICA */}
      <div className="d-none d-md-block">
        <div className="card border-0 shadow-sm bg-white p-4">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.9rem' }}>
              <thead className="table-header-gerenciar">
                <tr>
                  <th>Candidato / Info de Contacto</th>
                  <th className="d-none d-md-table-cell">DNI</th>
                  <th>Puesto</th>
                  <th>Calificación</th>
                  <th className="d-none d-lg-table-cell">Fecha Cita</th>
                  <th>Estado Interno</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-4"><div className="spinner-border spinner-border-sm text-gerenciar"></div></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-4 text-muted">No se encontraron postulantes registrados.</td></tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c._id}>
                      <td>
                        <div className="fw-bold text-gerenciar">{c.candidateName}</div>
                        <div className="text-muted small" style={{ fontSize: '0.8rem' }}>
                          <i className="bi bi-envelope me-1"></i>{c.email || "S/E"} <br />
                          <i className="bi bi-telephone me-1"></i>{c.telefono || "S/T"}
                        </div>
                      </td>
                      <td className="d-none d-md-table-cell">
                        <span className="text-secondary small font-monospace">
                          {c.dni || "-"}
                        </span>
                      </td>
                      <td><span className="badge bg-primario text-white">{c.puesto}</span></td>
                      <td className="text-rating text-nowrap">{"★".repeat(Number(c.rating || 0)) || "-"}</td>
                      <td className="d-none d-lg-table-cell">
                        <small className="text-muted">
                          {c.fechaEntrevista}
                        </small>
                      </td>
                      <td>
                        <span className={`badge ${c.resultado && c.resultado.includes('Avanza') ? 'bg-primary-subtle text-primary' : c.resultado && c.resultado.includes('Rechazado') ? 'bg-danger-subtle text-danger' : 'bg-light text-dark'} border`}>
                          {c.resultado || 'Agendado'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-1 flex-nowrap">
                          {c.cvUrl && (
                            <a href={c.cvUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-gerenciar-primary py-0 px-2" title="Ver CV">
                              <i className="bi bi-file-pdf"></i>
                            </a>
                          )}
                          {/* BOTÓN INICIAR MODAL EDICIÓN */}
                          <button className="btn btn-sm btn-gerenciar-primary py-0 px-2" title="Editar Registro" onClick={() => handleOpenEditModal(c)}>
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-sm btn-gerenciar-secondary py-0 px-2" title="Eliminar de Base de Datos" onClick={() => handleDeleteCandidate(c._id, c.candidateName)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* VISTA RESPONSIVE PARA MÓVILES */}
      <div className="d-md-none">
        {filtered.map((c) => (
          <div key={c._id} className="card border-0 shadow-sm mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h6 className="fw-bold text-gerenciar mb-1">
                    {c.candidateName}
                  </h6>

                  <small className="text-muted d-block">
                    {c.email || "Sin email"}
                  </small>

                  <small className="text-muted d-block">
                    {c.telefono || "Sin teléfono"}
                  </small>
                </div>

                <span className="badge bg-primario">
                  {c.puesto}
                </span>
              </div>

              <hr />

              <div className="small mb-2">
                <strong>DNI:</strong> {c.dni || "-"}
              </div>

              <div className="small mb-2">
                <strong>Fecha:</strong> {c.fechaEntrevista || "-"}
              </div>

              <div className="small mb-2">
                <strong>Calificación:</strong>
                <span className="text-rating ms-2">
                  {"★".repeat(Number(c.rating || 0))}
                </span>
              </div>

              <div className="mb-3">
                <span
                  className={`badge ${c.resultado?.includes("Avanza")
                      ? "bg-primary-subtle text-primary"
                      : c.resultado?.includes("Rechazado")
                        ? "bg-danger-subtle text-danger"
                        : "bg-light text-dark"
                    } border`}
                >
                  {c.resultado || "Agendado"}
                </span>
              </div>

              <div className="d-flex gap-2">
                {c.cvUrl && (
                  <a
                    href={c.cvUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-gerenciar-danger btn-sm flex-fill"
                  >
                    CV
                  </a>
                )}

                <button
                  className="btn btn-gerenciar-primary btn-sm flex-fill"
                  onClick={() => handleOpenEditModal(c)}
                >
                  Editar
                </button>

                <button
                  className="btn btn-gerenciar-danger btn-sm"
                  onClick={() =>
                    handleDeleteCandidate(c._id, c.candidateName)
                  }
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* ========================================================= */}
      {/* 🛠️ MODAL BOOTSTRAP DE EDICIÓN DE CANDIDATO */}
      {/* ========================================================= */}
      {showEditModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1" style={{ overflowY: "auto" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primario text-white">
                <h5 className="modal-title fw-bold text-white">
                  <i className="bi bi-pencil-square me-2"></i>Modificar Expediente: {editFormData.candidateName}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>

              <form onSubmit={handleSaveChanges}>
                <div className="modal-body p-4 bg-secundario">
                  <h6 className="text-gerenciar fw-bold mb-3 border-bottom pb-1">Datos Personales</h6>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="candidateName" className="text-gerenciar fw-bold form-label small fw-bold">Nombre del candidato</label>
                      <input type="text" className="form-control form-control-sm" id="candidateName" value={editFormData.candidateName} onChange={handleModalChange} required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="dni" className="text-gerenciar fw-bold form-label small fw-bold">DNI</label>
                      <input type="text" className="form-control form-control-sm" id="dni" value={editFormData.dni} onChange={handleModalChange} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="fechaNacimiento" className="text-gerenciar fw-bold form-label small fw-bold">Fecha de nacimiento</label>
                      <input type="date" className="form-control form-control-sm" id="fechaNacimiento" value={editFormData.fechaNacimiento} onChange={handleModalChange} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="telefono" className="text-gerenciar fw-bold form-label small fw-bold">Teléfono de contacto</label>
                      <input type="text" className="form-control form-control-sm" id="telefono" value={editFormData.telefono} onChange={handleModalChange} />
                    </div>
                    <div className="col-12 mb-3">
                      <label htmlFor="domicilio" className="text-gerenciar fw-bold form-label small fw-bold">Domicilio o barrio de residencia</label>
                      <input type="text" className="form-control form-control-sm" id="domicilio" value={editFormData.domicilio} onChange={handleModalChange} />
                    </div>
                    <div className="col-12 mb-3">
                      <label htmlFor="email" className="text-gerenciar fw-bold form-label small fw-bold">Correo electrónico</label>
                      <input type="email" className="form-control form-control-sm" id="email" value={editFormData.email} onChange={handleModalChange} />
                    </div>
                  </div>

                  <h6 className="text-gerenciar fw-bold mt-2 mb-3 border-bottom pb-1">Información de la Entrevista</h6>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="puesto" className="text-gerenciar fw-bold form-label small fw-bold">Puesto al que se postula</label>
                      <select className="text-gerenciar fw-bold form-select form-select-sm" id="puesto" value={editFormData.puesto} onChange={handleModalChange} required>
                        <option value="">Seleccione un puesto</option>
                        <option value="Administrativo">Administrativo</option>
                        <option value="Atención al cliente (Call Center)">Atención al cliente (Call Center)</option>
                        <option value="Técnico de Mantenimiento">Técnico de Mantenimiento</option>
                        <option value="Marketing Digital">Marketing Digital</option>
                        <option value="Gerente/Jefe de Área">Gerente/Jefe de Área</option>
                        <option value="Otro (Especificar en resumen)">Otro (Especificar en resumen)</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="fechaEntrevista" className="text-gerenciar fw-bold form-label small fw-bold">Fecha de la entrevista</label>
                      <input type="date" className="form-control form-control-sm" id="fechaEntrevista" value={editFormData.fechaEntrevista} onChange={handleModalChange} required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="entrevistador" className="text-gerenciar fw-bold form-label small fw-bold">Entrevistador (RRHH)</label>
                      <select className="text-gerenciar fw-bold form-select form-select-sm" id="entrevistador" value={editFormData.entrevistador} onChange={handleModalChange} required>
                        <option value="">Seleccione un entrevistador</option>
                        <option value="Leonardo Biaggini">Leonardo Biaggini</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="resultado" className="text-gerenciar fw-bold form-label small fw-bold">Estado o Recomendación final</label>
                      <select className="text-gerenciar fw-bold form-select form-select-sm" id="resultado" value={editFormData.resultado} onChange={handleModalChange} required>
                        <option value="">Seleccione un resultado</option>
                        <option value="Avanza a 2da instancia / Entrevista con Gerencia">Avanza a 2da instancia / Entrevista con Gerencia</option>
                        <option value="Contratación directa sugerida">Contratación directa sugerida</option>
                        <option value="Rechazado (No apto para el puesto)">Rechazado (No apto para el puesto)</option>
                        <option value="Queda en base de datos">Queda en base de datos</option>
                        <option value="Pendiente de revisión interna">Pendiente de revisión interna</option>
                        <option value="Evaluado">Evaluado</option>
                        <option value="Cancelado / Archivado">Cancelado / Archivado</option>
                      </select>
                    </div>
                    <div className="col-12 mb-3">
                      <label htmlFor="resumen" className="text-gerenciar fw-bold form-label small fw-bold">Resumen de la entrevista</label>
                      <textarea className="form-control form-control-sm" id="resumen" rows="3" value={editFormData.resumen} onChange={handleModalChange}></textarea>
                    </div>
                    <div className="col-12 mb-2">
                      <label className="text-gerenciar fw-bold form-label small fw-bold d-block">Adecuación general</label>
                      <div className="star-rating fs-4" style={{ direction: 'rtl', display: 'inline-block' }}>
                        {[5, 4, 3, 2, 1].map((num) => (
                          <span
                            key={num}
                            style={{ cursor: 'pointer', color: num <= Number(editFormData.rating) ? '#ffc107' : '#e4e5e9' }}
                            onClick={() => handleModalRatingChange(String(num))}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-white border-top">
                  <button
                    type="button"
                    className="btn btn-gerenciar-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="btn btn-gerenciar-primary"
                    disabled={saving}
                  >
                    {saving ? "Guardando..." : "Guardar Cambios"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CandidatesHistory;