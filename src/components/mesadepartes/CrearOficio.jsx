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
    prioridad: ""
  });

  const [codigo, setCodigo] = useState("");
  const [closeModal, setCloseModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [especialidades, setEspecialidades] = useState([]);
  const [peritos, setPeritos] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("formDataCodigodeBarras");
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
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
        return;
      }

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
      prioridad: ""
    };
    setFormData(initial);
    localStorage.removeItem("formDataCodigodeBarras");
    setCodigo("");
    setPeritos([]);
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
          <label className="text-sm font-medium text-gray-600">Fiscalía:</label>
          <input
            type="text"
            name="fiscalia"
            value={formData.fiscalia}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">Fiscal Remitente:</label>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">Implicado:</label>
          <input
            type="text"
            name="implicado"
            value={formData.implicado}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">DNI del implicado:</label>
          <input
            type="text"
            name="dniImplicado"
            value={formData.dniImplicado}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg"
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
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg"
          >
            <option value="">Seleccione un tipo de examen</option>
            <option value="Dosaje Etílico">Dosaje Etílico</option>
            <option value="Toxicológico">Toxicológico</option>
            <option value="Dosaje Etílico y Toxicológico">Dosaje Etílico y Toxicológico</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">MUESTRA REMITIDA / A EXTRAER:</label>
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
            name="prioridad"
            value={formData.prioridad}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg"
          >
            <option value="">Seleccione la prioridad</option>
            <option value="FLAGRANCIA">FLAGRANCIA</option>
            <option value="ALTO">ALTO</option>
            <option value="URGENTE">URGENTE</option>
            <option value="NORMAL">NORMAL</option>
            <option value="MEDIA">MEDIA</option>
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