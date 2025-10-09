import { useState, useEffect } from "react";
import Barcode from "react-barcode";

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
  });

  const [codigo, setCodigo] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

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
    });
    localStorage.removeItem("formDataCodigodeBarras");
    setCodigo("");
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gray-50 rounded-2xl shadow-md w-full max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-6 text-gray-700 text-center">
        Formulario de Generación de Código de Barras
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
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
          <label className="text-sm font-medium text-gray-600">Especialidad a derivar:</label>
          <input
            type="text"
            name="especialidad"
            value={formData.especialidad}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg"
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