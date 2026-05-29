/**
 * ProfesorPage - Panel principal del Profesor
 * 
 * Layout: Calendario a la izquierda + Sidebar de próximos eventos a la derecha
 * Al hacer clic en un día del calendario se abre un modal para agregar/modificar horario
 */
import { useState, useEffect } from 'react';
import HeaderProfesor from '../components/layout/HeaderProfesor';
import CalendarioProfesor from '../components/calendario/CalendarioProfesor';
import EventoItem from '../components/ui/EventoItem';
import { alertExito, alertError, alertConfirmar } from '../helpers/alerts';
import { getHorariosByProfesor, createHorarioProfesor, updateHorarioProfesor, deleteHorarioProfesor } from '../services/api';

// ============================================================
//  Modal de agregar/modificar horario del Profesor
// ============================================================
const ModalHorarioProfesor = ({ abierto, diaInfo, eventoAEditar, horarios, onCerrar, onGuardar, cargando }) => {
  const [form, setForm] = useState({
    materia: '', horaInicio: '', horaFin: '', instituto: '',
    fechaInicio: '', fechaFinalizacion: '', diasRecurrencia: [],
  });
  const [errores, setErrores] = useState({});

  const DIAS = ['Lun','Mar','Mié','Jue','Vie','Sab','Dom'];
  const modoEdicion = !!eventoAEditar;

  useEffect(() => {
    if (abierto) {
      setErrores({});
      if (eventoAEditar) {
        // Modo edición: prellenar con los datos existentes
        const recurrencia = eventoAEditar.recurrencia && eventoAEditar.recurrencia !== 'Unico'
          ? eventoAEditar.recurrencia.split(',').map(d => d.trim())
          : [];
        setForm({
          materia:           eventoAEditar.clase || '',
          horaInicio:        eventoAEditar.horaInicio || '',
          horaFin:           eventoAEditar.horaFin || '',
          instituto:         eventoAEditar.sede || '',
          fechaInicio:       eventoAEditar.fechaInicio || eventoAEditar.fecha || '',
          fechaFinalizacion: eventoAEditar.fechaFin || '',
          diasRecurrencia:   recurrencia,
        });
      } else {
        // Modo creación: limpiar el formulario
        setForm({ materia:'', horaInicio:'', horaFin:'', instituto:'', fechaInicio:'', fechaFinalizacion:'', diasRecurrencia:[] });
      }
    }
  }, [abierto, eventoAEditar]);

  if (!abierto) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }));
  };

  const validar = () => {
    const nuevosErrores = {};

    if (!form.materia.trim()) nuevosErrores.materia = 'La materia es obligatoria';
    
    if (!form.horaInicio) nuevosErrores.horaInicio = 'Requerido';
    if (!form.horaFin) nuevosErrores.horaFin = 'Requerido';
    
    if (form.horaInicio && form.horaFin && form.horaFin <= form.horaInicio) {
      nuevosErrores.horaFin = 'Debe ser mayor al inicio';
    }

    if (!form.fechaInicio) nuevosErrores.fechaInicio = 'Requerido';

    if (form.diasRecurrencia.length > 0) {
      if (!form.fechaFinalizacion) {
        nuevosErrores.fechaFinalizacion = 'Requerido por recurrencia';
      } else if (form.fechaFinalizacion < form.fechaInicio) {
        nuevosErrores.fechaFinalizacion = 'Debe ser posterior o igual al inicio';
      }
    } else if (form.fechaFinalizacion && form.fechaFinalizacion < form.fechaInicio) {
      nuevosErrores.fechaFinalizacion = 'Debe ser posterior o igual al inicio';
    }

    // ── Validar solapamientos con horarios existentes ──
    if (Object.keys(nuevosErrores).length === 0 && horarios && horarios.length > 0) {
      const fechaBase = form.fechaInicio || diaInfo?.fecha;
      if (fechaBase) {
        const hInicioStr = form.horaInicio;
        const hFinStr = form.horaFin;
        const fechasAEvaluar = [];

        if (form.diasRecurrencia.length === 0) {
          fechasAEvaluar.push(fechaBase);
        } else {
          const fFin = form.fechaFinalizacion ? new Date(form.fechaFinalizacion + 'T12:00:00') : new Date(fechaBase + 'T12:00:00');
          let fActual = new Date(fechaBase + 'T12:00:00');
          
          while (fActual <= fFin) {
            const mapaDias = ['Dom','Lun','Mar','Mié','Jue','Vie','Sab'];
            if (form.diasRecurrencia.includes(mapaDias[fActual.getDay()])) {
              const strY = fActual.getFullYear();
              const strM = String(fActual.getMonth() + 1).padStart(2, '0');
              const strD = String(fActual.getDate()).padStart(2, '0');
              fechasAEvaluar.push(`${strY}-${strM}-${strD}`);
            }
            fActual.setDate(fActual.getDate() + 1);
          }
        }

        const hayCruce = horarios.some(h => {
          if (eventoAEditar && h.id_original === eventoAEditar.id_original) return false;
          if (!fechasAEvaluar.includes(h.fecha)) return false;
          
          const evtInicio = h.horaInicio.slice(0, 5);
          const evtFin = h.horaFin.slice(0, 5);
          
          return (hInicioStr < evtFin && hFinStr > evtInicio);
        });

        if (hayCruce) {
          nuevosErrores.horaInicio = 'Se cruza con otra clase';
          nuevosErrores.horaFin = 'Revisa tu horario';
          alertError('Cruce de Horarios', 'El horario que intentas registrar se cruza con otra clase existente. Por favor, verifica las horas.');
        }
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const toggleDia = (dia) => {
    setForm(prev => ({
      ...prev,
      diasRecurrencia: prev.diasRecurrencia.includes(dia)
        ? prev.diasRecurrencia.filter(d => d !== dia)
        : [...prev.diasRecurrencia, dia],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validar()) return;

    onGuardar({
      materia_profesor:            form.materia.trim(),
      hora_inicio_profesor:        form.horaInicio,
      hora_fin_profesor:           form.horaFin,
      instituto:                   form.instituto,
      fecha_inicio_profesor:       form.fechaInicio || diaInfo?.fecha || '',
      fecha_finalizacion_profesor: form.fechaFinalizacion,
      recurrencia_dia_profesor:    form.diasRecurrencia.length > 0 ? form.diasRecurrencia.join(',') : 'Unico',
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box max-w-sm w-full" onClick={e => e.stopPropagation()}>
        
        <button onClick={onCerrar} className="absolute top-3 right-4 text-primary hover:text-pink-500 text-2xl font-bold bg-transparent border-none cursor-pointer transition-colors">
          &times;
        </button>
        
        <h3 className="text-xl font-bold text-cesde-dark mb-1 flex items-center gap-2">
          <i className={`bi ${modoEdicion ? 'bi-pencil-square' : 'bi-calendar-plus'} text-primary`} />
          {modoEdicion ? 'Modificar Horario' : 'Agregar Horario'}
        </h3>
        
        {!modoEdicion && diaInfo && (
          <p className="text-primary text-xs mb-5 font-semibold">
            {diaInfo.dia} de {diaInfo.nombreMes} de {diaInfo.anio}
          </p>
        )}
        {modoEdicion && (
          <p className="text-primary text-xs mb-5 font-semibold truncate pr-6">
            Editando: <span className="font-bold">{eventoAEditar.clase}</span>
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          
          {/* Materia */}
          <div>
            <label className="block font-semibold text-cesde-dark mb-1.5">Materia:</label>
            <div className="relative">
              <i className="bi bi-journal-bookmark absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input type="text" name="materia" value={form.materia} onChange={handleChange} className="input-cesde pl-9" placeholder="Ej. Matemáticas" disabled={cargando} />
            </div>
            {errores.materia && <p className="text-red-500 text-xs mt-1">{errores.materia}</p>}
          </div>

          {/* Horas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-cesde-dark mb-1.5">Hora Inicio:</label>
              <div className="relative">
                <i className="bi bi-clock absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input type="time" name="horaInicio" value={form.horaInicio} onChange={handleChange} className="input-cesde pl-9" disabled={cargando} />
              </div>
              {errores.horaInicio && <p className="text-red-500 text-xs mt-1 leading-tight">{errores.horaInicio}</p>}
            </div>
            <div>
              <label className="block font-semibold text-cesde-dark mb-1.5">Hora Fin:</label>
              <div className="relative">
                <i className="bi bi-clock-history absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input type="time" name="horaFin" value={form.horaFin} onChange={handleChange} className="input-cesde pl-9" disabled={cargando} />
              </div>
              {errores.horaFin && <p className="text-red-500 text-xs mt-1 leading-tight">{errores.horaFin}</p>}
            </div>
          </div>

          {/* Instituto / Sede */}
          <div>
            <label className="block font-semibold text-cesde-dark mb-1.5">Instituto / Sede:</label>
            <div className="relative">
              <i className="bi bi-building absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input type="text" name="instituto" value={form.instituto} onChange={handleChange} className="input-cesde pl-9" placeholder="Ej. Sede Principal" disabled={cargando} />
            </div>
          </div>

          {/* Días de Recurrencia (Pills) */}
          <div>
            <label className="block font-semibold text-cesde-dark mb-2">Días de Recurrencia:</label>
            <div className="flex flex-wrap gap-2">
              {DIAS.map(dia => {
                const activo = form.diasRecurrencia.includes(dia);
                return (
                  <button
                    key={dia}
                    type="button"
                    onClick={() => toggleDia(dia)}
                    disabled={cargando}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                      activo 
                        ? 'bg-primary text-white border-primary shadow-sm shadow-pink-200 scale-105' 
                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100 hover:text-cesde-dark'
                    }`}
                  >
                    {dia}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-semibold text-cesde-dark mb-1.5 truncate">Fecha Inicio:</label>
              <div className="relative">
                <input type="date" name="fechaInicio" value={form.fechaInicio} onChange={handleChange} className="input-cesde text-xs sm:text-sm" disabled={cargando} />
              </div>
              {errores.fechaInicio && <p className="text-red-500 text-xs mt-1 leading-tight">{errores.fechaInicio}</p>}
            </div>
            <div>
              <label className="block font-semibold text-cesde-dark mb-1.5 truncate">Fecha Finalización:</label>
              <div className="relative">
                <input type="date" name="fechaFinalizacion" value={form.fechaFinalizacion} onChange={handleChange} className="input-cesde text-xs sm:text-sm" disabled={cargando} />
              </div>
              {errores.fechaFinalizacion && <p className="text-red-500 text-xs mt-1 leading-tight">{errores.fechaFinalizacion}</p>}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-3 pt-3 border-t border-gray-100 mt-2">
            <button type="submit" className="btn-primary flex-1 py-3 text-sm shadow-md shadow-pink-200 hover:shadow-lg transition-all" disabled={cargando}>
              {cargando ? (
                <><i className="bi bi-hourglass-split mr-2 animate-spin inline-block" /> Guardando...</>
              ) : modoEdicion ? (
                <><i className="bi bi-save mr-2" /> Guardar Cambios</>
              ) : (
                <><i className="bi bi-check-circle mr-2" /> Guardar</>
              )}
            </button>
            <button type="button" onClick={onCerrar} className="btn-secondary flex-1 py-3 text-sm bg-gray-100 text-gray-600 hover:bg-gray-200">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================
//  Componente Principal ProfesorPage
// ============================================================
const ProfesorPage = () => {
  const [horarios, setHorarios] = useState([]);
  const [modalHorario, setModalHorario] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [eventoAEditar, setEventoAEditar] = useState(null); // null = crear, objeto = editar
  const [cargando, setCargando] = useState(false);

  // ID del profesor autenticado (guardado en localStorage al hacer login)
  const idProfesor = localStorage.getItem('id') ?? '';

  const cargarHorarios = async () => {
    if (!idProfesor) return;
    try {
      const lista = await getHorariosByProfesor(idProfesor);
      setHorarios(lista);
    } catch (err) {
      console.error('❌ Error cargando horarios del profesor:', err);
    }
  };

  useEffect(() => {
    cargarHorarios();
  }, [idProfesor]);

  // Próximos eventos derivados de los horarios reales (desde hoy en adelante)
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const proximosEventos = horarios
    .filter(h => {
      if (!h.fecha) return false;
      const fechaEvento = new Date(h.fecha + 'T00:00:00');
      return fechaEvento >= hoy;
    })
    .sort((a, b) => new Date(a.fecha + 'T00:00:00') - new Date(b.fecha + 'T00:00:00'))
    .slice(0, 5)
    .map(h => ({
      id:        h.id,
      materia:   h.clase,
      aula:      h.aula,
      horaInicio: h.horaInicio,
      horaFin:   h.horaFin,
      dia:       h.fecha ? new Date(h.fecha + 'T00:00:00').getDate() : '',
      mes:       h.fecha ? new Date(h.fecha + 'T00:00:00').toLocaleString('es-CO', { month: 'long' }) : '',
      isPropio:  h.isPropio,
    }));

  // Abre el modal en modo CREAR (desde clic en día del calendario)
  const handleClickDia = (info) => {
    setEventoAEditar(null);
    setDiaSeleccionado(info);
    setModalHorario(true);
  };

  // Abre el modal en modo EDITAR (desde el tooltip del evento)
  const handleEditarEvento = (evento) => {
    setEventoAEditar(evento);
    setDiaSeleccionado(null);
    setModalHorario(true);
  };

  // Elimina un horario propio con confirmación
  const handleEliminarEvento = async (evento) => {
    const confirmado = await alertConfirmar(
      `¿Eliminar "${evento.clase}"?`,
      'Esta acción no se puede deshacer.',
      'Sí, eliminar'
    );
    if (!confirmado) return;

    setCargando(true);
    try {
      await deleteHorarioProfesor(evento.id_original);
      await cargarHorarios();
      await alertExito('¡Eliminado!', 'El horario fue eliminado correctamente.');
    } catch (err) {
      await alertError('Error', 'No se pudo eliminar el horario. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  // Guarda (crear o actualizar) un horario
  const handleGuardarHorario = async (datos) => {
    setCargando(true);
    try {
      const payload = {
        materiaProfesor:            datos.materia_profesor,
        fechaInicioProfesor:        datos.fecha_inicio_profesor,
        horaInicioProfesor:         datos.hora_inicio_profesor.length === 5 ? datos.hora_inicio_profesor + ':00' : datos.hora_inicio_profesor,
        horaFinProfesor:            datos.hora_fin_profesor.length === 5 ? datos.hora_fin_profesor + ':00' : datos.hora_fin_profesor,
        instituto:                  datos.instituto,
        recurrenciaDiaProfesor:     datos.recurrencia_dia_profesor || 'Unico',
        fechaFinalizacionProfesor:  datos.fecha_finalizacion_profesor || datos.fecha_inicio_profesor,
        activo: true,
        identificacionPersona: idProfesor,
      };

      if (eventoAEditar) {
        // Modo edición
        payload.idHorarioProfesor = eventoAEditar.id_original;
        await updateHorarioProfesor(eventoAEditar.id_original, payload);
        await alertExito('¡Cambios guardados!', `"${datos.materia_profesor}" fue actualizado.`);
      } else {
        // Modo creación
        await createHorarioProfesor(payload);
        await alertExito('¡Horario guardado!', `La clase "${datos.materia_profesor}" fue registrada.`);
      }

      setModalHorario(false);
      setEventoAEditar(null);
      await cargarHorarios(); // Recargar el calendario
    } catch (err) {
      await alertError('Error', 'No se pudo guardar el horario. Revisa tu conexión.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-cesde-gray">
      <HeaderProfesor horarios={horarios} />

      <main className="flex-1 p-5 flex gap-5 flex-wrap lg:flex-nowrap">
        {/* Calendario */}
        <div className="flex-1 min-w-0">
          <CalendarioProfesor
            horarios={horarios}
            onClickDia={handleClickDia}
            onEditarEvento={handleEditarEvento}
            onEliminarEvento={handleEliminarEvento}
          />
        </div>

        {/* Sidebar: Próximos eventos */}
        <aside className="w-full lg:w-[260px] flex-shrink-0">
          <div className="card">
            <h3 className="font-bold text-cesde-dark mb-4 flex items-center gap-2">
              <i className="bi bi-calendar-event text-primary" />
              Próximos Eventos
            </h3>
            {proximosEventos.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No hay próximos eventos</p>
            ) : (
              proximosEventos.map(ev => (
                <EventoItem key={ev.id} evento={ev} />
              ))
            )}
          </div>
        </aside>
      </main>

      {/* Modal de horario (crear o editar) */}
      <ModalHorarioProfesor
        abierto={modalHorario}
        diaInfo={diaSeleccionado}
        eventoAEditar={eventoAEditar}
        horarios={horarios}
        onCerrar={() => { setModalHorario(false); setEventoAEditar(null); }}
        onGuardar={handleGuardarHorario}
        cargando={cargando}
      />
    </div>
  );
};

export default ProfesorPage;
