/**
 * AppRouter - Configuración de rutas de la aplicación
 * 
 * Rutas públicas: /, /login, /recuperar, /soporte, /chatbot
 * Rutas protegidas: /admin, /profesor, /notificaciones
 * 
 * La protección de rutas es básica (via localStorage) y está lista
 * para ser reemplazada con autenticación real via JWT.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RecuperarContrasena from '../pages/RecuperarContrasena';
import SoportePage from '../pages/SoportePage';
import AdminPage from '../pages/AdminPage';
import ProfesorPage from '../pages/ProfesorPage';
import NotificacionesPage from '../pages/NotificacionesPage';
import ChatbotPage from '../pages/ChatbotPage';

/**
 * Componente de protección de rutas
 * Verifica si hay un rol guardado en localStorage
 * 
 * @param {Object} props
 * @param {string} props.rolRequerido - 'admin' | 'profesor'
 * @param {React.ReactNode} props.children - Componente a renderizar si está autenticado
 */
const RutaProtegida = ({ rolRequerido, children }) => {
  const rol = localStorage.getItem('rol');

  // Si no hay sesión, redirigir al login
  if (!rol) return <Navigate to="/login" replace />;

  // Si el rol no coincide, redirigir según el rol actual
  if (rolRequerido && rol !== rolRequerido) {
    return <Navigate to={rol === 'admin' ? '/admin' : '/profesor'} replace />;
  }

  return children;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ========================
            RUTAS PÚBLICAS
        ======================== */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/recuperar" element={<RecuperarContrasena />} />
        <Route path="/soporte" element={<SoportePage />} />

        {/* ========================
            RUTAS PROTEGIDAS - ADMIN
        ======================== */}
        <Route
          path="/admin"
          element={
            <RutaProtegida rolRequerido="admin">
              <AdminPage />
            </RutaProtegida>
          }
        />

        {/* ========================
            RUTAS PROTEGIDAS - PROFESOR
        ======================== */}
        <Route
          path="/profesor"
          element={
            <RutaProtegida rolRequerido="profesor">
              <ProfesorPage />
            </RutaProtegida>
          }
        />
        <Route
          path="/notificaciones"
          element={
            <RutaProtegida rolRequerido="profesor">
              <NotificacionesPage />
            </RutaProtegida>
          }
        />

        {/* Chatbot accesible para profesores y desde soporte */}
        <Route path="/chatbot" element={<ChatbotPage />} />

        {/* Ruta 404 - redirige al inicio */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
