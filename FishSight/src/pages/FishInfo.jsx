import React, { useState, useEffect } from 'react';
import { InfoService } from '../services/API';
import './FishInfo.css';

const FishInfo = () => {
  const [fishList, setFishList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFishData = async () => {
      try {
        const data = await InfoService.getFishList();
        setFishList(data);
      } catch (error) {
        console.error("Error fetching fish info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFishData();
  }, []);

  if (loading) return <div style={{textAlign: 'center', marginTop: '50px'}}><h2>Loading Fish Database...</h2></div>;

  return (
    <div className="fish-info-container">
      <h1>Fish Species Database</h1>
      <p>Browse our encyclopedia of freshwater fish.</p>

      <div className="fish-grid">
        {fishList.map((fish, index) => (
          <div key={index} className="fish-card">
            
            {/* STATIC HEADER */}
            <div className="fish-card-header">
              <div className="header-titles">
                <h2>{fish.CommonName}</h2>
                <p className="sci-name"><i>{fish.SciName}</i></p>
              </div>
              
              {/* NEW: Dynamic Care Level Badge */}
              {fish.CareLevel && (
                <span className={`care-badge care-${fish.CareLevel.toLowerCase()}`}>
                  {fish.CareLevel}
                </span>
              )}
            </div>

            {/* FLIPPING BODY */}
            <div className="fish-card-body">
              <div className="fish-card-inner">
                
                {/* FRONT: The Image */}
                <div className="fish-card-front">
                  {fish.ImageRef ? (
                    <img 
                      src={`/fish_images/${fish.ImageRef}`} 
                      alt={fish.CommonName} 
                      className="fish-info-img" 
                    />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                </div>
                
                {/* BACK: The Data & Conclusion */}
                <div className="fish-card-back">
                  <div className="stats-grid">
                    <p><strong>Size:</strong> {fish.Size || "N/A"}</p>
                    <p><strong>Lifespan:</strong> {fish.Lifespan || "N/A"}</p>
                    <p><strong>Temperament:</strong> {fish.Temperament || "N/A"}</p>
                    <p><strong>Tank Level:</strong> {fish.Tank_Level || "N/A"}</p>
                    <p><strong>Breeding:</strong> {fish.Breeding || "N/A"}</p>
                    <p><strong>Diet:</strong> {fish.Diet || "N/A"}</p>
                    <p><strong>pH:</strong> {fish.PH_Range || "N/A"}</p>
                    <p><strong>Temp:</strong> {fish.Temp_Range || "N/A"}</p>
                  </div>
                  <div className="fish-conclusion">
                    <p>{fish.Description}</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FishInfo;