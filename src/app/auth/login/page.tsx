'use client';

import React, { useState, Suspense, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams?.get('from') || '/admin';

  // Detecta preenchimento automático
  useEffect(() => {
    const checkAutoFill = () => {
      const inputs = document.querySelectorAll('input');
      inputs.forEach(input => {
        if (input.matches(':-webkit-autofill') || input.matches(':autofill')) {
          setIsAutoFilled(true);
        }
      });
    };

    // Verifica após um pequeno delay para dar tempo do navegador preencher
    const timer = setTimeout(checkAutoFill, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      router.replace(from);
    } catch (err: any) {
      setError(err?.message || 'Usuário ou senha incorretos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="animate-shake rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 flex items-center gap-3 shadow-inner">
          <AlertCircle className="text-red-400 flex-shrink-0" size={18} />
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-5">
        <div className="group relative">
          <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${isAutoFilled && username ? 'text-blue-400' : 'text-slate-500'} group-focus-within:text-cyan-400`}>
            <User size={20} />
          </div>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`w-full ${isAutoFilled && username ? 'bg-blue-500/5 border-blue-500/30' : 'bg-slate-900/50 border-slate-700/50'} text-white placeholder:text-slate-600 rounded-2xl border py-4 pl-12 pr-4 text-sm font-medium transition-all duration-300 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 focus:bg-slate-900/80 focus:shadow-[0_0_20px_rgba(34,211,238,0.15)] hover:border-slate-600`}
            placeholder="Nome de usuário"
            required
            disabled={isLoading}
            autoComplete="username"
          />
          <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5 pointer-events-none" />
        </div>

        <div className="group relative">
          <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300 ${isAutoFilled && password ? 'text-blue-400' : 'text-slate-500'} group-focus-within:text-cyan-400`}>
            <Lock size={20} />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full ${isAutoFilled && password ? 'bg-blue-500/5 border-blue-500/30' : 'bg-slate-900/50 border-slate-700/50'} text-white placeholder:text-slate-600 rounded-2xl border py-4 pl-12 pr-12 text-sm font-medium transition-all duration-300 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 focus:bg-slate-900/80 focus:shadow-[0_0_20px_rgba(34,211,238,0.15)] hover:border-slate-600`}
            placeholder="Sua senha"
            required
            disabled={isLoading}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5 pointer-events-none" />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-[1px] shadow-lg shadow-blue-500/20 transition-all duration-300 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
      >
        <div className="relative flex items-center justify-center gap-2 rounded-2xl bg-slate-950/20 backdrop-blur-sm px-4 py-3.5 transition-all duration-300 group-hover:bg-transparent">
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <span className="font-bold text-white tracking-wide">Entrar</span>
              <Lock size={18} className="text-white/80 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </div>
      </button>

      <div className="text-center">
        <p className="text-xs text-slate-500">
          Use <span className="text-blue-400 font-medium">admin</span> / <span className="text-blue-400 font-medium">123</span> para acessar
        </p>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/80 via-slate-950/90 to-black pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/20 to-cyan-400/10 rounded-full blur-3xl pointer-events-none mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-purple-500/20 to-pink-400/10 rounded-full blur-3xl pointer-events-none mix-blend-screen animate-pulse" style={{ animationDuration: '12s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '15s' }} />

      <div className="w-full max-w-md relative z-10">
        <div className="backdrop-blur-2xl bg-white/3 border border-white/10 rounded-3xl shadow-2xl shadow-blue-500/5 overflow-hidden transition-all duration-500 hover:shadow-blue-500/20 hover:border-white/20 hover:scale-[1.005]">
          <div className="p-8 sm:p-10">
            {/* Header with Logo */}
            <div className="flex flex-col items-center justify-center mb-10">
              <div className="relative w-24 h-24 mb-6 transition-transform duration-500 hover:scale-110 hover:rotate-3">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 via-cyan-400 to-blue-600 rounded-full blur-2xl opacity-30 animate-pulse" />
                <div className="absolute inset-2 bg-gradient-to-br from-slate-900 to-slate-950 rounded-full border border-white/10" />
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src="/logo.svg"
                    alt="Fábrica de Cupons"
                    width={64}
                    height={64}
                    className="object-contain drop-shadow-2xl"
                    priority
                  />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-300 tracking-tight">
                Bem-vindo de volta
              </h1>
              <p className="text-slate-400 text-sm mt-3 font-medium tracking-wide">
                Acesse o painel administrativo
              </p>
            </div>

            <Suspense fallback={
              <div className="flex justify-center p-8">
                <div className="h-10 w-10 animate-spin rounded-full border-3 border-white/20 border-t-blue-500" />
              </div>
            }>
              <LoginForm />
            </Suspense>
          </div>
          
          {/* Footer of Card */}
          <div className="bg-gradient-to-r from-slate-950/40 via-slate-900/30 to-slate-950/40 px-8 py-5 border-t border-white/5 text-center backdrop-blur-sm">
            <p className="text-xs text-slate-500 font-medium tracking-wide">
              Sistema seguro • Acesso restrito • Protegido por criptografia
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
