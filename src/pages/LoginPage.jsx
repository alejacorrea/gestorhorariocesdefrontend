/**
 * LoginPage - Página de inicio de sesión
 *
 * Un único botón "Ingresar". Llama al backend con correo + contraseña.
 * La respuesta incluye id_rol (1 = Admin, 2 = Profesor) y redirige
 * automáticamente al panel correspondiente.
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { alertError, alertExito } from '../helpers/alerts';
import { login } from '../services/api';
import logo from '../assets/logo.png';

const LoginPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({ correo: '', contrasena: '', recordar: true });
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }));
  };

  /**
   * Valida el formulario antes de enviar
   */
  const validar = () => {
    const nuevosErrores = {};
    if (!form.correo.trim())
      nuevosErrores.correo = 'El correo es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo))
      nuevosErrores.correo = 'Ingresa un correo válido';
    if (!form.contrasena.trim())
      nuevosErrores.contrasena = 'La contraseña es obligatoria';
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  /**
   * Llama al backend, lee id_rol de la respuesta y redirige:
   *   id_rol === 1  →  /admin
   *   id_rol === 2  →  /profesor
   */
  const handleIngresar = async (e) => {
    e.preventDefault();
    if (!validar()) return;

    setCargando(true);
    try {
      const data = await login(form.correo, form.contrasena);

      // El backend devuelve: { idRol, identificacionPersona, nombrePersona, correoPersona, activo }
      const idRol    = Number(data.idRol);
      const nombre   = data.nombrePersona   ?? form.correo;
      const idPersona = data.identificacionPersona ?? '';

      if (idRol === 1) {
        localStorage.setItem('rol', 'admin');
        localStorage.setItem('usuario', nombre);
        localStorage.setItem('nombre', nombre);
        localStorage.setItem('correo', data.correoPersona ?? form.correo);
        localStorage.setItem('id', idPersona);
        await alertExito('¡Bienvenido!', 'Inicio de sesión exitoso como Administrador.');
        navigate('/admin');
      } else if (idRol === 2) {
        localStorage.setItem('rol', 'profesor');
        localStorage.setItem('usuario', nombre);
        localStorage.setItem('nombre', nombre);
        localStorage.setItem('correo', data.correoPersona ?? form.correo);
        localStorage.setItem('id', idPersona);
        await alertExito('¡Bienvenido!', 'Inicio de sesión exitoso como Profesor.');
        navigate('/profesor');
      } else {
        await alertError('Acceso denegado', 'Tu cuenta no tiene un rol válido asignado.');
      }
    } catch (error) {
      await alertError(
        'Credenciales incorrectas',
        'Verifica tu correo y contraseña e intenta de nuevo.'
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">

          {/* Panel izquierdo: Formulario */}
          <div className="bg-cesde-gray dark:bg-gray-800 p-8 sm:p-10 w-full md:w-1/2 flex flex-col justify-center">
            <h1 className="text-2xl font-bold text-cesde-dark dark:text-white mb-2 text-center md:text-left">Gestor de Horarios</h1>
            <p className="text-primary text-sm mb-8 text-center md:text-left">
              Ingresa a tu cuenta llenando los campos solicitados
            </p>

            <form className="w-full max-w-sm mx-auto md:mx-0" onSubmit={handleIngresar}>
              {/* Campo correo */}
              <div className="mb-5">
                <div className={`flex items-center bg-white dark:bg-gray-700 border-l-4 border-primary rounded-md px-4 py-2.5 shadow-sm ${errores.correo ? 'border-red-400' : ''}`}>
                  <i className="bi bi-person text-gray-400 mr-3 text-lg" />
                  <input
                    type="text"
                    name="correo"
                    placeholder="Correo Electrónico"
                    value={form.correo}
                    onChange={handleChange}
                    className="border-none outline-none w-full text-sm bg-transparent text-cesde-dark dark:text-white placeholder-gray-400"
                    disabled={cargando}
                    id="login-correo"
                    autoComplete="username"
                  />
                </div>
                {errores.correo && <p className="text-red-500 text-xs mt-1 pl-1">{errores.correo}</p>}
              </div>

              {/* Campo contraseña */}
              <div className="mb-5">
                <div className={`flex items-center bg-white dark:bg-gray-700 border-l-4 border-primary rounded-md px-4 py-2.5 shadow-sm ${errores.contrasena ? 'border-red-400' : ''}`}>
                  <i className="bi bi-lock text-gray-400 mr-3 text-lg" />
                  <input
                    type="password"
                    name="contrasena"
                    placeholder="Contraseña"
                    value={form.contrasena}
                    onChange={handleChange}
                    className="border-none outline-none w-full text-sm bg-transparent text-cesde-dark dark:text-white placeholder-gray-400"
                    disabled={cargando}
                    id="login-contrasena"
                    autoComplete="current-password"
                  />
                </div>
                {errores.contrasena && <p className="text-red-500 text-xs mt-1 pl-1">{errores.contrasena}</p>}
              </div>

              {/* Recordarme + olvidé contraseña */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 text-sm">
                <label className="flex items-center gap-2 cursor-pointer select-none dark:text-gray-300">
                  <input
                    type="checkbox"
                    name="recordar"
                    checked={form.recordar}
                    onChange={handleChange}
                    className="accent-primary w-4 h-4"
                  />
                  Recuérdarme
                </label>
                <Link to="/recuperar" className="text-cesde-dark dark:text-white font-semibold hover:text-primary dark:hover:text-pink-400 transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Único botón de ingreso */}
              <button
                id="btn-ingresar"
                type="submit"
                disabled={cargando}
                className="btn-primary w-full py-3 text-base shadow-md"
              >
                {cargando ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="bi bi-hourglass-split animate-spin" /> Ingresando...
                  </span>
                ) : 'Ingresar'}
              </button>
            </form>
          </div>

          {/* Panel derecho: Logo en fondo rosa */}
          <div className="bg-primary w-full md:w-1/2 flex flex-col items-center justify-center p-10 min-h-[250px] md:min-h-[400px]">
            <img src={logo} alt="Logo CESDE" className="max-w-[200px] md:max-w-[280px] w-full h-auto drop-shadow-lg" />
            <p className="text-white/90 text-xs md:text-sm text-center mt-8 md:mt-12 font-medium">
              Línea de Transparencia: 018000517740
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoginPage;
