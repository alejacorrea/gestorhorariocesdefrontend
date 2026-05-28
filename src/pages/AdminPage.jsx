/**
 * AdminPage - Panel principal del Administrador
 * 
 * Layout de 3 columnas:
 * - Izquierda: Formulario para agregar horarios
 * - Centro: Calendario mensual con eventos
 * - Derecha: Lista de profesores con CRUD completo
 * 
 * CRUD:
 * - Profesores: Crear, Ver info, Modificar, Eliminar (con SweetAlert)
 * - Horarios: Crear, Ver detalle al hacer clic en el calendario
 */
import { useState, useEffect } from 'react';
import HeaderAdmin from '../components/layout/HeaderAdmin';
import CalendarioAdmin from '../components/calendario/CalendarioAdmin';
import ProfesorItem from '../components/ui/ProfesorItem';
import ModalProfesor from '../components/ui/ModalProfesor';
import ModalModificar from '../components/ui/ModalModificar';
import ModalHorario from '../components/ui/ModalHorario';
import ModalInfoProfesor from '../components/ui/ModalInfoProfesor';
import ModalMateria from '../components/ui/ModalMateria';
import ModalAula from '../components/ui/ModalAula';
import ModalSede from '../components/ui/ModalSede';
import {
  alertExito,
  alertError,
  alertConfirmar,
  alertAdvertencia,
} from '../helpers/alerts';
import {
  getProfesores,
  createProfesor,
  updateProfesor,
  deleteProfesor,
  getHorarios,
  createHorario,
  updateHorario,
  deleteHorario,
  getMaterias,
  getAulas,
  getSedes,
} from '../services/api';

// Estado inicial del formulario de horario
const FORM_HORARIO_INICIAL = {
  profesor: '',
  clase: '',
  fecha: '',
  horaInicio: '',
  horaFin: '',
  sede: '',
  aula: '',
  periodInicio: '',
  periodoFin: '',
  diasRecurrencia: [],
};

