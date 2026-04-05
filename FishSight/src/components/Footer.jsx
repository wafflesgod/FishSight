import React from 'react';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <p>&copy; {new Date().getFullYear()} FishSight. All rights reserved.</p>
    </footer>
  );
};

// --- THIS WAS MISSING ---
export default Footer; 
// ------------------------

// Simple internal styles for now
const styles = {
  footer: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    textAlign: 'center',
    borderTop: '1px solid #e7e7e7',
    marginTop: 'auto' /* Keeps footer at bottom */
  }
};