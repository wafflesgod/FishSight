import os
import base64
import uuid
from pymongo import MongoClient
from dotenv import load_dotenv

# 1. Load your existing .env file (just like app.py does!)
load_dotenv()

# 2. Grab your real MongoDB URI from the .env file.
# Note: Check your .env file to make sure the variable is actually called MONGO_URI. 
# If you named it something else (like DATABASE_URL), change it here!
MONGO_URI = os.getenv("MONGO_URI") 

if not MONGO_URI:
    print("❌ ERROR: Could not find your MongoDB connection string in the .env file.")
    exit()

print("🔌 Connecting to your real MongoDB...")
client = MongoClient(MONGO_URI)

# Make sure this matches the exact name of the database you use in database.py
db = client["fishsight_db"] # Replace "FishSight" if your database has a different name
feedback_collection = db["feedback_logs"]

# 2. Create the main dataset folder on your laptop
DATASET_DIR = "retraining_dataset"
if not os.path.exists(DATASET_DIR):
    os.makedirs(DATASET_DIR)

print("🔍 Searching for new training data in MongoDB...")

# 3. Find all documents where the AI made a mistake
mistakes = feedback_collection.find({"is_correct": False})
download_count = 0

for doc in mistakes:
    corrected_label = doc.get("corrected_label")
    image_data_string = doc.get("image_data")
    
    if corrected_label and image_data_string:
        # Create a specific folder for this fish species
        species_dir = os.path.join(DATASET_DIR, corrected_label)
        if not os.path.exists(species_dir):
            os.makedirs(species_dir)
            
        # The base64 string usually looks like "data:image/jpeg;base64,/9j/4AAQ..."
        # We need to split off the header part and only decode the raw data
        if "," in image_data_string:
            header, encoded_data = image_data_string.split(",", 1)
        else:
            encoded_data = image_data_string
            
        # Generate a unique filename
        filename = f"{uuid.uuid4().hex[:8]}.jpg"
        filepath = os.path.join(species_dir, filename)
        
        # Decode and save the image
        with open(filepath, "wb") as fh:
            fh.write(base64.b64decode(encoded_data))
            
        print(f"✅ Downloaded new {corrected_label} image!")
        download_count += 1
        
        # 4. OPTIONAL BUT RECOMMENDED: Delete the record from MongoDB to free up space!
        feedback_collection.delete_one({"_id": doc["_id"]})

print(f"\n🎉 Harvesting complete! Downloaded {download_count} new images.")

# ==========================================
# NEW: CLEAN UP THE CORRECT PREDICTIONS
# ==========================================
print("🧹 Sweeping remaining correct predictions from the database...")

# This deletes all logs where the AI got it right, leaving the database completely empty
# Note: Make sure the field name matches exactly what is in your database 
# (either "IsCorrect": True or "is_correct": True depending on your Flask code)
cleanup_result = feedback_collection.delete_many({"IsCorrect": True})

print(f"✅ Deleted {cleanup_result.deleted_count} text-only logs.")
print("Database is now 100% clean and ready for the next batch!")