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
species_collection = db.fish_species  # Structured fish data (pH, temp, size, etc.)


def find_species_match(user_input):
    """
    Check if the user's message mentions a known fish's common name.
    Returns the matching MongoDB document, or None if no match is found.
    """
    user_lower = user_input.lower()
    all_species = species_collection.find({}, {"_id": 0})
    for sp in all_species:
        if sp.get("CommonName", "").lower() in user_lower:
            return sp
    return None


def format_species_bullets(sp):
    """
    Deterministically builds a clean markdown bullet list from a fish's
    structured MongoDB fields. This guarantees consistent point-form
    output every time, regardless of what the LLM would have done.
    """
    return (
        f"**{sp.get('CommonName')}** (*{sp.get('SciName')}*)\n\n"
        f"- **pH Range:** {sp.get('PH_Range')}\n"
        f"- **Temperature:** {sp.get('Temp_Range')}\n"
        f"- **Size:** {sp.get('Size')}\n"
        f"- **Lifespan:** {sp.get('Lifespan')}\n"
        f"- **Breeding:** {sp.get('Breeding')}\n"
        f"- **Temperament:** {sp.get('Temperament')}\n"
        f"- **Diet:** {sp.get('Diet')}\n"
        f"- **Tank Level:** {sp.get('Tank_Level')}\n"
        f"- **Care Level:** {sp.get('CareLevel')}\n"
    )

# --- INITIALIZE MODELS ---
google_api_key = os.getenv("GOOGLE_API_KEY")
groq_api_key = os.getenv("GROQ_API_KEY")

embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001", 
    google_api_key=google_api_key
)
llm = ChatGroq(temperature=0.0, model_name="gpt-oss-20b", api_key=groq_api_key)

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
        # Format History
        conversation_text = ""
        for msg in history[-5:]: 
            role = "User" if msg.get('sender') == 'user' else "Assistant"
            conversation_text += f"{role}: {msg.get('text', '')}\n"

        # Check if the user is asking about a specific fish we have structured data for.
        matched_species = find_species_match(user_input)

        if matched_species:
            # --- DETERMINISTIC PATH ---
            # We build the bullet list ourselves from MongoDB so the format is
            # ALWAYS perfect point form. The LLM is only used to write a short,
            # friendly intro line, it never touches the structured data itself.
            bullets = format_species_bullets(matched_species)
            description = matched_species.get("Description", "")

            intro_prompt = f"""
            You are a friendly Aquarium Assistant. Write ONE short, warm sentence
            introducing the fish "{matched_species.get('CommonName')}" to the user
            in response to their question: "{user_input}".
            Do not list any specs, numbers, or bullet points yourself, just the intro sentence.
            """
            intro_response = llm.invoke(intro_prompt)
            intro_text = intro_response.content.strip()

            final_response = f"{intro_text}\n\n{bullets}\n{description}"

        else:
            # --- GENERAL RAG PATH (no specific fish matched) ---
            docs = retriever.invoke(user_input)
            context_text = "\n\n".join([doc.page_content for doc in docs])

            prompt = f"""
            You are a helpful Aquarium Assistant.
            PAST CONVERSATION:\n{conversation_text}
            RELEVANT KNOWLEDGE:\n{context_text}
            CURRENT USER QUESTION:\n{user_input}

            INSTRUCTIONS:
            1. Use the RELEVANT KNOWLEDGE provided to answer the user's question accurately.
            2. If you mention structured specs for a specific fish species (pH Range, Temperature,
               Size, Diet, Temperament, Care Level, etc.), ALWAYS format them as a markdown
               bulleted list, one spec per line, using "- **Label:** value".
            3. Use a short paragraph only for general background/description text.
            4. Keep your overall tone friendly, encouraging, and helpful for aquarium hobbyists.
            """
            response = llm.invoke(prompt)
            final_response = response.content

        # Save to MongoDB
        chat_history_collection.insert_one({
            "SessionID": session_id,
            "UserID": username,
            "UserQuery": user_input,
            "AIResponse": final_response,
            "Timestamp": datetime.now(timezone.utc)
        })

        return jsonify({"response": final_response, "session_id": session_id}), 200

    except Exception as e:
        print(f"Chat Error: {e}")
        return jsonify({"error": str(e)}), 500 

if __name__ == '__main__':
    app.run(port=5001, debug=True, use_reloader=False) # Runs on 5001 locally to not clash with main app