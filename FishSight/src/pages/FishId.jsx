import React, { useState } from 'react';
import { useFish } from '../context/FishContext'; 
import './FishId.css';

const FishId = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // States for Sustainable AI Feedback
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [correctLabel, setCorrectLabel] = useState("");

  const { analyzeImageBackground, globalResult, globalImageUrl } = useFish();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file)); 
      // Reset feedback states when a new image is uploaded
      setFeedbackGiven(false);
      setIsCorrect(null);
    }
  };

  const handleAnalyze = () => {
    if (!selectedImage) return;
    analyzeImageBackground(selectedImage);
  };

  // --- THE BULLETPROOF FEEDBACK FUNCTION ---
  const sendFeedbackToServer = async (finalLabel, status) => {
    // 1. Look for the global image URL instead of the local upload state
    if (!globalImageUrl) {
      alert("Error: No image found on the screen to submit.");
      return;
    }

    try {
      // 2. Fetch the image directly from the URL being displayed on screen
      const response = await fetch(globalImageUrl);
      const blob = await response.blob();
      
      // 3. Convert that blob into our Base64 string for the database
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
          await fetch('https://fishsight-1.onrender.com/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(feedbackData),
          });
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
    
    // If they click 'Yes', we send it immediately
    if (status === true) {
      sendFeedbackToServer(globalResult.species, true);
    }
  };

  return (
    <div className="fish-id-container">
      <h1>Identify Your Fish</h1>
      <p>Upload a clear photo of your fish, and our AI will identify the species.</p>

      {/* Upload Zone */}
      <div className="upload-box">
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleImageChange} 
        />
        {!previewUrl ? (
          <div>
            <div className="icon-large">📁</div>
            <h3>Click or Drag Image Here</h3>
            <p className="text-muted">Supports JPG, PNG, JPEG</p>
          </div>
        ) : (
          <div className="preview-area">
             <p>Image Selected: {selectedImage?.name || 'Previous Image'}</p>
          </div>
        )}
      </div>

      {/* Image Preview Area */}
      {previewUrl && (
        <div className="preview-container">
          <img src={previewUrl} alt="Fish Preview" className="preview-image" />
          <div className="actions">
            <button className="analyze-btn" onClick={handleAnalyze}>
              🔍 Identify Fish
            </button>
            <p className="text-muted text-sm mt-2" style={{ fontStyle: 'italic', marginTop: '10px' }}>
              Analysis runs in the background. Feel free to navigate to other tabs!
            </p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {globalResult && (
        <div className="result-box">
          <h2>Latest Analysis Result</h2>
          
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

          {/* ========================================== */}
          {/* SUSTAINABLE AI FEEDBACK UI                 */}
          {/* ========================================== */}
          {!feedbackGiven && (
            <div style={{marginTop: '25px', padding: '15px', borderTop: '2px solid #eee'}}>
              <h4>Help FishSight Learn! 🧠</h4>
              <p>Was this prediction correct?</p>
              
              <div style={{display: 'flex', gap: '15px', marginTop: '10px'}}>
                <button 
                  onClick={() => submitFeedback(true)} 
                  style={{backgroundColor: '#4CAF50', color: 'white', padding: '12px 25px', border: 'none', borderRadius: '5px', fontSize: '1rem', cursor: 'pointer', position: 'relative', zIndex: 10}}
                >
                  ✅ Yes
                </button>
                <button 
                  onClick={() => submitFeedback(false)} 
                  style={{backgroundColor: '#f44336', color: 'white', padding: '12px 25px', border: 'none', borderRadius: '5px', fontSize: '1rem', cursor: 'pointer', position: 'relative', zIndex: 10}}
                >
                  ❌ No
                </button>
              </div>

              {isCorrect === false && (
                <div style={{marginTop: '15px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1'}}>
                  <label style={{color: '#1e293b', fontWeight: 'bold'}}>What species is this actually?</label><br/>
                  <select 
                    value={correctLabel} 
                    onChange={(e) => setCorrectLabel(e.target.value)}
                    style={{padding: '12px', margin: '12px 0', width: '100%', borderRadius: '6px', border: '1px solid #94a3b8'}}
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
                        backgroundColor: !correctLabel ? '#94a3b8' : '#3F72AF', 
                        color: 'white', 
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
            <div style={{marginTop: '20px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px', color: '#166534', border: '1px solid #bbf7d0'}}>
              <strong>Thank you! 🐟</strong> Your feedback has been successfully sent to our AI database.
            </div>
          )}
          {/* ========================================== */}

        </div>
      )}
    </div>
  );
};

export default FishId;