import os
import random
from PIL import Image, ImageEnhance, ImageOps

# ================= CONFIGURATION =================
# Point this to your SPLIT training folder
TRAIN_DIR = "dataset\\train\\angelfish" 

# Target number of images per class
TARGET_COUNT = 1122 
# =================================================

def augment_all_classes():
    if not os.path.exists(TRAIN_DIR):
        print(f"❌ Error: Folder '{TRAIN_DIR}' not found.")
        return

    # Get list of all fish species folders
    species_folders = [d for d in os.listdir(TRAIN_DIR) if os.path.isdir(os.path.join(TRAIN_DIR, d))]
    
    print(f"📂 Found {len(species_folders)} species folders. Checking counts...")

    for species in species_folders:
        folder_path = os.path.join(TRAIN_DIR, species)
        
        # Get valid images
        exts = ('.jpg', '.jpeg', '.png', '.bmp')
        images = [f for f in os.listdir(folder_path) if f.lower().endswith(exts)]
        current_count = len(images)
        
        # Skip if we already have enough data
        if current_count >= TARGET_COUNT:
            print(f"✅ {species}: {current_count} images (Good!)")
            continue
            
        needed = TARGET_COUNT - current_count
        print(f"🔄 {species}: Has {current_count} -> Generating {needed} new images...")

        generated = 0
        while generated < needed:
            # Pick random original image
            img_name = random.choice(images)
            img_path = os.path.join(folder_path, img_name)
            
            try:
                img = Image.open(img_path).convert("RGB")
                
                # Randomly choose an effect
                action = random.choice(["flip", "rotate", "brightness", "zoom", "contrast", "noise"])
                
                if action == "flip":
                    aug_img = ImageOps.mirror(img)
                    suffix = "_flip"
                elif action == "rotate":
                    angle = random.randint(-45, 45) # Increased rotation for variety
                    aug_img = img.rotate(angle, expand=False)
                    suffix = f"_rot{angle}"
                elif action == "brightness":
                    factor = random.uniform(0.6, 1.5)
                    aug_img = ImageEnhance.Brightness(img).enhance(factor)
                    suffix = "_bright"
                elif action == "contrast":
                    factor = random.uniform(0.7, 1.4)
                    aug_img = ImageEnhance.Contrast(img).enhance(factor)
                    suffix = "_contrast"
                elif action == "zoom":
                    w, h = img.size
                    zoom = random.uniform(0.75, 0.90)
                    crop_w, crop_h = int(w*zoom), int(h*zoom)
                    left, top = (w - crop_w)//2, (h - crop_h)//2
                    aug_img = img.crop((left, top, left+crop_w, top+crop_h))
                    aug_img = aug_img.resize((w, h), Image.Resampling.LANCZOS)
                    suffix = "_zoom"
                elif action == "noise":
                    # Simple noise simulation (optional, helps with "low data" classes)
                    aug_img = img # Placeholder if you don't have noise lib, acts as duplicate
                    suffix = "_copy" 

                # Save
                new_name = f"aug_{generated}_{suffix}.jpg"
                save_path = os.path.join(folder_path, new_name)
                aug_img.save(save_path)
                generated += 1
                
            except Exception as e:
                pass

        print(f"🎉 {species} Done! Now has {TARGET_COUNT}.")

    print("\n✅ ALL AUGMENTATION COMPLETE!")

if __name__ == "__main__":
    augment_all_classes()