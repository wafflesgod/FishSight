import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Required for the pop-up styling
import { FishProvider } from './context/FishContext'; // Your new Global Brain

import './App.css';
import Chatbot from './pages/Chatbot';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/Homepage';
import SignIn from './pages/Signin';
import Register from './pages/Register';
import FishId from './pages/FishId';
import FishInfo from './pages/FishInfo';
import Forum from './pages/Forum';

// THE BOUNCER
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <FishProvider>
        {/* 2. Moved to bottom-right so it never blocks your navbar! */}
        <ToastContainer position="bottom-right" theme="colored" />
        
        <div className="app-container">
          <Header />
          
          <main className="main-content">
            <Routes>
              {/* Main Pages */}
              <Route path="/" element={<HomePage />} />
              <Route path="/fish-id" element={<FishId />} />
              
              {/* Placeholders */}
              <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
              <Route path="/forum" element={<Forum />} />

              {/* Auth Pages */}
              <Route path="/signin" element={<SignIn />} />
              <Route path="/register" element={<Register />} />

              {/* Fish Info Page */}
              <Route path="/fish-info" element={<FishInfo />} />

              {/* Catch-All for errors */}
              <Route path="*" element={<h1 style={{color: 'red', textAlign:'center', marginTop:'50px'}}>404 - Page Not Found</h1>} />
            </Routes>
          </main>

          <Footer />
        </div>
      </FishProvider>
    </Router>
  );
}

export default App;