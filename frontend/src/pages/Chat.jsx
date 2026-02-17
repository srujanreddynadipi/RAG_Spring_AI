import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ChatBubble from '../components/ChatBubble';
import '../styles/Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [maxResults, setMaxResults] = useState(3);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.2);
  const [showSettings, setShowSettings] = useState(false);

  const messagesEndRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const history = await chatAPI.getHistory(50);
      setMessages(history);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim()) {
      return;
    }

    const userMessage = {
      content: inputMessage,
      role: 'USER',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await chatAPI.sendMessage(
        inputMessage,
        sessionId,
        maxResults,
        similarityThreshold
      );

      const assistantMessage = {
        content: response.response,
        role: 'ASSISTANT',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setSessionId(response.sessionId);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        role: 'ASSISTANT',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSession = async () => {
    if (sessionId) {
      try {
        await chatAPI.clearSession(sessionId);
        setMessages([]);
        setSessionId(null);
      } catch (error) {
        console.error('Error clearing session:', error);
      }
    } else {
      setMessages([]);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-left">
          <h2>RAG Chatbot</h2>
          <span className="username">@{user?.username}</span>
        </div>
        <div className="header-right">
          <button onClick={() => navigate('/upload')} className="btn btn-secondary">
            Upload Documents
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className="btn btn-secondary">
            Settings
          </button>
          <button onClick={handleClearSession} className="btn btn-secondary">
            Clear Chat
          </button>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="settings-panel">
          <div className="setting-item">
            <label>
              Max Results: 
              <input
                type="number"
                value={maxResults}
                onChange={(e) => setMaxResults(parseInt(e.target.value))}
                min="1"
                max="10"
              />
            </label>
          </div>
          <div className="setting-item">
            <label>
              Similarity Threshold: 
              <input
                type="number"
                value={similarityThreshold}
                onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
                min="0"
                max="1"
                step="0.1"
              />
            </label>
          </div>
        </div>
      )}

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <h3>Welcome to RAG Chatbot!</h3>
            <p>Ask me anything about your uploaded documents.</p>
            <p>Upload documents to get started.</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <ChatBubble
              key={index}
              message={message}
              isUser={message.role === 'USER'}
            />
          ))
        )}
        {loading && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <form onSubmit={handleSendMessage} className="chat-input-form">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            className="chat-input"
          />
          <button 
            type="submit" 
            className="btn btn-primary send-button"
            disabled={loading || !inputMessage.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
