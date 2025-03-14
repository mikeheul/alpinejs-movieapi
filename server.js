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
        // Récupérer la liste des films en fonction de la recherche
        const response = await axios.get('https://www.omdbapi.com/', {
            params: {
                s: query,
                type: type,
                apikey: OMDB_API_KEY
            }
        });

        // Si des films sont trouvés
        if (response.data.Response === 'True') {
            // Pour chaque film récupéré, faire une autre requête pour obtenir les détails (Plot)
            const movieDetailsPromises = response.data.Search.map(async (movie) => {
                // Récupérer les détails complets du film avec imdbID
                const detailsResponse = await axios.get('https://www.omdbapi.com/', {
                    params: {
                        i: movie.imdbID,  // Utiliser imdbID pour obtenir les détails complets du film
                        apikey: OMDB_API_KEY
                    }
                });

                // Ajouter le plot (et d'autres détails si nécessaire) au film
                return {
                    ...movie,
                    plot: detailsResponse.data.Plot || 'Aucune description disponible', // Ajouter Plot ou message par défaut
                };
            });

            // Attendre que toutes les requêtes pour les détails des films soient terminées
            const moviesWithDetails = await Promise.all(movieDetailsPromises);

            // Retourner les films enrichis (avec Plot)
            res.json({ ...response.data, Search: moviesWithDetails });
        } else {
            // Si aucun film n'est trouvé, renvoyer la réponse initiale de l'OMDb API
            res.json(response.data);
        }

    } catch (error) {
        console.error('Erreur lors de la récupération des films:', error);
        res.status(500).send('Erreur lors de la récupération des films');
    }
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
