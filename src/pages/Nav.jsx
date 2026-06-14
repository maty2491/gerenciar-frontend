// src/components/Nav.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logG from "../assets/logo.png";

const Nav = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    // Cerramos el offcanvas si estuviera abierto en mobile antes de desloguear
    closeOffcanvas();
    await logout();
    navigate("/login");
  };

  const userName = user?.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : "";
  const greeting = userName ? `¡Hola, ${userName}!` : "¡Bienvenido!";
  const userRole = user?.role || "";

  // 1. Array base de links principales
  let mainLinks = [
    { label: "Tablero", to: "/", icon: "bi-grid-1x2-fill" },
    { label: "Calendario", to: "/calendar", icon: "bi-calendar-event-fill" },
    { label: "Entrevistas", to: "/interviews", icon: "bi-briefcase-fill" },
    { label: "Repositorio", to: "/repository", icon: "bi-folder-fill" },
    {
      label: "ONVIO",
      url: "https://auth.thomsonreuters.com/u/login/identifier?state=hKFo2SBkUTZCTXRfUmNCT3FzdjN2NThOVTRoOXhhU1k0TFBOQaFur3VuaXZlcnNhbC1sb2dpbqN0aWTZIHBmbUYxNzN2am1ETFRlS0xfSWtuQ1pxd3M5aUZJcUhpo2NpZNkgY3lHOUhFbmJTNkp0OUxSVnhZQ0REQTMySFp1UURLYzQ&ui_locales=es",
      icon: "bi-globe",
      external: true,
    },
  ];


  if (userRole === "encargado") {
    mainLinks = mainLinks.filter(link => link.label !== "ONVIO");
  }

  const actionLinks = [];

  // Filtros para enlaces de acciones según rol
  if (userRole === "administrador") {
    actionLinks.push({ label: "Usuarios", to: "/users", icon: "bi-people-fill" });
    actionLinks.push({ label: "Rendimientos", to: "/returns-tasks", icon: "bi-bar-chart-line-fill" });
  }

  if (userRole === "encargado") {
    actionLinks.push({ label: "Agentes", to: "/agents", icon: "bi-person-badge-fill" });
    actionLinks.push({ label: "Cargar Tareas", to: "/load-tasks", icon: "bi-graph-up-arrow" });
    actionLinks.push({ label: "Rendimientos", to: "/returns-tasks", icon: "bi-bar-chart-line-fill" });
  }

  // Cierra menu boostrap
  const closeOffcanvas = () => {
    const offcanvasElement = document.getElementById("sidebarOffcanvas");
    if (offcanvasElement) {
      // Obtenemos la instancia activa de Bootstrap asignada a ese ID y la cerramos
      const instance = window.bootstrap?.Offcanvas?.getInstance(offcanvasElement);
      instance?.hide();
    }
  };

  // Manejador del click para enlaces internos en modo mobile
  const handleMobileClick = (to) => {
    closeOffcanvas(); // Primero cerramos el panel de forma segura
    navigate(to);     // Cambiamos de ruta mediante el enrutador de React
  };

  // Función constructora de enlaces adaptada
  const visibleLinks = (links, isMobile = false) =>
    links.map((item, index) =>
      item.external ? (
        <a
          key={`ext-${index}-${item.url}`}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar-link"
          onClick={isMobile ? closeOffcanvas : undefined} // Cierra el menú al abrir la pestaña externa
        >
          <i className={`bi ${item.icon}`}></i>
          <span>{item.label}</span>
        </a>
      ) : isMobile ? (
        /* En mobile usamos un botón estilizado para disparar la redirección controlada por JS */
        <button
          key={`mob-${index}-${item.to}`}
          onClick={() => handleMobileClick(item.to)}
          className="sidebar-link btn-link-style"
        >
          <i className={`bi ${item.icon}`}></i>
          <span>{item.label}</span>
        </button>
      ) : (
        /* En desktop se mantiene el Link nativo de siempre */
        <Link
          key={`desk-${index}-${item.to}`}
          to={item.to}
          className="sidebar-link"
        >
          <i className={`bi ${item.icon}`}></i>
          <span>{item.label}</span>
        </Link>
      )
    );

  return (
    <nav className="app-sidebar bg-primario border-bottom border-md-end">
      {/* HEADER MOBILE */}
      <div className="d-flex d-md-none justify-content-between align-items-center px-3 py-2">

        <Link to="/" className="text-decoration-none">
          <img
            src={logG}
            alt="Gerenciar"
            height="42"
            className="rounded-3 p-1 shadow-sm"
          />
        </Link>

        <button
          className="btn mobile-menu-btn btn-sm"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#sidebarOffcanvas"
          aria-controls="sidebarOffcanvas"
        >
          <i className="bi bi-list fs-5"></i>
        </button>

      </div>

      {/* SIDEBAR DESKTOP */}
      <div className="d-none d-md-flex flex-column p-3 sticky-top" style={{ width: 250, minHeight: "100vh" }}>
        <div className="mb-5 mt-2 text-center">
          <Link
            className="h4 text-decoration-none text-white fw-bold"
            to="/"
          >
            <img
              src={logG}
              alt="Panel"
              className="img-fluid mb-3 p-2 rounded-3"
              width="50%"
            />
          </Link>

          <p className="mt-3 mb-1 fw-semibold text-white">
            {greeting}
          </p>

          <p className="small mb-0 text-white-50">
            {userRole} · {user?.sector}
          </p>
        </div>

        <div className="mb-4">
          <h6 className="sidebar-title mb-2">TAREAS:</h6>
          <div className="nav flex-column gap-2">{visibleLinks(mainLinks, false)}</div>
        </div>

        <div className="mb-4">
          <h6 className="sidebar-title mb-2">Acciones</h6>
          <div className="nav flex-column gap-2">{visibleLinks(actionLinks, false)}</div>
        </div>

        <div className="nav flex-column gap-2 mt-auto">
          <button
            className="btn sidebar-logout"
            onClick={handleLogout}
            disabled={loading}
          >
            {loading ? "Saliendo..." : "Cerrar sesión"}
          </button>
        </div>
      </div>

      {/* MENÚ OFF CANVAS MOBILE */}
      <div className="offcanvas offcanvas-start bg-primario text-primary" tabIndex="-1" id="sidebarOffcanvas" aria-labelledby="sidebarOffcanvasLabel">
        <div className="offcanvas-header">
          <div className="d-flex align-items-center">
            <img
              src={logG}
              alt="Gerenciar"
              height="40"
              className="me-2"
            />

            <span className="fw-bold text-white">
              GERENCIAR SRL
            </span>
          </div>
          <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          <div className="mb-4">
            <p className="h6 mb-1 text-white">{greeting}</p>
            <p className="small text-white-50 mb-0">{userRole} · {user?.sector}</p>
          </div>

          <div className="mb-3">
            <p className="sidebar-title mb-2">TAREAS:</p>
            <div className="d-flex flex-column gap-2">{visibleLinks(mainLinks, true)}</div>
          </div>

          <div className="mb-3">
            <p className="sidebar-title mb-2">ACCIONES:</p>
            <div className="d-flex flex-column gap-2">{visibleLinks(actionLinks, true)}</div>
          </div>

          <button className="btn sidebar-logout w-100 mt-3" onClick={handleLogout} disabled={loading}>
            {loading ? "Saliendo..." : "Cerrar sesión"}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Nav;