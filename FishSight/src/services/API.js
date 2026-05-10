// 1. Define the Base URL
// When you deploy to Vercel, you will change this to your Render URL.
// IMPORTANT: If you are testing locally, make sure this is "http://localhost:5000"
const API_BASE_URL = "https://fishsight-1.onrender.com"; 

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

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

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

// ==========================================
// UPDATED: Chat & History Services
// ==========================================
export const ChatService = {
  // We now pass the entire payload (message, history, username, session_id) directly
  sendMessage: (payload) => apiRequest("/chat", "POST", payload),
  
  // New calls for the Gemini-style sidebar
  getHistory: (username) => apiRequest(`/api/chat/history/${username}`, "GET"),
  deleteSession: (sessionId, userData) => apiRequest(`/api/chat/history/${sessionId}`, "DELETE", userData),
};

// ==========================================
// NEW: Sustainable AI Feedback Service
// ==========================================
export const FeedbackService = {
  submitFeedback: (feedbackData) => apiRequest("/api/feedback", "POST", feedbackData),
};

// ==========================================
// EXISTING: Community Forum Services
// ==========================================
export const ForumService = {
  getPosts: () => apiRequest("/api/forum", "GET"),
  createPost: (postData) => apiRequest("/api/forum", "POST", postData),
  addComment: (postId, commentData) => apiRequest(`/api/forum/${postId}/comment`, "POST", commentData),
  toggleLike: (postId, userData) => apiRequest(`/api/forum/${postId}/like`, "POST", userData),
  deletePost: (postId, userData) => apiRequest(`/api/forum/${postId}`, "DELETE", userData),
  summarizePost: (postId) => apiRequest(`/api/forum/${postId}/summarize`, "GET"),
};