import { auth as firebaseAuth } from "./firebase";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/agents`;

// 1. Declaración limpia e independiente (Cualquier función del archivo puede verla)
const getAuthHeaders = async () => {
    if (!firebaseAuth) {
        throw new Error("La configuración de Firebase no está inicializada correctamente.");
    }
    const currentUser = firebaseAuth.currentUser;
    if (!currentUser) throw new Error("No hay usuario autenticado en Firebase");

    const token = await currentUser.getIdToken();
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
};

// 2. Exportación de los servicios
export const agentService = {
    // Obtener agentes (filtrados por sector automáticamente en backend)
    getAll: async () => {
        const headers = await getAuthHeaders();
        const response = await fetch(BASE_URL, { method: "GET", headers });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || "Error al obtener agentes");
        }
        return response.json();
    },

    // Obtener agentes por encargado (Para el Administrador)
    getByManager: async (managerId) => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${BASE_URL}/by-manager/${managerId}`, { method: "GET", headers });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || "Error al obtener agentes del encargado");
        }
        return response.json();
    },

    // Crear un nuevo agente
    create: async (agentData) => {
        const headers = await getAuthHeaders();
        const response = await fetch(BASE_URL, {
            method: "POST",
            headers,
            body: JSON.stringify(agentData)
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || "Error al crear agente");
        }
        return response.json();
    },

    // Actualizar agente
    update: async (id, agentData) => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify(agentData)
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || "Error al actualizar agente");
        }
        return response.json();
    },

    // Eliminar agente
    delete: async (id) => {
        const headers = await getAuthHeaders();
        const response = await fetch(`${BASE_URL}/${id}`, {
            method: "DELETE",
            headers
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || "Error al eliminar agente");
        }
        return response.json();
    }
};