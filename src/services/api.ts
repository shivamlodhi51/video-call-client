const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://10.131.146.28:5000';
// const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export interface CreateRoomResponse {
  success: boolean;
  message: string;
  room: {
    id: string;
    createdAt: number;
  };
}

export interface ValidateRoomResponse {
  success: boolean;
  exists: boolean;
  room?: {
    id: string;
    participantCount: number;
  };
  message?: string;
}

/**
 * Creates a new meeting room.
 */
export const createRoomApi = async (): Promise<CreateRoomResponse> => {
  const response = await fetch(`${BACKEND_URL}/api/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to create room');
  }

  return response.json();
};

/**
 * Validates if a meeting room exists and is active.
 */
export const validateRoomApi = async (roomId: string): Promise<ValidateRoomResponse> => {
  const response = await fetch(`${BACKEND_URL}/api/rooms/validate/${roomId}`);

  if (!response.ok && response.status !== 404) {
    throw new Error('Failed to validate room');
  }

  return response.json();
};
