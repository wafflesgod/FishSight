# FishSight

FishSight is an AI-powered fish identification and aquarium assistant project built with React + Vite for the frontend and Flask-based backend services for fish recognition, chatbot support, and community features.

## Project Source Code

GitHub repository:
https://github.com/wafflesgod/FishSight

## Project Overview

FishSight provides:
- Fish image identification using a TensorFlow Lite model
- Fish information retrieval from MongoDB Atlas
- A chatbot assistant for aquarium care questions
- A community forum for aquarium discussions

## Main Components

- Frontend: FishSight/
- Backend API: FishSight/src/backend/app.py
- Vision server: FishSight/src/backend/Image_Recog/vision_server.py
- Chatbot server: FishSight/src/backend/Chatbot/chatbot_server.py

## Required Tools

Install the following tools before running the project:

1. Python 3.10 or newer
   - Download: https://www.python.org/downloads/

2. Node.js 20 or newer
   - Download: https://nodejs.org/

3. Git
   - Download: https://git-scm.com/downloads/

4. MongoDB Atlas account
   - Create an account: https://www.mongodb.com/atlas/database

5. Groq API key
   - Sign up: https://console.groq.com/

6. Google AI API key
   - Sign up: https://aistudio.google.com/

## Recommended IDE

- Visual Studio Code
  - Download: https://code.visualstudio.com/

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/wafflesgod/FishSight.git
cd FishSight
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install Python dependencies

```bash
cd src/backend
pip install -r requirements.txt
pip install -r Chatbot/requirements.txt
pip install -r Image_Recog/requirements.txt
```

### 4. Create environment files

Frontend environment file: FishSight/.env

```env
VITE_MAIN_API_URL=http://127.0.0.1:5000
VITE_CHATBOT_URL=http://127.0.0.1:5001
VITE_VISION_URL=http://127.0.0.1:5002
```

Backend environment file: FishSight/src/backend/.env

```env
MONGO_URI=your_mongodb_atlas_connection_string
GROQ_API_KEY=your_groq_api_key
GOOGLE_API_KEY=your_google_api_key
```

### 5. Initialize the chatbot knowledge base (recommended)

```bash
cd src/backend/Chatbot
python setup_database.py
```

This creates the FAISS vector index used by the chatbot.

## Run the Application

Start the backend services in separate terminals:

### Terminal 1 - Main API server

```bash
cd FishSight
python src/backend/app.py
```

### Terminal 2 - Vision server

```bash
cd FishSight
python src/backend/Image_Recog/vision_server.py
```

### Terminal 3 - Chatbot server

```bash
cd FishSight
python src/backend/Chatbot/chatbot_server.py
```

### Terminal 4 - Frontend

```bash
cd FishSight
npm run dev
```

Open the frontend at:
http://localhost:5173

## Dataset Information

The project uses a self-collected dataset and also supports public datasets.

### Self-collected dataset
https://data.mendeley.com/datasets/cv62vw3tjk/1

### Other public sources
- https://doi.org/10.17632/tdn9cw7mrm.1
- https://doi.org/10.17632/2gkj4h388d.3
- https://www.kaggle.com/datasets/umarabdulalim/guppy-fish-dataset-yolo
- https://www.kaggle.com/datasets/zehraatlgan/fish-detection
- https://universe.roboflow.com/dia-dpbka/angelfish-dataset/dataset/1

For retraining or adding more samples, place the images in:
FishSight/src/backend/retraining_dataset/

If you are using the public datasets above, download the images and organize them by fish class before training or retraining the model.

## Additional Notes

- The chatbot uses MongoDB Atlas for fish information and chat history.
- The vision model is stored as a TensorFlow Lite file in FishSight/src/backend/Image_Recog/resnet50.tflite.
- If the chatbot or vision server cannot connect to MongoDB or the AI services, check your .env values.

### RAG Chatbot Notes
You need to update the data in FishSight/src/backend/Chatbot/aquarium_data.txt, then run:

```bash
cd FishSight/src/backend/Chatbot
python setup_database.py
```

### Fish Information Updates
You need to update the information in FishSight/src/backend/fish_info.py, then run it to upload the information to MongoDB Atlas. After that, you may remove the information from the code or leave it until the next update.

### Color Palette
https://colorhunt.co/palette/f9f7f7dbe2ef3f72af112d4e
