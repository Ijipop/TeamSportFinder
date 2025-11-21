// Contexte d'authentification utilisant Clerk (Principe de responsabilité unique)
import { useClerk, useUser } from "@clerk/clerk-react";
import React, { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { isClerkConfigured } from "../clerk/client";
import type { IBackendAuthService, IClerkAdapter } from "../core/interfaces";
import { type LoginForm, type RegisterForm, type User } from "../types";

interface AuthContextType
{
	user: User | null;
	clerkUser: ReturnType<typeof useUser>["user"] | null | undefined;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (credentials: LoginForm) => Promise<void>;
	register: (userData: RegisterForm) => Promise<void>;
	logout: () => Promise<void>;
	refreshUser: () => Promise<void>;
	setUserFromBackend: (backendUser: User) => void;
	isProfileComplete: (userToCheck: User | null) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps
{
	children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) =>
{
	// Vérifier que Clerk est configuré (Principe de responsabilité unique)
	const hasClerkConfig = isClerkConfigured;
	
	// Les hooks doivent toujours être appelés dans le même ordre
	// useUser() de Clerk fonctionne sans paramètres car il utilise le ClerkProvider
	// ClerkProviderWrapper fournit toujours un ClerkProvider (même avec une clé mock)
	const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
	const clerk = useClerk();
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true); // Commencer à true pour valider la session au chargement
	// Ref pour empêcher la réinitialisation de user s'il a été défini par le backend
	const userFromBackendRef = React.useRef<boolean>(false);
	// Ref pour éviter la validation multiple au chargement initial
	const hasInitializedRef = React.useRef<boolean>(false);
	
	// Mock adaptateur Clerk (service non enregistré dans le container)
	const clerkAdapter = useMemo<IClerkAdapter>(
		() => ({
			mapClerkUserToAppUser: (clerkUser: any): User | null => {
				if (!clerkUser) return null;
				return {
					id: clerkUser.id || "",
					email: clerkUser.primaryEmailAddress?.emailAddress || "",
					firstName: clerkUser.firstName || "",
					lastName: clerkUser.lastName || "",
					phone: clerkUser.primaryPhoneNumber?.phoneNumber || "",
					isVerified: clerkUser.primaryEmailAddress?.verification?.status === "verified" || false,
				} as User;
			},
			mapRegisterFormToPublicMetadata: () => ({}),
		}),
		[]
	);
	
	// Mock service backend (service non enregistré dans le container)
	const backendAuthService = useMemo<IBackendAuthService>(
		() => ({
			validateAuth: async () => null,
			checkAuth: async () => false,
			logout: async () => {},
		}),
		[]
	);

	// Validation initiale au chargement de la page pour restaurer la session (Principe de responsabilité unique)
	useEffect(() =>
	{
		// Ne valider qu'une seule fois au chargement initial
		if (hasInitializedRef.current)
		{
			return;
		}

		// Vérifier si Clerk est configuré et chargé
		if (!hasClerkConfig || !isClerkLoaded)
		{
			setIsLoading(false);
			hasInitializedRef.current = true;
			return;
		}

		// Si clerkUser est déjà disponible, mapper et récupérer le profil complet
		if (clerkUser)
		{
			const initializeAuth = async () =>
			{
				try
				{
					const appUser = clerkAdapter.mapClerkUserToAppUser(clerkUser);
					if (appUser)
					{
						setUser(appUser);
						// Récupérer le profil complet depuis la base de données (incluant l'adresse)
						await refreshUser();
					}
				}
				catch (error)
				{
					console.error("Erreur lors de l'initialisation avec Clerk:", error);
				}
				finally
				{
					hasInitializedRef.current = true;
					setIsLoading(false);
				}
			};
			initializeAuth();
			return;
		}

		// Si clerkUser n'est pas encore disponible, attendre un peu pour voir si Clerk se charge
		// Cela permet de restaurer la session au rechargement de la page
		// IMPORTANT: Même si Clerk n'a pas d'utilisateur après le délai, on doit vérifier avec le backend
		// car le backend peut lire les cookies HttpOnly que le client ne peut pas voir
		const timeoutId = setTimeout(async () =>
		{
			// Si Clerk a maintenant un utilisateur, l'utiliser
			if (clerkUser)
			{
				const appUser = clerkAdapter.mapClerkUserToAppUser(clerkUser);
				if (appUser)
				{
					setUser(appUser);
					await refreshUser();
				}
				hasInitializedRef.current = true;
				setIsLoading(false);
				return;
			}
			
			// IMPORTANT: Si le backend n'est pas accessible, ne pas bloquer l'authentification
			// L'authentification sera vérifiée côté client via useUser()
			try
			{
				const backendUser = await backendAuthService.validateAuth();
				
				if (backendUser)
				{
					setUser(backendUser);
					userFromBackendRef.current = true;
					// Récupérer le profil complet depuis la base de données (incluant l'adresse)
					await refreshUser();
				}
				else
				{
					// Pas d'utilisateur authentifié - c'est normal, pas une erreur
					// IMPORTANT: Ne pas définir user à null si le backend n'est pas accessible
					// L'authentification sera vérifiée côté client via useUser()
					// setUser(null);
				}
			}
			catch (error)
			{
				// Ne pas logger d'erreur pour les 401 (Non autorisé) - c'est normal quand il n'y a pas de session
				// Ne pas logger d'erreur pour les erreurs de connexion - le backend n'est peut-être pas accessible
				const isConnectionError = error instanceof Error && (
					error.message.includes("Erreur de connexion au serveur") ||
					error.message.includes("ERR_CONNECTION_REFUSED") ||
					error.message.includes("Network Error") ||
					error.message.includes("ECONNREFUSED")
				);
				
				if (!isConnectionError && error instanceof Error && !error.message.includes("Non autorisé"))
				{
					console.error("Erreur lors de la validation initiale:", error);
				}
				
				// IMPORTANT: Ne pas définir user à null si le backend n'est pas accessible
				// L'authentification sera vérifiée côté client via useUser()
				// setUser(null);
			}
			finally
			{
				hasInitializedRef.current = true;
				setIsLoading(false);
			}
		}, 1000); // Attendre 1 seconde pour voir si Clerk se charge

		return () => clearTimeout(timeoutId);
	}, [clerkUser, hasClerkConfig, isClerkLoaded, clerkAdapter, backendAuthService]); // Se déclenche au montage et si clerkUser devient disponible

	// Ref pour éviter les appels multiples à validateAuth
	const isSyncingRef = React.useRef(false);

	// Initialisation et synchronisation avec Clerk (Principe de responsabilité unique)
	// Note: Ce useEffect se déclenche quand clerkUser change (mis à jour par ClerkProvider)
	// IMPORTANT: Ne pas réinitialiser user s'il est déjà défini (peut provenir du backend)
	useEffect(() =>
	{
		// Attendre que Clerk soit chargé
		if (!isClerkLoaded)
		{
			return;
		}

		// Éviter les appels multiples simultanés
		if (isSyncingRef.current)
		{
			return;
		}

		const syncUser = async () =>
		{
			isSyncingRef.current = true;
			try
			{
				// IMPORTANT: Si user est déjà défini via le backend (setUserFromBackend), NE PAS le réinitialiser
				// Cette vérification doit être AVANT toute autre logique pour éviter de perdre l'authentification
				if (userFromBackendRef.current && user)
				{
					console.log("🔒 AuthContext - user défini par backend, ne pas réinitialiser", {
						userId: user.id,
						email: user.email
					});
					// Ne rien faire, garder l'utilisateur existant
					// Attendre que clerkUser se mette à jour naturellement pour remplacer l'utilisateur temporaire
					// Si clerkUser devient disponible, on remplace user mais on garde le flag
					if (clerkUser)
					{
						// Mapper Clerk User vers notre interface User via l'adaptateur injecté
						const appUser = clerkAdapter.mapClerkUserToAppUser(clerkUser);
						if (appUser)
						{
							setUser(appUser);
							userFromBackendRef.current = false; // Plus besoin du flag, on a le vrai user
						}
					}
					return;
				}
				
				// Vérifier Clerk si configuré
				if (hasClerkConfig)
				{
					// Utiliser clerkUser du hook si disponible
					if (clerkUser)
					{
						// Mapper Clerk User vers notre interface User via l'adaptateur injecté
						const appUser = clerkAdapter.mapClerkUserToAppUser(clerkUser);
						if (appUser)
						{
							setUser(appUser);
							// Si clerkUser devient disponible, on n'a plus besoin du user du backend
							if (userFromBackendRef.current)
							{
								userFromBackendRef.current = false;
							}
							
							// IMPORTANT: Créer l'utilisateur dans la base de données si clerkUser est disponible
							// Cela permet de synchroniser l'utilisateur Clerk avec la base de données
							// même si l'email n'est pas encore vérifié (pour les utilisateurs email/password)
							// Ne pas attendre le résultat pour ne pas bloquer l'interface
							// Passer l'email depuis Clerk pour mettre à jour le cookie user_email côté backend
							// IMPORTANT: Ne pas appeler validateAuth si user est déjà défini et correspond à clerkUser
							// pour éviter les boucles infinies
							const clerkEmail = clerkUser.primaryEmailAddress?.emailAddress;
							if (!user || user.email !== clerkEmail)
							{
								backendAuthService.validateAuth(clerkEmail).then(validatedUser => {
									if (validatedUser && validatedUser.id !== "authenticated" && validatedUser.email !== "user@example.com")
									{
										console.log("✅ AuthContext - Utilisateur créé/mis à jour dans la base de données:", validatedUser);
										// Mettre à jour l'utilisateur avec les données de la base de données
										setUser(validatedUser);
									}
								}).catch(error => {
									// Ne pas bloquer si la création dans la base de données échoue
									// L'utilisateur sera créé plus tard lors de la vérification d'email ou lors de l'onboarding
									console.warn("⚠️ AuthContext - Erreur lors de la création de l'utilisateur dans la base de données:", error);
								});
							}
						}
					}
					else
					{
						// IMPORTANT: Si clerkUser est null, cela signifie que l'utilisateur n'est pas authentifié avec Clerk
						// Même si des cookies Clerk peuvent rester présents, si useUser() retourne null,
						// l'utilisateur n'est pas vraiment connecté
						// Ne pas vérifier avec le backend car cela pourrait créer un utilisateur "authenticated" avec "user@example.com"
						
						// Si pas de clerkUser, mettre user à null pour déconnecter l'utilisateur
						// Cela gère correctement la déconnexion même si des cookies restent présents
						console.log("🔓 AuthContext - clerkUser est null, déconnexion de l'utilisateur");
						setUser(null);
						userFromBackendRef.current = false;
					}
				}
				else
				{
					// Ne pas réinitialiser user si déjà défini
					if (!user)
					{
						setUser(null);
					}
				}
			}
			catch (error)
			{
				console.error("Erreur lors de l'initialisation de l'authentification:", error);
				// Ne pas réinitialiser user si déjà défini (peut provenir du backend)
				if (!user)
				{
					setUser(null);
				}
			}
			finally
			{
				isSyncingRef.current = false;
			}
		};

		syncUser();

		// IMPORTANT: user n'est PAS dans les dépendances pour éviter les boucles infinies
		// On vérifie user à l'intérieur du useEffect si nécessaire
	}, [clerkUser, clerkAdapter, backendAuthService, hasClerkConfig, isClerkLoaded]);

	// Vérifier l'authentification Clerk (Principe de responsabilité unique)
	// Utiliser useMemo pour recalculer uniquement quand clerkUser ou user change
	const isAuthenticated = React.useMemo(() => {
		// IMPORTANT: Pour être authentifié, il faut que clerkUser soit disponible ET que user soit défini
		// Si clerkUser est null, l'utilisateur n'est pas authentifié même si user existe encore
		// Cela gère correctement la déconnexion
		if (hasClerkConfig)
		{
			// Si clerkUser est null, l'utilisateur n'est pas authentifié
			if (!clerkUser)
			{
				return false;
			}
			
			// Si clerkUser existe, vérifier que user est aussi défini
			// (peut être temporairement null pendant le chargement)
			return user !== null;
		}
		
		// Si Clerk n'est pas configuré, utiliser user comme indicateur
		return user !== null;
	}, [user, clerkUser, hasClerkConfig]);

	// Connexion avec Clerk (non utilisée - Clerk utilise <SignIn />)
	const login = async (_credentials: LoginForm) =>
	{
		throw new Error("Utilisez le composant <SignIn /> de Clerk pour la connexion.");
	};

	// Inscription avec Clerk (non utilisée - Clerk utilise <SignUp />)
	const register = async (_userData: RegisterForm) =>
	{
		throw new Error("Utilisez le composant <SignUp /> de Clerk pour l'inscription.");
	};

	// Déconnexion complète avec Clerk et backend (Principe de responsabilité unique)
	const logout = async () =>
	{
		try
		{
			setIsLoading(true);

			// 1. Déconnexion Clerk (supprime les cookies HttpOnly)
			if (hasClerkConfig && clerk)
			{
				try
				{
					await clerk.signOut();
				}
				catch (error)
				{
					console.error("Erreur lors de la déconnexion Clerk:", error);
					// Continuer même en cas d'erreur Clerk
				}
			}

			// 2. Déconnexion backend (nettoie la session côté serveur)
			try
			{
				await backendAuthService.logout();
			}
			catch (error)
			{
				console.error("Erreur lors de la déconnexion backend:", error);
				// Continuer même en cas d'erreur backend
			}

			// 3. Nettoyer tous les cookies Clerk côté client (pour les cookies non-HttpOnly)
			if (typeof document !== "undefined")
			{
				// Lister tous les cookies Clerk possibles
				const clerkCookieNames = [
					'__clerk_db_jwt',
					'__session',
					'__client',
				];

				// Nettoyer les cookies en les mettant à expiration passée
				document.cookie.split(';').forEach(cookie =>
				{
					const cookieName = cookie.split('=')[0].trim();
					const isClerkCookie = clerkCookieNames.some(name => cookieName.includes(name));
					
					if (isClerkCookie)
					{
						// Supprimer le cookie pour tous les chemins et domaines possibles
						const domain = window.location.hostname;
						const paths = ['/', window.location.pathname];
						
						paths.forEach(path =>
						{
							// Expirer le cookie
							document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`;
							document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
							// Aussi pour le domaine parent
							const domainParts = domain.split('.');
							if (domainParts.length > 1)
							{
								const parentDomain = '.' + domainParts.slice(-2).join('.');
								document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${parentDomain};`;
							}
						});
					}
				});
			}

			// 4. Nettoyer localStorage et sessionStorage
			if (typeof localStorage !== "undefined")
			{
				// Nettoyer tous les items liés à l'authentification
				const authKeys = Object.keys(localStorage).filter(key => 
					key.includes('auth') || 
					key.includes('token') || 
					key.includes('clerk') ||
					key.includes('user')
				);
				authKeys.forEach(key => localStorage.removeItem(key));
			}

			if (typeof sessionStorage !== "undefined")
			{
				// Nettoyer tous les items liés à l'authentification
				const authKeys = Object.keys(sessionStorage).filter(key => 
					key.includes('auth') || 
					key.includes('token') || 
					key.includes('clerk') ||
					key.includes('oauth') ||
					key.includes('user')
				);
				authKeys.forEach(key => sessionStorage.removeItem(key));
			}

			// 5. Réinitialiser l'état local
			userFromBackendRef.current = false;
			hasInitializedRef.current = false;
			setUser(null);
		}
		catch (error)
		{
			console.error("Erreur lors de la déconnexion:", error);
			// Même en cas d'erreur, on déconnecte localement
			userFromBackendRef.current = false;
			hasInitializedRef.current = false;
			setUser(null);
		}
		finally
		{
			setIsLoading(false);
		}
	};

	// Rafraîchissement de l'utilisateur avec Clerk
	const refreshUser = async () =>
	{
		try
		{
			// Utiliser Clerk pour rafraîchir l'utilisateur
			if (hasClerkConfig && clerkUser)
			{
				const appUser = clerkAdapter.mapClerkUserToAppUser(clerkUser);
				if (appUser)
				{
					setUser(appUser);
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

	// Méthode pour mettre à jour l'utilisateur directement depuis le backend (pour OAuth callback)
	const setUserFromBackend = (backendUser: User) =>
	{
		userFromBackendRef.current = true; // Marquer que user vient du backend
		setUser(backendUser);
	};

	// Fonction pour vérifier si le profil est complet
	// IMPORTANT: Les utilisateurs OAuth n'ont pas besoin de vérifier leur email
	// car le fournisseur OAuth l'a déjà vérifié
	const isProfileComplete = React.useCallback((userToCheck: User | null): boolean =>
	{
		if (!userToCheck)
		{
			return false;
		}

		// Vérifier que l'email est valide (pas "user@example.com" ou vide)
		if (!userToCheck.email || userToCheck.email === "user@example.com" || userToCheck.email.trim() === "")
		{
			return false;
		}

		// Vérifier que l'email est vérifié SEULEMENT pour les utilisateurs email/password
		// Les utilisateurs OAuth n'ont pas besoin de vérifier leur email
		// Note: Pour Clerk, on vérifie directement depuis clerkUser
		if (clerkUser)
		{
			// Vérifier si l'utilisateur a des identités OAuth (pas besoin de vérification d'email)
			const hasOAuthIdentity = clerkUser.externalAccounts && clerkUser.externalAccounts.length > 0;
			if (!hasOAuthIdentity)
			{
				// Pour les utilisateurs email/password, vérifier que l'email est vérifié
				const primaryEmail = clerkUser.primaryEmailAddress;
				if (!primaryEmail || primaryEmail.verification?.status !== "verified")
				{
					return false;
				}
			}
		}
		else if (!userToCheck.isVerified)
		{
			// Si clerkUser n'est pas disponible, vérifier depuis userToCheck
			return false;
		}

		// Vérifier que firstName, lastName, phone sont renseignés
		if (!userToCheck.firstName || !userToCheck.lastName || !userToCheck.phone)
		{
			return false;
		}

		// Vérifier que l'adresse est complète
		// Parser l'adresse si elle est en JSON
		let addressObj = userToCheck.address;
		if (userToCheck.address && typeof userToCheck.address === "string")
		{
			try
			{
				addressObj = JSON.parse(userToCheck.address);
			}
			catch
			{
				// Si le parsing échoue, l'adresse n'est pas valide
				return false;
			}
		}

		if (!addressObj || typeof addressObj !== "object")
		{
			return false;
		}

		// Normaliser les clés de l'adresse (PascalCase -> camelCase) pour la vérification
		const addressData = addressObj as any; // Type assertion pour éviter les conflits avec le type Location du DOM
		const normalizedAddress = {
			address: addressData.Address || addressData.address || "",
			city: addressData.City || addressData.city || "",
			postalCode: addressData.PostalCode || addressData.postalCode || "",
			country: addressData.Country || addressData.country || "",
		};

		// Vérifier que tous les champs requis sont présents
		if (!normalizedAddress.address || !normalizedAddress.city || !normalizedAddress.postalCode || !normalizedAddress.country)
		{
			return false;
		}

		return true;
	}, [clerkUser]);

	const value: AuthContextType =
	{
		user,
		clerkUser,
		isAuthenticated,
		isLoading,
		login,
		register,
		logout,
		refreshUser,
		setUserFromBackend,
		isProfileComplete,
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