const AdminPage = () => {
  // --- Estado ---
  const [profesores, setProfesores] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [aulas, setAulas] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [cargandoForm, setCargandoForm] = useState(false);
  const [filtroProfesor, setFiltroProfesor] = useState('');

  // Modales
  const [modalCrearProfesor, setModalCrearProfesor] = useState(false);
  const [modalModificar, setModalModificar] = useState(false);
  const [modalInfoProfesor, setModalInfoProfesor] = useState(false);
  const [modalHorario, setModalHorario] = useState(false);
  const [modalMateria, setModalMateria] = useState(false);
  const [modalAula, setModalAula] = useState(false);
  const [modalSede, setModalSede] = useState(false);

  // Datos seleccionados
  const [profesorSeleccionado, setProfesorSeleccionado] = useState(null);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);

  // Formulario de horario
  const [formHorario, setFormHorario] = useState(FORM_HORARIO_INICIAL);
  const [erroresHorario, setErroresHorario] = useState({});
  const [modoEdicionHorario, setModoEdicionHorario] = useState(false);
  const [idHorarioEdicion, setIdHorarioEdicion] = useState(null);

  // Días seleccionados para recurrencia
  const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab', 'Dom'];

  // --- Efectos ---
  // Carga inicial de datos
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);

    // Carga cada recurso de forma independiente — un error no bloquea los demás
    try {
      const lista = await getProfesores();
      setProfesores(lista);
    } catch (e) {
      console.error('Error cargando profesores:', e.message);
    }

    try {
      const lista = await getHorarios();
      setHorarios(lista);
    } catch (e) {
      console.error('Error cargando horarios:', e);
    }

    try {
      const lista = await getMaterias();
      setMaterias(lista);
    } catch (e) {
      console.error('Error cargando materias:', e);
    }

    try {
      const lista = await getAulas();
      setAulas(lista);
    } catch (e) {
      console.error('Error cargando aulas:', e);
    }

    try {
      const lista = await getSedes();
      setSedes(lista);
    } catch (e) {
      console.error('Error cargando sedes:', e);
    }

    setCargando(false);
  };

  // --- Handlers del formulario de horario ---
  const handleChangeHorario = (e) => {
    const { name, value } = e.target;
    // Si cambia la sede, resetear el aula seleccionada
    if (name === 'sede') {
      setFormHorario(prev => ({ ...prev, sede: value, aula: '' }));
    } else {
      setFormHorario(prev => ({ ...prev, [name]: value }));
    }
    if (erroresHorario[name]) setErroresHorario(prev => ({ ...prev, [name]: '' }));
    if (name === 'sede' && erroresHorario.aula) setErroresHorario(prev => ({ ...prev, aula: '' }));
  };

  // Aulas filtradas por la sede seleccionada
  // Si el backend no devuelve id_sede en las aulas, mostramos todas como fallback
  const aulasConSede = aulas.filter(a => a.id_sede != null);
  const aulasFiltradas = formHorario.sede
    ? (aulasConSede.length > 0
        ? aulas.filter(a => String(a.id_sede) === String(formHorario.sede))
        : aulas)  // Fallback: mostrar todas si el backend no incluye id_sede
    : [];

  const toggleDia = (dia) => {
    setFormHorario(prev => ({
      ...prev,
      diasRecurrencia: prev.diasRecurrencia.includes(dia)
        ? prev.diasRecurrencia.filter(d => d !== dia)
        : [...prev.diasRecurrencia, dia],
    }));
  };

  /**
   * Valida el formulario de agregar horario
   */
  const obtenerErroresHorario = () => {
    const errores = {};
    if (!formHorario.profesor)    errores.profesor  = 'Selecciona un profesor';
    if (!formHorario.clase?.trim()) errores.clase    = 'La clase es obligatoria';
    if (!formHorario.fecha)       errores.fecha     = 'La fecha es obligatoria';
    if (!formHorario.horaInicio?.trim())  errores.horaInicio = 'Requerido';
    if (!formHorario.horaFin?.trim())     errores.horaFin   = 'Requerido';
    if (!formHorario.sede)        errores.sede      = 'Selecciona una sede';
    if (!formHorario.aula)        errores.aula      = 'Selecciona un aula';

    if (formHorario.fecha) {
      // Validar que la fecha no esté en el pasado
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0); // Ignorar la hora actual para la comparación justa
      // parseamos la fecha ingresada tratando la zona horaria local
      const partesFecha = formHorario.fecha.split('-');
      if (partesFecha.length === 3) {
        const fechaIngresada = new Date(partesFecha[0], partesFecha[1] - 1, partesFecha[2]);
        if (fechaIngresada < hoy) {
          errores.fecha = 'No se pueden programar clases en el pasado';
        }
      }
    }

    if (formHorario.horaInicio && formHorario.horaFin && formHorario.horaFin <= formHorario.horaInicio) {
      errores.horaFin = 'Debe ser mayor al inicio';
    }

    const inicioComparar = formHorario.periodInicio || formHorario.fecha;
    if (formHorario.periodoFin && inicioComparar && formHorario.periodoFin < inicioComparar) {
      errores.periodoFin = 'Incoherencia cronológica';
    }

    return errores;
  };

  /**
   * Valida el formulario de agregar horario
   */
  const validarHorario = () => {
    const errores = obtenerErroresHorario();
    setErroresHorario(errores);
    return Object.keys(errores).length === 0;
  };

  const handleBlurHorario = (e) => {
    const { name } = e.target;
    const todos = obtenerErroresHorario();
    if (todos[name]) {
      setErroresHorario(prev => ({ ...prev, [name]: todos[name] }));
    }
  };

  /**
   * Agrega un nuevo horario
   */
  const handleAgregarHorario = async (e) => {
    e.preventDefault();
    if (!validarHorario()) {
      await alertAdvertencia('Campos incompletos', 'Por favor completa todos los campos requeridos.');
      return;
    }

    // --- VALIDACIÓN DE CRUCES DE HORARIOS ---
    const fechasGeneradas = [];
    if (!formHorario.diasRecurrencia.length) {
      fechasGeneradas.push(formHorario.fecha);
    } else {
      const pInicio = new Date((formHorario.periodInicio || formHorario.fecha) + 'T00:00:00');
      const pFin = new Date((formHorario.periodoFin || formHorario.fecha) + 'T23:59:59');
      let actual = new Date(pInicio);
      const mapDias = { 1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sab', 0: 'Dom' };
      while (actual <= pFin) {
        if (formHorario.diasRecurrencia.includes(mapDias[actual.getDay()])) {
          fechasGeneradas.push(actual.toISOString().split('T')[0]);
        }
        actual.setDate(actual.getDate() + 1);
      }
    }

    const profeObj = profesores.find(p => String(p.id) === String(formHorario.profesor));
    const nombreProfeForm = profeObj ? profeObj.nombre : '';
    const aulaObj = aulas.find(a => String(a.idaula ?? a.idAula) === String(formHorario.aula));
    const nombreAulaForm = aulaObj ? (aulaObj.numerodeaula ?? aulaObj.numeroDeAula) : '';
    
    const startA = formHorario.horaInicio.length === 5 ? formHorario.horaInicio + ':00' : formHorario.horaInicio;
    const endA = formHorario.horaFin.length === 5 ? formHorario.horaFin + ':00' : formHorario.horaFin;

    for (const h of horarios) {
      if (fechasGeneradas.includes(h.fecha)) {
        const startB = h.horaInicio;
        const endB = h.horaFin;
        
        // Comprobar solapamiento de tiempo (A.start < B.end && A.end > B.start)
        if (startA < endB && endA > startB) {
          // Ignoramos el cruce con sí mismo si estamos editando
          if (modoEdicionHorario && h.id_original === idHorarioEdicion) continue;

          if (h.profesor === nombreProfeForm) {
            await alertAdvertencia('Cruce de Horarios', `El profesor ${nombreProfeForm} ya tiene una clase asignada el ${h.fecha} en el horario de ${startB} a ${endB}.`);
            return;
          }
          if (h.aula === nombreAulaForm) {
            await alertAdvertencia('Aula Ocupada', `El aula ${nombreAulaForm} ya está siendo utilizada el ${h.fecha} de ${startB} a ${endB} por el profesor ${h.profesor}.`);
            return;
          }
        }
      }
    }
    // ----------------------------------------

    setCargandoForm(true);
    try {
      // Construir payload con objetos anidados para Spring Boot
      const payload = {
        persona: { identificacionPersona: formHorario.profesor },
        nombreProfesor: nombreProfeForm,
        materia: { idmateria: parseInt(formHorario.clase, 10) },
        fechainicio:   formHorario.fecha,
        horainicio:    formHorario.horaInicio.length === 5 ? formHorario.horaInicio + ':00' : formHorario.horaInicio,
        horafin:       formHorario.horaFin.length === 5 ? formHorario.horaFin + ':00' : formHorario.horaFin,
        sede: { idsede: parseInt(formHorario.sede, 10) },
        aula: { idaula: parseInt(formHorario.aula, 10) },
        inicioperiodo: formHorario.periodInicio || formHorario.fecha,
        fechafin:      formHorario.periodoFin   || formHorario.fecha,
        finperiodo:    formHorario.periodoFin   || formHorario.fecha,
        recurrenciadiaadmin: formHorario.diasRecurrencia.length > 0
          ? formHorario.diasRecurrencia.join(',')
          : 'Unico',
        activo: true
      };

      if (modoEdicionHorario) {
        payload.idhorario = idHorarioEdicion; // ¡Crucial! El backend reemplaza el ID con lo que llegue en el body
        await updateHorario(idHorarioEdicion, payload);
        
        // Recargar desde la BD para asegurar que JPA resuelva los JOINs y traiga nombres, no solo IDs
        const listaActualizada = await getHorarios();
        setHorarios(listaActualizada);
        
        setModoEdicionHorario(false);
        setIdHorarioEdicion(null);
        await alertExito('¡Cambios guardados!', 'El horario fue modificado exitosamente.');
      } else {
        await createHorario(payload);
        
        // Recargar desde la BD para tener el objeto completo
        const listaActualizada = await getHorarios();
        setHorarios(listaActualizada);
        
        await alertExito('¡Horario agregado!', 'El horario fue registrado exitosamente.');
      }
      
      setFormHorario(FORM_HORARIO_INICIAL);
    } catch (error) {
      await alertError('Error', 'No se pudo guardar el horario. Intenta de nuevo.');
    } finally {
      setCargandoForm(false);
    }
  };

  const cancelarEdicionHorario = () => {
    setModoEdicionHorario(false);
    setIdHorarioEdicion(null);
    setFormHorario(FORM_HORARIO_INICIAL);
    setErroresHorario({});
  };

  const handleModificarHorarioModalClick = (horario) => {
    setModalHorario(false); // Cierra el modal
    setHorarioSeleccionado(null);
    setModoEdicionHorario(true);
    setIdHorarioEdicion(horario.id_original);

    // Buscar si el profesor existe para sacar su ID real, ya que el horario tiene el nombre
    const profEncontrado = profesores.find(p => p.nombre === horario.profesor);
    const profId = profEncontrado ? profEncontrado.id : '';

    // Llenar el formulario con los datos
    setFormHorario({
      profesor: String(profId),
      // Como no tenemos el idMateria, tratamos de buscarlo por nombre
      clase: String(materias.find(m => m.nombremateria === horario.clase)?.idmateria || ''),
      fecha: horario.fechaInicio || '',
      horaInicio: horario.horaInicio || '',
      horaFin: horario.horaFin || '',
      sede: String(sedes.find(s => s.nombresede === horario.sede)?.idsede || ''),
      // Nota: El aula puede no encontrarse inmediatamente hasta que sede se asiente, pero lo intentamos
      aula: String(aulas.find(a => (a.numerodeaula ?? a.numeroDeAula) === horario.aula)?.idaula || ''),
      periodInicio: horario.inicioPeriodo || '',
      periodoFin: horario.finPeriodo || '',
      diasRecurrencia: horario.recurrencia !== 'Unico' && horario.recurrencia ? horario.recurrencia.split(',') : [],
    });

    // Scrollear arriba para ver el formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminarHorario = async (horario) => {
    const confirmado = await alertConfirmar(
      '¿Eliminar horario?',
      `¿Deseas eliminar la clase de ${horario.clase} asignada a ${horario.profesor}?`,
      'Sí, eliminar'
    );

    if (!confirmado) return;

    setModalHorario(false);
    setCargando(true);
    try {
      await deleteHorario(horario.id_original);
      // Quitar de la vista todos los eventos derivados de ese horario recurrente
      setHorarios(prev => prev.filter(h => h.id_original !== horario.id_original));
      await alertExito('Horario eliminado', 'La clase ha sido eliminada correctamente.');
    } catch (error) {
      await alertError('Error', 'No se pudo eliminar el horario. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  // --- CRUD Profesores ---

  /**
   * Crea un nuevo profesor
   */
  // Función auxiliar para ordenar profesores por apellido
  const ordenarProfesores = (lista) => {
    return [...lista].sort((a, b) => {
      const apellidoA = (a.nombre || '').split(' ').slice(1).join(' ').toLowerCase();
      const apellidoB = (b.nombre || '').split(' ').slice(1).join(' ').toLowerCase();
      const compA = apellidoA || (a.nombre || '').toLowerCase();
      const compB = apellidoB || (b.nombre || '').toLowerCase();
      return compA.localeCompare(compB);
    });
  };

  const handleCrearProfesor = async (datos) => {
    // Evitar sobreescritura si la cédula ya existe
    const existe = profesores.some(p => String(p.id) === String(datos.identificacionPersona));
    if (existe) {
      await alertError('Cédula duplicada', 'Ya existe un profesor con este número de cédula.');
      return;
    }

    setCargando(true);
    try {
      const creado = await createProfesor(datos);
      // Normalizar campos del backend (camelCase) al formato que usa ProfesorItem
      const nuevo = {
        id:                    creado.identificacionPersona ?? datos.identificacion_persona,
        nombre:                creado.nombrePersona         ?? datos.nombre_persona,
        correo:                creado.correoPersona         ?? datos.correo_persona,
        cedula:                creado.identificacionPersona ?? datos.identificacion_persona,
        identificacionPersona: creado.identificacionPersona ?? datos.identificacion_persona,
        nombrePersona:         creado.nombrePersona         ?? datos.nombre_persona,
        correoPersona:         creado.correoPersona         ?? datos.correo_persona,
        activo:                creado.activo,
      };
      setProfesores(prev => ordenarProfesores([...prev, nuevo]));
      setModalCrearProfesor(false);
      await alertExito('¡Profesor creado!', `${nuevo.nombre} fue agregado exitosamente.`);
    } catch (error) {
      await alertError('Error', 'No se pudo crear el profesor. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  /**
   * Actualiza los datos de un profesor
   */
  const handleModificarProfesor = async (datos) => {
    setCargando(true);
    try {
      const actualizado = await updateProfesor(datos.id, datos);
      const modificado = {
        ...actualizado,
        id: actualizado.identificacionPersona ?? datos.id,
        nombre: actualizado.nombrePersona ?? datos.nombrePersona,
        correo: actualizado.correoPersona ?? datos.correoPersona,
        cedula: actualizado.identificacionPersona ?? datos.id,
      };
      setProfesores(prev => ordenarProfesores(prev.map(p => p.id === datos.id ? { ...p, ...modificado } : p)));
      
      // Recargar horarios por si el profesor cambió de nombre (para actualizar el calendario)
      const listaHorariosAct = await getHorarios();
      setHorarios(listaHorariosAct);

      setModalModificar(false);
      setProfesorSeleccionado(null);
      await alertExito('¡Cambios guardados!', `Los datos de ${datos.nombrePersona || datos.nombre || 'el profesor'} fueron actualizados.`);
    } catch (error) {
      await alertError('Error', 'No se pudo actualizar el profesor. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  /**
   * Elimina un profesor con confirmación previa
   */
  const handleEliminarProfesor = async (profesor) => {
    const confirmado = await alertConfirmar(
      `¿Eliminar a ${profesor.nombre}?`,
      'Esta acción eliminará al profesor y todos sus horarios. No se puede deshacer.',
      'Sí, eliminar'
    );

    if (!confirmado) return;

    setCargando(true);
    try {
      await deleteProfesor(profesor.id);
      setProfesores(prev => prev.filter(p => p.id !== profesor.id));
      await alertExito('Profesor eliminado', `${profesor.nombre} fue eliminado correctamente.`);
    } catch (error) {
      // Como MPersona tiene llaves foráneas con horarios, fallará si tiene clases asignadas
      await alertError('No se puede eliminar', 'El profesor tiene horarios asignados. Debes eliminar primero todos sus horarios del calendario antes de poder borrarlo del sistema.');
    } finally {
      setCargando(false);
    }
  };

  // --- Abre modales ---
  const abrirVerInfo = (profesor) => {
    setProfesorSeleccionado(profesor);
    setModalInfoProfesor(true);
  };

  const abrirModificar = (profesor) => {
    setProfesorSeleccionado(profesor);
    setModalModificar(true);
  };

  const abrirDetalleHorario = (horario) => {
    setHorarioSeleccionado(horario);
    setModalHorario(true);
  };

  // --- Handlers para modales de Materia y Aula ---
  /**
   * Al crear una materia, auto-selecciona su nombre en el campo "clase"
   */
  const handleMateriaCreada = (materia) => {
    // Agregar a la lista y auto-seleccionar por ID
    setMaterias(prev => [...prev, materia]);
    setFormHorario(prev => ({ ...prev, clase: String(materia.idmateria ?? materia.idMateria ?? '') }));
  };

  /**
   * Al crear un aula, auto-selecciona su identificador en el campo "aula"
   */
  const handleAulaCreada = (aula) => {
    // Normalizar el id_sede del backend (puede venir como id_sede, idSede, o idsede)
    const aulaNormalizada = {
      idaula:        aula.idaula        ?? aula.idAula        ?? aula.id,
      numerodeaula:  aula.numerodeaula  ?? aula.numeroDeAula  ?? aula.numero,
      capacidadaula: aula.capacidadaula ?? aula.capacidadAula,
      id_sede:       aula.id_sede       ?? aula.idSede        ?? aula.idsede ?? null,
      activo:        aula.activo,
    };
    setAulas(prev => [...prev, aulaNormalizada]);
    // Auto-seleccionar la sede y el aula recién creada
    setFormHorario(prev => ({
      ...prev,
      sede: String(aulaNormalizada.id_sede ?? prev.sede),
      aula: String(aulaNormalizada.idaula ?? ''),
    }));
  };
  /**
   * Al crear una sede, auto-selecciona su identificador en el campo "sede"
   */
  const handleSedeCreada = (sede) => {
    setSedes(prev => [...prev, sede]);
    setFormHorario(prev => ({
      ...prev,
      sede: String(sede.idsede ?? ''),
      aula: '' // resetear aula
    }));
  };


  return (
    <div className="min-h-screen flex flex-col bg-cesde-gray">
      <HeaderAdmin />

      <main className="flex-1 p-5 flex gap-5 flex-wrap lg:flex-nowrap">

        {/* ==================== COLUMNA IZQUIERDA: Formulario ==================== */}
        <section className="w-full lg:w-[24%] bg-white rounded-lg overflow-hidden shadow-sm flex-shrink-0 flex flex-col max-h-[calc(100vh-100px)]">
          {/* Header del formulario */}
          <div className="bg-cesde-dark text-white px-4 py-2.5 flex items-center justify-between rounded-t-lg flex-shrink-0">
            <span className="font-bold text-sm">
              {modoEdicionHorario ? 'Modificar Horario' : 'Asignar Horario'}
            </span>
          </div>

          <div className="p-3 flex-1 overflow-y-auto overflow-x-hidden">
            <form onSubmit={handleAgregarHorario} className="space-y-3 text-sm">
            {/* Profesor */}
            <div>
              <label className="block font-semibold text-cesde-dark mb-1">
                Profesor <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <i className="bi bi-person absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <select
                  name="profesor"
                  value={formHorario.profesor}
                  onChange={handleChangeHorario}
                  onBlur={handleBlurHorario}
                  className="input-cesde pl-9 w-full"
                  disabled={cargandoForm}
                >
                  <option value="" disabled>Seleccione un profesor</option>
                  {profesores.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>
              {erroresHorario.profesor && <p className="text-red-500 text-xs mt-1">{erroresHorario.profesor}</p>}
            </div>

            {/* Clase */}
            <div>
              <label className="block font-semibold text-cesde-dark mb-1">
                Clase <span className="text-primary">*</span>
              </label>
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <i className="bi bi-journal-text absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                  <select
                    name="clase"
                    value={formHorario.clase}
                    onChange={handleChangeHorario}
                    onBlur={handleBlurHorario}
                    className="input-cesde pl-9 w-full"
                    disabled={cargandoForm}
                  >
                    <option value="" disabled>Seleccione una clase</option>
                    {materias.map(m => (
                      <option key={m.idmateria} value={String(m.idmateria)}>
                        {m.nombremateria}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setModalMateria(true)}
                  className="text-primary text-xl cursor-pointer flex-shrink-0 bg-transparent border-none p-0 hover:text-pink-600 transition-colors"
                  title="Gestionar materias"
                  aria-label="Gestionar materias"
                >
                  <i className="bi bi-gear-fill" />
                </button>
              </div>
              {erroresHorario.clase && <p className="text-red-500 text-xs mt-1">{erroresHorario.clase}</p>}
            </div>

            {/* Fecha */}
            <div>
              <label className="block font-semibold text-cesde-dark mb-1">
                Fecha de la clase <span className="text-primary">*</span>
              </label>
              <input type="date" name="fecha" value={formHorario.fecha} onChange={handleChangeHorario} onBlur={handleBlurHorario} className="input-cesde w-full" disabled={cargandoForm} />
              {erroresHorario.fecha && <p className="text-red-500 text-xs mt-1">{erroresHorario.fecha}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Hora inicio */}
              <div>
                <label className="block font-semibold text-cesde-dark mb-1">
                  Hora Inicio <span className="text-primary">*</span>
                </label>
                <input type="time" name="horaInicio" value={formHorario.horaInicio} onChange={handleChangeHorario} onBlur={handleBlurHorario} className="input-cesde w-full" disabled={cargandoForm} />
                {erroresHorario.horaInicio && <p className="text-red-500 text-[10px] mt-1 leading-tight">{erroresHorario.horaInicio}</p>}
              </div>

              {/* Hora fin */}
              <div>
                <label className="block font-semibold text-cesde-dark mb-1">
                  Hora Fin <span className="text-primary">*</span>
                </label>
                <input type="time" name="horaFin" value={formHorario.horaFin} onChange={handleChangeHorario} onBlur={handleBlurHorario} className="input-cesde w-full" disabled={cargandoForm} />
                {erroresHorario.horaFin && <p className="text-red-500 text-[10px] mt-1 leading-tight">{erroresHorario.horaFin}</p>}
              </div>
            </div>

            {/* Sede */}
            <div>
              <label className="block font-semibold text-cesde-dark mb-1">
                Sede <span className="text-primary">*</span>
              </label>
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <i className="bi bi-building absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                  <select name="sede" value={formHorario.sede} onChange={handleChangeHorario} onBlur={handleBlurHorario} className="input-cesde pl-9 w-full" disabled={cargandoForm}>
                    <option value="" disabled>Seleccione una sede</option>
                    {sedes.map(s => (
                      <option key={s.idsede} value={String(s.idsede)}>{s.nombresede}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setModalSede(true)}
                  className="text-primary text-xl cursor-pointer flex-shrink-0 bg-transparent border-none p-0 hover:text-pink-600 transition-colors"
                  title="Gestionar sedes"
                  aria-label="Gestionar sedes"
                >
                  <i className="bi bi-gear-fill" />
                </button>
              </div>
              {erroresHorario.sede && <p className="text-red-500 text-xs mt-1">{erroresHorario.sede}</p>}
            </div>

            {/* Aula */}
            <div>
              <label className="block font-semibold text-cesde-dark mb-1">
                Aula <span className="text-primary">*</span>
              </label>
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <i className="bi bi-door-open absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                  <select name="aula" value={formHorario.aula} onChange={handleChangeHorario} onBlur={handleBlurHorario} className="input-cesde pl-9 w-full" disabled={cargandoForm || !formHorario.sede}>
                    <option value="" disabled>
                      {!formHorario.sede ? 'Primero seleccione una sede' : aulasFiltradas.length === 0 ? 'No hay aulas en esta sede' : 'Seleccione un aula'}
                    </option>
                    {aulasFiltradas.map(a => (
                      <option
                        key={a.idaula ?? a.idAula}
                        value={String(a.idaula ?? a.idAula)}
                      >
                        {a.numerodeaula ?? a.numeroDeAula}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setModalAula(true)}
                  className="text-primary text-xl cursor-pointer flex-shrink-0 bg-transparent border-none p-0 hover:text-pink-600 transition-colors"
                  title="Gestionar aulas"
                  aria-label="Gestionar aulas"
                >
                  <i className="bi bi-gear-fill" />
                </button>
              </div>
              {erroresHorario.aula && <p className="text-red-500 text-xs mt-1">{erroresHorario.aula}</p>}
            </div>

            {/* Periodo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-cesde-dark mb-1 truncate" title="Inicio del Periodo">
                  Inicio Per. <span className="text-gray-400 font-normal">(Opc)</span>
                </label>
                <input type="date" name="periodInicio" value={formHorario.periodInicio} onChange={handleChangeHorario} onBlur={handleBlurHorario} className="input-cesde w-full" disabled={cargandoForm} />
              </div>
              <div>
                <label className="block font-semibold text-cesde-dark mb-1 truncate" title="Fin del Periodo">
                  Fin Per. <span className="text-gray-400 font-normal">(Opc)</span>
                </label>
                <input type="date" name="periodoFin" value={formHorario.periodoFin} onChange={handleChangeHorario} onBlur={handleBlurHorario} className="input-cesde w-full" disabled={cargandoForm} />
                {erroresHorario.periodoFin && <p className="text-red-500 text-[10px] mt-1 leading-tight">{erroresHorario.periodoFin}</p>}
              </div>
            </div>

            {/* Recurrencia - días */}
            <div className="border border-gray-200 rounded-lg p-3 bg-white">
              <div className="flex items-center gap-2 mb-3 text-cesde-dark font-semibold">
                <i className="bi bi-arrow-repeat text-primary text-lg" />
                <span>Días de recurrencia <span className="text-gray-400 font-normal">(Opcional)</span></span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 mb-2">
                {DIAS.map(dia => (
                  <button
                    key={dia}
                    type="button"
                    onClick={() => toggleDia(dia)}
                    className={`px-1 py-1.5 text-xs rounded-md border-none cursor-pointer transition-all font-semibold
                      ${formHorario.diasRecurrencia.includes(dia)
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-gray-100 text-cesde-dark hover:bg-gray-200'}`}
                  >
                    {dia}
                  </button>
                ))}
              </div>
              <p className="text-[10px] leading-tight text-gray-400">Si no seleccionas ninguno, será un evento único (Solo sucederá en la fecha principal).</p>
            </div>

            {/* Botón agregar */}
            <div className="flex flex-col gap-2 pt-3">
              <button
                type="submit"
                className="btn-primary w-full py-3 font-bold shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2 uppercase tracking-wide"
                disabled={cargandoForm}
              >
                {cargandoForm ? (
                  <><i className="bi bi-hourglass-split" /> GUARDANDO...</>
                ) : modoEdicionHorario ? (
                  <><i className="bi bi-pencil-square" /> GUARDAR CAMBIOS</>
                ) : (
                  <><i className="bi bi-plus-circle" /> AGREGAR HORARIO</>
                )}
              </button>
              {modoEdicionHorario && (
                <button
                  type="button"
                  onClick={cancelarEdicionHorario}
                  className="btn-secondary w-full"
                  disabled={cargandoForm}
                >
                  Cancelar Edición
                </button>
              )}
            </div>
            </form>
          </div>
        </section>

        {/* ==================== COLUMNA CENTRO: Calendario ==================== */}
        <section className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Filtro del calendario */}
          <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <i className="bi bi-funnel-fill text-primary text-xl" />
              <span className="font-bold text-sm text-cesde-dark">Filtrar calendario:</span>
            </div>
            <select
              value={filtroProfesor}
              onChange={(e) => setFiltroProfesor(e.target.value)}
              className="input-cesde !mt-0 !w-auto min-w-[200px]"
            >
              <option value="">Todos los profesores</option>
              {profesores.map(p => (
                <option key={p.id} value={p.nombre}>{p.nombre}</option>
              ))}
            </select>
          </div>

          {cargando ? (
            <div className="card flex items-center justify-center h-64">
              <div className="text-primary text-center">
                <i className="bi bi-hourglass-split text-4xl animate-pulse block mb-2" />
                <p className="text-sm">Cargando calendario...</p>
              </div>
            </div>
          ) : (
            <CalendarioAdmin
              horarios={
                filtroProfesor 
                  ? horarios.filter(h => h.profesor === filtroProfesor) 
                  : horarios.filter(h => !h.isPropio)
              }
              onClickEvento={abrirDetalleHorario}
            />
          )}
        </section>

        {/* ==================== COLUMNA DERECHA: Profesores ==================== */}
        <section className="w-full lg:w-[24%] bg-white rounded-lg overflow-hidden shadow-sm flex-shrink-0 flex flex-col max-h-[calc(100vh-100px)]">
          {/* Header de la lista */}
          <div className="bg-cesde-dark text-white px-4 py-2.5 flex items-center justify-between rounded-t-lg">
            <span className="font-bold text-sm">Profesores</span>
            <button
              onClick={() => setModalCrearProfesor(true)}
              className="text-white bg-transparent border-none cursor-pointer hover:text-pink-200 transition-colors"
              aria-label="Agregar profesor"
            >
              <i className="bi bi-plus text-xl" />
            </button>
          </div>

          {/* Lista de profesores con scroll */}
          <div className="bg-white p-2 flex-1 overflow-y-auto flex flex-col gap-2 rounded-b-lg">
            {cargando ? (
              <p className="text-sm text-gray-500 text-center py-4">Cargando...</p>
            ) : profesores.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No hay profesores registrados</p>
            ) : (
              profesores.map(profesor => (
                <ProfesorItem
                  key={profesor.id}
                  profesor={profesor}
                  onVerInfo={abrirVerInfo}
                  onModificar={abrirModificar}
                  onEliminar={handleEliminarProfesor}
                />
              ))
            )}
          </div>
        </section>
      </main>

      {/* ==================== MODALES ==================== */}
      <ModalProfesor
        abierto={modalCrearProfesor}
        onCerrar={() => setModalCrearProfesor(false)}
        onGuardar={handleCrearProfesor}
        cargando={cargando}
      />

      <ModalModificar
        abierto={modalModificar}
        profesor={profesorSeleccionado}
        onCerrar={() => { setModalModificar(false); setProfesorSeleccionado(null); }}
        onGuardar={handleModificarProfesor}
        cargando={cargando}
      />

      <ModalInfoProfesor
        abierto={modalInfoProfesor}
        profesor={profesorSeleccionado}
        onCerrar={() => { setModalInfoProfesor(false); setProfesorSeleccionado(null); }}
      />

      <ModalHorario
        abierto={modalHorario}
        horario={horarioSeleccionado}
        onCerrar={() => { setModalHorario(false); setHorarioSeleccionado(null); }}
        isAdmin={true}
        onModificar={handleModificarHorarioModalClick}
        onEliminar={handleEliminarHorario}
      />

      <ModalMateria
        abierto={modalMateria}
        onCerrar={() => { setModalMateria(false); cargarDatos(); }}
        onMateriaCreada={handleMateriaCreada}
      />

      <ModalAula
        abierto={modalAula}
        onCerrar={() => { setModalAula(false); cargarDatos(); }}
        onAulaCreada={handleAulaCreada}
      />

      <ModalSede
        abierto={modalSede}
        onCerrar={() => { setModalSede(false); cargarDatos(); }}
        onSedeCreada={handleSedeCreada}
      />
    </div>
  );
};

export default AdminPage;
