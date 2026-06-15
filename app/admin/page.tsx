'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://jovcdrplavvsfxrgaqle.supabase.co', 'sb_publishable_LvLvFMyl2bI4TLezUnUXLg_kUsD0cou');

type Cliente = {
  id: number;
  nombre: string;
  telefono: string;
  terreno_interes: string;
  tipo_accion: string;
  created_at: string;
};

type Property = {
  id: number;
  title: string;
  size: string;
  price: string;
  status: string;
  image_url: string;
};

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'properties' | 'clients'>('properties');
  
  // Estados para propiedades (tu crud existente)
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProps, setLoadingProps] = useState(true);
  
  // Estados para la nueva tabla de clientes
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);

  useEffect(() => {
    // Verificamos sesión de admin
    if (localStorage.getItem('admin_active_session') !== 'true') {
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

  const loadClientes = async () => {
    setLoadingClients(true);
    // Leemos la tabla pública 'clientes' ordenada por los más recientes
    const { data } = await supabase.from('clientes').select('*').order('id', { ascending: false });
    setClientes(data || []);
    setLoadingClients(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_active_session');
    window.location.href = '/';
  };

  // Al cambiar de pestaña, cargamos los datos correspondientes
  const switchTab = (tab: 'properties' | 'clients') => {
    setActiveTab(tab);
    if (tab === 'clients') {
      loadClientes();
    }
  };

  if (!isAdmin) return null;

  return (
    <main className="min-h-screen bg-[#121212] text-gray-200 antialiased relative w-full p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabecera del Panel */}
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

        {/* Selector de Pestañas */}
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

        {/* Contenido: Pestaña Terrenos */}
        {activeTab === 'properties' && (
          <div>
            <h2 className="text-sm font-bold text-white mb-4 font-serif">Tus Terrenos Publicados</h2>
            {loadingProps ? (
              <p className="text-xs text-gray-500 py-10 text-center">Cargando propiedades...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties.map(p => (
                  <div key={p.id} className="bg-[#1a1a1a] border border-gray-800 p-4 rounded-xl flex gap-3 items-center">
                    <img src={p.image_url} alt="" className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-white truncate">{p.title}</h4>
                      <p className="text-[9px] text-gray-400 mt-0.5">{p.size}</p>
                      <p className="text-[10px] font-black text-yellow-500 mt-1 font-mono">{p.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contenido: Pestaña Clientes */}
        {activeTab === 'clients' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-white font-serif">Lista de Prospectos (Leads)</h2>
              <button onClick={loadClientes} className="text-[8px] font-bold uppercase tracking-wider bg-gray-800 text-gray-300 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-gray-700">Actualizar Lista</button>
            </div>
            
            {loadingClients ? (
              <p className="text-xs text-gray-500 py-10 text-center">Cargando prospectos...</p>
            ) : clientes.length === 0 ? (
              <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-10 text-center">
                <p className="text-xs text-gray-500">Aún no hay clientes registrados en la base de datos.</p>
                <p className="text-[9px] text-gray-600 mt-1">Aparecerán aquí en cuanto alguien llene sus datos en el catálogo.</p>
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50 text-white font-light">
                      {clientes.map(c => (
                        <tr key={c.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3.5 text-gray-400 font-mono whitespace-nowrap">
                            {new Date(c.created_at).toLocaleDateString()} {new Date(c.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </td>
                          <td className="p-3.5 font-semibold text-gray-200">{c.nombre}</td>
                          <td className="p-3.5 font-medium text-yellow-400 font-mono tracking-wide whitespace-nowrap">{c.telefono}</td>
                          <td className="p-3.5 text-gray-300 truncate max-w-xs">{c.terreno_interes}</td>
                          <td className="p-3.5 whitespace-nowrap">
                            <span className={`inline-block px-2 py-0.5 rounded-lg font-extrabold uppercase tracking-wider ${c.tipo_accion === 'PDF' ? 'bg-red-950/40 text-red-400 border border-red-500/20' : 'bg-green-950/40 text-green-400 border border-green-500/20'}`}>
                              {c.tipo_accion}
                            </span>
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