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

	// Vérifier immédiatement si l'utilisateur a déjà un rôle
	useEffect(() =>
	{
		// Si l'utilisateur a déjà un rôle, rediriger immédiatement (ne pas attendre isLoading)
		if (user && user.role)
		{
			const dashboardPath = user.role === 'organizer' ? '/dashboard-organizer' : '/dashboard';
			navigate(dashboardPath, { replace: true });
			return;
		}

		// Si le chargement est en cours et qu'on n'a pas encore vérifié, attendre
		if (isLoading && !hasCheckedRef.current)
		{
			return;
		}

		// Si l'utilisateur n'est pas chargé après le chargement, rediriger vers dashboard-redirect
		// pour laisser DashboardRedirectPage gérer la vérification (évite les appels multiples)
		if (!user && clerkUser && !hasCheckedRef.current)
		{
			hasCheckedRef.current = true;
			// Rediriger immédiatement vers dashboard-redirect sans délai
			navigate('/dashboard-redirect', { replace: true });
		}
	}, [user, clerkUser, isLoading, navigate]);

	// Afficher un loader pendant la vérification initiale
	if (isLoading || (hasCheckedRef.current && !user))
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

			// Synchroniser avec le backend
			await refreshUser();

			// Attendre un peu pour que l'état soit mis à jour
			await new Promise(resolve => setTimeout(resolve, 100));

			// Rediriger vers le dashboard approprié en utilisant le rôle du backend
			const dashboardPath = finalRole === 'organizer' ? '/dashboard-organizer' : '/dashboard';
			console.log("Redirection vers:", dashboardPath);
			navigate(dashboardPath, { replace: true });
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

