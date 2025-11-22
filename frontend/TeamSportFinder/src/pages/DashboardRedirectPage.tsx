import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { CircularProgress, Container, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getCurrentUserFromBackend } from "../core/services/ApiService";
import { type User } from "../types";

const DashboardRedirectPage: React.FC = () =>
{
	const { user, isLoading, clerkUser, refreshUser } = useAuth();
	const { getToken } = useClerkAuth();
	const navigate = useNavigate();
	const [backendUser, setBackendUser] = useState<User | null>(null);
	const hasCheckedBackendRef = useRef(false);
	const hasRedirectedRef = useRef(false);

	useEffect(() => {
		// Éviter les redirections multiples
		if (hasRedirectedRef.current)
		{
			return;
		}

		const checkAndRedirect = async () =>
		{
			// Si pas de clerkUser, rediriger vers login
			if (!clerkUser)
			{
				hasRedirectedRef.current = true;
				navigate('/login', { replace: true });
				return;
			}

			// Si l'utilisateur est déjà chargé avec un rôle, rediriger immédiatement
			// Ne pas attendre isLoading pour éviter les flashes
			if (user && user.role)
			{
				hasRedirectedRef.current = true;
				const dashboardPath = user.role === 'organizer' ? '/dashboard-organizer' : '/dashboard';
				if (window.location.pathname !== dashboardPath)
				{
					navigate(dashboardPath, { replace: true });
				}
				return;
			}

			// Attendre que le chargement soit terminé avant de vérifier le backend
			if (isLoading)
			{
				return;
			}

			// Si l'utilisateur n'est pas chargé après le chargement, vérifier le backend une seule fois
			// Utiliser l'utilisateur de AuthContext au lieu de faire un nouvel appel
			if (!user && !hasCheckedBackendRef.current)
			{
				hasCheckedBackendRef.current = true;
				// Attendre un peu pour laisser AuthContext charger l'utilisateur
				// Si après un court délai l'utilisateur n'est toujours pas chargé, vérifier directement
				const checkAfterDelay = async () => {
					if (hasRedirectedRef.current) return;
					
					// Vérifier à nouveau l'utilisateur depuis AuthContext (il peut avoir été chargé entre-temps)
					// Utiliser directement user depuis le hook (sera mis à jour par React)
					// Si l'utilisateur est maintenant chargé, rediriger
					// TypeScript a besoin d'une assertion de type
					const currentUser = user as User | null;
					if (currentUser && currentUser.role) {
						hasRedirectedRef.current = true;
						const dashboardPath = currentUser.role === 'organizer' ? '/dashboard-organizer' : '/dashboard';
						navigate(dashboardPath, { replace: true });
						return;
					}
					
					// Sinon, vérifier le backend directement (seulement si vraiment nécessaire)
					try
					{
						const token = await getToken();
						const fetchedUser = await getCurrentUserFromBackend(token || null);
						
						if (fetchedUser && fetchedUser.role)
						{
							// L'utilisateur existe dans le backend avec un rôle
							setBackendUser(fetchedUser);
							// Rafraîchir l'état pour les autres composants (en arrière-plan)
							refreshUser().catch(console.error);
							// Rediriger directement avec le rôle du backend
							hasRedirectedRef.current = true;
							const dashboardPath = fetchedUser.role === 'organizer' ? '/dashboard-organizer' : '/dashboard';
							navigate(dashboardPath, { replace: true });
							return;
						}
						else
						{
							// L'utilisateur n'existe pas dans le backend, rediriger vers sélection de rôle
							hasRedirectedRef.current = true;
							navigate('/select-role', { replace: true });
							return;
						}
					}
					catch (error)
					{
						console.error("Erreur lors de la vérification de l'utilisateur:", error);
						hasRedirectedRef.current = true;
						navigate('/select-role', { replace: true });
						return;
					}
				};
				
				setTimeout(checkAfterDelay, 100); // Attendre 100ms pour laisser AuthContext charger
				return;
			}

			// Utiliser l'utilisateur du backend si disponible, sinon utiliser celui de l'état
			const currentUser = backendUser || user;

			// Si l'utilisateur existe, rediriger selon le rôle (une seule fois)
			if (currentUser && currentUser.role)
			{
				hasRedirectedRef.current = true;
				const dashboardPath = currentUser.role === 'organizer' ? '/dashboard-organizer' : '/dashboard';
				// Ne rediriger que si on n'est pas déjà sur le bon dashboard
				const currentPath = window.location.pathname;
				if (currentPath !== dashboardPath && 
					!currentPath.startsWith('/dashboard-redirect') && 
					!currentPath.startsWith('/select-role'))
				{
					navigate(dashboardPath, { replace: true });
				}
				return;
			}

			// Si on a déjà vérifié et qu'il n'y a toujours pas d'utilisateur, rediriger vers la sélection
			if (hasCheckedBackendRef.current && !currentUser)
			{
				hasRedirectedRef.current = true;
				const currentPath = window.location.pathname;
				if (!currentPath.startsWith('/select-role'))
				{
					navigate('/select-role', { replace: true });
				}
			}
		};

		checkAndRedirect();
	}, [isLoading, user, backendUser, clerkUser, navigate, getToken, refreshUser]);

	return (
		<Container sx={{ mt: 10, textAlign: 'center' }}>
			<CircularProgress />
			<Typography variant="h6" sx={{ mt: 2 }}>
				Redirection vers votre tableau de bord...
			</Typography>
		</Container>
	);
};

export { DashboardRedirectPage };

