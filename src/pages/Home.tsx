import React, { useState } from 'react';
import { useCall } from '../hooks/useCall';
import { Video, Keyboard, ArrowRight, LogOut, Sparkles } from 'lucide-react';

interface HomeProps {
  onNavigateToRoom: (id: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigateToRoom }) => {
  const { createMeeting, username, logout } = useCall();
  const [meetingIdInput, setMeetingIdInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleCreate = async () => {
    try {
      setLoading(true);
      setLocalError(null);
      const newRoomId = await createMeeting();
      console.log('[HOME]: Meeting created successfully: ', newRoomId);
      onNavigateToRoom(newRoomId);
    } catch (err: any) {
      setLocalError(err.message || 'Failed to create meeting room.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = meetingIdInput.trim().toLowerCase();
    
    // Validate format (xxx-xxx-xxx)
    const roomRegex = /^[a-z]{3}-[a-z]{3}-[a-z]{3}$/;
    if (!roomRegex.test(cleanId)) {
      setLocalError('Invalid Meeting ID format. Must be like "abc-def-ghi"');
      return;
    }

    setLocalError(null);
    onNavigateToRoom(cleanId);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background glow effects */}
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl -z-10 animate-pulse-slow" />
      <div className="absolute bottom-1/3 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -z-10 animate-pulse-slow" />

      {/* Top Navbar */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-dark-900/50 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-md">
            <Video className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-wider text-white">ARENA CALLS</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400 font-semibold bg-white/5 border border-white/10 rounded-full px-3 py-1">
            Hi, <span className="text-slate-100">{username}</span>
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors bg-white/5 border border-white/10 rounded-lg p-1.5 px-3 cursor-pointer font-bold"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Hero Arena Panel */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          
          {/* Hero Pitch */}
          <div className="flex flex-col text-left">
            <div className="inline-flex items-center gap-2 bg-brand-600/10 border border-brand-500/20 text-brand-400 text-[10px] font-bold rounded-full px-3 py-1 self-start mb-6 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 animate-spin" /> Ready for Action
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
              Premium WebRTC <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-indigo-400">Video Calls</span> for Everyone.
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">
              High fidelity peer-to-peer audio and video transmission. Create instantaneous meeting slots, invite team members, share screens, and converse with no limits.
            </p>
            
            {localError && (
              <div className="bg-rose-600/15 border border-rose-500/20 rounded-xl p-4 text-xs font-semibold text-rose-400 max-w-sm">
                {localError}
              </div>
            )}
          </div>

          {/* Action Card Forms */}
          <div className="glass-card p-8 rounded-2xl border-white/5 flex flex-col gap-8 shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-brand-500 to-indigo-500" />
            
            {/* Create Meeting */}
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-bold tracking-wider text-slate-300 uppercase">Start a New Meeting</h2>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="w-full glass-btn-primary py-3.5 flex items-center justify-center gap-2.5 font-bold tracking-wide shadow-brand-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Video className="w-5 h-5 animate-pulse" />
                {loading ? 'Generating Room...' : 'Create Meeting'}
              </button>
            </div>

            {/* Divider line */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Join Meeting */}
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-bold tracking-wider text-slate-300 uppercase">Join an Existing Meeting</h2>
              <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Keyboard className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={meetingIdInput}
                    onChange={(e) => setMeetingIdInput(e.target.value)}
                    placeholder="Enter ID: e.g. abc-def-ghi"
                    className="w-full glass-input pl-11 py-3 text-sm font-semibold tracking-wider placeholder:tracking-normal placeholder:font-normal"
                    maxLength={11}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!meetingIdInput.trim()}
                  className="glass-btn-secondary px-6 py-3.5 flex items-center justify-center gap-2 cursor-pointer text-slate-200 border-white/10 hover:border-brand-500/30 hover:text-white"
                >
                  <span className="font-bold tracking-wide">Join</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

        </div>
      </main>

      {/* Footer credits */}
      <footer className="h-12 border-t border-white/5 flex items-center justify-center text-[10px] text-slate-500 font-medium">
        Build with React + WebRTC Mesh. © 2026 Antigravity.
      </footer>
    </div>
  );
};
