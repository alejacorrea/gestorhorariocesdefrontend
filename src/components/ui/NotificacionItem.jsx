/**
 * NotificacionItem - Card individual de notificación
 * 
 * @param {Object} props
 * @param {Object} props.notificacion - { id, mensaje, detalle }
 */
const NotificacionItem = ({ notificacion }) => {
  return (
    <div className="bg-white border-l-4 border-primary rounded-md p-4 shadow-sm mb-3 hover:shadow-md transition-shadow">
      <p className="font-semibold text-cesde-dark text-sm">{notificacion.mensaje}</p>
      {notificacion.detalle && (
        <p className="text-gray-500 text-xs mt-1">{notificacion.detalle}</p>
      )}
    </div>
  );
};

export default NotificacionItem;
