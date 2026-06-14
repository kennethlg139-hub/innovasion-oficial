'use client';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#121212] text-gray-200 antialiased relative overflow-x-hidden flex flex-col w-full">
      {/* Fondo de marca de agua */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <img src="/logo.png" alt="" className="w-[70%] max-w-[800px] object-contain grayscale" />
      </div>

      <div className="relative z-10 w-full flex-grow flex flex-col justify-between">
        {/* Header Responsivo */}
        <header className="border-b border-gray-800 bg-[#1a1a1a]/80 backdrop-blur-md sticky top-0 z-40 w-full">
          <div className="w-full max-w-6xl mx-auto px-4 h-24 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-4 py-2">
              <img src="/logo.png" alt="Logo" className="h-10 w-10 md:h-12 w-12 object-contain" />
              <div className="flex flex-col justify-center">
                <h1 className="text-xl md:text-2xl font-black tracking-tight leading-none flex font-serif text-[#E5E4E2]">
                  INNOVASIÓN
                </h1>
                <span className="text-[8px] md:text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1 opacity-80">Asesor Inmobiliario</span>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <a href="/catalogo" className="text-[9px] md:text-xs font-semibold uppercase text-gray-300 border border-gray-700 px-3 py-2 rounded-xl bg-[#111111] tracking-wider hover:border-gray-500 transition-all">Catálogo</a>
              <a href="/registro" className="text-[9px] md:text-xs font-semibold uppercase text-white bg-white/5 border border-white/10 px-3 py-2 rounded-xl tracking-wider hover:bg-white hover:text-black transition-all">Crear Cuenta</a>
              <a href="/login" className="text-[9px] md:text-xs font-black uppercase tracking-wider text-black bg-[#D4AF37] px-4 py-2 rounded-xl hover:brightness-110 transition-all">Acceder</a>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="w-full max-w-4xl mx-auto px-4 flex-grow flex flex-col justify-center items-center text-center py-12 md:py-16 gap-6">
          <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 relative mb-2 opacity-80 flex items-center justify-center flex-shrink-0">
            <img src="/logo.png" alt="Innovasion" className="w-full h-full object-contain" />
          </div>

          <div className="space-y-3 max-w-4xl mx-auto">
            <h2 className="text-[28px] sm:text-4xl md:text-6xl font-extrabold font-serif tracking-tight leading-tight">
              <span className="text-[#E5E4E2]">UN LUGAR</span> <span className="text-[#D4AF37]">PARA TU HOGAR</span>
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Misión, Visión y Valores</p>
            <p className="text-gray-400 text-xs md:text-sm font-light max-w-2xl mx-auto leading-relaxed tracking-wide px-4">
              Especialistas en asesoría, compra y venta de bienes inmuebles y terrenos de alta plusvalía, enfocados en darte la mejor rentabilidad y seguridad.
            </p>
          </div>

          <a href="/catalogo" className="bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-black font-black text-xs md:text-sm uppercase tracking-widest px-8 py-4.5 rounded-2xl shadow-xl shadow-yellow-950/20 hover:brightness-110 transition-all cursor-pointer mt-2">
            Ver Terrenos Disponibles
          </a>

          {/* Tarjetas de Misión y Visión */}
          <div className="w-full max-w-2xl grid gap-3 text-left mt-4">
            <div className="bg-[#1a1a1a]/80 p-4 rounded-xl border border-gray-800">
              <h3 className="font-bold text-[10px] text-yellow-500 uppercase mb-1">Nuestra Misión</h3>
              <p className="text-[10px] text-gray-400 font-light leading-relaxed">Proporcionar soluciones inmobiliarias de alta rentabilidad con total transparencia y seguridad para nuestros clientes.</p>
            </div>
            <div className="bg-[#1a1a1a]/80 p-4 rounded-xl border border-gray-800">
              <h3 className="font-bold text-[10px] text-yellow-500 uppercase mb-1">Nuestra Visión</h3>
              <p className="text-[10px] text-gray-400 font-light leading-relaxed">Convertirnos en el referente inmobiliario principal en la costa sur, impulsando el desarrollo habitacional con innovación y calidad.</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full border-t border-gray-800/60 py-6 text-center">
          <p className="text-[8px] md:text-[10px] text-gray-600 uppercase tracking-[0.15em] font-bold">INNOVASIÓN © 2026 — Un lugar para tu hogar</p>
        </footer>
      </div>
    </main>
  );
}