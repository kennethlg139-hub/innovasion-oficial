'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jovcdrplavvsfxrgaqle.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvdmNkcnBsYXZ2c2Z4cmdhcWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyOTEwNzksImV4cCI6MjA5Njg2NzA3OX0.cx1r9JtzBXkySrN73DMoZl7bg1cyMH-NzP3H09QVH1s';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Cliente = {
  id: number;
  nombre: string;
  telefono: string;
  terreno_interes: string;
  tipo_accion: string;
  estado: string;
  created_at: string;
};

type Property = {
  id: number;
  title: string;
  description?: string;
  size: string;
  price: string;
  status: string;
  image_url: string;
  image_url_2?: string;
  image_url_3?: string;
  image_url_4?: string;
  image_url_5?: string;
  image_url_6?: string;
  image_url_7?: string;
  image_url_8?: string;
  image_url_9?: string;
  image_url_10?: string;
  pdf_url?: string;
  location_url?: string;
};

type SocialLink = {
  id: number;
  platform: string;
  url: string;
};

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'properties' | 'clients' | 'social'>('properties');
  
  // Propiedades
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProps, setLoadingProps] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProp, setEditingProp] = useState<Property | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Form state propiedades
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [size, setSize] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('Disponible');
  const [locationUrl, setLocationUrl] = useState('');
  
  // MOTOR DE IMÁGENES SIMPLIFICADO: Un solo arreglo mezcla URLs existentes y Archivos nuevos
  const [images, setImages] = useState<(File | string)[]>([]);
  
  // PDF
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState('');

  // Clientes
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>('Todos');

  // Redes Sociales
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [newPlatform, setNewPlatform] = useState('');
  const [newUrl, setNewUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('admin_active_session') !== 'true') {
      window.location.href = '/login';
      return;
    }
    setIsAdmin(true);
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoadingProps(true);
    const { data } = await supabase.from('properties').select('*').order('id', { ascending: false });
    setProperties(data || []);
    setLoadingProps(false);
  };

  const loadSocialLinks = async () => {
    const { data } = await supabase.from('social_links').select('*');
    setSocialLinks(data || []);
  };

  const handleSaveSocial = async () => {
    if (!newPlatform || !newUrl) return;
    await supabase.from('social_links').insert([{ platform: newPlatform, url: newUrl }]);
    setNewPlatform('');
    setNewUrl('');
    loadSocialLinks();
  };

  const handleDeleteSocial = async (id: number) => {
    await supabase.from('social_links').delete().eq('id', id);
    loadSocialLinks();
  };

  const uploadFile = async (file: File | null, oldUrl: string) => {
    if (!file) return oldUrl;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage.from('properties').upload(filePath, file);
    if (error) throw new Error('Error al subir archivo: ' + error.message);

    const { data } = supabase.storage.from('properties').getPublicUrl(filePath);
    return data.publicUrl;
  };

  // MANEJADOR MULTI-IMAGEN
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (images.length + newFiles.length > 10) {
        alert('Solo puedes subir un máximo de 10 fotos por terreno.');
        return;
      }
      setImages([...images, ...newFiles]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price) {
      alert('Completa al menos el título y el precio.');
      return;
    }

    setUploading(true);
    try {
      // 1. Procesar todas las imágenes en el arreglo
      const finalUrls: string[] = [];
      for (let i = 0; i < 10; i++) {
        const item = images[i];
        if (item instanceof File) {
          // Si es un archivo nuevo, lo sube y guarda la URL
          const url = await uploadFile(item, '');
          finalUrls.push(url);
        } else if (typeof item === 'string') {
          // Si ya era un string (URL existente que no se borró), lo mantiene
          finalUrls.push(item);
        } else {
          // Si no hay foto para este espacio, manda vacío
          finalUrls.push('');
        }
      }

      // 2. Procesar el PDF
      const finalPdfUrl = await uploadFile(pdfFile, pdfUrl);

      // 3. Empaquetar todo para Supabase
      const propData = {
        title,
        description,
        size,
        price,
        status,
        image_url: finalUrls[0] || 'https://via.placeholder.com/400',
        image_url_2: finalUrls[1] || null,
        image_url_3: finalUrls[2] || null,
        image_url_4: finalUrls[3] || null,
        image_url_5: finalUrls[4] || null,
        image_url_6: finalUrls[5] || null,
        image_url_7: finalUrls[6] || null,
        image_url_8: finalUrls[7] || null,
        image_url_9: finalUrls[8] || null,
        image_url_10: finalUrls[9] || null,
        pdf_url: finalPdfUrl,
        location_url: locationUrl,
      };

      if (editingProp) {
        const { error } = await supabase.from('properties').update(propData).eq('id', editingProp.id);
        if (error) throw error;
        alert('Terreno actualizado correctamente.');
      } else {
        const { error } = await supabase.from('properties').insert([propData]);
        if (error) throw error;
        alert('Terreno agregado correctamente.');
      }

      setShowAddForm(false);
      setEditingProp(null);
      resetForm();
      loadProperties();
    } catch (err: any) {
      alert('Ocurrió un error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEditClick = (prop: Property) => {
    setEditingProp(prop);
    setTitle(prop.title);
    setDescription(prop.description || '');
    setSize(prop.size);
    setPrice(prop.price);
    setStatus(prop.status);
    setLocationUrl(prop.location_url || '');
    
    // Recopilar todas las URLs que existan en la BD para este terreno y ponerlas en el arreglo
    const existingUrls = [
      prop.image_url, prop.image_url_2, prop.image_url_3, prop.image_url_4, prop.image_url_5,
      prop.image_url_6, prop.image_url_7, prop.image_url_8, prop.image_url_9, prop.image_url_10
    ].filter(Boolean) as string[];
    
    setImages(existingUrls);
    
    setPdfUrl(prop.pdf_url || '');
    setPdfFile(null);
    setShowAddForm(true);
  };

  const handleDeleteProperty = async (id: number) => {
    if (!confirm('¿Eliminar este terreno permanentemente?')) return;
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) alert('Error al eliminar: ' + error.message);
    else loadProperties();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSize('');
    setPrice('');
    setStatus('Disponible');
    setLocationUrl('');
    setImages([]);
    setPdfUrl('');
    setPdfFile(null);
  };

  const loadClientes = async () => {
    setLoadingClients(true);
    const { data } = await supabase.from('clientes').select('*').order('id', { ascending: false });
    setClientes(data || []);
    setLoadingClients(false);
  };

  const handleUpdateEstado = async (id: number, nuevoEstado: string) => {
    const { error } = await supabase.from('clientes').update({ estado: nuevoEstado }).eq('id', id);
    if (error) {
      alert('Error al actualizar estado en Supabase: ' + error.message);
    } else {
      setClientes(clientes.map(c => c.id === id ? { ...c, estado: nuevoEstado } : c));
    }
  };

  const handleDeleteCliente = async (id: number) => {
    if (!confirm('¿Estás seguro de borrar este prospecto? Esta acción es permanente.')) return;
    const { error } = await supabase.from('clientes').delete().eq('id', id);
    if (error) alert('Error al eliminar: ' + error.message);
    else setClientes(clientes.filter(c => c.id !== id));
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_active_session');
    window.location.href = '/';
  };

  const switchTab = (tab: 'properties' | 'clients' | 'social') => {
    setActiveTab(tab);
    if (tab === 'clients') loadClientes();
    if (tab === 'social') loadSocialLinks();
  };

  const clientesFiltrados = filtroEstado === 'Todos' ? clientes : clientes.filter(c => c.estado === filtroEstado);

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#121212] text-gray-200 antialiased relative w-full p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-5 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white font-serif tracking-tight">Panel de Administración</h1>
            <p className="text-gray-400 text-[10px] mt-0.5 uppercase tracking-wider">Innovasión — Bienes Raíces</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <a href="/catalogo" className="text-[10px] font-extrabold uppercase bg-gray-800 text-gray-300 px-4 py-2.5 rounded-xl border border-gray-700">Ir al Catálogo</a>
            <button onClick={handleLogout} className="text-[10px] font-extrabold uppercase bg-red-950/20 text-red-400 border border-red-500/20 px-4 py-2.5 rounded-xl cursor-pointer">Cerrar Sesión</button>
          </div>
        </div>

        <div className="flex gap-2 border-b border-gray-800 mb-6">
          <button 
            onClick={() => switchTab('properties')} 
            className={`text-[10px] font-extrabold uppercase tracking-widest px-5 py-3 cursor-pointer border-b-2 transition-all ${activeTab === 'properties' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
            📦 Gestionar Terrenos
          </button>
          <button 
            onClick={() => switchTab('clients')} 
            className={`text-[10px] font-extrabold uppercase tracking-widest px-5 py-3 cursor-pointer border-b-2 transition-all ${activeTab === 'clients' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
            👥 Clientes / Prospectos
          </button>
          <button 
            onClick={() => switchTab('social')} 
            className={`text-[10px] font-extrabold uppercase tracking-widest px-5 py-3 cursor-pointer border-b-2 transition-all ${activeTab === 'social' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
            🔗 Redes Sociales
          </button>
        </div>

        {activeTab === 'social' && (
          <div className="bg-[#1a1a1a] border border-gray-800 p-6 rounded-2xl mb-6">
            <h2 className="text-sm font-bold text-white mb-4">Gestionar Enlaces de Redes Sociales</h2>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <input placeholder="Plataforma (ej. Facebook)" value={newPlatform} onChange={e => setNewPlatform(e.target.value)} className="bg-[#111111] border border-gray-700 p-3 rounded-xl text-xs w-full" />
              <input placeholder="URL completa" value={newUrl} onChange={e => setNewUrl(e.target.value)} className="bg-[#111111] border border-gray-700 p-3 rounded-xl text-xs w-full" />
              <button onClick={handleSaveSocial} className="bg-[#D4AF37] text-black font-extrabold uppercase tracking-wider px-6 py-3 rounded-xl cursor-pointer hover:brightness-110 text-xs">
                Guardar
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {socialLinks.map(s => (
                <div key={s.id} className="bg-[#111111] p-4 rounded-xl border border-gray-800 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-[#D4AF37]">{s.platform}</p>
                    <p className="text-[9px] text-gray-400 truncate">{s.url}</p>
                  </div>
                  <button onClick={() => handleDeleteSocial(s.id)} className="text-[10px] text-red-400 font-bold ml-4">Borrar</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'properties' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-white font-serif">Tus Terrenos Publicados</h2>
              <button 
                onClick={() => { setEditingProp(null); resetForm(); setShowAddForm(!showAddForm); }}
                className="text-[10px] font-extrabold uppercase tracking-wider bg-[#D4AF37] text-black px-4 py-2 rounded-xl cursor-pointer hover:brightness-110"
              >
                {showAddForm ? 'Cancelar' : '+ Agregar Terreno'}
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleSaveProperty} className="bg-[#1a1a1a] border border-gray-800 p-5 rounded-2xl mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="col-span-full">
                  <h3 className="font-bold text-white mb-3 border-b border-gray-800 pb-2">{editingProp ? 'Editar Terreno' : 'Nuevo Terreno'}</h3>
                </div>
                <div>
                  <label className="block text-gray-400 uppercase tracking-wider text-[9px] mb-1 font-bold">Título / Proyecto</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej. Lote Aldea Magueyes 2" className="w-full bg-[#111111] border border-gray-700 p-2.5 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]" />
                </div>
                <div>
                  <label className="block text-gray-400 uppercase tracking-wider text-[9px] mb-1 font-bold">Medidas (Metros)</label>
                  <input type="text" value={size} onChange={e => setSize(e.target.value)} placeholder="Ej. 12 x 20 m" className="w-full bg-[#111111] border border-gray-700 p-2.5 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]" />
                </div>
                <div>
                  <label className="block text-gray-400 uppercase tracking-wider text-[9px] mb-1 font-bold">Precio</label>
                  <input type="text" value={price} onChange={e => setPrice(e.target.value)} placeholder="Ej. Q. 125,000" className="w-full bg-[#111111] border border-gray-700 p-2.5 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]" />
                </div>
                <div>
                  <label className="block text-gray-400 uppercase tracking-wider text-[9px] mb-1 font-bold">Estado</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-[#111111] border border-gray-700 p-2.5 rounded-xl text-white focus:outline-none focus:border-[#D4AF37] cursor-pointer">
                    <option value="Disponible">Disponible</option>
                    <option value="Reservado">Reservado</option>
                    <option value="Vendido">Vendido</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-400 uppercase tracking-wider text-[9px] mb-1 font-bold">Descripción del Terreno</label>
                  <textarea 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    rows={3}
                    placeholder="Ej. Hermoso terreno plano, listo para construir, cuenta con servicios básicos cercanos..." 
                    className="w-full bg-[#111111] border border-gray-700 p-2.5 rounded-xl text-white focus:outline-none focus:border-[#D4AF37] resize-none" 
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-gray-400 uppercase tracking-wider text-[9px] mb-1 font-bold">Enlace de Ubicación (Google Maps o Waze)</label>
                  <input type="text" value={locationUrl} onChange={e => setLocationUrl(e.target.value)} placeholder="Ej. https://maps.app.goo.gl/..." className="w-full bg-[#111111] border border-gray-700 p-2.5 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]" />
                </div>

                {/* NUEVO DISEÑO DE GALERÍA: Simplificado y elegante */}
                <div className="md:col-span-2 border-t border-gray-800 pt-4 mt-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="block text-gray-400 uppercase tracking-wider text-[9px] font-bold">Galería de Imágenes</span>
                    <span className="text-[9px] text-gray-500 font-bold">{images.length} / 10 Fotos</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {/* Renderizar miniaturas de imágenes seleccionadas/existentes */}
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-gray-700 group">
                        <img 
                          src={typeof img === 'string' ? img : URL.createObjectURL(img)} 
                          className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                          alt={`Preview ${idx + 1}`}
                        />
                        <button 
                          type="button" 
                          onClick={() => removeImage(idx)} 
                          className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {/* Botón de "Agregar" que desaparece si llegas a 10 */}
                    {images.length < 10 && (
                      <label className="flex flex-col items-center justify-center border border-dashed border-gray-700 bg-[#111111] w-20 h-20 sm:w-24 sm:h-24 rounded-xl cursor-pointer hover:border-[#D4AF37] transition-colors">
                        <span className="text-2xl text-gray-500 mb-1">+</span>
                        <span className="text-[8px] text-gray-500 font-bold uppercase">Subir Fotos</span>
                        <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 border-t border-gray-800 pt-4 mt-2">
                  <span className="block text-gray-400 uppercase tracking-wider text-[9px] mb-2 font-bold">Archivo Brochure (PDF)</span>
                  <label className="flex items-center justify-center gap-2 border border-dashed border-gray-700 bg-[#111111] h-16 rounded-xl cursor-pointer hover:border-gray-500 px-4">
                    <span className="text-base text-gray-500">📄</span>
                    <span className="text-[10px] text-gray-300 font-semibold">{pdfFile || pdfUrl ? 'PDF seleccionado' : 'Seleccionar archivo PDF'}</span>
                    <input type="file" accept="application/pdf" onChange={e => e.target.files?.[0] && setPdfFile(e.target.files[0])} className="hidden" />
                  </label>
                </div>

                <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                  <button type="submit" disabled={uploading} className="bg-[#D4AF37] text-black font-extrabold uppercase tracking-wider px-6 py-3 rounded-xl cursor-pointer hover:brightness-110 text-xs disabled:opacity-50">
                    {uploading ? 'Subiendo...' : (editingProp ? 'Guardar Cambios' : 'Crear Publicación')}
                  </button>
                </div>
              </form>
            )}

            {loadingProps ? (
              <p className="text-xs text-gray-500 py-10 text-center">Cargando propiedades...</p>
            ) : properties.length === 0 ? (
              <p className="text-xs text-gray-500 py-10 text-center">No hay terrenos publicados.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties.map((p: Property) => (
                  <div key={p.id} className="bg-[#1a1a1a] border border-gray-800 p-4 rounded-xl flex flex-col justify-between gap-3">
                    <div className="flex gap-3 items-start">
                      <img src={p.image_url || 'https://via.placeholder.com/150'} alt="" className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-white truncate">{p.title}</h4>
                        <p className="text-[9px] text-gray-400 mt-0.5">{p.size}</p>
                        <p className="text-[10px] font-black text-yellow-500 mt-1 font-mono">{p.price}</p>
                        <span className={`inline-block mt-1 text-[8px] font-extrabold uppercase px-2 py-0.5 rounded ${p.status === 'Vendido' ? 'bg-red-950 text-red-300' : 'bg-green-950 text-green-300'}`}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 border-t border-gray-800/60 pt-2.5 justify-end text-[9px]">
                      <button onClick={() => handleEditClick(p)} className="bg-gray-800 text-gray-300 font-bold px-3 py-1.5 rounded-lg cursor-pointer hover:bg-gray-700">Editar</button>
                      <button onClick={() => handleDeleteProperty(p.id)} className="bg-red-950 border border-red-500/20 text-red-400 font-bold px-3 py-1.5 rounded-lg cursor-pointer hover:bg-red-900">Borrar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'clients' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h2 className="text-sm font-bold text-white font-serif">Lista de Prospectos (Leads)</h2>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">Filtrar Estado:</span>
                  <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="bg-[#111111] border border-gray-800 text-[10px] text-white px-3 py-1.5 rounded-xl focus:outline-none cursor-pointer">
                    <option value="Todos">Todos</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Contactado">Contactado</option>
                    <option value="Cerrado">Cerrado</option>
                  </select>
                </div>
                <button onClick={loadClientes} className="text-[9px] font-bold uppercase tracking-wider bg-gray-800 text-gray-300 px-3 py-2 rounded-xl cursor-pointer hover:bg-gray-700">Actualizar</button>
              </div>
            </div>
            
            {loadingClients ? (
              <p className="text-xs text-gray-500 py-10 text-center">Cargando prospectos...</p>
            ) : clientes.length === 0 ? (
              <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-10 text-center">
                <p className="text-xs text-gray-500">Aún no hay clientes registrados.</p>
              </div>
            ) : (
              <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-black/40 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-800">
                        <th className="p-3.5">Fecha</th>
                        <th className="p-3.5">Nombre</th>
                        <th className="p-3.5">Teléfono</th>
                        <th className="p-3.5">Interés</th>
                        <th className="p-3.5">Acción</th>
                        <th className="p-3.5 text-center">Estado</th>
                        <th className="p-3.5 text-center">Borrar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50 text-white font-light">
                      {clientesFiltrados.map(c => {
                        const cleanedPhone = c.telefono.replace(/\D/g, '');
                        const formattedPhone = cleanedPhone.length === 8 ? `502${cleanedPhone}` : cleanedPhone;
                        return (
                          <tr key={c.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-3.5 text-gray-400 font-mono">{new Date(c.created_at).toLocaleDateString()}</td>
                            <td className="p-3.5 font-semibold">{c.nombre}</td>
                            <td className="p-3.5 font-medium text-yellow-400 font-mono">{c.telefono}</td>
                            <td className="p-3.5 truncate max-w-xs">{c.terreno_interes}</td>
                            <td className="p-3.5">
                              <a href={`https://wa.me/${formattedPhone}`} target="_blank" rel="noopener noreferrer" className="bg-emerald-600 px-3 py-1.5 rounded-xl text-white font-bold uppercase">Wpp</a>
                            </td>
                            <td className="p-3.5 text-center">
                              <select value={c.estado || 'Pendiente'} onChange={e => handleUpdateEstado(c.id, e.target.value)} className="bg-[#111111] text-[9px] p-1 rounded border border-gray-700">
                                <option value="Pendiente">Pendiente</option>
                                <option value="Contactado">Contactado</option>
                                <option value="Cerrado">Cerrado</option>
                              </select>
                            </td>
                            <td className="p-3.5 text-center">
                              <button onClick={() => handleDeleteCliente(c.id)} className="text-red-400">X</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}