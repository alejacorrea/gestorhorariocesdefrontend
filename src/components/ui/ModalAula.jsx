import { useState, useEffect } from 'react';
import { getAulas, getSedes, createAula, updateAula, deleteAula } from '../../services/api';
import { alertExito, alertError, alertConfirmar } from '../../helpers/alerts';

const ModalAula = ({ abierto, onCerrar, onAulaCreada }) => {
  const [aulas, setAulas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [form, setForm] = useState({ idaula: null, numerodeaula: '', capacidadaula: '', id_sede: '', activo: true });
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  useEffect(() => {
    if (abierto) {
      cargarDatos();
      resetForm();
    }
  }, [abierto]);

  const cargarDatos = async () => {
    setCargandoDatos(true);
    try {
      const [listaSedes, listaAulas] = await Promise.all([getSedes(), getAulas()]);
      setSedes(listaSedes);
      setAulas(listaAulas);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setCargandoDatos(false);
    }
  };

  const resetForm = () => {
    setForm({ idaula: null, numerodeaula: '', capacidadaula: '', id_sede: '', activo: true });
    setErrores({});
    setModoEdicion(false);
  };

  if (!abierto) return null;

  const handleChange = (e) => {
    let { name, value, type, checked } = e.target;
    if (name === 'capacidadaula') {
      value = value.replace(/\D/g, '');
    }
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }));
  };

  const validar = () => {
    const nuevosErrores = {};

    if (!form.numerodeaula.trim()) {
      nuevosErrores.numerodeaula = 'El número de aula es obligatorio';
    } else if (form.numerodeaula.trim().length > 20) {
      nuevosErrores.numerodeaula = 'Máximo 20 caracteres';
    } else {
      const nombreLimpio = form.numerodeaula.trim().toLowerCase();
      const existe = aulas.find(a => 
        a.numerodeaula.toLowerCase() === nombreLimpio && 
        (!modoEdicion || String(a.idaula) !== String(form.idaula))
      );
      if (existe) {
        nuevosErrores.numerodeaula = 'Este aula ya está registrada';
      }
    }

    const cap = Number(form.capacidadaula);
    if (!form.capacidadaula) {
      nuevosErrores.capacidadaula = 'La capacidad es obligatoria';
    } else if (!Number.isInteger(cap) || cap < 1) {
      nuevosErrores.capacidadaula = 'Debe ser un número > 0';
    }

    if (!form.id_sede) {
      nuevosErrores.id_sede = 'Selecciona una sede';
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
        idaula: modoEdicion ? form.idaula : null,
        numerodeaula: form.numerodeaula.trim(),
        capacidadaula: Number(form.capacidadaula),
        sede: { idsede: Number(form.id_sede) },
        activo: form.activo,
      };

      if (modoEdicion) {
        await updateAula(form.idaula, dataAEnviar);
        await alertExito('¡Aula Modificada!', `Se actualizó el aula ${dataAEnviar.numerodeaula}.`);
      } else {
        const nueva = await createAula(dataAEnviar);
        await alertExito('¡Aula Creada!', `El aula "${nueva.numerodeaula}" fue agregada.`);
        if (onAulaCreada) onAulaCreada(nueva);
      }
      cargarDatos();
      resetForm();
    } catch (err) {
      await alertError('Error', err.message || 'No se pudo guardar el aula.');
    } finally {
      setCargando(false);
    }
  };

  const handleEditar = (a) => {
    setModoEdicion(true);
    setForm({
      idaula: a.idaula,
      numerodeaula: a.numerodeaula,
      capacidadaula: a.capacidadaula,
      id_sede: a.id_sede || '',
      activo: a.activo,
    });
  };

  const handleEliminar = async (id, numero) => {
    const confirmado = await alertConfirmar('¿Eliminar aula?', `Se eliminará el aula "${numero}".`, 'Sí, eliminar');
    if (!confirmado) return;

    setCargando(true);
    try {
      await deleteAula(id);
      await alertExito('Eliminada', 'Aula eliminada correctamente.');
      cargarDatos();
    } catch (err) {
      await alertError('Error', 'No se pudo eliminar el aula (quizás tenga horarios asignados).');
    } finally {
      setCargando(false);
    }
  };

  // Helper para mostrar el nombre de la sede
  const getNombreSede = (id) => {
    const s = sedes.find(sede => String(sede.idsede) === String(id));
    return s ? s.nombresede : 'Sede Desconocida';
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box !w-[95%] md:!w-[800px] !max-w-5xl flex flex-col md:flex-row gap-6" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onCerrar}
          className="absolute top-3 right-4 text-primary text-2xl font-bold bg-transparent border-none cursor-pointer leading-none hover:text-primary-dark z-10"
        >
          &times;
        </button>

        {/* Sección Izquierda: Lista */}
        <div className="flex-1 flex flex-col border-r border-gray-200 pr-4">
          <h2 className="text-lg font-bold text-cesde-dark uppercase mb-3 border-b pb-2">
            Gestor de Aulas
          </h2>
          <div className="flex-1 overflow-y-auto max-h-96 pr-2">
            {cargandoDatos && aulas.length === 0 ? (
              <p className="text-center text-gray-500 text-sm mt-4">Cargando datos...</p>
            ) : aulas.length === 0 ? (
              <p className="text-center text-gray-500 text-sm mt-4">No hay aulas registradas</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {aulas.map(a => (
                  <div key={a.idaula} className="flex flex-col bg-gray-50 p-3 rounded border border-gray-100 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-cesde-dark">Aula {a.numerodeaula}</p>
                        <p className="text-xs text-gray-600">{getNombreSede(a.id_sede)}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleEditar(a)} className="text-blue-500 hover:text-blue-700 bg-blue-100 p-1.5 rounded cursor-pointer" title="Editar">
                          <i className="bi bi-pencil-square text-xs" />
                        </button>
                        <button onClick={() => handleEliminar(a.idaula, a.numerodeaula)} className="text-red-500 hover:text-red-700 bg-red-100 p-1.5 rounded cursor-pointer" title="Eliminar">
                          <i className="bi bi-trash text-xs" />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded">Cap: {a.capacidadaula}</span>
                      <span className={`font-bold ${a.activo ? 'text-green-600' : 'text-red-500'}`}>
                        {a.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sección Derecha: Formulario */}
        <div className="w-full md:w-1/3 flex flex-col pt-8 md:pt-0">
          <h3 className="text-md font-bold text-cesde-dark mb-4 text-center">
            {modoEdicion ? 'Modificar Aula' : 'Nueva Aula'}
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <input
                type="text"
                name="numerodeaula"
                placeholder="Número de aula (máx. 20 car.)"
                value={form.numerodeaula}
                onChange={handleChange}
                maxLength={20}
                className="input-cesde-pink"
                disabled={cargando}
              />
              {errores.numerodeaula && <p className="text-red-500 text-xs mt-1">{errores.numerodeaula}</p>}
            </div>

            <div>
              <input
                type="number"
                name="capacidadaula"
                placeholder="Capacidad (personas)"
                value={form.capacidadaula}
                onChange={handleChange}
                min={1}
                className="input-cesde-pink"
                disabled={cargando}
              />
              {errores.capacidadaula && <p className="text-red-500 text-xs mt-1">{errores.capacidadaula}</p>}
            </div>

            <div>
              <select
                name="id_sede"
                value={form.id_sede}
                onChange={handleChange}
                className="input-cesde-pink"
                disabled={cargando || cargandoDatos}
              >
                <option value="" disabled>{cargandoDatos ? 'Cargando sedes...' : 'Seleccionar sede'}</option>
                {sedes.map(s => (
                  <option key={s.idsede} value={s.idsede}>{s.nombresede}</option>
                ))}
              </select>
              {errores.id_sede && <p className="text-red-500 text-xs mt-1">{errores.id_sede}</p>}
            </div>

            <label className="flex items-center gap-2 text-sm text-cesde-dark cursor-pointer select-none mt-1">
              <input
                type="checkbox"
                name="activo"
                checked={form.activo}
                onChange={handleChange}
                className="accent-primary w-4 h-4"
                disabled={cargando}
              />
              Aula activa
            </label>

            <div className="flex flex-col gap-2 mt-4">
              <button type="submit" className="btn-primary w-full" disabled={cargando || cargandoDatos}>
                {cargando ? 'Guardando...' : (modoEdicion ? 'Guardar Cambios' : 'Crear Aula')}
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

export default ModalAula;
