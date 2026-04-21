import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '../services/API'; // Importing your API setup
import './Auth.css'; // Import the shared styles

const SignIn = () => {
  const navigate = useNavigate(); // Hook for redirection (optional if using window.location)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // 1. Send data to the Python backend using your api.js file
      const data = await AuthService.login({ email, password });

      // 2. Save user details to browser memory so the Header updates
      localStorage.setItem('username', data.username);
      localStorage.setItem('email', data.email);
        
      // 3. Success message and redirect to the homepage
      alert("Login Successful!");
      window.location.href = '/'; 
      
    } catch (error) {
      // 4. Handle incorrect password or server errors
      console.error("Login error:", error);
      alert("Login Failed: " + error.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Welcome Back</h2>
      <form onSubmit={handleSubmit}>
        
        <div className="form-group">
          <label>Email Address</label>
          <input 
            type="email" 
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="auth-btn">Sign In</button>
      </form>

      <div className="auth-link">
        Don't have an account? <Link to="/register">Register here</Link>
      </div>
    </div>
  );
};

export default SignIn;