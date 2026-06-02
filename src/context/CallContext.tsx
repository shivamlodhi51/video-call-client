import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Participant, ChatMessage, ConnectionStatus, SignalData } from '../types';
import { createRoomApi, validateRoomApi } from '../services/api';

interface CallContextProps {
  // Authentication & Session
  username: string;
  isAuthenticated: boolean;
  login: (name: string) => void;
  logout: () => void;
  roomId: string;
  createMeeting: () => Promise<string>;
  joinMeeting: (id: string, name: string) => Promise<boolean>;
  leaveMeeting: () => void;

  // Media Streams & States
  localStream: MediaStream | null;
  remoteStreams: Record<string, {
    socketId: string;
    username: string;
    stream: MediaStream;
    isMuted: boolean;
    isCameraOff: boolean;
    isScreenSharing: boolean;
  }>;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  toggleMic: () => void;
  toggleCamera: () => void;
  toggleScreenShare: () => Promise<void>;

  // Call Participants & Host Info
  participants: Participant[];
  hostId: string;
  activeCount: number;

  // Chat panel
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => void;

  // Connection State
  connectionStatus: ConnectionStatus;
  error: string | null;
  setError: (err: string | null) => void;
}

const CallContext = createContext<CallContextProps | undefined>(undefined);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authenticated user state
  const [username, setUsername] = useState<string>(() => localStorage.getItem('webrtc_username') || '');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!localStorage.getItem('webrtc_username'));

  // Active call state
  const [roomId, setRoomId] = useState<string>('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [hostId, setHostId] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Local device/track media states
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isCameraOff, setIsCameraOff] = useState<boolean>(false);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);

  // Peer-to-peer streams rendering list
  const [remoteStreams, setRemoteStreams] = useState<Record<string, {
    socketId: string;
    username: string;
    stream: MediaStream;
    isMuted: boolean;
    isCameraOff: boolean;
    isScreenSharing: boolean;
  }>>({});

  // Global connection indicator
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

  // Core references to bypass React stale closures
  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({});
  const screenShareStreamRef = useRef<MediaStream | null>(null);
  const participantsRef = useRef<Participant[]>([]);

  // Update helper ref
  useEffect(() => {
    participantsRef.current = participants;
  }, [participants]);

  // Handle local authentication dummy
  const login = (name: string) => {
    localStorage.setItem('webrtc_username', name);
    setUsername(name);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('webrtc_username');
    setUsername('');
    setIsAuthenticated(false);
  };

  // HTTP API Call to create a room
  const createMeeting = async (): Promise<string> => {
    try {
      setError(null);
      const res = await createRoomApi();
      if (res.success) {
        return res.room.id;
      }
      throw new Error(res.message || 'Could not create meeting');
    } catch (err: any) {
      setError(err.message || 'Network error creating meeting');
      throw err;
    }
  };

  // Clean up WebRTC peer connections
  const cleanUpPeers = () => {
    Object.keys(peerConnectionsRef.current).forEach((id) => {
      peerConnectionsRef.current[id].close();
    });
    peerConnectionsRef.current = {};
    setRemoteStreams({});
  };

  // Explicitly close local stream tracks
  const stopLocalTracks = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
    if (screenShareStreamRef.current) {
      screenShareStreamRef.current.getTracks().forEach((track) => track.stop());
      screenShareStreamRef.current = null;
      setIsScreenSharing(false);
    }
  };

  // Terminate active call and reset states
  const leaveMeeting = () => {
    if (socketRef.current) {
      socketRef.current.emit('leave-call');
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    cleanUpPeers();
    stopLocalTracks();
    setRoomId('');
    setParticipants([]);
    setHostId('');
    setChatMessages([]);
    setConnectionStatus('disconnected');
    setIsMuted(false);
    setIsCameraOff(false);
  };

  // Initializing local media tracks
  const initLocalStream = async (): Promise<MediaStream> => {
    if (localStreamRef.current) return localStreamRef.current;

    try {
      console.log('[MEDIA]: Requesting user media permissions...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      console.log('[MEDIA]: User camera/mic stream initialized successfully');
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err: any) {
      console.error('[MEDIA ERROR]: Failed to fetch media devices', err);
      setError('Camera/Microphone permission denied or device not found.');
      throw err;
    }
  };

  // Creates an RTCPeerConnection for a remote participant
  const createPeerConnection = (
    remoteSocketId: string,
    remoteUsername: string,
    stream: MediaStream
  ): RTCPeerConnection => {
    console.log(`[WEBRTC]: Creating peer connection for user ${remoteUsername} (${remoteSocketId})`);
    
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks to this connection
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    // Handle ICE Candidate exchange
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        console.log(`[WEBRTC]: Sending local ICE candidate to ${remoteUsername}`);
        socketRef.current.emit('send-signal', {
          to: remoteSocketId,
          signal: {
            type: 'candidate',
            candidate: event.candidate,
          },
        });
      }
    };

    // Connection quality indicator monitor
    pc.onconnectionstatechange = () => {
      console.log(`[WEBRTC STATE]: Connection state with ${remoteUsername} is now ${pc.connectionState}`);
      if (pc.connectionState === 'connected') {
        setConnectionStatus('connected');
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        console.log(`[WEBRTC]: Connection with ${remoteUsername} lost, attempting automatic ice restart/reconnect`);
        // Simple automatic reconnection strategy: wait and check if user is still in participant list
        setTimeout(() => {
          const stillExists = participantsRef.current.some((p) => p.socketId === remoteSocketId);
          if (stillExists && pc.connectionState !== 'connected') {
            console.log(`[WEBRTC]: Performing ICE restart for ${remoteUsername}`);
            pc.createOffer({ iceRestart: true })
              .then((offer) => pc.setLocalDescription(offer))
              .then(() => {
                if (socketRef.current) {
                  socketRef.current.emit('send-signal', {
                    to: remoteSocketId,
                    signal: {
                      type: 'offer',
                      sdp: pc.localDescription?.sdp,
                    },
                  });
                }
              })
              .catch((e) => console.error('[WEBRTC RECONNECT ERROR]:', e));
          }
        }, 5000);
      }
    };

    // When remote stream tracks are received, construct stream and render
    pc.ontrack = (event) => {
      console.log(`[WEBRTC]: Received remote track from ${remoteUsername}`, event.streams[0]);
      const remoteStream = event.streams[0];
      
      setRemoteStreams((prev) => {
        // If the stream is already registered, skip re-render
        if (prev[remoteSocketId] && prev[remoteSocketId].stream.id === remoteStream.id) {
          return prev;
        }

        // Find participant info to retain correct media flags
        const pInfo = participantsRef.current.find((p) => p.socketId === remoteSocketId);

        return {
          ...prev,
          [remoteSocketId]: {
            socketId: remoteSocketId,
            username: remoteUsername,
            stream: remoteStream,
            isMuted: pInfo ? pInfo.isMuted : false,
            isCameraOff: pInfo ? pInfo.isCameraOff : false,
            isScreenSharing: pInfo ? pInfo.isScreenSharing : false,
          },
        };
      });
    };

    peerConnectionsRef.current[remoteSocketId] = pc;
    return pc;
  };

  // Main coordinator to join a room
  const joinMeeting = async (id: string, name: string): Promise<boolean> => {
    try {
      setError(null);
      setConnectionStatus('connecting');

      // 1. Validate room exists via HTTP REST call
      const validation = await validateRoomApi(id);
      if (!validation.success || !validation.exists) {
        setError('Meeting ID not found or has expired.');
        setConnectionStatus('disconnected');
        return false;
      }

      // 2. Initialize local video/audio feed
      const stream = await initLocalStream();
      setRoomId(id);

      // 3. Connect to the signaling server via Socket.IO
      const socket = io(BACKEND_URL, {
        withCredentials: true,
        transports: ['websocket'],
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('[SOCKET]: Connected to signaling server as: ', socket.id);
        // Request to enter room
        socket.emit('join-room', { roomId: id, username: name });
      });

      socket.on('connect_error', () => {
        setError('Failed to connect to signaling server.');
        setConnectionStatus('failed');
      });

      // Server alerts room details once socket successfully enters room
      socket.on('room-ready', ({ participants: existingUsers, hostId: currentHostId }) => {
        console.log('[SOCKET]: Room is ready. Existing participants count:', existingUsers.length);
        setParticipants(existingUsers);
        setHostId(currentHostId);
        setConnectionStatus(existingUsers.length > 0 ? 'connecting' : 'connected');
        
        // As a new joiner in a mesh, we wait for existing peers to send us offers!
        // This is extremely simple and avoids double offer collisions.
      });

      // A new user has joined our room. We (the existing peer) must initiate a connection to them.
      socket.on('user-joined', async ({ participant }) => {
        const remoteId = participant.socketId;
        const remoteName = participant.username;
        console.log(`[SOCKET]: User Joined event. Initiating WebRTC Offer to: ${remoteName}`);

        // Update list of active participants
        setParticipants((prev) => [...prev, participant]);

        // Create peer connection
        const pc = createPeerConnection(remoteId, remoteName, stream);

        try {
          // Create SDP Offer
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          
          console.log(`[WEBRTC]: Created and set local Offer for ${remoteName}`);
          // Send Offer to the new participant via signaling server
          socket.emit('send-signal', {
            to: remoteId,
            signal: {
              type: 'offer',
              sdp: offer.sdp,
            },
          });
        } catch (e) {
          console.error(`[WEBRTC ERROR]: Failed to create SDP offer for ${remoteName}`, e);
        }
      });

      // Dispatch WebRTC signaling events
      socket.on('signaling-message', async ({ from, signal }: { from: string; signal: SignalData }) => {
        const sender = participantsRef.current.find((p) => p.socketId === from);
        const senderName = sender ? sender.username : 'Unknown Peer';

        let pc = peerConnectionsRef.current[from];

        // 1. Handling Remote Offer
        if (signal.type === 'offer') {
          console.log(`[SIGNALLING]: Received WebRTC SDP Offer from: ${senderName}`);
          
          // If connection doesn't exist, create it (we are the receiving peer)
          if (!pc) {
            pc = createPeerConnection(from, senderName, stream);
          }

          try {
            await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: signal.sdp }));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            console.log(`[SIGNALLING]: Created and set local SDP Answer for: ${senderName}`);
            // Send Answer back
            socket.emit('send-signal', {
              to: from,
              signal: {
                type: 'answer',
                sdp: answer.sdp,
              },
            });
          } catch (e) {
            console.error(`[SIGNALLING ERROR]: Failed to process remote offer from ${senderName}`, e);
          }
        } 
        
        // 2. Handling Remote Answer
        else if (signal.type === 'answer') {
          console.log(`[SIGNALLING]: Received WebRTC SDP Answer from: ${senderName}`);
          if (pc) {
            try {
              await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: signal.sdp }));
            } catch (e) {
              console.error(`[SIGNALLING ERROR]: Failed to set remote answer for ${senderName}`, e);
            }
          }
        } 
        
        // 3. Handling Remote ICE Candidate
        else if (signal.type === 'candidate' && signal.candidate) {
          if (pc) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
              console.log(`[SIGNALLING]: Added ICE candidate from: ${senderName}`);
            } catch (e) {
              console.error(`[SIGNALLING ERROR]: Failed to add remote ICE candidate from ${senderName}`, e);
            }
          }
        }
      });

      // Handling media updates (mute mic, camera block, screenshare toggles)
      socket.on('participant-state-updated', ({ socketId, updates }) => {
        console.log(`[SOCKET]: State update from ${socketId}:`, updates);
        
        // Update general participants list state
        setParticipants((prev) =>
          prev.map((p) => (p.socketId === socketId ? { ...p, ...updates } : p))
        );

        // Update the active remote streams rendering flags
        setRemoteStreams((prev) => {
          if (!prev[socketId]) return prev;
          return {
            ...prev,
            [socketId]: {
              ...prev[socketId],
              ...updates,
            },
          };
        });
      });

      // Handling Chat Message Events
      socket.on('chat-message', (msg: ChatMessage) => {
        setChatMessages((prev) => [...prev, msg]);
      });

      // Handle user left notifications
      socket.on('user-left', ({ socketId, username: leavingName, newHostId }) => {
        console.log(`[SOCKET]: Participant Left room: ${leavingName} (${socketId})`);
        
        // Remove from state
        setParticipants((prev) => prev.filter((p) => p.socketId !== socketId));
        if (newHostId) setHostId(newHostId);

        // Close and delete peer connection
        if (peerConnectionsRef.current[socketId]) {
          peerConnectionsRef.current[socketId].close();
          delete peerConnectionsRef.current[socketId];
        }

        // Delete stream
        setRemoteStreams((prev) => {
          const copy = { ...prev };
          delete copy[socketId];
          return copy;
        });

        // If no more remote connections, reset status to connected (representing pure local state)
        if (Object.keys(peerConnectionsRef.current).length === 0) {
          setConnectionStatus('connected');
        }
      });

      // Handling custom signaling/room errors
      socket.on('error-message', ({ message }) => {
        setError(message);
        leaveMeeting();
      });

      return true;
    } catch (err: any) {
      console.error('[JOIN MEETING ERROR]:', err);
      setConnectionStatus('disconnected');
      return false;
    }
  };

  // Mute microphone toggle
  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        const nextState = !audioTrack.enabled;
        audioTrack.enabled = nextState;
        setIsMuted(!nextState);

        // Notify other room members
        if (socketRef.current) {
          socketRef.current.emit('update-media-state', { isMuted: !nextState });
        }
      }
    }
  };

  // Camera toggle
  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        const nextState = !videoTrack.enabled;
        videoTrack.enabled = nextState;
        setIsCameraOff(!nextState);

        // Notify other room members
        if (socketRef.current) {
          socketRef.current.emit('update-media-state', { isCameraOff: !nextState });
        }
      }
    }
  };

  // Screen sharing toggle implementation
  const toggleScreenShare = async () => {
    if (!roomId || !localStreamRef.current) return;

    try {
      if (!isScreenSharing) {
        // Start screen sharing
        console.log('[WEBRTC]: Requesting Screen share capture...');
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: 'always',
            displaySurface: 'monitor',
          } as any,
          audio: false,
        });

        screenShareStreamRef.current = stream;
        const screenTrack = stream.getVideoTracks()[0];

        // If user clicks "Stop Sharing" on browser banner, clean up correctly
        screenTrack.onended = () => {
          console.log('[WEBRTC]: Screen sharing track ended by browser control');
          stopScreenShare();
        };

        // Replace the local video track inside all RTCPeerConnections
        Object.keys(peerConnectionsRef.current).forEach((peerId) => {
          const pc = peerConnectionsRef.current[peerId];
          const senders = pc.getSenders();
          const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(screenTrack);
          }
        });

        // Set local stream rendering to display screen share
        // (For premium UI, we update the local video track element directly)
        setIsScreenSharing(true);

        if (socketRef.current) {
          socketRef.current.emit('update-media-state', { isScreenSharing: true });
        }
      } else {
        stopScreenShare();
      }
    } catch (err: any) {
      console.error('[MEDIA SCREEN SHARE ERROR]: Failed to start screen sharing', err);
    }
  };

  const stopScreenShare = () => {
    if (screenShareStreamRef.current) {
      screenShareStreamRef.current.getTracks().forEach((track) => track.stop());
      screenShareStreamRef.current = null;
    }

    // Revert to original local video track in all connections
    if (localStreamRef.current) {
      const originalVideoTrack = localStreamRef.current.getVideoTracks()[0];
      if (originalVideoTrack) {
        Object.keys(peerConnectionsRef.current).forEach((peerId) => {
          const pc = peerConnectionsRef.current[peerId];
          const senders = pc.getSenders();
          const videoSender = senders.find((s) => s.track && s.track.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(originalVideoTrack);
          }
        });
      }
    }

    setIsScreenSharing(false);

    if (socketRef.current) {
      socketRef.current.emit('update-media-state', { isScreenSharing: false });
    }
  };

  // Send textual chat message
  const sendChatMessage = (text: string) => {
    if (socketRef.current && text.trim()) {
      socketRef.current.emit('send-chat-message', { text });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      leaveMeeting();
    };
  }, []);

  return (
    <CallContext.Provider
      value={{
        username,
        isAuthenticated,
        login,
        logout,
        roomId,
        createMeeting,
        joinMeeting,
        leaveMeeting,
        localStream,
        remoteStreams,
        isMuted,
        isCameraOff,
        isScreenSharing,
        toggleMic,
        toggleCamera,
        toggleScreenShare,
        participants,
        hostId,
        activeCount: participants.length + 1, // Include local user
        chatMessages,
        sendChatMessage,
        connectionStatus,
        error,
        setError,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};
