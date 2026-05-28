/**
 * CalendarioProfesor - Calendario con vistas Mes / Semana / Día
 *
 * @param {Array}    props.horarios   - Horarios del profesor para mostrar eventos
 * @param {Function} props.onClickDia - Callback con { dia, mes, anio, fecha, nombreMes } al hacer clic
 */
import { useState, useRef } from 'react';

const MESES      = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DIAS_FULL  = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
const DIAS_CORTO = ['Lun','Mar','Mié','Jue','Vie','Sab','Dom'];

// Horas de grilla para la vista Día (07:00 – 22:00)
const HORAS = Array.from({ length: 16 }, (_, i) => `${String(i + 7).padStart(2, '0')}:00`);

// ─── Utilidades de fecha ────────────────────────────────────────────────────

/** Devuelve 'YYYY-MM-DD' de un objeto Date */
const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Devuelve el lunes de la semana que contiene la fecha dada */
const lunesDe = (fecha) => {
  const d = new Date(fecha);
  const dow = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dow);
  return d;
};

/** Añade N días a una fecha (sin mutar el original) */
const addDias = (fecha, n) => {
  const d = new Date(fecha);
  d.setDate(d.getDate() + n);
  return d;
};

// ─── Tooltip de evento ───────────────────────────────────────────────────────
const EventoTooltip = ({ evento, onClose, onEditar, onEliminar }) => {
  if (!evento) return null;
  return (
    <div
      className="evento-tooltip"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Flecha decorativa */}
      <div className="evento-tooltip-arrow" />

      {/* Cabecera */}
      <div className="evento-tooltip-header">
        <i className="bi bi-book-half" />
        <span className="font-bold truncate">{evento.clase || evento.materia || 'Clase'}</span>
        <button
          onClick={onClose}
          className="ml-auto text-white/70 hover:text-white bg-transparent border-none cursor-pointer text-lg leading-none"
          aria-label="Cerrar"
        >
          &times;
        </button>
      </div>

      {/* Detalles */}
      <div className="evento-tooltip-body">
        {(evento.horaInicio || evento.horaFin) && (
          <div className="evento-tooltip-row">
            <i className="bi bi-clock text-primary" />
            <span>{evento.horaInicio} – {evento.horaFin}</span>
          </div>
        )}
        {evento.aula && (
          <div className="evento-tooltip-row">
            <i className="bi bi-door-open text-primary" />
            <span>Aula {evento.aula}</span>
          </div>
        )}
        {evento.sede && (
          <div className="evento-tooltip-row">
            <i className="bi bi-geo-alt text-primary" />
            <span>{evento.sede}</span>
          </div>
        )}
        {evento.recurrencia && evento.recurrencia !== 'Unico' && (
          <div className="evento-tooltip-row">
            <i className="bi bi-arrow-repeat text-primary" />
            <span>Recurrencia: {evento.recurrencia}</span>
          </div>
        )}

        {/* Botones solo si el evento fue creado por el profesor */}
        {evento.isPropio && (
          <div className="flex flex-col gap-1.5 mt-3 pt-2 border-t border-gray-200">
            <button
              onClick={() => onEditar && onEditar(evento)}
              className="w-full flex items-center justify-center gap-1 text-xs bg-primary hover:opacity-80 text-white rounded px-2 py-1.5 border-none cursor-pointer transition-opacity font-medium"
            >
              <i className="bi bi-pencil" /> Modificar
            </button>
            <button
              onClick={() => onEliminar && onEliminar(evento)}
              className="w-full flex items-center justify-center gap-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1.5 border-none cursor-pointer transition-colors font-medium"
            >
              <i className="bi bi-trash" /> Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Componente ─────────────────────────────────────────────────────────────

const CalendarioProfesor = ({ horarios = [], onClickDia, onEditarEvento, onEliminarEvento }) => {
  const hoy = new Date();

  // Estado principal
  const [vista,          setVista]          = useState('mes');
  const [mesActual,      setMesActual]      = useState(hoy.getMonth());
  const [anioActual,     setAnioActual]     = useState(hoy.getFullYear());
  const [semanaBase,     setSemanaBase]     = useState(lunesDe(hoy));
  const [diaActivo,      setDiaActivo]      = useState(new Date(hoy));
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  // Estado del tooltip
  const [tooltipEvento,  setTooltipEvento]  = useState(null);
  const tooltipTimer = useRef(null);
  const hoverTimer = useRef(null);

  // Mostrar tooltip al hacer hover sobre un evento
  const handleEventoMouseEnter = (ev) => {
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    
    hoverTimer.current = setTimeout(() => {
      setTooltipEvento(ev);
    }, 150);
  };

  // Ocultar tooltip con un pequeño delay para que sea fluido
  const handleEventoMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    tooltipTimer.current = setTimeout(() => setTooltipEvento(null), 300);
  };

  const handleTooltipMouseEnter = () => {
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  };

  const handleTooltipMouseLeave = () => {
    tooltipTimer.current = setTimeout(() => setTooltipEvento(null), 300);
  };

  // ── Clase dinámica de botones de vista ──────────────────────────────────
  const btnVista = (v) =>
    v === vista
      ? 'bg-primary text-white px-3 py-1 text-sm rounded border-none cursor-pointer'
      : 'btn-secondary px-3 py-1 text-sm';

  // ── Navegación unificada ─────────────────────────────────────────────────
  const irAnterior = () => {
    if (vista === 'mes') {
      if (mesActual === 0) { setMesActual(11); setAnioActual(a => a - 1); }
      else setMesActual(m => m - 1);
    } else if (vista === 'semana') {
      setSemanaBase(prev => addDias(prev, -7));
    } else {
      setDiaActivo(prev => addDias(prev, -1));
    }
  };

  const irSiguiente = () => {
    if (vista === 'mes') {
      if (mesActual === 11) { setMesActual(0); setAnioActual(a => a + 1); }
      else setMesActual(m => m + 1);
    } else if (vista === 'semana') {
      setSemanaBase(prev => addDias(prev, 7));
    } else {
      setDiaActivo(prev => addDias(prev, 1));
    }
  };

  const irHoy = () => {
    setMesActual(hoy.getMonth());
    setAnioActual(hoy.getFullYear());
    setSemanaBase(lunesDe(hoy));
    setDiaActivo(new Date(hoy));
    setDiaSeleccionado(null);
  };

  // ── Título del período visible ────────────────────────────────────────────
  const titulo = () => {
    if (vista === 'mes') return `${MESES[mesActual]} de ${anioActual}`;
    if (vista === 'semana') {
      const domingo = addDias(semanaBase, 6);
      return `${semanaBase.getDate()} – ${domingo.getDate()} ${MESES[domingo.getMonth()]} ${domingo.getFullYear()}`;
    }
    return `${diaActivo.getDate()} de ${MESES[diaActivo.getMonth()]} de ${diaActivo.getFullYear()}`;
  };

  // ── Helpers de eventos ────────────────────────────────────────────────────
  const getEventosDia = (fecha) => {
    if (!fecha) return [];
    return horarios.filter(h => h.fecha === fecha);
  };

  const getEventosHora = (fecha, horaSlot) =>
    getEventosDia(fecha).filter(ev => ev.horaInicio && ev.horaInicio.startsWith(horaSlot.slice(0, 2)));

  // ── Clic en día vacío (no en evento) ────────────────────────────────────
  const handleClickDia = (fecha, dia, mes, anio, nombreMes) => {
    setDiaSeleccionado(fecha);
    if (onClickDia) onClickDia({ dia, mes, anio, fecha, nombreMes });
  };

  // ── Vista MES ────────────────────────────────────────────────────────────
  const getCeldas = () => {
    const primerDia       = new Date(anioActual, mesActual, 1);
    const ultimoDia       = new Date(anioActual, mesActual + 1, 0);
    const diaSemanaInicio = (primerDia.getDay() + 6) % 7;
    const totalDias       = ultimoDia.getDate();
    const celdas          = [];
    const diasMesAnterior = new Date(anioActual, mesActual, 0).getDate();

    for (let i = diaSemanaInicio - 1; i >= 0; i--)
      celdas.push({ dia: diasMesAnterior - i, esDelMes: false, fecha: null });

    for (let dia = 1; dia <= totalDias; dia++) {
      const fecha = `${anioActual}-${String(mesActual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      celdas.push({ dia, esDelMes: true, fecha });
    }

    const restantes = 7 - (celdas.length % 7);
    if (restantes < 7)
      for (let dia = 1; dia <= restantes; dia++)
        celdas.push({ dia, esDelMes: false, fecha: null });

    return celdas;
  };

  const esHoy = (dia, esDelMes) =>
    esDelMes && dia === hoy.getDate() && mesActual === hoy.getMonth() && anioActual === hoy.getFullYear();

  // ── Render chip de evento con tooltip ───────────────────────────────────
  const renderEvento = (ev) => (
    <div
      key={ev.id}
      className="relative"
      onMouseEnter={() => handleEventoMouseEnter(ev)}
      onMouseLeave={handleEventoMouseLeave}
      onClick={(e) => {
        e.stopPropagation();
        handleEventoMouseEnter(ev);
      }}
    >
      <span className="cal-evento block truncate cursor-pointer">
        {ev.clase || ev.materia}
      </span>
      {tooltipEvento?.id === ev.id && (
        <div
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        >
          <EventoTooltip
            evento={ev}
            onClose={() => setTooltipEvento(null)}
            onEditar={(e) => { setTooltipEvento(null); onEditarEvento && onEditarEvento(e); }}
            onEliminar={(e) => { setTooltipEvento(null); onEliminarEvento && onEliminarEvento(e); }}
          />
        </div>
      )}
    </div>
  );

  const renderMes = () => {
    const celdas = getCeldas();
    return (
      <div className="grid grid-cols-7 gap-1">
        {DIAS_CORTO.map(d => (
          <div key={d} className="cal-dia-header">{d}</div>
        ))}
        {celdas.map((celda, i) => {
          const eventos     = getEventosDia(celda.fecha);
          const activo      = esHoy(celda.dia, celda.esDelMes);
          const seleccionado = celda.fecha === diaSeleccionado;
          return (
            <div
              key={i}
              onClick={() => {
                if (!celda.esDelMes) return;
                handleClickDia(celda.fecha, celda.dia, mesActual + 1, anioActual, MESES[mesActual]);
              }}
              className={`cal-celda min-h-[60px]
                ${activo ? 'cal-celda-activa' : ''}
                ${seleccionado && !activo ? 'ring-2 ring-primary ring-offset-1' : ''}
                ${!celda.esDelMes ? 'opacity-30 cursor-default' : 'cursor-pointer'}`}
            >
              <span className="text-xs font-semibold">{celda.dia}</span>
              {eventos.map(ev => renderEvento(ev))}
            </div>
          );
        })}
      </div>
    );
  };

  // ── Vista SEMANA ─────────────────────────────────────────────────────────
  const renderSemana = () => {
    const dias   = Array.from({ length: 7 }, (_, i) => addDias(semanaBase, i));
    const hoyISO = toISO(hoy);

    return (
      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 gap-1 min-w-[560px]">
          {/* Encabezados */}
          {dias.map((d, i) => {
            const iso    = toISO(d);
            const esHoyD = iso === hoyISO;
            return (
              <div
                key={i}
                className={`cal-dia-header flex flex-col items-center gap-0.5 py-1.5
                  ${esHoyD ? 'bg-primary text-white rounded' : ''}`}
              >
                <span className="text-[11px] font-medium">{DIAS_FULL[i].slice(0, 3)}</span>
                <span className={`text-base font-bold leading-none ${esHoyD ? 'text-white' : 'text-cesde-dark'}`}>
                  {d.getDate()}
                </span>
              </div>
            );
          })}

          {/* Celdas de eventos */}
          {dias.map((d, i) => {
            const iso    = toISO(d);
            const eventos = getEventosDia(iso);
            const esHoyD  = iso === hoyISO;
            return (
              <div
                key={i}
                onClick={() => handleClickDia(iso, d.getDate(), d.getMonth() + 1, d.getFullYear(), MESES[d.getMonth()])}
                className={`min-h-[120px] rounded p-1 flex flex-col gap-1 cursor-pointer
                  ${esHoyD ? 'bg-pink-50 ring-1 ring-primary ring-inset' : 'bg-gray-50 hover:bg-gray-100 transition-colors'}`}
              >
                {eventos.length === 0 ? (
                  <span className="text-[10px] text-gray-300 mt-1 text-center">—</span>
                ) : (
                  eventos.map((ev, ei) => (
                    <span key={`sem-${i}-ev-${ev.id}-${ei}`} className="cal-evento block text-[11px]">
                      <span className="font-semibold block truncate">{ev.clase || ev.materia}</span>
                      {ev.horaInicio && (
                        <span className="text-[10px] opacity-80">{ev.horaInicio} – {ev.horaFin}</span>
                      )}
                    </span>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── Vista DÍA ────────────────────────────────────────────────────────────
  const renderDia = () => {
    const iso     = toISO(diaActivo);
    const eventos = getEventosDia(iso);

    return (
      <div className="overflow-y-auto max-h-[520px] pr-1">
        <table className="w-full border-collapse text-sm">
          <tbody>
            {HORAS.map(hora => {
              const evs = getEventosHora(iso, hora);
              return (
                <tr
                  key={hora}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() =>
                    handleClickDia(iso, diaActivo.getDate(), diaActivo.getMonth() + 1, diaActivo.getFullYear(), MESES[diaActivo.getMonth()])
                  }
                >
                  <td className="w-14 pr-2 py-2 text-right text-[11px] text-gray-400 font-mono align-top select-none">
                    {hora}
                  </td>
                  <td className="py-1 pl-2 align-top">
                    {evs.map((ev, ei) => (
                      <span key={`dia-${hora}-ev-${ev.id}-${ei}`} className="cal-evento block mb-1">
                        <span className="font-semibold block">{ev.clase || ev.materia}</span>
                        <span className="text-[10px] opacity-80">
                          {ev.horaInicio} – {ev.horaFin}
                          {ev.aula ? ` · Aula ${ev.aula}` : ''}
                        </span>
                      </span>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {eventos.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-6">Sin eventos para este día</p>
        )}
      </div>
    );
  };

  // ── Render principal ─────────────────────────────────────────────────────
  return (
    <div className="card">
      {/* Barra de navegación */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-1">
          <button onClick={irAnterior} className="btn-secondary px-2 py-1 text-sm" aria-label="Anterior">
            <i className="bi bi-chevron-left" />
          </button>
          <button onClick={irSiguiente} className="btn-secondary px-2 py-1 text-sm" aria-label="Siguiente">
            <i className="bi bi-chevron-right" />
          </button>
          <button onClick={irHoy} className="btn-secondary px-3 py-1 text-sm ml-1">Hoy</button>
        </div>

        <span className="font-bold text-cesde-dark text-sm">{titulo()}</span>

        <div className="flex gap-1">
          <button className={btnVista('mes')}    onClick={() => setVista('mes')}>Mes</button>
          <button className={btnVista('semana')} onClick={() => setVista('semana')}>Semana</button>
          <button className={btnVista('dia')}    onClick={() => setVista('dia')}>Día</button>
        </div>
      </div>

      {/* Contenido según vista */}
      {vista === 'mes'    && renderMes()}
      {vista === 'semana' && renderSemana()}
      {vista === 'dia'    && renderDia()}
    </div>
  );
};

export default CalendarioProfesor;
