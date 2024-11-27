class SportsDashboard {
    constructor() {
        this.API_KEY = '2f648a8656184d4e867e5d8152a9427f'; 
        this.BASE_URL = 'https://cors-anywhere.herokuapp.com/https://api.football-data.org/v4';
        this.initEventListeners();
        this.loadFavorites();
    }

    initEventListeners() {
        document.getElementById('searchInput').addEventListener('input', this.filterMatches.bind(this));
        document.getElementById('sportSelect').addEventListener('change', this.updateSport.bind(this));
        document.getElementById('timeFilter').addEventListener('change', this.filterMatchesByTime.bind(this));
        
        // Authentication modal
        const authModalTrigger = document.querySelector('.auth-trigger');
        const authModal = document.getElementById('authModal');
        const closeModal = document.querySelector('.close');

        if (authModalTrigger) {
            authModalTrigger.addEventListener('click', () => {
                authModal.style.display = 'block';
            });
        }

        closeModal.addEventListener('click', () => {
            authModal.style.display = 'none';
        });

        document.getElementById('authForm').addEventListener('submit', this.handleAuthentication.bind(this));
    }

    async fetchMatches(competition = 'PL') {
        try {
            const response = await fetch(`${this.BASE_URL}/competitions/${competition}/matches`, {
                headers: {
                    'X-Auth-Token': this.API_KEY
                }
            });
            const data = await response.json();
            this.displayMatches(data.matches);
        } catch (error) {
            console.error('Error fetching matches:', error);
        }
    }

    displayMatches(matches) {
        const container = document.getElementById('matchesContainer');
        container.innerHTML = '';

        matches.forEach(match => {
            const matchCard = document.createElement('div');
            matchCard.classList.add('match-card');
            matchCard.innerHTML = `
                <h3>${match.homeTeam.name} vs ${match.awayTeam.name}</h3>
                <p>Competition: ${match.competition.name}</p>
                <p>Date: ${new Date(match.utcDate).toLocaleString()}</p>
                <p>Status: ${match.status}</p>
                ${match.score.fullTime ? `<p>Score: ${match.score.fullTime.homeTeam} - ${match.score.fullTime.awayTeam}</p>` : ''}
                <button class="favorite-btn" data-match-id="${match.id}">Add to Favorites</button>
            `;
            
            matchCard.querySelector('.favorite-btn').addEventListener('click', this.toggleFavorite.bind(this));
            
            container.appendChild(matchCard);
        });
    }

    filterMatches(event) {
        const searchTerm = event.target.value.toLowerCase();
        const matchCards = document.querySelectorAll('.match-card');
        
        matchCards.forEach(card => {
            const teamNames = card.querySelector('h3').textContent.toLowerCase();
            card.style.display = teamNames.includes(searchTerm) ? 'block' : 'none';
        });
    }

    updateSport(event) {
        const sport = event.target.value;
        // Implement sport-specific API fetching logic
        // For now, we'll just fetch football data
        this.fetchMatches();
    }

    filterMatchesByTime(event) {
        const timeFilter = event.target.value;
        const matchCards = document.querySelectorAll('.match-card');
        
        matchCards.forEach(card => {
            const matchDate = new Date(card.querySelector('p:nth-child(3)').textContent.replace('Date: ', ''));
            const today = new Date();
            
            switch(timeFilter) {
                case 'live':
                    // Implement live match filtering
                    break;
                case 'today':
                    card.style.display = (matchDate.toDateString() === today.toDateString()) ? 'block' : 'none';
                    break;
                case 'upcoming':
                    card.style.display = (matchDate > today) ? 'block' : 'none';
                    break;
            }
        });
    }

    handleAuthentication(event) {
        event.preventDefault();
        // Implement basic authentication (would typically involve backend)
        alert('Authentication feature placeholder');
    }

    toggleFavorite(event) {
        const matchId = event.target.dataset.matchId;
        let favorites = JSON.parse(localStorage.getItem('favoritesMatches') || '[]');
        
        if (favorites.includes(matchId)) {
            favorites = favorites.filter(id => id !== matchId);
            event.target.textContent = 'Add to Favorites';
        } else {
            favorites.push(matchId);
            event.target.textContent = 'Remove Favorite';
        }
        
        localStorage.setItem('favoritesMatches', JSON.stringify(favorites));
    }

    loadFavorites() {
        const favorites = JSON.parse(localStorage.getItem('favoritesMatches') || '[]');
        // Update UI to reflect favorite matches
    }
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new SportsDashboard();
    dashboard.fetchMatches(); // Load default matches
});