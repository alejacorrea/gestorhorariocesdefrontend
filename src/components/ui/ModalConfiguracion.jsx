/**
 * ModalConfiguracion - Modal para gestionar los ajustes globales de la app
 *
 * Ajustes:
 * 1. Tema Visual (Claro / Oscuro)
 * 2. Formato de Hora (12 hrs / 24 hrs)
 * 3. Notificaciones de Sonido (Activado / Desactivado)
 */
import { useState, useEffect } from 'react';

const ModalConfiguracion = ({ abierto, onCerrar }) => {
  const [config, setConfig] = useState({
    temaOscuro: false,
    formato24h: false,
    sonidoNotificaciones: true,
  });

  // Cargar configuración guardada al abrir
  useEffect(() => {
    if (abierto) {
      setConfig({
        temaOscuro: localStorage.getItem('cfg_tema') === 'oscuro',
        formato24h: localStorage.getItem('cfg_hora') === '24h',
        sonidoNotificaciones: localStorage.getItem('cfg_sonido') !== 'off',
      });
    }
  }, [abierto]);

  if (!abierto) return null;

  // ── Manejadores de cambios ──────────────────────────────────────────────
  
  const toggleTema = () => {
    const nuevoTema = !config.temaOscuro;
    setConfig(prev => ({ ...prev, temaOscuro: nuevoTema }));
    localStorage.setItem('cfg_tema', nuevoTema ? 'oscuro' : 'claro');
    
    // Aplicar clase al HTML inmediatamente
    if (nuevoTema) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleFormato = () => {
    const nuevoFormato = !config.formato24h;
    setConfig(prev => ({ ...prev, formato24h: nuevoFormato }));
    localStorage.setItem('cfg_hora', nuevoFormato ? '24h' : '12h');
  };

  const toggleSonido = () => {
    const nuevoSonido = !config.sonidoNotificaciones;
    setConfig(prev => ({ ...prev, sonidoNotificaciones: nuevoSonido }));
    localStorage.setItem('cfg_sonido', nuevoSonido ? 'on' : 'off');
  };

  return (
    <div className="modal-overlay">
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="bg-cesde-dark text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="bi bi-gear-fill text-primary text-xl" />
            <h2 className="font-bold text-lg">Configuración</h2>
          </div>
          <button
            onClick={onCerrar}
            className="text-white/70 hover:text-white bg-transparent border-none cursor-pointer text-2xl font-bold leading-none"
          >
            &times;
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">

          {/* Ajuste 1: Tema */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-cesde-dark dark:text-white text-sm">Tema Visual</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Activar el modo oscuro</p>
            </div>
            <button 
              onClick={toggleTema}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${config.temaOscuro ? 'bg-primary' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.temaOscuro ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Ajuste 2: Formato de hora */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-cesde-dark dark:text-white text-sm">Formato de hora</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Usar formato de 24 horas</p>
            </div>
            <button 
              onClick={toggleFormato}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${config.formato24h ? 'bg-primary' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.formato24h ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Ajuste 3: Sonidos */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-cesde-dark dark:text-white text-sm">Sonido de notificaciones</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">Reproducir sonido al recibir avisos</p>
            </div>
            <button 
              onClick={toggleSonido}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${config.sonidoNotificaciones ? 'bg-primary' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.sonidoNotificaciones ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

        </div>

        {/* Pie */}
        <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
          <button 
            onClick={onCerrar}
            className="w-full btn-primary text-sm py-2"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfiguracion;
