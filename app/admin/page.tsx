'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jovcdrplavvsfxrgaqle.supabase.co';
const supabaseAnonKey = 'sb_publishable_LvLvFMyl2bI4TLezUnUXLg_kUsD0cou';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [editingProp, setEditingProp] = useState<Property | null>(null);

  const [title, setTitle] = useState('');
  const [size, setSize] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('Disponible');
  const [imageUrl, setImageUrl] = useState('');
  const [imageUrl2, setImageUrl2] = useState('');
  const [imageUrl3, setImageUrl3] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [description, setDescription] = useState('');
  
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (localStorage.getItem('admin_active_session') === 'true') {
      setIsLoggedIn(true);
      fetchProperties();
    }
  }, []);

  const fetchProperties = async () => {
    const { data } = await supabase.from('properties').select('*').order('id', { ascending: false });
    setProperties(data || []);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (username.trim().toLowerCase() === 'kennethlg139@gmail.com' && password.trim() === '2546') {
      setIsLoggedIn(true);
      localStorage.setItem('admin_active_session', 'true');
      fetchProperties();
    } else {
      setAuthError('Acceso denegado. Usuario o PIN incorrectos.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_active_session');
    setIsLoggedIn(false);
    window.location.href = '/login';
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'img1' | 'img2' | 'img3' | 'pdf') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(`Subiendo ${type === 'pdf' ? 'archivo PDF' : 'imagen'}...`);

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const bucketName = type === 'pdf' ? 'pdfs' : 'properties';

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file);

    if (uploadError) {
      console.error("Error en Supabase Storage:", uploadError);
      setMessage('Error al subir el archivo: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    if (type === 'img1') setImageUrl(publicUrl);
    if (type === 'img2') setImageUrl2(publicUrl);
    if (type === 'img3') setImageUrl3(publicUrl);
    if (type === 'pdf') setPdfUrl(publicUrl);

    setMessage('¡Archivo cargado exitosamente!');
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      setMessage('Por favor, sube al menos la primera imagen de la propiedad.');
      return;
    }

    setUploading(true);
    setMessage(editingProp ? 'Actualizando propiedad...' : 'Guardando propiedad...');

    const payload = { 
      title, 
      size, 
      price, 
      status, 
      image_url: imageUrl, 
      image_url_2: imageUrl2 || null, 
      image_url_3: imageUrl3 || null, 
      pdf_url: pdfUrl || null, 
      description 
    };

    if (editingProp) {
      const { error } = await supabase.from('properties').update(payload).eq('id', editingProp.id);
      if (error) setMessage('Error al actualizar: ' + error.message);
      else setMessage('¡Propiedad actualizada exitosamente!');
    } else {
      const { error } = await supabase.from('properties').insert([payload]);
      if (error) setMessage('Error al agregar: ' + error.message);
      else setMessage('¡Propiedad agregada exitosamente al catálogo!');
    }

    setUploading(false);
    resetForm();
    fetchProperties();
  };

  const handleEdit = (prop: Property) => {
    setEditingProp(prop);
    setTitle(prop.title);
    setSize(prop.size);
    setPrice(prop.price);
    setStatus(prop.status);
    setImageUrl(prop.image_url);
    setImageUrl2(prop.image_url_2 || '');
    setImageUrl3(prop.image_url_3 || '');
    setPdfUrl(prop.pdf_url || '');
    setDescription(prop.description || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este terreno? Esta acción no se puede deshacer.')) return;
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) alert('Error al eliminar: ' + error.message);
    else {
      alert('Terreno eliminado correctamente.');
      fetchProperties();
    }
  };

  const resetForm = () => {
    setEditingProp(null);
    setTitle('');
    setSize('');
    setPrice('');
    setStatus('Disponible');
    setImageUrl('');
    setImageUrl2('');
    setImageUrl3('');
    setPdfUrl('');
    setDescription('');
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-[#121212] flex items-center justify-center p-4 relative w-full overflow-x-hidden">
        <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
          <img src="/logo.png" alt="" className="w-[70%] max-w-[800px] object-contain grayscale" />
        </div>
        <div className="w-full max-w-md bg-[#1a1a1a] p-6 md:p-8 rounded-3xl border border-gray-800 shadow-2xl relative z-10">
          <div className="text-center mb-6">
            <h1 className="text-xl font-black text-white tracking-tight font-serif">Acceso Exclusivo Admin</h1>
            <p className="text-gray-400 text-xs mt-1 font-light">Ingresa tus credenciales.</p>
          </div>
          {authError && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300 text-center font-medium">{authError}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Usuario (Email)</label>
              <input type="email" value={username} onChange={e => setUsername(e.target.value)} required className="w-full bg-[#111111] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-500" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">PIN de Acceso</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-[#111111] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-500" />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-extrabold py-4 rounded-xl transition-all shadow-xl hover:brightness-110 mt-2 cursor-pointer">ACCEDER AL PANEL</button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#121212] text-gray-200 antialiased py-8 px-4 md:py-12 md:px-6 relative w-full overflow-x-hidden">
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <img src="/logo.png" alt="" className="w-[70%] max-w-[800px] object-contain grayscale" />
      </div>

      <div className="w-full max-w-3xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6 mb-8">
          <div>
            <h1 className="text-2xl font-black text-white font-serif">{editingProp ? 'Editar Propiedad' : 'Panel de Administración'}</h1>
            <p className="text-gray-400 text-xs mt-1 font-light">{editingProp ? 'Modifica los datos del terreno.' : 'Agrega, edita o elimina propiedades.'}</p>
          </div>
          <div className="flex items-center gap-3 self-end md:self-center">
            <a href="/catalogo" className="text-xs font-semibold uppercase text-gray-400 border border-gray-700 px-4 py-2 rounded-xl bg-[#1a1a1a]">Ver Catálogo</a>
            <button onClick={handleLogout} className="text-xs font-semibold uppercase text-red-400 border border-red-900 px-4 py-2 rounded-xl bg-red-950/20 cursor-pointer">Salir</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1a1a1a] p-6 md:p-8 rounded-3xl border border-gray-800 shadow-2xl space-y-6 mb-16">
          {message && <div className={`p-4 rounded-xl text-xs font-medium ${message.includes('Error') ? 'bg-red-500/10 border border-red-500/20 text-red-300' : 'bg-green-500/10 border border-green-500/20 text-green-300'}`}>{message}</div>}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Título de la Propiedad</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-[#111111] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Medidas</label>
              <input type="text" value={size} onChange={e => setSize(e.target.value)} required className="w-full bg-[#111111] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Precio</label>
              <input type="text" value={price} onChange={e => setPrice(e.target.value)} required className="w-full bg-[#111111] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
            </div>
          </div>

          <div className="space-y-4 border border-gray-800 p-4 md:p-5 rounded-2xl bg-black/20">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Galería de Imágenes (Hasta 3 fotos)</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['img1', 'img2', 'img3'].map((imgType, idx) => {
                const currentUrl = idx === 0 ? imageUrl : idx === 1 ? imageUrl2 : imageUrl3;
                return (
                  <div key={imgType} className="flex flex-col items-center justify-center border border-dashed border-gray-700 p-3 rounded-xl h-40 bg-[#111111]">
                    <label className="cursor-pointer text-[9px] font-extrabold uppercase tracking-wider text-black bg-[#D4AF37] px-4 py-2.5 rounded-xl hover:brightness-110 transition-all text-center">
                      {currentUrl ? 'Cambiar Foto' : `Subir Foto ${idx + 1}`}
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, imgType as any)} className="hidden" />
                    </label>
                    {currentUrl && <img src={currentUrl} alt="preview" className="w-20 h-20 object-cover mt-2 rounded-lg border border-gray-700" />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border border-gray-800 p-4 md:p-5 rounded-2xl bg-black/20">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Brochure / Archivo PDF</label>
            <div className="flex flex-wrap items-center gap-4">
              <label className="cursor-pointer bg-[#111111] border border-gray-800 text-white text-[10px] font-bold uppercase px-4 py-3 rounded-xl hover:border-yellow-500 transition-all">
                Seleccionar PDF
                <input type="file" accept="application/pdf" onChange={e => handleFileUpload(e, 'pdf')} className="hidden" />
              </label>
              {pdfUrl && <span className="text-[10px] text-green-400 font-semibold truncate max-w-[250px]">PDF Adjuntado Correctamente</span>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Descripción</label>
            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-[#111111] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Estado</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="w-full bg-[#111111] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white h-[46px]">
              <option value="Disponible">Disponible</option>
              <option value="Reservado">Reservado</option>
              <option value="Vendido">Vendido</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button type="submit" disabled={uploading} className="w-full sm:flex-grow bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-extrabold py-4 rounded-xl shadow-xl disabled:opacity-50 cursor-pointer tracking-wider uppercase text-xs">{editingProp ? 'ACTUALIZAR PROPIEDAD' : 'AGREGAR PROPIEDAD'}</button>
            {editingProp && <button type="button" onClick={resetForm} className="w-full sm:w-auto px-6 bg-gray-800 text-gray-300 text-xs font-bold uppercase rounded-xl hover:bg-gray-700 transition-all py-4 sm:py-0 cursor-pointer">Cancelar</button>}
          </div>
        </form>

        <h2 className="text-lg font-bold text-white mb-6 font-serif">Terrenos Publicados</h2>
        <div className="space-y-4">
          {properties.map(prop => (
            <div key={prop.id} className="bg-[#1a1a1a] border border-gray-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img src={prop.image_url} alt="" className="w-16 h-16 object-cover rounded-xl border border-gray-800 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-sm text-white truncate max-w-[180px] sm:max-w-none">{prop.title}</h3>
                  <p className="text-[10px] text-gray-400 font-light mt-0.5">{prop.size} • <span className="text-yellow-500 font-medium">{prop.price}</span></p>
                  <span className={`inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded-full mt-1.5 border ${prop.status === 'Disponible' ? 'bg-green-500/20 text-green-400 border-green-500/20' : 'bg-red-500/20 text-red-400 border-red-500/20'}`}>{prop.status}</span>
                </div>
              </div>
              <div className="flex gap-2 self-end sm:self-center">
                <button onClick={() => handleEdit(prop)} className="text-[9px] font-extrabold uppercase bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-4 py-2.5 rounded-xl hover:bg-yellow-500/20 transition-all cursor-pointer">Editar</button>
                <button onClick={() => handleDelete(prop.id)} className="text-[9px] font-extrabold uppercase bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2.5 rounded-xl hover:bg-red-500/20 transition-all cursor-pointer">Borrar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}