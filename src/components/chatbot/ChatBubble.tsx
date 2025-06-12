'use client';

import React from 'react';
import { MessageCircle, Minimize2 } from 'lucide-react';

interface ChatBubbleProps {
  onClick: () => void;
  isMinimized?: boolean;
  hasUnreadMessages?: boolean;
}

export default function ChatBubble({
  onClick,
  isMinimized = false,
  hasUnreadMessages = false
}: ChatBubbleProps) {
  const handleClick = () => {
    console.log('ChatBubble: Button clicked!');
    onClick();
  };

  console.log('ChatBubble render:', { isMinimized, hasUnreadMessages });

  return (
    <button
      onClick={handleClick}
      className={`fixed left-4 bottom-4 ${
        isMinimized ? 'w-12 h-12' : 'w-14 h-14'
      } bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group z-40
      max-sm:left-2 max-sm:bottom-2 max-sm:w-12 max-sm:h-12`}
      title={isMinimized ? 'Restore Chat' : 'Open Chat Assistant'}
    >
      {/* Notification dot for unread messages */}
      {hasUnreadMessages && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>
      )}
      
      {/* Icon */}
      <div className="relative">
        {isMinimized ? (
          <Minimize2 size={20} className="transform rotate-180" />
        ) : (
          <MessageCircle size={24} />
        )}
        
        {/* Pulse animation for attention */}
        {!isMinimized && (
          <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20"></div>
        )}
      </div>
      
      {/* Tooltip */}
      <div className="absolute left-full ml-3 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
        {isMinimized ? 'Restore Chat' : 'Chat with AI Assistant'}
        <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-800"></div>
      </div>
    </button>
  );
}
