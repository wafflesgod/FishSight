import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        
        <main className="main-content">
          <Routes>
            {/* 1. Main Pages */}
            <Route path="/" element={<HomePage />} />
            <Route path="/fish-id" element={<FishId />} />
            
            {/* 2. Placeholders */}
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/forum" element={<Forum />} />

            {/* 3. Auth Pages */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/register" element={<Register />} />

            {/* 4. Fish Info Page */}
            <Route path="/fish-info" element={<FishInfo />} />

            {/* 4. Catch-All for errors */}
            <Route path="*" element={<h1 style={{color: 'red', textAlign:'center', marginTop:'50px'}}>404 - Page Not Found</h1>} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;