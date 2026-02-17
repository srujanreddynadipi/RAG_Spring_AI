import React from 'react';

const ChatBubble = ({ message, isUser }) => {
  return (
    <div className={`chat-bubble-wrapper ${isUser ? 'user-bubble' : 'assistant-bubble'}`}>
      <div className="chat-bubble">
        <div className="bubble-content">
          <p>{message.content}</p>
        </div>
        <div className="bubble-timestamp">
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
