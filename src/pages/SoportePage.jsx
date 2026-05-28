/**
 * SoportePage - Página para enviar una solicitud de soporte técnico
 *
 * Flujo:
 * 1. El usuario llena: Nombre, Cédula, Correo, Tipo de problema, Descripción
 * 2. Se valida que la cédula exista en el backend y el correo coincida
 * 3. Se muestra una alerta de confirmación con número de ticket
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { alertExito, alertError } from '../helpers/alerts';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const TIPOS_PROBLEMA = [
  'No puedo iniciar sesión',
  'No recibo el correo de recuperación',
  'Mi horario no aparece correctamente',
  'Error al cargar la página',
  'Necesito que me restablezcan la contraseña',
  'Otro problema',
];

const SoportePage = () => {
  const [form, setForm] = useState({
    nombre: '', cedula: '', correo: '', tipo: '', descripcion: '',
  });
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [ticketNum, setTicketNum] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }));
  };

  const validar = () => {
    const err = {};
    if (!form.nombre.trim())     err.nombre      = 'El nombre es obligatorio';
    if (!form.cedula.trim())     err.cedula      = 'La cédula es obligatoria';
    else if (!/^\d{6,15}$/.test(form.cedula.trim())) err.cedula = 'Solo números, entre 6 y 15 dígitos';
    if (!form.correo.trim())     err.correo      = 'El correo es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) err.correo = 'Correo no válido';
    if (!form.tipo)              err.tipo        = 'Selecciona el tipo de problema';
    if (!form.descripcion.trim()) err.descripcion = 'Describe brevemente tu problema';
    else if (form.descripcion.trim().length < 20) err.descripcion = 'Por favor da más detalle (mínimo 20 caracteres)';
    setErrores(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;

    setCargando(true);
    try {
      // 1. Verificar que la cédula exista en el backend
      const response = await fetch(`${API_BASE}/persona/${form.cedula.trim()}`);

      if (!response.ok) {
        await alertError(
          'Cédula no encontrada',
          'No encontramos ninguna cuenta con esa cédula. Verifica el número e intenta de nuevo.'
        );
        return;
      }

      const persona = await response.json();

      // 2. Verificar que el correo coincida
      const correoRegistrado = (persona.correoPersona ?? '').toLowerCase().trim();
      const correoIngresado  = form.correo.toLowerCase().trim();

      if (correoRegistrado !== correoIngresado) {
        await alertError(
          'Datos incorrectos',
          'La cédula y el correo no coinciden con ninguna cuenta. Verifica tus datos.'
        );
        return;
      }

      // 3. Generar número de ticket ficticio (en producción esto lo generaría el backend)
      const numeroTicket = `TKT-${Date.now().toString().slice(-6)}`;
      setTicketNum(numeroTicket);
      setEnviado(true);

    } catch (error) {
      await alertError('Error de conexión', 'No pudimos conectarnos al servidor. Intenta más tarde.');
    } finally {
      setCargando(false);
    }
  };

  // ── Vista de confirmación ─────────────────────────────────────────────────
  if (enviado) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="bi bi-check-circle-fill text-green-500 text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-cesde-dark mb-2">¡Solicitud enviada!</h2>
            <p className="text-gray-500 text-sm mb-4">
              Hemos recibido tu solicitud de soporte. Un asesor se comunicará contigo al correo:
            </p>
            <p className="font-bold text-primary text-sm mb-4">{form.correo}</p>

            <div className="bg-cesde-gray rounded-lg p-4 mb-6">
              <p className="text-xs text-gray-400 mb-1">Número de ticket</p>
              <p className="font-bold text-lg text-cesde-dark tracking-widest">{ticketNum}</p>
              <p className="text-xs text-gray-400 mt-2">
                Guarda este número para hacer seguimiento de tu caso.
              </p>
            </div>

            <div className="text-left bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-sm">
              <p className="font-semibold text-yellow-700 mb-1"><i className="bi bi-clock mr-1" />Tiempo de respuesta</p>
              <p className="text-yellow-600">Nuestro equipo responde en un plazo de <strong>24 a 48 horas hábiles</strong>.</p>
            </div>

            <Link to="/login" className="btn-primary block w-full text-center no-underline">
              Volver al inicio de sesión
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Vista del formulario ──────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-lg">

          {/* Encabezado */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="bi bi-headset text-primary text-3xl" />
            </div>
            <h1 className="text-2xl font-bold text-cesde-dark">Centro de Soporte</h1>
            <p className="text-gray-500 text-sm mt-1">
              ¿Tienes problemas para ingresar? Cuéntanos y te ayudamos.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Nombre */}
            <div>
              <label htmlFor="nombre-soporte" className="text-sm font-semibold text-cesde-dark block mb-1">
                Nombre completo <span className="text-primary">*</span>
              </label>
              <div className={`flex items-center bg-cesde-gray border-l-4 rounded-md px-4 py-2.5 ${errores.nombre ? 'border-red-400' : 'border-primary'}`}>
                <i className="bi bi-person text-gray-400 mr-3" />
                <input
                  type="text"
                  id="nombre-soporte"
                  name="nombre"
                  placeholder="Tu nombre completo"
                  value={form.nombre}
                  onChange={handleChange}
                  className="border-none outline-none w-full text-sm bg-transparent text-cesde-dark"
                  disabled={cargando}
                />
              </div>
              {errores.nombre && <p className="text-red-500 text-xs mt-1 pl-1">{errores.nombre}</p>}
            </div>

            {/* Cédula y Correo en grid responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="cedula-soporte" className="text-sm font-semibold text-cesde-dark block mb-1">
                  Cédula <span className="text-primary">*</span>
                </label>
                <div className={`flex items-center bg-cesde-gray border-l-4 rounded-md px-3 py-2.5 ${errores.cedula ? 'border-red-400' : 'border-primary'}`}>
                  <i className="bi bi-person-badge text-gray-400 mr-2 text-sm" />
                  <input
                    type="text"
                    id="cedula-soporte"
                    name="cedula"
                    placeholder="Nro. cédula"
                    value={form.cedula}
                    onChange={handleChange}
                    className="border-none outline-none w-full text-sm bg-transparent text-cesde-dark"
                    disabled={cargando}
                    maxLength={15}
                  />
                </div>
                {errores.cedula && <p className="text-red-500 text-xs mt-1">{errores.cedula}</p>}
              </div>

              <div>
                <label htmlFor="correo-soporte" className="text-sm font-semibold text-cesde-dark block mb-1">
                  Correo <span className="text-primary">*</span>
                </label>
                <div className={`flex items-center bg-cesde-gray border-l-4 rounded-md px-3 py-2.5 ${errores.correo ? 'border-red-400' : 'border-primary'}`}>
                  <i className="bi bi-envelope text-gray-400 mr-2 text-sm" />
                  <input
                    type="email"
                    id="correo-soporte"
                    name="correo"
                    placeholder="tucorreo@email.com"
                    value={form.correo}
                    onChange={handleChange}
                    className="border-none outline-none w-full text-sm bg-transparent text-cesde-dark"
                    disabled={cargando}
                  />
                </div>
                {errores.correo && <p className="text-red-500 text-xs mt-1">{errores.correo}</p>}
              </div>
            </div>

            {/* Tipo de problema */}
            <div>
              <label htmlFor="tipo-soporte" className="text-sm font-semibold text-cesde-dark block mb-1">
                Tipo de problema <span className="text-primary">*</span>
              </label>
              <select
                id="tipo-soporte"
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
                className="input-cesde"
                disabled={cargando}
              >
                <option value="">Selecciona el tipo de problema...</option>
                {TIPOS_PROBLEMA.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errores.tipo && <p className="text-red-500 text-xs mt-1 pl-1">{errores.tipo}</p>}
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="descripcion-soporte" className="text-sm font-semibold text-cesde-dark block mb-1">
                Descripción del problema <span className="text-primary">*</span>
              </label>
              <textarea
                id="descripcion-soporte"
                name="descripcion"
                rows={4}
                placeholder="Describe con detalle qué está pasando. Por ejemplo: 'Ingreso mi correo y contraseña correctamente pero me dice que las credenciales son incorrectas desde el 20 de mayo...'"
                value={form.descripcion}
                onChange={handleChange}
                className={`input-cesde resize-none ${errores.descripcion ? 'border-red-400' : ''}`}
                disabled={cargando}
              />
              <div className="flex justify-between items-center mt-1">
                {errores.descripcion
                  ? <p className="text-red-500 text-xs">{errores.descripcion}</p>
                  : <span />
                }
                <span className="text-xs text-gray-400">{form.descripcion.length} caracteres</span>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={cargando}>
              {cargando ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="bi bi-hourglass-split animate-spin" /> Verificando y enviando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <i className="bi bi-send" /> Enviar solicitud de soporte
                </span>
              )}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-primary text-sm font-semibold hover:underline">
                ← Volver al inicio de sesión
              </Link>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SoportePage;
