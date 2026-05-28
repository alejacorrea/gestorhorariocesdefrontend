/**
 * ChatbotPage - Chatbot de soporte para profesores
 * 
 * Presenta opciones predefinidas y permite escribir mensajes libres.
 * Las respuestas son simuladas (listas para conectar con un backend de IA).
 */
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeaderProfesor from '../components/layout/HeaderProfesor';

// Respuestas y palabras clave para detectar la intención del usuario
const BASE_RESPUESTAS = [
  { keywords: ['horario', 'clases', 'ver mi horario', 'donde estan'], text: 'Puedes consultar tu horario directamente en el calendario de tu panel principal.' },
  { keywords: ['agregar', 'crear', 'nuevo', 'nueva clase', 'añadir'], text: 'Para agregar una clase, ve a tu calendario y haz clic en cualquier día. Se abrirá un formulario para ingresar los detalles.' },
  { keywords: ['modificar', 'editar', 'cambiar', 'actualizar'], text: 'Para modificar un horario, haz clic en el evento dentro del calendario y selecciona "Modificar". Ojo: solo puedes modificar las clases que tú mismo creaste.' },
  { keywords: ['eliminar', 'borrar', 'quitar'], text: 'Para eliminar un evento, ubícalo en tu calendario, pasa el cursor sobre él y haz clic en el botón "Eliminar" rojo. Solo aplica para tus propios eventos.' },
  { keywords: ['contraseña', 'clave', 'password'], text: 'Puedes cambiar tu contraseña haciendo clic en el ícono de perfil arriba a la derecha y seleccionando "Cambiar contraseña".' },
  { keywords: ['perfil', 'datos', 'correo', 'nombre'], text: 'Puedes ver tus datos en "Ver perfil" desde el menú superior derecho. Si necesitas actualizar tu nombre o correo, debes contactar a un administrador.' },
  { keywords: ['hola', 'buenos dias', 'buenas tardes', 'saludos', 'que tal'], text: '¡Hola! ¿En qué te puedo ayudar el día de hoy?' },
  { keywords: ['gracias', 'muy amable', 'ok', 'entendido', 'listo', 'perfecto'], text: '¡Con mucho gusto! Si tienes alguna otra duda, aquí estaré.' },
  { keywords: ['soporte', 'ayuda', 'asesor', 'administrador', 'admin', 'ticket'], text: 'Si necesitas ayuda especializada, puedes enviar un ticket desde la página de Soporte o llamar a la Línea de Transparencia: 018000517740.' },
];

const getRespuestaInteligente = (textoUsuario) => {
  const txt = textoUsuario.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // quita tildes
  
  for (const item of BASE_RESPUESTAS) {
    if (item.keywords.some(kw => txt.includes(kw))) {
      return item.text;
    }
  }
  return 'Interesante. Si necesitas asistencia más específica sobre ese tema, te sugiero crear un ticket en la página de Soporte o contactar a la Línea de Transparencia (018000517740).';
};

// Preguntas rápidas predefinidas
const PREGUNTAS_RAPIDAS = [
  { id: 1, texto: '¿Cómo consulto mi horario?', respuesta: BASE_RESPUESTAS[0].text },
  { id: 2, texto: '¿Cómo agrego una clase?', respuesta: BASE_RESPUESTAS[1].text },
  { id: 3, texto: 'Olvidé mi contraseña', respuesta: BASE_RESPUESTAS[4].text },
  { id: 4, texto: 'Contactar a soporte', respuesta: BASE_RESPUESTAS[8].text },
];

