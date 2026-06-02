import React, { useState } from 'react';
import { useCall } from '../hooks/useCall';
import { User, Video } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useCall();
  const [name, setName] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      login(name.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      {/* Dynamic Background Glow circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl -z-10 animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10 animate-pulse-slow" />

      {/* Login Card */}
      <div className="glass-card max-w-md w-full p-8 rounded-2xl border-white/5 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-brand-500 to-indigo-500" />
        
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-brand-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-brand-500/20">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Enter the Arena</h1>
          <p className="text-slate-400 text-xs mt-1.5 font-medium leading-relaxed">
            Welcome to the ultimate real-time peer-to-peer WebRTC video calling experience.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              Your Display Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alice Smith"
                className="w-full glass-input pl-10 text-sm"
                maxLength={20}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full glass-btn-primary py-3 flex items-center justify-center font-bold tracking-wide cursor-pointer"
          >
            Get Started
          </button>
        </form>

        <div className="mt-8 border-t border-white/5 pt-6 text-center text-[10px] text-slate-500 font-medium">
          Secure. P2P Mesh Encrypted. Zero Downloads Required.
        </div>
      </div>
    </div>
  );
};
