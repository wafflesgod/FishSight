import React, { useState, useEffect, useRef } from 'react';
import { ChatService } from '../services/API'; 
import { useFish } from '../context/FishContext'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import './Chatbot.css'; 

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  
  // 🚨 NEW: State to control the mobile history drawer
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const username = localStorage.getItem('username') || 'Guest';
  const { chatMessages, setChatMessages } = useFish();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [chatMessages]);

  const handleAutoResize = (e) => {
    e.target.style.height = 'auto'; 
    e.target.style.height = `${e.target.scrollHeight + 2}px`; 
  };
  
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await ChatService.getHistory(username);
      setSessions(data);
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setChatMessages([]); 
    setIsSidebarOpen(false); // Close drawer on mobile
  };

  const loadSession = (session) => {
    setCurrentSessionId(session._id);
    const loadedMessages = [];
    session.Messages.forEach(msg => {
      loadedMessages.push({ sender: 'user', text: msg.query });
      loadedMessages.push({ sender: 'bot', text: msg.response });
    });
    setChatMessages(loadedMessages); 
    setIsSidebarOpen(false); // Close drawer on mobile
  };

  const deleteSession = async (sessionId, e) => {
    e.stopPropagation(); 
    try {
      await ChatService.deleteSession(sessionId, { username });
      if (currentSessionId === sessionId) {
        handleNewChat();
      }
      fetchHistory(); 
    } catch (err) {
      console.error("Failed to delete chat", err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    const newMessages = [...chatMessages, userMessage]; 
    
    setChatMessages(newMessages); 
    setLoading(true);
    setInput('');

    if (inputRef.current) {
      inputRef.current.style.height = '';
    }

    try {
      const history = newMessages.slice(-6); 
      const data = await ChatService.sendMessage({
        message: input,
        history: history,
        username: username,
        session_id: currentSessionId
      });

      const botMessage = { sender: 'bot', text: data.response };
      setChatMessages((prev) => [...prev, botMessage]);
      
      if (!currentSessionId && data.session_id) {
        setCurrentSessionId(data.session_id);
        fetchHistory(); 
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = { sender: 'bot', text: 'Error: Could not reach the brain. Is Python running?' };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-page">
      
      {/* 🚨 NEW: Dark overlay that appears on mobile when sidebar is open */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* THE LEFT SIDEBAR (Now controlled by CSS classes instead of inline styles) */}
      <div className={`chat-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button className="btn-new-chat" onClick={handleNewChat}>
          <FontAwesomeIcon icon={faPlus} /> New Chat
        </button>
        
        <h4>Recent Conversations</h4>
        
        <div className="session-list">
          {sessions.map(session => (
            <div 
              key={session._id} 
              onClick={() => loadSession(session)}
              className={`session-item ${currentSessionId === session._id ? 'active' : ''}`}
            >
              <span className="session-title">{session.FirstMessage}</span>
              <button 
                className="btn-delete-chat"
                onClick={(e) => deleteSession(session._id, e)}
                title="Delete Chat"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          ))}
          {sessions.length === 0 && (
            <p className="no-chats">No recent chats.</p>
          )}
        </div>
      </div>

      {/* THE MAIN CHAT WINDOW */}
      <div className="chat-window">
        
        {/* 🚨 NEW: Mobile-only header to toggle the history drawer */}
        <div className="chat-mobile-header">
          <button onClick={() => setIsSidebarOpen(true)}>
            <FontAwesomeIcon icon={faBars} /> History
          </button>
          <span>AI Assistant 🐟</span>
        </div>

        <div className="messages-list">
          {chatMessages.map((msg, index) => (
            <div key={index} className={`message-bubble ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
          {loading && <div className="message-bubble bot">Thinking... 🐟</div>}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <textarea
            ref={inputRef}
            rows="1" // Starts as 1 line
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleAutoResize(e);
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { // Prevents send on Shift+Enter
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask about Neon Tetras..."
            disabled={loading}
          />
          <button onClick={sendMessage} disabled={loading}>
            {loading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;