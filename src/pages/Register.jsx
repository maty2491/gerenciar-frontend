import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { createUser } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { defaultPermissions, normalizeProfilePayload, roleOptions, validateUserForm } from "../utils/validation";
import { getErrorMessage } from "../utils/errors";

const emptyForm = {
  firebaseUid: "",
  name: "",
  lastName: "",
  email: "",
  role: "encargado",
  sector: "",
  permissions: defaultPermissions,
};

const Register = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "administrador";
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  if (!isAdmin) {
    return <Navigate to="/users" replace />;
  }

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

    const validationError = validateUserForm(form, { isAdmin: true, creating: true });
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const payload = normalizeProfilePayload(form, true);
      const data = await createUser(payload);
      setSuccess(data.message || "Usuario creado exitosamente.");
      setForm(emptyForm);
      setTimeout(() => navigate("/users"), 900);
    } catch (submissionError) {
      setError(getErrorMessage(submissionError, "No se pudo crear el usuario."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container mt-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <h1 className="fw-bold text-gerenciar mb-1">
            <i className="bi bi-person-plus-fill me-2"></i>
            Crear perfil local
          </h1>
          <p className="text-muted mb-0">
            Registrar un usuario existente en Firebase dentro del sistema Gerenciar.
          </p>
        </div>

        <Link to="/users" className="btn btn-gerenciar-outline mt-3 mt-md-0">
          <i className="bi bi-arrow-left me-2"></i>
          Volver
        </Link>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-primario">
          <h5 className="mb-0 text-white bg-primario">
            <i className="bi bi-person-vcard me-2"></i>
            Información del usuario
          </h5>
        </div>
        <div className="card-body p-4">
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="row">

              <div className="col-md-6 mb-3">
                <label htmlFor="email" className="form-label fw-bold text-gerenciar small">Email</label>
                <input id="email" name="email" type="email" className="form-control" value={form.email} onChange={handleChange} />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="name" className="form-label fw-bold text-gerenciar small">Nombre</label>
                <input id="name" name="name" type="text" className="form-control" value={form.name} onChange={handleChange} />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="lastName" className="form-label form-label fw-bold text-gerenciar small">Apellido</label>
                <input id="lastName" name="lastName" type="text" className="form-control" value={form.lastName} onChange={handleChange} />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="role" className="form-label fw-bold text-gerenciar small">Rol</label>
                <select id="role" name="role" className="form-select" value={form.role} onChange={handleChange}>
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <select
                  id="sector"
                  name="sector"
                  className="form-select"
                  value={form.sector}
                  onChange={handleChange}
                >
                  <option value="">Seleccione un sector</option>
                  <option value="Cordoba">Córdoba</option>
                  <option value="Rosario">Rosario</option>
                  <option value="Santa Fe">Santa Fe</option>
                </select>
              </div>
            </div>
            <fieldset className="mb-3">
              <legend className="form-label fs-6">Permisos</legend>
              <div className="row">
                {Object.keys(defaultPermissions).map((permission) => (
                  <div className="col-md-6 mb-2" key={permission}>
                    <div className="form-check">
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
                  </div>
                ))}
              </div>
            </fieldset>
            <div className="border-top pt-3 mt-4 d-flex justify-content-end">
              <button
                type="submit"
                className="btn btn-gerenciar-primary"
                disabled={loading}
              >
                <i className="bi bi-person-check-fill me-2"></i>
                {loading ? "Creando..." : "Crear usuario"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Register;
