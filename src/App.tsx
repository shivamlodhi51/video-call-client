import React, { useEffect, useState } from 'react';
import { useCall } from './hooks/useCall';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Room } from './pages/Room';
import { ErrorBoundary } from './components/ErrorBoundary';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useCall();
  const [roomIdState, setRoomIdState] = useState<string>('');

  // Extract room ID from window.location.pathname on load or popstate
  const getRoomIdFromUrl = (): string => {
    const path = window.location.pathname;
    const match = path.match(/^\/room\/([a-z]{3}-[a-z]{3}-[a-z]{3})$/);
    return match ? match[1] : '';
  };

  useEffect(() => {
    // Initial parse
    setRoomIdState(getRoomIdFromUrl());

    // Listen for browser forward/backward navigations
    const handlePopState = () => {
      setRoomIdState(getRoomIdFromUrl());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToRoom = (id: string) => {
    window.history.pushState(null, '', `/room/${id}`);
    setRoomIdState(id);
  };

  const navigateHome = () => {
    window.history.pushState(null, '', '/');
    setRoomIdState('');
  };

  // 1. Force name registration before entering any screen (Login check)
  if (!isAuthenticated) {
    return <Login />;
  }

  // 2. If authenticated and a valid room ID exists in URL path, render Room session
  if (roomIdState) {
    return <Room roomIdFromUrl={roomIdState} onNavigateHome={navigateHome} />;
  }

  // 3. Otherwise, serve landing home dashboard
  return <Home onNavigateToRoom={navigateToRoom} />;
};

function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;
