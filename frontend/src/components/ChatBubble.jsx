import React from 'react';

const ChatBubble = ({ message, isUser }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '';
    }
  };

  return (
    <div className={`chat-bubble-wrapper ${isUser ? 'user-bubble' : 'assistant-bubble'}`}>
      <div className="chat-bubble">
        <div className="bubble-content">
          <p>{message.content}</p>
        </div>
        {message.timestamp && (
          <div className="bubble-timestamp">
            {formatTime(message.timestamp)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
