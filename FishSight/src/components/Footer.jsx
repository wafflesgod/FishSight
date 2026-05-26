import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMugHot } from "@fortawesome/free-solid-svg-icons";
import './Footer.css'; // Make sure to import the new CSS file!

const Footer = () => {
  return (
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
          {/* Replace the href below with your actual BuyMeACoffee or Ko-fi link later! */}
          <a href="https://www.buymeacoffee.com/" target="_blank" rel="noreferrer" className="btn-coffee">
            <FontAwesomeIcon icon={faMugHot} /> Buy me a coffee
          </a>
        </div>

      </div>

      {/* Copyright & Academic Tag */}
      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} FishSight. Developed as a Final Year Project for Multimedia University (MMU). All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;