// Service pour les appels API Tournois et Équipes
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Crée les headers avec authentification
 */
const createAuthHeaders = (token: string | null): HeadersInit => {
	const headers: HeadersInit = {
		'Content-Type': 'application/json',
	};
	
	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}
	
	return headers;
};

// ============================================
// TYPES
// ============================================

export interface Tournament {
	id: string;
	name: string;
	sport: string;
	city: string;
	start_date: string;
	organizer?: {
		id: string;
		email: string;
		full_name: string;
	};
	organizer_id?: string;
	organizer_name?: string;
	team_count?: number;
	total_players?: number;
	created_at: string;
}

export interface Team {
	id: string;
	name: string;
	tournament?: string;
	tournament_id?: string;
	tournament_name?: string;
	tournament_sport?: string;
	max_capacity: number;
	current_capacity: number;
	members_count?: number;
	available_spots?: number;
	is_full?: boolean;
	members?: string[];
	created_at: string;
}

export interface TeamMember
{
	id: string;
	email: string;
	full_name: string;
	role?: string;
}

// ============================================
// API TOURNOIS
// ============================================

/**
 * Liste tous les tournois
 * @param token - Token JWT Clerk (obtenu via useClerkAuth().getToken())
 */
export const getTournaments = async (token: string | null): Promise<Tournament[]> => {
	try {
		const headers = createAuthHeaders(token);
		const response = await fetch(`${API_BASE_URL}/api/tournaments/`, {
			method: 'GET',
			headers,
		});

		if (!response.ok) {
			throw new Error(`Erreur HTTP: ${response.status}`);
		}

		const data = await response.json();
		console.log("Réponse API getTournaments:", data);
		// S'assurer que la réponse est un tableau
		if (!Array.isArray(data)) {
			console.warn("La réponse de l'API n'est pas un tableau:", data);
			// Si c'est un objet avec une propriété 'results' (pagination DRF), utiliser results
			if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
				return data.results;
			}
			return [];
		}
		return data;
	} catch (error) {
		console.error("Erreur lors de la récupération des tournois:", error);
		throw error;
	}
};

/**
 * Récupère les détails d'un tournoi
 */
export const getTournament = async (tournamentId: string, token: string | null): Promise<Tournament> => {
	try {
		const headers = createAuthHeaders(token);
		const response = await fetch(`${API_BASE_URL}/api/tournaments/${tournamentId}/`, {
			method: 'GET',
			headers,
		});

		if (!response.ok) {
			throw new Error(`Erreur HTTP: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Erreur lors de la récupération du tournoi:", error);
		throw error;
	}
};

/**
 * Crée un tournoi (organisateur uniquement)
 */
export const createTournament = async (
	tournamentData: {
		name: string;
		sport: string;
		city: string;
		start_date: string;
	},
	token: string | null
): Promise<Tournament> => {
	try {
		const headers = createAuthHeaders(token);
		const response = await fetch(`${API_BASE_URL}/api/tournaments/`, {
			method: 'POST',
			headers,
			body: JSON.stringify(tournamentData),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.detail || `Erreur HTTP: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Erreur lors de la création du tournoi:", error);
		throw error;
	}
};

/**
 * Liste mes tournois (organisateur uniquement)
 */
export const getMyTournaments = async (token: string | null): Promise<Tournament[]> => {
	try {
		const headers = createAuthHeaders(token);
		const response = await fetch(`${API_BASE_URL}/api/tournaments/my/`, {
			method: 'GET',
			headers,
		});

		if (!response.ok) {
			throw new Error(`Erreur HTTP: ${response.status}`);
		}

		const data = await response.json();
		console.log("Réponse API getMyTournaments:", data);
		// S'assurer que la réponse est un tableau
		if (!Array.isArray(data)) {
			console.warn("La réponse de l'API n'est pas un tableau:", data);
			// Si c'est un objet avec une propriété 'results' (pagination DRF), utiliser results
			if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
				return data.results;
			}
			return [];
		}
		return data;
	} catch (error) {
		console.error("Erreur lors de la récupération de mes tournois:", error);
		throw error;
	}
};

/**
 * Liste les équipes d'un tournoi
 */
export const getTournamentTeams = async (tournamentId: string, token: string | null): Promise<Team[]> => {
	try {
		const headers = createAuthHeaders(token);
		const response = await fetch(`${API_BASE_URL}/api/tournaments/${tournamentId}/teams/`, {
			method: 'GET',
			headers,
		});

		if (!response.ok) {
			throw new Error(`Erreur HTTP: ${response.status}`);
		}

		const data = await response.json();
		console.log("Réponse API getTournamentTeams:", data);
		// S'assurer que la réponse est un tableau
		if (!Array.isArray(data)) {
			console.warn("La réponse de l'API n'est pas un tableau:", data);
			// Si c'est un objet avec une propriété 'results' (pagination DRF), utiliser results
			if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
				return data.results;
			}
			return [];
		}
		return data;
	} catch (error) {
		console.error("Erreur lors de la récupération des équipes du tournoi:", error);
		throw error;
	}
};

