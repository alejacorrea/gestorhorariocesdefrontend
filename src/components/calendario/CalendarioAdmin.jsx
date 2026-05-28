/**
 * CalendarioAdmin - Calendario con vistas Mes / Semana / Día
 *
 * @param {Array}    props.horarios      - Lista de horarios a mostrar
 * @param {Function} props.onClickEvento - Callback al hacer clic en un evento
 */
import { useState } from 'react';

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
  const dow = (d.getDay() + 6) % 7; // 0 = lunes
  d.setDate(d.getDate() - dow);
  return d;
};

/** Añade N días a una fecha (sin mutar el original) */
const addDias = (fecha, n) => {
  const d = new Date(fecha);
  d.setDate(d.getDate() + n);
  return d;
};

// ─── Componente ─────────────────────────────────────────────────────────────

// Paleta de colores para diferenciar profesores
const COLORES = [
  '#E91E75', // Primario CESDE
  '#9C27B0', // Morado
  '#3F51B5', // Indigo
  '#009688', // Verde Azulado
  '#FF9800', // Naranja
  '#795548', // Marrón
  '#607D8B', // Gris Azulado
  '#F44336', // Rojo
  '#4CAF50', // Verde
  '#2196F3', // Azul
];

const getColorProfesor = (nombre) => {
  if (!nombre) return COLORES[0];
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) {
    hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORES[Math.abs(hash) % COLORES.length];
};

