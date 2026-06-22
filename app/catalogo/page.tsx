'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jovcdrplavvsfxrgaqle.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdmNkcnBsYXZ2c2Z4cmdhcWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyOTEwNzksImV4cCI6MjA5Njg2NzA3OX0.cx1r9JtzBXkySrN73DMoZl7bg1cyMH-NzP3H09QVH1s';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const whatsappNumber = '50243752875';

// Clase unificada: Dorado a Verde Esmeralda, tamaño compacto, cursor pointer y flex para iconos
const btnClass = "bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-black font-black text-[9px] md:text-xs uppercase tracking-widest px-4 py-2.5 rounded-lg shadow-xl shadow-yellow-950/20 hover:bg-[#065f46] hover:from-[#065f46] hover:to-[#065f46] hover:text-white transition-all duration-300 cursor-pointer block w-full text-center flex items-center justify-center gap-2";

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
  location_url?: string;
};

// --- TIPO PARA REDES ---
type SocialLink = { id: number; platform: string; url: string; icon_path: string; };

export default function CatalogPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedProp, setSelectedProp] = useState<Property | null>(null);
  const [activeImg, setActiveImg] = useState<string>('');
  const [leadModal, setLeadModal] = useState<{ isOpen: boolean; action: 'WhatsApp' | 'PDF' | 'Ubicación'; prop: Property | null }>({ isOpen: false, action: 'WhatsApp', prop: null });
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // --- ESTADO PARA REDES ---
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('properties').select('*').order('id', { ascending: false });
      setProperties(data || []);
      
      // --- CARGA DE REDES ---
      const { data: social } = await supabase.from('social_links').select('*');
      setSocialLinks(social || []);

      setLoading(false);
      
      if (localStorage.getItem('admin_active_session') === 'true') {
        setIsAdmin(true);
      }

      if (typeof window !== 'undefined') {
        const savedName = localStorage.getItem('lead_name');
        const savedPhone = localStorage.getItem('lead_phone');
        if (savedName) setNombre(savedName);
        if (savedPhone) setTelefono(savedPhone);
      }
    };
    load();
  }, []);

  // --- LÓGICA DE CONTROL DE HISTORIAL ---
  useEffect(() => {
    const handlePopState = () => { if (selectedProp) setSelectedProp(null); };
    if (selectedProp) {
      window.history.pushState({ modalOpen: true }, '');
      window.addEventListener('popstate', handlePopState);
    } else if (window.history.state?.modalOpen) {
      window.history.back();
    }
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedProp]);

  const openFicha = (prop: Property) => {
    setSelectedProp(prop);
    setActiveImg(prop.image_url);
  };

  const saveLeadSupabase = async (propTitle: string, action: string) => {
    if (isAdmin) return;
    await supabase.from('clientes').insert([
      { nombre: nombre.trim(), telefono: telefono.trim(), terreno_interes: propTitle, tipo_accion: action, estado: 'Pendiente' }
    ]);
  };

  const processAction = (action: 'WhatsApp' | 'PDF' | 'Ubicación', prop: Property) => {
    if (action === 'PDF' && prop.pdf_url) window.open(prop.pdf_url, '_blank');
    else if (action === 'WhatsApp') {
      const mensajeWpp = `Hola, me interesa: ${prop.title} (${prop.price}). Mi nombre es ${nombre}.`;
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensajeWpp)}`, '_blank');
    } else if (action === 'Ubicación' && prop.location_url) window.open(prop.location_url, '_blank');
    
    setLeadModal({ isOpen: false, action: 'WhatsApp', prop: null });
    setSelectedProp(null);
  };

  const requestAction = async (action: 'WhatsApp' | 'PDF' | 'Ubicación', prop: Property) => {
    if (!isAdmin && (!nombre || !telefono)) setLeadModal({ isOpen: true, action, prop });
    else {
      if (!isAdmin) await saveLeadSupabase(prop.title, action);
      processAction(action, prop);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadModal.prop) return;
    setSubmitting(true);
    localStorage.setItem('lead_name', nombre);
    localStorage.setItem('lead_phone', telefono);
    await saveLeadSupabase(leadModal.prop.title, leadModal.action);
    setSubmitting(false);
    processAction(leadModal.action, leadModal.prop);
  };

  return (
    <main className="min-h-screen bg-[#121212] text-gray-200 antialiased relative overflow-x-hidden w-full">
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <img src="/logo.png" alt="" className="w-[70%] max-w-[800px] object-contain grayscale" />
      </div>

      <div className="relative z-10 w-full">
        <header className="border-b border-gray-800 bg-[#1a1a1a]/80 backdrop-blur-md sticky top-0 z-40 w-full h-20 md:h-24">
          <div className="w-full max-w-6xl mx-auto px-3 h-full flex items-center justify-between">
            <div className="flex items-center h-[98%] py-0.5 flex-shrink-0 cursor-pointer" onClick={() => window.location.href = '/'}>
              <img src="/logo.png" alt="Logo" className="h-[98%] w-auto aspect-square object-contain" />
              <div className="flex flex-col justify-center ml-4">
                <h1 className="text-xl md:text-3xl font-black font-serif text-[#E5E4E2]">INNOVASIÓN</h1>
                <span className="text-[8px] md:text-[10px] text-gray-400 font-bold uppercase tracking-[0.15em]">Asesor Inmobiliario</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <a href="/" className="text-[8px] md:text-xs font-semibold uppercase text-gray-400 border border-gray-700 px-2.5 py-1.5 rounded-xl bg-[#111111] hover:border-gray-500 transition-all cursor-pointer">Inicio</a>
              {isAdmin && <a href="/admin" className="text-[8px] md:text-[10px] font-extrabold uppercase text-black bg-[#D4AF37] px-2.5 py-1.5 rounded-xl cursor-pointer">Admin</a>}
            </div>
          </div>
        </header>

        <section className="px-3 pt-8 md:pt-16 pb-6 text-center w-full max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight mb-2 text-white font-serif">Catálogo de Propiedades</h1>
          <p className="text-gray-500 text-[10px] md:text-xs font-light tracking-wide max-w-sm md:max-w-none mx-auto">Presiona "Ver Terreno" para ver la Ficha Técnica, galería de fotos, ubicación y solicitar información.</p>
        </section>

        <section className="w-full max-w-6xl mx-auto px-3 pb-24">
          {loading ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-t-yellow-500 border-2 rounded-full animate-spin"></div></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((prop) => (
                <div key={prop.id} className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-gray-800 shadow-xl w-full">
                  <img src={prop.image_url} alt={prop.title} className="w-full h-48 object-cover" />
                  <div className="p-4 md:p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-white">{prop.title}</h3>
                      <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded border ${prop.status === 'Disponible' ? 'bg-green-500/15 text-green-300 border-green-500/20' : 'bg-red-500/15 text-red-300 border-red-500/20'}`}>{prop.status}</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">{prop.size}</p>
                    <div className="flex flex-col gap-3">
                       <span className="text-lg font-black text-[#D4AF37] font-mono tracking-tight text-center">{prop.price}</span>
                       <button onClick={() => openFicha(prop)} className={btnClass}>Ver Terreno</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* --- SECCIÓN REDES SOCIALES INTEGRADA --- */}
        <section className="py-12 text-center bg-[#111111] border-t border-gray-800">
          <h3 className="text-white font-bold mb-6 text-xs uppercase tracking-widest">Síguenos</h3>
          <div className="flex justify-center gap-6">
            {socialLinks.map(s => (
              <a key={s.id} href={s.url} target="_blank" rel="noreferrer" className="hover:opacity-75 transition-opacity">
                <img 
                  src={`https://cdn.simpleicons.org/${s.platform.toLowerCase()}`} 
                  alt={s.platform} 
                  className="w-10 h-10 object-contain invert" 
                />
              </a>
            ))}
          </div>
        </section>
        </div>
      
      {/* Modales */}
      {selectedProp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in">
           <div className="bg-[#141414] border border-gray-800 w-full max-w-4xl rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl max-h-[95vh] flex flex-col md:flex-row relative">
              <button onClick={() => setSelectedProp(null)} className="absolute top-3 right-3 z-20 bg-black/60 hover:bg-black text-white w-8 h-8 rounded-full flex items-center justify-center border border-gray-700 text-[10px] font-black cursor-pointer">✕</button>
              <div className="w-full md:w-1/2 bg-black p-4 flex flex-col">
                 <img src={activeImg} className="w-full h-64 md:h-80 object-contain rounded-xl mb-4" />
                 <div className="grid grid-cols-3 gap-2 h-16">
                    {[selectedProp.image_url, selectedProp.image_url_2, selectedProp.image_url_3].filter(Boolean).map((img, i) => (
                      <button key={i} onClick={() => setActiveImg(img!)} className={`rounded-lg overflow-hidden border-2 cursor-pointer ${activeImg === img ? 'border-yellow-500' : 'border-transparent'}`}>
                        <img src={img!} className="w-full h-full object-cover" />
                      </button>
                    ))}
                 </div>
              </div>
              <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
                 <div>
                    <h2 className="text-2xl font-black text-white mb-2">{selectedProp.title}</h2>
                    <p className="text-gray-400 text-sm mb-6">{selectedProp.description || 'Detalles de la propiedad...'}</p>
                    <div className="bg-[#1a1a1a] p-4 rounded-xl mb-6 space-y-2">
                       <p className="text-gray-400 text-sm">Medidas: <span className="text-white font-bold">{selectedProp.size}</span></p>
                       <p className="text-gray-400 text-sm">Precio: <span className="text-[#D4AF37] font-bold">{selectedProp.price}</span></p>
                    </div>
                 </div>
                 <div className="space-y-3 mt-4">
                    <button onClick={() => requestAction('Ubicación', selectedProp)} className={btnClass}>📍 Ver Ubicación</button>
                    <button onClick={() => requestAction('PDF', selectedProp)} className={btnClass}>📄 Brochure PDF</button>
                    <button onClick={() => requestAction('WhatsApp', selectedProp)} className={btnClass}>💬 WhatsApp</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {leadModal.isOpen && leadModal.prop && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-[#1a1a1a] border border-gray-800 max-w-sm w-full p-6 rounded-2xl shadow-2xl relative">
               
               {/* BOTÓN DE CERRAR (LA "X") */}
               <button 
                  onClick={() => setLeadModal({ isOpen: false, action: 'WhatsApp', prop: null })} 
                  className="absolute top-4 right-4 text-gray-500 hover:text-white text-sm font-black cursor-pointer transition-colors"
               >
                  ✕
               </button>

               <h3 className="text-white font-bold mb-4">Ingresa tu nombre y número de telefono para continuar</h3>
               <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <input type="text" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} required className="w-full bg-[#111111] p-3 rounded-xl border border-gray-800 text-white focus:border-[#D4AF37] outline-none transition-all" />
                  <input type="tel" placeholder="Teléfono" value={telefono} onChange={e => setTelefono(e.target.value)} required className="w-full bg-[#111111] p-3 rounded-xl border border-gray-800 text-white focus:border-[#D4AF37] outline-none transition-all" />
                  <button type="submit" className={btnClass}>Continuar</button>
               </form>
            </div>
          </div>
      )}
   </main>
   );
 }
 