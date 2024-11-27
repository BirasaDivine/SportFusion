class FootballDashboardUI {
    constructor(api) {
        this.api = api;
        this.currentLeague = 39; // Default to Premier League
        this.currentSeason = new Date().getFullYear();
        this.initEventListeners();
    }

    initEventListeners() {
        // League selection
        const leagueSelect = document.getElementById('league-select');
        leagueSelect.addEventListener('change', (event) => {
            this.currentLeague = parseInt(event.target.value);
            this.refreshDashboard();
        });

        // Search input
        document.getElementById('search-input').addEventListener('input', this.searchTeams.bind(this));
    }

    async refreshDashboard() {
        await Promise.all([
            this.renderLiveMatches(),
            this.renderUpcomingMatches(),
            this.renderLeagueStandings()
        ]);
    }

    async renderLiveMatches() {
        const matchesContainer = document.getElementById('live-scores');
        try {
            const data = await this.api.getLiveMatches(this.currentLeague);
            
            if (!data || !data.response || data.response.length === 0) {
                matchesContainer.innerHTML = '<p>No live matches currently</p>';
                return;
            }

            matchesContainer.innerHTML = data.response.map(match => `
                <div class="match-card live">
                    <div class="team home">
                        <img src="${match.teams.home.logo}" alt="${match.teams.home.name}">
                        <span>${match.teams.home.name}</span>
                    </div>
                    <div class="score">
                        <span>${match.goals.home}</span>
                        <span>-</span>
                        <span>${match.goals.away}</span>
                    </div>
                    <div class="team away">
                        <img src="${match.teams.away.logo}" alt="${match.teams.away.name}">
                        <span>${match.teams.away.name}</span>
                    </div>
                    <div class="match-time">${match.fixture.status.short}</div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error rendering live matches:', error);
            matchesContainer.innerHTML = '<p>Error loading live matches</p>';
        }
    }

    async renderUpcomingMatches() {
        const matchesContainer = document.getElementById('upcoming-matches');
        try {
            const data = await this.api.getUpcomingMatches(this.currentLeague);
            
            if (!data || !data.response || data.response.length === 0) {
                matchesContainer.innerHTML = '<p>No upcoming matches</p>';
                return;
            }

            matchesContainer.innerHTML = data.response.slice(0, 10).map(match => `
                <div class="match-card upcoming">
                    <div class="team home">
                        <img src="${match.teams.home.logo}" alt="${match.teams.home.name}">
                        <span>${match.teams.home.name}</span>
                    </div>
                    <div class="match-time">
                        ${new Date(match.fixture.date).toLocaleString()}
                    </div>
                    <div class="team away">
                        <img src="${match.teams.away.logo}" alt="${match.teams.away.name}">
                        <span>${match.teams.away.name}</span>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error rendering upcoming matches:', error);
            matchesContainer.innerHTML = '<p>Error loading upcoming matches</p>';
        }
    }

    async renderLeagueStandings() {
        const standingsContainer = document.getElementById('league-standings');
        try {
            const data = await this.api.getLeagueStandings(this.currentLeague, this.currentSeason);
            
            if (!data || !data.response || data.response.length === 0) {
                standingsContainer.innerHTML = '<p>No standings available</p>';
                return;
            }

            const standings = data.response[0].league.standings[0];
            standingsContainer.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Position</th>
                            <th>Team</th>
                            <th>Played</th>
                            <th>Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${standings.map(team => `
                            <tr>
                                <td>${team.rank}</td>
                                <td>
                                    <img src="${team.team.logo}" alt="${team.team.name}" width="30">
                                    ${team.team.name}
                                </td>
                                <td>${team.all.played}</td>
                                <td>${team.points}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } catch (error) {
            console.error('Error rendering league standings:', error);
            standingsContainer.innerHTML = '<p>Error loading standings</p>';
        }
    }

    async searchTeams(event) {
        const query = event.target.value;
        const resultsContainer = document.getElementById('search-results');

        if (query.length < 2) {
            resultsContainer.innerHTML = '';
            return;
        }

        try {
            const data = await this.api.searchTeams(query);
            
            if (!data || !data.response || data.response.length === 0) {
                resultsContainer.innerHTML = '<p>No teams found</p>';
                return;
            }

            resultsContainer.innerHTML = data.response.map(team => `
                <div class="search-result" data-team-id="${team.team.id}">
                    <img src="${team.team.logo}" alt="${team.team.name}" width="30">
                    ${team.team.name} (${team.team.country})
                </div>
            `).join('');
        } catch (error) {
            console.error('Error searching teams:', error);
            resultsContainer.innerHTML = '<p>Error searching teams</p>';
        }
    }
}