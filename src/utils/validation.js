export const roleOptions = ["encargado", "administrador"];

export const defaultPermissions = {
  canCreateTasks: true,
  canDeleteTasks: false,
  canAssignRoles: false,
};

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validateRequiredText(value, min = 2, max = 60) {
  const trimmed = value.trim();
  return trimmed.length >= min && trimmed.length <= max;
}

export function validateSector(value) {
  return /^[a-z0-9_]+$/.test(value.trim());
}

export function normalizeProfilePayload(form, isAdmin = false) {
  const basePayload = {
    name: form.name.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim().toLowerCase(),
  };

  if (!isAdmin) {
    return basePayload;
  }

  return {
    ...basePayload,
    firebaseUid: form.firebaseUid.trim(),
    role: form.role,
    sector: form.sector.trim().toLowerCase(),
    permissions: {
      canCreateTasks: Boolean(form.permissions.canCreateTasks),
      canDeleteTasks: Boolean(form.permissions.canDeleteTasks),
      canAssignRoles: Boolean(form.permissions.canAssignRoles),
    },
  };
}

export function validateUserForm(form, { isAdmin = false, creating = false } = {}) {
  if (creating && !validateRequiredText(form.firebaseUid, 6, 128)) {
    return "El UID de Firebase es obligatorio y debe tener entre 6 y 128 caracteres.";
  }

  if (!validateRequiredText(form.name)) {
    return "El nombre debe tener entre 2 y 60 caracteres.";
  }

  if (!validateRequiredText(form.lastName)) {
    return "El apellido debe tener entre 2 y 60 caracteres.";
  }

  if (!validateEmail(form.email)) {
    return "Ingrese un email valido.";
  }

  if (isAdmin) {
    if (!roleOptions.includes(form.role)) {
      return "Rol invalido.";
    }

    if (!validateSector(form.sector)) {
      return "El sector es obligatorio y solo puede usar minusculas, numeros y guion bajo.";
    }
  }

  return "";
}
