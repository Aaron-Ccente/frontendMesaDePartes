import React, { useEffect, useState } from 'react';
import { configService } from '../../../services/configService';
import { toast } from 'sonner';

// Iconos para las pestañas
const Icons = {
  Institucional: () => (
    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Contacto: () => (
    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  Documentos: () => (
    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
};

const AdminConfiguracion = () => {
  const [configs, setConfigs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('INSTITUCIONAL');

  // Mapeo de categorías para las tabs
  const categories = [
    { id: 'INSTITUCIONAL', label: 'Institucional', icon: Icons.Institucional },
    { id: 'CONTACTO', label: 'Contacto y Sede', icon: Icons.Contacto },
    { id: 'DOCUMENTOS', label: 'Textos y Legal', icon: Icons.Documentos }
  ];

  // Definición de campos para saber el orden y etiquetas (aunque vengan de BD)
  const fieldMeta = {
    // Institucional
    ANIO_LEMA: { label: 'Lema del Año', type: 'text' },
    MEMBRETE_COMANDO: { label: 'Membrete: Comando', type: 'text' },
    MEMBRETE_DIRECCION: { label: 'Membrete: Dirección', type: 'text' },
    MEMBRETE_REGION: { label: 'Membrete: Región', type: 'text' },
    SUFIJO_OFICIO: { label: 'Sufijo Número Oficio', type: 'text' },

    // Contacto
    SEDE_NOMBRE: { label: 'Nombre de Sede', type: 'text' },
    SEDE_DIRECCION: { label: 'Dirección Física', type: 'text' },
    SEDE_TELEFONO: { label: 'Teléfono Fijo', type: 'text' },
    SEDE_CELULAR: { label: 'Celular', type: 'text' },
    SEDE_EMAIL: { label: 'Email de Contacto', type: 'text' },

    // Documentos
    FIRMANTE_CARGO_DEF: { label: 'Cargo Firmante (Defecto)', type: 'text' },
    FIRMANTE_DEP_DEF: { label: 'Dependencia Firmante (Defecto)', type: 'text' },
    TEXTO_LEGAL_INFORME: { label: 'Texto Legal (Informe)', type: 'textarea', rows: 4 },
    TEXTO_DESPEDIDA: { label: 'Texto Despedida', type: 'textarea', rows: 2 },
    TEXTO_DIOS_GUARDE: { label: 'Cierre (Dios guarde...)', type: 'text' },
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const result = await configService.getAllConfigs();
      if (result.success) {
        // Convertir array a objeto para fácil manejo en inputs
        const configMap = {};
        result.data.forEach(c => {
          configMap[c.clave] = c; // Guardamos todo el objeto para mantener metadata
        });
        setConfigs(configMap);
      }
    } catch (error) {
      toast.error('Error cargando configuraciones: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (clave, newValue) => {
    setConfigs(prev => ({
      ...prev,
      [clave]: { ...prev[clave], valor: newValue }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Convertir de nuevo a array para enviar al backend
      const updates = Object.values(configs).map(c => ({
        clave: c.clave,
        valor: c.valor
      }));
      
      const result = await configService.updateConfigs(updates);
      if (result.success) {
        toast.success('Configuración guardada exitosamente');
      }
    } catch (error) {
      toast.error('Error al guardar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Filtrar claves por categoría activa
  const getFieldsByCategory = (category) => {
    return Object.values(configs)
      .filter(c => c.categoria === category)
      .sort((a, b) => {
        // Ordenar según el orden definido en fieldMeta, o al final si no existe
        const keys = Object.keys(fieldMeta);
        return keys.indexOf(a.clave) - keys.indexOf(b.clave);
      });
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64 text-gray-500 dark:text-gray-400">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-2"></div>
      Cargando configuraciones...
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Configuración Global de Documentos</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Modifique los textos que aparecen en los informes PDF.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center shadow-sm transition-colors duration-200"
        >
          {saving ? 'Guardando...' : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Guardar Cambios
            </>
          )}
        </button>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={`flex items-center px-6 py-4 text-sm font-medium focus:outline-none transition-colors duration-200 whitespace-nowrap
              ${activeTab === cat.id 
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
          >
            <cat.icon />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-8 bg-gray-50 dark:bg-gray-900/50 min-h-[500px]">
        <div className="max-w-4xl mx-auto space-y-6">
          {getFieldsByCategory(activeTab).map((field) => {
            const meta = fieldMeta[field.clave] || { label: field.clave, type: 'text' };
            
            return (
              <div key={field.clave} className="bg-white dark:bg-gray-800 p-5 rounded-md shadow-sm border border-gray-100 dark:border-gray-700 transition-colors duration-200">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  {meta.label}
                </label>
                
                {meta.type === 'textarea' ? (
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm transition-colors duration-200"
                    rows={meta.rows || 3}
                    value={field.valor}
                    onChange={(e) => handleChange(field.clave, e.target.value)}
                  />
                ) : (
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm transition-colors duration-200"
                    value={field.valor}
                    onChange={(e) => handleChange(field.clave, e.target.value)}
                  />
                )}
                
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  {field.descripcion}
                </p>
              </div>
            );
          })}

          {getFieldsByCategory(activeTab).length === 0 && (
             <div className="text-center text-gray-400 dark:text-gray-500 py-10">
               No hay configuraciones en esta categoría.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminConfiguracion;