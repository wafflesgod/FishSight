import os
import traceback
import numpy as np
from PIL import Image
import io 
import gc
import uuid
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from datetime import datetime, timezone
from bson.objectid import ObjectId

# --- THE MAGIC BULLET IMPORTS ---
#import tf_keras as keras
#from tf_keras.applications.resnet50 import ResNet50, preprocess_input
#from tf_keras.layers import Dense, GlobalAveragePooling2D, Dropout
#from tf_keras.models import Model
# --------------------------------

# Import your MongoDB collection from database.py
from database import users_collection, species_collection, forum_collection, chat_history_collection 

#from langchain_groq import ChatGroq
#from langchain_huggingface import HuggingFaceEmbeddings
#from langchain_community.vectorstores import FAISS

print("🔥 NEW VERSION OF app.py RUNNING")

# Load the secret variables from the .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  

# ==========================================
# CONFIGURATION & BRAIN LOAD (UPDATED)
# ==========================================
groq_api_key = os.getenv("GROQ_API_KEY") 

print("Loading Aquarium Brain Paths...")
script_dir = os.path.dirname(os.path.abspath(__file__))
index_path = os.path.join(script_dir, "aquarium_index")

if not os.path.exists(index_path):
    print("ERROR: Index not found! Run setup_database.py first.")

# Keep ChatGroq global! It is just a lightweight API wrapper and uses almost 0 RAM.
#llm = ChatGroq(
#    temperature=0.0, 
#    model_name="llama-3.1-8b-instant", 
#    api_key=groq_api_key
#)

print("🤖 Smart Aquarium Bot is Ready!")

# ==========================================
# LOAD VISION MODEL (THE SHELL & WEIGHTS TRICK)
# ==========================================
#print("Loading Fish Recognition Model...")
#model_path = os.path.join(script_dir, "resnet50.h5") 

#try:
    # 1. Build the exact empty shell of your Colab model
#    base_model = ResNet50(weights=None, include_top=False, input_shape=(224, 224, 3))
#    x = base_model.output
#    x = GlobalAveragePooling2D()(x)
#    x = Dropout(0.5)(x)
#    predictions = Dense(12, activation='softmax')(x)
    
#    fish_model = Model(inputs=base_model.input, outputs=predictions)

    # 2. Pour your trained weights into the shell! (Bypasses version errors completely)
#    fish_model.load_weights(model_path)
#    print("✅ Vision Model is Ready!")
#except Exception as e:
#    print(f"⚠️ Could not load Vision Model: {e}")
#    fish_model = None

FISH_CLASSES = [
    "Angel Fish",
    "Cardinal Tetra", 
    "Cherry Barb",    
    "Common Carp",
    "Gold Fish",
    "Gourami", 
    "Guppy Fish",
    "Molly Fish",
    "Neon Tetra",
    "Platy Fish",
    "Rohu",
    "Zebra Fish"          
]

# ==========================================
# AUTHENTICATION ROUTES
# ==========================================
@app.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"error": "Email already exists"}), 400

    hashed_password = generate_password_hash(password)
    join_date = datetime.now(timezone.utc)

    new_user = {
        "username": username,
        "email": email,
        "password": hashed_password,
        "JoinDate": join_date 
    }
    users_collection.insert_one(new_user)
    return jsonify({"message": "User created successfully!"}), 201


@app.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    user = users_collection.find_one({"email": email})

    if user and check_password_hash(user['password'], password):
        return jsonify({
            "message": "Login successful!", 
            "username": user['username'],
            "email": user['email']
        }), 200
    else:
        return jsonify({"error": "Invalid email or password"}), 401

