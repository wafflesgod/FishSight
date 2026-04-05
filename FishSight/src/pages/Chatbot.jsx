import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Chatbot.css'; // Ensure this file exists for styling

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am your Aquarium Assistant. Ask me about your fish or plants! 🐟' }
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
    const newMessages = [...messages, userMessage]; // Temporary variable to hold current state
    
    setMessages(newMessages);
    setLoading(true);
    setInput('');

    try {
      // 2. Prepare History (Send last 6 messages to Python)
      const history = newMessages.slice(-6); 

      // 3. Send to Backend
      const response = await axios.post('http://127.0.0.1:5000/chat', {
        message: input,
        history: history // <--- This fixes the "Amnesia"
      });

      // 4. Add Bot Response
      const botMessage = { sender: 'bot', text: response.data.response };
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
            placeholder="Ask about Nymphaea zenkeri..."
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