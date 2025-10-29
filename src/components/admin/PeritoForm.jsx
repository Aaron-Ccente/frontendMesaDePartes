import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "../../hooks/useForm";
import { peritoService } from "../../services/peritoService";
import { validateImageFile } from "../../utils/fileUtils";
import { convertImageToWebPBase64 } from "../../utils/convertir64";
import { ComplementServices } from "../../services/complementService";
import ShowToast from "../ui/ShowToast";

const PeritoForm = () => {
  const navigate = useNavigate();
  const { cip } = useParams();
  const isEditing = Boolean(cip);
  const fileInputRef = useRef(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [options, setOptions] = useState({
    grados: [],
    turnos: [],
    tiposDepartamento: [],
  });

  const initialValues = {
    // Campos de usuario
    CIP: "",
    nombre_usuario: "",
    password_hash: "",
    confirmar_password: "",
    nombre_completo: "",

    // Campos de perito
    dni: "",
    email: "",
    unidad: "",
    fecha_integracion_pnp: "",
    fecha_incorporacion: "",
    codigo_codofin: "",
    domicilio: "",
    telefono: "",
    cursos_institucionales: "",
    cursos_extranjero: "",
    ultimo_ascenso_pnp: "",
    fotografia_url: null,

    // Campos de relación
    id_grado: "",
    id_turno: "",
    id_tipo_departamento: "",
  };

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setFieldValue,
    setValues,
  } = useForm({
    initialValues,
    onSubmit: async (formData) => {
      try {
        setLoading(true);
        setError("");
        setSuccess("");

        let result;
        if (isEditing) {
          const updateData = { ...formData };
          if (!updateData.password_hash) {
            delete updateData.password_hash;
            delete updateData.confirmar_password;
          }
          result = await peritoService.updatePerito(cip, updateData);
        } else {
          const { confirmar_password: _cp, ...createData } = formData;
          result = await peritoService.createPerito(createData);
        }

        if (result && result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }

        setSuccess(
          result.message ||
            (isEditing
              ? "Perito actualizado exitosamente"
              : "Perito creado exitosamente")
        );

        setTimeout(() => {
          navigate("/admin/dashboard/usuarios");
        }, 2000);
      } catch (error) {
        console.error("Error:", error);
        setError(error.error || "Error procesando la solicitud");
      } finally {
        setLoading(false);
      }
    },
    validate: (values) => {
      const errors = {};

      // Validaciones de usuario
      if (!values.CIP) errors.CIP = "CIP es requerido";
      if (!values.nombre_usuario)
        errors.nombre_usuario = "Nombre de usuario es requerido";
      if (!values.nombre_completo)
        errors.nombre_completo = "Nombre completo es requerido";

      if (!isEditing && !values.password_hash) {
        errors.password_hash = "Contraseña es requerida";
      }

      if (
        values.password_hash &&
        values.password_hash !== values.confirmar_password
      ) {
        errors.confirmar_password = "Las contraseñas no coinciden";
      }

      // Validaciones de perito
      if (!values.dni) errors.dni = "DNI es requerido";
      if (!values.email) errors.email = "Email es requerido";
      if (!values.codigo_codofin)
        errors.codigo_codofin = "Código Codofin es requerido";

      return errors;
    },
  });

  // Cargar opciones para los select (tanto para crear como editar)
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [gradosRes, turnosRes, tiposDepartamentoRes] = await Promise.all([
          ComplementServices.getGrados(),
          ComplementServices.getTurnos(),
          ComplementServices.getTiposDepartamento(),
        ]);

        setOptions({
          grados: gradosRes.data || [],
          turnos: turnosRes.data || [],
          tiposDepartamento: tiposDepartamentoRes.data || [],
        });
      } catch (error) {
        console.error("Error cargando opciones:", error);
        setError("Error cargando opciones del formulario");
      }
    };

    loadOptions();
  }, []);

  // Cargar datos del perito para edición
  useEffect(() => {
    if (isEditing && cip) {
      const loadPerito = async () => {
        try {
          setLoading(true);
          setError("");
          const response = await peritoService.getPeritoByCIP(cip);

          if (!response.success) {
            setError(response.message || "Error cargando perito");
            return;
          }

          const perito = response.data;

          // Función para formatear fechas
          const formatDateForInput = (dateString) => {
            if (!dateString) return "";

            try {
              const date = new Date(dateString);
              if (!isNaN(date.getTime())) {
                return date.toISOString().split("T")[0];
              }
            } catch (error) {
              console.error("Error formateando fecha:", error);
            }
            return "";
          };

          // datos para el formulario
          const formData = {
            // Campos de usuario
            CIP: perito.CIP || "",
            nombre_usuario: perito.nombre_usuario || "",
            nombre_completo: perito.nombre_completo || "",
            password_hash: "",
            confirmar_password: "",

            // Campos de perito
            dni: perito.dni || "",
            email: perito.email || "",
            unidad: perito.unidad || "",
            fecha_integracion_pnp: formatDateForInput(
              perito.fecha_integracion_pnp
            ),
            fecha_incorporacion: formatDateForInput(perito.fecha_incorporacion),
            codigo_codofin: perito.codigo_codofin || "",
            domicilio: perito.domicilio || "",
            telefono: perito.telefono || "",
            cursos_institucionales: Array.isArray(perito.cursos_institucionales)
              ? perito.cursos_institucionales.join(", ")
              : perito.cursos_institucionales || "",
            cursos_extranjero: Array.isArray(perito.cursos_extranjero)
              ? perito.cursos_extranjero.join(", ")
              : perito.cursos_extranjero || "",
            ultimo_ascenso_pnp: formatDateForInput(perito.ultimo_ascenso_pnp),
            fotografia_url: perito.fotografia_url || null,

            // Campos de relación
            id_especialidad: perito.id_especialidad || "",
            id_grado: perito.id_grado || "",
            id_turno: perito.id_turno || "",
            id_tipo_departamento: perito.id_tipo_departamento || "",
          };
          setValues(formData);

          if (perito.fotografia_url) {
            setPhotoPreview(perito.fotografia_url);
          }
        } catch (error) {
          console.error("Error cargando perito:", error);
          setError(
            "Error cargando datos del perito: " +
              (error.message || "Error desconocido")
          );
        } finally {
          setLoading(false);
        }
      };

      loadPerito();
    }
  }, [isEditing, cip, setValues]);

  const handleCancel = () => {
    navigate("/admin/dashboard/usuarios");
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
      // Convertir en Base64
      const webpBase64 = await convertImageToWebPBase64(file);
      setPhotoPreview(webpBase64);
      setFieldValue("fotografia_url", webpBase64);
      setError("");
    } catch (error) {
      console.error("Error procesando foto:", error);
      setError("Error al procesar la foto");
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setFieldValue("fotografia_url", null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6 dark:bg-gray-900 dark:text-gray-100 min-h-screen p-4">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#1a4d2e] dark:text-green-400 mb-2">
              {isEditing ? "Editar Perito" : "Crear Nuevo Perito"}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {isEditing
                ? "Modificar información del perito"
                : "Agregar nuevo perito al sistema"}
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && <ShowToast type={"error"} message={error} />}

      {/* Success Message */}
      {success && <ShowToast type={"success"} message={success} />}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información de Usuario */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-[#1a4d2e] dark:text-green-400 mb-4 border-b pb-2 dark:border-gray-700">
              Información de Usuario
            </h3>
          </div>

          <div>
            <div>
              <label
                htmlFor="CIP"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                CIP *
              </label>
              <input
                type="text"
                id="CIP"
                name="CIP"
                value={values.CIP}
                onChange={(e) => handleChange("CIP", e.target.value)}
                disabled={isEditing}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1a4d2e] dark:focus:ring-green-400 focus:border-transparent ${
                  errors.CIP
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } ${
                  isEditing
                    ? "bg-gray-100 dark:bg-gray-700"
                    : "bg-white dark:bg-gray-700"
                } dark:text-white`}
                placeholder="Ingrese el CIP"
              />
              {errors.CIP && (
                <span className="text-red-500 text-sm">{errors.CIP}</span>
              )}
            </div>

            <div>
              <label
                htmlFor="nombre_usuario"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Nombre de Usuario *
              </label>
              <input
                type="text"
                id="nombre_usuario"
                name="nombre_usuario"
                autoComplete="username"
                value={values.nombre_usuario}
                onChange={(e) => handleChange("nombre_usuario", e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1a4d2e] dark:focus:ring-green-400 focus:border-transparent ${
                  errors.nombre_usuario
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } bg-white dark:bg-gray-700 dark:text-white`}
                placeholder="usuario123"
              />
              {errors.nombre_usuario && (
                <span className="text-red-500 text-sm">
                  {errors.nombre_usuario}
                </span>
              )}
            </div>

            <div className="lg:col-span-2">
              <label
                htmlFor="nombre_completo"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Nombre Completo *
              </label>
              <input
                type="text"
                id="nombre_completo"
                autoComplete="username"
                name="nombre_completo"
                value={values.nombre_completo}
                onChange={(e) =>
                  handleChange("nombre_completo", e.target.value)
                }
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1a4d2e] dark:focus:ring-green-400 focus:border-transparent ${
                  errors.nombre_completo
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } bg-white dark:bg-gray-700 dark:text-white`}
                placeholder="Ingrese el nombre completo"
              />
              {errors.nombre_completo && (
                <span className="text-red-500 text-sm">
                  {errors.nombre_completo}
                </span>
              )}
            </div>
          </div>

          {/* Foto */}
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fotografía
            </label>
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a4d2e] dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Formatos: JPEG, PNG, GIF. Se convertirán automáticamente a WebP.
                Máximo: 5MB
              </p>

              {/* Loading indicator para foto */}
              {loading && isEditing && !photoPreview && (
                <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1a4d2e] dark:border-green-400 mr-2"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Cargando foto...
                  </span>
                </div>
              )}

              {!photoPreview && !loading && (
                <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      {isEditing
                        ? "No hay foto cargada"
                        : "Selecciona una foto"}
                    </p>
                  </div>
                </div>
              )}

              {photoPreview && (
                <div className="flex justify-center items-center">
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Vista previa"
                      className="w-56 h-60 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                      onError={(e) => {
                        console.error("Error cargando imagen:", e);
                        setError("Error al mostrar la imagen");
                      }}
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute top-0 right-0 m-2 bg-red-500 text-white rounded-full w-8 h-8 text-xl hover:bg-red-600"
                    >
                      x
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {!isEditing && (
            <>
              <div>
                <label
                  htmlFor="password_hash"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Contraseña *
                </label>
                <input
                  type="password"
                  id="password_hash"
                  name="password_hash"
                  autoComplete="new-password"
                  value={values.password_hash}
                  onChange={(e) =>
                    handleChange("password_hash", e.target.value)
                  }
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1a4d2e] dark:focus:ring-green-400 focus:border-transparent ${
                    errors.password_hash
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-700 dark:text-white`}
                  placeholder="Ingrese la contraseña"
                />
                {errors.password_hash && (
                  <span className="text-red-500 text-sm">
                    {errors.password_hash}
                  </span>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmar_password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Confirmar Contraseña *
                </label>
                <input
                  type="password"
                  id="confirmar_password"
                  autoComplete="new-password"
                  name="confirmar_password"
                  value={values.confirmar_password}
                  onChange={(e) =>
                    handleChange("confirmar_password", e.target.value)
                  }
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1a4d2e] dark:focus:ring-green-400 focus:border-transparent ${
                    errors.confirmar_password
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } bg-white dark:bg-gray-700 dark:text-white`}
                  placeholder="Confirme la contraseña"
                />
                {errors.confirmar_password && (
                  <span className="text-red-500 text-sm">
                    {errors.confirmar_password}
                  </span>
                )}
              </div>
            </>
          )}

          {/* Información de Perito */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-[#1a4d2e] dark:text-green-400 mb-4 border-b pb-2 dark:border-gray-700">
              Información del Perito
            </h3>
          </div>

          <div>
            <label
              htmlFor="dni"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              DNI *
            </label>
            <input
              type="text"
              id="dni"
              name="dni"
              value={values.dni}
              onChange={(e) => handleChange("dni", e.target.value)}
              maxLength="8"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1a4d2e] dark:focus:ring-green-400 focus:border-transparent ${
                errors.dni
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-700 dark:text-white`}
              placeholder="12345678"
            />
            {errors.dni && (
              <span className="text-red-500 text-sm">{errors.dni}</span>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Email *
            </label>
            <input
              type="email"
              id="email"
              autoComplete="username"
              name="email"
              value={values.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1a4d2e] dark:focus:ring-green-400 focus:border-transparent ${
                errors.email
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-700 dark:text-white`}
              placeholder="correo@pnp.gob.pe"
            />
            {errors.email && (
              <span className="text-red-500 text-sm">{errors.email}</span>
            )}
          </div>

          <div>
            <label
              htmlFor="telefono"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Teléfono
            </label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={values.telefono}
              onChange={(e) => handleChange("telefono", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a4d2e] dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
              placeholder="999999999"
            />
          </div>

          <div>
            <label
              htmlFor="unidad"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Unidad
            </label>
            <input
              type="text"
              id="unidad"
              name="unidad"
              value={values.unidad}
              onChange={(e) => handleChange("unidad", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a4d2e] dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
              placeholder="Unidad PNP"
            />
          </div>

          <div>
            <label
              htmlFor="codigo_codofin"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Código Codofin *
            </label>
            <input
              type="text"
              id="codigo_codofin"
              name="codigo_codofin"
              value={values.codigo_codofin}
              onChange={(e) => handleChange("codigo_codofin", e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1a4d2e] dark:focus:ring-green-400 focus:border-transparent ${
                errors.codigo_codofin
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } bg-white dark:bg-gray-700 dark:text-white`}
              placeholder="COD001"
            />
            {errors.codigo_codofin && (
              <span className="text-red-500 text-sm">
                {errors.codigo_codofin}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor="fecha_integracion_pnp"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Fecha de Integración PNP
            </label>
            <input
              type="date"
              id="fecha_integracion_pnp"
              name="fecha_integracion_pnp"
              value={values.fecha_integracion_pnp || ""}
              onChange={(e) =>
                handleChange("fecha_integracion_pnp", e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a4d2e] dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="fecha_incorporacion"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Fecha de Incorporación
            </label>
            <input
              type="date"
              id="fecha_incorporacion"
              name="fecha_incorporacion"
              value={values.fecha_incorporacion || ""}
              onChange={(e) =>
                handleChange("fecha_incorporacion", e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a4d2e] dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label
              htmlFor="ultimo_ascenso_pnp"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Último Ascenso PNP
            </label>
            <input
              type="date"
              id="ultimo_ascenso_pnp"
              name="ultimo_ascenso_pnp"
              value={values.ultimo_ascenso_pnp || ""}
              onChange={(e) =>
                handleChange("ultimo_ascenso_pnp", e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a4d2e] dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="lg:col-span-2">
            <label
              htmlFor="domicilio"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Domicilio
            </label>
            <input
              type="text"
              id="domicilio"
              name="domicilio"
              value={values.domicilio}
              onChange={(e) => handleChange("domicilio", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a4d2e] dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
              placeholder="Dirección completa"
            />
          </div>

          <div className="lg:col-span-2">
            <label
              htmlFor="cursos_institucionales"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Cursos Institucionales
            </label>
            <textarea
              id="cursos_institucionales"
              name="cursos_institucionales"
              value={values.cursos_institucionales}
              onChange={(e) =>
                handleChange("cursos_institucionales", e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a4d2e] dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
              placeholder="Lista de cursos institucionales (separados por coma)"
              rows="3"
            />
          </div>

          <div className="lg:col-span-2">
            <label
              htmlFor="cursos_extranjero"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Cursos en el Extranjero
            </label>
            <textarea
              id="cursos_extranjero"
              name="cursos_extranjero"
              value={values.cursos_extranjero}
              onChange={(e) =>
                handleChange("cursos_extranjero", e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a4d2e] dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
              placeholder="Lista de cursos en el extranjero (separados por coma)"
              rows="3"
            />
          </div>

          {/* Relaciones */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold text-[#1a4d2e] dark:text-green-400 mb-4 border-b pb-2 dark:border-gray-700">
              Información de Relación
            </h3>
          </div>

          <div>
            <label
              htmlFor="id_tipo_departamento"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Tipo de Departamento
            </label>
            <select
              id="id_tipo_departamento"
              name="id_tipo_departamento"
              value={values.id_tipo_departamento || ""}
              onChange={(e) => {
                handleChange("id_tipo_departamento", e.target.value);
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a4d2e] dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
            >
              <option value="">Seleccione un tipo de departamento</option>
              {options.tiposDepartamento.map((tipo) => (
                <option
                  key={tipo.id_tipo_departamento}
                  value={tipo.id_tipo_departamento}
                >
                  {tipo.nombre_departamento}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="id_grado"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Grado
            </label>
            <select
              id="id_grado"
              name="id_grado"
              value={values.id_grado || ""}
              onChange={(e) => handleChange("id_grado", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a4d2e] dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
            >
              <option value="">Seleccione un grado</option>
              {options.grados.map((grado) => (
                <option key={grado.id_grado} value={grado.id_grado}>
                  {grado.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="id_turno"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Turno
            </label>
            <select
              id="id_turno"
              name="id_turno"
              value={values.id_turno || ""}
              onChange={(e) => handleChange("id_turno", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#1a4d2e] dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white"
            >
              <option value="">Seleccione un turno</option>
              {options.turnos.map((turno) => (
                <option key={turno.id_turno} value={turno.id_turno}>
                  {turno.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="bg-[#1a4d2e] hover:bg-[#2d7d4a] dark:bg-green-600 dark:hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting || loading
              ? isEditing
                ? "Actualizando..."
                : "Creando..."
              : isEditing
              ? "Actualizar Perito"
              : "Crear Perito"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PeritoForm;
