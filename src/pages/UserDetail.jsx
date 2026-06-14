import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { deleteUser, getUserById, updateUser } from "../services/api";
import { getErrorMessage } from "../utils/errors";
import { defaultPermissions, normalizeProfilePayload, roleOptions, validateUserForm } from "../utils/validation";

const emptyForm = {
  firebaseUid: "",
  name: "",
  lastName: "",
  email: "",
  role: "encargado",
  sector: "",
  permissions: defaultPermissions,
};

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshProfile, user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "administrador";
  const isOwnProfile = currentUser?._id === id;

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      setError("");
      setNotFound(false);
      try {
        const data = await getUserById(id);
        setForm({
          firebaseUid: data.firebaseUid || "",
          name: data.name || "",
          lastName: data.lastName || "",
          email: data.email || "",
          role: data.role || "encargado",
          sector: data.sector || "",
          permissions: { ...defaultPermissions, ...(data.permissions || {}) },
        });
      } catch (fetchError) {
        if (fetchError.status === 404) {
          setNotFound(true);
        }
        setError(getErrorMessage(fetchError, "Error al cargar el usuario."));
        if (fetchError.status === 403) {
          await refreshProfile().catch(() => null);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id]);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handlePermissionChange = (event) => {
    setForm({
      ...form,
      permissions: {
        ...form.permissions,
        [event.target.name]: event.target.checked,
      },
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!isAdmin && !isOwnProfile) {
      setError("No tienes permiso para editar este usuario.");
      return;
    }

    const validationError = validateUserForm(form, { isAdmin });
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const payload = normalizeProfilePayload(form, isAdmin);
      const data = await updateUser(id, payload);
      const updatedUser = data.data || data;
      setSuccess(data.message || "Usuario actualizado exitosamente.");

      if (updatedUser?._id === currentUser?._id) {
        await refreshProfile().catch(() => null);
      }
    } catch (submitError) {
      setError(getErrorMessage(submitError, "No se pudo actualizar el usuario."));
      if (submitError.status === 403) {
        await refreshProfile().catch(() => null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Seguro que quieres eliminar este usuario?");
    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await deleteUser(id);
      navigate("/users");
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "No se pudo eliminar el usuario."));
      if (deleteError.status === 403) {
        await refreshProfile().catch(() => null);
      }
    } finally {
      setLoading(false);
    }
  };

  if (notFound) {
    return (
      <section className="container mt-5">
        <div className="alert alert-warning">{error || "Usuario no encontrado."}</div>
        <button type="button" className="btn btn-secondary" onClick={() => navigate("/users")}>Volver</button>
      </section>
    );
  }

  return (
    <section className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h1 className="fw-bold">Detalle de usuario</h1>
          <p className="text-muted">
            {isAdmin ? "Puedes editar todos los campos del perfil local." : "Puedes editar solo tus datos personales."}
          </p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => navigate("/users")}>Volver</button>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      {loading && <div className="alert alert-info">Cargando...</div>}
      {!isAdmin && !isOwnProfile && (
        <div className="alert alert-warning">Puedes ver usuarios de tu sector, pero solo editar tu propio perfil.</div>
      )}
      <div className="card auth-card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {isAdmin && (
              <div className="mb-3">
                <label htmlFor="firebaseUid" className="form-label">UID de Firebase</label>
                <input id="firebaseUid" name="firebaseUid" type="text" className="form-control" value={form.firebaseUid} onChange={handleChange} disabled/>
              </div>
            )}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="name" className="form-label">Nombre</label>
                <input id="name" name="name" type="text" className="form-control" value={form.name} onChange={handleChange} disabled={!isAdmin && !isOwnProfile} />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="lastName" className="form-label">Apellido</label>
                <input id="lastName" name="lastName" type="text" className="form-control" value={form.lastName} onChange={handleChange} disabled={!isAdmin && !isOwnProfile} />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input id="email" name="email" type="email" className="form-control" value={form.email} onChange={handleChange} disabled={!isAdmin && !isOwnProfile} />
              </div>
              {isAdmin && (
                <>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="role" className="form-label">Rol</label>
                    <select id="role" name="role" className="form-select" value={form.role} onChange={handleChange}>
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="sector" className="form-label">Sector</label>
                    <input id="sector" name="sector" type="text" className="form-control" value={form.sector} onChange={handleChange} />
                  </div>
                </>
              )}
            </div>
            {isAdmin && (
              <fieldset className="mb-3">
                <legend className="form-label fs-6">Permisos</legend>
                {Object.keys(defaultPermissions).map((permission) => (
                  <div className="form-check" key={permission}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={permission}
                      name={permission}
                      checked={form.permissions[permission]}
                      onChange={handlePermissionChange}
                    />
                    <label className="form-check-label" htmlFor={permission}>{permission}</label>
                  </div>
                ))}
              </fieldset>
            )}
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-gerenciar-primary" disabled={loading || (!isAdmin && !isOwnProfile)}>
                {loading ? "Guardando..." : "Guardar cambios"}
              </button>
              {isAdmin && (
                <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={loading}>
                  Eliminar usuario
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default UserDetail;
