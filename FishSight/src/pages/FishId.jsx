import React, { useState } from 'react';
import { useFish } from '../context/FishContext'; 
import './FishId.css';

const FishId = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // NEW: States for Sustainable AI Feedback
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

  // NEW: Function to handle the feedback submission
  const submitFeedback = (status) => {
    setIsCorrect(status);
    
    // If they click 'Yes', we can just send it immediately
    if (status === true) {
      sendFeedbackToServer(globalResult.species, true);
    }
  };

  // NEW: Function to convert image and send to Flask
  const sendFeedbackToServer = (finalLabel, status) => {
    if (!selectedImage) return;

    // Convert the image to a Base64 string so we can send it as JSON
    const reader = new FileReader();
    reader.readAsDataURL(selectedImage);
    reader.onloadend = async () => {
      const base64Image = reader.result;

      const feedbackData = {
        original_prediction: globalResult.species,
        corrected_label: finalLabel,
        is_correct: status,
        image_data: base64Image
      };

      try {
        // Change localhost to your deployed URL if testing online!
        await fetch('http://localhost:5000/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(feedbackData),
        });
        setFeedbackGiven(true);
      } catch (error) {
        console.error("Error sending feedback:", error);
      }
    };
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
             <p>Image Selected: {selectedImage.name}</p>
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
          {/* NEW: SUSTAINABLE AI FEEDBACK UI            */}
          {/* ========================================== */}
          {!feedbackGiven && (
            <div style={{marginTop: '25px', padding: '15px', borderTop: '2px solid #eee'}}>
              <h4>Help FishSight Learn! 🧠</h4>
              <p>Was this prediction correct?</p>
              
              <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                <button onClick={() => submitFeedback(true)} style={{backgroundColor: '#4CAF50', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '5px'}}>✅ Yes</button>
                <button onClick={() => submitFeedback(false)} style={{backgroundColor: '#f44336', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '5px'}}>❌ No</button>
              </div>

              {isCorrect === false && (
                <div style={{marginTop: '15px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px'}}>
                  <label><strong>What species is this actually?</strong></label><br/>
                  <select 
                    value={correctLabel} 
                    onChange={(e) => setCorrectLabel(e.target.value)}
                    style={{padding: '8px', margin: '10px 0', width: '100%'}}
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
                    style={{backgroundColor: '#008CBA', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '5px', width: '100%'}}
                  >
                    Submit Correction to AI Database
                  </button>
                </div>
              )}
            </div>
          )}

          {feedbackGiven && (
            <div style={{marginTop: '20px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '5px', color: '#2e7d32'}}>
              <strong>Thank you! 🐟</strong> Your feedback has been sent to our Sustainable AI database for future model training.
            </div>
          )}
          {/* ========================================== */}

        </div>
      )}
    </div>
  );
};

export default FishId;