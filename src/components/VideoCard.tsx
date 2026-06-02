import React, { useEffect, useRef, useState } from 'react';
import { MicOff, VideoOff, Volume2 } from 'lucide-react';

interface VideoCardProps {
  stream: MediaStream | null;
  username: string;
  isLocal: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  stream,
  username,
  isLocal,
  isMuted,
  isCameraOff,
  isScreenSharing,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Bind the media stream to the video element
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement && stream) {
      // Set stream as the srcObject
      videoElement.srcObject = stream;
      
      // If it's the local user, we must mute their playback to prevent audio feedback
      if (isLocal) {
        videoElement.muted = true;
      }
    }
  }, [stream, isLocal]);

  // Audio frequency level monitoring (mic activity indicator)
  useEffect(() => {
    if (!stream || isMuted || isCameraOff) {
      setAudioLevel(0);
      return;
    }

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      
      analyser.fftSize = 512;
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        // Map average volume (0-255) to a scale of 0-100
        setAudioLevel(Math.min(100, Math.floor((average / 80) * 100)));
        
        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (e) {
      console.warn('AudioContext not supported or blocked by security policies', e);
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [stream, isMuted, isCameraOff]);

  const initials = username
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'P';

  return (
    <div className="video-container group">
      {/* 1. Actual Video Element */}
      {!isCameraOff && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover transform ${isLocal && !isScreenSharing ? 'scale-x-[-1]' : ''}`}
        />
      ) : (
        /* 2. Camera Blocked Avatar */
        <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center gap-4 transition-all duration-300">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-lg ring-4 ring-white/10 group-hover:scale-105 transition-transform duration-300">
            <span className="text-3xl font-bold text-white tracking-wider">{initials}</span>
          </div>
          <p className="text-slate-400 text-xs font-medium tracking-wide">
            {isCameraOff ? 'Camera Turned Off' : 'Connecting Media Feed...'}
          </p>
        </div>
      )}

      {/* 3. Audio Activity Light Ring Accent */}
      {audioLevel > 15 && (
        <div 
          className="absolute inset-0 border-2 border-brand-500 rounded-xl pointer-events-none animate-pulse"
          style={{ opacity: audioLevel / 100 }}
        />
      )}

      {/* 4. Glass overlays for details */}
      <div className="absolute top-3 left-3 flex gap-2">
        <span className="bg-black/50 backdrop-blur-md border border-white/10 rounded-lg px-2.5 py-1 text-xs font-semibold tracking-wide text-white shadow-md">
          {username} {isLocal && '(You)'}
        </span>
        {isScreenSharing && (
          <span className="bg-brand-600/95 border border-brand-400/20 rounded-lg px-2.5 py-1 text-xs font-bold text-white shadow-md animate-pulse">
            Sharing Screen
          </span>
        )}
      </div>

      <div className="absolute bottom-3 right-3 flex items-center gap-2">
        {/* Active microphone level indicator bar */}
        {!isMuted && audioLevel > 5 && (
          <div className="bg-emerald-500/80 backdrop-blur-md rounded-lg p-1.5 flex items-center justify-center text-white border border-emerald-400/20 shadow-md">
            <Volume2 className="w-4 h-4 animate-bounce" />
          </div>
        )}

        {isMuted && (
          <div className="bg-rose-600/90 backdrop-blur-md rounded-lg p-1.5 flex items-center justify-center text-white border border-rose-500/20 shadow-md">
            <MicOff className="w-4 h-4" />
          </div>
        )}
        
        {isCameraOff && !isMuted && (
          <div className="bg-slate-800/90 backdrop-blur-md rounded-lg p-1.5 flex items-center justify-center text-slate-300 border border-white/10 shadow-md">
            <VideoOff className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  );
};
