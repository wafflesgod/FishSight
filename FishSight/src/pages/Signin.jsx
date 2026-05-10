import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Import toast!
import { AuthService } from '../services/API'; 
import './Auth.css'; 

const SignIn = () => {
  const navigate = useNavigate(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const data = await AuthService.login({ email, password });

      localStorage.setItem('username', data.username);
      localStorage.setItem('email', data.email);
        
      // Show smooth success toast
      toast.success(`Welcome back, ${data.username}!`);
      
      // Soft redirect so the toast survives the journey
      navigate('/'); 
      
    } catch (error) {
      // Show smooth error toast
      toast.error("Login Failed: " + error.message);
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