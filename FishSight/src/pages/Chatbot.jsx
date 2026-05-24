import React, { useState, useEffect, useRef } from 'react';
import { ChatService } from '../services/API'; 
import { useFish } from '../context/FishContext'; 
import './Chatbot.css'; 

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // NEW: States for the Gemini-style History Sidebar
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  
  // Grab the user to fetch their specific history
  const username = localStorage.getItem('username') || 'Guest';

  // Global Brain connection
  const { chatMessages, setChatMessages } = useFish();

  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [chatMessages]);

  // ==========================================
  // NEW: CHAT HISTORY LOGIC
  // ==========================================
  
  // 1. Fetch history when the component loads
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await ChatService.getHistory(username);
      setSessions(data);
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  // 2. Start a New Chat
  const handleNewChat = () => {
    setCurrentSessionId(null);
    setChatMessages([]); // Clear the global brain for a fresh start!
  };

  // 3. Load an Old Chat from the Sidebar
  const loadSession = (session) => {
    setCurrentSessionId(session._id);
    
    // Convert the database format back to our React format
    const loadedMessages = [];
    session.Messages.forEach(msg => {
      loadedMessages.push({ sender: 'user', text: msg.query });
      loadedMessages.push({ sender: 'bot', text: msg.response });
    });
    
    setChatMessages(loadedMessages); // Inject history into the global brain
  };

  // 4. Delete a Chat
  const deleteSession = async (sessionId, e) => {
    e.stopPropagation(); // Prevents the click from also triggering loadSession
    try {
        await ChatService.deleteSession(sessionId, { username });
      
      // If we delete the chat we are currently looking at, clear the screen
      if (currentSessionId === sessionId) {
        handleNewChat();
      }
      fetchHistory(); // Refresh the sidebar
    } catch (err) {
      console.error("Failed to delete chat", err);
    }
  };

  // ==========================================
  // EXISTING SEND LOGIC (UPDATED)
  // ==========================================
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    const newMessages = [...chatMessages, userMessage]; 
    
    setChatMessages(newMessages); 
    setLoading(true);
    setInput('');

    try {
      const history = newMessages.slice(-6); 

      // UPDATED: We now pass username and session_id to the API!
      const data = await ChatService.sendMessage({
        message: input,
        history: history,
        username: username,
        session_id: currentSessionId
      });

      const botMessage = { sender: 'bot', text: data.response };
      setChatMessages((prev) => [...prev, botMessage]);
      
      // NEW: If this was the first message of a new chat, Flask generated an ID.
      // Save it and refresh the sidebar so the new chat appears!
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
    // Wrap the whole thing in a flex container for the sidebar layout
    <div className="chatbot-page" style={{ display: 'flex', gap: '20px', height: '80vh' }}>
      
      {/* ========================================== */}
      {/* NEW: THE LEFT SIDEBAR (Gemini Style)         */}
      {/* ========================================== */}
      <div className="chat-sidebar" style={{ 
        width: '260px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '12px', 
        padding: '15px', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
      }}>
        <button 
          onClick={handleNewChat} 
          style={{ padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#007bff', color: 'white', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px' }}
        >
          ➕ New Chat
        </button>
        
        <h4 style={{ margin: '0 0 10px 5px', color: '#6c757d', fontSize: '0.9rem' }}>Recent Conversations</h4>
        
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {sessions.map(session => (
            <div 
              key={session._id} 
              onClick={() => loadSession(session)}
              style={{ 
                padding: '10px', 
                cursor: 'pointer', 
                borderRadius: '8px',
                backgroundColor: currentSessionId === session._id ? '#e9ecef' : 'transparent',
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '5px',
                transition: 'background-color 0.2s'
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.95rem' }}>
                {session.FirstMessage}
              </span>
              <button 
                onClick={(e) => deleteSession(session._id, e)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}
                title="Delete Chat"
              >
                🗑️
              </button>
            </div>
          ))}
          {sessions.length === 0 && (
            <p style={{ textAlign: 'center', color: '#adb5bd', marginTop: '20px', fontSize: '0.9rem' }}>No recent chats.</p>
          )}
        </div>
      </div>

      {/* ========================================== */}
      {/* EXISTING: THE MAIN CHAT WINDOW             */}
      {/* ========================================== */}
      <div className="chat-window" style={{ flex: 1 }}>
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
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
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