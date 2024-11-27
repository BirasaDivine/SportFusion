class FootballAPI {
    constructor() {
        this.API_KEY = '5df961b9d09f13bfc368857cd25d443e'; // Replace with your actual API key
        this.BASE_URL = 'https://v3.football-api.com/';
        this.cache = new Map();
        
        // Configure headers for API request
        this.headers = {
            'x-rapidapi-host': 'v3.football-api.com',
            'x-rapidapi-key': this.API_KEY,
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

    // Get team statistics
    async getTeamStatistics(teamId, seasonYear) {
        return this.cachedFetch('teams/statistics', { 
            team: teamId, 
            season: seasonYear 
        });
    }

    // Get upcoming matches
    async getUpcomingMatches(leagueId) {
        const currentDate = new Date().toISOString().split('T')[0];
        return this.cachedFetch('fixtures', { 
            league: leagueId, 
            from: currentDate,
            status: 'NS' // Not Started matches
        });
    }

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