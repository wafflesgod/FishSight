import React, { useState } from 'react';
import { useFish } from '../context/FishContext'; 
import { FeedbackService } from '../services/API'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faCheck, faX, faHourglass, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import './FishId.css';

const FishId = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [correctLabel, setCorrectLabel] = useState("");

  const { analyzeImageBackground, globalResult, globalImageUrl } = useFish();

  const activePreview = previewUrl || globalImageUrl;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file)); 
      setFeedbackGiven(false);
      setIsCorrect(null);
    }
  };

  const handleAnalyze = () => {
    if (!selectedImage) return;
    analyzeImageBackground(selectedImage);
    
    // 🚨 THE FIX: Wipe the local preview link so it instantly syncs with the Global Brain!
    setPreviewUrl(null); 
  };

  const sendFeedbackToServer = async (finalLabel, status) => {
    if (!globalImageUrl) {
      alert("Error: No image found on the screen to submit.");
      return;
    }

    try {
      const response = await fetch(globalImageUrl);
      const blob = await response.blob();
      
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Image = reader.result;
        const currentUser = localStorage.getItem('username') || 'Guest';

        const feedbackData = {
          username: currentUser,
          original_prediction: globalResult.species,
          corrected_label: finalLabel,
          is_correct: status,
          image_data: base64Image
        };

        try {
          await FeedbackService.submitFeedback(feedbackData);
          setFeedbackGiven(true);
        } catch (error) {
          console.error("Error sending feedback:", error);
          alert("Failed to send feedback to the server.");
        }
      };
    } catch (error) {
      console.error("Error processing image data:", error);
      alert("Failed to process the image for feedback.");
    }
  };

  const submitFeedback = (status) => {
    setIsCorrect(status);
    if (status === true) {
      sendFeedbackToServer(globalResult.species, true);
    }
  };

  return (
    <div className="fish-id-container">
      <h1>Identify Your Fish</h1>
      <p style={{color: '#3F72AF'}}>Upload a clear photo of your fish, and our AI will identify the species.</p>

      {/* Upload Zone */}
      <div className="upload-box">
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleImageChange} 
        />
        {!activePreview ? (
          <div>
            <div className="icon-large">📁</div>
            <h3 style={{color: '#112D4E'}}>Click or Drag Image Here</h3>
            <p style={{color: '#3F72AF'}}>Supports JPG, PNG, JPEG</p>
          </div>
        ) : (
          <div className="preview-area">
             <p style={{color: '#112D4E', fontWeight: 'bold'}}>Image Selected: {selectedImage?.name || 'Previous Image'}</p>
          </div>
        )}
      </div>

      {/* Image Preview Area */}
      {activePreview && (
        <div className="preview-container">
          <img src={activePreview} alt="Fish Preview" className="preview-image" />
          <div className="actions">
            
            {/* 🚨 DYNAMIC BUTTONS RESTORED (Yellow & Green + Vertical Flip Fix) */}
            {activePreview === globalImageUrl && !globalResult ? (
              <button className="analyze-btn" disabled style={{ backgroundColor: '#f59e0b', color: 'white' }}>
                <FontAwesomeIcon 
                  icon={faHourglass} 
                  flip 
                  style={{
                    color: "white", 
                    '--fa-animation-duration': '3s', 
                    '--fa-flip-x': '0', /* Disabled horizontal flip */
                    '--fa-flip-y': '1'  /* Enabled vertical upside-down flip */
                  }} 
                /> Analyzing in Background...
              </button>
            ) : activePreview === globalImageUrl && globalResult ? (
              <button className="analyze-btn" disabled style={{ backgroundColor: '#10b981', color: 'white' }}>
                <FontAwesomeIcon icon={faCheck} beatFade style={{color: "white", '--fa-animation-duration': '1.25s'}} /> Analysis Complete
              </button>
            ) : (
              <button className="analyze-btn" onClick={handleAnalyze}>
                <FontAwesomeIcon icon={faMagnifyingGlass} beat style={{color: "white", '--fa-animation-duration': '1.5s'}} /> Identify Fish
              </button>
            )}

            <p style={{ fontStyle: 'italic', marginTop: '10px', color: '#3F72AF', fontSize: '0.9rem' }}>
              Analysis runs in the background. Feel free to navigate to other tabs!
            </p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {globalResult && (
        <div className="result-box">
          <h2 style={{borderBottom: '2px solid #DBE2EF', paddingBottom: '10px'}}>Latest Analysis Result</h2>
          
          {globalImageUrl && (
            <img 
              src={globalImageUrl} 
              alt="Analyzed Fish" 
              style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', marginBottom: '15px' }} 
            />
          )}

          <p><strong>Detected Species:</strong> {globalResult.species}</p>
          <p><strong>Confidence:</strong> {globalResult.confidence}</p>
          <p><strong>Care Level:</strong> {globalResult.careLevel}</p>
          <p><i>{globalResult.notes}</i></p>

          {/* SUSTAINABLE AI FEEDBACK UI */}
          {!feedbackGiven && (
            <div style={{marginTop: '25px', padding: '15px', borderTop: '2px solid #DBE2EF'}}>
              <h4 style={{color: '#112D4E'}}>Help FishSight Learn! 🧠</h4>
              <p>Was this prediction correct?</p>
              
              <div style={{display: 'flex', gap: '15px', marginTop: '10px'}}>
                <button 
                  onClick={() => submitFeedback(true)} 
                  style={{backgroundColor: '#4CAF50', color: 'white', padding: '12px 25px', border: 'none', borderRadius: '5px', fontSize: '1rem', cursor: 'pointer', position: 'relative', zIndex: 10}}
                >
                  <FontAwesomeIcon icon={faCheck} style={{color: "white"}} /> Yes
                </button>
                <button 
                  onClick={() => submitFeedback(false)} 
                  style={{backgroundColor: '#f44336', color: 'white', padding: '12px 25px', border: 'none', borderRadius: '5px', fontSize: '1rem', cursor: 'pointer', position: 'relative', zIndex: 10}}
                >
                  <FontAwesomeIcon icon={faX} style={{color: "white"}} /> No
                </button>
              </div>

              {isCorrect === false && (
                <div style={{marginTop: '15px', padding: '15px', backgroundColor: '#F9F7F7', borderRadius: '8px', border: '1px solid #DBE2EF'}}>
                  <label style={{color: '#112D4E', fontWeight: 'bold'}}>What species is this actually?</label><br/>
                  <select 
                    value={correctLabel} 
                    onChange={(e) => setCorrectLabel(e.target.value)}
                    style={{padding: '12px', margin: '12px 0', width: '100%', borderRadius: '6px', border: '1px solid #DBE2EF', color: '#112D4E', backgroundColor: '#fff'}}
                  >
                    <option value="">Select the correct species...</option>
                    <option value="Angel Fish">Angel Fish</option>
                    <option value="Cardinal Tetra">Cardinal Tetra</option>
                    <option value="Cherry Barb">Cherry Barb</option>
                    <option value="Common Carp">Common Carp</option>
                    <option value="Gold Fish">Gold Fish</option>
                    <option value="Gourami">Gourami</option>
                    <option value="Guppy Fish">Guppy Fish</option>
                    <option value="Molly Fish">Molly Fish</option>
                    <option value="Neon Tetra">Neon Tetra</option>
                    <option value="Platy Fish">Platy Fish</option>
                    <option value="Rohu">Rohu</option>
                    <option value="Zebra Fish">Zebra Fish</option>
                  </select>
                  <button 
                    onClick={() => sendFeedbackToServer(correctLabel, false)}
                    disabled={!correctLabel}
                    style={{
                        backgroundColor: !correctLabel ? '#DBE2EF' : '#3F72AF', 
                        color: !correctLabel ? '#112D4E' : '#F9F7F7', 
                        padding: '14px 15px', 
                        border: 'none', 
                        borderRadius: '8px', 
                        width: '100%',
                        position: 'relative', 
                        zIndex: 50,           
                        fontSize: '1.05rem',
                        fontWeight: 'bold',
                        cursor: !correctLabel ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.3s'
                    }}
                  >
                    Submit Correction to AI Database
                  </button>
                </div>
              )}
            </div>
          )}

          {feedbackGiven && (
            <div style={{marginTop: '20px', padding: '15px', backgroundColor: '#DBE2EF', borderRadius: '8px', color: '#112D4E', border: '1px solid #3F72AF'}}>
              <strong>Thank you! 🐟</strong> Your feedback has been successfully sent to our AI database.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FishId;