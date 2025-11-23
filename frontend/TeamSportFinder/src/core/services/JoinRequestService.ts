// Service pour les appels API JoinRequests (Demandes d'adhésion)
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

export interface JoinRequest {
	id: string;
	player: {
		id: string;
		email: string;
		full_name: string;
	};
	team: {
		id: string;
		name: string;
	};
	tournament: {
		id: string;
		name: string;
		sport: string;
	};
	status: 'pending' | 'accepted' | 'rejected';
	message?: string;
	created_at: string;
	updated_at: string;
}

// ============================================
// API JOIN REQUESTS
// ============================================

/**
 * Crée une demande d'adhésion (joueur uniquement)
 * @param teamId - ID de l'équipe
 * @param message - Message optionnel
 * @param token - Token JWT Clerk
 */
export const createJoinRequest = async (
	teamId: string,
	message?: string,
	token: string | null = null
): Promise<JoinRequest> => {
	try {
		const headers = createAuthHeaders(token);
		const body: any = { team_id: teamId };
		// Ne pas envoyer le message s'il est vide ou undefined
		if (message && message.trim()) {
			body.message = message.trim();
		}

		const response = await fetch(`${API_BASE_URL}/api/join-requests/`, {
			method: 'POST',
			headers,
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			// Améliorer l'affichage des erreurs de validation
			let errorMessage = `Erreur HTTP: ${response.status}`;
			
			if (errorData.detail) {
				errorMessage = errorData.detail;
			} else if (errorData.error) {
				errorMessage = errorData.error;
			} else if (errorData.team_id) {
				// Erreur de validation sur team_id
				errorMessage = Array.isArray(errorData.team_id) 
					? errorData.team_id[0] 
					: errorData.team_id;
			} else if (errorData.message) {
				// Erreur de validation sur message
				errorMessage = Array.isArray(errorData.message) 
					? errorData.message[0] 
					: errorData.message;
			} else if (typeof errorData === 'object' && Object.keys(errorData).length > 0) {
				// Afficher la première erreur trouvée
				const firstKey = Object.keys(errorData)[0];
				const firstError = errorData[firstKey];
				errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
			}
			
			console.error("Détails de l'erreur API:", errorData);
			throw new Error(errorMessage);
		}

		return await response.json();
	} catch (error) {
		console.error("Erreur lors de la création de la demande:", error);
		throw error;
	}
};

/**
 * Liste toutes mes demandes (joueur uniquement)
 * @param token - Token JWT Clerk
 */
export const getMyRequests = async (token: string | null): Promise<JoinRequest[]> => {
	try {
		const headers = createAuthHeaders(token);
		const response = await fetch(`${API_BASE_URL}/api/join-requests/my/`, {
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
		console.error("Erreur lors de la récupération de mes demandes:", error);
		throw error;
	}
};

/**
 * Liste les demandes reçues (organisateur uniquement)
 * @param token - Token JWT Clerk
 */
export const getReceivedRequests = async (token: string | null): Promise<JoinRequest[]> => {
	try {
		const headers = createAuthHeaders(token);
		const response = await fetch(`${API_BASE_URL}/api/join-requests/received/`, {
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
		console.error("Erreur lors de la récupération des demandes reçues:", error);
		throw error;
	}
};

/**
 * Accepter une demande (organisateur uniquement)
 * @param requestId - ID de la demande
 * @param token - Token JWT Clerk
 */
export const acceptRequest = async (
	requestId: string,
	token: string | null
): Promise<{ message: string; data: JoinRequest }> => {
	try {
		const headers = createAuthHeaders(token);
		const response = await fetch(`${API_BASE_URL}/api/join-requests/${requestId}/accept/`, {
			method: 'POST',
			headers,
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.error || errorData.detail || `Erreur HTTP: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Erreur lors de l'acceptation de la demande:", error);
		throw error;
	}
};

/**
 * Refuser une demande (organisateur uniquement)
 * @param requestId - ID de la demande
 * @param token - Token JWT Clerk
 */
export const rejectRequest = async (
	requestId: string,
	token: string | null
): Promise<{ message: string; data: JoinRequest }> => {
	try {
		const headers = createAuthHeaders(token);
		const response = await fetch(`${API_BASE_URL}/api/join-requests/${requestId}/reject/`, {
			method: 'POST',
			headers,
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.error || errorData.detail || `Erreur HTTP: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Erreur lors du refus de la demande:", error);
		throw error;
	}
};

/**
 * Annuler une demande (joueur uniquement, seulement si pending)
 * @param requestId - ID de la demande
 * @param token - Token JWT Clerk
 */
export const cancelRequest = async (
	requestId: string,
	token: string | null
): Promise<{ message: string }> => {
	try {
		const headers = createAuthHeaders(token);
		const response = await fetch(`${API_BASE_URL}/api/join-requests/${requestId}/cancel/`, {
			method: 'POST',
			headers,
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.error || errorData.detail || `Erreur HTTP: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Erreur lors de l'annulation de la demande:", error);
		throw error;
	}
};

