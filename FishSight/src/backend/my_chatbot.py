import os
from langchain_groq import ChatGroq
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

# ==========================================
# CONFIGURATION
# ==========================================
# PASTE YOUR KEY HERE!
groq_api_key = "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" 

# ==========================================
# 1. SETUP PATHS
# ==========================================
script_dir = os.path.dirname(os.path.abspath(__file__))
index_path = os.path.join(script_dir, "aquarium_index")

if not os.path.exists(index_path):
    print(f"ERROR: Index not found at {index_path}")
    exit()

# ==========================================
# 2. LOAD THE BRAIN (Index)
# ==========================================
print("Loading brain...")
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vector_store = FAISS.load_local(index_path, embeddings, allow_dangerous_deserialization=True)
retriever = vector_store.as_retriever(search_kwargs={"k": 2})

# ==========================================
# 3. INITIALIZE LLM (LLaMA 3.1)
# ==========================================
llm = ChatGroq(
    temperature=0, 
    model_name="llama-3.1-8b-instant", 
    api_key=groq_api_key
)

# ==========================================
# 4. CHAT LOOP (Manual Mode - No Chains!)
# ==========================================
print("\n" + "="*40)
print("🤖 AQUARIUM BOT IS READY! (Type 'quit' to exit)")
print("="*40 + "\n")

while True:
    user_input = input("You: ")
    if user_input.lower() in ["quit", "exit"]:
        break
    
    # A. Search the database manually
    print("   (Thinking...)")
    docs = retriever.invoke(user_input)
    
    # B. Combine the found text
    context_text = "\n\n".join([doc.page_content for doc in docs])
    
    # C. Create the prompt manually
    prompt = f"""
    You are an expert aquarium assistant. Answer the question based ONLY on the context below.
    
    CONTEXT:
    {context_text}
    
    QUESTION:
    {user_input}
    """
    
    # D. Send to LLaMA
    try:
        response = llm.invoke(prompt)
        print(f"\nBot: {response.content}\n")
    except Exception as e:
        print(f"Error: {e}")