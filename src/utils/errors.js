export function getErrorMessage(error, fallback = "No se pudo completar la accion.") {
  if (!error) {
    return fallback;
  }

  if (error.status === 401) {
    return "Tu sesion vencio o el token no es valido. Inicia sesion nuevamente.";
  }

  if (error.status === 403) {
    return error.message || "No tienes permisos para realizar esta accion.";
  }

  if (error.status === 404) {
    return error.message || "El recurso no fue encontrado.";
  }

  if (error.status === 500) {
    return "Error inesperado del servidor.";
  }

  return error.message || fallback;
}
