// frontend-mesa-de-partes/src/components/admin/AdminVisorCasos.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminViewerService from '../../services/adminViewerService';
import { Toaster, toast } from 'sonner';

const AdminVisorCasos = () => {
  const [casos, setCasos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCasos = async () => {
      try {
        setLoading(true);
        const response = await adminViewerService.getAllCases();
        if (response.success) {
          setCasos(response.data);
        } else {
          throw new Error(response.message || 'Failed to fetch cases');
        }
        setError(null);
      } catch (err) {
        setError(err.message);
        toast.error(`Error al cargar la lista de casos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCasos();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d2e]"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4 bg-red-100 rounded-md">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4 bg-white dark:bg-dark-bg-secondary rounded-lg shadow-md">
      <Toaster richColors position="top-center" />
      <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-dark-text-primary">Visor de Casos (Administrador)</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-dark-surface">
          <thead className="bg-gray-100 dark:bg-dark-bg-tertiary">
            <tr>
              <th className="py-3 px-4 border-b dark:border-dark-border text-left text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">N° Oficio</th>
              <th className="py-3 px-4 border-b dark:border-dark-border text-left text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Administrado</th>
              <th className="py-3 px-4 border-b dark:border-dark-border text-left text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Fecha de Creación</th>
              <th className="py-3 px-4 border-b dark:border-dark-border text-left text-sm fontsemibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Último Estado</th>
              <th className="py-3 px-4 border-b dark:border-dark-border text-left text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 dark:text-gray-200">
            {casos.map((caso) => (
              <tr key={caso.id_oficio} className="hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors duration-200">
                <td className="py-3 px-4 border-b dark:border-dark-border">{caso.numero_oficio || 'N/A'}</td>
                <td className="py-3 px-4 border-b dark:border-dark-border">{caso.examinado_incriminado || 'N/A'}</td>
                <td className="py-3 px-4 border-b dark:border-dark-border">{new Date(caso.fecha_creacion).toLocaleString('es-ES')}</td>
                <td className="py-3 px-4 border-b dark:border-dark-border">
                    <span className="px-2 py-1 font-semibold leading-tight text-green-700 bg-green-100 rounded-full dark:bg-green-700 dark:text-green-100">
                        {caso.ultimo_estado ==="CREACION DEL OFICIO"? "ENTRADA": caso.ultimo_estado}
                    </span>
                </td>
                <td className="py-3 px-4 border-b dark:border-dark-border">
                  <button
                    onClick={() => navigate(`/admin/dashboard/visor-casos/${caso.id_oficio}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-lg shadow-md transition-colors duration-200"
                  >
                    Ver Detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminVisorCasos;
