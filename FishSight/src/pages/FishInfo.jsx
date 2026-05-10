import React, { useState, useEffect } from 'react';
import './FishInfo.css';

const FishInfo = () => {
  const [fishList, setFishList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the data from your new Python route when the page loads
    const fetchFishData = async () => {
      try {
        const response = await fetch('https://fishsight-1.onrender.com/api/fish-info');
        const data = await response.json();
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
            <h2>{fish.CommonName}</h2>
            <h4 className="sci-name"><i>{fish.SciName}</i></h4>

            {/* NEW: The Image Tag! */}
            {fish.ImageRef && (
              <img 
                src={`/fish_images/${fish.ImageRef}`} 
                alt={fish.CommonName} 
                className="fish-info-img" 
              />
            )}
            
            <div className="fish-stats">
              <p><strong>Family:</strong> {fish.Family}</p>
              <p><strong>pH Range:</strong> {fish.PH_Range}</p>
              <p><strong>Temp:</strong> {fish.Temp_Range}</p>
              <p><strong>Diet:</strong> {fish.Diet}</p>
            </div>
            
            <p className="fish-desc">{fish.Description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FishInfo;