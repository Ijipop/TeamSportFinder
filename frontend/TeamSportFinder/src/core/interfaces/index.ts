// Interfaces pour respecter le principe d'inversion de dépendance (SOLID)
import {
	type ApiResponse,

	type User
} from "../../types";

// Interface pour les services d'authentification
export interface IAuthService
{
    login(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>>;
    register(userData: any): Promise<ApiResponse<{ user: User; token: string }>>;
    logout(): Promise<void>;
    getCurrentUser(): Promise<ApiResponse<User>>;
    refreshToken(): Promise<ApiResponse<{ token: string }>>;
}

// Interface pour l'adaptateur Clerk (Principe d'inversion de dépendance)
export interface IClerkAdapter
{
    mapClerkUserToAppUser(clerkUser: any): User | null;
    mapRegisterFormToPublicMetadata(formData: {
        firstName: string;
        lastName: string;
        phone?: string;
        dateOfBirth: Date;
        address?: {
            address: string;
            city: string;
            postalCode: string;
            country: string;
        };
    }): Record<string, any>;
}

/**
 * Interface pour le service d'authentification backend (Principe d'inversion de dépendance)
 */
export interface IBackendAuthService
{
	/**
	 * Valide l'authentification Clerk via l'API backend
	 * @param emailFromClerk Email depuis Clerk (optionnel, utilisé pour mettre à jour le cookie user_email)
	 * @returns L'utilisateur authentifié ou null si non authentifié
	 */
	validateAuth(emailFromClerk?: string): Promise<User | null>;

	/**
	 * Vérifie si l'utilisateur est authentifié
	 * @returns True si authentifié, false sinon
	 */
	checkAuth(): Promise<boolean>;

	/**
	 * Déconnecte l'utilisateur et nettoie la session côté backend
	 * @returns Promise<void>
	 */
	logout(): Promise<void>;
}
