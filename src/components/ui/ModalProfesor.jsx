/**
 * ModalProfesor - Modal para CREAR un nuevo profesor
 * 
 * @param {Object} props
 * @param {boolean} props.abierto - Si el modal está visible
 * @param {Function} props.onCerrar - Callback para cerrar el modal
 * @param {Function} props.onGuardar - Callback con los datos del formulario
 * @param {boolean} props.cargando - Si la operación está en proceso
 */
import { useState, useEffect } from 'react';

const camposIniciales = {
  nombre: '',
  cedula: '',
  correo: '',
  contrasena: '',
};


const ModalProfesor = ({ abierto, onCerrar, onGuardar, cargando }) => {
  const [form, setForm] = useState(camposIniciales);
  const [errores, setErrores] = useState({});

  // Limpiar formulario al abrir el modal
  useEffect(() => {
    if (abierto) {
      setForm(camposIniciales);
      setErrores({});
    }
  }, [abierto]);

  if (!abierto) return null;

  /**
   * Actualiza un campo del formulario
   */
  const handleChange = (e) => {
    let { name, value } = e.target;
    
    // Forzar que la cédula solo contenga números
    if (name === 'cedula') {
      value = value.replace(/\D/g, '');
    }

    // Forzar que el nombre solo contenga letras y espacios
    if (name === 'nombre') {
      value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    }

    setForm(prev => ({ ...prev, [name]: value }));
    // Limpia el error del campo mientras el usuario escribe
    if (errores[name]) {
      setErrores(prev => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Valida todos los campos del formulario
   * @returns {boolean} true si es válido
   */
  const obtenerErrores = () => {
    const nuevosErrores = {};
    const nombreLimpio = form.nombre.trim();

    if (!nombreLimpio) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    } else if (nombreLimpio.length < 5 || nombreLimpio.split(/\s+/).length < 2) {
      nuevosErrores.nombre = 'Ingresa nombre y apellido completo';
    }

    if (!form.cedula.trim()) nuevosErrores.cedula = 'La cédula es obligatoria';
    else if (!/^\d{5,12}$/.test(form.cedula.trim())) nuevosErrores.cedula = 'La cédula debe tener entre 5 y 12 dígitos';

    if (!form.correo.trim()) nuevosErrores.correo = 'El correo es obligatorio';
    else if (!/^[^\s@]+@cesde\.edu\.co$/.test(form.correo.trim())) nuevosErrores.correo = 'El correo debe ser @cesde.edu.co';

    if (!form.contrasena.trim()) nuevosErrores.contrasena = 'La contraseña es obligatoria';
    else if (form.contrasena.length < 8) nuevosErrores.contrasena = 'Mínimo 8 caracteres';
    else if (!/(?=.*[A-Z])(?=.*\d)/.test(form.contrasena)) nuevosErrores.contrasena = 'Debe incluir mayúscula y número';

    return nuevosErrores;
  };

  /**
   * Valida todos los campos del formulario
   * @returns {boolean} true si es válido
   */
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

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validar()) {
      // Campos en camelCase tal como los espera MPersona en Spring Boot
      onGuardar({
        identificacionPersona: form.cedula.trim(),
        nombrePersona:         form.nombre.trim(),
        correoPersona:         form.correo.trim(),
        contrasenaPersona:     form.contrasena,
        tipoPersona:           { idRol: 2 },   // profesor
        activo:                true,
      });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Botón cerrar */}
        <button
          onClick={onCerrar}
          className="absolute top-3 right-4 text-primary text-2xl font-bold bg-transparent border-none cursor-pointer leading-none hover:text-primary-dark"
          aria-label="Cerrar modal"
        >
          &times;
        </button>

        {/* Título */}
        <h2 className="text-xl font-bold text-cesde-dark text-center uppercase mb-4 leading-snug">
          Crear Usuario <br /> Profesor
        </h2>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Nombre */}
          <div>
            <input
              type="text"
              name="nombre"
              placeholder="Ingresar nombre completo"
              value={form.nombre}
              onChange={handleChange}
              onBlur={handleBlur}
              className="input-cesde-pink"
              disabled={cargando}
            />
            {errores.nombre && <p className="text-red-500 text-xs mt-1">{errores.nombre}</p>}
          </div>

          {/* Cédula */}
          <div>
            <input
              type="text"
              name="cedula"
              placeholder="Ingresar cédula"
              value={form.cedula}
              onChange={handleChange}
              onBlur={handleBlur}
              className="input-cesde-pink"
              disabled={cargando}
            />
            {errores.cedula && <p className="text-red-500 text-xs mt-1">{errores.cedula}</p>}
          </div>

          {/* Correo */}
          <div>
            <input
              type="email"
              name="correo"
              placeholder="Ingresar correo electrónico"
              value={form.correo}
              onChange={handleChange}
              onBlur={handleBlur}
              className="input-cesde-pink"
              disabled={cargando}
            />
            {errores.correo && <p className="text-red-500 text-xs mt-1">{errores.correo}</p>}
          </div>

          {/* Contraseña */}
          <div>
            <input
              type="password"
              name="contrasena"
              placeholder="Ingresar contraseña"
              value={form.contrasena}
              onChange={handleChange}
              onBlur={handleBlur}
              className="input-cesde-pink"
              disabled={cargando}
            />
            {errores.contrasena && <p className="text-red-500 text-xs mt-1">{errores.contrasena}</p>}
          </div>

          {/* Botón guardar */}
          <button
            type="submit"
            className="btn-primary mt-2"
            disabled={cargando}
          >
            {cargando ? (
              <span className="flex items-center justify-center gap-2">
                <i className="bi bi-hourglass-split animate-spin" /> Creando...
              </span>
            ) : 'Crear Usuario'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModalProfesor;
