/**
 * @fileoverview Servicio de API para el Gestor de Horarios CESDE
 * 
 * Para conectar con el backend, simplemente cambia VITE_API_BASE_URL en el archivo .env
 * y descomenta / completa las peticiones fetch en cada función.
 */

// URL base del backend - se lee desde el archivo .env
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * Helper interno para hacer peticiones HTTP
 * @param {string} endpoint - Ruta del endpoint (ej: '/profesores')
 * @param {Object} options - Opciones de fetch (method, body, headers)
 * @returns {Promise<any>} - Respuesta JSON del servidor
 */
const fetchAPI = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      // Aquí puedes agregar el token de autenticación cuando lo tengas:
      // 'Authorization': `Bearer ${localStorage.getItem('token')}`,
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// ============================================================
//  PROFESORES
// ============================================================

/**
 * Obtiene todos los profesores
 * @returns {Promise<Array>} Lista de profesores
 */
export const getProfesores = async () => {
  // GET /persona — filtramos localmente en el frontend
  const todasLasPersonas = await fetchAPI('/persona');
  
  // Filtramos por idRol = 2 que es el rol de Profesor en tipoPersona, o nulos para poder arreglarlos
  const lista = todasLasPersonas.filter(p => !p.tipoPersona || !p.tipoPersona.idRol || p.tipoPersona.idRol === 2 || !p.id_rol || p.id_rol === 2);
  
  const mapeados = lista.map(p => ({
    id:                    p.identificacionPersona,
    nombre:                p.nombrePersona,
    correo:                p.correoPersona,
    cedula:                p.identificacionPersona,
    identificacionPersona: p.identificacionPersona,
    nombrePersona:         p.nombrePersona,
    correoPersona:         p.correoPersona,
    contrasenaPersona:     p.contrasenaPersona,
    tipoPersona:           p.tipoPersona,
    activo:                p.activo,
  }));

  // Ordenamos alfabéticamente por apellido (todo después del primer espacio)
  return mapeados.sort((a, b) => {
    const apellidoA = (a.nombre || '').split(' ').slice(1).join(' ').toLowerCase();
    const apellidoB = (b.nombre || '').split(' ').slice(1).join(' ').toLowerCase();
    
    // Fallback: si no tiene apellido, se ordena por el nombre completo
    const compA = apellidoA || (a.nombre || '').toLowerCase();
    const compB = apellidoB || (b.nombre || '').toLowerCase();

    return compA.localeCompare(compB);
  });
};

/**
 * Crea un nuevo profesor
 * @param {Object} data - Datos del profesor { nombre, cedula, correo, contrasena }
 * @returns {Promise<Object>} Profesor creado
 */
export const createProfesor = async (data) => {
  // POST /persona — crea un nuevo profesor con los campos de la BD
  return fetchAPI('/persona', { method: 'POST', body: JSON.stringify(data) });
};

/**
 * Actualiza un profesor existente
 * @param {number} id - ID del profesor
 * @param {Object} data - Nuevos datos { nombre, correo, asignatura }
 * @returns {Promise<Object>} Profesor actualizado
 */
export const updateProfesor = async (id, data) => {
  // Limpiamos variables de estado propias del Frontend para que Spring Boot (Jackson)
  // no lance UnrecognizedPropertyException al recibir propiedades que no existen en MPersona
  const { id: _, nombre, correo, cedula, ...payloadLimpio } = data;
  
  // PUT /persona/{id} — actualiza nombre_persona y correo_persona
  return fetchAPI(`/persona/${id}`, { method: 'PUT', body: JSON.stringify(payloadLimpio) });
};

/**
 * Elimina un profesor
 * @param {number} id - ID del profesor a eliminar
 * @returns {Promise<void>}
 */
export const deleteProfesor = async (id) => {
  // DELETE /persona/{id}
  return fetchAPI(`/persona/${id}`, { method: 'DELETE' });
};

/**
 * Actualiza la contraseña de un usuario (persona)
 * @param {string} id - Identificación de la persona
 * @param {string} nuevaContrasena - Nueva contraseña en texto plano
 * @returns {Promise<Object>} Persona actualizada
 */
