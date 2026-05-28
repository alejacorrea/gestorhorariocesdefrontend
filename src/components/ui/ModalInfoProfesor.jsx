/**
 * ModalInfoProfesor - Modal para ver la información completa de un profesor
 * 
 * @param {Object} props
 * @param {boolean} props.abierto
 * @param {Object} props.profesor - { nombre, cedula, correo, asignatura, sede }
 * @param {Function} props.onCerrar
 */
const ModalInfoProfesor = ({ abierto, profesor, onCerrar }) => {
  if (!abierto || !profesor) return null;

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

        <h2 className="text-xl font-bold text-cesde-dark mb-4">Información del Profesor</h2>

        <div className="space-y-2 text-sm text-cesde-dark">
          <p><span className="font-bold">Nombre:</span> {profesor.nombre}</p>
          {profesor.cedula && <p><span className="font-bold">Cédula:</span> {profesor.cedula}</p>}
          <p><span className="font-bold">Correo:</span> {profesor.correo}</p>
          {profesor.asignatura && <p><span className="font-bold">Asignatura:</span> {profesor.asignatura}</p>}
          {profesor.sede && <p><span className="font-bold">Sede:</span> {profesor.sede}</p>}
        </div>

        <button onClick={onCerrar} className="btn-primary w-full mt-5">
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default ModalInfoProfesor;
