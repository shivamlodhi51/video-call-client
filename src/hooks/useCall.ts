import { useCall as useCallContext } from '../context/CallContext';

/**
 * Custom Hook to access WebRTC and Socket signaling state
 */
export const useCall = () => {
  return useCallContext();
};
