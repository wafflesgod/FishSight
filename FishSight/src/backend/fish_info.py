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
        "Tank_Level": "Top to Mid",
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
        "Tank_Level": "Top to Mid",
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
        "Tank_Level": "Top to Mid",
        "CareLevel": "Easy",
        "ImageRef": "guppy.jpg",
        "Description": "Extremely hardy and active livebearers. They breed rapidly and come in a massive variety of colors."
    },
    {
        "SpeciesID": "F04",
        "CommonName": "Angel Fish",
        "SciName": "Pterophyllum scalare",
        "PH_Range": "6.8 - 7",
        "Temp_Range": "25 - 28 °C",
        "Breeding": "Egg layer",
        "Size": "Up to 10 cm",
        "Lifespan": "10-13 years",
        "Temperament": "Semi-aggressive",
        "Diet": "Omnivore",
        "Tank_Level": "Top toMid",
        "CareLevel": "Easy",
        "ImageRef": "angel_fish.jpg",
        "Description": "Known for their distinctive disc-shaped body and flowing fins. They are generally peaceful but can be territorial during breeding season."
    },
    {
        "SpeciesID": "F05",
        "CommonName": "Cardinal Tetra",
        "SciName": "Paracheirodon axelrodi",
        "PH_Range": "4.6 - 6.2",
        "Temp_Range": "23 - 27 °C",
        "Breeding": "Egg layer",
        "Size": "Up to 5 cm", 
        "Lifespan": "4-5 years",
        "Temperament": "Peaceful",
        "Diet": "Omnivore",
        "Tank_Level": "Top to Mid",
        "CareLevel": "Intermediate",
        "ImageRef": "cardinal_tetra.jpg",
        "Description": "The Cardinal Tetra is a vibrant and peaceful schooling fish famous for the brilliant neon blue and vivid red stripes running the entire length of its body. Native to the acidic blackwater streams of South America, they thrive in established, heavily planted aquariums. Because of their social nature, they should be kept in groups of six or more to feel secure and display their best colors."
    },
    {
        "SpeciesID": "F06",
        "CommonName": "Goldfish",
        "SciName": "Carassius auratus",
        "PH_Range": "7.0 - 8.4",
        "Temp_Range": "20 - 23 °C",
        "Breeding": "Egg layer",
        "Size": "Up to 15 - 30 cm", 
        "Lifespan": "10-15 years",
        "Temperament": "Peaceful",
        "Diet": "Omnivore",
        "Tank_Level": "All levels",
        "CareLevel": "Beginner",
        "ImageRef": "goldfish.jpg",
        "Description": "A classic, cold-water aquarium fish known for its bright orange coloration and hearty appetite. Because they grow large and produce a high bioload, they require heavy filtration and highly spacious tanks rather than small bowls."
    },
    {
        "SpeciesID": "F07",
        "CommonName": "Gourami",
        "SciName": "Trichogaster lalius",
        "PH_Range": "6.0 - 7.5",
        "Temp_Range": "22 - 28 °C",
        "Breeding": "Bubble nest builder",
        "Size": "Up to 7 cm", 
        "Lifespan": "4-5 years",
        "Temperament": "Peaceful",
        "Diet": "Omnivore",
        "Tank_Level": "Top to Mid",
        "CareLevel": "Intermediate",
        "ImageRef": "gourami.jpg",
        "Description": "A vibrant labyrinth fish capable of breathing surface air, easily recognized by its bright stripes and long, thread-like pelvic fins. They prefer slower-moving waters with plenty of floating plants and make excellent centerpieces for community tanks."
    },
    {
        "SpeciesID": "F08",
        "CommonName": "Molly Fish",
        "SciName": "Poecilia sphenops",
        "PH_Range": "7.5 - 8.5",
        "Temp_Range": "24 - 28 °C",
        "Breeding": "Livebearer",
        "Size": "Up to 10 cm", 
        "Lifespan": "3-5 years",
        "Temperament": "Peaceful",
        "Diet": "Omnivore",
        "Tank_Level": "Mid to Top",
        "CareLevel": "Beginner",
        "ImageRef": "molly_fish.jpg",
        "Description": "A hardy, highly active livebearer available in various colors including black, silver, and gold. They prefer slightly hard, alkaline water and thrive in tanks where they can continuously graze on algae and plant-based foods."
    },
    {
        "SpeciesID": "F09",
        "CommonName": "Platy Fish",
        "SciName": "Xiphophorus maculatus",
        "PH_Range": "7.0 - 8.3",
        "Temp_Range": "22 - 26 °C",
        "Breeding": "Livebearer",
        "Size": "Up to 7 cm", 
        "Lifespan": "3-5 years",
        "Temperament": "Peaceful",
        "Diet": "Omnivore",
        "Tank_Level": "Mid",
        "CareLevel": "Beginner",
        "ImageRef": "platy_fish.jpg",
        "Description": "A highly adaptable and prolific livebearing species perfect for beginner aquarists. They come in vivid red, yellow, and blue varieties, adding a constant, active pop of color to any peaceful community setup."
    },
    {
        "SpeciesID": "F10",
        "CommonName": "Zebra Danio",
        "SciName": "Danio rerio",
        "PH_Range": "6.5 - 7.5",
        "Temp_Range": "18 - 25 °C",
        "Breeding": "Egg layer",
        "Size": "Up to 5 cm", 
        "Lifespan": "3-5 years",
        "Temperament": "Peaceful",
        "Diet": "Omnivore",
        "Tank_Level": "Top to Mid",
        "CareLevel": "Beginner",
        "ImageRef": "zebra_fish.jpg",
        "Description": "A practically indestructible, fast-moving schooling fish distinguished by its horizontal blue-black and silver stripes. They are extremely active, hardy in varying water conditions, and require plenty of open swimming space at the top of the tank."
    }
    # You can add the rest of your 12 species here later!
]

species_collection.insert_many(fish_data)
print("✅ Successfully seeded the database with Fish Species data!")