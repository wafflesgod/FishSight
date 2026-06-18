import os
import random
from PIL import Image, ImageEnhance, ImageOps

# ================= CONFIGURATION =================
# 1. Exact name of your new folder
TARGET_FOLDER = "dataset\\train\\angelfish"

# 2. Match your other classes (Rohu/Tilapia are ~450-500)
TARGET_COUNT = 1122 
# =================================================

def augment_custom_fish():
    if not os.path.exists(TARGET_FOLDER):
        print(f"❌ Error: Folder '{TARGET_FOLDER}' not found.")
        return

    # Get valid images
    exts = ('.jpg', '.jpeg', '.png', '.bmp')
    images = [f for f in os.listdir(TARGET_FOLDER) if f.lower().endswith(exts)]
    current_count = len(images)
    
    print(f"✅ Found {current_count} original images.")
    
    if current_count == 0:
        print("⚠️ No images to augment!")
        return

    needed = TARGET_COUNT - current_count
    if needed <= 0:
        print(f"🎉 You already have {current_count} images!")
        return

    print(f"🚀 Generating {needed} new images to reach {TARGET_COUNT}...")

    generated = 0
    while generated < needed:
        # Pick random original image
        img_name = random.choice(images)
        img_path = os.path.join(TARGET_FOLDER, img_name)
        
        try:
            img = Image.open(img_path).convert("RGB")
            
            # Randomly choose an effect
            action = random.choice(["flip", "rotate", "brightness", "zoom", "contrast"])
            
            if action == "flip":
                aug_img = ImageOps.mirror(img)
                suffix = "_flip"
            elif action == "rotate":
                angle = random.randint(-30, 30) # Rotate +/- 30 degrees
                aug_img = img.rotate(angle, expand=False)
                suffix = f"_rot{angle}"
            elif action == "brightness":
                factor = random.uniform(0.7, 1.4) # Darker or Brighter
                aug_img = ImageEnhance.Brightness(img).enhance(factor)
                suffix = "_bright"
            elif action == "contrast":
                factor = random.uniform(0.8, 1.3)
                aug_img = ImageEnhance.Contrast(img).enhance(factor)
                suffix = "_contrast"
            elif action == "zoom":
                # Zoom in slightly (crop center)
                w, h = img.size
                zoom = random.uniform(0.8, 0.9) # Zoom 10-20%
                crop_w, crop_h = int(w*zoom), int(h*zoom)
                left, top = (w - crop_w)//2, (h - crop_h)//2
                aug_img = img.crop((left, top, left+crop_w, top+crop_h))
                aug_img = aug_img.resize((w, h), Image.Resampling.LANCZOS)
                suffix = "_zoom"

            # Save
            new_name = f"aug_{generated}_{suffix}.jpg"
            save_path = os.path.join(TARGET_FOLDER, new_name)
            aug_img.save(save_path)
            generated += 1
            
            if generated % 50 == 0:
                print(f"   Created {generated}/{needed}...")

        except Exception as e:
            pass

    print(f"\n✅ DONE! Folder now has {TARGET_COUNT} images.")

if __name__ == "__main__":
    augment_custom_fish()