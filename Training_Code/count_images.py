import os
import pandas as pd

# CONFIGURATION
DATASET_PATH = r"C:\Users\huimi\OneDrive\FYP\Code - ResNet50\dataset_5\train"  # Your main folder

def count_dataset():
    if not os.path.exists(DATASET_PATH):
        print(f"❌ Error: Folder '{DATASET_PATH}' not found!")
        return

    stats = []
    
    # Loop through every folder
    for species in os.listdir(DATASET_PATH):
        species_path = os.path.join(DATASET_PATH, species)
        
        if os.path.isdir(species_path):
            # Count valid image files
            images = [f for f in os.listdir(species_path) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp'))]
            count = len(images)
            
            stats.append({
                "Species": species,
                "Image Count": count,
                "Status": "✅ Good" if count > 300 else "⚠️ Low Data"
            })

    # Convert to a nice table
    df = pd.DataFrame(stats)
    
    # Sort by count (Highest first)
    df = df.sort_values(by="Image Count", ascending=False)
    
    print("\n" + "="*40)
    print(" 📊 DATASET STATISTICS")
    print("="*40)
    print(df.to_string(index=False))
    print("="*40)
    print(f"TOTAL IMAGES: {df['Image Count'].sum()}")
    print("="*40)

    # Optional: Save to CSV for your report
    df.to_csv("dataset_stats.csv", index=False)
    print("Saved stats to 'dataset_stats.csv'")

if __name__ == "__main__":
    count_dataset()