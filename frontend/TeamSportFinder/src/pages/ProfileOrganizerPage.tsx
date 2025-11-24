import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	CircularProgress,
	Container,
	Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getReceivedRequests } from '../core/services/JoinRequestService';
import { getMyTournaments, getTeams, type Tournament } from '../core/services/TournamentService';

const ProfileOrganizerPage = () =>
{
	const { getToken } = useClerkAuth();
	const { user: clerkUser } = useUser();
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [tournaments, setTournaments] = useState<Tournament[]>([]);
	const [totalTeams, setTotalTeams] = useState(0);
	const [pendingRequests, setPendingRequests] = useState(0);

	// Récupérer l'email réel depuis Clerk
	const realEmail = clerkUser?.primaryEmailAddress?.emailAddress || '';

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () =>
	{
		setLoading(true);
		setError(null);
		try {
			const token = await getToken();
			
			// Charger les tournois
			const tournamentsData = await getMyTournaments(token);
			if (Array.isArray(tournamentsData))
			{
				setTournaments(tournamentsData);
			}
			
			// Charger les équipes
			const teams = await getTeams(token);
			const myTournamentIds = Array.isArray(tournamentsData) ? tournamentsData.map(t => t.id) : [];
			const myTeams = Array.isArray(teams) ? teams.filter(team => 
				team.tournament_id && myTournamentIds.includes(team.tournament_id)
			) : [];
			setTotalTeams(myTeams.length);
			
			// Charger les demandes en attente
			const requests = await getReceivedRequests(token);
			const pending = Array.isArray(requests) ? requests.filter(req => req.status === 'pending') : [];
			setPendingRequests(pending.length);
		}
		catch (err: any)
		{
			console.error("Erreur lors du chargement des données:", err);
			setError(err.message || "Erreur lors du chargement du profil");
		}
		finally
		{
			setLoading(false);
		}
	};

	if (loading)
	{
		return (
			<Container maxWidth="md" sx={{ mt: { xs: 8, sm: 10 }, px: { xs: 2, sm: 3 }, pb: 4 }}>
				<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
					<CircularProgress />
				</Box>
			</Container>
		);
	}

	return (
		<Container maxWidth="md" sx={{ mt: { xs: 8, sm: 10 }, px: { xs: 2, sm: 3 }, pb: 4 }}>
			<Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
				👤 Mon profil organisateur
			</Typography>

			{error && (
				<Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
					{error}
				</Alert>
			)}

			{/* Informations de base */}
			<Card sx={{ mb: 3 }}>
				<CardContent>
					<Typography variant="h6" gutterBottom>
						Informations personnelles
					</Typography>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
						<Box>
							<Typography variant="body2" color="text.secondary">
								Nom complet
							</Typography>
							<Typography variant="body1">
								{clerkUser?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Non disponible'}
							</Typography>
						</Box>
						<Box>
							<Typography variant="body2" color="text.secondary">
								Email
							</Typography>
							<Typography variant="body1">
								{realEmail || user?.email || 'Non disponible'}
							</Typography>
						</Box>
						<Box>
							<Typography variant="body2" color="text.secondary">
								Rôle
							</Typography>
							<Typography variant="body1">
								Organisateur
							</Typography>
						</Box>
					</Box>
				</CardContent>
			</Card>

			{/* Statistiques */}
			<Card>
				<CardContent>
					<Typography variant="h6" gutterBottom>
						Mes statistiques
					</Typography>
					<Box
						sx={{
							display: 'grid',
							gridTemplateColumns: {
								xs: '1fr',
								sm: 'repeat(3, 1fr)',
							},
							gap: 2,
							mt: 2,
						}}
					>
						<Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
							<Typography variant="h4" color="primary">
								{tournaments.length}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Tournois créés
							</Typography>
						</Box>
						<Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
							<Typography variant="h4" color="primary">
								{totalTeams}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Équipes créées
							</Typography>
						</Box>
						<Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
							<Typography variant="h4" color="primary">
								{pendingRequests}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Demandes en attente
							</Typography>
						</Box>
					</Box>
				</CardContent>
			</Card>

			{/* Bouton de déconnexion */}
			<Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
				<Button
					variant="outlined"
					color="error"
					onClick={async () =>
					{
						await logout();
						localStorage.removeItem("auth_token");
						navigate("/");
					}}
				>
					Déconnexion
				</Button>
			</Box>
		</Container>
	);
};

export { ProfileOrganizerPage };

