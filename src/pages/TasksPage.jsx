// src/pages/TasksPage.jsx
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // <-- NUEVO IMPORT para leer el estado del viaje
import { agentService } from "../services/agentService";
import AgentKpis from "./AgentKpis";

const TasksPage = () => {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const location = useLocation(); // <-- Inicializamos el lector de locación

  useEffect(() => {
    const loadAgents = async () => {
      try {
        setLoading(true);
        const data = await agentService.getAll();
        setAgents(data);

        // LÓGICA DE DETECCIÓN: ¿Venimos redirigidos desde el CRUD de Agentes?
        if (location.state && location.state.agentFromCrud) {
          const agentFromUrl = location.state.agentFromCrud;
          // Buscamos que exista en la lista cargada por seguridad y lo pre-seleccionamos
          const found = data.find(a => a._id === agentFromUrl._id);
          if (found) {
            setSelectedAgent(found);
          }
        }
      } catch (err) {
        setError("Error al cargar los agentes de tu sector: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    loadAgents();
  }, [location.state]); // Escucha si el estado del router cambia

  const handleAgentChange = (e) => {
    const agentId = e.target.value;
    if (!agentId) {
      setSelectedAgent(null);
      return;
    }
    const agent = agents.find(a => a._id === agentId);
    setSelectedAgent(agent);
  };

  return (
    <div className="container-fluid p-4">
      <div className="card shadow-sm border-0 p-4 mb-4">
        <div className="mb-4">
          <h1 className="fw-bold text-gerenciar mb-1">
            <i className="bi bi-clipboard-data me-2"></i>
            Gestión de KPIs
          </h1>

          <p className="text-muted mb-0">
            Registrá tareas, evaluá desempeño y consultá métricas de productividad.
          </p>
          
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="row align-items-center">
          <div className="col-12 col-md-6">
            <label className="form-label fw-bold text-gerenciar small">Agente a evaluar:</label>
            {loading ? (
              <select className="form-select" disabled><option>Cargando personal...</option></select>
            ) : (
              <select
                className="form-select"
                onChange={handleAgentChange}
                value={selectedAgent?._id || ""} // Si vino de la otra página, ya se marca acá solo
              >
                <option value="">Seleccionar agente...</option>
                {agents.map(agent => (
                  <option key={agent._id} value={agent._id}>
                    {agent.apellido.toUpperCase()}, {agent.nombre} (Legajo: {agent.legajo})
                  </option>
                ))}

              </select>

            )}
            <small className="text-muted ms-2">
              {agents.length} agentes disponibles.
            </small>
          </div>
        </div>
      </div>

      {selectedAgent ? (
        <AgentKpis
          agent={selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <i
              className="bi bi-person-workspace text-muted"
              style={{ fontSize: "3rem" }}
            ></i>
            <h5 className="mt-3">Ningún agente seleccionado. </h5>
            <p className="text-muted mb-0">
              Seleccioná un agente para comenzar a registrar tareas y visualizar indicadores.
            </p>
          </div>
        </div>

      )
      }
    </div >
  );
};

export default TasksPage;