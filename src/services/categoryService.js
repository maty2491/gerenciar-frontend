// src/services/categoryService.js
import { auth as firebaseAuth } from "./firebase";

const BASE_URL = "http://localhost:3000/api/categories";

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

export const categoryService = {
  // Obtener categorías del sector o globales
  getAll: async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(BASE_URL, { method: "GET", headers });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Error al obtener categorías");
    }
    return response.json();
  },

  // Crear una nueva categoría con sus subtipos
  create: async (categoryData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(categoryData) // { name, subTypes: [], sector (opcional si es admin) }
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Error al crear categoría");
    }
    return response.json();
  },

  // Modificar (añadir o remover subtipos, cambiar nombre)
  update: async (id, categoryData) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(categoryData)
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Error al actualizar categoría");
    }
    return response.json();
  }
};