'use client';

import { useState, useEffect } from 'react';

export default function HomePage() {
  const [clickCount, setClickCount] = useState(0);
  let resetTimeout: NodeJS.Timeout;

  const handleLogoClick = () => {
    // Almacena el conteo de clics en el logo para el acceso oculto (3 clics)
    clearTimeout(resetTimeout);
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount === 3) {
      setClickCount(0);
      window.location.href = '/login';
    }

    resetTimeout = setTimeout(() => {
      setClickCount(0);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-[#121212] text-gray-200 antialiased relative overflow-x-hidden flex flex-col w-full">
      {/* Fondo de marca de agua */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <img src="/logo.png" alt="" className="w-[70%] max-w-[800px] object-contain grayscale" />
      </div>

      <div className="relative z-10 w-full flex-grow flex flex-col justify-between">
        {/* Header Responsivo con logo interactivo oculto */}
        <header className="border-b border-gray-800 bg-[#1a1a1a]/80 backdrop-blur-md sticky top-0 z-40 w-full">
          <div className="w-full max-w-6xl mx-auto px-3 h-20 md:h-24 flex items-center justify-between gap-2">
            <div 
              onClick={handleLogoClick} 
              className="flex items-center gap-2.5 py-1 flex-shrink-0 cursor-pointer select-none"
              title="Acceso restringido (Triple clic)"
            >
              <img src="/logo.png" alt="Logo" className="h-9 w-9 md:h-12 md:w-12 object-contain" />
              <div className="flex flex-col justify-center">
                <h1 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight leading-none font-serif text-[#E5E4E2]">
                  INNOVASIÓN
                </h1>
                <span className="text-[7px] md:text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-0.5 opacity-80">Asesor Inmobiliario</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 md:gap-3 flex-shrink-0">
              <a href="/catalogo" className="text-[8px] md:text-xs font-semibold uppercase text-gray-300 border border-gray-700 px-2.5 py-1.5 rounded-xl bg-[#111111] tracking-wider hover:border-gray-500 transition-all">Catálogo</a>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="w-full max-w-4xl mx-auto px-3 flex-grow flex flex-col justify-center items-center text-center py-10 md:py-16 gap-5">
          <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 relative opacity-80 flex items-center justify-center flex-shrink-0">
            <img src="/logo.png" alt="Innovasion" className="w-full h-full object-contain" />
          </div>

          <div className="space-y-2.5 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-6xl font-extrabold font-serif tracking-tight leading-tight">
              <span className="text-[#E5E4E2]">UN LUGAR</span> <span className="text-[#D4AF37]">PARA TU HOGAR</span>
            </h2>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">Misión, Visión y Valores</p>
            <p className="text-gray-400 text-[11px] md:text-sm font-light max-w-xl mx-auto leading-relaxed tracking-wide px-2">
              Especialistas en asesoría, compra y venta de bienes inmuebles y terrenos de alta plusvalía, enfocados en darte la mejor rentabilidad y seguridad.
            </p>
          </div>

          <a href="/catalogo" className="bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-black font-black text-[10px] md:text-sm uppercase tracking-widest px-6 py-4 rounded-xl shadow-xl shadow-yellow-950/20 hover:brightness-110 transition-all cursor-pointer mt-1">
            Ver Terrenos Disponibles
          </a>

          {/* Tarjetas de Misión y Visión */}
          <div className="w-full max-w-xl grid gap-2.5 text-left mt-3">
            <div className="bg-[#1a1a1a]/80 p-3.5 rounded-xl border border-gray-800">
              <h3 className="font-bold text-[9px] text-yellow-500 uppercase mb-0.5 tracking-wider">Nuestra Misión</h3>
              <p className="text-[10px] text-gray-400 font-light leading-relaxed">Proporcionar soluciones inmobiliarias de alta rentabilidad con total transparencia y seguridad para nuestros clientes.</p>
            </div>
            <div className="bg-[#1a1a1a]/80 p-3.5 rounded-xl border border-gray-800">
              <h3 className="font-bold text-[9px] text-yellow-500 uppercase mb-0.5 tracking-wider">Nuestra Visión</h3>
              <p className="text-[10px] text-gray-400 font-light leading-relaxed">Convertirnos en el referente inmobiliario principal en la costa sur, impulsando el desarrollo habitacional con innovación y calidad.</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full border-t border-gray-800/60 py-5 text-center px-2">
          <p className="text-[8px] md:text-[9px] text-gray-600 uppercase tracking-[0.15em] font-bold">INNOVASIÓN © 2026 — Un lugar para tu hogar</p>
        </footer>
      </div>
    </main>
  );
}