const ChatbotPage = () => {
  // Obtenemos el nombre del profesor para saludarlo
  const nombreUsuario = localStorage.getItem('nombre') || 'Profesor';
  const primerNombre = nombreUsuario.split(' ')[0];

  const [mensajes, setMensajes] = useState([
    { id: 1, tipo: 'bot', texto: `¡Hola, ${primerNombre}! Soy tu asistente virtual. ¿En qué te puedo ayudar hoy? Escribe tu consulta o elige una opción rápida:` },
  ]);
  const [inputTexto, setInputTexto] = useState('');
  const [escribiendo, setEscribiendo] = useState(false);
  const mensajesRef = useRef(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes]);

  /**
   * Agrega un mensaje del usuario y genera la respuesta del bot
   * @param {string} texto - Mensaje del usuario
   * @param {string} respuesta - Respuesta del bot (opcional, si no se provee se usa la inteligente)
   */
  const enviarMensaje = async (texto, respuestaBot = null) => {
    if (!texto.trim()) return;

    // Agregar mensaje del usuario
    const msgUsuario = { id: Date.now(), tipo: 'usuario', texto };
    setMensajes(prev => [...prev, msgUsuario]);
    setInputTexto('');

    // Simular "escribiendo..."
    setEscribiendo(true);
    await new Promise(r => setTimeout(r, 600 + Math.random() * 600)); // Tiempo de respuesta variable para más realismo
    setEscribiendo(false);

    // Determinar respuesta del bot
    const respuesta = respuestaBot || getRespuestaInteligente(texto);
    const msgBot = { id: Date.now() + 1, tipo: 'bot', texto: respuesta };
    setMensajes(prev => [...prev, msgBot]);
  };

  const handleEnviar = () => {
    enviarMensaje(inputTexto);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-cesde-gray">
      <HeaderProfesor />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden flex flex-col" style={{ height: '75vh' }}>

          {/* Header del chat */}
          <div className="bg-primary text-white px-5 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <i className="bi bi-robot text-lg" />
            </div>
            <div>
              <p className="font-bold text-sm">Chatbot Gestor Horario</p>
              <p className="text-xs text-pink-200">En línea</p>
            </div>
            <Link 
              to="/profesor" 
              className="ml-auto flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full transition-colors text-sm font-semibold no-underline"
              title="Volver al panel"
            >
              <i className="bi bi-arrow-left text-base" />
              <span>Volver</span>
            </Link>
          </div>

          {/* Área de mensajes */}
          <div
            ref={mensajesRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
          >
            {mensajes.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.tipo === 'bot' && (
                  <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                    <i className="bi bi-robot text-white text-xs" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${msg.tipo === 'usuario'
                      ? 'bg-primary text-white rounded-br-none'
                      : 'bg-white text-cesde-dark rounded-bl-none border border-gray-100'
                    }`}
                >
                  {msg.texto}
                </div>
              </div>
            ))}

            {/* Indicador "escribiendo..." */}
            {escribiendo && (
              <div className="flex justify-start">
                <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  <i className="bi bi-robot text-white text-xs" />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-gray-100 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preguntas rápidas */}
          <div className="px-4 py-2 border-t border-gray-100 flex gap-2 flex-wrap">
            {PREGUNTAS_RAPIDAS.map(p => (
              <button
                key={p.id}
                onClick={() => enviarMensaje(p.texto, p.respuesta)}
                className="text-xs bg-primary/10 text-primary border border-primary/30 rounded-full px-3 py-1 cursor-pointer hover:bg-primary/20 transition-colors font-medium"
              >
                {p.texto}
              </button>
            ))}
          </div>

          {/* Input de mensaje */}
          <div className="px-4 py-3 border-t border-gray-100 flex gap-3 items-center">
            <input
              type="text"
              id="chatbot-input"
              value={inputTexto}
              onChange={e => setInputTexto(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje..."
              className="flex-1 bg-gray-100 border-none outline-none rounded-full px-4 py-2.5 text-sm text-cesde-dark placeholder-gray-400"
              disabled={escribiendo}
            />
            <button
              onClick={handleEnviar}
              disabled={!inputTexto.trim() || escribiendo}
              className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center border-none cursor-pointer hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              aria-label="Enviar mensaje"
            >
              <i className="bi bi-send-fill text-sm" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatbotPage;
