import { useState, useEffect } from "react";
import Codigodebarras from "./Codigodebarras";
import { ComplementServices } from '../../services/complementService';
import { OficiosService } from '../../services/oficiosService';
import ShowToast from '../ui/ShowToast';

function CrearOficio() {
  const [formData, setFormData] = useState({
    numeroOficio: "",
    fechaHora: "",
    fiscalia: "",
    regionSolicitante: "",
    implicado: "",
    dniImplicado: "",
    fiscal_remitente: "",
    tipo_examen: "",
    id_tipo_examen: "",
    muestra: "",
    id_especialidad: "",
    nombre_especialidad: "",
    id_usuario_perito: "",
    nombre_perito: "",
    cip_perito: "",
    estado: "CREACIÓN DE OFICIO",
    id_prioridad: "",
    tipo_de_muestra: "",
    asunto: ""
  });

  const [codigo, setCodigo] = useState("");
  const [closeModal, setCloseModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [especialidades, setEspecialidades] = useState([]);
  const [prioridades, setPrioridades] = useState([]);
  const [peritos, setPeritos] = useState([]);
  const [tiposExamen, setTiposExamen] = useState([]);
  const [tipoExamenDescripcion, setTipoExamenDescripcion] = useState("");
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("formDataCodigodeBarras");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        console.log(e);
        localStorage.removeItem("formDataCodigodeBarras");
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("formDataCodigodeBarras", JSON.stringify(formData));
    }
  }, [formData, isInitialized]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const especialidadesRes = await ComplementServices.getTiposDepartamento();
        const prioridadesRes = await ComplementServices.getAllPriorities();
        setPrioridades(Array.isArray(prioridadesRes?.data) ? prioridadesRes.data : []);
        setEspecialidades(Array.isArray(especialidadesRes?.data) ? especialidadesRes.data : []);
      } catch (error) {
        console.log(error);
      }
    };
    loadData();
  }, []);

  const handleChange = (eOrName, maybeValue) => {
    if (typeof eOrName === "string") {
      setFormData((prev) => ({ ...prev, [eOrName]: maybeValue }));
    } else if (eOrName && eOrName.target) {
      const { name, value } = eOrName.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddPeritosAccordingToSpecialty = async (id_especialidad) => {
    try {
      if (!id_especialidad) {
        setPeritos([]);
        setTiposExamen([]);
        setTipoExamenDescripcion("");
        return;
      }

      // cargar peritos
      const resp = await ComplementServices.getAllPeritoAccordingToSpecialty(id_especialidad);
      const payload = resp?.data ?? resp;
      let items;
      if (payload && typeof payload === 'object' && 'success' in payload && payload.success) {
        items = payload.data;
      } else {
        items = payload;
      }
      if (Array.isArray(items)) {
        setPeritos(items);
      } else if (items && typeof items === 'object') {
        setPeritos([items]);
      } else {
        setPeritos([]);
      }

      // cargar tipos de examen por departamento
      try {
        const tiposResp = await (ComplementServices.getTiposByDepartamento
          ? ComplementServices.getTiposByDepartamento(id_especialidad)
          : ComplementServices.getTiposByDepartamento?.call(ComplementServices, id_especialidad));
        const tiposData = tiposResp?.data ?? tiposResp;
        if (Array.isArray(tiposData)) {
          setTiposExamen(tiposData);
        } else {
          setTiposExamen([]);
        }
        setTipoExamenDescripcion("");
        setFormData((prev) => ({ ...prev, tipoExamen: "" }));
      } catch (err) {
        console.error("Error cargando tipos de examen:", err);
        setTiposExamen([]);
        setTipoExamenDescripcion("");
      }
    } catch (err) {
      console.error('Error cargando peritos por especialidad:', err);
      setPeritos([]);
    }
  };

  const generarCodigo = async () => {
    // validar que haya número de oficio
    if (!formData.numeroOficio || String(formData.numeroOficio).trim() === "") {
      setFeedback("El número de oficio es obligatorio");
      return;
    }

    try {

      const resp = await OficiosService.checkNumero(formData.numeroOficio);
      if (!resp || !resp.success) {
        setFeedback(resp?.message || "No se pudo verificar número de oficio");
        return;
      }
      if (resp.exists) {
        setFeedback(`Ya existe un oficio con el número ${formData.numeroOficio}`);
        return;
      }

      const nuevoCodigo = `${formData.numeroOficio || Date.now()}`;
      setCodigo(nuevoCodigo);
      setCloseModal(true);
      setFeedback(null);
    } catch (err) {
      console.error(err);
      setFeedback(err?.message || "Error verificando número de oficio");
    }
  };

  const limpiarFormulario = () => {
    const initial = {
      numeroOficio: "",
      fechaHora: "",
      fiscalia: "",
      regionSolicitante: "",
      implicado: "",
      dniImplicado: "",
      fiscal_remitente: "",
      tipoExamen: "",
      muestra: "",
      especialidad: "",
      id_tipo_departamento: "",
      id_usuario: "",
      estado: "CREACIÓN DE OFICIO",
      prioridad: "",
      tipo_de_muestra: "",
      asunto: ""
    };
    setFormData(initial);
    localStorage.removeItem("formDataCodigodeBarras");
    setCodigo("");
    setPeritos([]);
    setTiposExamen([]);
    setTipoExamenDescripcion("");
  };

  // tipo de muestra
  const handleTipoDeMuestra = (tipo) => {
    setFormData((prev) => ({ ...prev, tipo_de_muestra: prev.tipo_de_muestra === tipo ? "" : tipo }));
  };

  const muestraLabel = () => {
    if (formData.tipo_de_muestra === "toma") return "MUESTRA A EXTRAER";
    if (formData.tipo_de_muestra === "remitidas") return "MUESTRA REMITIDA";
    return "MUESTRA REMITIDA / A EXTRAER";
  };

  const isImpDniRequired = formData.tipo_de_muestra === "toma";

  const handlePeritosChange = (e) => {
    const peritoId = e.target.value;
    const peritoSeleccionado = peritos.find(p => p.id_usuario === Number(peritoId));
    
    if (peritoSeleccionado) {
      setFormData(prev => ({
        ...prev,
        id_usuario_perito: peritoSeleccionado.id_usuario,
        nombre_perito: peritoSeleccionado.nombre_completo,
        cip_perito: peritoSeleccionado.CIP
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        id_usuario_perito: "",
        nombre_perito: "",
        cip_perito: ""
      }));
    }
  };

  const handleEspecialidadChange = async (e) => {
    const id = e.target.value;
    const especialidadSeleccionada = especialidades.find(
      esp => esp.id_tipo_departamento === Number(id)
    );

    setFormData(prev => ({
      ...prev,
      id_especialidad: id,
      nombre_especialidad: especialidadSeleccionada?.nombre_departamento || "",
      id_usuario_perito: "",
      nombre_perito: "",
      cip_perito: "",
      tipo_examen: "",
      id_tipo_examen: ""
    }));

    if (id) {
      await handleAddPeritosAccordingToSpecialty(id);
    } else {
      setPeritos([]);
    }
  };

  const handleTipoExamenChange = (e) => {
    const examenId = e.target.value;
    const examenSeleccionado = tiposExamen.find(
      t => t.id_tipo_de_examen === Number(examenId)
    );

    setFormData(prev => ({
      ...prev,
      id_tipo_examen: examenId,
      tipo_examen: examenSeleccionado?.nombre || ""
    }));

    if (examenSeleccionado) {
      setTipoExamenDescripcion(examenSeleccionado.descripcion || "");
    } else {
      setTipoExamenDescripcion("");
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-md w-full mx-auto">
      {/* mostrar errores*/}
      {feedback && (
        <div className="w-full max-w-4xl mb-4">
          <ShowToast
            type={Array.isArray(feedback) ? "error" : (String(feedback).toLowerCase().includes('exitos') ? "success" : "error")}
            message={feedback}
            onClose={() => setFeedback(null)}
          />
        </div>
      )}

      <h2 className="text-xl font-semibold mb-6 text-gray-700 dark:text-gray-100 text-center">
        Formulario de Generación del Oficio y Código de Barras
      </h2>

      <div className="w-full">
        <h3 className="text-lg font-semibold text-[#1a4d2e] dark:text-green-400 mb-4 border-b pb-2 dark:border-gray-700">
          Información de Encabezado
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Número de oficio:</label>
          <input
            type="text"
            name="numeroOficio"
            value={formData.numeroOficio}
            onChange={handleChange}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Unidad solicitante:</label>
          <input
            type="text"
            name="fiscalia"
            value={formData.fiscalia}
            onChange={handleChange}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Remitente:</label>
          <input
            type="text"
            name="fiscal_remitente"
            value={formData.fiscal_remitente}
            onChange={handleChange}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Región de la fiscalía:</label>
          <input
            type="text"
            name="regionSolicitante"
            value={formData.regionSolicitante}
            onChange={handleChange}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
          />
        </div>
      </div>

      <div className="w-full pt-2">
        <h3 className="text-lg font-semibold text-[#1a4d2e] dark:text-green-400 mb-4 border-b pb-2 dark:border-gray-700">
          Información general del implicado
        </h3>
      </div>

      {/* Tipo de muestra: opciones excluyentes */}
      <div className="flex gap-4 items-center w-full mb-3">
        <p className="text-sm text-gray-500 dark:text-gray-300 ml-2">Seleccione uno:</p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleTipoDeMuestra('remitidas')}
            className={`px-4 py-2 rounded-lg border ${
              formData.tipo_de_muestra === 'remitidas'
                ? 'bg-[#1a4d2e] text-white border-transparent'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'
            }`}
          >
            MUESTRAS REMITIDAS
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleTipoDeMuestra('toma')}
            className={`px-4 py-2 rounded-lg border ${
              formData.tipo_de_muestra === 'toma'
                ? 'bg-[#1a4d2e] text-white border-transparent'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'
            }`}
          >
            TOMA DE MUESTRAS
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Examinado/Incriminado {isImpDniRequired && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            name="implicado"
            value={formData.implicado}
            onChange={handleChange}
            className="border p-2 rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white"
            required={isImpDniRequired}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
            DNI del Examinado/Incriminado: {isImpDniRequired && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            name="dniImplicado"
            value={formData.dniImplicado}
            onChange={handleChange}
            className="border p-2 rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white"
            required={isImpDniRequired}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Fecha y hora del incidente:</label>
          <input
            type="text"
            name="fechaHora"
            value={formData.fechaHora}
            onChange={handleChange}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white p-2 rounded-lg"
          />
        </div>
      </div>

      <div className="w-full pt-2">
        <h3 className="text-lg font-semibold text-[#1a4d2e] dark:text-green-400 mb-4 border-b pb-2 dark:border-gray-700">
          Información para derivar documento
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <div className="flex flex-col">
          <label htmlFor="id_especialidad" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Especialidad requerida:
          </label>
          <select
            id="id_especialidad"
            name="id_especialidad"
            value={formData.id_especialidad}
            onChange={handleEspecialidadChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
          >
            <option value="">Seleccione la especialidad</option>
            {especialidades.map((esp) => (
              <option key={esp.id_tipo_departamento} value={esp.id_tipo_departamento}>
                {esp.nombre_departamento}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Tipo de examen:</label>
          <select
            id="id_tipo_examen"
            name="id_tipo_examen"
            value={formData.id_tipo_examen}
            onChange={handleTipoExamenChange}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white p-2 rounded-lg"
          >
            <option value="">Seleccione el tipo de examen</option>
            {tiposExamen.map((examen) => (
              <option key={examen.id_tipo_de_examen} value={examen.id_tipo_de_examen}>
                {examen.nombre}
              </option>
            ))}
          </select>

          {/* descripción del tipo de examen */}
          {tipoExamenDescripcion ? (
            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-600">
              {tipoExamenDescripcion}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">{muestraLabel()}:</label>
          <input
            type="text"
            name="muestra"
            value={formData.muestra}
            onChange={handleChange}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white p-2 rounded-lg"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Asignar a perito:</label>
          <select
            id="id_usuario_perito"
            name="id_usuario_perito"
            value={formData.id_usuario_perito}
            onChange={handlePeritosChange}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white p-2 rounded-lg"
          >
            <option value="">Seleccione un perito</option>
            {peritos.map((perito) => (
              <option key={perito.id_usuario} value={perito.id_usuario}>
                {perito.nombre_completo} - CIP: {perito.CIP}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Prioridad:</label>
          <select
            id="id_prioridad"
            name="id_prioridad"
            value={formData.id_prioridad}
            onChange={(e) => { handleChange('id_prioridad', e.target.value); }}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white p-2 rounded-lg"
          >
            <option value="">Seleccione la prioridad</option>
            {prioridades.map((prioridad) => (
              <option key={prioridad.id_prioridad} value={prioridad.id_prioridad}>
                {prioridad.nombre_prioridad}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Estado del oficio:</label>
          <input
            type="text"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            disabled
            className="border border-gray-300 dark:border-gray-600 p-2 rounded-lg cursor-not-allowed bg-gray-100 dark:bg-gray-700 dark:text-gray-200"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Asunto:</label>
          <textarea
            name="asunto"
            value={formData.asunto}
            onChange={handleChange}
            className="border border-gray-300 dark:border-gray-600 p-2 rounded-lg bg-white dark:bg-gray-700 dark:text-white"
            rows={3}
            placeholder="Breve descripción o asunto del oficio"
          />
        </div>

      </div>

      <div className="flex gap-4 mt-6 w-full justify-center ">
        <button
          onClick={limpiarFormulario}
          className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Limpiar
        </button>

        <button
          type="button"
          onClick={generarCodigo}
          className=" bg-gradient-to-r from-[#1a4d2e] to-[#2d7d4a] text-white py-2 px-4 rounded-xl font-semibold text-base transition-all duration-300 hover:shadow-lg"
        >
          Generar código de barras
        </button>
      </div>
      {codigo && closeModal && (
        <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm w-full flex justify-center">
          <Codigodebarras 
            codigo={codigo} 
            onClose={() => setCloseModal(false)}
            oficioData={formData}
          />
        </div>
      )}
    </div>
  );
}

export default CrearOficio;