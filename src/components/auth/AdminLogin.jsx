import { useState } from 'react';
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
    password_hash: ''
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
      
      if (!values.password_hash) {
        errors.password_hash = 'Contraseña es requerida';
      }
      
      return errors;
    }
  });

  const handleRegisterClick = () => {
    navigate('/admin/register');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a4d2e] to-[#2d7d4a] p-5">
      {/* Fondo con elementos decorativos en verde */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#2e8822] rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-[#2e8822] rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
        <div className="absolute -bottom-32 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-[#2e8822] rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-500"></div>
      </div>
      {/* Botón de cambio de tema en la esquina superior derecha */}
      <div className="absolute top-4 right-4">
        <ThemeToggle size="lg" />
      </div>
      <div className="w-fit flex justify-center bg-gradient-to-t from-[#1a4d2e] to-[#2e8822]  rounded-2xl">

      <div className="bg-white rounded-2xl dark:bg-dark-surface shadow-2xl p-6 max-w-md relative overflow-hidden w-96 transition-colors z-20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-5">
            <h1 className="text-3xl font-bold text-[#1a4d2e] dark:text-dark-text-primary mb-2">Iniciar Sesión</h1>
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
            <label htmlFor="password_hash" className="block text-sm font-semibold text-gray-700 mb-2 dark:text-dark-text-secondary">
              Contraseña
            </label>
            <input
              type="password"
              id="password_hash"
              name="password_hash"
              value={values.password_hash}
              onChange={(e) => handleChange('password_hash', e.target.value)}
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent dark:text-dark-text-secondary`}
              placeholder="Ingrese su contraseña"
            />
            {errors.password_hash && (
              <span className="text-red-500 text-xs mt-2 block">{errors.password_hash}</span>
            )}
          </div>
          {errors.general && (
            <div className="text-red-500 text-sm mt-2 block text-center pb-6">{errors.general}</div>
          )}
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
            <div className='w-96 flex flex-col justify-center gap-8 items-center z-20'>
              <div className='flex justify-center gap-6'>
                <img src='/src/assets/images/fondo_oficri.webp' width={140} height={140}/>
                <img src='/src/assets/images/fondo_pnp.webp' width={140} height={140}/>
              </div>
              <h2 className='text-3xl text-light-gray font-bold'>Mesa De Partes OFICRI</h2>
              <p className='text-sm text-light-gray'>Sistema de Gestión de administrativo</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
