require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');
const app = express();
const port = 5000;

const OMDB_API_KEY = process.env.OMDB_API_KEY;

// Servir les fichiers statiques (comme index.html)
app.use(express.static(path.join(__dirname, 'public')));

app.get('/search', async (req, res) => {
    const query = req.query.query;
    const type = req.query.type || 'movie';  // Par défaut, chercher des films

    if (!query) {
        return res.status(400).send('Query parameter is required');
    }

    try {
        const response = await axios.get('https://www.omdbapi.com/', {
            params: {
                s: query,
                type: type,
                apikey: OMDB_API_KEY
            }
        });

        res.json(response.data);  // Renvoie les résultats à l'application frontend
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors de la récupération des films');
    }
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