// ============================================
// API ÉQUIPES
// ============================================

/**
 * Liste toutes les équipes (avec filtres optionnels)
 * @param token - Token JWT Clerk
 * @param tournamentId - Optionnel: filtrer par tournoi
 */
export const getTeams = async (token: string | null, tournamentId?: string): Promise<Team[]> =>
{
	try
	{
		const headers = createAuthHeaders(token);
		let url = `${API_BASE_URL}/api/teams/`;
		
		if (tournamentId)
		{
			url += `?tournament_id=${tournamentId}`;
		}
		
		const response = await fetch(url,
		{
			method: 'GET',
			headers,
		});

		if (!response.ok)
		{
			throw new Error(`Erreur HTTP: ${response.status}`);
		}

		const data = await response.json();
		console.log("Réponse API getTeams:", data);
		// S'assurer que la réponse est un tableau
		if (!Array.isArray(data))
		{
			console.warn("La réponse de l'API n'est pas un tableau:", data);
			// Si c'est un objet avec une propriété 'results' (pagination DRF), utiliser results
			if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results))
			{
				return data.results;
			}
			
			return [];
		}
		
		return data;
	}
	catch (error)
	{
		console.error("Erreur lors de la récupération des équipes:", error);
		throw error;
	}
};

/**
 * Crée une équipe dans un tournoi (organisateur uniquement)
 * @param teamData - Données de l'équipe
 * @param token - Token JWT Clerk
 */
export const createTeam = async (
	teamData:
	{
		name: string;
		tournament_id: string;
		max_capacity: number;
	},
	token: string | null
): Promise<Team> =>
{
	try
	{
		const headers = createAuthHeaders(token);
		const response = await fetch(`${API_BASE_URL}/api/teams/`,
		{
			method: 'POST',
			headers,
			body: JSON.stringify(teamData),
		});

		if (!response.ok)
		{
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.detail || errorData.tournament_id?.[0] || `Erreur HTTP: ${response.status}`);
		}

		return await response.json();
	}
	catch (error)
	{
		console.error("Erreur lors de la création de l'équipe:", error);
		throw error;
	}
};

/**
 * Récupère les membres d'une équipe
 * @param teamId - ID de l'équipe
 * @param token - Token JWT Clerk
 */
export const getTeamMembers = async (teamId: string, token: string | null): Promise<TeamMember[]> =>
{
	try
	{
		const headers = createAuthHeaders(token);
		const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/members/`,
		{
			method: 'GET',
			headers,
		});

		if (!response.ok)
		{
			throw new Error(`Erreur HTTP: ${response.status}`);
		}

		const data = await response.json();
		if (!Array.isArray(data))
		{
			return [];
		}
		
		return data;
	}
	catch (error)
	{
		console.error("Erreur lors de la récupération des membres de l'équipe:", error);
		throw error;
	}
};

/**
 * Modifie une équipe (organisateur uniquement)
 * @param teamId - ID de l'équipe
 * @param teamData - Données à modifier
 * @param token - Token JWT Clerk
 */
export const updateTeam = async (
	teamId: string,
	teamData: {
		name?: string;
		max_capacity?: number;
	},
	token: string | null
): Promise<Team> =>
{
	try
	{
		const headers = createAuthHeaders(token);
		const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/`,
		{
			method: 'PATCH',
			headers,
			body: JSON.stringify(teamData),
		});

		if (!response.ok)
		{
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.detail || `Erreur HTTP: ${response.status}`);
		}

		return await response.json();
	}
	catch (error)
	{
		console.error("Erreur lors de la modification de l'équipe:", error);
		throw error;
	}
};

/**
 * Supprime une équipe (organisateur uniquement, si aucun joueur inscrit)
 * @param teamId - ID de l'équipe
 * @param token - Token JWT Clerk
 */
export const deleteTeam = async (teamId: string, token: string | null): Promise<void> =>
{
	try
	{
		const headers = createAuthHeaders(token);
		const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/`,
		{
			method: 'DELETE',
			headers,
		});

		if (!response.ok)
		{
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.detail || `Erreur HTTP: ${response.status}`);
		}
	}
	catch (error)
	{
		console.error("Erreur lors de la suppression de l'équipe:", error);
		throw error;
	}
};

