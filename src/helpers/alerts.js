/**
 * @fileoverview Helpers centralizados de SweetAlert2 para el Gestor de Horarios CESDE
 * 
 * Todas las alertas usan la paleta de colores de CESDE (rosa #E91E75)
 * para mantener coherencia visual en toda la aplicación.
 */

import Swal from 'sweetalert2';

// Colores de la marca CESDE
const COLOR_PRIMARY = '#E91E75';
const COLOR_DARK = '#433F3F';

// ============================================================
//  ALERTAS DE ÉXITO
// ============================================================

/**
 * Muestra una alerta de éxito
 * @param {string} titulo - Título de la alerta
 * @param {string} texto - Descripción (opcional)
 * @returns {Promise} Promesa de SweetAlert2
 */
export const alertExito = (titulo, texto = '') => {
  return Swal.fire({
    icon: 'success',
    title: titulo,
    text: texto,
    confirmButtonColor: COLOR_PRIMARY,
    confirmButtonText: 'Aceptar',
    timer: 2500,
    timerProgressBar: true,
  });
};

// ============================================================
//  ALERTAS DE ERROR
// ============================================================

/**
 * Muestra una alerta de error
 * @param {string} titulo - Título del error
 * @param {string} texto - Descripción del error
 * @returns {Promise}
 */
export const alertError = (titulo, texto = '') => {
  return Swal.fire({
    icon: 'error',
    title: titulo,
    text: texto,
    confirmButtonColor: COLOR_PRIMARY,
    confirmButtonText: 'Entendido',
  });
};

// ============================================================
//  ALERTAS DE CONFIRMACIÓN
// ============================================================

/**
 * Muestra un diálogo de confirmación (ej: antes de eliminar)
 * @param {string} titulo - Pregunta de confirmación
 * @param {string} texto - Descripción adicional
 * @param {string} textoBotonConfirmar - Texto del botón de confirmar
 * @returns {Promise<boolean>} true si el usuario confirmó, false si canceló
 */
export const alertConfirmar = async (
  titulo = '¿Estás seguro?',
  texto = 'Esta acción no se puede deshacer.',
  textoBotonConfirmar = 'Sí, eliminar'
) => {
  const resultado = await Swal.fire({
    icon: 'warning',
    title: titulo,
    text: texto,
    showCancelButton: true,
    confirmButtonColor: COLOR_PRIMARY,
    cancelButtonColor: '#6c757d',
    confirmButtonText: textoBotonConfirmar,
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
  });

  return resultado.isConfirmed;
};

// ============================================================
//  ALERTAS DE ADVERTENCIA
// ============================================================

/**
 * Muestra una alerta de advertencia (sin cancelar)
 * @param {string} titulo
 * @param {string} texto
 * @returns {Promise}
 */
export const alertAdvertencia = (titulo, texto = '') => {
  return Swal.fire({
    icon: 'warning',
    title: titulo,
    text: texto,
    confirmButtonColor: COLOR_PRIMARY,
    confirmButtonText: 'Entendido',
  });
};

// ============================================================
//  ALERTA DE CARGA
// ============================================================

/**
 * Muestra un indicador de carga (sin cerrar automáticamente)
 * Debes llamar Swal.close() cuando termine la operación.
 * @param {string} titulo - Mensaje de carga
 */
export const alertCargando = (titulo = 'Procesando...') => {
  Swal.fire({
    title: titulo,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

/**
 * Cierra la alerta de carga actual
 */
export const cerrarAlerta = () => {
  Swal.close();
};

// ============================================================
//  ALERTA DE INFORMACIÓN
// ============================================================

/**
 * Muestra una alerta informativa
 * @param {string} titulo
 * @param {string} texto
 * @returns {Promise}
 */
export const alertInfo = (titulo, texto = '') => {
  return Swal.fire({
    icon: 'info',
    title: titulo,
    text: texto,
    confirmButtonColor: COLOR_PRIMARY,
    confirmButtonText: 'Aceptar',
  });
};

// ============================================================
//  ALERTA PERSONALIZADA CON HTML
// ============================================================

/**
 * Muestra una alerta con contenido HTML personalizado
 * Útil para mostrar detalles de un horario o profesor
 * @param {string} titulo
 * @param {string} html - Contenido HTML
 * @returns {Promise}
 */
export const alertHTML = (titulo, html) => {
  return Swal.fire({
    title: titulo,
    html: html,
    confirmButtonColor: COLOR_PRIMARY,
    confirmButtonText: 'Cerrar',
  });
};
