import { useState, useEffect } from 'react';
import { getSedes, createSede, updateSede, deleteSede } from '../../services/api';
import { alertExito, alertError, alertConfirmar } from '../../helpers/alerts';

const ModalSede = ({ abierto, onCerrar, onSedeCreada }) => {
  const [sedes, setSedes] = useState([]);
  const [form, setForm] = useState({ idsede: null, nombresede: '' });
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  useEffect(() => {
    if (abierto) {
      cargarSedes();
      resetForm();
    }
  }, [abierto]);

  const cargarSedes = async () => {
    setCargando(true);
    try {
      const data = await getSedes();
      setSedes(data);
    } catch (error) {
      console.error("Error cargando sedes", error);
    } finally {
      setCargando(false);
    }
  };

  const resetForm = () => {
    setForm({ idsede: null, nombresede: '' });
    setErrores({});
    setModoEdicion(false);
  };

  if (!abierto) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }));
  };

  const validar = () => {
    const nuevosErrores = {};
    if (!form.nombresede.trim()) {
      nuevosErrores.nombresede = 'El nombre de la sede es obligatorio';
    } else if (form.nombresede.trim().length > 40) {
      nuevosErrores.nombresede = 'Máximo 40 caracteres';
    } else {
      const nombreLimpio = form.nombresede.trim().toLowerCase();
      const existe = sedes.find(s => 
        s.nombresede.toLowerCase() === nombreLimpio && 
        (!modoEdicion || String(s.idsede) !== String(form.idsede))
      );
      if (existe) {
        nuevosErrores.nombresede = 'Esta sede ya está registrada';
      }
    }
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;

    setCargando(true);
    try {
      const dataAEnviar = {
        idsede: modoEdicion ? form.idsede : null,
        nombresede: form.nombresede.trim(),
        activo: true
      };

      if (modoEdicion) {
        await updateSede(form.idsede, dataAEnviar);
        await alertExito('¡Modificada!', `Sede actualizada correctamente.`);
      } else {
        const nueva = await createSede(dataAEnviar);
        await alertExito('¡Creada!', `La sede "${nueva.nombresede}" fue agregada.`);
        if (onSedeCreada) onSedeCreada(nueva);
      }
      cargarSedes();
      resetForm();
    } catch (err) {
      await alertError('Error', err.message || 'No se pudo guardar la sede.');
    } finally {
      setCargando(false);
    }
  };

  const handleEditar = (s) => {
    setModoEdicion(true);
    setForm({
      idsede: s.idsede,
      nombresede: s.nombresede
    });
  };

  const handleEliminar = async (id, nombre) => {
    const confirmado = await alertConfirmar('¿Eliminar sede?', `Se eliminará la sede "${nombre}" permanentemente. Las aulas asociadas podrían verse afectadas.`, 'Sí, eliminar');
    if (!confirmado) return;

    setCargando(true);
    try {
      await deleteSede(id);
      await alertExito('Eliminada', 'Sede eliminada correctamente.');
      cargarSedes();
    } catch (err) {
      await alertError('Error', 'No se pudo eliminar la sede (quizás tenga aulas u horarios asignados).');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box !w-[95%] md:!w-[800px] !max-w-4xl !max-h-[90vh] overflow-y-auto flex flex-col md:flex-row gap-6" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onCerrar}
          className="absolute top-3 right-4 text-primary text-2xl font-bold bg-transparent border-none cursor-pointer leading-none hover:text-primary-dark z-10"
        >
          &times;
        </button>

        {/* Sección Izquierda: Lista */}
        <div className="flex-1 flex flex-col border-r border-gray-200 pr-4">
          <h2 className="text-lg font-bold text-cesde-dark uppercase mb-3 border-b pb-2">
            Gestor de Sedes
          </h2>
          <div className="flex-1 overflow-y-auto max-h-80 pr-2">
            {cargando && sedes.length === 0 ? (
              <p className="text-center text-gray-500 text-sm mt-4">Cargando...</p>
            ) : sedes.length === 0 ? (
              <p className="text-center text-gray-500 text-sm mt-4">No hay sedes registradas</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {sedes.map(s => (
                  <li key={s.idsede} className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-100 hover:shadow-sm transition-shadow">
                    <div>
                      <p className="font-semibold text-sm text-cesde-dark">{s.nombresede}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditar(s)} className="text-blue-500 hover:text-blue-700 bg-blue-100 p-1.5 rounded cursor-pointer" title="Editar">
                        <i className="bi bi-pencil-square" />
                      </button>
                      <button onClick={() => handleEliminar(s.idsede, s.nombresede)} className="text-red-500 hover:text-red-700 bg-red-100 p-1.5 rounded cursor-pointer" title="Eliminar">
                        <i className="bi bi-trash" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Sección Derecha: Formulario */}
        <div className="w-full md:w-1/3 flex flex-col pt-8 md:pt-0">
          <h3 className="text-md font-bold text-cesde-dark mb-4 text-center">
            {modoEdicion ? 'Modificar Sede' : 'Nueva Sede'}
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <input
                type="text"
                name="nombresede"
                placeholder="Nombre (máx. 40 car.)"
                value={form.nombresede}
                onChange={handleChange}
                maxLength={40}
                className="input-cesde-pink"
                disabled={cargando}
              />
              {errores.nombresede && (
                <p className="text-red-500 text-xs mt-1">{errores.nombresede}</p>
              )}
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={cargando}
              >
                {cargando ? 'Guardando...' : (modoEdicion ? 'Guardar Cambios' : 'Crear Sede')}
              </button>
              {modoEdicion && (
                <button type="button" onClick={resetForm} className="btn-secondary w-full text-xs py-1" disabled={cargando}>
                  Cancelar Edición
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalSede;
