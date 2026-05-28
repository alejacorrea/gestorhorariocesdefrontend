/**
 * LandingPage - Página de inicio pública
 * Muestra el banner de CESDE con el header y footer públicos
 */
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import banner from '../assets/banner1.jpg';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="w-full flex-1">
        {/* Banner principal */}
        <img
          src={banner}
          alt="Banner CESDE"
          className="w-full h-auto block"
        />

        {/* Sección de Tarjetas */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Tarjeta 1 */}
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8 border border-gray-100">
              <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center mb-6">
                <i className="bi bi-calendar-event text-primary text-xl"></i>
              </div>
              <h3 className="text-xl font-bold text-cesde-text mb-3">Calendario Interactivo</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Visualiza y administra horarios con vistas de mes, semana y día, diseñadas para máxima productividad.
              </p>
            </div>

            {/* Tarjeta 2 */}
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8 border border-gray-100">
              <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center mb-6">
                <i className="bi bi-people text-primary text-xl"></i>
              </div>
              <h3 className="text-xl font-bold text-cesde-text mb-3">Gestión de Docentes</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Asigna clases, aulas y sedes sin conflictos, manteniendo el control total sobre la carga académica.
              </p>
            </div>

            {/* Tarjeta 3 */}
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8 border border-gray-100">
              <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center mb-6">
                <i className="bi bi-robot text-primary text-xl"></i>
              </div>
              <h3 className="text-xl font-bold text-cesde-text mb-3">Asistente Virtual IA</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Soporte instantáneo para profesores mediante un chatbot inteligente integrado al sistema.
              </p>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
