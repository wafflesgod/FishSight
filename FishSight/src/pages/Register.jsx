import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Import toast!
import { AuthService } from '../services/API'; 
import './Auth.css';

const Register = () => {
  const navigate = useNavigate(); 
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      // Error toast
      toast.error("Passwords do not match!");
      return;
    }

    try {
      await AuthService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      // Success toast
      toast.success("Registration Successful! Please sign in.");
      navigate('/signin'); 

    } catch (error) {
      // Error toast
      toast.error("Registration Failed: " + error.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
         <div className="form-group">
           <label>Username</label>
           <input type="text" name="username" placeholder="Choose a username" value={formData.username} onChange={handleChange} required />
         </div>

         <div className="form-group">
           <label>Email Address</label>
           <input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} required />
         </div>

         <div className="form-group">
           <label>Password</label>
           <input type="password" name="password" placeholder="Create a password" value={formData.password} onChange={handleChange} required />
         </div>

         <div className="form-group">
           <label>Confirm Password</label>
           <input type="password" name="confirmPassword" placeholder="Type password again" value={formData.confirmPassword} onChange={handleChange} required />
         </div>

         <button type="submit" className="auth-btn">Sign Up</button>
      </form>
      <div className="auth-link">
        Already have an account? <Link to="/signin">Sign in here</Link>
      </div>
    </div>
  );
};

export default Register;