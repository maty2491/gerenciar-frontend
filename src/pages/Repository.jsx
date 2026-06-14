const Repository = () => {
  return (
    <>
      <div className="container py-4">
        <div className="mb-4">
          <h1 className="fw-bold text-gerenciar mb-1">
            <i className="bi bi-telephone-fill me-2"></i>
            Repositorio de contactos
          </h1>

          <p className="text-muted mb-0">
            Directorio de teléfonos y entidades de consulta frecuente.
          </p>

          <hr className="mt-3" />
        </div>
        <div className="card bg-secundario border-0 shadow">
          <div className="card-body">
            <div className="row mt-4">
              <div className="col-md-4 mb-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <h4 className="fw-bold text-gerenciar mb-3">
                      Universidad Nacional del Litoral
                    </h4>
                    <p className="mb-0 text-muted">
                      <i className="bi bi-telephone me-2"></i>
                      123-456-7890
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <h4 className="fw-bold text-gerenciar mb-3">
                      IES
                    </h4>
                    <p className="mb-0 text-muted">
                      <i className="bi bi-telephone me-2"></i>
                      123-456-7890
                    </p>
                  </div>
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <h4 className="fw-bold text-gerenciar mb-3">
                      Ministerio de Trabajo
                    </h4>
                    <p className="mb-0 text-muted">
                      <i className="bi bi-telephone me-2"></i>
                      123-456-7890
                    </p>
                  </div>
                </div>
              </div>              
            </div>

          </div>
        </div>

      </div>
    </>
  );
};

export default Repository;