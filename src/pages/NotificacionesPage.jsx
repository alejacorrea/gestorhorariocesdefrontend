/**
 * NotificacionesPage - Historial de notificaciones del profesor
 */
import { useState, useEffect } from 'react';
import HeaderProfesor from '../components/layout/HeaderProfesor';
import NotificacionItem from '../components/ui/NotificacionItem';
import { getNotificaciones } from '../services/api';

const NotificacionesPage = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await getNotificaciones();
        setNotificaciones(data);
      } catch (err) {
        console.error('Error cargando notificaciones', err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-cesde-gray">
      <HeaderProfesor cantidadNotificaciones={notificaciones.length} />

      <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <h2 className="text-xl font-bold text-cesde-dark mb-5 flex items-center gap-2">
          <i className="bi bi-bell text-primary" />
          Historial de Notificaciones
        </h2>

        {cargando ? (
          <div className="text-center py-12">
            <i className="bi bi-hourglass-split text-primary text-4xl animate-pulse block mb-2" />
            <p className="text-gray-500">Cargando notificaciones...</p>
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="card text-center py-12">
            <i className="bi bi-bell-slash text-gray-300 text-5xl block mb-3" />
            <p className="text-gray-500">No tienes notificaciones</p>
          </div>
        ) : (
          notificaciones.map(n => (
            <NotificacionItem key={n.id} notificacion={n} />
          ))
        )}
      </main>
    </div>
  );
};

export default NotificacionesPage;