# ==========================================
# FISH INFO ROUTE
# ==========================================
@app.route('/api/fish-info', methods=['GET'])
def get_fish_info():
    try:
        # Fetch all fish, but exclude the internal MongoDB '_id' object to avoid JSON errors
        fish_list = list(species_collection.find({}, {"_id": 0}))
        return jsonify(fish_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==========================================
# SUSTAINABLE AI - FEEDBACK ROUTE
# ==========================================
# Import the new collection at the top of your file if it's not already there:
from database import feedback_collection

@app.route('/api/feedback', methods=['POST', 'OPTIONS'])
def collect_feedback():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    data = request.json
    is_correct = data.get('is_correct')
    original_prediction = data.get('original_prediction')
    username = data.get('username') # <-- Catch the user!
    
    if is_correct:
        feedback_collection.insert_one({
            "UserID": username, # <-- Save it!
            "OriginalPrediction": original_prediction,
            "IsCorrect": True,
            "Timestamp": datetime.now(timezone.utc)
        })
    else:
        feedback_collection.insert_one({
            "UserID": username, # <-- Save it!
            "OriginalPrediction": original_prediction,
            "CorrectedLabel": data.get('corrected_label'),
            "IsCorrect": False,
            "ImageData": data.get('image_data'),
            "Timestamp": datetime.now(timezone.utc)
        })
        
    return jsonify({"message": "Feedback securely logged."}), 200

# ==========================================
# Create Chat History Route
# ==========================================
@app.route('/api/chat/history/<username>', methods=['GET'])
def get_chat_history(username):
    # Group by SessionID, get the first message (for the title), and the timestamp
    pipeline = [
        {"$match": {"UserID": username}},
        {"$sort": {"Timestamp": 1}}, # Sort oldest to newest first
        {"$group": {
            "_id": "$SessionID",
            "FirstMessage": {"$first": "$UserQuery"}, # Use first question as the Chat Title
            "LastUpdated": {"$last": "$Timestamp"},
            "Messages": {"$push": {"query": "$UserQuery", "response": "$AIResponse"}}
        }},
        {"$sort": {"LastUpdated": -1}} # Sort newest chats to the top of the sidebar!
    ]
    
    sessions = list(chat_history_collection.aggregate(pipeline))
    return jsonify(sessions), 200

# ==========================================
# Delete Chat Session Route
# ==========================================
@app.route('/api/chat/history/<session_id>', methods=['DELETE'])
def delete_chat_session(session_id):
    # Verify the user is deleting their own chat!
    data = request.json
    username = data.get('username')
    
    result = chat_history_collection.delete_many({
        "SessionID": session_id, 
        "UserID": username
    })
    
    if result.deleted_count > 0:
        return jsonify({"message": "Chat deleted successfully."}), 200
    else:
        return jsonify({"error": "Chat not found or unauthorized."}), 404

# ==========================================
# COMMUNITY FORUM ROUTES
# ==========================================

# 1. Get all forum posts (Sorted by newest first)
@app.route('/api/forum', methods=['GET'])
def get_forum_posts():
    try:
        # Fetch all posts, sort by Timestamp descending (-1)
        posts = list(forum_collection.find().sort("Timestamp", -1))
        
        # Convert the MongoDB ObjectId to a string so React can read it
        for post in posts:
            post['_id'] = str(post['_id'])
            
        return jsonify(posts), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 2. Create a new forum post
@app.route('/api/forum', methods=['POST'])
def create_forum_post():
    data = request.json
    title = data.get('title')
    content = data.get('content')
    username = data.get('username') # We will get this from React's localStorage

    if not title or not content or not username:
        return jsonify({"error": "Missing required fields"}), 400

    new_post = {
        "Title": title,
        "Content": content,
        "Username": username, # Matches the User who created it
        "Timestamp": datetime.now(timezone.utc),
        "Comments": [] # Starts with an empty array for future comments!
    }
    
    result = forum_collection.insert_one(new_post)
    return jsonify({"message": "Post created successfully!", "id": str(result.inserted_id)}), 201

# 3. Add a comment to a specific post
@app.route('/api/forum/<post_id>/comment', methods=['POST'])
def add_comment(post_id):
    data = request.json
    content = data.get('content')
    username = data.get('username')

    if not content or not username:
        return jsonify({"error": "Missing required fields"}), 400

    new_comment = {
        "Content": content,
        "Username": username,
        "Timestamp": datetime.now(timezone.utc)
    }

    try:
        # Push the new comment into the specific post's 'Comments' array
        forum_collection.update_one(
            {"_id": ObjectId(post_id)},
            {"$push": {"Comments": new_comment}}
        )
        return jsonify({"message": "Comment added successfully!"}), 201
    except Exception as e:
        return jsonify({"error": "Failed to add comment"}), 500
    
# 4. Toggle a Like on a post
@app.route('/api/forum/<post_id>/like', methods=['POST'])
def toggle_like(post_id):
    data = request.json
    username = data.get('username')

    if not username:
        return jsonify({"error": "Missing username"}), 400

    try:
        post = forum_collection.find_one({"_id": ObjectId(post_id)})
        if post:
            liked_by = post.get("LikedBy", [])
            # If the user already liked it, remove their like (unlike)
            if username in liked_by:
                forum_collection.update_one(
                    {"_id": ObjectId(post_id)}, 
                    {"$pull": {"LikedBy": username}}
                )
            # If they haven't liked it yet, add their username
            else:
                forum_collection.update_one(
                    {"_id": ObjectId(post_id)}, 
                    {"$addToSet": {"LikedBy": username}}
                )
            return jsonify({"message": "Like toggled successfully!"}), 200
        return jsonify({"error": "Post not found"}), 404
    except Exception as e:
        return jsonify({"error": "Failed to toggle like"}), 500

# 5. Delete a post (Only if the username matches the author)
@app.route('/api/forum/<post_id>', methods=['DELETE'])
def delete_post(post_id):
    data = request.json
    username = data.get('username')

    try:
        # We check BOTH the post ID and the Username to prevent hacking/deleting other people's posts!
        result = forum_collection.delete_one({"_id": ObjectId(post_id), "Username": username})
        if result.deleted_count == 1:
            return jsonify({"message": "Post deleted successfully!"}), 200
        else:
            return jsonify({"error": "Not authorized or post not found"}), 403
    except Exception as e:
        return jsonify({"error": "Failed to delete post"}), 500

# 6. AI Summarize a Forum Post
@app.route('/api/forum/<post_id>/summarize', methods=['GET'])
def summarize_post(post_id):
    try:
        # --- 1. ADD THIS MISSING SETUP ---
        from langchain_groq import ChatGroq
        import os
        
        groq_api_key = os.getenv("GROQ_API_KEY")
        if not groq_api_key:
            return jsonify({"error": "Missing Groq API Key"}), 500
            
        llm = ChatGroq(temperature=0.0, model_name="llama-3.1-8b-instant", api_key=groq_api_key)

        post = forum_collection.find_one({"_id": ObjectId(post_id)})
        if not post:
            return jsonify({"error": "Post not found"}), 404

        # 1. Gather all the text
        title = post.get("Title", "")
        main_content = post.get("Content", "")
        comments = post.get("Comments", [])

        if not comments:
            return jsonify({"summary": "There are no comments yet! Be the first to reply."})

        # 2. Mash it into a single readable script for the AI
        discussion_text = f"Title: {title}\nOriginal Post: {main_content}\n\nComments:\n"
        for c in comments:
            discussion_text += f"- {c['Username']}: {c['Content']}\n"

        # 3. Create the strict prompt for LLaMA 3.1
        prompt = f"""
        You are a helpful Aquarium Expert AI. 
        Read the following forum discussion and provide a very brief, 2-to-3 sentence summary of the community's consensus or the solution provided.
        Do not use any formatting like bolding or asterisks. Keep it plain text.
        
        DISCUSSION:
        {discussion_text}
        """

        # 4. Ask the AI!
        response = llm.invoke(prompt)
        
        return jsonify({"summary": response.content}), 200

    except Exception as e:
        print(f"Summarize Error: {e}")
        return jsonify({"error": "Failed to generate summary"}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True, use_reloader=False)