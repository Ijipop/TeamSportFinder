import React, { useState, useEffect } from "react";
import {
	Container,
	Typography,
	Box,
	Card,
	CardContent,
	CardActions,
	Button,
	Grid,
	CircularProgress,
	Alert,
	Chip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from "@mui/material";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { getTournaments, getTournamentTeams, type Tournament, type Team } from "../core/services/TournamentService";
import { useAuth } from "../contexts/AuthContext";

const TournamentsPage: React.FC = () => {
	const { getToken } = useClerkAuth();
	const { user } = useAuth();
	const [tournaments, setTournaments] = useState<Tournament[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
	const [teams, setTeams] = useState<Team[]>([]);
	const [teamsLoading, setTeamsLoading] = useState(false);
	const [teamsDialogOpen, setTeamsDialogOpen] = useState(false);

	// Charger les tournois au montage du composant
	useEffect(() => {
		loadTournaments();
	}, []);

	const loadTournaments = async () => {
		setLoading(true);
		setError(null);
		try {
			const token = await getToken();
			const data = await getTournaments(token);
			// S'assurer que data est un tableau
			if (Array.isArray(data)) {
				setTournaments(data);
			} else {
				console.warn("Les données reçues ne sont pas un tableau:", data);
				setTournaments([]);
			}
		} catch (err: any) {
			setError(err.message || "Erreur lors du chargement des tournois");
			console.error("Erreur:", err);
			setTournaments([]); // S'assurer que tournaments reste un tableau
		} finally {
			setLoading(false);
		}
	};

	const handleViewTeams = async (tournament: Tournament) => {
		setSelectedTournament(tournament);
		setTeamsDialogOpen(true);
		setTeamsLoading(true);
		setTeams([]);

		try {
			const token = await getToken();
			const tournamentTeams = await getTournamentTeams(tournament.id, token);
			// S'assurer que tournamentTeams est un tableau
			if (Array.isArray(tournamentTeams)) {
				setTeams(tournamentTeams);
			} else {
				console.warn("Les équipes reçues ne sont pas un tableau:", tournamentTeams);
				setTeams([]);
			}
		} catch (err: any) {
			setError(err.message || "Erreur lors du chargement des équipes");
			console.error("Erreur:", err);
			setTeams([]); // S'assurer que teams reste un tableau
		} finally {
			setTeamsLoading(false);
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('fr-FR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};

	return (
		<Container
			maxWidth="lg"
			sx={{
				mt: { xs: 8, sm: 10 },
				px: { xs: 2, sm: 3 },
				pb: 4,
			}}
		>
			<Box sx={{ mb: 4 }}>
				<Typography variant="h4" component="h1" gutterBottom>
					🏆 Tournois disponibles
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Découvrez tous les tournois disponibles et leurs équipes
				</Typography>
			</Box>

			{error && (
				<Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
					{error}
				</Alert>
			)}

			{loading ? (
				<Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
					<CircularProgress />
				</Box>
			) : !Array.isArray(tournaments) || tournaments.length === 0 ? (
				<Alert severity="info">
					Aucun tournoi disponible pour le moment.
				</Alert>
			) : (
				<Grid container spacing={3}>
					{Array.isArray(tournaments) && tournaments.map((tournament) => (
						<Grid item xs={12} sm={6} md={4} key={tournament.id}>
							<Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
								<CardContent sx={{ flexGrow: 1 }}>
									<Typography variant="h6" component="h2" gutterBottom>
										{tournament.name}
									</Typography>
									
									<Box sx={{ mb: 2 }}>
										<Chip
											label={tournament.sport}
											color="primary"
											size="small"
											sx={{ mr: 1, mb: 1 }}
										/>
										<Chip
											label={tournament.city}
											variant="outlined"
											size="small"
											sx={{ mb: 1 }}
										/>
									</Box>

									<Typography variant="body2" color="text.secondary" gutterBottom>
										📅 Début: {formatDate(tournament.start_date)}
									</Typography>

									{tournament.organizer_name && (
										<Typography variant="body2" color="text.secondary" gutterBottom>
											👤 Organisateur: {tournament.organizer_name}
										</Typography>
									)}

									{tournament.team_count !== undefined && (
										<Typography variant="body2" color="text.secondary">
											👥 {tournament.team_count} équipe(s)
										</Typography>
									)}
								</CardContent>

								<CardActions>
									<Button
										size="small"
										onClick={() => handleViewTeams(tournament)}
									>
										Voir les équipes
									</Button>
								</CardActions>
							</Card>
						</Grid>
					))}
				</Grid>
			)}

			{/* Dialog pour afficher les équipes */}
			<Dialog
				open={teamsDialogOpen}
				onClose={() => setTeamsDialogOpen(false)}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle>
					Équipes du tournoi: {selectedTournament?.name}
				</DialogTitle>
				<DialogContent>
					{teamsLoading ? (
						<Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
							<CircularProgress />
						</Box>
					) : !Array.isArray(teams) || teams.length === 0 ? (
						<Alert severity="info">
							Ce tournoi n'a pas encore d'équipes.
						</Alert>
					) : (
						<Grid container spacing={2} sx={{ mt: 1 }}>
							{Array.isArray(teams) && teams.map((team) => (
								<Grid item xs={12} sm={6} key={team.id}>
									<Card variant="outlined">
										<CardContent>
											<Typography variant="h6">{team.name}</Typography>
											<Typography variant="body2" color="text.secondary">
												{team.current_capacity}/{team.max_capacity} membres
											</Typography>
											{team.available_spots !== undefined && (
												<Typography variant="body2" color="text.secondary">
													Places disponibles: {team.available_spots}
												</Typography>
											)}
											{team.is_full && (
												<Chip
													label="Complet"
													color="error"
													size="small"
													sx={{ mt: 1 }}
												/>
											)}
										</CardContent>
									</Card>
								</Grid>
							))}
						</Grid>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setTeamsDialogOpen(false)}>Fermer</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
};

export { TournamentsPage };

