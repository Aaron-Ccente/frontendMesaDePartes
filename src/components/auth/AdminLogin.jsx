import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from '../../hooks/useForm';
import ThemeToggle from '../ui/ThemeToggle';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginError, setLoginError] = useState('');

  const initialValues = {
    CIP: '',
    Contrasena: ''
  };

  const { values, errors, isSubmitting, handleChange, handleSubmit, setFieldError } = useForm({
    initialValues,
    onSubmit: async (formData) => {
      try {
        setLoginError('');
        
        const result = await login(formData);
        
        if (result.success) {
          // Redirigir al dashboard de administrador
          navigate('/admin/dashboard');
        } else {
          // Mostrar error
          setFieldError('general', result.message);
        }
      } catch (error) {
        console.error('Error en login:', error);
        setLoginError('Error interno del servidor');
      }
    },
    validate: (values) => {
      const errors = {};
      
      if (!values.CIP) {
        errors.CIP = 'CIP es requerido';
      }
      
      if (!values.Contrasena) {
        errors.Contrasena = 'Contraseña es requerida';
      }
      
      return errors;
    }
  });

  const handleRegisterClick = () => {
    navigate('/admin/register');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a4d2e] to-[#1a4d2e] p-5">
      {/* Botón de cambio de tema en la esquina superior derecha */}
      <div className="absolute top-4 right-4">
        <ThemeToggle size="lg" />
      </div>

      <div className="bg-white rounded-3xl dark:bg-dark-surface shadow-2xl p-10 w-full max-w-md relative overflow-hidden">
        {/* Línea dorada superior */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD700] to-[#e6c547]"></div>
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-5">
            <div className="text-5xl mb-4">👮</div>
            <h1 className="text-3xl font-bold text-[#1a4d2e] dark:text-dark-text-primary mb-2">Mesa de Partes PNP</h1>
            <h2 className="text-lg text-gray-600 dark:text-dark-text-secondary">Acceso Administrativo</h2>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="mb-6">
          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-5 text-sm">
              {loginError}
            </div>
          )}

          <div className="mb-5">
            <label htmlFor="CIP" className="block text-sm font-semibold text-gray-700 mb-2 dark:text-dark-text-secondary">
              CIP
            </label>
            <input
              type="text"
              id="CIP"
              name="CIP"
              value={values.CIP}
              onChange={(e) => handleChange('CIP', e.target.value)}
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent dark:text-dark-text-secondary`}
              placeholder="Ingrese su CIP"
            />
            {errors.CIP && (
              <span className="text-red-500 text-xs mt-2 block">{errors.CIP}</span>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="Contrasena" className="block text-sm font-semibold text-gray-700 mb-2 dark:text-dark-text-secondary">
              Contraseña
            </label>
            <input
              type="password"
              id="Contrasena"
              name="Contrasena"
              value={values.Contrasena}
              onChange={(e) => handleChange('Contrasena', e.target.value)}
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent dark:text-dark-text-secondary`}
              placeholder="Ingrese su contraseña"
            />
            {errors.Contrasena && (
              <span className="text-red-500 text-xs mt-2 block">{errors.Contrasena}</span>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#1a4d2e] to-[#2d7d4a] text-white py-4 rounded-xl font-semibold text-base transition-all duration-300 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-5 border-t border-gray-200">
          <p className="text-gray-600 text-sm dark:text-dark-text-secondary">
            ¿No tienes una cuenta?{' '}
            <button
              type="button"
              className="text-[#1a4d2e] underline font-semibold hover:text-[#2d7d4a] transition-colors duration-300 dark:text-dark-text-primary"
              onClick={handleRegisterClick}
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
