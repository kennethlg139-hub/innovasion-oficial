'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jovcdrplavvsfxrgaqle.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdmNkcnBsYXZ2c2Z4cmdhcWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyOTEwNzksImV4cCI6MjA5Njg2NzA3OX0.cx1r9JtzBXkySrN73DMoZl7bg1cyMH-NzP3H09QVH1s';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function HomePage() {
  const [clickCount, setClickCount] = useState(0);
  const [isSplashFinished, setIsSplashFinished] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [loadingText, setLoadingText] = useState("Preparando tu experiencia en Innovasión...");
  const [showAbout, setShowAbout] = useState(false);
  const [showSocial, setShowSocial] = useState(false);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const resetTimeout = useRef<NodeJS.Timeout | null>(null);

  const messages = [
    "Preparando tu experiencia en Innovasión...",
    "Cargando terrenos disponibles...",
    "Buscando ubicaciones con plusvalía...",
    "Redirigiendo a Innovasión..."
  ];

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('social_links').select('*');
      if (data) setSocialLinks(data.sort((a, b) => a.id - b.id));
    };
    fetchData();

    const hasNavigated = sessionStorage.getItem('hasNavigated');
    if (!hasNavigated) {
      let msgIdx = 0;
      const msgInterval = setInterval(() => {
        msgIdx = (msgIdx + 1) % messages.length;
        setLoadingText(messages[msgIdx]);
      }, 1000);

      const timer = setTimeout(() => {
        setIsFading(true);
        setTimeout(() => {
          setIsSplashFinished(true);
          clearInterval(msgInterval);
          sessionStorage.setItem('hasNavigated', 'true');
        }, 700); 
      }, 1500); 

      return () => { clearTimeout(timer); clearInterval(msgInterval); };
    } else {
      setIsSplashFinished(true);
    }
  }, []);

  const handleNavigation = () => sessionStorage.setItem('hasNavigated', 'true');

  const handleLogoClick = () => {
    if (resetTimeout.current) clearTimeout(resetTimeout.current);
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount === 3) {
      setClickCount(0);
      window.location.href = '/login';
      return;
    }
    resetTimeout.current = setTimeout(() => setClickCount(0), 1500);
  };

  const btnClass = "bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-black font-black text-[10px] md:text-sm uppercase tracking-widest px-6 py-4 rounded-xl shadow-xl shadow-yellow-950/20 hover:bg-[#065f46] hover:from-[#065f46] hover:to-[#065f46] hover:text-white transition-all duration-300 cursor-pointer block w-full text-center";

  return (
    <main className={`min-h-screen bg-[#121212] text-gray-200 antialiased relative overflow-x-hidden flex flex-col w-full ${!isSplashFinished ? 'overflow-hidden' : ''}`}>
      
      {!isSplashFinished && (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#121212] ${isFading ? 'animate-fade-to-black' : ''}`}>
          <div className="relative w-64 h-64 preserve-3d animate-metallic-spin-once mb-8">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="w-full max-w-[90%] px-4 text-center">
            <h2 className="text-xl md:text-2xl font-serif text-[#E5E4E2] mb-3 animate-typing inline-block">UN LUGAR PARA TU HOGAR</h2>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-2 px-4 text-center">{loadingText}</p>
        </div>
      )}

      <div className={`transition-opacity duration-1000 w-full flex-grow flex flex-col justify-between ${!isSplashFinished ? 'opacity-0' : 'opacity-100'}`}>
        <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
          <img src="/logo.png" alt="" className="w-[70%] max-w-[800px] object-contain grayscale" />
        </div>
        
        <header className="border-b border-gray-800 bg-[#1a1a1a]/80 backdrop-blur-md sticky top-0 z-40 w-full">
          <div className="w-full max-w-6xl mx-auto px-3 h-20 md:h-24 flex items-center justify-between gap-2">
            <div onClick={handleLogoClick} className="flex items-center py-0.5 h-[98%] flex-shrink-0 cursor-pointer select-none" title="Acceso restringido (Triple clic)">
              <img src="/logo.png" alt="Logo" className="h-[98%] w-auto aspect-square object-contain" />
              <div className="flex flex-col justify-center ml-4">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-none font-serif text-[#E5E4E2]">INNOVASIÓN</h1>
                <span className="text-[8px] md:text-[10px] text-gray-400 font-bold uppercase tracking-[0.15em] mt-0.5 opacity-80">Asesor Inmobiliario</span>
              </div>
            </div>
            <a href="/catalogo" onClick={handleNavigation} className="text-[10px] font-bold uppercase tracking-widest border border-gray-700 px-4 py-2 rounded-lg hover:border-gray-500 transition-all cursor-pointer">Catálogo</a>
          </div>
        </header>

        <section className="w-full max-w-4xl mx-auto px-3 flex-grow flex flex-col justify-center items-center text-center py-10 md:py-16 gap-5">
          <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-56 md:h-56 relative opacity-80 flex items-center justify-center flex-shrink-0">
            <img src="/logo.png" alt="Innovasion" className="w-full h-full object-contain" />
          </div>
          <div className="space-y-2.5 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-6xl font-extrabold font-serif tracking-tight leading-tight">
              <span className="text-[#E5E4E2]">UN LUGAR</span> <span className="text-[#D4AF37]">PARA TU HOGAR</span>
            </h2>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">Asesor Inmobiliario</p>
          </div>

          <div className="w-full max-w-[300px] flex flex-col gap-5 mt-4">
            <a href="/catalogo" onClick={handleNavigation} className={btnClass}>Ver Terrenos Disponibles</a>
            <button onClick={() => setShowAbout(true)} className={btnClass}>¿Quiénes somos?</button>
            <button onClick={() => setShowSocial(true)} className={btnClass}>Redes Sociales</button>
          </div>
        </section>

       {/* MODAL COLLAGE REDES SOCIALES */}
        {showSocial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setShowSocial(false)}>
            <div className="bg-[#121212] p-8 rounded-3xl max-w-xs w-full border border-[#D4AF37]/30 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-[#D4AF37] mb-6 uppercase tracking-[0.2em] text-sm">Síguenos</h3>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {socialLinks.map((link) => (
                  <a key={link.id} href={link.url} target="_blank" className="bg-[#1a1a1a] p-4 rounded-2xl flex items-center justify-center hover:bg-[#D4AF37] transition-all">
                    {/* AQUÍ ESTÁ LA SOLUCIÓN: Usamos SimpleIcons y aseguramos compatibilidad con platform o name */}
                    <img 
                      src={`https://cdn.simpleicons.org/${(link.platform || link.name || '').toLowerCase()}`} 
                      alt={link.platform || link.name} 
                      className="w-10 h-10 object-contain invert" 
                    />
                  </a>
                ))}
              </div>
              <button onClick={() => setShowSocial(false)} className="w-full py-3 border border-[#D4AF37] text-[10px] text-[#D4AF37] uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all rounded-xl cursor-pointer">Cerrar</button>
            </div>
          </div>
        )}

      {/* MODAL QUIÉNES SOMOS */}
{showAbout && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setShowAbout(false)}>
    <div className="bg-[#121212] p-8 rounded-3xl max-w-md w-full border border-[#D4AF37]/30 shadow-2xl text-center" onClick={e => e.stopPropagation()}>
      <h3 className="font-bold text-[#D4AF37] mb-4 uppercase tracking-[0.2em] text-sm">¿Quiénes Somos?</h3>
      
      <div className="text-gray-300 text-sm mb-8 space-y-4 text-left">
        <p>
          En <strong className="text-white">INNOVASIÓN</strong>, somos asesores inmobiliarios comprometidos con encontrar el lugar ideal para tu hogar.
        </p>
        <p>
          Queremos que juntos encontremos un lugar para construir tu futuro.
        </p>
      </div>

      <button onClick={() => setShowAbout(false)} className="w-full py-3 border border-[#D4AF37] text-[10px] text-[#D4AF37] uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all rounded-xl cursor-pointer">
        Cerrar
      </button>
    </div>
  </div>
)}

        <footer className="w-full border-t border-gray-800/60 py-5 text-center px-2">
          <p className="text-[8px] md:text-[9px] text-gray-600 uppercase tracking-[0.15em] font-bold">INNOVASIÓN © 2026 — Un lugar para tu hogar</p>
        </footer>
      </div>
    </main>
  );
}