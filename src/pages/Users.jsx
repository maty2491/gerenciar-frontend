import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { deleteUser, getUsers } from "../services/api";
import { getErrorMessage } from "../utils/errors";

const Users = () => {
  const { refreshProfile, user } = useAuth();
  const isAdmin = user?.role === "administrador";
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ role: "", sector: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      setError(getErrorMessage(fetchError, "Error al cargar usuarios."));
      if (fetchError.status === 403) {
        await refreshProfile().catch(() => null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const sectors = useMemo(
    () => [...new Set(users.map((item) => item.sector).filter(Boolean))].sort(),
    [users]
  );

  const visibleUsers = useMemo(() => {
    return users.filter((item) => {
      const matchesRole = !filters.role || item.role === filters.role;
      const matchesSector = !filters.sector || item.sector === filters.sector;
      return matchesRole && matchesSector;
    });
  }, [filters, users]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Seguro que quieres eliminar este usuario?");
    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await deleteUser(id);
      setSuccess(data.message || "Usuario eliminado exitosamente.");
      setUsers((current) => current.filter((item) => item._id !== id));
    } catch (deleteError) {
      setError(getErrorMessage(deleteError, "No se pudo eliminar el usuario."));
      if (deleteError.status === 403) {
        await refreshProfile().catch(() => null);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container mt-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
          <h1 className="fw-bold text-gerenciar mb-1">
            <i className="bi bi-people-fill me-2"></i>
            Gestión de Usuarios
          </h1>

          <p className="text-muted mb-0">
            {isAdmin
              ? "Administra usuarios, roles y sectores."
              : `Usuarios del sector ${user?.sector || ""}.`}
          </p>
        </div>

        {isAdmin && (
          <Link className="btn btn-gerenciar-primary mt-3 mt-md-0" to="/register">
            <i className="bi bi-person-plus-fill me-2"></i>
            Crear usuario
          </Link>
        )}
      </div>

      {isAdmin && users.length > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h6 className="fw-bold text-gerenciar mb-3">
              <i className="bi bi-funnel-fill me-2"></i>
              Filtros
            </h6>
            <div className="row mb-3">
              <div className="col-md-4 mb-2">
                <label htmlFor="roleFilter" className="form-label fw-bold text-gerenciar small">Filtrar por rol</label>
                <select
                  id="roleFilter"
                  className="form-select"
                  value={filters.role}
                  onChange={(event) => setFilters({ ...filters, role: event.target.value })}
                >
                  <option value="">Todos</option>
                  <option value="administrador">administrador</option>
                  <option value="encargado">encargado</option>
                </select>
              </div>
              <div className="col-md-4 mb-2">
                <label htmlFor="sectorFilter" className="form-label fw-bold text-gerenciar small">Filtrar por sector</label>
                <select
                  id="sectorFilter"
                  className="form-select"
                  value={filters.sector}
                  onChange={(event) => setFilters({ ...filters, sector: event.target.value })}
                >
                  <option value="">Todos</option>
                  {sectors.map((sector) => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && <div className="alert alert-danger border-0 shadow-sm">{error}</div>}
      {success && <div className="alert alert-success border-0 shadow-sm">{success}</div>}
      {loading && <div className="alert alert-info border-0 shadow-sm">Cargando usuarios...</div>}

      {!loading && visibleUsers.length === 0 && (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <i className="bi bi-people text-muted fs-1"></i>

            <p className="text-muted mt-3 mb-0">
              No hay usuarios para mostrar.
            </p>
          </div>
        </div>
      )}

      {!loading && visibleUsers.length > 0 && (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-header-gerenciar">
                <tr>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Sector</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((item) => (
                  <tr key={item._id}>
                    <td>{item.name}</td>
                    <td>{item.lastName}</td>
                    <td>{item.email}</td>
                    <td>
                      <span
                        className={`badge ${item.role === "administrador"
                          ? "bg-danger"
                          : "bg-primary"
                          }`}
                      >
                        {item.role}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-primario">
                        {item.sector}
                      </span>
                    </td>
                    <td>
                      <Link className="btn btn-sm btn-gerenciar-primary me-2" to={`/users/${item._id}`}>
                        <i className="bi bi-pencil-square"></i>
                      </Link>
                      {isAdmin && (
                        <button className="btn btn-sm btn-gerenciar-secondary" onClick={() => handleDelete(item._id)} disabled={loading}>
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};

export default Users;
