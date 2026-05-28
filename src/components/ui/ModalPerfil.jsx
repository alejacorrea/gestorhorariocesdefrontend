/**
 * ModalPerfil - Modal reutilizable para ver datos del perfil y cambiar contraseña
 *
 * @param {boolean}  props.abierto   - Si el modal está visible
 * @param {Function} props.onCerrar  - Callback para cerrar el modal
 * @param {string}   props.userId    - Identificación del usuario logueado
 */
import { useState } from 'react';
import { alertExito, alertError } from '../../helpers/alerts';
import { updatePassword } from '../../services/api';

const ModalPerfil = ({ abierto, onCerrar }) => {
  const [pestana, setPestana] = useState('perfil'); // 'perfil' | 'contrasena'
  const [formPass, setFormPass] = useState({ actual: '', nueva: '', confirmar: '' });
  const [cargando, setCargando] = useState(false);
  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);

  // Datos del usuario logueado guardados en localStorage al momento del login
  const nombre  = localStorage.getItem('nombre')  ?? 'Usuario';
  const correo  = localStorage.getItem('correo')  ?? '—';
  const userId  = localStorage.getItem('id')      ?? '';
  const rol     = localStorage.getItem('rol')     ?? 'profesor';

  if (!abierto) return null;

  const handleCambiarContrasena = async (e) => {
    e.preventDefault();
    if (formPass.nueva !== formPass.confirmar) {
      await alertError('Error', 'Las contraseñas nuevas no coinciden.');
      return;
    }
    if (formPass.nueva.length < 4) {
      await alertError('Error', 'La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    setCargando(true);
    try {
      await updatePassword(userId, formPass.nueva);
      setFormPass({ actual: '', nueva: '', confirmar: '' });
      await alertExito('¡Contraseña actualizada!', 'Tu contraseña fue cambiada exitosamente.');
      onCerrar();
    } catch (err) {
      await alertError('Error', 'No se pudo actualizar la contraseña. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  const inicialNombre = nombre
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="modal-overlay">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Cabecera con avatar */}
        <div className="bg-cesde-dark text-white px-6 py-5 relative">
          <button
            onClick={onCerrar}
            className="absolute top-3 right-4 text-white/70 hover:text-white bg-transparent border-none cursor-pointer text-2xl font-bold"
          >
            &times;
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {inicialNombre}
            </div>
            <div>
              <p className="font-bold text-base leading-tight">{nombre}</p>
              <p className="text-white/70 text-xs mt-0.5">{correo}</p>
              <span className="inline-block mt-1 text-[10px] bg-primary/80 text-white px-2 py-0.5 rounded-full font-semibold">
                {rol === 'admin' ? 'Administrador' : 'Profesor'}
              </span>
            </div>
          </div>

          {/* Pestañas */}
          <div className="flex mt-4 gap-1">
            <button
              onClick={() => setPestana('perfil')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-t border-none cursor-pointer transition-colors ${
                pestana === 'perfil'
                  ? 'bg-white text-cesde-dark'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <i className="bi bi-person mr-1" />
              Mi perfil
            </button>
            <button
              onClick={() => setPestana('contrasena')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-t border-none cursor-pointer transition-colors ${
                pestana === 'contrasena'
                  ? 'bg-white text-cesde-dark'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <i className="bi bi-lock mr-1" />
              Contraseña
            </button>
          </div>
        </div>

        {/* Contenido de pestañas */}
        <div className="p-6">

          {/* ─── Pestaña: Mi perfil ─── */}
          {pestana === 'perfil' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wide">Nombre completo</label>
                <div className="input-cesde bg-gray-50 text-cesde-dark cursor-not-allowed">
                  {nombre}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wide">Correo electrónico</label>
                <div className="input-cesde bg-gray-50 text-cesde-dark cursor-not-allowed">
                  {correo}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wide">Identificación</label>
                <div className="input-cesde bg-gray-50 text-cesde-dark cursor-not-allowed">
                  {userId}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wide">Rol</label>
                <div className="input-cesde bg-gray-50 text-cesde-dark cursor-not-allowed">
                  {rol === 'admin' ? 'Administrador' : 'Profesor'}
                </div>
              </div>
              <p className="text-[11px] text-gray-400 text-center pt-1">
                <i className="bi bi-info-circle mr-1" />
                Para actualizar tu nombre o correo, contacta al administrador.
              </p>
            </div>
          )}

          {/* ─── Pestaña: Cambiar contraseña ─── */}
          {pestana === 'contrasena' && (
            <form onSubmit={handleCambiarContrasena} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wide">Contraseña actual</label>
                <div className="relative">
                  <input
                    type={mostrarActual ? 'text' : 'password'}
                    value={formPass.actual}
                    onChange={e => setFormPass(p => ({ ...p, actual: e.target.value }))}
                    className="input-cesde pr-10"
                    placeholder="••••••••"
                    required
                    disabled={cargando}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarActual(!mostrarActual)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 bg-transparent border-none cursor-pointer"
                  >
                    <i className={`bi ${mostrarActual ? 'bi-eye-slash' : 'bi-eye'}`} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wide">Nueva contraseña</label>
                <div className="relative">
                  <input
                    type={mostrarNueva ? 'text' : 'password'}
                    value={formPass.nueva}
                    onChange={e => setFormPass(p => ({ ...p, nueva: e.target.value }))}
                    className="input-cesde pr-10"
                    placeholder="••••••••"
                    required
                    disabled={cargando}
                    minLength={4}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarNueva(!mostrarNueva)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 bg-transparent border-none cursor-pointer"
                  >
                    <i className={`bi ${mostrarNueva ? 'bi-eye-slash' : 'bi-eye'}`} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wide">Confirmar nueva contraseña</label>
                <input
                  type="password"
                  value={formPass.confirmar}
                  onChange={e => setFormPass(p => ({ ...p, confirmar: e.target.value }))}
                  className="input-cesde"
                  placeholder="••••••••"
                  required
                  disabled={cargando}
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button type="submit" className="btn-primary flex-1" disabled={cargando}>
                  {cargando ? 'Guardando...' : 'Cambiar contraseña'}
                </button>
                <button type="button" onClick={onCerrar} className="btn-secondary flex-1">
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalPerfil;
