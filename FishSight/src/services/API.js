// 1. Define the URLs for your 3 separate servers
// (Update CHATBOT_URL and VISION_URL once you deploy them on Render)
const MAIN_API_URL = "https://fishsight-h6z5.onrender.com"; 
const CHATBOT_URL = "https://fishsight-1.onrender.com"; 
const VISION_URL = "https://fishsight.onrender.com"; 

// 2. Generic Helper Function for API calls
// FIXED: Now properly accepts 'baseUrl' so we can route traffic to different servers
const apiRequest = async (baseUrl, endpoint, method = "GET", body = null) => {
  try {
    const headers = { "Content-Type": "application/json" };
    const config = { method, headers }; // FIXED: Typo 'headerrs' corrected

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${baseUrl}${endpoint}`, config);
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

    // FIXED: Now correctly points to the new Vision Server
    const response = await fetch(`${VISION_URL}/predict`, {
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

// ==========================================
// Chat & History Services
// ==========================================
export const ChatService = {
  sendMessage: async (payload) => {
    try {
      // Pointing directly to the Chatbot Server
      const response = await fetch(`${CHATBOT_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return data;
    } catch (error) {
      console.error("Chat API Error:", error);
      throw error;
    }
  },
  
  // History still lives on the main database server
  getHistory: (username) => apiRequest(MAIN_API_URL, `/api/chat/history/${username}`, "GET"),
  deleteSession: (sessionId, userData) => apiRequest(MAIN_API_URL, `/api/chat/history/${sessionId}`, "DELETE", userData),
};

// ==========================================
// Auth Service
// ==========================================
// FIXED: Removed the duplicate declaration
export const AuthService = {
  login: (credentials) => apiRequest(MAIN_API_URL, "/auth/login", "POST", credentials),
  register: (userData) => apiRequest(MAIN_API_URL, "/auth/register", "POST", userData),
};

// ==========================================
// Sustainable AI Feedback Service
// ==========================================
export const FeedbackService = {
  submitFeedback: (feedbackData) => apiRequest(MAIN_API_URL, "/api/feedback", "POST", feedbackData),
};

// ==========================================
// Community Forum Services
// ==========================================
export const ForumService = {
  getPosts: () => apiRequest(MAIN_API_URL, "/api/forum", "GET"),
  createPost: (postData) => apiRequest(MAIN_API_URL, "/api/forum", "POST", postData),
  addComment: (postId, commentData) => apiRequest(MAIN_API_URL, `/api/forum/${postId}/comment`, "POST", commentData),
  toggleLike: (postId, userData) => apiRequest(MAIN_API_URL, `/api/forum/${postId}/like`, "POST", userData),
  deletePost: (postId, userData) => apiRequest(MAIN_API_URL, `/api/forum/${postId}`, "DELETE", userData),
  summarizePost: (postId) => apiRequest(MAIN_API_URL, `/api/forum/${postId}/summarize`, "GET"),
};

// ==========================================
// Fish Database Service
// ==========================================
export const InfoService = {
  getFishList: () => apiRequest(MAIN_API_URL, "/api/fish-info", "GET"),
};