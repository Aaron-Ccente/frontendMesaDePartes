import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import { authService } from '../../services/authService';

const AdminRegister = () => {
  const navigate = useNavigate();
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  const initialValues = {
    CIP: '',
    NombreUsuario: '',
    Contrasena: '',
    ConfirmarContrasena: '',
    Nombre: ''
  };

  const validate = (values) => {
    const errors = {};
    
    if (!values.CIP.trim()) {
      errors.CIP = 'El CIP es requerido';
    } else if (values.CIP.length < 3) {
      errors.CIP = 'El CIP debe tener al menos 3 caracteres';
    }
    
    if (!values.NombreUsuario.trim()) {
      errors.NombreUsuario = 'El nombre de usuario es requerido';
    } else if (values.NombreUsuario.length < 3) {
      errors.NombreUsuario = 'El nombre de usuario debe tener al menos 3 caracteres';
    }
    
    if (!values.Contrasena) {
      errors.Contrasena = 'La contraseña es requerida';
    } else if (values.Contrasena.length < 6) {
      errors.Contrasena = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (!values.ConfirmarContrasena) {
      errors.ConfirmarContrasena = 'Confirme su contraseña';
    } else if (values.Contrasena !== values.ConfirmarContrasena) {
      errors.ConfirmarContrasena = 'Las contraseñas no coinciden';
    }
    
    if (!values.Nombre.trim()) {
      errors.Nombre = 'El nombre es requerido';
    } else if (values.Nombre.length < 2) {
      errors.Nombre = 'El nombre debe tener al menos 2 caracteres';
    }
    
    return errors;
  };

  const onSubmit = async (values) => {
    try {
      setRegisterError('');
      setRegisterSuccess('');
      
      // Remover el campo de confirmación antes de enviar
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
        {/* Línea dorada superior */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFD700] to-[#e6c547]"></div>
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-5">
            <div className="text-5xl mb-4">👮</div>
            <h1 className="text-3xl font-bold text-[#1a4d2e] mb-2">Mesa de Partes PNP</h1>
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
            <label htmlFor="NombreUsuario" className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre de Usuario
            </label>
            <input
              type="text"
              id="NombreUsuario"
              name="NombreUsuario"
              value={values.NombreUsuario}
              onChange={(e) => handleChange('NombreUsuario', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl text-base transition-all duration-300 focus:outline-none focus:ring-4 ${
                errors.NombreUsuario 
                  ? 'border-red-500 focus:ring-red-100' 
                  : 'border-gray-200 focus:border-[#1a4d2e] focus:ring-[#1a4d2e]/10'
              }`}
              placeholder="Ingrese su nombre de usuario"
            />
            {errors.NombreUsuario && (
              <span className="text-red-500 text-xs mt-2 block">{errors.NombreUsuario}</span>
            )}
          </div>

          <div className="mb-5">
            <label htmlFor="Nombre" className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre Completo
            </label>
            <input
              type="text"
              id="Nombre"
              name="Nombre"
              value={values.Nombre}
              onChange={(e) => handleChange('Nombre', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl text-base transition-all duration-300 focus:outline-none focus:ring-4 ${
                errors.Nombre 
                  ? 'border-red-500 focus:ring-red-100' 
                  : 'border-gray-200 focus:border-[#1a4d2e] focus:ring-[#1a4d2e]/10'
              }`}
              placeholder="Ingrese su nombre completo"
            />
            {errors.Nombre && (
              <span className="text-red-500 text-xs mt-2 block">{errors.Nombre}</span>
            )}
          </div>

          <div className="mb-5">
            <label htmlFor="Contrasena" className="block text-sm font-semibold text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              id="Contrasena"
              name="Contrasena"
              value={values.Contrasena}
              onChange={(e) => handleChange('Contrasena', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl text-base transition-all duration-300 focus:outline-none focus:ring-4 ${
                errors.Contrasena 
                  ? 'border-red-500 focus:ring-red-100' 
                  : 'border-gray-200 focus:border-[#1a4d2e] focus:ring-[#1a4d2e]/10'
              }`}
              placeholder="Ingrese su contraseña"
            />
            {errors.Contrasena && (
              <span className="text-red-500 text-xs mt-2 block">{errors.Contrasena}</span>
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
