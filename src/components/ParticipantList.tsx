import React from 'react';
import { Users, Crown, Mic, MicOff, Video, VideoOff, Monitor } from 'lucide-react';
import { useCall } from '../hooks/useCall';

export const ParticipantList: React.FC = () => {
  const { participants, username, hostId, isMuted, isCameraOff, isScreenSharing } = useCall();

  // Format initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'P';
  };

  return (
    <div className="w-80 h-full border-l border-white/5 bg-dark-900/80 backdrop-blur-md flex flex-col shadow-2xl relative z-10 animate-fade-in">
      
      {/* 1. Header */}
      <div className="p-4 border-b border-white/5 flex items-center gap-2">
        <Users className="w-4 h-4 text-brand-400" />
        <h2 className="text-sm font-bold tracking-wider text-slate-100 uppercase">Participants</h2>
        <span className="ml-auto bg-brand-600/25 border border-brand-500/20 text-brand-400 rounded-full px-2 py-0.5 text-[10px] font-bold">
          {participants.length + 1} Total
        </span>
      </div>

      {/* 2. Participant Items */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        
        {/* Local user first item */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-brand-500/20 transition-all duration-200">
          <div className="flex items-center gap-3">
            {/* Avatar circle */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
              {getInitials(username)}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold text-slate-200">
                {username} <span className="text-[10px] text-slate-400 font-normal">(You)</span>
              </span>
              {/* Host indicator tag */}
              {hostId === 'host-placeholder' || hostId === '' ? (
                <span className="flex items-center gap-1 text-[9px] font-bold text-brand-400">
                  <Crown className="w-3 h-3" /> Host
                </span>
              ) : null}
            </div>
          </div>

          {/* Local state indicators */}
          <div className="flex items-center gap-2 text-slate-400">
            {isScreenSharing && <Monitor className="w-3.5 h-3.5 text-brand-400" />}
            {isMuted ? <MicOff className="w-3.5 h-3.5 text-rose-500" /> : <Mic className="w-3.5 h-3.5 text-emerald-500" />}
            {isCameraOff ? <VideoOff className="w-3.5 h-3.5 text-rose-500" /> : <Video className="w-3.5 h-3.5 text-emerald-500" />}
          </div>
        </div>

        {/* Remote users listing */}
        {participants.map((p) => {
          const isHost = p.socketId === hostId;
          return (
            <div 
              key={p.socketId} 
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-brand-500/20 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 border border-white/5 shadow-md">
                  {getInitials(p.username)}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-slate-200">{p.username}</span>
                  {isHost && (
                    <span className="flex items-center gap-1 text-[9px] font-bold text-brand-400">
                      <Crown className="w-3 h-3" /> Host
                    </span>
                  )}
                </div>
              </div>

              {/* Media indicator states */}
              <div className="flex items-center gap-2 text-slate-400">
                {p.isScreenSharing && <Monitor className="w-3.5 h-3.5 text-brand-400 animate-pulse" />}
                {p.isMuted ? <MicOff className="w-3.5 h-3.5 text-rose-500" /> : <Mic className="w-3.5 h-3.5 text-emerald-500" />}
                {p.isCameraOff ? <VideoOff className="w-3.5 h-3.5 text-rose-500" /> : <Video className="w-3.5 h-3.5 text-emerald-500" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
