import os
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from datetime import datetime, timezone
from bson.objectid import ObjectId

# Import your MongoDB collection from database.py
from database import users_collection, species_collection, forum_collection, chat_history_collection 

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

print("🤖 Smart Aquarium Bot is Ready!")

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
        fish_list = list(species_collection.find({}, {"_id": 0}))
        return jsonify(fish_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==========================================
# SUSTAINABLE AI - FEEDBACK ROUTE
# ==========================================
from database import feedback_collection

@app.route('/api/feedback', methods=['POST', 'OPTIONS'])
def collect_feedback():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    data = request.json
    is_correct = data.get('is_correct')
    original_prediction = data.get('original_prediction')
    username = data.get('username') 
    
    if is_correct:
        feedback_collection.insert_one({
            "UserID": username, 
            "OriginalPrediction": original_prediction,
            "IsCorrect": True,
            "Timestamp": datetime.now(timezone.utc)
        })
    else:
        feedback_collection.insert_one({
            "UserID": username, 
            "OriginalPrediction": original_prediction,
            "CorrectedLabel": data.get('corrected_label'),
            "IsCorrect": False,
            "ImageData": data.get('image_data'),
            "Timestamp": datetime.now(timezone.utc)
        })
        
    return jsonify({"message": "Feedback securely logged."}), 200

# ==========================================
# NEW: COMMUNITY DATA COLLECTION ROUTE
# ==========================================
@app.route('/api/submit-data', methods=['POST', 'OPTIONS'])
def submit_training_data():
    if request.method == 'OPTIONS':
        return jsonify({}), 200

    try:
        data = request.json
        username = data.get('username', 'Anonymous')
        image_data = data.get('image_data')
        timestamp = data.get('timestamp')

        if not image_data:
            return jsonify({"error": "No image data provided"}), 400

        # Clever trick: get the db object from an existing collection to avoid modifying database.py!
        db = forum_collection.database
        
        # Save to your new MongoDB collection!
        db.community_images.insert_one({
            "Username": username,
            "ImageData": image_data,
            "Timestamp": timestamp
        })

        return jsonify({"message": "Image submitted successfully"}), 201

    except Exception as e:
        print(f"Error saving training data: {e}")
        return jsonify({"error": "Failed to save data"}), 500

# ==========================================
# Create Chat History Route
# ==========================================
@app.route('/api/chat/history/<username>', methods=['GET'])
def get_chat_history(username):
    pipeline = [
        {"$match": {"UserID": username}},
        {"$sort": {"Timestamp": 1}}, 
        {"$group": {
            "_id": "$SessionID",
            "FirstMessage": {"$first": "$UserQuery"}, 
            "LastUpdated": {"$last": "$Timestamp"},
            "Messages": {"$push": {"query": "$UserQuery", "response": "$AIResponse"}}
        }},
        {"$sort": {"LastUpdated": -1}} 
    ]
    
    sessions = list(chat_history_collection.aggregate(pipeline))
    return jsonify(sessions), 200

# ==========================================
# Delete Chat Session Route
# ==========================================
@app.route('/api/chat/history/<session_id>', methods=['DELETE'])
def delete_chat_session(session_id):
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
@app.route('/api/forum', methods=['GET'])
def get_forum_posts():
    try:
        posts = list(forum_collection.find().sort("Timestamp", -1))
        for post in posts:
            post['_id'] = str(post['_id'])
        return jsonify(posts), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/forum', methods=['POST'])
def create_forum_post():
    data = request.json
    title = data.get('title')
    content = data.get('content')
    username = data.get('username') 

    if not title or not content or not username:
        return jsonify({"error": "Missing required fields"}), 400

    new_post = {
        "Title": title,
        "Content": content,
        "Username": username,
        "Timestamp": datetime.now(timezone.utc),
        "Comments": [] 
    }
    
    result = forum_collection.insert_one(new_post)
    return jsonify({"message": "Post created successfully!", "id": str(result.inserted_id)}), 201

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
        forum_collection.update_one(
            {"_id": ObjectId(post_id)},
            {"$push": {"Comments": new_comment}}
        )
        return jsonify({"message": "Comment added successfully!"}), 201
    except Exception as e:
        return jsonify({"error": "Failed to add comment"}), 500
    
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
            if username in liked_by:
                forum_collection.update_one(
                    {"_id": ObjectId(post_id)}, 
                    {"$pull": {"LikedBy": username}}
                )
            else:
                forum_collection.update_one(
                    {"_id": ObjectId(post_id)}, 
                    {"$addToSet": {"LikedBy": username}}
                )
            return jsonify({"message": "Like toggled successfully!"}), 200
        return jsonify({"error": "Post not found"}), 404
    except Exception as e:
        return jsonify({"error": "Failed to toggle like"}), 500

@app.route('/api/forum/<post_id>', methods=['DELETE'])
def delete_post(post_id):
    data = request.json
    username = data.get('username')

    try:
        result = forum_collection.delete_one({"_id": ObjectId(post_id), "Username": username})
        if result.deleted_count == 1:
            return jsonify({"message": "Post deleted successfully!"}), 200
        else:
            return jsonify({"error": "Not authorized or post not found"}), 403
    except Exception as e:
        return jsonify({"error": "Failed to delete post"}), 500

@app.route('/api/forum/<post_id>/summarize', methods=['GET'])
def summarize_post(post_id):
    try:
        from langchain_groq import ChatGroq
        import os
        
        groq_api_key = os.getenv("GROQ_API_KEY")
        if not groq_api_key:
            return jsonify({"error": "Missing Groq API Key"}), 500
            
        llm = ChatGroq(temperature=0.0, model_name="llama-3.1-8b-instant", api_key=groq_api_key)

        post = forum_collection.find_one({"_id": ObjectId(post_id)})
        if not post:
            return jsonify({"error": "Post not found"}), 404

        title = post.get("Title", "")
        main_content = post.get("Content", "")
        comments = post.get("Comments", [])

        if not comments:
            return jsonify({"summary": "There are no comments yet! Be the first to reply."})

        discussion_text = f"Title: {title}\nOriginal Post: {main_content}\n\nComments:\n"
        for c in comments:
            discussion_text += f"- {c['Username']}: {c['Content']}\n"

        prompt = f"""
        You are a helpful Aquarium Expert AI. 
        Read the following forum discussion and provide a very brief, 2-to-3 sentence summary of the community's consensus or the solution provided.
        Do not use any formatting like bolding or asterisks. Keep it plain text.
        
        DISCUSSION:
        {discussion_text}
        """

        response = llm.invoke(prompt)
        
        return jsonify({"summary": response.content}), 200

    except Exception as e:
        print(f"Summarize Error: {e}")
        return jsonify({"error": "Failed to generate summary"}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True, use_reloader=False)