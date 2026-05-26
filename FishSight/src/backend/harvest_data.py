import os
import base64
import uuid
from pymongo import MongoClient
from dotenv import load_dotenv

# 1. Load your existing .env file
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI") 

if not MONGO_URI:
    print("❌ ERROR: Could not find your MongoDB connection string in the .env file.")
    exit()

print("🔌 Connecting to your real MongoDB...")
client = MongoClient(MONGO_URI)

# Make sure this matches the exact name of your database
db = client["fishsight_db"] 
feedback_collection = db["feedback_logs"]
community_collection = db["community_images"] # <-- NEW: Hooks up to your new collection!

# 2. Create the main dataset folder on your laptop
DATASET_DIR = "retraining_dataset"
if not os.path.exists(DATASET_DIR):
    os.makedirs(DATASET_DIR)

# ==========================================
# PART 1: HARVEST AI MISTAKES
# ==========================================
print("\n🔍 Searching for AI mistakes in feedback_logs...")
mistakes = feedback_collection.find({"is_correct": False})
mistake_count = 0

for doc in mistakes:
    corrected_label = doc.get("corrected_label")
    image_data_string = doc.get("image_data")
    
    if corrected_label and image_data_string:
        species_dir = os.path.join(DATASET_DIR, corrected_label)
        if not os.path.exists(species_dir):
            os.makedirs(species_dir)
            
        if "," in image_data_string:
            header, encoded_data = image_data_string.split(",", 1)
        else:
            encoded_data = image_data_string
            
        filename = f"{uuid.uuid4().hex[:8]}.jpg"
        filepath = os.path.join(species_dir, filename)
        
        with open(filepath, "wb") as fh:
            fh.write(base64.b64decode(encoded_data))
            
        print(f"✅ Downloaded new {corrected_label} image!")
        mistake_count += 1
        
        feedback_collection.delete_one({"_id": doc["_id"]})

print(f"🎉 Harvested {mistake_count} images from AI mistakes.")

# ==========================================
# PART 2: HARVEST COMMUNITY UPLOADS (NEW)
# ==========================================
print("\n🔍 Searching for new Community Uploads...")
community_uploads = community_collection.find()
comm_count = 0

for doc in community_uploads:
    image_data_string = doc.get("ImageData")
    
    if image_data_string:
        # Put these in a special folder since the user didn't tell us what species it is!
        species_dir = os.path.join(DATASET_DIR, "Uncategorized_Community_Uploads")
        if not os.path.exists(species_dir):
            os.makedirs(species_dir)
            
        if "," in image_data_string:
            header, encoded_data = image_data_string.split(",", 1)
        else:
            encoded_data = image_data_string
            
        filename = f"community_upload_{uuid.uuid4().hex[:8]}.jpg"
        filepath = os.path.join(species_dir, filename)
        
        with open(filepath, "wb") as fh:
            fh.write(base64.b64decode(encoded_data))
            
        print(f"✅ Downloaded community upload from User: {doc.get('Username', 'Anonymous')}!")
        comm_count += 1
        
        # Delete from MongoDB to save database space!
        community_collection.delete_one({"_id": doc["_id"]})

print(f"🎉 Harvested {comm_count} new images from the Community.")

# ==========================================
# PART 3: CLEAN UP CORRECT PREDICTIONS
# ==========================================
print("\n🧹 Sweeping remaining correct predictions from the database...")
cleanup_result = feedback_collection.delete_many({"IsCorrect": True})

print(f"✅ Deleted {cleanup_result.deleted_count} text-only logs.")
print("Database is now 100% clean and ready for the next batch!")