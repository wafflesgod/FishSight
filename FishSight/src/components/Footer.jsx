import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMugHot, faTimes } from "@fortawesome/free-solid-svg-icons";
import './Footer.css'; 

const Footer = () => {
  // 🚨 NEW: State to control the popup modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <footer className="site-footer">
        <div className="footer-content">
          
          {/* Column 1: Brand & Intro */}
          <div className="footer-brand">
            <h3>🐟 FishSight</h3>
            <p>
              Your AI-powered aquatic companion. Identify freshwater species, get expert care advice, 
              and connect with a growing community of aquarium hobbyists.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-links">
            <h4>Explore</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/fish-id">Fish Identification</Link></li>
              <li><Link to="/fish-info">Encyclopedia</Link></li>
              <li><Link to="/chatbot">AI Chatbot</Link></li>
              <li><Link to="/forum">Community Forum</Link></li>
            </ul>
          </div>

          {/* Column 3: Support / Buy Me a Coffee */}
          <div className="footer-support">
            <h4>Support the Project</h4>
            <p>
              FishSight is free to use! If you find our AI tools helpful for your aquarium, 
              consider supporting the server and development costs.
            </p>
            {/* 🚨 CHANGED: This is now a button that opens the modal instead of a link! */}
            <button onClick={() => setIsModalOpen(true)} className="btn-coffee">
              <FontAwesomeIcon icon={faMugHot} /> Buy me a coffee
            </button>
          </div>

        </div>

        {/* Copyright & Academic Tag */}
        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} FishSight. Developed as a Final Year Project for Multimedia University (MMU). All rights reserved.
          </p>
        </div>
      </footer>

      {/* ========================================== */}
      {/* 🚨 NEW: THE ACADEMIC FAKE-OUT MODAL        */}
      {/* ========================================== */}
      {isModalOpen && (
        <div className="donation-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="donation-modal-content" onClick={(e) => e.stopPropagation()}>
            
            <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="modal-icon-large">
              <FontAwesomeIcon icon={faMugHot} bounce style={{ '--fa-animation-duration': '2s' }}/>
            </div>
            
            <h3>Thank You for Your Support! 🐟</h3>
            <p>
              We are thrilled that you want to support FishSight! However, as this is currently a 
              <strong> Final Year Project prototype</strong>, real financial transactions are disabled.
            </p>
            
            <p className="modal-highlight">
              Your willingness to contribute means the world to us and is the best validation this project could ask for!
            </p>
            
            <button className="btn-primary" onClick={() => setIsModalOpen(false)} style={{ marginTop: '15px' }}>
              Return to FishSight
            </button>
            
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;