import os
from PIL import Image

# 1. Set your exact Windows folder paths (the 'r' before the string handles the backslashes safely)
input_folder = r"C:\Users\huimi\OneDrive\FYP\Fish_Dataset\dataset\sony image"
output_folder = r"C:\Users\huimi\OneDrive\FYP\Fish_Dataset\dataset\sony_image_compressed"

# Create the output folder if it doesn't exist yet
if not os.path.exists(output_folder):
    os.makedirs(output_folder)

# 2. Set the maximum dimensions (Standard 1080p HD)
MAX_SIZE = (1920, 1080)

# Get a list of all files to know exactly how many we have
all_files = [f for f in os.listdir(input_folder) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
total_files = len(all_files)

print(f"Found {total_files} images. Starting the massive compression process...")
print("Grab a coffee, this might take a few minutes!\n")

success_count = 0
error_count = 0

# Loop through every single image
for i, filename in enumerate(all_files, 1):
    img_path = os.path.join(input_folder, filename)
    
    try:
        with Image.open(img_path) as img:
            # Resize while keeping the exact original aspect ratio
            img.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)
            
            # Save the new image
            output_path = os.path.join(output_folder, 'compressed_' + filename)
            
            # Convert to RGB if needed (prevents errors with certain image types)
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
                
            img.save(output_path, 'JPEG', quality=85, optimize=True)
            success_count += 1
            
            # Print an update every 100 images so you know it hasn't frozen!
            if i % 100 == 0 or i == total_files:
                print(f"Progress: [{i}/{total_files}] images processed...")
                
    except Exception as e:
        print(f"Error compressing {filename}: {e}")
        error_count += 1

print("\n--- COMPRESSION COMPLETE! ---")
print(f"Successfully compressed: {success_count} images")
print(f"Errors encountered: {error_count} images")
print(f"Check your new folder at: {output_folder}")