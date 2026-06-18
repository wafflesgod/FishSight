import cv2
import os
import sys

# --- Configuration ---
input_folder = r'C:\Users\huimi\OneDrive\FYP\Fish_Dataset\dataset\need crop'  # Folder with your DSC images
output_folder = r'C:\Users\huimi\OneDrive\FYP\Fish_Dataset\dataset\train\cherry_barb'      # Where cropped images will go
starting_number = 1540

if not os.path.exists(output_folder):
    os.makedirs(output_folder)

# Get and sort images from your Sony camera
images = [f for f in os.listdir(input_folder) if f.lower().endswith(('.jpg', '.jpeg'))]
images.sort()

# Global variables for tracking mouse movement
ix, iy = -1, -1
drawing = False
curr_x, curr_y = -1, -1

def draw_rect(event, x, y, flags, param):
    global ix, iy, drawing, curr_x, curr_y
    curr_x, curr_y = x, y
    if event == cv2.EVENT_LBUTTONDOWN:
        drawing = True
        ix, iy = x, y
    elif event == cv2.EVENT_LBUTTONUP:
        drawing = False

current_id = starting_number

for filename in images:
    img_path = os.path.join(input_folder, filename)
    img = cv2.imread(img_path)
    if img is None: continue

    cv2.namedWindow("Manual Cropper", cv2.WINDOW_NORMAL)
    cv2.resizeWindow("Manual Cropper", 1200, 800)
    cv2.setMouseCallback("Manual Cropper", draw_rect)

    print(f"[{current_id}] Image: {filename} | 'S': Save | 'Q': Skip | 'C': Exit Program")

    while True:
        display_img = img.copy()
        
        # 1. Draw High-Visibility Crosshairs (Thickness 3)
        cv2.line(display_img, (0, curr_y), (display_img.shape[1], curr_y), (255, 255, 0), 3)
        cv2.line(display_img, (curr_x, 0), (curr_x, display_img.shape[0]), (255, 255, 0), 3)

        # 2. Draw BOLD Green Crop Box (Thickness 10 for high-res visibility)
        if drawing:
            cv2.rectangle(display_img, (ix, iy), (curr_x, curr_y), (0, 255, 0), 10)

        cv2.imshow("Manual Cropper", display_img)
        key = cv2.waitKey(1) & 0xFF

        # SAVE current crop
        if key == ord("s"):
            if ix != -1 and iy != -1:
                x1, x2 = sorted([ix, curr_x])
                y1, y2 = sorted([iy, curr_y])
                cropped_img = img[y1:y2, x1:x2]
                if cropped_img.size > 0:
                    new_name = f"Image_{current_id}.jpg"
                    cv2.imwrite(os.path.join(output_folder, new_name), cropped_img)
                    print(f"Saved: {new_name}")
                    current_id += 1
            break
            
        # SKIP this image
        elif key == ord("q"):
            print(f"Skipped {filename}")
            break
            
        # CANCEL the entire program
        elif key == ord("c"):
            print("Program closed by user.")
            cv2.destroyAllWindows()
            sys.exit()

    cv2.destroyAllWindows()