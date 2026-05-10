import React from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children }) => {
  // Check if the user is logged in by looking for their username in local storage
  const isAuthenticated = localStorage.getItem('username'); 

  if (!isAuthenticated) {
    // If they aren't logged in, trigger a warning toast
    // The toastId prevents it from spamming multiple pop-ups if they click rapidly
    toast.warning("🔒 You must be logged in to use the Aquarium Assistant!", { toastId: 'authWarning' });
    
    // Redirect them instantly to the sign-in page
    return <Navigate to="/signin" replace />;
  }

  // If they are logged in, let them through!
  return children;
};

export default ProtectedRoute;