export const updatePassword = async (id, nuevaContrasena) => {
  return fetchAPI(`/persona/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ contrasenaPersona: nuevaContrasena }),
  });
};


// ============================================================
//  HORARIOS
// ============================================================

/**
 * Helper para normalizar nombres de días (completos o cortos) al formato corto
 * Esto permite compatibilidad con registros viejos que usaban nombres completos
 */
const normalizarDia = (dia) => {
  if (!dia) return '';
  const d = dia.trim().toLowerCase();
  
  if (d.includes('lun')) return 'Lun';
  if (d.includes('mar')) return 'Mar';
  if (d.includes('mi')) return 'Mié';
  if (d.includes('jue')) return 'Jue';
  if (d.includes('vie')) return 'Vie';
  if (d.includes('sab') || d.includes('sáb')) return 'Sab';
  if (d.includes('dom')) return 'Dom';
  
  return dia;
};

/**
 * Helper interno para expandir horarios recurrentes en eventos individuales por día
 */
const expandirHorarios = (lista) => {
  const eventosExpandidos = [];
  const mapDias = { 1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sab', 0: 'Dom' };

  lista.forEach((h, index) => {
    // Normalizar objeto base combinando campos de MHorarioAdmin y MHorarioProfesor
    const baseEvent = {
      id_original:  h.idhorario ?? h.idHorario ?? h.idHorarioProfesor ?? h.id ?? `ev-${index}`,
      isPropio:     h.isPropio ?? false,
      clase:        h.materia?.nombremateria ?? h.materiaProfesor ?? h.materia ?? '',
      aula:         h.aula?.numerodeaula ?? h.aula ?? '',
      sede:         h.sede?.nombresede ?? h.instituto ?? h.sede ?? '',
      profesor:     h.persona?.nombrePersona ?? h.mPersona?.nombrePersona ?? h.nombreProfesor ?? h.profesor ?? '',
      horaInicio:   h.horainicio ?? h.horaInicioProfesor,
      horaFin:      h.horafin ?? h.horaFinProfesor,
      fechaInicio:  h.fechainicio ?? h.fechaInicioProfesor,
      fechaFin:     h.fechafin ?? h.fechaFinalizacionProfesor,
      inicioPeriodo: h.inicioperiodo ?? h.fechaInicioProfesor,
      finPeriodo:    h.finperiodo ?? h.fechaFinalizacionProfesor,
      recurrencia:  h.recurrenciadiaadmin ?? h.recurrenciaDiaProfesor ?? '',
    };

    const recurrencia = baseEvent.recurrencia;

    // Si no hay recurrencia o es 'Unico', solo agregamos la fecha de inicio
    if (!recurrencia || recurrencia === 'Unico' || !baseEvent.inicioPeriodo || !baseEvent.finPeriodo) {
      eventosExpandidos.push({
        ...baseEvent,
        id: `${baseEvent.id_original}-unico`,
        fecha: baseEvent.fechaInicio,
      });
      return;
    }

    // Si tiene recurrencia, iteramos desde inicioPeriodo hasta finPeriodo
    const pInicio = new Date(baseEvent.inicioPeriodo + 'T00:00:00');
    const pFin = new Date(baseEvent.finPeriodo + 'T23:59:59');
    const diasRecurrencia = recurrencia.split(',').map(normalizarDia);

    let fechaActual = new Date(pInicio);
    let contadorId = 1;

    while (fechaActual <= pFin) {
      const diaCorto = mapDias[fechaActual.getDay()];
      
      if (diasRecurrencia.includes(diaCorto)) {
        const y = fechaActual.getFullYear();
        const m = String(fechaActual.getMonth() + 1).padStart(2, '0');
        const d = String(fechaActual.getDate()).padStart(2, '0');
        
        eventosExpandidos.push({
          ...baseEvent,
          id: `${baseEvent.id_original}-${contadorId}`,
          fecha: `${y}-${m}-${d}`,
        });
        contadorId++;
      }
      fechaActual.setDate(fechaActual.getDate() + 1);
    }
  });

  return eventosExpandidos;
};

/**
 * Obtiene todos los horarios
 * @returns {Promise<Array>} Lista de horarios expandida
 */
export const getHorarios = async () => {
  // Solicitamos todos los horarios en paralelo para que el admin vea todo
  const [todosAdmin, todosProf] = await Promise.all([
    fetchAPI(`/horarioadmin`).catch(() => []),
    fetchAPI(`/horarioprofesor`).catch(() => [])
  ]);

  const adminConFlag = todosAdmin.map(h => ({ ...h, isPropio: false }));
  const profConFlag = todosProf.map(h => ({ ...h, isPropio: true }));

  const combinados = [...adminConFlag, ...profConFlag];
  return expandirHorarios(combinados);
};

/**
 * Obtiene los horarios asignados a un profesor (une Admin + Externos)
 * @param {string} identificacionPersona - identificacionPersona del profesor
 * @returns {Promise<Array>} Lista combinada y expandida
 */
export const getHorariosByProfesor = async (identificacion) => {
  // Solicitamos todos los horarios en paralelo
  const [todosAdmin, todosProf] = await Promise.all([
    fetchAPI(`/horarioadmin`).catch(err => {
      console.error("Error obteniendo horarioadmin:", err);
      return [];
    }),
    fetchAPI(`/horarioprofesor`).catch(err => {
      console.error("Error obteniendo horarioprofesor:", err);
      return [];
    })
  ]);

  // Filtramos localmente para encontrar solo los del profesor solicitado
  const adminHorarios = todosAdmin.filter(h => h.persona?.identificacionPersona === identificacion || h.mPersona?.identificacionPersona === identificacion || h.profesor === identificacion);
  const profHorarios = todosProf.filter(h => h.persona?.identificacionPersona === identificacion || h.mPersona?.identificacionPersona === identificacion || h.profesor === identificacion);

  const adminConFlag = adminHorarios.map(h => ({ ...h, isPropio: false }));
  const profConFlag = profHorarios.map(h => ({ ...h, isPropio: true }));

  // Unimos ambos arrays de resultados
  const combinados = [...adminConFlag, ...profConFlag];
  
  const expandidos = expandirHorarios(combinados);

  return expandidos;
};

/**
 * Crea un nuevo horario
 * @param {Object} data - Datos del horario
 * @returns {Promise<Array>} Lista de horarios creados expandidos
 */
export const createHorario = async (data) => {
  // POST /horarioadmin — horario creado desde el panel de administrador
  const creado = await fetchAPI('/horarioadmin', { method: 'POST', body: JSON.stringify(data) });
  return expandirHorarios([creado]);
};

/**
 * Crea un nuevo horario externo (Profesor)
 * @param {Object} data - Datos del horario externo
 * @returns {Promise<Object>}
 */
export const createHorarioProfesor = async (data) => {
  return fetchAPI('/horarioprofesor', { method: 'POST', body: JSON.stringify(data) });
};

/**
 * Actualiza un horario existente
 * @param {number} id - ID del horario original
 * @param {Object} data - Nuevos datos
 * @returns {Promise<Array>} Lista de horarios actualizados expandidos
 */
export const updateHorario = async (id, data) => {
  const actualizado = await fetchAPI(`/horarioadmin/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  return expandirHorarios([actualizado]);
};

/**
 * Elimina un horario
 * @param {number} id - ID del horario original
 * @returns {Promise<void>}
 */
export const deleteHorario = async (id) => {
  return fetchAPI(`/horarioadmin/${id}`, { method: 'DELETE' });
};

// ============================================================
//  AUTENTICACIÓN
// ============================================================

/**
 * Inicia sesión con email y contraseña
 * @param {string} correo
 * @param {string} contrasena
 * @returns {Promise<Object>} { token, rol: 'admin' | 'profesor' }
 */
export const login = async (correo, contrasena) => {
  // GET /persona — buscamos localmente por correo y contraseña en lugar de tener un endpoint /login
  const todasLasPersonas = await fetchAPI('/persona');
  
  const usuarioEncontrado = todasLasPersonas.find(
    p => p.correoPersona === correo && p.contrasenaPersona === contrasena
  );

  if (!usuarioEncontrado) {
    throw new Error("Correo electrónico o contraseña incorrectos");
  }

  // Aseguramos que retorne idRol (camelCase) que es lo que espera LoginPage.jsx
  return {
    ...usuarioEncontrado,
    idRol: usuarioEncontrado.tipoPersona?.idRol || usuarioEncontrado.idRol || usuarioEncontrado.id_rol
  };
};

/**
 * Envía solicitud de recuperación de contraseña
 * @param {string} usuario - Cédula o usuario
 * @param {string} correo - Correo registrado
 * @returns {Promise<void>}
 */
export const recuperarContrasena = async (usuario, correo) => {
  // TODO: Descomentar cuando el backend esté listo
  // return fetchAPI('/auth/recuperar', { method: 'POST', body: JSON.stringify({ usuario, correo }) });

  return Promise.resolve();
};

// ============================================================
//  NOTIFICACIONES
// ============================================================

/**
 * Obtiene las notificaciones del profesor autenticado
 * @returns {Promise<Array>} Lista de notificaciones
 */
export const getNotificaciones = async () => {
  // TODO: Descomentar cuando el backend esté listo
  // return fetchAPI('/notificaciones');

  return Promise.resolve([
    { id: 1, mensaje: 'Clase hoy: Lógica de programación.', detalle: 'Hora: 10:30 am - Aula: 503' },
    { id: 2, mensaje: 'Nueva clase asignada.', detalle: 'Programación web - Aula: 501' },
    { id: 3, mensaje: 'Modificación de horario.', detalle: 'Clase Metodología ahora a las 02:00 pm.' },
  ]);
};

// ============================================================
//  MATERIAS
// ============================================================

/**
 * Obtiene todas las materias activas
 * @returns {Promise<Array>} Lista de materias
 */
export const getMaterias = async () => {
  const lista = await fetchAPI('/materia');
  // Normalizar: Spring Boot puede devolver camelCase (nombreMateria) o lowercase (nombremateria)
  return lista.map(m => ({
    idmateria:    m.idmateria    ?? m.idMateria    ?? m.id,
    nombremateria: m.nombremateria ?? m.nombreMateria ?? m.nombre,
    activo:       m.activo,
  }));
};

/**
 * Crea una nueva materia
 * @param {Object} data
 * @returns {Promise<Object>} Materia creada
 */
export const createMateria = async (data) =>
  fetchAPI('/materia', { method: 'POST', body: JSON.stringify(data) });

export const updateMateria = async (id, data) =>
  fetchAPI(`/materia/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteMateria = async (id) =>
  fetchAPI(`/materia/${id}`, { method: 'DELETE' });

// ============================================================
//  AULAS
// ============================================================

/**
 * Obtiene todas las aulas activas
 * @returns {Promise<Array>} Lista de aulas
 */
export const getAulas = async () => {
  const lista = await fetchAPI('/aula');

  // Normalizar: Spring Boot puede devolver camelCase o lowercase
  return lista.map(a => ({
    idaula:        a.idaula        ?? a.idAula        ?? a.id,
    numerodeaula:  a.numerodeaula  ?? a.numeroDeAula  ?? a.numero,
    capacidadaula: a.capacidadaula ?? a.capacidadAula,
    // Spring Boot puede devolver id_sede como campo plano O como objeto anidado sede: { idsede }
    id_sede:       a.id_sede       ?? a.idSede        ?? a.idsede
                   ?? a.sede?.idsede ?? a.sede?.idSede ?? a.sede?.id
                   ?? null,
    activo:        a.activo,
  }));
};

/**
 * Crea una nueva aula
 * @param {Object} data
 * @returns {Promise<Object>} Aula creada
 */
export const createAula = async (data) =>
  fetchAPI('/aula', { method: 'POST', body: JSON.stringify(data) });

export const updateAula = async (id, data) =>
  fetchAPI(`/aula/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteAula = async (id) =>
  fetchAPI(`/aula/${id}`, { method: 'DELETE' });

// ============================================================
//  SEDES
// ============================================================

export const getSedes = async () => {
  const lista = await fetchAPI('/sede');

  // Normalizar: Spring Boot puede devolver camelCase (idSede) o lowercase (idsede)
  return lista.map(s => ({
    idsede:     s.idsede     ?? s.idSede     ?? s.id,
    nombresede: s.nombresede ?? s.nombreSede ?? s.nombre,
  }));
};

export const createSede = async (data) =>
  fetchAPI('/sede', { method: 'POST', body: JSON.stringify(data) });

export const updateSede = async (id, data) =>
  fetchAPI(`/sede/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteSede = async (id) =>
  fetchAPI(`/sede/${id}`, { method: 'DELETE' });

export const updateHorarioProfesor = async (id, data) => {
  return fetchAPI(`/horarioprofesor/${id}`, { method: 'PUT', body: JSON.stringify(data) });
};

export const deleteHorarioProfesor = async (id) => {
  return fetchAPI(`/horarioprofesor/${id}`, { method: 'DELETE' });
};

