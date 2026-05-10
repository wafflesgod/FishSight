import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFish } from '../context/FishContext';
import './Header.css';

const logoImage = "/logo_noback.png"; 

const Header = () => {
    const { clearChat } = useFish();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const loggedInUser = localStorage.getItem('username');

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const handleLogout = () => {
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        clearChat();
        window.location.href = '/signin'; 
    };

    return (
        <nav className="navbar">
        {/* 1. Logo (Left Side) */}
        <Link to="/" className="logo-link">
            <img src={logoImage} alt="FishSight Logo" className="logo-img" />
            <span className="logo-text">FishSight</span>
        </Link>

        {/* 2. Hamburger Menu Icon (Only visible on Mobile) */}
        <div className="mobile-menu-icon" onClick={toggleMenu}>
            {isMenuOpen ? "✖" : "☰"} 
        </div>

        {/* 3. DESKTOP NAVIGATION (Hidden on Mobile) */}
        <div className="desktop-menu">
            <div className="nav-links">
            <Link to="/fish-id">Fish Identification</Link>
            <Link to="/fish-info">Fish Info</Link>
            <Link to="/chatbot">AI Chatbot</Link>
            <Link to="/forum">Community Forum</Link>
            </div>
            
            <div className="auth-buttons">
            {loggedInUser ? (
                <>
                <span className="greeting">Hi, {loggedInUser}!</span>
                <button onClick={handleLogout} className="btn btn-login">Logout</button>
                </>
            ) : (
                <>
                <Link to="/signin" className="btn btn-login">Login</Link>
                <Link to="/register" className="btn btn-register">Register</Link>
                </>
            )}
            </div>
        </div>

        {/* 4. MOBILE DROPDOWN NAVIGATION (Hidden on Desktop) */}
        {isMenuOpen && (
            <div className="mobile-dropdown">
            {loggedInUser && <span className="mobile-greeting">Hi, {loggedInUser}!</span>}
            
            <Link to="/fish-id" onClick={toggleMenu}>Fish Identification</Link>
            <Link to="/fish-info" onClick={toggleMenu}>Fish Info</Link>
            <Link to="/chatbot" onClick={toggleMenu}>AI Chatbot</Link>
            <Link to="/forum" onClick={toggleMenu}>Community Forum</Link>
            
            <div className="mobile-auth">
                {loggedInUser ? (
                <button onClick={handleLogout} className="btn btn-login">Logout</button>
                ) : (
                <>
                    <Link to="/signin" className="btn btn-login" onClick={toggleMenu}>Login</Link>
                    <Link to="/register" className="btn btn-register" onClick={toggleMenu}>Register</Link>
                </>
                )}
            </div>
            </div>
        )}
        </nav>
  );
};

export default Header;