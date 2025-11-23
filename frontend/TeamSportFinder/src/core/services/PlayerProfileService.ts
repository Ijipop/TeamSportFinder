// Service pour les appels API Profil Joueur
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Crée les headers avec authentification
 */
const createAuthHeaders = (token: string | null): HeadersInit =>
{
	const headers: HeadersInit =
	{
		'Content-Type': 'application/json',
	};
	
	if (token)
	{
		headers['Authorization'] = `Bearer ${token}`;
	}
	
	return headers;
};

// ============================================
// TYPES
// ============================================

export interface PlayerProfile
{
	id: string;
	user_id: string;
	email: string;
	full_name: string;
	role: string;
	city: string;
	favorite_sport: string;
	level: 'beginner' | 'intermediate' | 'advanced';
	position?: string;
}

export interface PlayerProfileUpdate
{
	city: string;
	favorite_sport: string;
	level: 'beginner' | 'intermediate' | 'advanced';
	position?: string;
}

// ============================================
// API PROFIL JOUEUR
// ============================================

/**
 * Récupère le profil du joueur connecté
 * @param token - Token JWT Clerk
 */
export const getPlayerProfile = async (token: string | null): Promise<PlayerProfile | null> =>
{
	try
	{
		const headers = createAuthHeaders(token);
		const response = await fetch(`${API_BASE_URL}/api/players/profile/`,
		{
			method: 'GET',
			headers,
		});

		if (!response.ok)
		{
			if (response.status === 404)
			{
				return null; // Profil n'existe pas encore
			}
			throw new Error(`Erreur HTTP: ${response.status}`);
		}

		return await response.json();
	}
	catch (error)
	{
		console.error("Erreur lors de la récupération du profil:", error);
		throw error;
	}
};

/**
 * Crée le profil du joueur
 * @param profileData - Données du profil
 * @param token - Token JWT Clerk
 */
export const createPlayerProfile = async (
	profileData: PlayerProfileUpdate,
	token: string | null
): Promise<PlayerProfile> =>
{
	try
	{
		const headers = createAuthHeaders(token);
		const response = await fetch(`${API_BASE_URL}/api/players/profile/`,
		{
			method: 'POST',
			headers,
			body: JSON.stringify(profileData),
		});

		if (!response.ok)
		{
			const errorData = await response.json().catch(() => ({}));
			let errorMessage = `Erreur HTTP: ${response.status}`;
			
			if (errorData.detail)
			{
				errorMessage = errorData.detail;
			}
			else if (errorData.city)
			{
				errorMessage = Array.isArray(errorData.city) ? errorData.city[0] : errorData.city;
			}
			else if (errorData.favorite_sport)
			{
				errorMessage = Array.isArray(errorData.favorite_sport) ? errorData.favorite_sport[0] : errorData.favorite_sport;
			}
			else if (errorData.level)
			{
				errorMessage = Array.isArray(errorData.level) ? errorData.level[0] : errorData.level;
			}
			
			throw new Error(errorMessage);
		}

		return await response.json();
	}
	catch (error)
	{
		console.error("Erreur lors de la création du profil:", error);
		throw error;
	}
};

/**
 * Met à jour le profil du joueur (PUT - remplacement complet)
 * @param profileData - Données du profil
 * @param token - Token JWT Clerk
 */
export const updatePlayerProfile = async (
	profileData: PlayerProfileUpdate,
	token: string | null
): Promise<PlayerProfile> => {
	try {
		const headers = createAuthHeaders(token);
		const response = await fetch(`${API_BASE_URL}/api/players/profile/`,
		{
			method: 'PUT',
			headers,
			body: JSON.stringify(profileData),
		});

		if (!response.ok)
		{
			const errorData = await response.json().catch(() => ({}));
			let errorMessage = `Erreur HTTP: ${response.status}`;
			
			if (errorData.detail)
			{
				errorMessage = errorData.detail;
			}
			else if (errorData.city)
			{
				errorMessage = Array.isArray(errorData.city) ? errorData.city[0] : errorData.city;
			}
			else if (errorData.favorite_sport)
			{
				errorMessage = Array.isArray(errorData.favorite_sport) ? errorData.favorite_sport[0] : errorData.favorite_sport;
			}
			else if (errorData.level)
			{
				errorMessage = Array.isArray(errorData.level) ? errorData.level[0] : errorData.level;
			}
			
			throw new Error(errorMessage);
		}

		return await response.json();
	}
	catch (error)
	{
		console.error("Erreur lors de la mise à jour du profil:", error);
		throw error;
	}
};

/**
 * Met à jour partiellement le profil du joueur (PATCH)
 * @param profileData - Données partielles du profil
 * @param token - Token JWT Clerk
 */
export const patchPlayerProfile = async (
	profileData: Partial<PlayerProfileUpdate>,
	token: string | null
): Promise<PlayerProfile> =>
{
	try
	{
		const headers = createAuthHeaders(token);
		const response = await fetch(`${API_BASE_URL}/api/players/profile/`,
		{
			method: 'PATCH',
			headers,
			body: JSON.stringify(profileData),
		});

		if (!response.ok)
		{
			const errorData = await response.json().catch(() => ({}));
			let errorMessage = `Erreur HTTP: ${response.status}`;
			
			if (errorData.detail)
			{
				errorMessage = errorData.detail;
			}
			else if (errorData.city)
			{
				errorMessage = Array.isArray(errorData.city) ? errorData.city[0] : errorData.city;
			}
			else if (errorData.favorite_sport)
			{
				errorMessage = Array.isArray(errorData.favorite_sport) ? errorData.favorite_sport[0] : errorData.favorite_sport;
			}
			else if (errorData.level)
			{
				errorMessage = Array.isArray(errorData.level) ? errorData.level[0] : errorData.level;
			}
			
			throw new Error(errorMessage);
		}

		return await response.json();
	}
	catch (error)
	{
		console.error("Erreur lors de la mise à jour partielle du profil:", error);
		throw error;
	}
};

