// Types de base pour l'application
export interface User
{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth: Date;
    address?: Location;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
	avatar?: string;
	tokenBalance?: number; // Solde de tokens (1 token = 1 cent)
	role?: 'player' | 'organizer'; // Rôle de l'utilisateur
}

// Types pour l'API
export interface ApiResponse<T>
{
    data: T;
    message?: string;
    success: boolean;
}

// Types pour les formulaires
export interface LoginForm
{
    email: string;
    password: string;
}

export interface RegisterForm
{
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth: Date;
    address?: Location;
}


