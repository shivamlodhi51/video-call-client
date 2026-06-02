import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { useCall } from '../hooks/useCall';
import { formatTime } from '../utils/helpers';

export const ChatPanel: React.FC = () => {
  const { chatMessages, sendChatMessage, username } = useCall();
  const [text, setText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat panel to bottom on new message events
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      sendChatMessage(text.trim());
      setText('');
    }
  };

  return (
    <div className="w-80 h-full border-l border-white/5 bg-dark-900/80 backdrop-blur-md flex flex-col shadow-2xl relative z-10">
      
      {/* 1. Header */}
      <div className="p-4 border-b border-white/5 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-brand-400" />
        <h2 className="text-sm font-bold tracking-wider text-slate-100 uppercase">In-Call Chat</h2>
      </div>

      {/* 2. Messages List */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {chatMessages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 opacity-40 px-4">
            <div className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold">No messages yet</p>
            <p className="text-[10px] leading-relaxed">
              Send a text message. Everyone in this call can see it.
            </p>
          </div>
        ) : (
          chatMessages.map((msg) => {
            const isMe = msg.senderName === username;
            return (
              <div 
                key={msg.id} 
                className={`flex flex-col gap-1 max-w-[85%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
              >
                {/* Sender badge & timestamp */}
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[10px] font-bold text-slate-400">
                    {isMe ? 'You' : msg.senderName}
                  </span>
                  <span className="text-[9px] text-slate-500 font-medium">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                
                {/* Message bubble */}
                <div 
                  className={`px-3 py-2 rounded-2xl text-xs leading-relaxed break-all ${
                    isMe 
                      ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-tr-none' 
                      : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Send Input Form */}
      <form onSubmit={handleSend} className="p-4 border-t border-white/5 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Send a message..."
          className="flex-1 glass-input py-2 text-xs"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-brand-600 hover:bg-brand-500 text-white p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-brand-500/15 active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
