import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { peritoAuthService } from '../../services/peritoAuthService';
import ThemeToggle from '../ui/ThemeToggle';

const PeritoLogin = () => {
  const navigate = useNavigate();
  const { loginPerito } = useAuth();
  const [formData, setFormData] = useState({
    CIP: '',
    password_hash: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.CIP || !formData.password_hash) {
      setError('CIP y contraseña son requeridos');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await peritoAuthService.loginPerito(formData);
      
      if (response.success) {

        await loginPerito(response.data, response.token);  
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
    <div className="min-h-screen bg-gradient-to-br from-[#1a4d2e] to-[#2d7d4a] flex items-center justify-center p-4 relative">
      {/* Botón de cambio de tema en la esquina superior derecha */}
      <div className="absolute top-4 right-4">
        <ThemeToggle size="lg" />
      </div>
      {/* Fondo con elementos decorativos en verde */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#2e8822] rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-[#2e8822] rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
        <div className="absolute -bottom-32 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-[#2e8822] rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-500"></div>
      </div>
      <div className="w-fit flex justify-center bg-gradient-to-t from-[#1a4d2e] to-[#2e8822]  rounded-2xl">
        {/* Formulario */}
        <div className="bg-white dark:bg-dark-surface transition-colors rounded-2xl p-8 w-96">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-5">
              <h1 className="text-3xl font-bold text-[#1a4d2e] dark:text-dark-text-primary mb-2">Iniciar Sesión</h1>
              <h2 className="text-lg text-gray-600 dark:text-dark-text-secondary">Acceso de Peritos</h2>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                <div className="flex items-center space-x-2">
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
              <label htmlFor="password_hash" className="block text-sm font-medium text-gray-700 mb-2 dark:text-dark-text-secondary">
                Contraseña
              </label>
              <input
                type="password"
                id="password_hash"
                name="password_hash"
                autoComplete='current-password'
                value={formData.password_hash}
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
        <div className='w-96 flex flex-col justify-center gap-8 items-center'>
              <div className='flex justify-center gap-6'>
                <img src='/src/assets/images/fondo_oficri.webp' width={140} height={140}/>
                <img src='/src/assets/images/fondo_pnp.webp' width={140} height={140}/>
              </div>
              <h2 className='text-3xl text-light-gray font-bold'>Mesa De Partes OFICRI</h2>
              <p className='text-sm text-light-gray'>Sistema de Gestión de requisitos Forenses</p>
        </div>
      </div>
    </div>
  );
};

export default PeritoLogin;
