// src/pages/ReturnsPage.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { agentService } from "../services/agentService";
import { taskService } from "../services/taskService";
import PerformanceChart from "../pages/PerformanceChart"; // <-- NUEVO

export default function ReturnsPage() {
    const { user } = useAuth();
    const [managers, setManagers] = useState([]);
    const [selectedManager, setSelectedManager] = useState("");
    const [agents, setAgents] = useState([]);
    const [selectedAgentIds, setSelectedAgentIds] = useState([]); // Array para comparar múltiples
    const [period, setPeriod] = useState("monthly"); // Estado cronológico: weekly, monthly, yearly
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [chartLoading, setChartLoading] = useState(false);
    const [error, setError] = useState("");

    // 1. Carga inicial según Rol
    useEffect(() => {
        if (user?.role === "administrador") {
            fetchManagers();
        } else if (user?.role === "encargado") {
            fetchInitialAgents();
        }
    }, [user]);

    // 2. Traer analíticas cuando cambian los agentes seleccionados o el período
    useEffect(() => {
        if (selectedAgentIds.length > 0) {
            fetchAnalyticsData();
        } else {
            setChartData([]);
        }
    }, [selectedAgentIds, period]);

    const fetchInitialAgents = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await agentService.getAll();
            setAgents(data);
        } catch (err) {
            setError("Error al cargar agentes: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchManagers = async () => {
        try {
            setLoading(true);
            // Aquí mapeas tu llamada real si tienes userService, o simulado por ahora
            setManagers([]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalyticsData = async () => {
        try {
            setChartLoading(true);
            // Llamamos al método que agregamos en la tarea anterior al taskService
            const data = await taskService.getAnalytics(selectedAgentIds, period);
            setChartData(data);
        } catch (err) {
            console.error("Error al traer analíticas:", err);
        } finally {
            setChartLoading(false);
        }
    };

    const handleManagerChange = async (e) => {
        const managerId = e.target.value;
        setSelectedManager(managerId);
        setAgents([]);
        setSelectedAgentIds([]);
        if (!managerId) return;

        try {
            setLoading(true);
            const data = await agentService.getByManager(managerId);
            setAgents(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Manejador para seleccionar/deseleccionar agentes para la comparación
    const handleAgentCheck = (agentId) => {
        if (selectedAgentIds.includes(agentId)) {
            setSelectedAgentIds(selectedAgentIds.filter(id => id !== agentId));
        } else {
            setSelectedAgentIds([...selectedAgentIds, agentId]);
        }
    };

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h3>📈 Panel de Rendimiento Estadístico</h3>
                    <p className="text-muted mb-0">Análisis cronológico y comparativo del personal de la provincia.</p>
                </div>

                {/* SELECTOR DE PERÍODO (Filtro temporal) */}
                <div className="btn-group shadow-sm">
                    <button type="button" className={`btn btn-sm ${period === "weekly" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setPeriod("weekly")}>Semanal</button>
                    <button type="button" className={`btn btn-sm ${period === "monthly" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setPeriod("monthly")}>Mensual</button>
                    <button type="button" className={`btn btn-sm ${period === "yearly" ? "btn-primary" : "btn-outline-primary"}`} onClick={() => setPeriod("yearly")}>Anual</button>
                </div>
            </div>

            {error && <div className="alert alert-danger py-2">{error}</div>}

            {/* FILTROS DE ROL */}
            {user?.role === "administrador" ? (
                <div className="card p-3 mb-4 bg-light border-0 shadow-sm">
                    <label className="form-label fw-bold text-secondary">Filtrar por Encargado / Sector</label>
                    <select className="form-select" value={selectedManager} onChange={handleManagerChange}>
                        <option value="">-- Elige un encargado --</option>
                        {managers.map(m => (
                            <option key={m._id} value={m._id}>{m.nombre} {m.apellido}</option>
                        ))}
                    </select>
                </div>
            ) : (
                <div className="alert alert-info py-2 border-0 shadow-sm mb-4">
                    <strong>Sector Actual:</strong> {user?.sector?.toUpperCase()}
                </div>
            )}

            <div className="row g-4">
                {/* COLUMNA IZQUIERDA: Selector de Agentes (Auditoría) */}
                <div className="col-12 col-md-3">
                    <div className="card p-3 border-0 shadow-sm bg-white h-100">
                        <span className="small fw-bold text-secondary d-block mb-3">📋 Seleccionar Agentes para medir:</span>
                        {loading ? (
                            <p className="text-muted small">Cargando sector...</p>
                        ) : agents.length === 0 ? (
                            <p className="text-muted small">No hay agentes en este sector.</p>
                        ) : (
                            <div className="d-flex flex-column gap-2">
                                {agents.map(agent => (
                                    <label key={agent._id} className="d-flex align-items-center gap-2 p-2 rounded border bg-light style-pointer fs-6">
                                        <input
                                            type="checkbox"
                                            className="form-check-input m-0"
                                            checked={selectedAgentIds.includes(agent._id)}
                                            onChange={() => handleAgentCheck(agent._id)}
                                        />
                                        <span className="text-truncate">{agent.apellido}, {agent.nombre}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUMNA DERECHA: Renderizado del Gráfico */}
                <div className="col-12 col-md-9">
                    {chartLoading ? (
                        <div className="card border-0 shadow-sm p-5 bg-white text-center">
                            <div className="spinner-border text-primary mb-3" role="status"></div>
                            <p className="text-muted mb-0">Calculando métricas históricas del servidor...</p>
                        </div>
                    ) : selectedAgentIds.length === 0 ? (
                        <div className="card border-0 shadow-sm p-5 bg-light text-center border-dashed">
                            <i className="bi bi-bar-chart fs-1 text-secondary mb-2"></i>
                            <p className="text-muted mb-0">Selecciona uno o más agentes de la lista de la izquierda para proyectar sus gráficos comparativos.</p>
                        </div>
                    ) : (
                        <PerformanceChart data={chartData} period={period} />
                    )}
                </div>
            </div>
        </div>
    );
}