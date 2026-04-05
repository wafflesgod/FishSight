// src/services/api.js

// 1. Define the Base URL
// When you deploy to Vercel, you will change this to your Render URL.
const API_BASE_URL = "http://localhost:5000"; // Default Python port

// 2. Generic Helper Function for API calls
const apiRequest = async (endpoint, method = "GET", body = null) => {
  try {
    const headers = {
      "Content-Type": "application/json",
    };

    const config = {
      method,
      headers,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    // This makes the call: http://localhost:5000/api/predict (example)
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    // Change this block in your apiRequest function:
    if (!response.ok) {
    throw new Error(data.error || data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// 3. Define your actual API functions here
export const FishService = {
  identifyFish: async (imageFile) => {
    const formData = new FormData();
    formData.append("file", imageFile);

    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      body: formData, 
    });

    const data = await response.json();

    // NEW: If the server throws a 500 error, alert the user!
    if (!response.ok) {
      throw new Error(data.error || "Failed to identify fish.");
    }

    return data;
  },
};

export const AuthService = {
  login: (credentials) => apiRequest("/auth/login", "POST", credentials),
  register: (userData) => apiRequest("/auth/register", "POST", userData),
};

export const ChatService = {
  sendMessage: (message) => apiRequest("/chat", "POST", { message }),
};