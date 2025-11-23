// Service pour les appels API Matchs
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

export interface Match {
	id: string;
	team_a: {
		id: string;
		name: string;
	};
	team_b: {
		id: string;
		name: string;
	};
	tournament_name?: string;
	tournament_id?: string;
	date: string;
	location: string;
	score_a?: number | null;
	score_b?: number | null;
	created_at: string;
}

export interface MatchCreateData {
	team_a_id: string;
	team_b_id: string;
	date: string; // Format ISO datetime
	location: string;
	score_a?: number;
	score_b?: number;
}

export interface MatchUpdateData {
	date?: string;
	location?: string;
	score_a?: number | null;
	score_b?: number | null;
}

// ============================================
// API MATCHES
// ============================================

/**
 * Liste tous les matchs (selon le rôle)
 * @param token - Token JWT Clerk
 */
export const getMatches = async (token: string | null): Promise<Match[]> => {
	try {
		const headers = createAuthHeaders(token);
		const response = await fetch(`${API_BASE_URL}/api/matches/`, {
			method: 'GET',
			headers,
		});

		if (!response.ok) {
			throw new Error(`Erreur HTTP: ${response.status}`);
		}

		const data = await response.json();
		if (!Array.isArray(data)) {
			if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
				return data.results;
			}
			return [];
		}
		return data;
	} catch (error) {
		console.error("Erreur lors de la récupération des matchs:", error);
		throw error;
	}
};

/**
 * Récupère les détails d'un match
 * @param matchId - ID du match
 * @param token - Token JWT Clerk
 */
export const getMatch = async (matchId: string, token: string | null): Promise<Match> => {
	try {
		const headers = createAuthHeaders(token);
		const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}/`, {
			method: 'GET',
			headers,
		});

		if (!response.ok) {
			throw new Error(`Erreur HTTP: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Erreur lors de la récupération du match:", error);
		throw error;
	}
};

/**
 * Liste mes matchs (joueur ou organisateur)
 * @param filter - 'upcoming' | 'past' | undefined (tous)
 * @param token - Token JWT Clerk
 */
export const getMyMatches = async (
	filter?: 'upcoming' | 'past',
	token: string | null = null
): Promise<Match[]> => {
	try {
		const headers = createAuthHeaders(token);
		const params = filter ? `?filter=${filter}` : '';
		const response = await fetch(`${API_BASE_URL}/api/matches/my/${params}`, {
			method: 'GET',
			headers,
		});

		if (!response.ok) {
			throw new Error(`Erreur HTTP: ${response.status}`);
		}

		const data = await response.json();
		if (!Array.isArray(data)) {
			if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
				return data.results;
			}
			return [];
		}
		return data;
	} catch (error) {
		console.error("Erreur lors de la récupération de mes matchs:", error);
		throw error;
	}
};

/**
 * Crée un match (organisateur uniquement)
 * @param matchData - Données du match
 * @param token - Token JWT Clerk
 */
export const createMatch = async (
	matchData: MatchCreateData,
	token: string | null
): Promise<Match> => {
	try {
		const headers = createAuthHeaders(token);
		const response = await fetch(`${API_BASE_URL}/api/matches/`, {
			method: 'POST',
			headers,
			body: JSON.stringify(matchData),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.detail || errorData.error || `Erreur HTTP: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Erreur lors de la création du match:", error);
		throw error;
	}
};

/**
 * Modifie un match (organisateur uniquement)
 * @param matchId - ID du match
 * @param matchData - Données à modifier
 * @param token - Token JWT Clerk
 */
export const updateMatch = async (
	matchId: string,
	matchData: MatchUpdateData,
	token: string | null
): Promise<Match> => {
	try {
		const headers = createAuthHeaders(token);
		const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}/`, {
			method: 'PATCH',
			headers,
			body: JSON.stringify(matchData),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.detail || errorData.error || `Erreur HTTP: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Erreur lors de la modification du match:", error);
		throw error;
	}
};

/**
 * Supprime un match (organisateur uniquement)
 * @param matchId - ID du match
 * @param token - Token JWT Clerk
 */
export const deleteMatch = async (
	matchId: string,
	token: string | null
): Promise<void> => {
	try {
		const headers = createAuthHeaders(token);
		const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}/`, {
			method: 'DELETE',
			headers,
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.detail || errorData.error || `Erreur HTTP: ${response.status}`);
		}
	} catch (error) {
		console.error("Erreur lors de la suppression du match:", error);
		throw error;
	}
};

