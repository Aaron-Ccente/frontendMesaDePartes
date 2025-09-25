import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import MesaDePartes from '../../services/mesadepartesService';
import ShowToast from '../ui/ShowToast';

const MesaDePartesForm = () => {
  const navigate = useNavigate();
  const { cip } = useParams();
  const isEditing = Boolean(cip);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const initialValues = {
    CIP: '',
    nombre_usuario: '',
    password_hash: '',
    confirmar_password: '',
    nombre_completo: ''
  };

  const { values, errors, isSubmitting, handleChange, handleSubmit, setValues } = useForm({
    initialValues,
    validate: (vals) => {
      const errs = {};
      if (!vals.CIP || !vals.CIP.trim()) errs.CIP = 'CIP es requerido';
      if (!vals.nombre_usuario || !vals.nombre_usuario.trim()) errs.nombre_usuario = 'Nombre de usuario es requerido';
      if (!vals.nombre_completo || !vals.nombre_completo.trim()) errs.nombre_completo = 'Nombre completo es requerido';
      if (!isEditing && !vals.password_hash) errs.password_hash = 'Contraseña es requerida';
      if (vals.password_hash && vals.password_hash !== vals.confirmar_password) errs.confirmar_password = 'Las contraseñas no coinciden';
      return errs;
    },
    onSubmit: async (formData) => {
      try {
        setLoading(true);
        setError('');
        setSuccess('');

        if (isEditing) {
          const updateData = { ...formData };
          if (!updateData.password_hash) {
            delete updateData.password_hash;
            delete updateData.confirmar_password;
          }
          const res = await MesaDePartes.updateUserMesaDePartes(cip, updateData);
          if (res?.error) throw new Error(res.error || res.message || 'Error actualizando usuario');
          setSuccess(res.message || 'Usuario actualizado correctamente');
        } else {
          const { confirmar_password, ...createData } = formData;
          console.log(confirmar_password)
          const res = await MesaDePartes.createUserMesaDePartes(createData);
          if (res?.error) throw new Error(res.error || res.message || 'Error creando usuario');
          setSuccess(res.message || 'Usuario creado correctamente');
        }

        setTimeout(() => navigate('/admin/dashboard/mesadepartes'), 900);
      } catch (err) {
        console.error(err);
        setError(err?.message || 'Error procesando la solicitud');
      } finally {
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    let mounted = true;
    const loadUser = async () => {
      if (!isEditing) return;
      try {
        setLoading(true);
        const res = await MesaDePartes.getUserMesaDePartesByCIP(cip);
        if (!mounted) return;
        if (res?.error) {
          setError(res.error || res.message || 'No se encontró el usuario');
          return;
        }
        const admin = res.data ?? res;
        setValues({
          CIP: admin.CIP || '',
          nombre_usuario: admin.nombre_usuario || '',
          password_hash: '',
          confirmar_password: '',
          nombre_completo: admin.nombre_completo || ''
        });
      } catch (err) {
        console.error(err);
        if (mounted) setError(err?.message || 'Error cargando usuario');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadUser();
    return () => { mounted = false; };
  }, [isEditing, cip, setValues]);

  const handleCancel = () => navigate('/admin/dashboard/mesadepartes');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a4d2e]">
            {isEditing ? 'Editar usuario de Mesa de Partes' : 'Crear usuario de Mesa de Partes'}
          </h1>
          <p className="text-gray-600">{isEditing ? 'Modifica los datos del usuario' : 'Registra un nuevo usuario de mesa de partes'}</p>
        </div>
        <button onClick={handleCancel} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg">Cancelar</button>
      </div>

      {error && <ShowToast type="error" message={error} />}
      {success && <ShowToast type="success" message={success} />}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CIP *</label>
            <input
              type="text"
              value={values.CIP}
              onChange={(e) => handleChange('CIP', e.target.value)}
              disabled={isEditing}
              className={`w-full px-4 py-2 border rounded-lg ${errors.CIP ? 'border-red-500' : 'border-gray-300'} ${isEditing ? 'bg-gray-100' : ''}`}
              placeholder="Ingrese CIP"
            />
            {errors.CIP && <span className="text-red-500 text-sm">{errors.CIP}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de Usuario *</label>
            <input
              type="text"
              value={values.nombre_usuario}
              onChange={(e) => handleChange('nombre_usuario', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg ${errors.nombre_usuario ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="usuario"
            />
            {errors.nombre_usuario && <span className="text-red-500 text-sm">{errors.nombre_usuario}</span>}
          </div>

          {!isEditing && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña *</label>
                <input
                  type="password"
                  value={values.password_hash}
                  onChange={(e) => handleChange('password_hash', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg ${errors.password_hash ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Ingrese contraseña"
                />
                {errors.password_hash && <span className="text-red-500 text-sm">{errors.password_hash}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña *</label>
                <input
                  type="password"
                  value={values.confirmar_password}
                  onChange={(e) => handleChange('confirmar_password', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg ${errors.confirmar_password ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Confirme contraseña"
                />
                {errors.confirmar_password && <span className="text-red-500 text-sm">{errors.confirmar_password}</span>}
              </div>
            </>
          )}

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo *</label>
            <input
              type="text"
              value={values.nombre_completo}
              onChange={(e) => handleChange('nombre_completo', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg ${errors.nombre_completo ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Nombre completo"
            />
            {errors.nombre_completo && <span className="text-red-500 text-sm">{errors.nombre_completo}</span>}
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button type="button" onClick={handleCancel} className="px-6 py-2 border rounded-lg">Cancelar</button>
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="bg-[#1a4d2e] text-white px-6 py-2 rounded-lg disabled:opacity-50"
          >
            {isSubmitting || loading ? (isEditing ? 'Actualizando...' : 'Creando...') : (isEditing ? 'Actualizar' : 'Crear Usuario')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MesaDePartesForm;