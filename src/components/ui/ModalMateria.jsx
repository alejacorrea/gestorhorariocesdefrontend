import { useState, useEffect } from 'react';
import { getMaterias, createMateria, updateMateria, deleteMateria } from '../../services/api';
import { alertExito, alertError, alertConfirmar } from '../../helpers/alerts';

const ModalMateria = ({ abierto, onCerrar, onMateriaCreada }) => {
  const [materias, setMaterias] = useState([]);
  const [form, setForm] = useState({ idmateria: null, nombremateria: '', activo: true });
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  useEffect(() => {
    if (abierto) {
      cargarMaterias();
      resetForm();
    }
  }, [abierto]);

  const cargarMaterias = async () => {
    setCargando(true);
    try {
      const data = await getMaterias();
      setMaterias(data);
    } catch (error) {
      console.error("Error cargando materias", error);
    } finally {
      setCargando(false);
    }
  };

  const resetForm = () => {
    setForm({ idmateria: null, nombremateria: '', activo: true });
    setErrores({});
    setModoEdicion(false);
  };

  if (!abierto) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }));
  };

  const validar = () => {
    const nuevosErrores = {};
    if (!form.nombremateria.trim()) {
      nuevosErrores.nombremateria = 'El nombre es obligatorio';
    } else if (form.nombremateria.trim().length > 20) {
      nuevosErrores.nombremateria = 'Máximo 20 caracteres';
    } else {
      const nombreLimpio = form.nombremateria.trim().toLowerCase();
      const existe = materias.find(m => 
        m.nombremateria.toLowerCase() === nombreLimpio && 
        (!modoEdicion || m.idmateria !== form.idmateria)
      );
      if (existe) {
        nuevosErrores.nombremateria = 'Esta materia ya está registrada';
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
        nombremateria: form.nombremateria.trim(),
        activo: form.activo,
      };

      if (modoEdicion) {
        await updateMateria(form.idmateria, dataAEnviar);
        await alertExito('¡Modificada!', `Materia actualizada correctamente.`);
      } else {
        const nueva = await createMateria(dataAEnviar);
        await alertExito('¡Creada!', `"${nueva.nombremateria}" fue agregada.`);
        if (onMateriaCreada) onMateriaCreada(nueva);
      }
      cargarMaterias();
      resetForm();
    } catch (err) {
      await alertError('Error', err.message || 'No se pudo guardar la materia.');
    } finally {
      setCargando(false);
    }
  };

  const handleEditar = (m) => {
    setModoEdicion(true);
    setForm({
      idmateria: m.idmateria,
      nombremateria: m.nombremateria,
      activo: m.activo,
    });
  };

  const handleEliminar = async (id, nombre) => {
    const confirmado = await alertConfirmar('¿Eliminar materia?', `Se eliminará la materia "${nombre}" de forma permanente.`, 'Sí, eliminar');
    if (!confirmado) return;

    setCargando(true);
    try {
      await deleteMateria(id);
      await alertExito('Eliminada', 'Materia eliminada correctamente.');
      cargarMaterias();
    } catch (err) {
      await alertError('Error', 'No se pudo eliminar la materia (puede que tenga horarios asignados).');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box !w-[95%] md:!w-[800px] !max-w-4xl flex flex-col md:flex-row gap-6" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onCerrar}
          className="absolute top-3 right-4 text-primary text-2xl font-bold bg-transparent border-none cursor-pointer leading-none hover:text-primary-dark z-10"
        >
          &times;
        </button>

        {/* Sección Izquierda: Lista */}
        <div className="flex-1 flex flex-col border-r border-gray-200 pr-4">
          <h2 className="text-lg font-bold text-cesde-dark uppercase mb-3 border-b pb-2">
            Gestor de Materias
          </h2>
          <div className="flex-1 overflow-y-auto max-h-80 pr-2">
            {cargando && materias.length === 0 ? (
              <p className="text-center text-gray-500 text-sm mt-4">Cargando...</p>
            ) : materias.length === 0 ? (
              <p className="text-center text-gray-500 text-sm mt-4">No hay materias registradas</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {materias.map(m => (
                  <li key={m.idmateria} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-100 hover:shadow-sm transition-shadow">
                    <div>
                      <p className="font-semibold text-sm text-cesde-dark">{m.nombremateria}</p>
                      <p className={`text-xs font-bold ${m.activo ? 'text-green-600' : 'text-red-500'}`}>
                        {m.activo ? 'Activa' : 'Inactiva'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditar(m)} className="text-blue-500 hover:text-blue-700 bg-blue-100 p-1.5 rounded cursor-pointer" title="Editar">
                        <i className="bi bi-pencil-square" />
                      </button>
                      <button onClick={() => handleEliminar(m.idmateria, m.nombremateria)} className="text-red-500 hover:text-red-700 bg-red-100 p-1.5 rounded cursor-pointer" title="Eliminar">
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
            {modoEdicion ? 'Modificar Materia' : 'Nueva Materia'}
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <input
                type="text"
                name="nombremateria"
                placeholder="Nombre (máx. 20 car.)"
                value={form.nombremateria}
                onChange={handleChange}
                maxLength={20}
                className="input-cesde-pink"
                disabled={cargando}
              />
              {errores.nombremateria && (
                <p className="text-red-500 text-xs mt-1">{errores.nombremateria}</p>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm text-cesde-dark cursor-pointer select-none mt-2">
              <input
                type="checkbox"
                name="activo"
                checked={form.activo}
                onChange={handleChange}
                className="accent-primary w-4 h-4"
                disabled={cargando}
              />
              Materia activa
            </label>

            <div className="flex flex-col gap-2 mt-4">
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={cargando}
              >
                {cargando ? 'Guardando...' : (modoEdicion ? 'Guardar Cambios' : 'Crear Materia')}
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

export default ModalMateria;
