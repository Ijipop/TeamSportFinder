// Page pour sélectionner le rôle lors de la connexion si l'utilisateur n'en a pas encore
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { Box, Button, CircularProgress, Container, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";
import { createUserInBackend } from "../core/services/ApiService";

const SelectRolePage: React.FC = () => {
	const { user: clerkUser } = useUser();
	const { getToken } = useClerkAuth();
	const navigate = useNavigate();
	const { refreshUser, user, isLoading } = useAuth();
	const [role, setRole] = useState<'player' | 'organizer'>('player');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const hasCheckedRef = useRef(false);
	const pendingRoleRef = useRef<'player' | 'organizer' | null>(null);

	// Vérifier immédiatement si l'utilisateur a déjà un rôle
	useEffect(() =>
	{
		// Si on a un rôle en attente et que l'utilisateur a maintenant ce rôle, rediriger
		if (pendingRoleRef.current && user && user.role === pendingRoleRef.current)
		{
			pendingRoleRef.current = null;
			const dashboardPath = user.role === 'organizer' ? '/dashboard-organizer' : '/dashboard';
			const currentPath = window.location.pathname;
			if (currentPath !== dashboardPath)
			{
				navigate(dashboardPath, { replace: true });
			}
			return;
		}

		// Si l'utilisateur a déjà un rôle (sans être en attente), rediriger immédiatement
		if (user && user.role && !pendingRoleRef.current)
		{
			const dashboardPath = user.role === 'organizer' ? '/dashboard-organizer' : '/dashboard';
			const currentPath = window.location.pathname;
			if (currentPath !== dashboardPath)
			{
				navigate(dashboardPath, { replace: true });
			}
			return;
		}

		// Si le chargement est en cours et qu'on n'a pas encore vérifié, attendre
		if (isLoading && !hasCheckedRef.current)
		{
			return;
		}

		// Si l'utilisateur n'est pas chargé après le chargement et qu'on a un clerkUser,
		// cela signifie qu'il n'a pas encore de compte dans le backend
		// On reste sur cette page pour qu'il sélectionne son rôle
		// Ne pas rediriger vers dashboard-redirect pour éviter les boucles
		if (!user && clerkUser && !hasCheckedRef.current)
		{
			hasCheckedRef.current = true;
			// Ne rien faire, rester sur cette page
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, clerkUser, isLoading]); // navigate est stable et n'a pas besoin d'être dans les dépendances

	// Afficher un loader seulement pendant la vérification initiale
	// Si on a un clerkUser mais pas de user, c'est normal (nouvel utilisateur), on affiche le formulaire
	if (isLoading && !hasCheckedRef.current)
	{
		return (
			<Container sx={{ mt: 10, textAlign: 'center' }}>
				<CircularProgress />
				<Typography variant="h6" sx={{ mt: 2 }}>
					Vérification...
				</Typography>
			</Container>
		);
	}

	// Si on n'a pas de clerkUser, on ne peut pas continuer
	if (!clerkUser)
	{
		return (
			<Container sx={{ mt: 10, textAlign: 'center' }}>
				<Typography variant="h6" sx={{ mt: 2 }}>
					Vous devez être connecté pour choisir votre rôle.
				</Typography>
			</Container>
		);
	}

	const handleSubmit = async () =>
	{
		if (!clerkUser) {
			setError("Erreur: utilisateur non connecté");
			return;
		}

		setLoading(true);
		setError(null);

		try
		{
			// Mettre à jour les métadonnées Clerk avec le rôle
			await clerkUser.update({
				unsafeMetadata: {
					role: role
				}
			});

			// Créer l'utilisateur dans la base de données backend avec le rôle choisi
			const token = await getToken();
			const fullName = clerkUser.firstName && clerkUser.lastName 
				? `${clerkUser.firstName} ${clerkUser.lastName}`
				: clerkUser.fullName || undefined;
			
			const backendUser = await createUserInBackend(token || null, fullName, role);
			
			if (!backendUser)
			{
				setError("Erreur lors de la création du compte. Veuillez réessayer.");
				setLoading(false);
				return;
			}

			// Utiliser le rôle retourné par le backend (plus fiable)
			const finalRole = backendUser.role || role;
			
			console.log("Rôle choisi:", role);
			console.log("Rôle retourné par le backend:", backendUser.role);
			console.log("Rôle final utilisé:", finalRole);

			// Marquer le rôle comme en attente pour que le useEffect redirige quand il sera mis à jour
			pendingRoleRef.current = finalRole;

			// Synchroniser avec le backend
			await refreshUser();

			// Le useEffect écoutera les changements de user et redirigera automatiquement
			// Mais si après 1 seconde l'utilisateur n'est toujours pas mis à jour, rediriger quand même
			setTimeout(() => {
				if (pendingRoleRef.current === finalRole) {
					// L'utilisateur n'a pas encore été mis à jour, rediriger quand même
					pendingRoleRef.current = null;
					const dashboardPath = finalRole === 'organizer' ? '/dashboard-organizer' : '/dashboard';
					navigate(dashboardPath, { replace: true });
				}
			}, 1000);
		}
		catch (err)
		{
			console.error("Erreur lors de la sélection du rôle:", err);
			setError("Une erreur est survenue. Veuillez réessayer.");
			setLoading(false);
		}
	};

	return (
		<Container
			maxWidth="sm"
			sx={{
				mt: { xs: 8, sm: 10 },
				px: { xs: 2, sm: 3 },
			}}
		>
			<Box sx={{ mb: 4, textAlign: 'center' }}>
				<Typography variant="h4" gutterBottom>
					Choisissez votre rôle
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Pour continuer, veuillez sélectionner votre rôle
				</Typography>
			</Box>

			<Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
				<FormControl component="fieldset" fullWidth>
					<FormLabel component="legend">Je suis un :</FormLabel>
					<RadioGroup
						row
						value={role}
						onChange={(e) => setRole(e.target.value as 'player' | 'organizer')}
						sx={{ justifyContent: 'center', mt: 2 }}
					>
						<FormControlLabel value="player" control={<Radio />} label="Joueur" />
						<FormControlLabel value="organizer" control={<Radio />} label="Organisateur" />
					</RadioGroup>
				</FormControl>
			</Box>

			{error && (
				<Box sx={{ mb: 2, textAlign: 'center' }}>
					<Typography variant="body2" color="error">
						{error}
					</Typography>
				</Box>
			)}

			<Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
				<Button
					variant="contained"
					onClick={handleSubmit}
					disabled={loading}
					size="large"
				>
					{loading ? "Traitement..." : "Continuer"}
				</Button>
			</Box>
		</Container>
	);
};

export { SelectRolePage };

