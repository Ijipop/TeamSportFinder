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

/**
 * Recherche des équipes disponibles
 * @param search - Terme de recherche (nom d'équipe)
 * @param available - Filtrer uniquement les équipes disponibles
 * @param tournamentId - Filtrer par tournoi (optionnel)
 * @param token - Token JWT Clerk
 */
export const searchTeams = async (
	search?: string,
	available: boolean = true,
	tournamentId?: string,
	token: string | null = null
): Promise<Team[]> => {
	try {
		const headers = createAuthHeaders(token);
		
		// Construire les query params
		const params = new URLSearchParams();
		if (search) {
			params.append('search', search);
		}
		if (available) {
			params.append('available', 'true');
		}
		if (tournamentId) {
			params.append('tournament_id', tournamentId);
		}

		const url = `${API_BASE_URL}/api/teams/?${params.toString()}`;
		const response = await fetch(url, {
			method: 'GET',
			headers,
		});

		if (!response.ok) {
			throw new Error(`Erreur HTTP: ${response.status}`);
		}

		const data = await response.json();
		// S'assurer que la réponse est un tableau
		if (!Array.isArray(data)) {
			console.warn("La réponse de l'API n'est pas un tableau:", data);
			if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
				return data.results;
			}
			return [];
		}
		return data;
	} catch (error) {
		console.error("Erreur lors de la recherche d'équipes:", error);
		throw error;
	}
};

