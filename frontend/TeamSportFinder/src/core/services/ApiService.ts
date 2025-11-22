// Service pour les appels API backend
import { type User } from "../../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Récupère le token JWT depuis Clerk
 */
const getClerkToken = async (): Promise<string | null> => {
	try {
		// Clerk stocke le token dans les cookies ou session
		// On peut aussi utiliser useAuth de Clerk pour obtenir le token
		const response = await fetch('/api/auth/session', { credentials: 'include' });
		if (response.ok) {
			const data = await response.json();
			return data.token || null;
		}
	} catch (error) {
		console.warn("Impossible de récupérer le token Clerk:", error);
	}
	return null;
};

/**
 * Crée l'utilisateur dans la base de données backend lors de l'inscription
 */
export const createUserInBackend = async (clerkToken: string | null, fullName?: string, role?: 'player' | 'organizer'): Promise<User | null> => {
	try {
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
		};

		if (clerkToken) {
			headers['Authorization'] = `Bearer ${clerkToken}`;
		}

		const body: any = {};
		if (fullName) {
			body.full_name = fullName;
		}
		if (role) {
			body.role = role;
		}

		const response = await fetch(`${API_BASE_URL}/api/accounts/create/`, {
			method: 'POST',
			headers,
			body: JSON.stringify(body),
			credentials: 'include',
		});

		if (response.status === 401) {
			// Non authentifié
			return null;
		}

		if (!response.ok) {
			throw new Error(`Erreur HTTP: ${response.status}`);
		}

		const userData = await response.json();
		
		// Log pour déboguer
		console.log("Données utilisateur reçues du backend:", userData);
		console.log("Rôle reçu:", userData.role);
		
		// Mapper les données du backend vers notre interface User
		const fullNameParts = (userData.full_name || "").split(' ');
		const firstName = fullNameParts[0] || "";
		const lastName = fullNameParts.slice(1).join(' ') || "";
		
		const mappedUser = {
			id: userData.clerk_id || userData.id || "",
			email: userData.email || "",
			firstName: firstName,
			lastName: lastName,
			phone: "",
			isVerified: true,
			role: (userData.role as 'player' | 'organizer') || 'player',
			dateOfBirth: new Date(),
			createdAt: userData.created_at ? new Date(userData.created_at) : new Date(),
			updatedAt: userData.created_at ? new Date(userData.created_at) : new Date(),
		} as User;
		
		console.log("Utilisateur mappé avec le rôle:", mappedUser.role);
		return mappedUser;
	} catch (error) {
		console.error("Erreur lors de la création de l'utilisateur dans le backend:", error);
		return null;
	}
};

/**
 * Récupère l'utilisateur actuel depuis le backend
 * Retourne null si l'utilisateur n'existe pas encore (doit s'inscrire)
 */
export async function getCurrentUserFromBackend(clerkToken: string | null): Promise<User | null> {
	try {
		const headers: HeadersInit = {
			'Content-Type': 'application/json',
		};

		if (clerkToken) {
			headers['Authorization'] = `Bearer ${clerkToken}`;
		}

		const response = await fetch(`${API_BASE_URL}/api/accounts/me/`, {
			method: 'GET',
			headers,
			credentials: 'include',
		});

		if (response.status === 401) {
			// Non authentifié
			return null;
		}

		if (response.status === 404) {
			// Utilisateur non trouvé (doit s'inscrire)
			return null;
		}

		if (!response.ok) {
			throw new Error(`Erreur HTTP: ${response.status}`);
		}

		const userData = await response.json();
		
		// Mapper les données du backend vers notre interface User
		// Le backend retourne: id, clerk_id, email, full_name, role, created_at
		const fullNameParts = (userData.full_name || "").split(' ');
		const firstName = fullNameParts[0] || "";
		const lastName = fullNameParts.slice(1).join(' ') || "";
		
		return {
			id: userData.clerk_id || userData.id || "",
			email: userData.email || "",
			firstName: firstName,
			lastName: lastName,
			phone: "",
			isVerified: true,
			role: (userData.role as 'player' | 'organizer') || 'player',
			dateOfBirth: new Date(),
			createdAt: userData.created_at ? new Date(userData.created_at) : new Date(),
			updatedAt: userData.created_at ? new Date(userData.created_at) : new Date(),
		} as User;
	} catch (error) {
		console.error("Erreur lors de la récupération de l'utilisateur depuis le backend:", error);
		return null;
	}
}
