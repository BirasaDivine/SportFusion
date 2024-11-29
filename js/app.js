class FootballAPI {
    constructor() {
        this.API_KEY = '2f648a8656184d4e867e5d8152a9427f'; 
        this.BASE_URL = 'http://localhost:5000/football-api'; // Update base URL for new endpoint
        this.cache = new Map();
        
        // Configure headers for API request
        this.headers = {
            'x-auth-token': this.API_KEY,
        };
    }

    // Cached fetch with error handling
    async cachedFetch(endpoint) {
        const cacheKey = endpoint;
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cachedData = this.cache.get(cacheKey);
            if (Date.now() - cachedData.timestamp < 15 * 60 * 1000) {
                return cachedData.data;
            }
        }

        try {
            const url = `${this.BASE_URL}${endpoint}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: this.headers
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Store in cache
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });

            return data;
        } catch (error) {
            console.error('API Fetch Error:', error);
            return null;
        }
    }

    // Fetch live matches for a specific league
    async getLiveMatches(leagueId) {
        return this.cachedFetch(`/competitions/${leagueId}/matches`);
    }

    // Fetch league ID (simplified since it's directly in the URL)
    async getLeagueId(leagueName) {
        return this.cachedFetch(`/competitions/${leagueName}`);
    }

    // Fetch matches for a specific league
    async getUpcomingMatches(leagueId) {
        try {
        const data = await fetch(`http://localhost:5000/football-api/competitions/${leagueId}/matches`, {
            method: 'GET',
            headers: {
                'x-auth-token': '2f648a8656184d4e867e5d8152a9427f',
            }
        })
        return data.json();
    }
    catch (error) {
        console.error('Error fetching matches:', error);
    }
    }

    // Get team statistics (optional, implement if needed)
    async getTeamStatistics(teamId, seasonYear) {
        return this.cachedFetch(`/teams/statistics?team=${teamId}&season=${seasonYear}`);
    }

    // Search teams (optional, implement if needed)
    async searchTeams(query) {
        return this.cachedFetch(`/teams?search=${query}`);
    }

    // Get league standings (optional, implement if needed)
    async getLeagueStandings(leagueId, seasonYear) {
        return this.cachedFetch(`/standings?league=${leagueId}&season=${seasonYear}`);
    }
}

// Instantiate the API class
const footballAPI = new FootballAPI();

class SportsDashboard {
    constructor() {
        this.API_KEY = '2f648a8656184d4e867e5d8152a9427f'; 
        this.BASE_URL = 'https://cors-anywhere.herokuapp.com/https://api.football-data.org/v4';
        this.initEventListeners();
        this.loadFavorites();
        this.leagues = {
            'PL': 'Premier League',
            'BL1': 'Bundesliga',
            'PD': 'La Liga',
            'SA': 'Serie A',
            'FL1': 'Ligue 1'
        }
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
            let allMatches = [];
            Object.keys(this.leagues).forEach(async (key) => {
                const data = await footballAPI.getUpcomingMatches(key);
                this.displayMatches(data.matches);
            }
            );
        } catch (error) {
            console.error('Error fetching matches:', error);
        }
    }

    displayMatches(matches) {
        const container = document.getElementById('matchesContainer');
        container.innerHTML = '';

        console.log(matches[0], matches[1])

        matches.forEach(match => {
            const matchCard = document.createElement('div');
            matchCard.classList.add('match-card');
            matchCard.innerHTML = `
                <h3>${match.homeTeam.name} vs ${match.awayTeam.name}</h3>
                <p>Competition: ${match.competition.name}</p>
                <p>Date: ${new Date(match.utcDate).toLocaleString()}</p>
                <p>Status: ${match.status}</p>
                ${match.score.fullTime ? `<p>Score: ${match.score.fullTime.home} - ${match.score.fullTime.away}</p>` : ''}
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

    parseDate(dateString) {
        const [day, month, year] = dateString.split("/");
      
        return new Date(year, month - 1, day);
      }
      

    filterMatchesByTime(event) {
        const timeFilter = event.target.value;
        const matchCards = document.querySelectorAll('.match-card');
        
        matchCards.forEach(card => {
            console.log(card.querySelector('p:nth-child(3)').textContent.split('Date: ')[1].split(',')[0]);
            const matchDate = this.parseDate(card.querySelector('p:nth-child(3)').textContent.split('Date: ')[1].split(',')[0]);
            const today = new Date();
            
            switch(timeFilter) {
                case 'live':
                    // Implement live match filtering
                    break;
                case 'today':
                    card.style.display = (matchDate === today) ? 'block' : 'none';
                    break;
                case 'upcoming':
                    console.log(matchDate, today, matchDate > today);
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
    dashboard.fetchMatches();
});