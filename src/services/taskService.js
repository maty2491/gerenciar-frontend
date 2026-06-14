import { auth as firebaseAuth } from "./firebase";

const BASE_URL = "http://localhost:3000/api/tasks";

const getAuthHeaders = async () => {
  if (!firebaseAuth) throw new Error("Firebase no inicializado.");
  const currentUser = firebaseAuth.currentUser;
  if (!currentUser) throw new Error("Usuario no autenticado.");
  const token = await currentUser.getIdToken();
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
};

export const taskService = {
  // Guardar una tarea/KPI realizado por el agente
  record: async (taskData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/record`, {
      method: "POST",
      headers,
      body: JSON.stringify(taskData) // { agentId, category, subType, quantity, note }
    });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || "Error al registrar la tarea");
    }
    return response.json();
  },

  // Obtener el historial de KPIs de un agente específico
  getHistory: async (agentId) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/history/${agentId}`, { method: "GET", headers });
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || "Error al obtener historial");
    }
    return response.json();
  },
  getAnalytics: async (agentIdsArray, period) => {
    const headers = await getAuthHeaders();
    const agentsParam = agentIdsArray.join(",");

    const response = await fetch(`${BASE_URL}/analytics?agents=${agentsParam}&period=${period}`, {
      method: "GET",
      headers
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.message || "Error al obtener las analíticas grupales");
    }
    return response.json();
  }
};