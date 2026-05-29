/**
 * EventoItem - Card de próximo evento para el sidebar del profesor
 * 
 * @param {Object} props
 * @param {Object} props.evento - { materia, aula, horaInicio, horaFin, dia, mes }
 */
const EventoItem = ({ evento }) => {
  return (
    <div className="flex items-center gap-3 bg-white rounded-lg p-3 shadow-sm mb-2 hover:shadow-md transition-shadow">
      {/* Info del evento */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-cesde-dark text-sm truncate">{evento.materia}</p>
        <p className="text-gray-500 text-xs mt-0.5">
          Aula: {evento.aula}<br />
          Hora: {evento.horaInicio} - {evento.horaFin}
        </p>
      </div>

      {/* Fecha */}
      <div className={`${evento.isPropio ? 'bg-purple-500' : 'bg-primary'} text-white rounded-lg w-12 h-12 flex flex-col items-center justify-center flex-shrink-0 text-center leading-tight`}>
        <span className="text-lg font-bold leading-none">{evento.dia}</span>
        <span className="text-xs">{evento.mes}</span>
      </div>
    </div>
  );
};

export default EventoItem;
