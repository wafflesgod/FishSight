import os
from dotenv import load_dotenv
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter 
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

# Load environment variables
load_dotenv()

# 1. Connect to MongoDB Atlas
print("Connecting to MongoDB...")
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
db = client.fishsight_db
species_collection = db.fish_species

# 2. Fetch and Format Data
print("Fetching fish species data from MongoDB...")
fish_records = species_collection.find()
documents = []

for fish in fish_records:
    # Format the data into a clean, readable paragraph for the AI
    content = (
        f"Fish Species: {fish.get('CommonName', 'Unknown')}\n"
        f"Scientific Name: {fish.get('SciName', 'Unknown')}\n"
        f"Family: {fish.get('Family', 'Unknown')}\n"
        f"Required pH Range: {fish.get('PH_Range', 'Unknown')}\n"
        f"Required Temperature: {fish.get('Temp_Range', 'Unknown')}\n"
        f"Diet: {fish.get('Diet', 'Unknown')}\n"
        f"General Description and Care: {fish.get('Description', 'No description available.')}"
    )
    
    # Create a LangChain Document object
    doc = Document(
        page_content=content, 
        metadata={"source": fish.get('CommonName', 'Database')}
    )
    documents.append(doc)

if not documents:
    print("⚠️ No data found in the fish_species collection. Did you run seed_fish.py?")
    exit()

# 3. Split Data
print("Splitting data into chunks...")
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
chunks = text_splitter.split_documents(documents)

# 4. Create Embeddings
print("Converting text to numbers...")
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# 5. Save the Database locally
print("Saving FAISS index...")
vector_store = FAISS.from_documents(chunks, embeddings)
vector_store.save_local("aquarium_index")

print("✅ Done! The 'aquarium_index' folder has been updated with your database knowledge.")