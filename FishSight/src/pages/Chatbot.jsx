import React, { useState, useEffect, useRef } from 'react';
import { ChatService } from '../services/API'; 
import { useFish } from '../context/FishContext'; // 1. Import the Global Brain
import './Chatbot.css'; 

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 2. NO MORE SESSION STORAGE! Pull from Context instead.
  const { chatMessages, setChatMessages } = useFish();

  // Auto-scroll to bottom
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [chatMessages]); // Watch the context variable!

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    const newMessages = [...chatMessages, userMessage]; 
    
    setChatMessages(newMessages); // Update the Global Brain
    setLoading(true);
    setInput('');

    try {
      const history = newMessages.slice(-6); 

      const data = await ChatService.sendMessage({
        message: input,
        history: history 
      });

      const botMessage = { sender: 'bot', text: data.response };
      setChatMessages((prev) => [...prev, botMessage]);
      
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
      <div className="chat-window">
        {/* Messages Area */}
        <div className="messages-list">
          {chatMessages.map((msg, index) => (
            <div key={index} className={`message-bubble ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
          {loading && <div className="message-bubble bot">Thinking... 🐟</div>}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
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