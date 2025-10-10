import { useState, useEffect } from "react";
import Barcode from "react-barcode";
import { ComplementServices } from '../../services/complementService';
function Codigodebarras() {
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
    estado: "CREACIÓN DE OFICIO"
  });

  const [codigo, setCodigo] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);
  const [especialidades, setEspecialidades] = useState([]);
  useEffect(() => {
    const saved = localStorage.getItem("formDataCodigodeBarras");
    if (saved) {
      setFormData(JSON.parse(saved));
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("formDataCodigodeBarras", JSON.stringify(formData));
    }
    const loadData = async ()=>{
      try {
        const especialidadesRes = await ComplementServices.getTiposDepartamento();
        console.log(especialidadesRes)
        setEspecialidades(especialidadesRes.data || [])
      } catch (error) {
        console.log(error)
      }
    }
    loadData();
  }, [formData, isInitialized]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generarCodigo = () => {
    const nuevoCodigo = `${formData.numeroOficio}`;
    setCodigo(nuevoCodigo);
  };

  const limpiarFormulario = () => {
    setFormData({
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
      estado: "CREACIÓN DE OFICIO"
    });
    localStorage.removeItem("formDataCodigodeBarras");
    setCodigo("");
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
      <div className="grid grid-cols-1 max-lg:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        
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
      <div className="grid grid-cols-1 max-lg:grid-cols-2 lg:grid-cols-3 gap-4 w-full">

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
      <div className="grid grid-cols-1 max-lg:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
     
        <div className="flex flex-col">
            <label htmlFor="id_tipo_departamento" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Especialidad requerida:
            </label>
            <select
              id="id_tipo_departamento"
              name="id_tipo_departamento"
              value={formData.id_tipo_departamento}
              onChange={(e) => {
                handleChange('id_tipo_departamento', e.target.value);
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a4d2e] dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
            >
              <option value="">Seleccione un tipo de departamento</option>
              {especialidades.map((tipo) => (
                <option 
                  key={tipo.id_tipo_departamento} 
                  value={tipo.id_tipo_departamento}
                >
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
            name="perito"
            value={formData.perito}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg"
          >
            <option value="">Seleccione un perito</option>
            <option value="Dosaje Etílico">Dosaje Etílico</option>
            <option value="Toxicológico">Toxicológico</option>
            <option value="Dosaje Etílico y Toxicológico">Dosaje Etílico y Toxicológico</option>
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
            <option value="Dosaje Etílico">FLAGRANCIA</option>
            <option value="Toxicológico">ALTO</option>
            <option value="Dosaje Etílico y Toxicológico">URGENTE</option>
            <option value="Dosaje Etílico y Toxicológico">NORMAL</option>
            <option value="Dosaje Etílico y Toxicológico">MEDIA</option>
          </select>
        </div>   

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">Estado del oficio:</label>
          <input
            type="text"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            disabled="true"
            className="border border-gray-300 p-2 rounded-lg cursor-no-drop"
          />
        </div>

      </div>

      <div className="flex gap-4 mt-6">
        
         <button
          onClick={limpiarFormulario}
          className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Limpiar
        </button>

        <button
          type="button"
          onClick={generarCodigo}
          className="w-full bg-gradient-to-r from-[#1a4d2e] to-[#2d7d4a] text-white py-1 px-2 rounded-xl font-semibold text-base transition-all duration-300 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
        >
          Generar código de barras
        </button>

      </div>

      {codigo && (
        <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
          <Barcode value={codigo} width={1} height={60} displayValue={true} />
        </div>
      )}
    </div>
  );
}

export default Codigodebarras;