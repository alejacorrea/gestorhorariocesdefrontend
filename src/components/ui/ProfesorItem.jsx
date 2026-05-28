/**
 * ProfesorItem - Elemento de la lista de profesores en el panel admin
 * Muestra el nombre del profesor con un menú de 3 puntos para las acciones
 * 
 * @param {Object} props
 * @param {Object} props.profesor - { id, nombre, correo, asignatura, sede }
 * @param {Function} props.onVerInfo - Callback para ver información
 * @param {Function} props.onModificar - Callback para modificar
 * @param {Function} props.onEliminar - Callback para eliminar
 */
import { useState } from 'react';

const ProfesorItem = ({ profesor, onVerInfo, onModificar, onEliminar }) => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [dropUp, setDropUp] = useState(false);

  const toggleMenu = (e) => {
    if (!menuAbierto) {
      // Calculamos si hay suficiente espacio abajo (aprox 150px)
      const rect = e.currentTarget.getBoundingClientRect();
      const espacioAbajo = window.innerHeight - rect.bottom;
      setDropUp(espacioAbajo < 160);
    }
    setMenuAbierto(!menuAbierto);
  };

  return (
    <div className="prof-item">
      {/* Nombre del profesor */}
      <span className="text-sm text-cesde-dark truncate mr-2">{profesor.nombre}</span>

      {/* Menú de 3 puntos */}
      <div className="relative flex-shrink-0">
        <button
          onClick={toggleMenu}
          className="bg-transparent border-none cursor-pointer text-cesde-dark hover:text-primary transition-colors p-1"
          aria-label={`Opciones de ${profesor.nombre}`}
        >
          <i className="bi bi-three-dots-vertical text-lg" />
        </button>

        {/* Dropdown de opciones */}
        {menuAbierto && (
          <>
            {/* Overlay para cerrar */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuAbierto(false)}
            />
            <div className={`absolute right-0 ${dropUp ? 'bottom-8' : 'top-8'} bg-white border border-gray-200 rounded-md shadow-lg z-[100] min-w-[160px] text-sm animate-fade-in overflow-hidden`}>
              <button
                onClick={() => { setMenuAbierto(false); onVerInfo(profesor); }}
                className="block w-full text-left px-3 py-2 text-cesde-dark bg-transparent border-none cursor-pointer hover:bg-cesde-gray transition-colors border-b border-gray-100"
              >
                <i className="bi bi-info-circle mr-2 text-primary" />
                Ver información
              </button>
              <button
                onClick={() => { setMenuAbierto(false); onModificar(profesor); }}
                className="block w-full text-left px-3 py-2 text-cesde-dark bg-transparent border-none cursor-pointer hover:bg-cesde-gray transition-colors border-b border-gray-100"
              >
                <i className="bi bi-pencil mr-2 text-primary" />
                Modificar
              </button>
              <button
                onClick={() => { setMenuAbierto(false); onEliminar(profesor); }}
                className="block w-full text-left px-3 py-2 text-red-500 bg-transparent border-none cursor-pointer hover:bg-red-50 transition-colors"
              >
                <i className="bi bi-trash mr-2" />
                Eliminar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfesorItem;
