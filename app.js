class FootballAPI {
    constructor() {
        this.API_KEY = '2f648a8656184d4e867e5d8152a9427f'; 
        this.BASE_URL = 'https://api.football-data.org/v4/';
        this.cache = new Map();
        
        // Configure headers for API request
        this.headers = {
            'x-rapidapi-host': 'v3.football-api.com',
            'x-auth-token': this.API_KEY,
            'Content-Type': 'application/json'
        };
    }

    // Cached fetch with error handling
    async cachedFetch(endpoint, params = {}) {
        const cacheKey = JSON.stringify({ endpoint, params });
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cachedData = this.cache.get(cacheKey);
            if (Date.now() - cachedData.timestamp < 15 * 60 * 1000) {
                return cachedData.data;
            }
        }

        try {
            const queryString = new URLSearchParams(params).toString();
            const url = `${this.BASE_URL}${endpoint}?${queryString}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: this.headers
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // console.log(response)
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

    // Get live matches
    async getLiveMatches(leagueId) {
        return this.cachedFetch('fixtures/live', { league: leagueId });
    }
    async getTodaysMatches(leagueId) {
        return this.cachedFetch(`competitions/${leagueId}/matches`, { dateFrom: new Date().getDate(), dateTo: new Date().getDate()});
    }

    async getAllMatches() {
        return this.cachedFetch(`competitions/${leagueId}/matches`);
    }

    async getUpcomingMatches(leagueId) {
        return this.cachedFetch(`competitions/${leagueId}/matches`);
    }

    async getTeamsMatches( teamId) {
        return this.cachedFetch(`teams/${teamId}/matches`, { dateFrom: new Date().getDate() });
    }

    // Get team statistics
    async getTeamStatistics(teamId, seasonYear) {
        return this.cachedFetch('teams/statistics', { 
            team: teamId, 
            season: seasonYear 
        });
    }

    // Get upcoming matches
    // async getUpcomingMatches(leagueId) {
    //     const currentDate = new Date().toISOString().split('T')[0];
    //     return this.cachedFetch('fixtures', { 
    //         league: leagueId, 
    //         from: currentDate,
    //         status: 'NS' // Not Started matches
    //     });
    // }

    // Search teams
    async searchTeams(query) {
        return this.cachedFetch('teams', { search: query });
    }

    // Get league standings
    async getLeagueStandings(leagueId, seasonYear) {
        return this.cachedFetch('standings', { 
            league: leagueId, 
            season: seasonYear 
        });
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
            const data = await footballAPI.getUpcomingMatches(2021);

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