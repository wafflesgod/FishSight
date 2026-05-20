import os
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI, server_api=ServerApi('1'))
db = client.fishsight_db
species_collection = db.fish_species

# Clear out any old test data
species_collection.delete_many({})

# Data perfectly matching your ERD structure!
fish_data = [
    {
        "SpeciesID": "F01",
        "CommonName": "Cherry Barb",
        "SciName": "Puntius titteya",
        "PH_Range": "6.0 - 8.0",
        "Temp_Range": "23 - 27 °C",
        "Breeding": "Egg layer",
        "Size": "Up to 5 cm",
        "Lifespan": "4-6 years",
        "Temperament": "Peaceful",
        "Diet": "Omnivore",
        "Tank_Level": "Mid to Top",
        "CareLevel": "Easy",
        "ImageRef": "cherry_barb.jpg", # We can link this to real images later
        "Description": "A peaceful schooling fish that adds a bright pop of red to community tanks. Very hardy and great for beginners."
    },
    {
        "SpeciesID": "F02",
        "CommonName": "Neon Tetra",
        "SciName": "Paracheirodon innesi",
        "PH_Range": "5.0 - 7.0",
        "Temp_Range": "20 - 26 °C",
        "Breeding": "Egg layer",
        "Size": "Up to 4 cm",
        "Lifespan": "3-5 years",
        "Temperament": "Peaceful",
        "Diet": "Omnivore",
        "Tank_Level": "Mid to Top",
        "CareLevel": "Easy - Medium",
        "ImageRef": "neon_tetra.jpg",
        "Description": "A small, colorful schooling fish. They prefer heavily planted tanks with dim lighting and peaceful tankmates."
    },
    {
        "SpeciesID": "F03",
        "CommonName": "Guppy Fish",
        "SciName": "Poecilia reticulata",
        "PH_Range": "7.0 - 8.2",
        "Temp_Range": "22 - 28 °C",
        "Breeding": "Livebearer",
        "Size": "Up to 5 cm",
        "Lifespan": "2-4 years",
        "Temperament": "Peaceful",
        "Diet": "Omnivore",
        "Tank_Level": "Mid to Top",
        "CareLevel": "Easy",
        "ImageRef": "guppy.jpg",
        "Description": "Extremely hardy and active livebearers. They breed rapidly and come in a massive variety of colors."
    }
    # You can add the rest of your 12 species here later!
]

species_collection.insert_many(fish_data)
print("✅ Successfully seeded the database with Fish Species data!")