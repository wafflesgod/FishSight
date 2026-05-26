import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faCamera, faEarthAsia, faBrain } from "@fortawesome/free-solid-svg-icons";
import './Homepage.css';

// ==========================================
// NATIVE 3D TILT CARD COMPONENT
// ==========================================
const TiltCard = ({ icon, title, description }) => {
  const cardRef = useRef(null);
  const [rotStyle, setRotStyle] = useState({ transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)' });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const rotX = ((mouseY / height) - 0.5) * -30;
    const rotY = ((mouseX / width) - 0.5) * 30;

    setRotStyle({
      transform: `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`
    });
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
    });
  };

  return (
    <div 
      ref={cardRef}
      className="tilt-card-wrapper"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleMouseLeave}
      style={rotStyle}
    >
      <div className="tilt-card-inner">
        <div className="tilt-icon" style={{ transform: 'translateZ(60px)' }}>
          <FontAwesomeIcon 
            icon={icon} 
            bounce={isHovering} 
            style={{ '--fa-animation-duration': '1.5s' }} 
          />
        </div>
        <h3 style={{ transform: 'translateZ(40px)' }}>{title}</h3>
        <p style={{ transform: 'translateZ(20px)' }}>{description}</p>
      </div>
    </div>
  );
};

// ==========================================
// MAIN HOMEPAGE COMPONENT
// ==========================================
const HomePage = () => {
  const topSectionsRef = useRef(null); 
  const carouselRef = useRef(null); 
  const isHovered = useRef(false);  

  // ==========================================
  // NEW: HANDLE COMMUNITY IMAGE SUBMISSIONS
  // ==========================================
  const handleImageSubmission = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const currentUser = localStorage.getItem('username') || 'Anonymous';

    const toastId = toast.loading("Uploading image data...");
    
    // Convert image to Base64 String
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64Image = reader.result;
      
      try {
        // Direct fetch to your Main Server!
        const response = await fetch('https://fishsight-h6z5.onrender.com/api/submit-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: currentUser,
            image_data: base64Image,
            timestamp: new Date().toISOString()
          })
        });

        if (response.ok) {
          toast.update(toastId, { 
            render: "Image submitted successfully! Thank you! 🐟", 
            type: "success", 
            isLoading: false, 
            autoClose: 4000 
          });
        } else {
          toast.update(toastId, { 
            render: "Failed to submit image. Server might be busy.", 
            type: "error", 
            isLoading: false, 
            autoClose: 4000 
          });
        }
      } catch (error) {
        console.error("Error submitting image:", error);
        toast.update(toastId, { 
            render: "Failed to submit image. Is Python running?", 
            type: "error", 
            isLoading: false, 
            autoClose: 4000 
        });
      }
    };
  };

  // MAGIC MOUSE TRAIL EFFECT
  useEffect(() => {
    const wrapper = topSectionsRef.current;
    if (!wrapper) return;

    const particlesContainer = document.getElementById('particles-container');

    const handleMouseMove = (e) => {
      const rect = wrapper.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const particle = document.createElement('div');
      particle.className = 'particle';
      const size = Math.random() * 4 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${mouseX}px`;
      particle.style.top = `${mouseY}px`;
      particle.style.opacity = '0.8'; 
      particlesContainer.appendChild(particle);
      
      setTimeout(() => {
          particle.style.transition = 'all 1.5s ease-out';
          particle.style.left = `${mouseX + (Math.random() * 20 - 10)}px`;
          particle.style.top = `${mouseY + (Math.random() * 20 - 10)}px`;
          particle.style.opacity = '0';
          setTimeout(() => particle.remove(), 1500);
      }, 10);
    };

    wrapper.addEventListener('mousemove', handleMouseMove);
    return () => wrapper.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // SMART NATIVE CAROUSEL & WHEEL LOGIC
  useEffect(() => {
    const track = carouselRef.current;
    if (!track) return;
    let animationFrameId;

    const scrollStep = () => {
      if (!isHovered.current) {
        track.scrollLeft += 1.5; 
        if (track.scrollLeft >= track.scrollWidth / 2) {
          track.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scrollStep);
    };
    animationFrameId = requestAnimationFrame(scrollStep);

    const handleNativeWheel = (e) => {
      if (isHovered.current) {
        e.preventDefault(); 
        track.scrollLeft += (e.deltaY + e.deltaX);
        if (track.scrollLeft <= 0) {
          track.scrollLeft = track.scrollWidth / 2;
        } else if (track.scrollLeft >= track.scrollWidth / 2) {
          track.scrollLeft = 0;
        }
      }
    };

    track.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => {
      cancelAnimationFrame(animationFrameId);
      track.removeEventListener('wheel', handleNativeWheel);
    };
  }, []);

  // GENERATE 50 RANDOM SHOOTING STARS
  const stars = Array.from({ length: 50 }).map((_, i) => {
    const tailLength = (Math.random() * 2.5 + 5).toFixed(2); 
    const topOffset = (Math.random() * 100).toFixed(2); 
    const fallDuration = (Math.random() * 6 + 6).toFixed(3); 
    const fallDelay = (Math.random() * 10).toFixed(3); 

    return (
      <div 
        key={i} className="star"
        style={{
          '--star-tail-length': `${tailLength}em`, '--top-offset': `${topOffset}%`, 
          '--fall-duration': `${fallDuration}s`, '--fall-delay': `${fallDelay}s`
        }}
      ></div>
    );
  });

  const carouselFish = [
    { name: "Neon Tetra", img: "/fish_images/neon_tetra.jpg" }, 
    { name: "Cherry Barb", img: "/fish_images/cherry_barb.jpg" },
    { name: "Guppy", img: "/fish_images/guppy.jpg" },
    { name: "Angel Fish", img: "/fish_images/angel_fish.jpg" },
    { name: "Goldfish", img: "/fish_images/goldfish.jpg" },
    { name: "Corydoras", img: "/fish_images/corydoras.jpg" }
  ];
  
  const infiniteFish = [...carouselFish, ...carouselFish];

  return (
    <div className="home-container">
      
      <div className="top-sections-wrapper" ref={topSectionsRef}>
        
        <div className="stars">{stars}</div>
        <div className="particles-container" id="particles-container"></div>
        
        {/* SLIDE 1. HERO SECTION */}
        <section className="hero-wrapper">
          <div className="hero-content-flex">
            <div className="hero-text-block">
              <h1 className="hero-title">Discover Your Perfect Aquatic World</h1>
              <p className="hero-subtitle">
                AI-powered fish identification and expert aquarium guidance at your fingertips.
              </p>
              
              <div className="hero-buttons">
                <Link to="/fish-id" className="btn-primary">Explore Now</Link>
                <Link to="/chatbot" className="btn-secondary">Ask the AI</Link>
              </div>

              <div className="hero-stats">
                <div className="stat-item">
                  <span className="stat-number">12</span>
                  <span className="stat-label">Species Trained</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-number">98%</span>
                  <span className="stat-label">AI Accuracy</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-number">Dual-AI</span>
                  <span className="stat-label">Architecture</span>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div className="visual-box">
                <div className="tech-badge">✨ Powered by ResNet50</div>
                <img src="/demo.gif" alt="FishSight App Demo" className="demo-gif" />
              </div>
            </div>
          </div>
        </section>

        {/* SLIDE 2. FISH CAROUSEL SECTION */}
        <section className="carousel-section">
          <div className="carousel-header">
            <h2>Explore The Encyclopedia</h2>
            <p>Get detailed care guides, tank requirements, and breeding habits for your favorite species.</p>
          </div>
          
          <div 
            className="carousel-track-container" 
            ref={carouselRef}
            onMouseEnter={() => isHovered.current = true}
            onMouseLeave={() => isHovered.current = false}
            onTouchStart={() => isHovered.current = true}
            onTouchEnd={() => isHovered.current = false}
          >
            <div className="carousel-track">
              {infiniteFish.map((fish, index) => (
                <div key={index} className="carousel-card">
                  <div className="image-fallback">{fish.name}</div>
                  <img src={fish.img} alt={fish.name} className="carousel-img" />
                  
                  <div className="carousel-card-overlay">
                    <h3>{fish.name}</h3>
                    <Link to="/fish-info" className="btn-view-info">View Care Info</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SLIDE 3. FEATURES (3D TILT CARDS) */}
        <section className="features-section">
          <div className="features-header">
            <h2>Why Choose FishSight?</h2>
            <p>Everything you need to master the aquarium hobby, powered by advanced artificial intelligence.</p>
          </div>
          
          <div className="features-grid-3d">
            <TiltCard 
              icon={faRobot} 
              title="Context-Aware Chatbot" 
              description="Our NLP model remembers your tank setup and past conversations to provide highly personalized care advice." 
            />
            <TiltCard 
              icon={faCamera} 
              title="Instant Species ID" 
              description="Upload a photo and let our custom ResNet50 vision model identify your fish in seconds." 
            />
            <TiltCard 
              icon={faEarthAsia} 
              title="Community Forum" 
              description="Share tank photos, ask for advice, and get instant AI-generated summaries of long discussion threads." 
            />
            <TiltCard 
              icon={faBrain} 
              title="Self-Improving AI (HITL)" 
              description="Contribute to science. Every correction you make helps train and improve our next-generation models." 
            />
          </div>
        </section>

      </div> 

      {/* ========================================== */}
      {/* SLIDE 4. DATA COLLECTION (CONTRIBUTE)      */}
      {/* ========================================== */}
      <section className="contribute-section">
        <div className="contribute-content">
          <div className="contribute-text">
            <h2>Help Train FishSight 2.0 🧬</h2>
            <p>
              FishSight is an evolving project. Do you have a rare fish or a perfectly aquascaped tank? 
              Upload your photos to our secure, open-source dataset to help us improve the accuracy of our computer vision model.
            </p>
            <ul className="contribute-perks">
              <li>✅ Improve AI recognition accuracy</li>
              <li>✅ Expand our species database</li>
              {/* Badge line removed! */}
            </ul>
          </div>
          
          <div className="contribute-action">
            {/* 🚨 UPDATED: Form is now a label that triggers the hidden input! */}
            <label className="mock-upload-box" style={{display: 'block'}}>
              <input 
                type="file" 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handleImageSubmission}
              />
              <FontAwesomeIcon icon={faCamera} className="upload-icon" />
              <h3>Submit Fish Data</h3>
              <p>Click to select an image</p>
              <div className="btn-primary" style={{display: 'inline-block', marginTop: '10px'}}>Browse Files</div>
            </label>
          </div>
        </div>
      </section>
      
    </div>
  );
};

export default HomePage;