import os
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime, timezone
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

# --- CLOUD TOOLS ---
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_groq import ChatGroq
from langchain_community.vectorstores import FAISS

load_dotenv()

app = Flask(__name__)
CORS(app) # Allows React to talk to this server

# --- DATABASE CONNECTION ---
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
db = client.fishsight_db
chat_history_collection = db.chat_history

# --- INITIALIZE MODELS ---
google_api_key = os.getenv("GOOGLE_API_KEY")
groq_api_key = os.getenv("GROQ_API_KEY")

embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001", 
    google_api_key=google_api_key
)
llm = ChatGroq(temperature=0.0, model_name="llama-3.1-8b-instant", api_key=groq_api_key)

# --- LOAD DATABASE ---
print("📂 Loading FAISS Vector Database...")
script_dir = os.path.dirname(os.path.abspath(__file__))
index_path = os.path.join(script_dir, "aquarium_index")
vector_store = FAISS.load_local(index_path, embeddings, allow_dangerous_deserialization=True)
retriever = vector_store.as_retriever(search_kwargs={"k": 3}) 

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "Chatbot Server is Running!"}), 200

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    
    # Extract Data
    if isinstance(data.get('message'), dict):
        payload = data['message']
        user_input = str(payload.get('message', ''))
        history = payload.get('history', [])
    else:
        user_input = str(data.get('message', ''))
        history = data.get('history', []) 

    user_input = user_input.strip()
    if not user_input:
        return jsonify({"error": "No valid text message provided"}), 400
    
    username = data.get('username', 'Guest')
    session_id = data.get('session_id')
    
    if not session_id or session_id == "null": 
        session_id = str(uuid.uuid4())

    try:
        # Search FAISS
        docs = retriever.invoke(user_input)
        context_text = "\n\n".join([doc.page_content for doc in docs])

        # Format History
        conversation_text = ""
        for msg in history[-5:]: 
            role = "User" if msg.get('sender') == 'user' else "Assistant"
            conversation_text += f"{role}: {msg.get('text', '')}\n"

        prompt = f"""
        You are a helpful Aquarium Assistant.
        PAST CONVERSATION:\n{conversation_text}
        RELEVANT KNOWLEDGE:\n{context_text}
        CURRENT USER QUESTION:\n{user_input}
        
        INSTRUCTIONS: Use RELEVANT KNOWLEDGE to answer. Keep answers concise and friendly.
        """
        
        response = llm.invoke(prompt)

        # Save to MongoDB
        chat_history_collection.insert_one({
            "SessionID": session_id,
            "UserID": username,
            "UserQuery": user_input,
            "AIResponse": response.content,
            "Timestamp": datetime.now(timezone.utc)
        })

        return jsonify({"response": response.content, "session_id": session_id}), 200

    except Exception as e:
        print(f"Chat Error: {e}")
        return jsonify({"error": str(e)}), 500 

if __name__ == '__main__':
    app.run(port=5001, debug=True, use_reloader=False) # Runs on 5001 locally to not clash with main app