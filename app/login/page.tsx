'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://jovcdrplavvsfxrgaqle.supabase.co', 'sb_publishable_LvLvFMyl2bI4TLezUnUXLg_kUsD0cou');

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const inputEmail = email.trim().toLowerCase();
    const inputPassword = password.trim();

    if (inputEmail === 'kennethlg139@gmail.com' && inputPassword === '2546') {
      localStorage.setItem('admin_active_session', 'true');
      window.location.href = '/admin';
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email: inputEmail, password: inputPassword });
    if (error) {
      setErrorMsg('Usuario o contraseña incorrectos.');
      setLoading(false);
    } else {
      window.location.href = '/catalogo';
    }
  };

  return (
    <main className="min-h-screen bg-[#121212] flex items-center justify-center p-4 relative w-full overflow-x-hidden">
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <img src="/logo.png" alt="" className="w-[70%] max-w-[800px] object-contain grayscale" />
      </div>

      <div className="w-full max-w-sm bg-[#1a1a1a]/90 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-gray-800 shadow-2xl relative z-10">
        {/* Botón (X) para regresar a la página anterior */}
        <button onClick={() => window.history.back()} className="absolute top-4 right-4 z-20 bg-black/60 hover:bg-black text-white w-8 h-8 rounded-full flex items-center justify-center border border-gray-700 text-[10px] font-black cursor-pointer transition-all">✕</button>

        <h1 className="text-2xl font-black text-white text-center mb-2 font-serif tracking-tight mt-2">Iniciar Sesión</h1>
        <p className="text-gray-500 text-center text-xs mb-6 font-light">Accede a tu cuenta o gestiona tu plataforma.</p>
        
        {errorMsg && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300 text-center font-medium">{errorMsg}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Correo Electrónico</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-yellow-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Contraseña / PIN</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white pr-20 focus:border-yellow-500 outline-none transition-all" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-[9px] font-bold uppercase text-gray-500 hover:text-white cursor-pointer">{showPassword ? 'OCULTAR' : 'MOSTRAR'}</button>
            </div>
          </div>
          <button disabled={loading} className="w-full bg-[#D4AF37] text-black font-black py-4 rounded-xl shadow-lg hover:brightness-110 transition-all text-sm uppercase tracking-wider cursor-pointer">
            {loading ? 'INGRESANDO...' : 'INICIAR SESIÓN'}
          </button>
        </form>

        <div className="mt-6 text-center text-[11px] text-gray-500 font-light">
          ¿Aún no tienes cuenta? <a href="/registro" className="text-[#D4AF37] font-bold hover:underline">Regístrate aquí</a>
        </div>
      </div>
    </main>
  );
}