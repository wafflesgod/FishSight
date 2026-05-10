import os
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

# Load the secret variables from the .env file
load_dotenv()

# Get the connection string safely
MONGO_URI = os.getenv("MONGO_URI")

# Create a new client and connect to the server (Using MongoDB's recommended ServerApi)
client = MongoClient(MONGO_URI, server_api=ServerApi('1'))

# Send a ping to confirm a successful connection
try:
    client.admin.command('ping')
    print("✅ Pinged your deployment. You successfully connected to MongoDB Atlas!")
except Exception as e:
    print(f"❌ Failed to connect to MongoDB. Error: {e}")

# Select your database and collection
db = client.fishsight_db
users_collection = db.users
species_collection = db.fish_species
forum_collection = db.forums
feedback_collection = db["feedback_logs"] # Add this line