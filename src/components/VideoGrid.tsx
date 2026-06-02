import React from 'react';
import { VideoCard } from './VideoCard';

interface VideoGridProps {
  localStream: MediaStream | null;
  remoteStreams: Record<string, {
    socketId: string;
    username: string;
    stream: MediaStream;
    isMuted: boolean;
    isCameraOff: boolean;
    isScreenSharing: boolean;
  }>;
  username: string;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  localStream,
  remoteStreams,
  username,
  isMuted,
  isCameraOff,
  isScreenSharing,
}) => {
  const remotesList = Object.values(remoteStreams);
  const totalFeeds = remotesList.length + 1; // Remotes + Local

  // Dynamic Tailwind grid grid configuration depending on active participant slots
  let gridLayoutClass = 'grid-cols-1 max-w-2xl mx-auto';
  if (totalFeeds === 2) {
    gridLayoutClass = 'grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto';
  } else if (totalFeeds >= 3 && totalFeeds <= 4) {
    gridLayoutClass = 'grid-cols-1 md:grid-cols-2';
  } else if (totalFeeds > 4) {
    gridLayoutClass = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 flex items-center justify-center min-h-[400px]">
      <div className={`grid gap-6 w-full ${gridLayoutClass} items-center duration-500`}>
        {/* 1. Local Video Card */}
        <VideoCard
          stream={localStream}
          username={username}
          isLocal={true}
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          isScreenSharing={isScreenSharing}
        />

        {/* 2. Remote Participant Cards */}
        {remotesList.map((remote) => (
          <VideoCard
            key={remote.socketId}
            stream={remote.stream}
            username={remote.username}
            isLocal={false}
            isMuted={remote.isMuted}
            isCameraOff={remote.isCameraOff}
            isScreenSharing={remote.isScreenSharing}
          />
        ))}
      </div>
    </div>
  );
};
