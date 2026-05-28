/**
 * Header público - visible en Landing, Login, Soporte, Recuperar Contraseña
 * Contiene el logo CESDE y los links de navegación
 */
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.png';

const Header = () => {
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <header className="header-cesde relative">
      {/* Logo que lleva al inicio */}
      <Link to="/" className="z-20">
        <img src={logo} alt="Logo CESDE" className="h-8 sm:h-10 w-auto" />
      </Link>

      {/* Botón Hamburguesa (solo móvil) */}
      <button 
        className="md:hidden text-white text-2xl z-20 focus:outline-none flex items-center"
        onClick={() => setMenuAbierto(!menuAbierto)}
      >
        <i className={`bi ${menuAbierto ? 'bi-x-lg' : 'bi-list'}`}></i>
      </button>

      {/* Navegación Desktop */}
      <nav className="hidden md:flex gap-6">
        <Link
          to="/login"
          className={`text-white font-semibold text-sm no-underline hover:text-pink-200 transition-colors
            ${location.pathname === '/login' ? 'border-b-2 border-white pb-0.5' : ''}`}
        >
          Iniciar Sesión
        </Link>
        <Link
          to="/soporte"
          className={`text-white font-semibold text-sm no-underline hover:text-pink-200 transition-colors
            ${location.pathname === '/soporte' ? 'border-b-2 border-white pb-0.5' : ''}`}
        >
          Soporte
        </Link>
      </nav>

      {/* Navegación Móvil (desplegable) */}
      <div 
        className={`absolute top-full left-0 w-full bg-primary flex flex-col items-center gap-4 py-4 md:hidden shadow-md transition-all duration-300 origin-top z-10 ${
          menuAbierto ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'
        }`}
      >
        <Link
          to="/login"
          onClick={() => setMenuAbierto(false)}
          className="text-white font-semibold text-sm no-underline hover:text-pink-200"
        >
          Iniciar Sesión
        </Link>
        <Link
          to="/soporte"
          onClick={() => setMenuAbierto(false)}
          className="text-white font-semibold text-sm no-underline hover:text-pink-200"
        >
          Soporte
        </Link>
      </div>
    </header>
  );
};

export default Header;
