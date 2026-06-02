import React from 'react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  PhoneOff, 
  Copy, 
  MessageSquare, 
  Users,
  Check
} from 'lucide-react';
import { useCall } from '../hooks/useCall';

interface CallControlsProps {
  showChat: boolean;
  setShowChat: React.Dispatch<React.SetStateAction<boolean>>;
  showParticipants: boolean;
  setShowParticipants: React.Dispatch<React.SetStateAction<boolean>>;
  onCopyLink: () => void;
  linkCopied: boolean;
}

export const CallControls: React.FC<CallControlsProps> = ({
  showChat,
  setShowChat,
  showParticipants,
  setShowParticipants,
  onCopyLink,
  linkCopied,
}) => {
  const {
    isMuted,
    isCameraOff,
    isScreenSharing,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    leaveMeeting,
  } = useCall();

  return (
    <div className="h-20 bg-dark-900/90 border-t border-white/5 px-6 flex items-center justify-between backdrop-blur-md shadow-2xl relative z-10">
      
      {/* 1. Left Side: Invitation Copy Panel */}
      <div className="hidden sm:flex items-center gap-3">
        <button
          onClick={onCopyLink}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider cursor-pointer border transition-all duration-200 ${
            linkCopied
              ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400'
              : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
          }`}
        >
          {linkCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {linkCopied ? 'Link Copied!' : 'Copy Link'}
        </button>
      </div>

      {/* 2. Center Side: Device Action Triggers */}
      <div className="flex items-center gap-4 mx-auto sm:mx-0">
        {/* Toggle Mic */}
        <button
          onClick={toggleMic}
          className={`call-btn ${isMuted ? 'call-btn-inactive' : 'call-btn-active'}`}
          title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Toggle Video */}
        <button
          onClick={toggleCamera}
          className={`call-btn ${isCameraOff ? 'call-btn-inactive' : 'call-btn-active'}`}
          title={isCameraOff ? 'Start Video' : 'Stop Video'}
        >
          {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>

        {/* Toggle Screen Share */}
        <button
          onClick={toggleScreenShare}
          className={`call-btn ${isScreenSharing ? 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-500' : 'call-btn-active'}`}
          title={isScreenSharing ? 'Stop Screen Sharing' : 'Share Screen'}
        >
          <Monitor className="w-5 h-5" />
        </button>

        {/* End Call */}
        <button
          onClick={leaveMeeting}
          className="call-btn bg-rose-600 hover:bg-rose-500 text-white hover:rotate-135 transition-all duration-300 shadow-rose-500/25"
          title="End Call"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>

      {/* 3. Right Side: Sidebar Panel Toggles */}
      <div className="flex items-center gap-3">
        {/* Participants list trigger */}
        <button
          onClick={() => {
            setShowParticipants((prev) => !prev);
            if (showChat) setShowChat(false); // Close other sidebar
          }}
          className={`p-2.5 rounded-lg border transition-all duration-200 cursor-pointer ${
            showParticipants
              ? 'bg-brand-600/10 border-brand-500/30 text-brand-400 shadow-md'
              : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
          }`}
          title="Participants"
        >
          <Users className="w-5 h-5" />
        </button>

        {/* Chat window trigger */}
        <button
          onClick={() => {
            setShowChat((prev) => !prev);
            if (showParticipants) setShowParticipants(false); // Close other sidebar
          }}
          className={`p-2.5 rounded-lg border transition-all duration-200 cursor-pointer ${
            showChat
              ? 'bg-brand-600/10 border-brand-500/30 text-brand-400 shadow-md'
              : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-300'
          }`}
          title="Chat Panel"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
