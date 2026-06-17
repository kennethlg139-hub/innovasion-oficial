'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    // Si ya vio el splash, no lo repetimos
    if (sessionStorage.getItem('hasSeenSplash')) {
      router.push('/');
      return;
    }

    const timer = setTimeout(() => {
      sessionStorage.setItem('hasSeenSplash', 'true');
      router.push('/');
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="min-h-screen bg-[#121212] flex items-center justify-center">
      <div className="relative w-48 h-48 md:w-64 md:h-64 preserve-3d animate-metallic-spin">
        <img 
          src="/logo.png" 
          alt="Innovasion Logo" 
          className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]" 
        />
      </div>
    </main>
  );
}