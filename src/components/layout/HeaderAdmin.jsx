/**
 * Header del panel Administrador
 * Contiene: logo, título "BIENVENIDO ADMINISTRADOR", icono gear, menú de perfil
 * Responsive: menú hamburguesa en móvil
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import ModalPerfil from '../ui/ModalPerfil';
import ModalConfiguracion from '../ui/ModalConfiguracion';

const HeaderAdmin = () => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [menuHamburguesa, setMenuHamburguesa] = useState(false);
  const [modalPerfil, setModalPerfil] = useState(false);
  const [modalConfig, setModalConfig] = useState(false);
  const navigate = useNavigate();

  /**
   * Cierra la sesión del administrador y redirige al login
   */
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
      <Link to="/">
        <img src={logo} alt="Logo CESDE" className="h-8 sm:h-10 w-auto" />
      </Link>

      {/* Título central - solo desktop */}
      <h1 className="text-sm sm:text-base font-bold tracking-wide hidden md:block truncate max-w-[50%] text-center">
        BIENVENIDO, {(localStorage.getItem('nombre') ?? localStorage.getItem('usuario') ?? 'ADMINISTRADOR').toUpperCase()}
      </h1>

      {/* Desktop: Iconos de acciones */}
      <div className="hidden md:flex items-center gap-4">
        {/* Icono configuración */}
        <button 
          onClick={() => setModalConfig(true)}
          className="bg-transparent border-none p-0 m-0 cursor-pointer"
          aria-label="Configuración"
        >
          <i className="bi bi-gear-fill text-2xl sm:text-3xl text-white hover:text-pink-200 transition-colors" />
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

          {/* Dropdown del perfil */}
          {menuAbierto && (
            <>
              {/* Overlay invisible para cerrar al hacer clic afuera */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuAbierto(false)}
              />
              <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg min-w-[180px] z-20 animate-fade-in overflow-hidden">
                <a
                  href="#"
                  className="block px-4 py-2.5 text-cesde-dark text-sm no-underline border-b border-gray-100 hover:bg-cesde-gray transition-colors"
                  onClick={(e) => { e.preventDefault(); setMenuAbierto(false); setModalPerfil(true); }}
                >
                  Ver perfil
                </a>
                <button
                  onClick={cerrarSesion}
                  className="block w-full text-left px-4 py-2.5 text-primary font-bold text-sm bg-transparent border-none cursor-pointer hover:bg-cesde-gray transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Móvil: Botón hamburguesa */}
      <button
        className="md:hidden text-white text-2xl z-20 focus:outline-none flex items-center bg-transparent border-none cursor-pointer"
        onClick={() => setMenuHamburguesa(!menuHamburguesa)}
        aria-label="Menú"
      >
        <i className={`bi ${menuHamburguesa ? 'bi-x-lg' : 'bi-list'}`} />
      </button>

      {/* Móvil: Menú desplegable */}
      <div
        className={`absolute top-full left-0 w-full bg-primary flex flex-col items-center gap-3 py-4 md:hidden shadow-lg transition-all duration-300 origin-top z-10 ${
          menuHamburguesa ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'
        }`}
      >
        <p className="text-white/80 text-xs font-semibold tracking-wider">
          {(localStorage.getItem('nombre') ?? 'ADMINISTRADOR').toUpperCase()}
        </p>
        <button
          onClick={() => { setMenuHamburguesa(false); setModalConfig(true); }}
          className="text-white font-semibold text-sm bg-transparent border-none cursor-pointer hover:text-pink-200 flex items-center gap-2"
        >
          <i className="bi bi-gear-fill" /> Configuración
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
  </>
  );
};

export default HeaderAdmin;
