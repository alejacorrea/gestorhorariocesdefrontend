/**
 * Header del panel Profesor
 * Contiene: logo, título "BIENVENIDO PROFESOR",
 *           icono chatbot, campana notificaciones (dropdown), gear, perfil dropdown
 * Responsive: menú hamburguesa en móvil
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import ModalPerfil from '../ui/ModalPerfil';
import ModalConfiguracion from '../ui/ModalConfiguracion';

/**
 * @param {Object} props
 * @param {Array}  props.horarios - Lista de horarios expandidos del profesor
 */
const HeaderProfesor = ({ horarios = [] }) => {
  const [menuAbierto,   setMenuAbierto]   = useState(false);
  const [menuHamburguesa, setMenuHamburguesa] = useState(false);
  const [notifAbierto,  setNotifAbierto]  = useState(false);
  const [modalPerfil,   setModalPerfil]   = useState(false);
  const [modalConfig,   setModalConfig]   = useState(false);
  const [vistas,        setVistas]        = useState(() => {
    // Cargamos las notificaciones ya vistas desde localStorage
    try { return JSON.parse(localStorage.getItem('notif_vistas') || '[]'); }
    catch { return []; }
  });
  const notifRefDesktop = useRef(null);
  const notifRefMobile = useRef(null);
  const navigate = useNavigate();

  // ── Calcular próximas clases (máximo 5, desde hoy en adelante) ────────────
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const proximasClases = horarios
    .filter(h => {
      if (!h.fecha) return false;
      const fechaEvento = new Date(h.fecha + 'T00:00:00');
      return fechaEvento >= hoy;
    })
    .sort((a, b) => new Date(a.fecha + 'T00:00:00') - new Date(b.fecha + 'T00:00:00'))
    // Deduplicar: si un horario ya tiene un evento igual ese día, no lo repetimos
    .reduce((acc, h) => {
      const key = `${h.id_original}-${h.fecha}`;
      if (!acc.some(x => `${x.id_original}-${x.fecha}` === key)) acc.push(h);
      return acc;
    }, [])
    .slice(0, 6);

  // Notificaciones sin ver
  const sinVer = proximasClases.filter(h => !vistas.includes(h.id));
  const cantidadBadge = sinVer.length;

  // ── Cerrar dropdown al hacer clic fuera ───────────────────────────────────
  useEffect(() => {
    const handleClickFuera = (e) => {
      const isDesktop = notifRefDesktop.current && notifRefDesktop.current.contains(e.target);
      const isMobile = notifRefMobile.current && notifRefMobile.current.contains(e.target);
      if (!isDesktop && !isMobile) {
        setNotifAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, []);

  // ── Marcar una notificación como vista ────────────────────────────────────
  const marcarVista = (id, e) => {
    e.stopPropagation();
    const nuevas = [...vistas, id];
    setVistas(nuevas);
    localStorage.setItem('notif_vistas', JSON.stringify(nuevas));
  };

  // ── Marcar todas como vistas ──────────────────────────────────────────────
  const marcarTodasVistas = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const ids = proximasClases.map(h => h.id);
    const nuevas = [...new Set([...vistas, ...ids])];
    setVistas(nuevas);
    localStorage.setItem('notif_vistas', JSON.stringify(nuevas));
  };

  // ── Formatear fecha de evento ─────────────────────────────────────────────
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return '';
    const d = new Date(fechaStr + 'T00:00:00');
    const diff = Math.round((d - hoy) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Mañana';
    if (diff <= 7)  return `En ${diff} días`;
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
  };

  const cerrarSesion = () => {
    localStorage.removeItem('rol');
    localStorage.removeItem('usuario');
    localStorage.removeItem('cfg_tema');
    document.documentElement.classList.remove('dark');
    navigate('/login');
  };

  return (
    <>
    <header className="header-cesde relative z-40">
      {/* Logo */}
      <Link to="/profesor">
        <img src={logo} alt="Logo CESDE" className="h-8 sm:h-10 w-auto" />
      </Link>

      {/* Título central - solo desktop */}
      <h2 className="text-sm sm:text-base font-bold tracking-wide hidden md:block truncate max-w-[50%] text-center">
        BIENVENIDO, {(localStorage.getItem('nombre') ?? localStorage.getItem('usuario') ?? 'PROFESOR').toUpperCase()}
      </h2>

      {/* Desktop: Iconos de acciones */}
      <div className="hidden md:flex items-center gap-4">

        {/* Icono chatbot */}
        <Link to="/chatbot" className="text-white hover:text-pink-200 transition-colors">
          <i className="bi bi-robot text-2xl" />
        </Link>

        {/* Campana de notificaciones – Dropdown */}
        <div className="relative" ref={notifRefDesktop}>
          <button
            onClick={() => setNotifAbierto(prev => !prev)}
            className="relative bg-transparent border-none cursor-pointer text-white hover:text-pink-200 transition-colors"
            aria-label="Notificaciones"
          >
            <i className="bi bi-bell text-2xl" />
            {cantidadBadge > 0 && (
              <span className="badge-notif">
                {cantidadBadge > 9 ? '9+' : cantidadBadge}
              </span>
            )}
          </button>

          {/* Dropdown panel */}
          {notifAbierto && (
            <div className="notif-dropdown">
              {/* Cabecera */}
              <div className="notif-header bg-primary">
                <span className="font-bold text-sm flex items-center gap-1.5 text-white">
                  <i className="bi bi-bell-fill" />
                  Próximas clases
                </span>
                {cantidadBadge > 0 && (
                  <button
                    type="button"
                    onClick={(e) => marcarTodasVistas(e)}
                    className="text-xs text-white hover:text-pink-200 bg-transparent border-none cursor-pointer underline"
                  >
                    Marcar todas
                  </button>
                )}
              </div>

              {/* Lista de notificaciones */}
              <div className="notif-lista">
                {proximasClases.length === 0 ? (
                  <p className="text-center text-gray-400 text-xs py-6">
                    <i className="bi bi-calendar-x block text-2xl mb-1" />
                    No hay clases próximas
                  </p>
                ) : (
                  proximasClases.map(h => {
                    const esVista = vistas.includes(h.id);
                    return (
                      <div
                        key={h.id}
                        className={`notif-item ${esVista ? 'notif-item-vista' : 'notif-item-nueva'}`}
                      >
                        {/* Punto indicador */}
                        {!esVista && <span className="notif-punto" />}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs truncate text-cesde-dark">
                            {h.clase || h.materia}
                          </p>
                          <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                            <i className="bi bi-calendar3" />
                            {formatearFecha(h.fecha)}
                            {h.horaInicio && (
                              <> · <i className="bi bi-clock" /> {h.horaInicio.slice(0, 5)}</>
                            )}
                          </p>
                          {(h.aula || h.sede) && (
                            <p className="text-[11px] text-gray-400 truncate mt-0.5">
                              <i className="bi bi-door-open mr-1" />
                              {h.aula ? `Aula ${h.aula}` : h.sede}
                            </p>
                          )}
                        </div>

                        {/* Botón cerrar */}
                        {!esVista && (
                          <button
                            onClick={(e) => marcarVista(h.id, e)}
                            className="flex-shrink-0 text-gray-300 hover:text-primary bg-transparent border-none cursor-pointer text-base leading-none ml-1"
                            title="Marcar como vista"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pie */}
              {cantidadBadge === 0 && proximasClases.length > 0 && (
                <p className="text-center text-[11px] text-gray-400 py-2 border-t border-gray-100">
                  <i className="bi bi-check-all text-green-500 mr-1" />
                  No hay notificaciones nuevas
                </p>
              )}
            </div>
          )}
        </div>

        {/* Icono configuración */}
        <button 
          onClick={() => setModalConfig(true)}
          className="bg-transparent border-none p-0 m-0 cursor-pointer"
          aria-label="Configuración"
        >
          <i className="bi bi-gear text-2xl text-white hover:text-pink-200 transition-colors" />
        </button>

        {/* Menú perfil */}
        <div className="relative">
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="bg-transparent border-none cursor-pointer text-white"
            aria-label="Menú de perfil"
          >
            <i className="bi bi-person-circle text-2xl sm:text-3xl hover:text-pink-200 transition-colors" />
          </button>

          {menuAbierto && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuAbierto(false)} />
              <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg min-w-[180px] z-20 animate-fade-in overflow-hidden">
                <a href="#" className="block px-4 py-2.5 text-cesde-dark text-sm no-underline border-b border-gray-100 hover:bg-cesde-gray transition-colors"
                   onClick={(e) => { e.preventDefault(); setMenuAbierto(false); setModalPerfil(true); }}>
                  Ver perfil
                </a>
                <button onClick={cerrarSesion}
                  className="block w-full text-left px-4 py-2.5 text-primary font-bold text-sm bg-transparent border-none cursor-pointer hover:bg-cesde-gray transition-colors">
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Móvil: Badge de notificaciones + Botón hamburguesa */}
      <div className="md:hidden flex items-center gap-3 z-20">
        {/* Mini campana móvil con badge */}
        <div className="relative" ref={notifRefMobile}>
          <button
            onClick={() => setNotifAbierto(prev => !prev)}
            className="relative bg-transparent border-none cursor-pointer text-white hover:text-pink-200 transition-colors"
            aria-label="Notificaciones"
          >
            <i className="bi bi-bell text-xl" />
            {cantidadBadge > 0 && (
              <span className="badge-notif" style={{ fontSize: '10px', width: '16px', height: '16px' }}>
                {cantidadBadge > 9 ? '9+' : cantidadBadge}
              </span>
            )}
          </button>

          {/* Dropdown en móvil también */}
          {notifAbierto && (
            <div className="notif-dropdown !w-[280px] !right-0 sm:!w-[300px]">
              <div className="notif-header bg-primary">
                <span className="font-bold text-sm flex items-center gap-1.5 text-white">
                  <i className="bi bi-bell-fill" />
                  Próximas clases
                </span>
                {cantidadBadge > 0 && (
                  <button type="button" onClick={(e) => marcarTodasVistas(e)} className="text-xs text-white hover:text-pink-200 bg-transparent border-none cursor-pointer underline">
                    Marcar todas
                  </button>
                )}
              </div>
              <div className="notif-lista">
                {proximasClases.length === 0 ? (
                  <p className="text-center text-gray-400 text-xs py-6">
                    <i className="bi bi-calendar-x block text-2xl mb-1" />
                    No hay clases próximas
                  </p>
                ) : (
                  proximasClases.map(h => {
                    const esVista = vistas.includes(h.id);
                    return (
                      <div key={h.id} className={`notif-item ${esVista ? 'notif-item-vista' : 'notif-item-nueva'}`}>
                        {!esVista && <span className="notif-punto" />}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-xs truncate text-cesde-dark">{h.clase || h.materia}</p>
                          <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                            <i className="bi bi-calendar3" />{formatearFecha(h.fecha)}
                            {h.horaInicio && (<> · <i className="bi bi-clock" /> {h.horaInicio.slice(0, 5)}</>)}
                          </p>
                        </div>
                        {!esVista && (
                          <button type="button" onClick={(e) => marcarVista(h.id, e)} className="flex-shrink-0 text-gray-300 hover:text-primary bg-transparent border-none cursor-pointer text-base leading-none ml-1" title="Marcar como vista">✕</button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Hamburguesa */}
        <button
          className="text-white text-2xl focus:outline-none flex items-center bg-transparent border-none cursor-pointer"
          onClick={() => setMenuHamburguesa(!menuHamburguesa)}
          aria-label="Menú"
        >
          <i className={`bi ${menuHamburguesa ? 'bi-x-lg' : 'bi-list'}`} />
        </button>
      </div>

      {/* Móvil: Menú desplegable hamburguesa */}
      <div
        className={`absolute top-full left-0 w-full bg-primary flex flex-col items-center gap-3 py-4 md:hidden shadow-lg transition-all duration-300 origin-top z-10 ${
          menuHamburguesa ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'
        }`}
      >
        <p className="text-white/80 text-xs font-semibold tracking-wider">
          {(localStorage.getItem('nombre') ?? 'PROFESOR').toUpperCase()}
        </p>
        <Link
          to="/chatbot"
          onClick={() => setMenuHamburguesa(false)}
          className="text-white font-semibold text-sm no-underline hover:text-pink-200 flex items-center gap-2"
        >
          <i className="bi bi-robot" /> Chatbot
        </Link>
        <button
          onClick={() => { setMenuHamburguesa(false); setModalConfig(true); }}
          className="text-white font-semibold text-sm bg-transparent border-none cursor-pointer hover:text-pink-200 flex items-center gap-2"
        >
          <i className="bi bi-gear" /> Configuración
        </button>
        <button
          onClick={() => { setMenuHamburguesa(false); setModalPerfil(true); }}
          className="text-white font-semibold text-sm bg-transparent border-none cursor-pointer hover:text-pink-200 flex items-center gap-2"
        >
          <i className="bi bi-person-circle" /> Ver perfil
        </button>
        <button
          onClick={cerrarSesion}
          className="text-white font-bold text-sm bg-white/20 border-none cursor-pointer hover:bg-white/30 px-6 py-2 rounded-md flex items-center gap-2 transition-colors"
        >
          <i className="bi bi-box-arrow-right" /> Cerrar sesión
        </button>
      </div>
    </header>

    <ModalPerfil abierto={modalPerfil} onCerrar={() => setModalPerfil(false)} />
    <ModalConfiguracion abierto={modalConfig} onCerrar={() => setModalConfig(false)} />
  </>);
};

export default HeaderProfesor;
