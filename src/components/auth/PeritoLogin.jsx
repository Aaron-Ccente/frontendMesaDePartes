import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { peritoAuthService } from '../../services/peritoAuthService';
import ThemeToggle from '../ui/ThemeToggle';

const PeritoLogin = () => {
  const navigate = useNavigate();
  const { loginPerito } = useAuth();
  const [formData, setFormData] = useState({
    CIP: '',
    contrasena: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.CIP || !formData.contrasena) {
      setError('CIP y contraseña son requeridos');
      return;
    }

    try {
      setLoading(true);
      setError('');
      // Intentar login
      const response = await peritoAuthService.loginPerito(formData);
      
      if (response.success) {
        // Configurar sesión en el contexto
        await loginPerito(response.data);  
        // Redirigir al dashboard de perito
        navigate('/perito/dashboard');
      } else {
        setError(response.message || 'Error en el login');
      }
    } catch (error) {
      setError(error.message || 'Error en el login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a4d2e] to-[#1a4d2e] flex items-center justify-center p-4 relative">
      {/* Botón de cambio de tema en la esquina superior derecha */}
      <div className="absolute top-4 right-4">
        <ThemeToggle size="lg" />
      </div>
      
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-white dark:bg-dark-surface rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl text-[#1a4d2e] dark:text-dark-pnp-green">👮‍♂️</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Acceso Peritos
          </h2>
          <p className="text-white/80 dark:text-white/90">
            Sistema de Gestión de documentos
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl dark:shadow-gray-900/50 p-8 border border-gray-200 dark:border-dark-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">⚠️</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* CIP */}
            <div>
              <label htmlFor="CIP" className="block text-sm font-medium text-gray-700 mb-2 dark:text-dark-text-secondary">
                CIP
              </label>
              <input
                type="text"
                id="CIP"
                name="CIP"
                value={formData.CIP}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent dark:text-dark-text-secondary"
                placeholder="Ingrese su CIP"
                required
                disabled={loading}
              />
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700 mb-2 dark:text-dark-text-secondary">
                Contraseña
              </label>
              <input
                type="password"
                id="contrasena"
                name="contrasena"
                value={formData.contrasena}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent dark:text-dark-text-secondary"
                placeholder="Ingrese su contraseña"
                required
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#1a4d2e] to-[#2d7d4a] text-white py-4 rounded-xl font-semibold text-base transition-all duration-300 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <div className="text-xs text-gray-500">
              Sistema de Mesa de Partes OFICRI
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeritoLogin;
