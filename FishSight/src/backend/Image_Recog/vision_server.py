import os
import traceback
import numpy as np
from PIL import Image
import io
import gc
import threading # 🚨 NEW: Prevents concurrent requests from crashing the model
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import tensorflow as tf
from tf_keras.applications.resnet50 import preprocess_input

load_dotenv()

app = Flask(__name__)
CORS(app)

# --- DATABASE CONNECTION ---
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
db = client.fishsight_db
species_collection = db.fish_species

FISH_CLASSES = [
    "Angel Fish", "Cardinal Tetra", "Cherry Barb", "Common Carp",
    "Gold Fish", "Gourami", "Guppy Fish", "Molly Fish",
    "Neon Tetra", "Platy Fish", "Rohu", "Zebra Fish"          
]

# ==========================================
# 🚨 GLOBAL MODEL LOAD (ONLY HAPPENS ONCE!)
# ==========================================
print("Loading TFLite Model into memory...")
script_dir = os.path.dirname(os.path.abspath(__file__))
tflite_model_path = os.path.join(script_dir, "resnet50.tflite")

# Load it here so it reserves a strict, fixed amount of RAM forever
interpreter = tf.lite.Interpreter(model_path=tflite_model_path)
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# Create a lock so two people clicking "Upload" at the exact same millisecond won't crash it
model_lock = threading.Lock()
print("✅ Vision Model loaded successfully!")


@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "Vision Server is Running!"}), 200

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    try:
        # --- PROCESS IMAGE ---
        image_bytes = file.read()
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        img = img.resize((224, 224))

        img_array = np.array(img, dtype=np.float32)
        img_array = np.expand_dims(img_array, axis=0)
        img_array = preprocess_input(img_array)

        # --- RUN PREDICTION (SAFELY LOCKED) ---
        with model_lock: # 🚨 NEW: Makes sure only one image is processed at a time!
            interpreter.set_tensor(input_details[0]['index'], img_array)
            interpreter.invoke()
            predictions_array = interpreter.get_tensor(output_details[0]['index'])

        # --- CALCULATE RESULT ---
        predicted_class_index = np.argmax(predictions_array[0])
        confidence_score = float(np.max(predictions_array[0])) * 100
        predicted_species = FISH_CLASSES[predicted_class_index]

        # --- DATABASE QUERY ---
        species_data = species_collection.find_one({"CommonName": predicted_species})

        if species_data:
            care_level = f"Temp: {species_data.get('Temp_Range')} | pH: {species_data.get('PH_Range')} | Diet: {species_data.get('Diet')}"
            notes = species_data.get('Description')
        else:
            care_level = "Check Fish Info tab for details"
            notes = "Analysis complete."

        return jsonify({
            "species": predicted_species,
            "confidence": f"{confidence_score:.2f}%",
            "careLevel": care_level, 
            "notes": notes
        }), 200
    
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    
    finally:
        # 🚨 THE FINAL MEMORY WIPE
        # Putting it in the 'finally' block ensures that even if an image causes an error,
        # the server will ALWAYS empty the trash and wipe the image array from RAM.
        gc.collect()

if __name__ == '__main__':
    app.run(port=5002, debug=True, use_reloader=False)