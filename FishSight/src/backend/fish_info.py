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
        "ImageRef": "cherry_barb.jpg",
        "Description": "A peaceful schooling fish that adds a bright pop of red to community tanks. Very hardy and great for beginners. "
        "Native to the slow-moving streams of Sri Lanka, males display their most intense cherry-red hue when courting or kept in a group of six or more. "
        "They are not picky eaters and will happily accept flakes, pellets, or live foods, making them low-maintenance additions to a mixed-species aquarium."
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
        "CareLevel": "Easy",
        "ImageRef": "neon_tetra.jpg",
        "Description": "A small, colorful schooling fish. They prefer heavily planted tanks with dim lighting and peaceful tankmates. "
        "Their iridescent blue stripe and red underside seem to glow under subdued lighting, an effect that intensifies against a dark substrate and background. "
        "Originating from the blackwater tributaries of the Amazon Basin, they feel most secure in shoals of at least eight to ten individuals and rarely show any aggression toward other calm community species."
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
        "Description": "Extremely hardy and active livebearers. They breed rapidly and come in a massive variety of colors. "
        "Their flowing, fan-shaped tails and constant swimming make them a favorite centerpiece fish, and selective breeding has produced countless fin and pattern variations such as fancy, swordtail-style, and mosaic guppies. "
        "They tolerate a wide range of water conditions better than most tropical fish, which is part of why they are so often recommended as a first pet fish."
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
        "Tank_Level": "Top to Mid",
        "CareLevel": "Easy",
        "ImageRef": "angel_fish.jpg",
        "Description": "Known for their distinctive disc-shaped body and flowing fins. They are generally peaceful but can be territorial during breeding season. "
        "Angelfish naturally form bonded pairs and will guard a chosen flat leaf or slate surface as a spawning site, often chasing away other tankmates that stray too close. "
        "Their tall, laterally compressed shape means they do best in tanks with plenty of vertical swimming space, such as those decorated with driftwood or tall plants."
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
        "CareLevel": "Medium",
        "ImageRef": "cardinal_tetra.jpg",
        "Description": "The Cardinal Tetra is a vibrant and peaceful schooling fish famous for the brilliant neon blue and vivid red stripes running the entire length of its body. "
        "Native to the acidic blackwater streams of South America, they thrive in established, heavily planted aquariums. Because of their social nature, they should be kept in groups of six or more to feel secure and display their best colors. "
        "Their coloring is often confused with the Neon Tetra, but the Cardinal's red stripe runs the entire length of its body rather than stopping at the midpoint. "
        "They do best under soft, filtered lighting with tannin-tinted water, which mimics their natural riverbank habitat and helps bring out their vivid colors."
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
        "CareLevel": "Easy",
        "ImageRef": "goldfish.jpg",
        "Description": "A classic, cold-water aquarium fish known for its bright orange coloration and hearty appetite. Because they grow large and produce a high bioload, they require heavy filtration and highly spacious tanks rather than small bowls. "
        "Goldfish are surprisingly intelligent and can be trained to recognize their owners or even follow simple feeding cues over time. "
        "There are many ornamental varieties, from the sleek single-tailed Comet to the rounder, double-tailed Fantail and Oranda, each with different body shapes and fin lengths."
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
        "CareLevel": "Easy",
        "ImageRef": "gourami.jpg",
        "Description": "A vibrant labyrinth fish capable of breathing surface air, easily recognized by its bright stripes and long, thread-like pelvic fins. They prefer slower-moving waters with plenty of floating plants and make excellent centerpieces for community tanks. "
        "Males build bubble nests at the water's surface using saliva-coated air bubbles, tending them carefully once eggs are laid inside. "
        "Their labyrinth organ lets them gulp air directly from above the waterline, so a small gap between the water surface and the tank lid should always be left open."
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
        "CareLevel": "Easy",
        "ImageRef": "molly_fish.jpg",
        "Description": "A hardy, highly active livebearer available in various colors including black, silver, and gold. "
        "They prefer slightly hard, alkaline water and thrive in tanks where they can continuously graze on algae and plant-based foods. "
        "Some varieties, such as the Sailfin Molly, develop a tall, dramatic dorsal fin that males flare during courtship displays. "
        "They are also known to tolerate brackish water conditions surprisingly well, making them a versatile choice for aquarists experimenting with slightly salted setups."
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
        "CareLevel": "Easy",
        "ImageRef": "platy_fish.jpg",
        "Description": "A highly adaptable and prolific livebearing species perfect for beginner aquarists. "
        "They come in vivid red, yellow, and blue varieties, adding a constant, active pop of color to any peaceful community setup. "
        "Platies are close relatives of swordtails and guppies, and closely related species can sometimes interbreed, producing new color patterns over generations. "
        "They spend most of their time grazing in the middle of the water column, occasionally nibbling on algae growth on decorations and plant leaves."
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
        "CareLevel": "Easy",
        "ImageRef": "zebra_fish.jpg",
        "Description": "A practically indestructible, fast-moving schooling fish distinguished by its horizontal blue-black and silver stripes. "
        "They are extremely active, hardy in varying water conditions, and require plenty of open swimming space at the top of the tank. "
        "Zebra Danios are a well-known model organism in scientific research thanks to their fast development and transparent embryos, though the aquarium variety is prized simply for its playful, darting energy. "
        "A long-finned variant also exists, featuring the same striping pattern but with elegant, trailing fins."
    }
]

species_collection.insert_many(fish_data)
print("✅ Successfully seeded the database with Fish Species data!")