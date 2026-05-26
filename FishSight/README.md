# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# RAG Chatbot Notes #
You need to update the data into **aquarium_data.txt**, then run **python setup_database.py** to update the chatbot database 

# Fish Information Updates #
You need to update the information into **fish_info.py**, then run it, it will upload the information to MongoDB Atlas
Then you shall remove the information from the code, or leave it until next time

# Fish Image Database #
After a period of time or you can check the database for about 100 of images, you can harvest the data by using **harvest_data.py** to collect the images, the python code will download the images into your local, in a file call ***retraining_dataset***