import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { agentService } from "../services/agentService";
import AgentKpis from "./AgentKpis"; // <-- Importamos el componente hijo nuevo

const Agents = () => {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [formData, setFormData] = useState({ legajo: "", nombre: "", apellido: "" });
    const [submitLoading, setSubmitLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // El único estado necesario para el hijo: saber a quién estamos auditando
    const [selectedAgent, setSelectedAgent] = useState(null);

    const navigate = useNavigate();

    const fetchAgents = async () => {
        try {
            setLoading(true);
            const data = await agentService.getAll();
            setAgents(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAgents();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const cancelEdit = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormData({ legajo: "", nombre: "", apellido: "" });
    };

    const handleAgentSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setError("");
        setSuccessMessage("");
        try {
            if (isEditing) {
                await agentService.update(editingId, formData);
                setSuccessMessage("Agente actualizado con éxito.");
            } else {
                await agentService.create(formData);
                setSuccessMessage("Agente creado con éxito.");
            }
            cancelEdit();
            fetchAgents();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDeleteClick = async (id, fullName) => {
        if (!window.confirm(`¿Estás seguro de eliminar a ${fullName}?`)) return;
        try {
            await agentService.delete(id);
            setSuccessMessage("Agente eliminado.");
            fetchAgents();
            if (selectedAgent?._id === id) setSelectedAgent(null); // Oculta KPIs si borras al agente
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container-fluid p-4">
            <h2 className="mb-4">Panel de Gestión de Agentes</h2>

            {error && <div className="alert alert-danger">{error}</div>}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}

            <div className="row g-4">
                {/* Formulario del Agente */}
                <div className="col-12 col-md-4">
                    <div className="card shadow-sm border-0 p-3">
                        <h5 className="card-title mb-3 text-primary">
                            {isEditing ? "✏️ Editar Agente" : "👤 Registrar Nuevo Agente"}
                        </h5>
                        <form onSubmit={handleAgentSubmit}>
                            <div className="mb-2">
                                <label className="form-label small fw-semibold">Legajo</label>
                                <input type="text" name="legajo" className="form-control" required value={formData.legajo} onChange={handleChange} disabled={isEditing} />
                            </div>
                            <div className="mb-2">
                                <label className="form-label small fw-semibold">Nombre</label>
                                <input type="text" name="nombre" className="form-control" required value={formData.nombre} onChange={handleChange} />
                            </div>
                            <div className="mb-3">
                                <label className="form-label small fw-semibold">Apellido</label>
                                <input type="text" name="apellido" className="form-control" required value={formData.apellido} onChange={handleChange} />
                            </div>
                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-gerenciar-primary flex-grow-1" disabled={submitLoading}>
                                    {submitLoading ? "Guardando..." : isEditing ? "Guardar" : "Crear"}
                                </button>
                                {isEditing && <button type="button" className="btn btn-outline-secondary" onClick={cancelEdit}>Cancelar</button>}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Tabla de Agentes */}
                <div className="col-12 col-md-8">
                    <div className="card shadow-sm border-0 p-3">
                        <h5 className="card-title mb-3">Agentes Activos</h5>
                        {loading ? <p className="text-center">Cargando...</p> : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Legajo</th>
                                            <th>Nombre</th>
                                            <th className="text-end">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {agents.map((agent) => (
                                            <tr key={agent._id} className={selectedAgent?._id === agent._id ? "table-primary" : ""}>
                                                <td>{agent.legajo}</td>
                                                <td>{agent.apellido}, {agent.nombre}</td>
                                                <td className="text-end">
                                                    {/* BOTÓN PARA ABRIR KPIS */}
                                                    <button
                                                        className="btn btn-sm btn-info me-2 text-dark fw-semibold"
                                                        onClick={() => {
                                                            // REDIRECCIÓN INTELIGENTE: Nos vamos a la página de tareas y le enviamos los datos del agente en el 'state'
                                                            navigate("/load-tasks", { state: { agentFromCrud: agent } });
                                                        }}
                                                    >
                                                        📊 KPIs
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => { setIsEditing(true); setEditingId(agent._id); setFormData({ legajo: agent.legajo, nombre: agent.nombre, apellido: agent.apellido }) }}>✏️</button>
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteClick(agent._id, `${agent.nombre} ${agent.apellido}`)}>🗑️</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* RENDERIZADO CONDICIONAL DEL COMPONENTE HIJO DE KPIS */}
            {selectedAgent && (
                <AgentKpis
                    agent={selectedAgent}
                    onClose={() => setSelectedAgent(null)}
                />
            )}
        </div>
    );
};

export default Agents;