import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../services/firebase.js";
import { getIdToken } from "firebase/auth";
import { storage } from "../services/firebase.js";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const FormInterviews = ({ onSaveSuccess }) => {
    const navigate = useNavigate();

    // Estado inicial limpio para poder reutilizarlo al resetear
    const initialFormState = {
        candidateName: "",
        dni: "",
        fechaNacimiento: "",
        telefono: "",
        domicilio: "",
        email: "",
        puesto: "",
        fechaEntrevista: "",
        entrevistador: "",
        resumen: "",
        resultado: "",
        rating: ""
    };

    const [formData, setFormData] = useState(initialFormState);
    const [cvFile, setCvFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { id, name, value } = e.target;
        const fieldName = id || name;
        setFormData({ ...formData, [fieldName]: value });
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setCvFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                alert("No estás autenticado o tu sesión expiró. Volvé a iniciar sesión.");
                setLoading(false);
                return;
            }

            let downloadUrl = "";

            // 1️⃣ SUBIMOS EL PDF A FIREBASE STORAGE
            if (cvFile) {
                const fileRef = ref(storage, `cvs/${Date.now()}_${cvFile.name}`);
                const snapshot = await uploadBytes(fileRef, cvFile);
                downloadUrl = await getDownloadURL(snapshot.ref);
            }

            // 2️⃣ ARMAMOS EL OBJETO FINAL
            const finalData = {
                ...formData,
                cvUrl: downloadUrl
            };

            /* MENSAJE PARA PROBAR EL VIAJE DEL RATING */

            console.log("✈️ Datos que se van a enviar al Backend:", finalData);

            const token = await getIdToken(currentUser, true);

            // 3️⃣ ENVIAMOS A MONGODB
            const response = await fetch("http://localhost:3000/api/interviews", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(finalData)
            });

            if (response.ok) {
                alert("¡Entrevista guardada en MongoDB con éxito!");
                // 🛠️ BORRAMOS TODO LO CARGADO EN EL FORMULARIO
                setFormData(initialFormState);
                setCvFile(null);
                document.getElementById("formFile").value = ""; // Limpia el input file visualmente
                if (onSaveSuccess) {
                    onSaveSuccess();
                }
                // Redirige al listado de entrevistas
                navigate("/interviews");
            } else {
                const errorData = await response.json();
                alert(`Error del servidor: ${errorData.message}`);
            }

        } catch (error) {
            console.error("🚨 Error en el proceso de guardado:", error);
            alert("Ocurrió un error al procesar la solicitud.");
        } finally {
            setLoading(false);
        }
    };

    const handleRatingChange = (value) => {
        setFormData({ ...formData, rating: value });
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-white border-0 pb-0">
                    <h3 className="fw-bold text-gerenciar mb-1">
                        <i className="bi bi-person-vcard me-2"></i>
                        Registrar nueva entrevista
                    </h3>

                    <p className="text-muted mb-0">
                        Gestión y evaluación de candidatos.
                    </p>

                    <hr />
                </div>

                <div className="card-body">
                    <h5 className="fw-bold text-gerenciar mb-3">
                        <i className="bi bi-person me-2"></i>
                        Datos Personales
                    </h5>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="candidateName" className="form-label fw-bold text-gerenciar small">Nombre del candidato</label>
                            <input type="text" className="form-control" id="candidateName" value={formData.candidateName} onChange={handleChange} required />
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="dni" className="form-label fw-bold text-gerenciar small">DNI</label>
                            <input type="text" className="form-control" id="dni" value={formData.dni} onChange={handleChange} />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label htmlFor="fechaNacimiento" className="form-label fw-bold text-gerenciar small">Fecha de nacimiento</label>
                            <input type="date" className="form-control" id="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label htmlFor="telefono" className="form-label fw-bold text-gerenciar small">Teléfono de contacto</label>
                            <input type="text" className="form-control" id="telefono" value={formData.telefono} onChange={handleChange} placeholder="Ingrese el teléfono de contacto" />
                        </div>

                        <div className="col-12 mb-3">
                            <label htmlFor="domicilio" className="form-label fw-bold text-gerenciar small">Domicilio o barrio de residencia</label>
                            <input type="text" className="form-control" id="domicilio" value={formData.domicilio} onChange={handleChange} placeholder="Ingrese el domicilio o barrio de residencia" />
                        </div>

                        <div className="col-12 mb-4">
                            <label htmlFor="email" className="form-label fw-bold text-gerenciar small">Correo electrónico</label>
                            <input type="email" className="form-control" id="email" value={formData.email} onChange={handleChange} placeholder="Ingrese el correo electrónico" />
                        </div>
                    </div>

                    <hr className="my-4" />

                    <h5 className="fw-bold text-gerenciar mb-3 mt-4">
                        <i className="bi bi-calendar-check me-2"></i>
                        Información de la Entrevista
                    </h5>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="puesto" className="form-label fw-bold text-gerenciar small">Puesto al que se postula</label>
                            <select className="form-select" id="puesto" value={formData.puesto} onChange={handleChange} required>
                                <option value="">Seleccione un puesto</option>
                                <option value="Administrativo">Administrativo</option>
                                <option value="Atención al cliente (Call Center)">Atención al cliente (Call Center)</option>
                                <option value="Técnico de Mantenimiento">Técnico de Mantenimiento</option>
                                <option value="Marketing Digital">Marketing Digital</option>
                                <option value="Gerente/Jefe de Área">Gerente/Jefe de Área</option>
                                <option value="Otro (Especificar en resumen)">Otro (Especificar en resumen)</option>
                            </select>
                        </div>

                        <div className="col-md-6 mb-3">
                            <label htmlFor="fechaEntrevista" className="form-label fw-bold text-gerenciar small">Fecha de la entrevista</label>
                            <input type="date" className="form-control" id="fechaEntrevista" value={formData.fechaEntrevista} onChange={handleChange} required />
                        </div>

                        <div className="col-md-6 mb-4">
                            <label htmlFor="entrevistador" className="form-label fw-bold text-gerenciar small">Entrevistador (RRHH)</label>
                            <select className="form-select" id="entrevistador" value={formData.entrevistador} onChange={handleChange} required>
                                <option value="">Seleccione un entrevistador</option>
                                <option value="Leonardo Biaggini">Leonardo Biaggini</option>
                            </select>
                        </div>
                    </div>

                    <hr className="my-4" />

                    <h5 className="fw-bold text-gerenciar mb-3 mt-4">
                        <i className="bi bi-file-earmark-text me-2"></i>
                        Evaluación y Archivos
                    </h5>
                    <div className="row">
                        <div className="col-12 mb-4">
                            <div className="card bg-light border-0">
                                <div className="card-body">
                                    <label
                                        htmlFor="formFile"
                                        className="form-label fw-bold text-gerenciar mb-2"
                                    >
                                        <i className="bi bi-file-earmark-pdf me-2"></i>
                                        Curriculum Vitae (PDF)
                                    </label>

                                    <input
                                        className="form-control"
                                        type="file"
                                        id="formFile"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                    />

                                    <small className="text-muted d-block mt-2">
                                        Adjunte el CV actualizado del candidato en formato PDF.
                                    </small>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 mb-3">
                            <label htmlFor="resumen" className="form-label fw-bold text-gerenciar small">Resumen de la entrevista</label>
                            <textarea className="form-control" id="resumen" rows="4" placeholder="Ingrese un resumen de la entrevista" value={formData.resumen} onChange={handleChange}></textarea>
                        </div>

                        <div className="col-md-6 mb-3">
                            <label htmlFor="resultado" className="form-label fw-bold text-gerenciar small">Estado o Recomendación final</label>
                            <select className="form-control" id="resultado" value={formData.resultado} onChange={handleChange} required>
                                <option value="">Seleccione un resultado</option>
                                <option value="Avanza a 2da instancia / Entrevista con Gerencia">Avanza a 2da instancia / Entrevista con Gerencia</option>
                                <option value="Contratación directa sugerida">Contratación directa sugerida</option>
                                <option value="Rechazado (No apto para el puesto)">Rechazado (No apto para el puesto)</option>
                                <option value="Queda en base de datos">Queda en base de datos</option>
                                <option value="Pendiente de revisión interna">Pendiente de revisión interna</option>
                            </select>
                        </div>

                        <div className="col-md-6 mb-3">
                            <label className="form-label fw-bold text-gerenciar small">
                                <small className="text-muted">
                                    Valoración general del perfil para el puesto.
                                </small>
                            </label>

                            <div className="d-flex align-items-center gap-2">
                                <div className="star-rating">
                                    <input type="radio" id="star5" name="rating" value="5" checked={formData.rating === "5"} onChange={() => { }} />
                                    <label htmlFor="star5" title="5 estrellas" onClick={() => handleRatingChange("5")}>★</label>

                                    <input type="radio" id="star4" name="rating" value="4" checked={formData.rating === "4"} onChange={() => { }} />
                                    <label htmlFor="star4" title="4 estrellas" onClick={() => handleRatingChange("4")}>★</label>

                                    <input type="radio" id="star3" name="rating" value="3" checked={formData.rating === "3"} onChange={() => { }} />
                                    <label htmlFor="star3" title="3 estrellas" onClick={() => handleRatingChange("3")}>★</label>

                                    <input type="radio" id="star2" name="rating" value="2" checked={formData.rating === "2"} onChange={() => { }} />
                                    <label htmlFor="star2" title="2 estrellas" onClick={() => handleRatingChange("2")}>★</label>

                                    <input type="radio" id="star1" name="rating" value="1" checked={formData.rating === "1"} onChange={() => { }} />
                                    <label htmlFor="star1" title="1 estrella" onClick={() => handleRatingChange("1")}>★</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-footer bg-white border-0 pt-0">
                    <div className="d-flex justify-content-end">

                        <button
                            type="submit"
                            className="btn btn-gerenciar-primary px-4"
                            disabled={loading}
                        >
                            <i className="bi bi-check-circle me-2"></i>

                            {loading
                                ? "Guardando..."
                                : "Programar entrevista"}
                        </button>
                    </div>
                </div>
            </form>
        </>
    );
};

export default FormInterviews;