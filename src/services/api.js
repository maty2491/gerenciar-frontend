import { auth } from "./firebase";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/user` || "http://localhost:3000/api/user";

async function getFirebaseToken() {
  if (!auth?.currentUser) {
    const error = new Error("No hay una sesion activa.");
    error.status = 401;
    throw error;
  }

  return auth.currentUser.getIdToken();
}

async function request(path, options = {}, baseUrl = API_BASE_URL) {
  const { body, headers = {}, skipAuth = false, ...rest } = options;
  const finalHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (!skipAuth) {
    const token = await getFirebaseToken();
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  const responseData = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(responseData?.message || `Error ${response.status}`);
    error.status = response.status;
    error.details = responseData;
    throw error;
  }

  return responseData;
}

export async function getMe() {
  return request("/me", { method: "GET" });
}

export async function logoutUser() {
  return request("/logout", { method: "POST" });
}

export async function getUsers() {
  return request("", { method: "GET" });
}

export async function getUserById(id) {
  return request(`/${id}`, { method: "GET" });
}

export async function createUser(payload) {
  return request("", {
    method: "POST",
    body: payload,
  });
}

export async function updateUser(id, payload) {
  return request(`/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export async function deleteUser(id) {
  return request(`/${id}`, { method: "DELETE" });
}

