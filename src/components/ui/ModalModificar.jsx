/**
 * ModalModificar - Modal para EDITAR un profesor existente
 * 
 * @param {Object} props
 * @param {boolean} props.abierto - Si el modal está visible
 * @param {Object} props.profesor - Datos actuales del profesor
 * @param {Function} props.onCerrar - Callback para cerrar
 * @param {Function} props.onGuardar - Callback con los datos actualizados
 * @param {boolean} props.cargando - Si la operación está en proceso
 */
import { useState, useEffect } from 'react';

const ModalModificar = ({ abierto, profesor, onCerrar, onGuardar, cargando }) => {
  const [form, setForm] = useState({ nombre: '', correo: '', contrasena: '' });
  const [errores, setErrores] = useState({});
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [cambiarContrasena, setCambiarContrasena] = useState(false);

  // Cargar datos del profesor cuando se abre el modal
  useEffect(() => {
    if (abierto && profesor) {
      setForm({
        nombre:     profesor.nombre_persona || profesor.nombre || '',
        correo:     profesor.correo_persona || profesor.correo || '',
        contrasena: '',
      });
      setErrores({});
      setMostrarContrasena(false);
      setCambiarContrasena(false);
    }
  }, [abierto, profesor]);

  if (!abierto) return null;

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    // Forzar que el nombre solo contenga letras y espacios
    if (name === 'nombre') {
      value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    }
    
    setForm(prev => ({ ...prev, [name]: value }));
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }));
  };

  const obtenerErrores = () => {
    const nuevosErrores = {};
    const nombreLimpio = form.nombre.trim();

    if (!nombreLimpio) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    } else if (nombreLimpio.length < 5 || nombreLimpio.split(/\s+/).length < 2) {
      nuevosErrores.nombre = 'Ingresa nombre y apellido completo';
    }

    if (!form.correo.trim()) nuevosErrores.correo = 'El correo es obligatorio';
    else if (!/^[^\s@]+@cesde\.edu\.co$/.test(form.correo.trim())) nuevosErrores.correo = 'El correo debe ser @cesde.edu.co';
    
    if (cambiarContrasena) {
      if (!form.contrasena.trim()) nuevosErrores.contrasena = 'La contraseña es obligatoria si deseas cambiarla';
      else if (form.contrasena.length < 8) nuevosErrores.contrasena = 'Mínimo 8 caracteres';
      else if (!/(?=.*[A-Z])(?=.*\d)/.test(form.contrasena)) nuevosErrores.contrasena = 'Debe incluir mayúscula y número';
    }

    return nuevosErrores;
  };

  const validar = () => {
    const nuevosErrores = obtenerErrores();
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    const todosLosErrores = obtenerErrores();
    if (todosLosErrores[name]) {
      setErrores(prev => ({ ...prev, [name]: todosLosErrores[name] }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validar()) {
      const identificacion = profesor?.identificacion_persona || profesor?.identificacionPersona || profesor?.id;
      
      const payload = {
        id: identificacion, // Requerido por AdminPage para saber qué URL actualizar
        identificacionPersona: identificacion,
        nombrePersona:  form.nombre.trim(),
        correoPersona:  form.correo.trim(),
        activo: profesor.activo ?? true,
        tipoPersona: profesor.tipoPersona || { idRol: 2 }
      };

      if (cambiarContrasena) {
        payload.contrasenaPersona = form.contrasena.trim();
      }

      onGuardar(payload);
    }
  };

  const identificacion = profesor?.identificacion_persona || profesor?.identificacionPersona || profesor?.id || '—';

  return (
    <div className="modal-overlay">
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Botón cerrar */}
        <button
          onClick={onCerrar}
          className="absolute top-3 right-4 text-primary text-2xl font-bold bg-transparent border-none cursor-pointer leading-none hover:text-primary-dark"
        >
          &times;
        </button>

        <h2 className="text-xl font-bold text-cesde-dark mb-4">Modificar Profesor</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">

          {/* Identificación (solo lectura) */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">
              Identificación <span className="text-gray-400 font-normal">(no editable)</span>
            </label>
            <input
              type="text"
              value={identificacion}
              readOnly
              className="input-cesde bg-gray-100 text-gray-400 cursor-not-allowed"
            />
          </div>

          {/* Nombre */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Nombre completo</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              onBlur={handleBlur}
              className="input-cesde-pink"
              placeholder="Nombre del profesor"
              disabled={cargando}
            />
            {errores.nombre && <p className="text-red-500 text-xs mt-1">{errores.nombre}</p>}
          </div>

          {/* Correo */}
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Correo electrónico</label>
            <input
              type="email"
              name="correo"
              value={form.correo}
              onChange={handleChange}
              onBlur={handleBlur}
              className="input-cesde-pink"
              placeholder="correo@ejemplo.com"
              disabled={cargando}
            />
            {errores.correo && <p className="text-red-500 text-xs mt-1">{errores.correo}</p>}
          </div>

          {/* Contraseña (opcional) */}
          <div className="border border-gray-200 rounded-lg p-3 mt-2 bg-gray-50">
            <label className="flex items-center gap-2 cursor-pointer mb-3">
              <input 
                type="checkbox" 
                checked={cambiarContrasena}
                onChange={(e) => {
                  setCambiarContrasena(e.target.checked);
                  if (!e.target.checked) {
                    setForm(prev => ({ ...prev, contrasena: '' }));
                    if (errores.contrasena) setErrores(prev => ({ ...prev, contrasena: '' }));
                  }
                }}
                className="w-4 h-4 text-primary rounded focus:ring-primary cursor-pointer border-gray-300"
                disabled={cargando}
              />
              <span className="text-sm font-semibold text-cesde-dark">Cambiar contraseña</span>
            </label>

            {cambiarContrasena && (
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Nueva contraseña <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={mostrarContrasena ? 'text' : 'password'}
                    name="contrasena"
                    value={form.contrasena}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="input-cesde-pink pr-10"
                    placeholder="••••••••"
                    disabled={cargando}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarContrasena(!mostrarContrasena)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition-colors bg-transparent border-none p-0 cursor-pointer"
                  >
                    <i className={`bi ${mostrarContrasena ? 'bi-eye-slash-fill' : 'bi-eye-fill'} text-lg`} />
                  </button>
                </div>
                {errores.contrasena && <p className="text-red-500 text-xs mt-1">{errores.contrasena}</p>}
                <p className="text-[10px] text-gray-400 mt-1">Mínimo 8 caracteres, al menos una mayúscula y un número.</p>
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary mt-2" disabled={cargando}>
            {cargando ? (
              <span className="flex items-center justify-center gap-2">
                <i className="bi bi-hourglass-split" /> Guardando...
              </span>
            ) : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModalModificar;
