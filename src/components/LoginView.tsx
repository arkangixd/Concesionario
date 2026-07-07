import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Shield, Key, Mail, CheckCircle, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginViewProps {
  users: User[];
  onLogin: (user: User) => void;
}

export default function LoginView({ users, onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123'); // Preset password
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    
    if (!user) {
      setError('El correo electrónico no está registrado.');
      return;
    }

    if (!user.active) {
      setError('Este usuario está desactivado por el administrador.');
      return;
    }

    onLogin(user);
  };

  const handleQuickLogin = (user: User) => {
    if (!user.active) {
      setError(`El usuario ${user.name} está desactivado. No puede iniciar sesión.`);
      return;
    }
    setEmail(user.email);
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden" id="login-container">
      {/* Decorative background gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/15 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-600/15 blur-[120px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative z-10"
        id="login-card"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-4 text-emerald-400">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans text-center">
            Portal Concesionario
          </h2>
          <p className="text-sm text-slate-400 mt-1 font-sans">
            Inicia sesión para gestionar el concesionario
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 mb-6 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-medium"
            id="login-error"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 pl-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="ejemplo@concesionario.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className="w-full pl-10 pr-4 py-3 bg-black/35 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 pl-1">
              Contraseña
            </label>
            <div className="relative">
              <Key className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={() => setError('')}
                className="w-full pl-10 pr-4 py-3 bg-black/35 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition text-sm cursor-not-allowed opacity-60"
                disabled
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1 pl-1">
              La contraseña está preestablecida para fines de simulación.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] shadow-md border border-white/10 cursor-pointer"
            id="login-btn-submit"
          >
            Acceder al Sistema
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3 font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Simulador de Roles (Acceso Rápido)</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {users.map((user) => {
              const roleLabel = 
                user.role === 'ADMIN' ? 'Administrador' :
                user.role === 'GERENTE' ? 'Gerente / Inventario' : 'Vendedor';
              
              const colorClasses = user.active 
                ? 'border-white/10 bg-white/5 hover:border-indigo-500/30 hover:bg-white/10 text-white' 
                : 'border-white/5 bg-white/2 opacity-40 text-slate-500 cursor-not-allowed';

              return (
                <button
                  key={user.id}
                  onClick={() => handleQuickLogin(user)}
                  disabled={!user.active}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all group cursor-pointer ${colorClasses}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${user.avatarColor} text-white flex items-center justify-center font-bold text-xs shadow-md`}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{user.name}</div>
                      <div className="text-[10px] text-slate-400">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                      user.role === 'ADMIN' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                      user.role === 'GERENTE' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {roleLabel}
                    </span>
                    {!user.active && <span className="text-[9px] text-rose-400 font-semibold">Desactivado</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
