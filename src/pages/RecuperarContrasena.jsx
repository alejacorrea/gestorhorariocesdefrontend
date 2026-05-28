/**
 * RecuperarContrasena - Página para recuperar la contraseña
 * Campos: Cédula + Correo electrónico
 * Valida contra el backend que la cédula y correo coincidan,
 * y muestra confirmación de envío de correo.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { alertExito, alertError } from '../helpers/alerts';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const RecuperarContrasena = () => {
  const [form, setForm] = useState({ cedula: '', correo: '' });
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }));
  };

  const validar = () => {
    const nuevosErrores = {};
    if (!form.cedula.trim())
      nuevosErrores.cedula = 'La cédula es obligatoria';
    else if (!/^\d{6,15}$/.test(form.cedula.trim()))
      nuevosErrores.cedula = 'Ingresa una cédula válida (solo números)';
    if (!form.correo.trim())
      nuevosErrores.correo = 'El correo es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo))
      nuevosErrores.correo = 'Ingresa un correo válido';
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;

    setCargando(true);
    try {
      // 1. Buscar la persona por cédula en el backend
      const response = await fetch(`${API_BASE}/persona/${form.cedula.trim()}`);

      if (!response.ok) {
        // No se encontró la cédula
        await alertError(
          'Datos incorrectos',
          'No encontramos una cuenta con esa cédula. Verifica e intenta de nuevo.'
        );
        return;
      }

      const persona = await response.json();

      // 2. Verificar que el correo coincida
      const correoRegistrado = (persona.correoPersona ?? '').toLowerCase().trim();
      const correoIngresado  = form.correo.toLowerCase().trim();

      if (correoRegistrado !== correoIngresado) {
        await alertError(
          'Correo incorrecto',
          'La cédula y el correo no coinciden. Verifica los datos e intenta de nuevo.'
        );
        return;
      }

      // 3. Datos correctos → mostrar confirmación
      await alertExito(
        '¡Correo enviado!',
        `Hemos enviado las instrucciones para restablecer tu contraseña a: ${persona.correoPersona}`
      );
      setForm({ cedula: '', correo: '' });

    } catch (error) {
      await alertError('Error de conexión', 'No pudimos conectarnos al servidor. Intenta más tarde.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">

          {/* Ícono decorativo */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <i className="bi bi-lock-fill text-primary text-3xl" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-cesde-dark mb-1 text-center">Recuperar Contraseña</h2>
          <p className="text-gray-500 text-sm mb-6 text-center">
            Ingresa tu cédula y correo registrado para verificar tu identidad.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Cédula */}
            <div>
              <label htmlFor="cedula" className="text-sm font-semibold text-cesde-dark block mb-1">
                Cédula <span className="text-primary">*</span>
              </label>
              <div className={`flex items-center bg-cesde-gray border-l-4 rounded-md px-4 py-2.5 ${errores.cedula ? 'border-red-400' : 'border-primary'}`}>
                <i className="bi bi-person-badge text-gray-400 mr-3" />
                <input
                  type="text"
                  id="cedula"
                  name="cedula"
                  placeholder="Número de cédula"
                  value={form.cedula}
                  onChange={handleChange}
                  className="border-none outline-none w-full text-sm bg-transparent text-cesde-dark"
                  disabled={cargando}
                  maxLength={15}
                />
              </div>
              {errores.cedula && <p className="text-red-500 text-xs mt-1 pl-1">{errores.cedula}</p>}
            </div>

            {/* Correo */}
            <div>
              <label htmlFor="correo-recuperar" className="text-sm font-semibold text-cesde-dark block mb-1">
                Correo electrónico registrado <span className="text-primary">*</span>
              </label>
              <div className={`flex items-center bg-cesde-gray border-l-4 rounded-md px-4 py-2.5 ${errores.correo ? 'border-red-400' : 'border-primary'}`}>
                <i className="bi bi-envelope text-gray-400 mr-3" />
                <input
                  type="email"
                  id="correo-recuperar"
                  name="correo"
                  placeholder="tucorreo@ejemplo.com"
                  value={form.correo}
                  onChange={handleChange}
                  className="border-none outline-none w-full text-sm bg-transparent text-cesde-dark"
                  disabled={cargando}
                />
              </div>
              {errores.correo && <p className="text-red-500 text-xs mt-1 pl-1">{errores.correo}</p>}
            </div>

            <button type="submit" className="btn-primary" disabled={cargando}>
              {cargando ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="bi bi-hourglass-split animate-spin" /> Verificando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <i className="bi bi-send" /> Enviar instrucciones
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

export default RecuperarContrasena;
