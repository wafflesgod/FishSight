# backend/main.py
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext

from database import database, user_helper
from FishSight.src.backend.validation import UserCreate, UserResponse

app = FastAPI()

# Allow React to talk to this Backend
origins = ["https://fishsight-h6z5.onrender.com"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

@app.get("/")
def read_root():
    return {"message": "FishSight Backend is Running!"}

@app.post("/auth/register", response_model=UserResponse)
async def register_user(user: UserCreate = Body(...)):
    existing_user = await database["users"].find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user.password)
    user_data = {
        "username": user.username,
        "email": user.email,
        "password": hashed_password
    }
    
    new_user = await database["users"].insert_one(user_data)
    created_user = await database["users"].find_one({"_id": new_user.inserted_id})
    return user_helper(created_user)