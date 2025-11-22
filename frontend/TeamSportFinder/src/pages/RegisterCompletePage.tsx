// frontend/TeamSportFinder/src/pages/RegisterCompletePage.tsx
import { useClerk, useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { CircularProgress, Container, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";
import { createUserInBackend } from "../core/services/ApiService";

const RegisterCompletePage: React.FC = () =>
{
	const { user: clerkUser } = useUser();
	const clerk = useClerk();
	const { getToken } = useClerkAuth();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { refreshUser } = useAuth();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() =>
	{
		const completeRegistration = async () =>
		{
			if (!clerkUser) return;

			// Vérifier si l'utilisateur existe déjà dans le backend
			// Si oui, ne pas créer à nouveau, juste rediriger
			const token = await getToken();
			try {
				const { getCurrentUserFromBackend } = await import("../core/services/ApiService");
				const existingUser = await getCurrentUserFromBackend(token || null);
				if (existingUser) {
					// L'utilisateur existe déjà, rediriger vers le dashboard approprié
					await refreshUser();
					const dashboardPath = existingUser.role === 'organizer' ? '/dashboard-organizer' : '/dashboard';
					navigate(dashboardPath);
					setLoading(false);
					return;
				}
			} catch (err) {
				console.error("Erreur lors de la vérification de l'utilisateur:", err);
			}

			try {
				// Récupérer le rôle depuis les paramètres d'URL ou les métadonnées
				let role = searchParams.get('role') || 
					(clerkUser.publicMetadata?.role as string) || 
					(clerkUser.unsafeMetadata?.role as string);
				
				// Si aucun rôle n'est trouvé, rediriger vers la page de sélection de rôle
				if (!role || (role !== 'player' && role !== 'organizer')) {
					navigate('/select-role', { replace: true });
					setLoading(false);
					return;
				}

				// Mettre à jour les métadonnées si nécessaire
				// Note: publicMetadata ne peut pas être mis à jour côté client
				// On utilise unsafeMetadata pour le moment, à migrer vers publicMetadata via l'API backend plus tard
				if (!clerkUser.publicMetadata?.role && !clerkUser.unsafeMetadata?.role)
				{
					await clerkUser.update(
					{
						unsafeMetadata:
						{
							role: role
						}
					});
				}

				// Créer l'utilisateur dans la base de données backend avec le rôle choisi
				const fullName = clerkUser.firstName && clerkUser.lastName 
					? `${clerkUser.firstName} ${clerkUser.lastName}`
					: clerkUser.fullName || undefined;
				
				const backendUser = await createUserInBackend(token || null, fullName, role as 'player' | 'organizer');
				
				if (!backendUser) {
					setError("Erreur lors de la création du compte. Veuillez réessayer.");
					setLoading(false);
					return;
				}

				// Synchroniser avec le backend
				await refreshUser();

				setLoading(false);

				// Rediriger vers le dashboard approprié
				const dashboardPath = role === 'organizer' ? '/dashboard-organizer' : '/dashboard';
				navigate(dashboardPath);
			} catch (err) {
				console.error("Erreur lors de l'inscription:", err);
				setError("Une erreur est survenue. Veuillez réessayer.");
				setLoading(false);
			}
		};

		completeRegistration();
	}, [clerkUser, searchParams, navigate, refreshUser, clerk, getToken]);

	if (loading)
	{
		return (
			<Container sx={{ mt: 10, textAlign: 'center' }}>
				<CircularProgress />
				<Typography variant="h6" sx={{ mt: 2 }}>
					Finalisation de votre inscription...
				</Typography>
			</Container>
		);
	}

	if (error)
	{
		return (
			<Container sx={{ mt: 10, textAlign: 'center' }}>
				<Typography variant="h6" color="error" sx={{ mt: 2 }}>
					{error}
				</Typography>
			</Container>
		);
	}

	return null;
};

export { RegisterCompletePage };

