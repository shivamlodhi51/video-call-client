import React, { useEffect, useState } from 'react';
import { useCall } from '../hooks/useCall';
import { VideoGrid } from '../components/VideoGrid';
import { CallControls } from '../components/CallControls';
import { ChatPanel } from '../components/ChatPanel';
import { ParticipantList } from '../components/ParticipantList';
import { Toast, type ToastType } from '../components/Toast';
import { getMeetingLink, copyToClipboard } from '../utils/helpers';
import { AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

interface RoomProps {
  roomIdFromUrl: string;
  onNavigateHome: () => void;
}

export const Room: React.FC<RoomProps> = ({ roomIdFromUrl, onNavigateHome }) => {
  const {
    username,
    joinMeeting,
    leaveMeeting,
    localStream,
    remoteStreams,
    isMuted,
    isCameraOff,
    isScreenSharing,
    connectionStatus,
    activeCount,
    error,
  } = useCall();

  // Sidebar visibility flags
  const [showChat, setShowChat] = useState<boolean>(false);
  const [showParticipants, setShowParticipants] = useState<boolean>(false);

  // Floating notifications state
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [linkCopied, setLinkCopied] = useState<boolean>(false);

  // Attempt to enter the room on component mount
  useEffect(() => {
    let active = true;
    
    const enterRoom = async () => {
      console.log(`[ROOM]: Mounting Room: ${roomIdFromUrl} for user: ${username}`);
      const success = await joinMeeting(roomIdFromUrl, username);
      if (!success && active) {
        setToast({
          message: 'Could not connect to meeting room.',
          type: 'error',
        });
      }
    };

    enterRoom();

    return () => {
      active = false;
      leaveMeeting();
    };
  }, [roomIdFromUrl, username]);

  // Alert peer entries/exits using floating Toast items
  useEffect(() => {
    // If connection status is connected, show a brief success toast
    if (connectionStatus === 'connected' && Object.keys(remoteStreams).length === 0) {
      setToast({
        message: 'Successfully entered call lobby',
        type: 'success',
      });
    }
  }, [connectionStatus]);

  const handleCopyLink = async () => {
    const link = getMeetingLink(roomIdFromUrl);
    const success = await copyToClipboard(link);
    if (success) {
      setLinkCopied(true);
      setToast({
        message: 'Invitation link copied to clipboard!',
        type: 'success',
      });
      setTimeout(() => setLinkCopied(false), 3000);
    }
  };

  const handleBack = () => {
    leaveMeeting();
    onNavigateHome();
  };

  // 1. Error fallbacks
  if (error) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center p-6 relative">
        <div className="glass-card max-w-md w-full p-8 rounded-2xl border-rose-500/20 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-rose-600" />
          <div className="w-16 h-16 bg-rose-600/10 border border-rose-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-rose-500" />
          </div>
          <h1 className="text-xl font-bold text-slate-100 mb-2">Meeting Connection Failed</h1>
          <p className="text-slate-400 text-xs font-semibold mb-6 leading-relaxed">
            {error}
          </p>
          <button
            onClick={handleBack}
            className="glass-btn-secondary w-full py-3 flex items-center justify-center gap-2 cursor-pointer font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Lobby
          </button>
        </div>
      </div>
    );
  }

  // 2. Loading visual spinners
  if (connectionStatus === 'connecting' && !localStream) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center gap-5">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-brand-500/10 border-t-brand-500 animate-spin" />
          <Loader2 className="w-6 h-6 text-brand-400 animate-pulse absolute" />
        </div>
        <div className="text-center flex flex-col gap-1.5 max-w-xs">
          <h2 className="text-sm font-bold tracking-wider text-slate-200 uppercase">Connecting Hardware</h2>
          <p className="text-[11px] font-semibold text-slate-400 leading-normal">
            Please approve camera and microphone permissions in your browser...
          </p>
        </div>
      </div>
    );
  }

  // Connection Indicator visual badges
  const statusBadges = {
    disconnected: (
      <span className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 border border-white/10 rounded-full px-2.5 py-1">
        <span className="w-2 h-2 rounded-full bg-slate-500" /> Disconnected
      </span>
    ),
    connecting: (
      <span className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-1 animate-pulse">
        <span className="w-2 h-2 rounded-full bg-amber-500" /> Connecting Lobby
      </span>
    ),
    connected: (
      <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Live Feed
      </span>
    ),
    reconnecting: (
      <span className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-1 animate-pulse">
        <span className="w-2 h-2 rounded-full bg-amber-500" /> Reconnecting
      </span>
    ),
    failed: (
      <span className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-full px-2.5 py-1">
        <span className="w-2 h-2 rounded-full bg-rose-500" /> Connection Stalled
      </span>
    ),
  };

  return (
    <div className="min-h-screen h-screen flex flex-col overflow-hidden bg-dark-950">
      
      {/* 1. Header Navigation Bar */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-dark-900/50 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors p-2 rounded-lg hover:bg-white/5 cursor-pointer"
            title="Leave Meeting"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Leave</span>
          </button>
          
          <div className="w-px h-6 bg-white/10 hidden sm:block" />
          
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Meeting ID</span>
            <span className="text-xs font-bold text-slate-100 mt-1 leading-none">{roomIdFromUrl}</span>
          </div>
        </div>

        {/* Center: Live Call details indicators */}
        <div className="flex items-center gap-3">
          {statusBadges[connectionStatus]}
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-brand-400 bg-brand-500/10 border border-brand-500/20 rounded-full px-2.5 py-1 font-bold">
            {activeCount} Active
          </span>
        </div>
      </header>

      {/* 2. Central Video & Chat Panels layout */}
      <div className="flex-1 flex overflow-hidden relative">
        <VideoGrid
          localStream={localStream}
          remoteStreams={remoteStreams}
          username={username}
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          isScreenSharing={isScreenSharing}
        />

        {/* Sliding Sidebars */}
        {showChat && <ChatPanel />}
        {showParticipants && <ParticipantList />}
      </div>

      {/* 3. Call Control Panel */}
      <CallControls
        showChat={showChat}
        setShowChat={setShowChat}
        showParticipants={showParticipants}
        setShowParticipants={setShowParticipants}
        onCopyLink={handleCopyLink}
        linkCopied={linkCopied}
      />

      {/* 4. Toast Alerts overlay */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
