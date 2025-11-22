import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { CircularProgress, Container, Typography } from "@mui/material";
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getCurrentUserFromBackend } from "../core/services/ApiService";

const DashboardRedirectPage: React.FC = () =>
{
	const { user, isLoading, clerkUser, refreshUser } = useAuth();
	const { getToken } = useClerkAuth();
	const navigate = useNavigate();
	const hasCheckedBackendRef = useRef(false);
	const hasRedirectedRef = useRef(false);
	const isCheckingRef = useRef(false);

	useEffect(() => {
		// Éviter les redirections multiples et les vérifications simultanées
		if (hasRedirectedRef.current || isCheckingRef.current)
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
			if (user && user.role)
			{
				hasRedirectedRef.current = true;
				const dashboardPath = user.role === 'organizer' ? '/dashboard-organizer' : '/dashboard';
				const currentPath = window.location.pathname;
				if (currentPath !== dashboardPath)
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
			if (!user && !hasCheckedBackendRef.current)
			{
				hasCheckedBackendRef.current = true;
				isCheckingRef.current = true;
				
				// Attendre un peu pour laisser AuthContext charger l'utilisateur
				setTimeout(async () => {
					if (hasRedirectedRef.current)
					{
						isCheckingRef.current = false;
						return;
					}
					
					try
					{
						const token = await getToken();
						const fetchedUser = await getCurrentUserFromBackend(token || null);
						
						if (hasRedirectedRef.current)
						{
							isCheckingRef.current = false;
							return;
						}
						
						if (fetchedUser && fetchedUser.role)
						{
							// L'utilisateur existe dans le backend avec un rôle
							// Rafraîchir l'état pour les autres composants (en arrière-plan)
							refreshUser().catch(console.error);
							// Rediriger directement avec le rôle du backend
							hasRedirectedRef.current = true;
							isCheckingRef.current = false;
							const dashboardPath = fetchedUser.role === 'organizer' ? '/dashboard-organizer' : '/dashboard';
							navigate(dashboardPath, { replace: true });
							return;
						}
						else
						{
							// L'utilisateur n'existe pas dans le backend, rediriger vers sélection de rôle
							hasRedirectedRef.current = true;
							isCheckingRef.current = false;
							navigate('/select-role', { replace: true });
							return;
						}
					}
					catch (error)
					{
						console.error("Erreur lors de la vérification de l'utilisateur:", error);
						hasRedirectedRef.current = true;
						isCheckingRef.current = false;
						navigate('/select-role', { replace: true });
						return;
					}
				}, 100); // Attendre 100ms pour laisser AuthContext charger
				return;
			}

			// Si on a déjà vérifié et qu'il n'y a toujours pas d'utilisateur, rediriger vers la sélection
			if (hasCheckedBackendRef.current && !user)
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoading, user, clerkUser]); // Retirer backendUser des dépendances pour éviter les boucles

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

