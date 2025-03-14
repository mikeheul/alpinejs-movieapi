document.addEventListener('alpine:init', () => {
    Alpine.data('movieSearch', () => ({
        searchQuery: '',
        movies: [],  // Liste des films

        // Fonction pour récupérer les films du backend
        async fetchMovies() {
            if (this.searchQuery.length >= 3) {
                try {
                    const response = await fetch('http://localhost:5000/search?query=' + this.searchQuery + '&type=movie');
                    const data = await response.json();

                    if (data.Response === 'True') {
                        this.movies = data.Search;  // Si la réponse est valide, stocker les films
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
