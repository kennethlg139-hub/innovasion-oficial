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
  size: string;
  price: string;
  status: string;
  image_url: string;
  image_url_2?: string;
  image_url_3?: string;
  pdf_url?: string;
  location_url?: string;
};

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'properties' | 'clients'>('properties');
  
  // Propiedades
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProps, setLoadingProps] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProp, setEditingProp] = useState<Property | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Form state propiedades
  const [title, setTitle] = useState('');
  const [size, setSize] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('Disponible');
  const [locationUrl, setLocationUrl] = useState('');
  
  // Archivos seleccionados
  const [img1, setImg1] = useState<File | null>(null);
  const [img2, setImg2] = useState<File | null>(null);
  const [img3, setImg3] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // URLs actuales (para edición)
  const [url1, setUrl1] = useState('');
  const [url2, setUrl2] = useState('');
  const [url3, setUrl3] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');

  // Clientes
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>('Todos');

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

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price) {
      alert('Completa al menos el título y el precio.');
      return;
    }

    setUploading(true);
    try {
      const finalUrl1 = await uploadFile(img1, url1);
      const finalUrl2 = await uploadFile(img2, url2);
      const finalUrl3 = await uploadFile(img3, url3);
      const finalPdfUrl = await uploadFile(pdfFile, pdfUrl);

      const propData = {
        title,
        size,
        price,
        status,
        image_url: finalUrl1 || 'https://via.placeholder.com/400',
        image_url_2: finalUrl2,
        image_url_3: finalUrl3,
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
    setSize(prop.size);
    setPrice(prop.price);
    setStatus(prop.status);
    setLocationUrl(prop.location_url || '');
    
    setUrl1(prop.image_url || '');
    setUrl2(prop.image_url_2 || '');
    setUrl3(prop.image_url_3 || '');
    setPdfUrl(prop.pdf_url || '');

    setImg1(null);
    setImg2(null);
    setImg3(null);
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
    setSize('');
    setPrice('');
    setStatus('Disponible');
    setLocationUrl('');
    setUrl1('');
    setUrl2('');
    setUrl3('');
    setPdfUrl('');
    setImg1(null);
    setImg2(null);
    setImg3(null);
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
      alert('Error al actualizar estado: ' + error.message);
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

  const switchTab = (tab: 'properties' | 'clients') => {
    setActiveTab(tab);
    if (tab === 'clients') loadClientes();
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
        </div>

        {activeTab === 'properties' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-white font-serif">Tus Terrenos Publicados</h2>
              <button 
                onClick={() => { 
                  setEditingProp(null); 
                  resetForm(); 
                  setShowAddForm(!showAddForm); 
                }}
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
                  <label className="block text-gray-400 uppercase tracking-wider text-[9px] mb-1 font-bold">Enlace de Ubicación (Google Maps o Waze)</label>
                  <input type="text" value={locationUrl} onChange={e => setLocationUrl(e.target.value)} placeholder="Ej. https://maps.app.goo.gl/..." className="w-full bg-[#111111] border border-gray-700 p-2.5 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]" />
                </div>

                <div className="md:col-span-2 border-t border-gray-800 pt-4 mt-2">
                  <span className="block text-gray-400 uppercase tracking-wider text-[9px] mb-2 font-bold">Galería de Imágenes (Hasta 3 fotos)</span>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="flex flex-col items-center justify-center border border-dashed border-gray-700 bg-[#111111] h-24 rounded-xl cursor-pointer hover:border-gray-500">
                        {img1 || url1 ? (
                          <span className="text-[8px] text-green-400 font-bold">Foto 1 cargada</span>
                        ) : (
                          <>
                            <span className="text-xl text-gray-500">+</span>
                            <span className="text-[8px] text-gray-500 mt-1">Foto 1</span>
                          </>
                        )}
                        <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && setImg1(e.target.files[0])} className="hidden" />
                      </label>
                    </div>
                    <div>
                      <label className="flex flex-col items-center justify-center border border-dashed border-gray-700 bg-[#111111] h-24 rounded-xl cursor-pointer hover:border-gray-500">
                        {img2 || url2 ? (
                          <span className="text-[8px] text-green-400 font-bold">Foto 2 cargada</span>
                        ) : (
                          <>
                            <span className="text-xl text-gray-500">+</span>
                            <span className="text-[8px] text-gray-500 mt-1">Foto 2</span>
                          </>
                        )}
                        <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && setImg2(e.target.files[0])} className="hidden" />
                      </label>
                    </div>
                    <div>
                      <label className="flex flex-col items-center justify-center border border-dashed border-gray-700 bg-[#111111] h-24 rounded-xl cursor-pointer hover:border-gray-500">
                        {img3 || url3 ? (
                          <span className="text-[8px] text-green-400 font-bold">Foto 3 cargada</span>
                        ) : (
                          <>
                            <span className="text-xl text-gray-500">+</span>
                            <span className="text-[8px] text-gray-500 mt-1">Foto 3</span>
                          </>
                        )}
                        <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && setImg3(e.target.files[0])} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 border-t border-gray-800 pt-4 mt-2">
                  <span className="block text-gray-400 uppercase tracking-wider text-[9px] mb-2 font-bold">Archivo Brochure (PDF)</span>
                  <label className="flex items-center justify-center gap-2 border border-dashed border-gray-700 bg-[#111111] h-16 rounded-xl cursor-pointer hover:border-gray-500 px-4">
                    <span className="text-base text-gray-500">📄</span>
                    <span className="text-[10px] text-gray-300 font-semibold">
                      {pdfFile || pdfUrl ? 'PDF seleccionado' : 'Seleccionar archivo PDF desde tu dispositivo'}
                    </span>
                    <input type="file" accept="application/pdf" onChange={e => e.target.files?.[0] && setPdfFile(e.target.files[0])} className="hidden" />
                  </label>
                </div>

                <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                  <button type="submit" disabled={uploading} className="bg-[#D4AF37] text-black font-extrabold uppercase tracking-wider px-6 py-3 rounded-xl cursor-pointer hover:brightness-110 text-xs disabled:opacity-50">
                    {uploading ? 'Subiendo archivos y guardando...' : (editingProp ? 'Guardar Cambios' : 'Crear Publicación')}
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
                {properties.map(p => (
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
                  <select 
                    value={filtroEstado} 
                    onChange={e => setFiltroEstado(e.target.value)} 
                    className="bg-[#111111] border border-gray-800 text-[10px] text-white px-3 py-1.5 rounded-xl focus:outline-none cursor-pointer"
                  >
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
                <p className="text-xs text-gray-500">Aún no hay clientes registrados en la base de datos.</p>
              </div>
            ) : (
              <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-black/40 text-gray-400 font-bold uppercase tracking-wider border-b border-gray-800">
                        <th className="p-3.5">Fecha / Hora</th>
                        <th className="p-3.5">Nombre</th>
                        <th className="p-3.5">Teléfono / WhatsApp</th>
                        <th className="p-3.5">Interés (Terreno)</th>
                        <th className="p-3.5">Acción</th>
                        <th className="p-3.5 text-center">Estado</th>
                        <th className="p-3.5 text-center">Borrar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50 text-white font-light">
                      {clientesFiltrados.map(c => (
                        <tr key={c.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3.5 text-gray-400 font-mono whitespace-nowrap">
                            {new Date(c.created_at).toLocaleDateString()} {new Date(c.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </td>
                          <td className="p-3.5 font-semibold text-gray-200">{c.nombre}</td>
                          <td className="p-3.5 font-medium text-yellow-400 font-mono tracking-wide whitespace-nowrap">{c.telefono}</td>
                          <td className="p-3.5 text-gray-300 truncate max-w-xs">{c.terreno_interes}</td>
                          <td className="p-3.5 whitespace-nowrap">
                            <span className={`inline-block px-2.5 py-1 rounded-lg font-extrabold uppercase tracking-wider ${c.tipo_accion === 'PDF' ? 'bg-red-950/40 text-red-400 border border-red-500/20' : 'bg-green-950/40 text-green-400 border border-green-500/20'}`}>
                              {c.tipo_accion}
                            </span>
                          </td>
                          <td className="p-3.5 text-center whitespace-nowrap">
                            <select 
                              value={c.estado || 'Pendiente'} 
                              onChange={e => handleUpdateEstado(c.id, e.target.value)}
                              className={`font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border cursor-pointer focus:outline-none ${
                                c.estado === 'Contactado' ? 'bg-blue-950/30 border-blue-500/30 text-blue-300' : 
                                c.estado === 'Cerrado' ? 'bg-green-950/30 border-green-500/30 text-green-300' : 
                                'bg-yellow-950/30 border-yellow-500/30 text-yellow-300'
                              }`}
                            >
                              <option value="Pendiente">Pendiente</option>
                              <option value="Contactado">Contactado</option>
                              <option value="Cerrado">Cerrado</option>
                            </select>
                          </td>
                          <td className="p-3.5 text-center">
                            <button onClick={() => handleDeleteCliente(c.id)} className="text-red-400 font-bold bg-red-950/30 border border-red-500/20 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-red-950/50">X</button>
                          </td>
                        </tr>
                      ))}
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