// Contexte d'authentification utilisant Clerk
import { useClerk, useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";
import React, { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { isClerkConfigured } from "../clerk/client";
import { getCurrentUserFromBackend } from "../core/services/ApiService";
import { type User } from "../types";

interface AuthContextType
{
	user: User | null;
	clerkUser: ReturnType<typeof useUser>["user"] | null | undefined;
	isAuthenticated: boolean;
	isLoading: boolean;
	logout: () => Promise<void>;
	refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps
{
	children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) =>
{
	const hasClerkConfig = isClerkConfigured;
	const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
	const clerk = useClerk();
	const { getToken } = useClerkAuth();
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Mapper Clerk User vers notre interface User
	const mapClerkUserToAppUser = (clerkUser: any): User | null =>
	{
		if (!clerkUser)
		{
			return null;
		}
		// Récupérer le rôle depuis publicMetadata ou unsafeMetadata
		const role = (clerkUser.publicMetadata?.role as 'player' | 'organizer') || 
			(clerkUser.unsafeMetadata?.role as 'player' | 'organizer') || 
			'player';
		
		return {
			id: clerkUser.id || "",
			email: clerkUser.primaryEmailAddress?.emailAddress || "",
			firstName: clerkUser.firstName || "",
			lastName: clerkUser.lastName || "",
			phone: clerkUser.primaryPhoneNumber?.phoneNumber || "",
			isVerified: clerkUser.primaryEmailAddress?.verification?.status === "verified" || false,
			role: role,
			dateOfBirth: new Date(),
			createdAt: new Date(),
			updatedAt: new Date(),
		} as User;
	};

	// Initialisation et synchronisation avec Clerk et backend
	useEffect(() =>
	{
		if (!hasClerkConfig || !isClerkLoaded)
		{
			setIsLoading(false);
			return;
		}

		const syncUser = async () => {
			if (clerkUser)
			{
				try {
					// Récupérer le token JWT depuis Clerk
					const token = await getToken();
					
					// Vérifier si l'utilisateur existe dans la base de données backend
					const backendUser = await getCurrentUserFromBackend(token || null);
					
					if (backendUser) {
						// Utiliser les données du backend (plus fiables)
						setUser(backendUser);
					} else {
						// Si l'utilisateur n'existe pas dans le backend, ne pas le définir
						// Il devra s'inscrire d'abord
						setUser(null);
					}
				} catch (error) {
					console.error("Erreur lors de la synchronisation avec le backend:", error);
					// En cas d'erreur, ne pas définir l'utilisateur
					setUser(null);
				}
			}
			else
			{
				setUser(null);
			}
			setIsLoading(false);
		};

		syncUser();
	}, [clerkUser, hasClerkConfig, isClerkLoaded, getToken]);

	// Vérifier l'authentification
	const isAuthenticated = useMemo(() =>
	{
		if (hasClerkConfig)
		{
			return clerkUser !== null && user !== null;
		}
		return user !== null;
	}, [user, clerkUser, hasClerkConfig]);

	// Déconnexion
	const logout = async () =>
	{
		try
		{
			setIsLoading(true);

			// Déconnexion Clerk
			if (hasClerkConfig && clerk)
			{
				try
				{
					await clerk.signOut();
				}
				catch (error)
				{
					console.error("Erreur lors de la déconnexion Clerk:", error);
				}
			}

			// Nettoyer les cookies Clerk côté client
			if (typeof document !== "undefined")
			{
				const clerkCookieNames = ['__clerk_db_jwt', '__session', '__client'];
				document.cookie.split(';').forEach(cookie =>
				{
					const cookieName = cookie.split('=')[0].trim();
					const isClerkCookie = clerkCookieNames.some(name => cookieName.includes(name));
					
					if (isClerkCookie)
					{
						const domain = window.location.hostname;
						const paths = ['/', window.location.pathname];
						
						paths.forEach(path =>
						{
							document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`;
							document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
						});
					}
				});
			}

			// Nettoyer localStorage et sessionStorage
			if (typeof localStorage !== "undefined")
			{
				const authKeys = Object.keys(localStorage).filter(key => 
					key.includes('auth') || key.includes('token') || key.includes('clerk') || key.includes('user')
				);
				authKeys.forEach(key => localStorage.removeItem(key));
			}

			if (typeof sessionStorage !== "undefined")
			{
				const authKeys = Object.keys(sessionStorage).filter(key => 
					key.includes('auth') || key.includes('token') || key.includes('clerk') || key.includes('oauth') || key.includes('user')
				);
				authKeys.forEach(key => sessionStorage.removeItem(key));
			}

			setUser(null);
		}
		catch (error)
		{
			console.error("Erreur lors de la déconnexion:", error);
			setUser(null);
		}
		finally
		{
			setIsLoading(false);
		}
	};

	// Rafraîchir l'utilisateur depuis le backend
	const refreshUser = async () =>
	{
		try
		{
			if (hasClerkConfig && clerkUser)
			{
				// Récupérer le token JWT depuis Clerk
				const token = await getToken();
				
				// Récupérer l'utilisateur depuis le backend
				const backendUser = await getCurrentUserFromBackend(token || null);
				
				if (backendUser) {
					setUser(backendUser);
				} else {
					// Si l'utilisateur n'existe pas dans le backend, utiliser les données Clerk
					const appUser = mapClerkUserToAppUser(clerkUser);
					if (appUser) {
						setUser(appUser);
					}
				}
			}
			else if (user)
			{
				// Conserver l'utilisateur actuel si on ne peut pas le rafraîchir
				console.warn("Impossible de rafraîchir l'utilisateur, conservation de l'état actuel");
			}
			else
			{
				setUser(null);
			}
		}
		catch (error)
		{
			console.error("Erreur lors du rafraîchissement des données utilisateur:", error);
		}
	};

	const value: AuthContextType =
	{
		user,
		clerkUser,
		isAuthenticated,
		isLoading,
		logout,
		refreshUser,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType =>
{
	const context = useContext(AuthContext);
	if (context === undefined)
	{
		throw new Error("useAuth doit être utilisé dans un AuthProvider");
	}
	
	return context;
};
