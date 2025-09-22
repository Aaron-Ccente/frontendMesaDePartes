import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import { authService } from '../../services/authService';

const AdminRegister = () => {
  const navigate = useNavigate();
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  const initialValues = {
    CIP: '',
    nombre_usuario: '',
    password_hash: '',
    ConfirmarContrasena: '',
    nombre_completo: ''
  };

  const validate = (values) => {
    const errors = {};
    
    if (!values.CIP.trim()) {
      errors.CIP = 'El CIP es requerido';
    } else if (values.CIP.length < 3) {
      errors.CIP = 'El CIP debe tener al menos 3 caracteres';
    }
    
    if (!values.nombre_usuario.trim()) {
      errors.nombre_usuario = 'El nombre de usuario es requerido';
    } else if (values.nombre_usuario.length < 3) {
      errors.nombre_usuario = 'El nombre de usuario debe tener al menos 3 caracteres';
    }
    
    if (!values.password_hash) {
      errors.password_hash = 'La contraseña es requerida';
    } else if (values.password_hash.length < 6) {
      errors.password_hash = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (!values.ConfirmarContrasena) {
      errors.ConfirmarContrasena = 'Confirme su contraseña';
    } else if (values.password_hash !== values.ConfirmarContrasena) {
      errors.ConfirmarContrasena = 'Las contraseñas no coinciden';
    }
    
    if (!values.nombre_completo || !values.nombre_completo.trim()) {
        errors.nombre_completo = 'El nombre es requerido';
      } else if (values.nombre_completo.length < 2) {
        errors.nombre_completo = 'El nombre debe tener al menos 2 caracteres';
      }
    
    return errors;
  };

  const onSubmit = async (values) => {
    try {
      setRegisterError('');
      setRegisterSuccess('');
      
      // Remueve el campo de confirmación de contraseña antes de enviar.
      const { ConfirmarContrasena, ...adminData } = values;
      
      await authService.registerAdmin(adminData);
      setRegisterSuccess('Registro exitoso. Redirigiendo al login...');
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate('/admin/login');
      }, 2000);
      
    } catch (error) {
      setRegisterError(error.message);
    }
  };

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit
    
  } = useForm({
    initialValues,
    onSubmit,
    validate
  });

  const handleLoginClick = () => {
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a4d2e] to-[#2d7d4a] p-5">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-lg relative overflow-hidden">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-5">
            <h1 className="text-3xl font-bold text-[#1a4d2e] mb-2">Mesa de Partes OFICRI</h1>
            <h2 className="text-lg text-gray-600">Registro Administrativo</h2>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="mb-6">
          {registerError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-5 text-sm">
              {registerError}
            </div>
          )}

          {registerSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-5 text-sm">
              {registerSuccess}
            </div>
          )}

          <div className="mb-5">
            <label htmlFor="CIP" className="block text-sm font-semibold text-gray-700 mb-2">
              CIP
            </label>
            <input
              type="text"
              id="CIP"
              name="CIP"
              value={values.CIP}
              onChange={(e) => handleChange('CIP', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl text-base transition-all duration-300 focus:outline-none focus:ring-4 ${
                errors.CIP 
                  ? 'border-red-500 focus:ring-red-100' 
                  : 'border-gray-200 focus:border-[#1a4d2e] focus:ring-[#1a4d2e]/10'
              }`}
              placeholder="Ingrese su CIP"
            />
            {errors.CIP && (
              <span className="text-red-500 text-xs mt-2 block">{errors.CIP}</span>
            )}
          </div>

          <div className="mb-5">
            <label htmlFor="nombre_usuario" className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre de Usuario
            </label>
            <input
              type="text"
              id="nombre_usuario"
              name="nombre_usuario"
              value={values.nombre_usuario}
              onChange={(e) => handleChange('nombre_usuario', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl text-base transition-all duration-300 focus:outline-none focus:ring-4 ${
                errors.nombre_usuario 
                  ? 'border-red-500 focus:ring-red-100' 
                  : 'border-gray-200 focus:border-[#1a4d2e] focus:ring-[#1a4d2e]/10'
              }`}
              placeholder="Ingrese su nombre de usuario"
            />
            {errors.nombre_usuario && (
              <span className="text-red-500 text-xs mt-2 block">{errors.nombre_usuario}</span>
            )}
          </div>

          <div className="mb-5">
            <label htmlFor="nombre_completo" className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre Completo
            </label>
            <input
              type="text"
              id="nombre_completo"
              name="nombre_completo"
              autoComplete="username"
              value={values.nombre_completo}
              onChange={(e) => handleChange('nombre_completo', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl text-base transition-all duration-300 focus:outline-none focus:ring-4 ${
                errors.nombre_completo 
                  ? 'border-red-500 focus:ring-red-100' 
                  : 'border-gray-200 focus:border-[#1a4d2e] focus:ring-[#1a4d2e]/10'
              }`}
              placeholder="Ingrese su nombre completo"
            />
            {errors.nombre_completo && (
              <span className="text-red-500 text-xs mt-2 block">{errors.nombre_completo}</span>
            )}
          </div>

          <div className="mb-5">
            <label htmlFor="password_hash" className="block text-sm font-semibold text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              id="password_hash"
              name="password_hash"
              autoComplete="new-password"
              value={values.password_hash}
              onChange={(e) => handleChange('password_hash', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl text-base transition-all duration-300 focus:outline-none focus:ring-4 ${
                errors.password_hash 
                  ? 'border-red-500 focus:ring-red-100' 
                  : 'border-gray-200 focus:border-[#1a4d2e] focus:ring-[#1a4d2e]/10'
              }`}
              placeholder="Ingrese su contraseña"
            />
            {errors.password_hash && (
              <span className="text-red-500 text-xs mt-2 block">{errors.password_hash}</span>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="ConfirmarContrasena" className="block text-sm font-semibold text-gray-700 mb-2">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              id="ConfirmarContrasena"
              name="ConfirmarContrasena"
              value={values.ConfirmarContrasena}
              onChange={(e) => handleChange('ConfirmarContrasena', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl text-base transition-all duration-300 focus:outline-none focus:ring-4 ${
                errors.ConfirmarContrasena 
                  ? 'border-red-500 focus:ring-red-100' 
                  : 'border-gray-200 focus:border-[#1a4d2e] focus:ring-[#1a4d2e]/10'
              }`}
              placeholder="Confirme su contraseña"
              autoComplete="new-password"
            />
            {errors.ConfirmarContrasena && (
              <span className="text-red-500 text-xs mt-2 block">{errors.ConfirmarContrasena}</span>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#1a4d2e] to-[#2d7d4a] text-white py-4 rounded-xl font-semibold text-base transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-5 border-t border-gray-200">
          <p className="text-gray-600 text-sm">
            ¿Ya tienes una cuenta?{' '}
            <button
              type="button"
              className="text-[#1a4d2e] underline font-semibold hover:text-[#2d7d4a] transition-colors duration-300"
              onClick={handleLoginClick}
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