const CalendarioAdmin = ({ horarios = [], onClickEvento }) => {
  const hoy = new Date();

  // Estado principal
  const [vista,      setVista]      = useState('mes');
  const [mesActual,  setMesActual]  = useState(hoy.getMonth());
  const [anioActual, setAnioActual] = useState(hoy.getFullYear());
  const [semanaBase, setSemanaBase] = useState(lunesDe(hoy));  // primer día (lunes) de la semana visible
  const [diaActivo,  setDiaActivo]  = useState(new Date(hoy)); // día visible en vista Día

  // ── Clase dinámica de botones de vista ──────────────────────────────────
  const btnVista = (v) =>
    v === vista
      ? 'bg-primary text-white px-3 py-1 text-sm rounded border-none cursor-pointer'
      : 'btn-secondary px-3 py-1 text-sm';

  // ── Navegación unificada: ‹ › y Hoy ──────────────────────────────────────
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

  // ── Helpers de eventos ───────────────────────────────────────────────────
  const getEventosDia = (fecha) => {
    if (!fecha) return [];
    return horarios.filter(h => h.fecha === fecha);
  };

  /** Eventos cuya horaInicio empieza en la misma hora HH */
  const getEventosHora = (fecha, horaSlot) => {
    return getEventosDia(fecha).filter(ev => ev.horaInicio && ev.horaInicio.startsWith(horaSlot.slice(0, 2)));
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

  const renderMes = () => {
    const celdas = getCeldas();
    return (
      <div className="grid grid-cols-7 gap-1">
        {DIAS_CORTO.map(d => (
          <div key={d} className="cal-dia-header">{d}</div>
        ))}
        {celdas.map((celda, i) => {
          const eventos = getEventosDia(celda.fecha);
          const activo  = esHoy(celda.dia, celda.esDelMes);
          return (
            <div
              key={i}
              className={`cal-celda relative ${activo ? 'cal-celda-activa' : ''} ${!celda.esDelMes ? 'opacity-30' : ''}`}
            >
              <span className="text-xs">{celda.dia}</span>
              {eventos.map((ev, ei) => (
                <button
                  key={`mes-${i}-ev-${ev.id}-${ei}`}
                  onClick={() => onClickEvento && onClickEvento(ev)}
                  className={`cal-evento w-full text-left mt-1 cursor-pointer border-none shadow-sm ${ev.isPropio ? 'text-slate-600 font-medium' : 'text-white'}`}
                  style={ev.isPropio 
                    ? { backgroundImage: 'repeating-linear-gradient(45deg, #f1f5f9, #f1f5f9 8px, #e2e8f0 8px, #e2e8f0 16px)' } 
                    : { backgroundColor: getColorProfesor(ev.profesor) }
                  }
                  title={ev.isPropio ? `${ev.horaInicio} - ${ev.horaFin}` : undefined}
                >
                  {ev.isPropio ? (
                    <div className="truncate text-[10px]">
                      <i className="bi bi-lock-fill text-orange-400 mr-1" />
                      {ev.profesor}
                    </div>
                  ) : (
                    <div className="truncate text-[10px]">
                      {ev.profesor}
                    </div>
                  )}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  // ── Vista SEMANA ─────────────────────────────────────────────────────────
  const renderSemana = () => {
    const dias = Array.from({ length: 7 }, (_, i) => addDias(semanaBase, i));
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

          {/* Celdas de eventos por día */}
          {dias.map((d, i) => {
            const iso    = toISO(d);
            const eventos = getEventosDia(iso);
            const esHoyD  = iso === hoyISO;
            return (
              <div
                key={i}
                className={`min-h-[120px] rounded p-1 flex flex-col gap-1
                  ${esHoyD ? 'bg-pink-50 ring-1 ring-primary ring-inset' : 'bg-gray-50'}`}
              >
                {eventos.length === 0 ? (
                  <span className="text-[10px] text-gray-300 mt-1 text-center">—</span>
                ) : (
                  eventos.map((ev, ei) => (
                    <button
                      key={`sem-${i}-ev-${ev.id}-${ei}`}
                      onClick={() => onClickEvento && onClickEvento(ev)}
                      className={`cal-evento w-full text-left text-[11px] cursor-pointer border-none shadow-sm ${ev.isPropio ? 'text-slate-600 font-medium' : 'text-white'}`}
                      style={ev.isPropio 
                        ? { backgroundImage: 'repeating-linear-gradient(45deg, #f1f5f9, #f1f5f9 8px, #e2e8f0 8px, #e2e8f0 16px)' } 
                        : { backgroundColor: getColorProfesor(ev.profesor) }
                      }
                      title={ev.isPropio ? `${ev.horaInicio} - ${ev.horaFin}` : undefined}
                    >
                      {ev.isPropio ? (
                        <span className="font-semibold block truncate">
                          <i className="bi bi-lock-fill text-orange-400 mr-1" />
                          {ev.profesor}
                        </span>
                      ) : (
                        <>
                          <span className="font-semibold block truncate">{ev.clase || ev.materia}</span>
                          {ev.horaInicio && (
                            <span className="text-[10px] opacity-80">{ev.horaInicio} – {ev.horaFin}</span>
                          )}
                        </>
                      )}
                    </button>
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
                <tr key={hora} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  {/* Franja horaria */}
                  <td className="w-14 pr-2 py-2 text-right text-[11px] text-gray-400 font-mono align-top select-none">
                    {hora}
                  </td>
                  {/* Eventos en esa hora */}
                  <td className="py-1 pl-2 align-top">
                    {evs.map((ev, ei) => (
                      <button
                        key={`dia-${hora}-ev-${ev.id}-${ei}`}
                        onClick={() => onClickEvento && onClickEvento(ev)}
                        className={`cal-evento w-full text-left mb-1 cursor-pointer border-none shadow-sm ${ev.isPropio ? 'text-slate-600 font-medium' : 'text-white'}`}
                        style={ev.isPropio 
                          ? { backgroundImage: 'repeating-linear-gradient(45deg, #f1f5f9, #f1f5f9 8px, #e2e8f0 8px, #e2e8f0 16px)' } 
                          : { backgroundColor: getColorProfesor(ev.profesor) }
                        }
                        title={ev.isPropio ? `${ev.horaInicio} - ${ev.horaFin}` : undefined}
                      >
                        {ev.isPropio ? (
                          <span className="font-semibold block truncate">
                            <i className="bi bi-lock-fill text-orange-400 mr-1" />
                            {ev.profesor}
                          </span>
                        ) : (
                          <>
                            <span className="font-semibold block">{ev.clase || ev.materia}</span>
                            <span className="text-[10px] opacity-80">
                              {ev.horaInicio} – {ev.horaFin}
                              {ev.aula ? ` · Aula ${ev.aula}` : ''}
                            </span>
                          </>
                        )}
                      </button>
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
        {/* Controles de navegación */}
        <div className="flex items-center gap-1">
          <button onClick={irAnterior} className="btn-secondary px-2 py-1 text-sm" aria-label="Anterior">
            <i className="bi bi-chevron-left" />
          </button>
          <button onClick={irSiguiente} className="btn-secondary px-2 py-1 text-sm" aria-label="Siguiente">
            <i className="bi bi-chevron-right" />
          </button>
          <button onClick={irHoy} className="btn-secondary px-3 py-1 text-sm ml-1">Hoy</button>
        </div>

        {/* Título del período */}
        <span className="font-bold text-cesde-dark text-sm">{titulo()}</span>

        {/* Selector de vista */}
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

export default CalendarioAdmin;
