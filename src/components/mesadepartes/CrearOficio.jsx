import { useState, useEffect } from "react";
import Codigodebarras from "./codigodebarras";
import { ComplementServices } from '../../services/complementService';

function CrearOficio() {
  const [formData, setFormData] = useState({
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

  // nuevo estado: tipos de examen y descripción seleccionada
  const [tiposExamen, setTiposExamen] = useState([]);
  const [tipoExamenDescripcion, setTipoExamenDescripcion] = useState("");

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

  const generarCodigo = () => {
    const nuevoCodigo = `${formData.numeroOficio || Date.now()}`;
    setCodigo(nuevoCodigo);
    setCloseModal(true);
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

  // manejador para seleccionar tipo de muestra (exclusivo)
  const handleTipoDeMuestra = (tipo) => {
    // tipo: 'remitidas' | 'toma'
    setFormData((prev) => ({ ...prev, tipo_de_muestra: prev.tipo_de_muestra === tipo ? "" : tipo }));
  };

  // helper para label dinámico de campo muestra
  const muestraLabel = () => {
    if (formData.tipo_de_muestra === "toma") return "MUESTRA A EXTRAER";
    if (formData.tipo_de_muestra === "remitidas") return "MUESTRA REMITIDA";
    return "MUESTRA REMITIDA / A EXTRAER";
  };

  // helpers para validación visual
  const isImpDniRequired = formData.tipo_de_muestra === "toma";

  // manejar selección de tipo de examen (muestra descripción)
  const handleTipoExamenSelect = (e) => {
    const value = e.target.value;
    handleChange('tipoExamen', value);
    const found = tiposExamen.find((t) => String(t.id_tipo_de_examen) === String(value) || t.nombre === value);
    if (found) {
      setTipoExamenDescripcion(found.descripcion || "");
    } else {
      setTipoExamenDescripcion("");
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gray-50 rounded-2xl shadow-md w-full mx-auto">
      <h2 className="text-xl font-semibold mb-6 text-gray-700 text-center">
        Formulario de Generación del Oficio y Código de Barras
      </h2>

      <div className="w-full">
        <h3 className="text-lg font-semibold text-[#1a4d2e] dark:text-green-400 mb-4 border-b pb-2 dark:border-gray-700">
          Información de Encabezado
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">Número de oficio:</label>
          <input
            type="text"
            name="numeroOficio"
            value={formData.numeroOficio}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">Unidad solicitante:</label>
          <input
            type="text"
            name="fiscalia"
            value={formData.fiscalia}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">Unidad Remitente:</label>
          <input
            type="text"
            name="fiscal_remitente"
            value={formData.fiscal_remitente}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">Región de la fiscalía:</label>
          <input
            type="text"
            name="regionSolicitante"
            value={formData.regionSolicitante}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg"
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

        <p className="text-sm text-gray-500 ml-2">Seleccione uno:</p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleTipoDeMuestra('remitidas')}
            className={`px-4 py-2 rounded-lg border ${
              formData.tipo_de_muestra === 'remitidas'
                ? 'bg-[#1a4d2e] text-white border-transparent'
                : 'bg-white text-gray-700 border-gray-300'
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
                : 'bg-white text-gray-700 border-gray-300'
            }`}
          >
            TOMA DE MUESTRAS
          </button>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">
            Examinado/Incriminado {isImpDniRequired && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            name="implicado"
            value={formData.implicado}
            onChange={handleChange}
            className={`border p-2 rounded-lg ${isImpDniRequired ? 'border-gray-300' : 'border-gray-300'}`}
            required={isImpDniRequired}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">
            DNI del Examinado/Incriminado: {isImpDniRequired && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            name="dniImplicado"
            value={formData.dniImplicado}
            onChange={handleChange}
            className={`border p-2 rounded-lg ${isImpDniRequired ? 'border-gray-300' : 'border-gray-300'}`}
            required={isImpDniRequired}
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">Fecha y hora del incidente:</label>
          <input
            type="text"
            name="fechaHora"
            value={formData.fechaHora}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg"
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
          <label htmlFor="id_tipo_departamento" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Especialidad requerida:
          </label>
          <select
            id="id_tipo_departamento"
            name="id_tipo_departamento"
            value={formData.id_tipo_departamento}
            onChange={(e) => {
              const val = e.target.value;
              handleChange('id_tipo_departamento', val);
              handleAddPeritosAccordingToSpecialty(val);
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a4d2e] dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
          >
            <option value="">Seleccione un tipo de departamento</option>
            {especialidades.map((tipo) => (
              <option key={tipo.id_tipo_departamento} value={tipo.id_tipo_departamento}>
                {tipo.nombre_departamento}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">Tipo de examen:</label>
          <select
            name="tipoExamen"
            value={formData.tipoExamen}
            onChange={handleTipoExamenSelect}
            className="border border-gray-300 p-2 rounded-lg"
          >
            <option value="">Seleccione un tipo de examen</option>
            {tiposExamen.length > 0 ? (
              tiposExamen.map((t) => (
                <option key={t.id_tipo_de_examen} value={t.id_tipo_de_examen}>
                  {t.nombre}
                </option>
              ))
            ) : (
              null
            )}
          </select>

          {/* descripción del tipo de examen */}
          {tipoExamenDescripcion ? (
            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-600">
              {tipoExamenDescripcion}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">{muestraLabel()}:</label>
          <input
            type="text"
            name="muestra"
            value={formData.muestra}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">Asignar a perito:</label>
          <select
            id="id_usuario"
            name="id_usuario"
            value={formData.id_usuario}
            onChange={(e) => { handleChange('id_usuario', e.target.value); }}
            className="border border-gray-300 p-2 rounded-lg"
          >
            <option value="">Seleccione un perito</option>
            {Array.isArray(peritos) && peritos.length > 0 ? (
              peritos.map((perito) => (
                <option key={perito.id_usuario} value={perito.id_usuario}>
                  {perito.nombre_completo}
                </option>
              ))
            ) : (
              <option value="" disabled>No hay peritos</option>
            )}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">Prioridad:</label>
          <select
            id="id_prioridad"
            name="id_prioridad"
            value={formData.id_prioridad}
            onChange={(e) => { handleChange('id_prioridad', e.target.value); }}
            className="border border-gray-300 p-2 rounded-lg"
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
          <label className="text-sm font-medium text-gray-600">Estado del oficio:</label>
          <input
            type="text"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            disabled
            className="border border-gray-300 p-2 rounded-lg cursor-not-allowed bg-gray-100"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">Asunto:</label>
          <textarea
            name="asunto"
            value={formData.asunto}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg"
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
        <div className="mt-6 bg-white p-4 rounded-lg shadow-sm w-full flex justify-center">
          <Codigodebarras codigo={codigo} onClose={() => setCloseModal(false)} />
        </div>
      )}
    </div>
  );
}

export default CrearOficio;