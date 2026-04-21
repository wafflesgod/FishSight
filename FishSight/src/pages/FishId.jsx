import React, { useState } from 'react';
import { FishService } from '../services/API'; // NEW: Import your API service
import './FishId.css';

const FishId = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  // 1. Handle when user selects a file
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file)); 
      setResult(null); 
    }
  };

  // 2. The REAL AI Analysis Call
  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setResult(null); // Clear any previous results

    try {
      // Send the image to your Python backend
      const data = await FishService.identifyFish(selectedImage);

      // When your custom ResNet50 model (trained on the 12 freshwater species) processes the image, 
      // it will return the prediction back to this screen.
      setResult({
        species: data.species,
        confidence: data.confidence,
        careLevel: data.careLevel || "Check Fish Info tab for details", // Fallbacks in case your AI just returns species
        notes: data.notes || "Analysis complete."
      });

    } catch (error) {
      console.error("AI Analysis failed:", error);
      alert("Failed to analyze the image. Is your Python server running?");
    } finally {
      setIsLoading(false); // Stop the loading spinner whether it succeeds or fails
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
              disabled={isLoading}
            >
              {isLoading ? "Analyzing..." : "🔍 Identify Fish"}
            </button>
          </div>
        </div>
      )}

      {/* Results Section (Only shows after analysis) */}
      {result && (
        <div className="result-box">
          <h2>Analysis Result</h2>
          <p><strong>Detected Species:</strong> {result.species}</p>
          <p><strong>Confidence:</strong> {result.confidence}</p>
          <p><strong>Care Level:</strong> {result.careLevel}</p>
          <p><i>{result.notes}</i></p>
        </div>
      )}
    </div>
  );
};

export default FishId;