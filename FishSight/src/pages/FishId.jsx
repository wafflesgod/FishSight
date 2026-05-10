import React, { useState } from 'react';
import { useFish } from '../context/FishContext'; 
import './FishId.css';

const FishId = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // Connect to the Global Brain
  const { analyzeImageBackground, globalResult, globalImageUrl  } = useFish();

  // 1. Handle when user selects a file
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file)); 
    }
  };

  // 2. Hand the analysis off to the background task
  const handleAnalyze = () => {
    if (!selectedImage) return;

    // Send the image to the global context (which talks to Python)
    analyzeImageBackground(selectedImage);
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
            <button 
              className="analyze-btn" 
              onClick={handleAnalyze} 
            >
              🔍 Identify Fish
            </button>
            <p className="text-muted text-sm mt-2" style={{ fontStyle: 'italic', marginTop: '10px' }}>
              Analysis runs in the background. Feel free to navigate to other tabs!
            </p>
          </div>
        </div>
      )}

      {/* Results Section (Reads from the Global Result) */}
      {globalResult && (
        <div className="result-box">
          <h2>Latest Analysis Result</h2>
          
          {/* NEW: Display the surviving image right here! */}
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
        </div>
      )}
    </div>
  );
};

export default FishId;