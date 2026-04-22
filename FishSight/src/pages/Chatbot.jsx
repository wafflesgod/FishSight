import React, { useState, useEffect, useRef } from 'react';
// 1. We removed axios and imported ChatService instead!
import { ChatService } from '../services/api'; 
import './Chatbot.css'; 

const Chatbot = () => {
  const [input, setInput] = useState('');
  // 2. Updated the greeting to focus only on fish!
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your Aquarium Assistant. Ask me about your fish! 🐟' }
  ]);
  const [loading, setLoading] = useState(false);
  
  // Auto-scroll to bottom
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // 1. Add User Message
    const userMessage = { sender: 'user', text: input };
    const newMessages = [...messages, userMessage]; 
    
    setMessages(newMessages);
    setLoading(true);
    setInput('');

    try {
      // 2. Prepare History (Send last 6 messages to Python)
      const history = newMessages.slice(-6); 

      // 3. Send to Backend using your clean ChatService!
      const data = await ChatService.sendMessage({
        message: input,
        history: history 
      });

      // 4. Add Bot Response (API.js already handles the .json() parsing)
      const botMessage = { sender: 'bot', text: data.response };
      setMessages((prev) => [...prev, botMessage]);
      
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = { sender: 'bot', text: 'Error: Could not reach the brain. Is Python running?' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-page">
      <div className="chat-window">
        {/* Messages Area */}
        <div className="messages-list">
          {messages.map((msg, index) => (
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
            // 3. Updated placeholder text!
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