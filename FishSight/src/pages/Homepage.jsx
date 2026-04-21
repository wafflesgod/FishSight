import React from 'react';
import { Link } from 'react-router-dom'; // Import Link to navigate
import './Homepage.css';

const HomePage = () => {
  return (
    <div className="home-container">
      
      {/* 1. HERO SECTION */}
      <section className="hero-section">
        <h1 className="hero-title">Your Personal Aquarium Assistant</h1>
        <p className="hero-subtitle">
          Identify fish species instantly using AI, get personalized care advice, 
          and connect with other hobbyists.
        </p>
        
        {/* Click this to go to the AI Page */}
        <Link to="/fish-id" className="cta-button">
          Start Scanning Now
        </Link>
      </section>

      {/* 2. FEATURES SECTION */}
      <section className="features-section">
        <h2>Why Use FishSight?</h2>
        <div className="features-grid">
          
          <div className="feature-card">
            <div className="feature-icon">📸</div>
            <h3>Instant ID</h3>
            <p>Upload a photo and let our ResNet AI identify your fish species in seconds.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI Chatbot</h3>
            <p>Ask our Llama-powered assistant for care tips, tank setup, and disease advice.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h3>Community</h3>
            <p>Join the forum to share your tank photos and discuss with other hobbyists.</p>
          </div>

        </div>
      </section>
    </div>
  );
};

export default HomePage;