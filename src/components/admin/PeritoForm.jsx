import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from '../../hooks/useForm';
import { peritoService } from '../../services/peritoService';
import { 
  validateImageFile, 
  validateSignatureFile,
  canvasToFile,
} from '../../utils/fileUtils';
import { convertImageToWebPBase64 } from '../../utils/convertir64';

const PeritoForm = () => {
  const navigate = useNavigate();
  const { cip } = useParams();
  const isEditing = Boolean(cip);
  const fileInputRef = useRef(null);
  const signatureCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const initialValues = {
    CIP: '',
    Nombres: '',
    Apellidos: '',
    Email: '',
    NombreUsuario: '',
    Contrasena: '',
    ConfirmarContrasena: '',
    DNI: '',
    FechaIntegracion: '',
    FechaIncorporacion: '',
    CodigoCodofin: '',
    Domicilio: '',
    Seccion: '',
    Especialidad: '',
    Grado: '',
    Telefono: '',
    UltimoCenso: '',
    Fotografia: null,
    Firma: null
  };

  const { values, errors, isSubmitting, handleChange, handleSubmit, setFieldValue } = useForm({
    initialValues,
    onSubmit: async (formData) => {
      try {
        setLoading(true);
        setError('');
        setSuccess('');

        let result;
        if (isEditing) {
          // Actualizar perito existente
          const { CIP, Contrasena, ConfirmarContrasena, ...updateData } = formData;
          result = await peritoService.updatePerito(cip, updateData);
        } else {
          // Crear nuevo perito
          const { ConfirmarContrasena, ...createData } = formData;
          result = await peritoService.createPerito(createData);
        }
        
        // Mostrar mensaje de éxito
        setSuccess(result.message || (isEditing ? 'Perito actualizado exitosamente' : 'Perito creado exitosamente'));
        
        // Redirigir después de 2 segundos para que el usuario vea el mensaje
        setTimeout(() => {
          navigate('/admin/dashboard/usuarios');
        }, 2000);
      } catch (error) {
        console.error('Error:', error);
        setError(error.message || 'Error procesando la solicitud');
      } finally {
        setLoading(false);
      }
    },
    validate: (values) => {
      const errors = {};
      
      if (!values.CIP) errors.CIP = 'CIP es requerido';
      if (!values.Nombres) errors.Nombres = 'Nombres son requeridos';
      if (!values.Apellidos) errors.Apellidos = 'Apellidos son requeridos';
      if (!values.Email) errors.Email = 'Email es requerido';
      if (!values.NombreUsuario) errors.NombreUsuario = 'Nombre de usuario es requerido';
      if (!values.DNI) errors.DNI = 'DNI es requerido';
      if (!values.CodigoCodofin) errors.CodigoCodofin = 'Código Codofin es requerido';
      
      if (!isEditing && !values.Contrasena) {
        errors.Contrasena = 'Contraseña es requerida';
      }
      
      if (values.Contrasena && values.Contrasena !== values.ConfirmarContrasena) {
        errors.ConfirmarContrasena = 'Las contraseñas no coinciden';
      }
      
      return errors;
    }
  });

  // Cargar datos del perito para edición
  useEffect(() => {
    if (isEditing && cip) {
      const loadPerito = async () => {
        try {
          setLoading(true);
          setError('');
          const response = await peritoService.getPeritoByCIP(cip);
          const perito = response.data;
          
          // Función para formatear fechas
          const formatDateForInput = (dateString) => {
            if (!dateString) return '';
            
            // fecha YYYY-MM-DD
            if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
              return dateString;
            }
            
            if (dateString instanceof Date) {
              const isoDate = dateString.toISOString().split('T')[0];
              return isoDate;
            }

            if (typeof dateString === 'string') {
              try {
                const date = new Date(dateString);
                if (!isNaN(date.getTime())) {
                  const isoDate = date.toISOString().split('T')[0];
                  return isoDate;
                }
              } catch (error) {
                console.log(error)
              }
            }
            return '';
          };
          Object.keys(perito).forEach(key => {
            if (perito[key] !== null && perito[key] !== undefined) {
              // Formatear fechas específicamente
              if (key === 'FechaIntegracion' || key === 'FechaIncorporacion') {
                const fechaFormateada = formatDateForInput(perito[key]);
                setFieldValue(key, fechaFormateada);
              } else {
                setFieldValue(key, perito[key]);
              }
            }
          });

          // Mostrar foto y firma si existen
          if (perito.Fotografia) {
            try {
  
              // La foto ya viene como Base64 del backend
              setPhotoPreview(perito.Fotografia);
            } catch (error) {
              setError('Error cargando foto del perito: ' + error.message);
            }
          } else {
            console.log('No hay foto para el perito');
          }
          
          if (perito.Firma) {
            try {
              // La firma viene como Base64
              setSignaturePreview(perito.Firma);
            } catch (error) {
              setError('Error cargando firma del perito: ' + error.message);
            }
          } else {
            console.log('No hay firma para el perito');
          }
        } catch (error) {
          setError('Error cargando datos del perito: ' + (error.message || 'Error desconocido'));
        } finally {
          setLoading(false);
        }
      };

      loadPerito();
    }
  }, [isEditing, cip, setFieldValue]);

  const handleCancel = () => {
    navigate('/admin/dashboard/usuarios');
  };

  // Manejo de foto
  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    try {
      // Convertir a WebP y Base64
      const webpBase64 = await convertImageToWebPBase64(file);
      setPhotoPreview(webpBase64);
      setFieldValue('Fotografia', webpBase64);
      setError(''); // Limpiar errores previos
    } catch (error) {
      console.error('Error procesando foto:', error);
      setError('Error al procesar la foto');
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setFieldValue('Fotografia', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Manejo de firma
  const handleSignatureFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateSignatureFile(file);
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    try {
      // Convertir a WebP y Base64
      const webpBase64 = await convertImageToWebPBase64(file);
      setSignaturePreview(webpBase64);
      setFieldValue('Firma', webpBase64);
      setError(''); // Limpiar errores previos
    } catch (error) {
      console.error('Error procesando firma:', error);
      setError('Error al procesar la firma');
    }
  };

  // Canvas de firma
  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignaturePreview(null);
    setFieldValue('Firma', null);
  };

  const saveSignature = async () => {
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Verificar si hay algo dibujado
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const hasContent = imageData.data.some(pixel => pixel !== 0);
    
    if (!hasContent) {
      setError('Por favor dibuja una firma antes de guardar');
      return;
    }

    try {
      const signatureFile = await canvasToFile(canvas, 'firma.png');
      // Convertir a WebP y Base64
      const webpBase64 = await convertImageToWebPBase64(signatureFile);
      setSignaturePreview(webpBase64);
      setFieldValue('Firma', webpBase64);
      setError(''); // Limpiar errores previos
    } catch (error) {
      console.error('Error guardando firma:', error);
      setError('Error al guardar la firma');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1a4d2e] mb-2">
              {isEditing ? 'Editar Perito' : 'Crear Nuevo Perito'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Modificar información del perito' : 'Agregar nuevo perito al sistema'}
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-xl">⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-xl">✅</span>
            <span>{success}</span>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información Personal */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-[#1a4d2e] mb-4 border-b pb-2">
              Información Personal
            </h3>
          </div>

          <div>
            <label htmlFor="CIP" className="block text-sm font-medium text-gray-700 mb-2">
              CIP *
            </label>
            <input
              type="text"
              id="CIP"
              name="CIP"
              value={values.CIP}
              onChange={(e) => handleChange('CIP', e.target.value)}
              disabled={isEditing}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent ${
                errors.CIP ? 'border-red-500' : 'border-gray-300'
              } ${isEditing ? 'bg-gray-100' : ''}`}
              placeholder="Ingrese el CIP"
            />
            {errors.CIP && <span className="text-red-500 text-sm">{errors.CIP}</span>}
          </div>

          <div>
            <label htmlFor="DNI" className="block text-sm font-medium text-gray-700 mb-2">
              DNI *
            </label>
            <input
              type="text"
              id="DNI"
              name="DNI"
              value={values.DNI}
              onChange={(e) => handleChange('DNI', e.target.value)}
              maxLength="8"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent ${
                errors.DNI ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="12345678"
            />
            {errors.DNI && <span className="text-red-500 text-sm">{errors.DNI}</span>}
          </div>

          <div>
            <label htmlFor="Nombres" className="block text-sm font-medium text-gray-700 mb-2">
              Nombres *
            </label>
            <input
              type="text"
              id="Nombres"
              name="Nombres"
              value={values.Nombres}
              onChange={(e) => handleChange('Nombres', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent ${
                errors.Nombres ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ingrese los nombres"
            />
            {errors.Nombres && <span className="text-red-500 text-sm">{errors.Nombres}</span>}
          </div>

          <div>
            <label htmlFor="Apellidos" className="block text-sm font-medium text-gray-700 mb-2">
              Apellidos *
            </label>
            <input
              type="text"
              id="Apellidos"
              name="Apellidos"
              value={values.Apellidos}
              onChange={(e) => handleChange('Apellidos', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent ${
                errors.Apellidos ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ingrese los apellidos"
            />
            {errors.Apellidos && <span className="text-red-500 text-sm">{errors.Apellidos}</span>}
          </div>

          <div>
            <label htmlFor="Email" className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="Email"
              name="Email"
              value={values.Email}
              onChange={(e) => handleChange('Email', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent ${
                errors.Email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="correo@pnp.gob.pe"
            />
            {errors.Email && <span className="text-red-500 text-sm">{errors.Email}</span>}
          </div>

          <div>
            <label htmlFor="Telefono" className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              id="Telefono"
              name="Telefono"
              value={values.Telefono}
              onChange={(e) => handleChange('Telefono', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
              placeholder="999999999"
            />
          </div>

          {/* Información de Usuario */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-[#1a4d2e] mb-4 border-b pb-2">
              Información de Usuario
            </h3>
          </div>

          <div>
            <label htmlFor="NombreUsuario" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de Usuario *
            </label>
            <input
              type="text"
              id="NombreUsuario"
              name="NombreUsuario"
              value={values.NombreUsuario}
              onChange={(e) => handleChange('NombreUsuario', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent ${
                errors.NombreUsuario ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="usuario123"
            />
            {errors.NombreUsuario && <span className="text-red-500 text-sm">{errors.NombreUsuario}</span>}
          </div>

          {!isEditing && (
            <>
              <div>
                <label htmlFor="Contrasena" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña *
                </label>
                <input
                  type="password"
                  id="Contrasena"
                  name="Contrasena"
                  value={values.Contrasena}
                  onChange={(e) => handleChange('Contrasena', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent ${
                    errors.Contrasena ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ingrese la contraseña"
                />
                {errors.Contrasena && <span className="text-red-500 text-sm">{errors.Contrasena}</span>}
              </div>

              <div>
                <label htmlFor="ConfirmarContrasena" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Contraseña *
                </label>
                <input
                  type="password"
                  id="ConfirmarContrasena"
                  name="ConfirmarContrasena"
                  value={values.ConfirmarContrasena}
                  onChange={(e) => handleChange('ConfirmarContrasena', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent ${
                    errors.ConfirmarContrasena ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Confirme la contraseña"
                />
                {errors.ConfirmarContrasena && <span className="text-red-500 text-sm">{errors.ConfirmarContrasena}</span>}
              </div>
            </>
          )}

          {/* Información Profesional */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-[#1a4d2e] mb-4 border-b pb-2">
              Información Profesional
            </h3>
          </div>

          <div>
            <label htmlFor="CodigoCodofin" className="block text-sm font-medium text-gray-700 mb-2">
              Código Codofin *
            </label>
            <input
              type="text"
              id="CodigoCodofin"
              name="CodigoCodofin"
              value={values.CodigoCodofin}
              onChange={(e) => handleChange('CodigoCodofin', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent ${
                errors.CodigoCodofin ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="COD001"
            />
            {errors.CodigoCodofin && <span className="text-red-500 text-sm">{errors.CodigoCodofin}</span>}
          </div>

          <div>
            <label htmlFor="Grado" className="block text-sm font-medium text-gray-700 mb-2">
              Grado
            </label>
            <select
              id="Grado"
              name="Grado"
              value={values.Grado}
              onChange={(e) => handleChange('Grado', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
            >
              <option value="">Seleccione un grado</option>
              <option value="General">General</option>
              <option value="Coronel">Coronel</option>
              <option value="Teniente Coronel">Teniente Coronel</option>
              <option value="Mayor">Mayor</option>
              <option value="Capitán">Capitán</option>
              <option value="Teniente">Teniente</option>
              <option value="Subteniente">Subteniente</option>
              <option value="Oficial">Oficial</option>
            </select>
          </div>

          <div>
            <label htmlFor="Seccion" className="block text-sm font-medium text-gray-700 mb-2">
              Sección
            </label>
            <select
              id="Seccion"
              name="Seccion"
              value={values.Seccion}
              onChange={(e) => handleChange('Seccion', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
            >
              <option value="">Seleccione una sección</option>
              <option value="Balística">Balística</option>
              <option value="Documentología">Documentología</option>
              <option value="Medicina Legal">Medicina Legal</option>
              <option value="Química">Química</option>
              <option value="Biología">Biología</option>
              <option value="Informática">Informática</option>
              <option value="Odontología">Odontología</option>
              <option value="Psicología">Psicología</option>
            </select>
          </div>

          <div>
            <label htmlFor="Especialidad" className="block text-sm font-medium text-gray-700 mb-2">
              Especialidad
            </label>
            <input
              type="text"
              id="Especialidad"
              name="Especialidad"
              value={values.Especialidad}
              onChange={(e) => handleChange('Especialidad', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
              placeholder="Ej: Armas de Fuego"
            />
          </div>

          <div>
            <label htmlFor="FechaIntegracion" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Integración
            </label>
            <input
              type="date"
              id="FechaIntegracion"
              name="FechaIntegracion"
              value={values.FechaIntegracion || ''}
              onChange={(e) => handleChange('FechaIntegracion', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
            />
            
          </div>

          <div>
            <label htmlFor="FechaIncorporacion" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Incorporación
            </label>
            <input
              type="date"
              id="FechaIncorporacion"
              name="FechaIncorporacion"
              value={values.FechaIncorporacion || ''}
              onChange={(e) => handleChange('FechaIncorporacion', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="UltimoCenso" className="block text-sm font-medium text-gray-700 mb-2">
              Último Censo
            </label>
            <input
              type="text"
              id="UltimoCenso"
              name="UltimoCenso"
              value={values.UltimoCenso}
              onChange={(e) => handleChange('UltimoCenso', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
              placeholder="2024"
            />
          </div>

          <div className="lg:col-span-2">
            <label htmlFor="Domicilio" className="block text-sm font-medium text-gray-700 mb-2">
              Domicilio
            </label>
            <input
              type="text"
              id="Domicilio"
              name="Domicilio"
              value={values.Domicilio}
              onChange={(e) => handleChange('Domicilio', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
              placeholder="Dirección completa"
            />
          </div>

          {/* Foto y Firma */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-[#1a4d2e] mb-4 border-b pb-2">
              Foto y Firma
            </h3>
            {isEditing && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">ℹ️</span>
                  <span className="text-sm">
                    <strong>Imágenes existentes:</strong> Se cargan automáticamente desde la base de datos en formato WebP. 
                    <br />
                    <strong>Para reemplazar:</strong> Sube un nuevo archivo y se convertirá automáticamente a WebP.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Foto */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fotografía
            </label>
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
              />
              <p className="text-xs text-gray-500">
                Formatos: JPEG, PNG, GIF. Se convertirán automáticamente a WebP. Máximo: 5MB
              </p>
              
              {/* Loading indicator para foto */}
              {loading && isEditing && !photoPreview && (
                <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1a4d2e] mr-2"></div>
                  <span className="text-sm text-gray-600">Cargando foto...</span>
                </div>
              )}
              
              {!photoPreview && !loading && (
                <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <span className="text-gray-400 text-4xl">📷</span>
                    <p className="text-sm text-gray-500 mt-2">
                      {isEditing ? 'No hay foto cargada' : 'Selecciona una foto'}
                    </p>
                  </div>
                </div>
              )}
              
              {photoPreview && (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Vista previa"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                    onError={(e) => {
                      console.error('Error cargando imagen:', e);
                      setError('Error al mostrar la imagen');
                    }}
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                  {/* Indicador de tipo de imagen */}
                  <div className="absolute -bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    WebP
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Firma */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Firma
            </label>
            <div className="space-y-3">
              {/* Canvas para dibujar firma */}
              <div className="border border-gray-300 rounded-lg p-2">
                <canvas
                  ref={signatureCanvasRef}
                  width="300"
                  height="150"
                  className="border border-gray-200 rounded cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
                <div className="flex space-x-2 mt-2">
                  <button
                    type="button"
                    onClick={saveSignature}
                    className="px-3 py-1 bg-[#1a4d2e] text-white text-sm rounded hover:bg-[#2d7d4a]"
                  >
                    Guardar Firma
                  </button>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                  >
                    Limpiar
                  </button>
                </div>
              </div>

              {/* Subir archivo de firma */}
              <div>
                <input
                  type="file"
                  accept="image/*,.svg"
                  onChange={handleSignatureFile}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a4d2e] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formatos: SVG, PNG, JPEG. Se convertirán automáticamente a WebP. Máximo: 2MB
                </p>
              </div>

              {/* Vista previa de firma */}
              {/* Loading indicator para firma */}
              {loading && isEditing && !signaturePreview && (
                <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1a4d2e] mr-2"></div>
                  <span className="text-sm text-gray-600">Cargando firma...</span>
                </div>
              )}
              
              {!signaturePreview && !loading && (
                <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <span className="text-gray-400 text-4xl">✍️</span>
                    <p className="text-sm text-gray-500 mt-2">
                      {isEditing ? 'No hay firma cargada' : 'Dibuja o sube una firma'}
                    </p>
                  </div>
                </div>
              )}
              
              {signaturePreview && (
                <div className="relative">
                  <img
                    src={signaturePreview}
                    alt="Vista previa de firma"
                    className="w-32 h-20 object-contain border border-gray-300 rounded-lg"
                    onError={(e) => {
                      console.error('Error cargando firma:', e);
                      setError('Error al mostrar la firma');
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSignaturePreview(null);
                      setFieldValue('Firma', null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                  {/* Indicador de tipo de firma */}
                  <div className="absolute -bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    WebP
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="bg-[#1a4d2e] hover:bg-[#2d7d4a] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting || loading
              ? (isEditing ? 'Actualizando...' : 'Creando...') 
              : (isEditing ? 'Actualizar Perito' : 'Crear Perito')
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default PeritoForm;
