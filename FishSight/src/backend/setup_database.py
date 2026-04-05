import os
from langchain_community.document_loaders import TextLoader
# --- CHANGED LINE BELOW ---
from langchain_text_splitters import RecursiveCharacterTextSplitter 
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

# 1. Load Data
print("Loading aquarium data...")
loader = TextLoader("aquarium_data.txt")
documents = loader.load()

# 2. Split Data
text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
chunks = text_splitter.split_documents(documents)

# 3. Create Embeddings
print("Converting text to numbers...")
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# 4. Save the Database locally
vector_store = FAISS.from_documents(chunks, embeddings)
vector_store.save_local("aquarium_index")

print("Done! You created the 'aquarium_index' folder.")