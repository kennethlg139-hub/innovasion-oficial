'use client';

import { useState, useEffect } from 'react';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('admin_active_session') === 'true') {
      if (window.location.pathname !== '/admin') {
        window.location.href = '/admin';
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (pin === '2546') {
      localStorage.setItem('admin_active_session', 'true');
      window.location.href = '/admin';
    } else {
      setError('PIN de administrador incorrecto.');
      setPin('');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1a1a1a] p-6 rounded-3xl border border-gray-800 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-xl font-black text-white font-serif tracking-tight">Iniciar Sesión</h1>
          <p className="text-gray-400 text-[10px] mt-1">Accede a tu cuenta o gestiona tu plataforma.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl text-[10px] font-medium bg-red-500/10 border border-red-500/20 text-red-300 break-words">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">Contraseña / PIN</label>
            <input 
              type="password" 
              value={pin} 
              onChange={e => setPin(e.target.value)} 
              required 
              maxLength={4}
              disabled={loading}
              className="w-full bg-[#111111] border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-500 tracking-widest text-center" 
            />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-extrabold py-3.5 rounded-xl transition-all shadow-xl hover:brightness-110 cursor-pointer text-xs tracking-wide uppercase mt-2 disabled:opacity-50">
            {loading ? 'Validando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </main>
  );
}