'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Credenciales de tu proyecto Supabase
const supabaseUrl = 'https://jovcdrplavvsfxrgaqle.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdmNkcnBsYXZ2c2Z4cmdhcWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyOTEwNzksImV4cCI6MjA5Njg2NzA3OX0.cx1r9JtzBXkySrN73DMoZl7bg1cyMH-NzP3H09QVH1s';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const whatsappNumber = '50245413470';

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

export default function CatalogPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Ficha técnica (Modal)
  const [selectedProp, setSelectedProp] = useState<Property | null>(null);
  const [activeImg, setActiveImg] = useState<string>('');

  // Captura de datos (Leads One-Tap)
  const [leadModal, setLeadModal] = useState<{ isOpen: boolean; action: 'WhatsApp' | 'PDF' | 'Ubicación'; prop: Property | null }>({ isOpen: false, action: 'WhatsApp', prop: null });
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('properties').select('*').order('id', { ascending: false });
      setProperties(data || []);
      setLoading(false);
      
      if (localStorage.getItem('admin_active_session') === 'true') {
        setIsAdmin(true);
      }

      // Recuperar datos si ya están en memoria local
      if (typeof window !== 'undefined') {
        const savedName = localStorage.getItem('lead_name');
        const savedPhone = localStorage.getItem('lead_phone');
        if (savedName) setNombre(savedName);
        if (savedPhone) setTelefono(savedPhone);
      }
    };
    load();
  }, []);

  const openFicha = (prop: Property) => {
    setSelectedProp(prop);
    setActiveImg(prop.image_url);
  };

  const saveLeadSupabase = async (propTitle: string, action: string) => {
    if (isAdmin) return;
    await supabase.from('clientes').insert([
      {
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        terreno_interes: propTitle,
        tipo_accion: action,
        estado: 'Pendiente'
      }
    ]);
  };

  // Procesamiento inteligente de acciones
  const processAction = async (action: 'WhatsApp' | 'PDF' | 'Ubicación', prop: Property) => {
    // Registramos en segundo plano
    await saveLeadRecordAndRemember(prop.title, action);

    if (action === 'PDF' && prop.pdf_url) {
      window.open(prop.pdf_url, '_blank');
    } else if (action === 'WhatsApp') {
      const mensajeWpp = `Hola, me interesa el terreno: ${prop.title} (${prop.price}). Mi nombre es ${nombre}.`;
      window.open(`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(mensajeWpp)}`, '_blank');
    } else if (action === 'Ubicación' && prop.location_url) {
      window.open(prop.location_url, '_blank');
    }
    
    // Cierra modal de ficha al completar interacción externa
    setLeadModal({ isOpen: false, action: 'WhatsApp', prop: null });
    setSelectedProp(null);
  };

  const saveLeadRecordAndRemember = async (propTitle: string, action: 'WhatsApp' | 'PDF' | 'Ubicación') => {
    if (isAdmin) return;
    if (nombre && telefono) {
      localStorage.setItem('lead_name', nombre);
      localStorage.setItem('lead_phone', telefono);
      await saveLeadSupabase(propTitle, action);
    }
  };

  const requestAction = (action: 'WhatsApp' | 'PDF' | 'Ubicación', prop: Property) => {
    // Si es Admin o si el usuario ya dejó sus datos en el localStorage, pasa directo
    if (isAdmin || (localStorage.getItem('lead_name') && localStorage.getItem('lead_phone'))) {
      processAction(action, prop);
    } else {
      // Primera vez: requiere llenar datos
      setLeadModal({ isOpen: true, action, prop });
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadModal.prop) return;
    setSubmitting(true);

    // Guardamos en localStorage y enviamos a bd
    localStorage.setItem('lead_name', nombre);
    localStorage.setItem('lead_phone', telefono);
    await saveLeadSupabase(leadModal.prop.title, leadModal.action);

    setSubmitting(false);

    // Ejecutamos acción
    processAction(leadModal.action, leadModal.prop);
  };

  return (
    <main className="min-h-screen bg-[#121212] text-gray-200 antialiased relative overflow-x-hidden w-full">
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <img src="/logo.png" alt="" className="w-[70%] max-w-[800px] object-contain grayscale" />
      </div>

      <div className="relative z-10 w-full">
        {/* Header estático responsivo */}
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
              {isAdmin && (
                <a href="/admin" className="text-[8px] md:text-[10px] font-extrabold uppercase text-black bg-[#D4AF37] px-2.5 py-1.5 rounded-xl">Admin</a>
              )}
            </div>
          </div>
        </header>

        {/* Título de sección */}
        <section className="px-3 pt-8 md:pt-16 pb-6 text-center w-full max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight mb-2 text-white font-serif">Catálogo de Propiedades</h1>
          <p className="text-gray-500 text-[10px] md:text-xs font-light tracking-wide max-w-sm md:max-w-none mx-auto">Presiona "Ver Terreno" para ver la Ficha Técnica, galería de fotos, ubicación y solicitar información.</p>
        </section>

        {/* Cuadrícula de propiedades (Aspecto limpio) */}
        <section className="w-full max-w-6xl mx-auto px-3 pb-24">
          {loading ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-t-yellow-500 border-2 rounded-full animate-spin"></div></div>
          ) : properties.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-10">No hay terrenos disponibles en este momento.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {properties.map((prop) => (
                <div key={prop.id} className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-gray-800 flex flex-col shadow-xl w-full">
                  <div className="h-48 sm:h-56 relative overflow-hidden">
                    <img src={prop.image_url} alt={prop.title} className="w-full h-full object-cover" />
                    <span className={`absolute top-3 right-3 text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider ${prop.status === 'Disponible' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : prop.status === 'Reservado' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>{prop.status}</span>
                  </div>
                  <div className="p-4 md:p-5 flex flex-col flex-grow justify-between">
                    <div>
                      <h3 className="font-bold text-base md:text-lg text-gray-100 mb-1 truncate">{prop.title}</h3>
                      <p className="text-gray-400 text-[11px] mb-3 font-light tracking-wide">{prop.size}</p>
                    </div>
                    <div className="pt-3 border-t border-gray-800/60 flex items-center justify-between">
                      <span className="text-base md:text-lg font-black text-[#D4AF37] font-mono tracking-tight">{prop.price}</span>
                      <button onClick={() => openFicha(prop)} className="text-[9px] font-extrabold uppercase tracking-widest text-black bg-[#D4AF37] px-3.5 py-2 rounded-xl hover:brightness-110 transition-all border border-transparent cursor-pointer flex-shrink-0">Ver Terreno</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* MODAL DE FICHA TÉCNICA (Despliegue de botones internos) */}
      {selectedProp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#141414] border border-gray-800 w-full max-w-4xl rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl max-h-[95vh] flex flex-col md:flex-row relative">
            <button onClick={() => setSelectedProp(null)} className="absolute top-3 right-3 z-20 bg-black/60 hover:bg-black text-white w-8 h-8 rounded-full flex items-center justify-center border border-gray-700 text-[10px] font-black cursor-pointer">✕</button>

            <div className="w-full md:w-1/2 bg-black flex flex-col justify-between p-3 border-b md:border-b-0 md:border-r border-gray-800 flex-shrink-0">
              <div className="h-[200px] sm:h-[240px] md:h-[350px] w-full rounded-xl overflow-hidden mb-2 bg-[#1a1a1a]">
                <img src={activeImg} alt="Vista ampliada" className="w-full h-full object-contain" />
              </div>
              <div className="grid grid-cols-3 gap-2 h-12 sm:h-14 md:h-20 flex-shrink-0">
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

            <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[48vh] md:max-h-[95vh]">
              <div>
                <span className={`text-[8px] md:text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${selectedProp.status === 'Disponible' ? 'bg-green-500/10 text-green-400 border-green-500/20' : selectedProp.status === 'Reservado' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>{selectedProp.status}</span>
                <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white mt-2 mb-0.5 font-serif tracking-tight leading-snug break-words">{selectedProp.title}</h2>
                <p className="text-[9px] font-light text-gray-500 tracking-wide mb-3 uppercase">Ficha Técnica</p>
                
                <div className="space-y-2.5 bg-[#1a1a1a] p-3 rounded-xl border border-gray-800/80 mb-3">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-800">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Medidas</span>
                    <span className="text-[11px] font-semibold text-white tracking-wide">{selectedProp.size}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Precio</span>
                    <span className="text-base font-extrabold text-[#D4AF37] font-mono tracking-tight">{selectedProp.price}</span>
                  </div>
                </div>

                <p className="text-[11px] text-gray-300 font-light leading-relaxed mb-3">
                  {selectedProp.description || 'Lote de terreno urbanizado de alta plusvalía, ideal para construcción de vivienda o casa de descanso / chalet en la costa sur. Cuenta con excelente ubicación y accesibilidad.'}
                </p>
              </div>

              <div className="space-y-2.5 mt-auto pt-2 flex-shrink-0">
                {selectedProp.location_url && (
                  <button onClick={() => processAction('Ubicación', selectedProp)} className="w-full bg-gray-800 border border-gray-700 text-white font-extrabold text-[10px] py-3 rounded-xl shadow-lg hover:bg-gray-700 transition-all tracking-wider uppercase cursor-pointer flex items-center justify-center gap-1.5">
                    <span className="text-base">📍</span> Ver Ubicación
                  </button>
                )}
                {selectedProp.pdf_url && (
                  <button onClick={() => requestAction('PDF', selectedProp)} className="w-full bg-white text-black font-extrabold text-[10px] py-3 rounded-xl border border-gray-700 shadow-lg hover:bg-gray-200 transition-all tracking-wider uppercase cursor-pointer flex items-center justify-center gap-1.5">
                    <span className="text-base">📄</span> Descargar Brochure en PDF
                  </button>
                )}
                <button onClick={() => requestAction('WhatsApp', selectedProp)} className="w-full bg-emerald-600 text-white font-extrabold text-[10px] py-3 rounded-xl shadow-lg hover:bg-emerald-500 transition-all tracking-wider uppercase cursor-pointer flex items-center justify-center gap-1.5">
                  <span className="text-base">💬</span> Cotizar por WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RÁPIDO DE CAPTURA DE DATOS (LEADS ONE-TAP) */}
      {leadModal.isOpen && leadModal.prop && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#1a1a1a] border border-gray-800 max-w-md w-full p-6 rounded-2xl shadow-2xl relative">
            <button onClick={() => setLeadModal({ isOpen: false, action: 'WhatsApp', prop: null })} className="absolute top-4 right-4 text-gray-400 hover:text-white text-xs font-black cursor-pointer">✕</button>
            
            <div className="text-center mb-5">
              <h3 className="text-sm font-extrabold text-white mb-1 font-serif tracking-tight">¡Último paso!</h3>
              <p className="text-gray-400 text-[10px] leading-relaxed">Ingresa tus datos de contacto para acceder de inmediato al sistema. Solo los pides una vez: <strong className="text-yellow-500">{leadModal.prop.title}</strong></p>
            </div>

            <form onSubmit={handleLeadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Nombre Completo</label>
                <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} required className="w-full bg-[#111111] border border-gray-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-yellow-500" />
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Teléfono / WhatsApp</label>
                <input type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} required placeholder="Ej. 502 0000 0000" className="w-full bg-[#111111] border border-gray-800 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-yellow-500" />
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-black font-black py-3.5 rounded-xl shadow-lg hover:brightness-110 transition-all uppercase tracking-wider text-xs cursor-pointer disabled:opacity-70">
                {submitting ? 'Procesando...' : leadModal.action === 'PDF' ? 'Descargar PDF' : leadModal.action === 'Ubicación' ? 'Ver Ubicación' : 'Continuar a WhatsApp'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}