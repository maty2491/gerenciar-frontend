// src/pages/AgentKpis.jsx
import { useState, useEffect } from "react";
import { taskService } from "../services/taskService";
import { categoryService } from "../services/categoryService";

const AgentKpis = ({ agent, onClose }) => {
  const [taskHistory, setTaskHistory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // --- ESTADOS PARA CREAR CATEGORÍA ---
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);

  // --- ESTADOS NUEVOS PARA CREAR SUBTIPO ---
  const [isCreatingNewSub, setIsCreatingNewSub] = useState(false);
  const [newSubTypeName, setNewSubTypeName] = useState("");
  const [subTypeLoading, setSubTypeLoading] = useState(false);

  const [kpiData, setKpiData] = useState({
    category: "",
    subType: "",
    quantity: 1,
    note: ""
  });

  // Buscamos el objeto completo de la categoría seleccionada en la DB
  const currentCategoryObj = categories.find(cat => cat.name === kpiData.category);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError("");
      const [history, databaseCategories] = await Promise.all([
        taskService.getHistory(agent._id),
        categoryService.getAll()
      ]);
      setTaskHistory(history);
      setCategories(databaseCategories);
    } catch (err) {
      setError("No se pudieron cargar los datos: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (agent) {
      fetchInitialData();
      setKpiData({ category: "", subType: "", quantity: 1, note: "" });
      setIsCreatingNew(false);
      setIsCreatingNewSub(false);
      setError("");
      setSuccess("");
    }
  }, [agent]);

  // Handler Categorías
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setIsCreatingNewSub(false);
    if (value === "CREATE_NEW_TRIGGER") {
      setIsCreatingNew(true);
      setKpiData({ ...kpiData, category: "", subType: "" });
    } else {
      setIsCreatingNew(false);
      setKpiData({ ...kpiData, category: value, subType: "" });
    }
  };

  // Handler Subtipos
  const handleSubTypeChange = (e) => {
    const value = e.target.value;
    if (value === "CREATE_SUB_TRIGGER") {
      setIsCreatingNewSub(true);
      setKpiData({ ...kpiData, subType: "" });
    } else {
      setIsCreatingNewSub(false);
      setKpiData({ ...kpiData, subType: value });
    }
  };

  // Guardar Categoría
  const handleSaveCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      setCategoryLoading(true);
      setError("");
      const createdCategory = await categoryService.create({
        name: newCategoryName.trim(),
        subTypes: ["General"]
      });

      setSuccess(`Categoría "${createdCategory.name}" creada.`);
      const updatedCategories = [...categories, createdCategory].sort((a, b) => a.name.localeCompare(b.name));
      setCategories(updatedCategories);
      setKpiData({ ...kpiData, category: createdCategory.name, subType: "General" });
      setNewCategoryName("");
      setIsCreatingNew(false);
    } catch (err) {
      setError(err.message || "Error al crear la categoría");
    } finally {
      setCategoryLoading(false);
    }
  };

  // Guardar Subtipo (PATCH a Mongoose)
  const handleSaveSubType = async () => {
    if (!newSubTypeName.trim() || !currentCategoryObj) return;

    try {
      setSubTypeLoading(true);
      setError("");

      const updatedSubTypes = [...currentCategoryObj.subTypes, newSubTypeName.trim()];

      const updatedCategory = await categoryService.update(currentCategoryObj._id, {
        name: currentCategoryObj.name,
        subTypes: updatedSubTypes
      });

      setSuccess(`Subtipo "${newSubTypeName.trim()}" añadido con éxito.`);
      setCategories(prev => prev.map(cat => cat._id === updatedCategory._id ? updatedCategory : cat));
      setKpiData({ ...kpiData, subType: newSubTypeName.trim() });
      setNewSubTypeName("");
      setIsCreatingNewSub(false);
    } catch (err) {
      setError(err.message || "Error al añadir subtipo");
    } finally {
      setSubTypeLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!kpiData.category || !kpiData.subType) {
      setError("Selecciona una categoría y un subtipo válidos.");
      return;
    }

    try {
      setSubmitLoading(true);
      setError("");
      await taskService.record({
        agentId: agent._id,
        ...kpiData
      });

      setSuccess(`Métrica registrada con éxito.`);
      setKpiData({ category: "", subType: "", quantity: 1, note: "" });

      const history = await taskService.getHistory(agent._id);
      setTaskHistory(history);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="row g-4 mt-2">
      <hr />
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h3 className="fw-bold text-gerenciar mb-1">
            {agent.apellido}, {agent.nombre}
          </h3>

          <p className="text-muted mb-0">
            Registro y seguimiento de productividad
          </p>
        </div>
        <button
          className="btn btn-gerenciar-secondary"
          onClick={onClose}
        >
          <i className="bi bi-x-circle me-2"></i>
          Cerrar panel
        </button>
      </div>

      {error && <div className="col-12 alert alert-danger">{error}</div>}
      {success && <div className="col-12 alert alert-success">{success}</div>}

      {/* Formulario Carga de Tareas */}
      <div className="col-12 col-md-4">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-header bg-primario">
            <h5 className="mb-0 text-white">
              <i className="bi bi-plus-circle me-2"></i>
              Registrar tarea
            </h5>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>

              {/* 1. Selector Categoría */}
              <div className="mb-2">
                <label className="form-label fw-bold text-gerenciar small">Categoría Primaria</label>
                <select
                  className="form-select"
                  required={!isCreatingNew}
                  disabled={isCreatingNew || isCreatingNewSub}
                  value={kpiData.category}
                  onChange={handleCategoryChange}
                >
                  <option value="">-- Seleccionar --</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                  <option value="CREATE_NEW_TRIGGER" className="text-primary fw-bold">
                    ➕ ¡Crear Nueva Categoría!
                  </option>
                </select>
              </div>

              {/* Input dinámico Categoría */}
              {isCreatingNew && (
                <div className="p-2 mb-3 border rounded bg-white shadow-sm">
                  <label className="form-label fw-bold text-gerenciar small">Nombre de la nueva categoría</label>
                  <input
                    type="text"
                    className="form-control form-control-sm mb-2"
                    placeholder="Ej: Oficios, Intimaciones..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    disabled={categoryLoading}
                  />
                  <div className="d-flex gap-2 justify-content-end">
                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => setIsCreatingNew(false)}>Cancelar</button>
                    <button type="button" className="btn btn-sm btn-primary" onClick={handleSaveCategory} disabled={categoryLoading || !newCategoryName.trim()}>
                      {categoryLoading ? "Guardando..." : "Crear"}
                    </button>
                  </div>
                </div>
              )}

              {/* 2. Selector Subtipo */}
              <div className="mb-2">
                <label className="form-label fw-bold text-gerenciar small">Subtipo / Acción</label>
                <select
                  className="form-select"
                  required={!isCreatingNewSub}
                  disabled={!kpiData.category || isCreatingNew || isCreatingNewSub}
                  value={kpiData.subType}
                  onChange={handleSubTypeChange}
                >
                  <option value="">-- Seleccionar --</option>
                  {currentCategoryObj && currentCategoryObj.subTypes.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                  {kpiData.category && (
                    <option value="CREATE_SUB_TRIGGER" className="text-info fw-bold">
                      ➕ ¡Crear Nuevo Subtipo!
                    </option>
                  )}
                </select>
              </div>

              {/* Input dinámico Subtipo */}
              {isCreatingNewSub && (
                <div className="p-2 mb-3 border rounded bg-white shadow-sm">
                  <label className="form-label fw-bold text-gerenciar small">Nuevo subtipo para "{kpiData.category}"</label>
                  <input
                    type="text"
                    className="form-control form-control-sm mb-2"
                    placeholder="Ej: Diligenciados, Pendientes..."
                    value={newSubTypeName}
                    onChange={(e) => setNewSubTypeName(e.target.value)}
                    disabled={subTypeLoading}
                  />
                  <div className="d-flex gap-2 justify-content-end">
                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => setIsCreatingNewSub(false)}>Cancelar</button>
                    <button type="button" className="btn btn-sm btn-info text-white" onClick={handleSaveSubType} disabled={subTypeLoading || !newSubTypeName.trim()}>
                      {subTypeLoading ? "Guardando..." : "Añadir"}
                    </button>
                  </div>
                </div>
              )}

              <div className="mb-2">
                <label className="form-label small fw-semibold">Cantidad Realizada</label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  required
                  disabled={isCreatingNew || isCreatingNewSub}
                  value={kpiData.quantity}
                  onChange={(e) => setKpiData({ ...kpiData, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Nota / Detalle</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: Zona centro"
                  disabled={isCreatingNew || isCreatingNewSub}
                  value={kpiData.note}
                  onChange={(e) => setKpiData({ ...kpiData, note: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-gerenciar-primary w-100" disabled={submitLoading || isCreatingNew || isCreatingNewSub}>
                {submitLoading ? "Guardando..." : "Guardar Tarea"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* --- RESTAURADO: HISTORIAL DE EVALUACIÓN DE CARGA --- */}
      <div className="col-12 col-md-8">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-header bg-light">
            <h5 className="mb-0 text-gerenciar">
              <i className="bi bi-clock-history me-2"></i>
              Historial de productividad
            </h5>
          </div>
          {loading ? (
            <p className="text-center text-muted">Cargando historial...</p>
          ) : taskHistory.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox text-muted fs-1"></i>
              <p className="text-muted mt-3 mb-0">
                No existen registros para este agente.
              </p>
            </div>
          ) : (
            <div className="table-responsive" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table className="table table-hover align-middle mb-0">
                <thead className="table-header-gerenciar">
                  <tr>
                    <th>Fecha</th>
                    <th>Categoría</th>
                    <th>Subtipo</th>
                    <th>Cantidad</th>
                    <th>Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {taskHistory.map((task) => (
                    <tr key={task._id}>
                      <td>{new Date(task.createdAt).toLocaleDateString()}</td>
                      <td><span className="badge bg-primario">{task.category}</span></td>
                      <td>{task.subType}</td>
                      <td className="fw-bold text-gerenciar">{task.quantity}</td>
                      <td className="small text-muted">{task.note || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentKpis;