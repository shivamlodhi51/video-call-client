export interface Participant {
  socketId: string;
  username: string;
  joinedAt: number;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export interface SignalData {
  type: 'offer' | 'answer' | 'candidate';
  sdp?: string;
  candidate?: any;
}

export interface SignalPayload {
  to: string;
  from: string;
  signal: SignalData;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'failed';

export interface UserState {
  username: string;
  isAuthenticated: boolean;
}
