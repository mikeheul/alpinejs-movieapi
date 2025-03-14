document.addEventListener('alpine:init', () => {
    Alpine.data('movieSearch', () => ({
        searchQuery: '',
        movies: [],  // Liste des films

        // Fonction pour récupérer les films du backend
        async fetchMovies() {
            if (this.searchQuery.length >= 3) {
                try {
                    // Effectuer la recherche de films
                    const response = await fetch('http://localhost:5000/search?query=' + this.searchQuery + '&type=movie');
                    const data = await response.json();

                    if (data.Response === 'True') {
                        // Pour chaque film récupéré, on va faire une seconde requête pour récupérer ses détails (Plot)
                        const movieDetailsPromises = data.Search.map(async (movie) => {
                            const detailsResponse = await fetch(`http://localhost:5000/search?query=${movie.imdbID}&type=movie`);
                            const detailsData = await detailsResponse.json();

                            if (detailsData.Response === 'True') {
                                movie.plot = detailsData.Search[0].Plot; // Ajout du Plot à chaque film
                            } else {
                                movie.plot = 'Aucune description disponible'; // Si pas de description
                            }

                            return movie;
                        });

                        // Attendre que toutes les requêtes pour les détails soient terminées
                        this.movies = await Promise.all(movieDetailsPromises);
                    } else {
                        this.movies = [];  // Si pas de résultats
                    }
                } catch (error) {
                    console.error('Erreur lors de la récupération des films:', error);
                }
            } else {
                this.movies = [];  // Vider les films si la recherche est inférieure à 3 caractères
            }
        }
    }));
});
