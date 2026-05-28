/**
 * ModalHorario - Modal para ver la información de una clase en el calendario
 * 
 * @param {Object} props
 * @param {boolean} props.abierto - Si el modal está visible
 * @param {Object} props.horario - { clase, profesor, horaInicio, horaFin, aula, sede }
 * @param {Function} props.onCerrar - Callback para cerrar
 * @param {boolean} props.isAdmin - Si es true, muestra opciones de admin
 * @param {Function} props.onEliminar - Callback para eliminar horario
 * @param {Function} props.onModificar - Callback para modificar horario
 */
const ModalHorario = ({ abierto, horario, onCerrar, isAdmin = false, onEliminar, onModificar }) => {
  if (!abierto || !horario) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Botón cerrar */}
        <button
          onClick={onCerrar}
          className="absolute top-3 right-4 text-primary text-2xl font-bold bg-transparent border-none cursor-pointer leading-none hover:text-primary-dark"
        >
          &times;
        </button>

        {horario.isPropio ? (
          <>
            <h2 className="text-lg font-bold text-cesde-dark mb-4 pr-6 flex items-center gap-2">
              <i className="bi bi-lock-fill text-orange-400" />
              Horario Externo
            </h2>
            <div className="space-y-2 text-sm text-cesde-dark pb-2">
              <p>
                <span className="font-bold">Hora:</span>{' '}
                {horario.horaInicio} - {horario.horaFin}
              </p>
              <p>
                <span className="font-bold">Profesor:</span> {horario.profesor}
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Título de la clase */}
            <h2 className="text-lg font-bold text-cesde-dark mb-4 pr-6">
              Clase de {horario.clase}
            </h2>

            {/* Detalles */}
            <div className="space-y-2 text-sm text-cesde-dark">
              <p>
                <span className="font-bold">Profesor:</span> {horario.profesor}
              </p>
              <p>
                <span className="font-bold">Hora:</span>{' '}
                {horario.horaInicio} - {horario.horaFin}
              </p>
              <p>
                <span className="font-bold">Aula:</span> {horario.aula}
              </p>
              <p>
                <span className="font-bold">Sede:</span> {horario.sede}
              </p>
            </div>

            {isAdmin ? (
              <div className="flex gap-2 mt-5">
                <button onClick={() => onEliminar(horario)} className="btn-secondary flex-1 !bg-red-50 !text-red-600 hover:!bg-red-100 !border-red-200">
                  Eliminar
                </button>
                <button onClick={() => onModificar(horario)} className="btn-primary flex-1">
                  Modificar
                </button>
              </div>
            ) : (
              <button onClick={onCerrar} className="btn-primary w-full mt-5">
                Cerrar
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ModalHorario;
