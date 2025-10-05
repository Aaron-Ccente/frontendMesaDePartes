import React, { useState } from "react";
import Barcode from "react-barcode";

function Codigodebarras() {
  const [formData, setFormData] = useState({
    numeroOficio: "",
    fechaHora: "",
    unidadSolicitante: '',
    regionSolicitante: "",
    implicado: "",
    dniImplicado: "",
    derivacion: "",
    tipoExamen: "",
    muestra: "",
    especialidad: "",
  });

  const [codigo, setCodigo] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generarCodigo = () => {
    const nuevoCodigo = `${2025}-${formData.numeroOficio}-${formData.tipoExamen}`;
    setCodigo(nuevoCodigo);
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gray-50 rounded-2xl shadow-md w-full max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-6 text-gray-700 text-center">
        Formulario de Generación de Código de Barras
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">NÚMERO DE OFICIO:</label>
          <input
            type="text"
            name="numeroOficio"
            value={formData.numeroOficio}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">FECHA Y HORA DEL INCIDENTE:</label>
          <input
            type="text"
            name="fechaHora"
            value={formData.fechaHora}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">UNIDAD SOLICITANTE:</label>
          <input
            type="text"
            name="unidadSolicitante"
            value={formData.unidadSolicitante}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">REGIÓN SOLICITANTE:</label>
          <input
            type="text"
            name="regionSolicitante"
            value={formData.regionSolicitante}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">IMPLICADO:</label>
          <input
            type="text"
            name="implicado"
            value={formData.implicado}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">DNI DEL IMPLICADO:</label>
          <input
            type="text"
            name="dniImplicado"
            value={formData.dniImplicado}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">DERIVACIÓN:</label>
          <input
            type="text"
            name="derivacion"
            value={formData.derivacion}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg"
          />
        </div>


        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">TIPO DE EXAMEN:</label>
          <input
            type="text"
            name="tipoExamen"
            value={formData.tipoExamen}
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
          <label className="text-sm font-medium text-gray-600">ESPECIALIDAD:</label>
          <input
            type="text"
            name="especialidad"
            value={formData.especialidad}
            onChange={handleChange}
            className="border border-gray-300 p-2 rounded-lg"
          />
        </div>
      </div>

      <button
        onClick={generarCodigo}
        className="bg-blue-600 text-white py-2 px-6 rounded-lg mt-6 hover:bg-blue-700 transition-colors"
      >
        Generar código de barras
      </button>

      {codigo && (
        <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
          <Barcode value={codigo} width={1} height={60} displayValue={true} />
        </div>
      )}
    </div>
  );
}

export default Codigodebarras;

