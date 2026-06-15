'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://jovcdrplavvsfxrgaqle.supabase.co', 'sb_publishable_LvLvFMyl2bI4TLezUnUXLg_kUsD0cou');
const whatsappNumber = '50243752875';

type Property = { 
  id: number; 
  title: string; 
  size: string; 
  price: string; 
  status: string; 
  image_url: string;
  image_url_2?: string;
  image_url_3?: string;
  pdf_url?: string;
  description?: string;
};

export default function CatalogPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [selectedProp, setSelectedProp] = useState<Property | null>(null);
  const [activeImg, setActiveImg] = useState<string>('');

  const [pdfWarning, setPdfWarning] = useState<{ isOpen: boolean; propTitle: string }>({ isOpen: false, propTitle: '' });

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('properties').select('*').order('id', { ascending: false });
      setProperties(data || []);
      setLoading(false);
      
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (localStorage.getItem('admin_active_session') === 'true') {
        setIsAdmin(true);
      }
    };
    load();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('admin_active_session');
    if (user) await supabase.auth.signOut();
    window.location.href = '/';
  };

  const openFicha = (prop: Property) => {
    setSelectedProp(prop);
    setActiveImg(prop.image_url);
  };

  const handlePdfDownload = (e: React.MouseEvent, prop: Property) => {
    e.stopPropagation();
    
    if (!user && !isAdmin) {
      setPdfWarning({ isOpen: true, propTitle: prop.title });
      return;
    }

    if (prop.pdf_url) {
      window.open(prop.pdf_url, '_blank');
    } else {
      alert('Esta propiedad aún no tiene un archivo PDF adjunto.');
    }
  };

  return (
    <main className="min-h-screen bg-[#121212] text-gray-200 antialiased relative overflow-x-hidden w-full">
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <img src="/logo.png" alt="" className="w-[70%] max-w-[800px] object-contain grayscale" />
      </div>

      <div className="relative z-10 w-full">
        {/* Botón flotante de WhatsApp */}
        <a href={`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=Hola,%20me%20gustaría%20información%20sobre%20sus%20terrenos.`} target="_blank" rel="noopener noreferrer" className="fixed bottom-8 right-8 z-50 bg-[#25d366] w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all cursor-pointer">
          <svg className="w-7 h-7 md:w-8 md:h-8 fill-white" viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222.4 100-222.4 222.4 0 39.2 10.2 77.3 29.6 111L0 480l118.1-30.9c33.8 17.9 71.9 27.3 111 27.3h.1c122.4 0 222.4-100 222.4-222.4 0-59.3-23.1-115.1-65.1-157.1z"/></svg>
        </a>

      {/* Header estático responsivo ajustado para móviles */}
        <header className="border-b border-gray-800 bg-[#1a1a1a]/80 backdrop-blur-md sticky top-0 z-40 w-full">
          <div className="w-full max-w-6xl mx-auto px-3 h-20 md:h-24 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 py-1 flex-shrink-0">
              <img src="/logo.png" alt="Logo" className="h-10 w-10 md:h-14 md:w-14 object-contain" />
              <div className="flex flex-col justify-center">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-none font-serif text-[#E5E4E2]">
                  INNOVASIÓN
                </h1>
                <span className="text-[8px] md:text-[10px] text-gray-400 font-bold uppercase tracking-[0.15em] mt-0.5 opacity-80">Asesor Inmobiliario</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <a href="/" className="text-[8px] md:text-xs font-semibold uppercase text-gray-400 border border-gray-700 px-2.5 py-1.5 rounded-xl bg-[#111111]">Inicio</a>
              {isAdmin ? (
                <div className="flex items-center gap-1.5">
                  <a href="/admin" className="text-[8px] md:text-[10px] font-extrabold uppercase text-black bg-[#D4AF37] px-2.5 py-1.5 rounded-xl">Admin</a>
                  <button onClick={handleLogout} className="text-[8px] md:text-[10px] font-extrabold text-red-400 border border-red-500/20 px-2.5 py-1.5 rounded-xl bg-red-950/10 cursor-pointer">Salir</button>
                </div>
              ) : user ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold uppercase text-gray-300 truncate hidden sm:inline">¡Hola!</span>
                  <button onClick={handleLogout} className="text-[8px] md:text-[10px] font-extrabold uppercase text-white border border-white/10 px-2.5 py-1.5 rounded-xl bg-white/5 cursor-pointer">Salir</button>
                </div>
              ) : (
                <a href="/login" className="text-[8px] md:text-xs font-semibold uppercase tracking-wider text-black bg-[#D4AF37] px-2.5 py-1.5 rounded-xl">Acceder</a>
              )}
            </div>
          </div>
        </header>

        <section className="px-4 pt-12 md:pt-16 pb-8 text-center w-full max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-5xl font-extrabold tracking-tight mb-3 text-white font-serif">Catálogo de Propiedades</h1>
          <p className="text-gray-500 text-xs font-light tracking-wide">Presiona "Ver Terreno" para ver su Ficha Técnica, galería de fotos y descargar su PDF.</p>
        </section>

        <section className="w-full max-w-6xl mx-auto px-4 pb-32">
          {loading ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-t-yellow-500 border-2 rounded-full animate-spin"></div></div>
          ) : properties.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-10">No hay terrenos disponibles en este momento.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((prop) => (
                <div key={prop.id} onClick={() => openFicha(prop)} className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-gray-800 flex flex-col cursor-pointer hover:border-yellow-500/50 transition-all duration-300 shadow-xl group w-full">
                  <div className="h-56 relative overflow-hidden">
                    <img src={prop.image_url} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span className={`absolute top-4 right-4 text-[9px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider ${prop.status === 'Disponible' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : prop.status === 'Reservado' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>{prop.status}</span>
                  </div>
                  <div className="p-6 flex flex-col flex-grow justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-gray-100 mb-1 group-hover:text-yellow-500 transition-colors truncate">{prop.title}</h3>
                      <p className="text-gray-400 text-xs mb-4 font-light tracking-wide">{prop.size}</p>
                    </div>
                    <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                      <span className="text-lg font-black text-yellow-500 font-mono tracking-tight">{prop.price}</span>
                      <button onClick={(e) => { e.stopPropagation(); openFicha(prop); }} className="text-[9px] font-extrabold uppercase tracking-widest text-black bg-[#D4AF37] px-4 py-2.5 rounded-xl hover:brightness-110 transition-all border border-transparent cursor-pointer">Ver Terreno</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* MODAL DE FICHA TÉCNICA */}
      {selectedProp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#141414] border border-gray-800 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl max-h-[95vh] flex flex-col md:flex-row relative">
            <button onClick={() => setSelectedProp(null)} className="absolute top-4 right-4 z-20 bg-black/60 hover:bg-black text-white w-9 h-9 rounded-full flex items-center justify-center border border-gray-700 text-xs font-black cursor-pointer">✕</button>

            <div className="w-full md:w-1/2 bg-black flex flex-col justify-between p-4 border-b md:border-b-0 md:border-r border-gray-800">
              <div className="h-[240px] md:h-[350px] w-full rounded-2xl overflow-hidden mb-3 bg-[#1a1a1a]">
                <img src={activeImg} alt="Vista ampliada" className="w-full h-full object-contain" />
              </div>
              <div className="grid grid-cols-3 gap-2 h-16 md:h-20">
                {selectedProp.image_url && (
                  <button onClick={() => setActiveImg(selectedProp.image_url)} className={`rounded-xl overflow-hidden border-2 h-full bg-[#111111] cursor-pointer ${activeImg === selectedProp.image_url ? 'border-yellow-500' : 'border-transparent'}`}>
                    <img src={selectedProp.image_url} alt="Foto 1" className="w-full h-full object-cover" />
                  </button>
                )}
                {selectedProp.image_url_2 && (
                  <button onClick={() => setActiveImg(selectedProp.image_url_2 || '')} className={`rounded-xl overflow-hidden border-2 h-full bg-[#111111] cursor-pointer ${activeImg === selectedProp.image_url_2 ? 'border-yellow-500' : 'border-transparent'}`}>
                    <img src={selectedProp.image_url_2} alt="Foto 2" className="w-full h-full object-cover" />
                  </button>
                )}
                {selectedProp.image_url_3 && (
                  <button onClick={() => setActiveImg(selectedProp.image_url_3 || '')} className={`rounded-xl overflow-hidden border-2 h-full bg-[#111111] cursor-pointer ${activeImg === selectedProp.image_url_3 ? 'border-yellow-500' : 'border-transparent'}`}>
                    <img src={selectedProp.image_url_3} alt="Foto 3" className="w-full h-full object-cover" />
                  </button>
                )}
              </div>
            </div>

            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-[95vh]">
              <div>
                <span className={`text-[9px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${selectedProp.status === 'Disponible' ? 'bg-green-500/10 text-green-400 border-green-500/20' : selectedProp.status === 'Reservado' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>{selectedProp.status}</span>
                <h2 className="text-xl md:text-2xl font-black text-white mt-3 mb-1 font-serif tracking-tight">{selectedProp.title}</h2>
                <p className="text-[10px] font-light text-gray-500 tracking-wide mb-4 uppercase">Ficha Técnica</p>
                
                <div className="space-y-3 bg-[#1a1a1a] p-4 rounded-2xl border border-gray-800/80 mb-4">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Medidas</span>
                    <span className="text-xs font-semibold text-white tracking-wide">{selectedProp.size}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Precio</span>
                    <span className="text-lg font-extrabold text-yellow-500 font-mono tracking-tight">{selectedProp.price}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-300 font-light leading-relaxed mb-4">
                  {selectedProp.description || 'Lote de terreno urbanizado de alta plusvalía, ideal para construcción de vivienda o casa de descanso / chalet en la costa sur. Cuenta con excelente ubicación y accesibilidad.'}
                </p>
              </div>

              <div className="space-y-2.5 mt-auto pt-2">
                <button onClick={(e) => handlePdfDownload(e, selectedProp)} className="w-full bg-white text-black font-extrabold text-xs py-3.5 rounded-xl border border-gray-700 shadow-lg hover:bg-gray-200 transition-all tracking-wider uppercase cursor-pointer">Descargar Brochure en PDF</button>
                <a href={`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=Hola,%20me%20interesa%20esta%20propiedad:%20${selectedProp.title}`} target="_blank" rel="noopener noreferrer" className="w-full bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-black font-extrabold text-xs py-3.5 rounded-xl shadow-lg hover:brightness-110 transition-all text-center tracking-wider uppercase block">Cotizar por WhatsApp</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Aviso de inicio de sesión para PDFs */}
      {pdfWarning.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#1a1a1a] border border-gray-800 max-w-md w-full p-6 rounded-3xl shadow-2xl text-center">
            <div className="w-14 h-14 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-extrabold text-white mb-2 font-serif tracking-tight">¡Inicia sesión para descargar el PDF!</h3>
            <p className="text-gray-400 text-xs mb-6 leading-relaxed">Para poder ver y descargar el brochure o PDF del terreno <strong className="text-yellow-500">{pdfWarning.propTitle}</strong>, por favor inicia sesión en tu cuenta.</p>
            <div className="flex gap-3">
              <a href="/login" className="flex-grow bg-[#D4AF37] text-black font-black py-3 rounded-xl text-xs uppercase tracking-wider hover:brightness-110 transition-all shadow-lg">Iniciar Sesión</a>
              <button onClick={() => setPdfWarning({ isOpen: false, propTitle: '' })} className="px-4 bg-gray-800 text-gray-300 font-bold text-xs uppercase rounded-xl border border-gray-700 hover:bg-gray-700 transition-all cursor-pointer">Regresar</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}