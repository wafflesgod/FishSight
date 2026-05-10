import React, { createContext, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FishService } from '../services/API'; // Make sure this matches your exact API file name

const FishContext = createContext();

export const FishProvider = ({ children }) => {
  const [globalResult, setGlobalResult] = useState(null);
  const [globalImageUrl, setGlobalImageUrl] = useState(null);

  // --- 1. NEW: CHAT MEMORY ---
  const defaultGreeting = [{ sender: 'bot', text: 'Hello! I am your Aquarium Assistant. Ask me about your fish! 🐟' }];
  const [chatMessages, setChatMessages] = useState(defaultGreeting);

  // --- 2. NEW: WIPE CHAT FUNCTION ---
  const clearChat = () => {
    setChatMessages(defaultGreeting);
  };

  const navigate = useNavigate();

  const analyzeImageBackground = async (imageFile) => {
    setGlobalImageUrl(URL.createObjectURL(imageFile));
    const toastId = toast.loading("🐟 Analyzing fish in the background...");

    try {
      const data = await FishService.identifyFish(imageFile);
      setGlobalResult(data);

      toast.update(toastId, {
        render: `Analysis Complete: It's a ${data.species}! (Click to view)`,
        type: "success",
        isLoading: false,
        autoClose: 6000, 
        closeOnClick: true,
        onClick: () => navigate('/fish-id') 
      });
    } catch (error) {
      toast.update(toastId, {
        render: "Analysis failed. Python server might be asleep.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeOnClick: true,
      });
    }
  };

  return (
    // 3. EXPORT THE NEW CHAT VARIABLES
    <FishContext.Provider value={{ 
      analyzeImageBackground, 
      globalResult, 
      globalImageUrl,
      chatMessages,    // Give access to the messages
      setChatMessages, // Give access to update messages
      clearChat        // Give access to wipe the memory
    }}>
      {children}
    </FishContext.Provider>
  );
};

export const useFish = () => useContext(FishContext);