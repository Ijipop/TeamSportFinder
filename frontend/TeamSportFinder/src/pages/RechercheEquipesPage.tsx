import React, { useState, useEffect } from "react";
import {
	Container,
	Typography,
	Box,
	Card,
	CardContent,
	CardActions,
	Button,
	CircularProgress,
	Alert,
	Chip,
	Grid,
	TextField,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import {
	searchTeams,
	getTournaments,
	type Team,
	type Tournament,
} from "../core/services/TournamentService";
import {
	createJoinRequest,
	type JoinRequest
} from "../core/services/JoinRequestService";

const RechercheEquipesPage: React.FC = () => {
	const { getToken } = useClerkAuth();
	const [teams, setTeams] = useState<Team[]>([]);
	const [tournaments, setTournaments] = useState<Tournament[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	
	// Filtres
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedTournament, setSelectedTournament] = useState<string>("all");
	const [onlyAvailable, setOnlyAvailable] = useState(true);
	
	// Dialog pour rejoindre une équipe
	const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
	const [joinDialogOpen, setJoinDialogOpen] = useState(false);
	const [joinMessage, setJoinMessage] = useState("");
	const [joining, setJoining] = useState(false);

	useEffect(() => {
		loadTournaments();
		loadTeams();
	}, []);

	const loadTournaments = async () => {
		try {
			const token = await getToken();
			const data = await getTournaments(token);
			if (Array.isArray(data)) {
				setTournaments(data);
			}
		} catch (err: any) {
			console.error("Erreur lors du chargement des tournois:", err);
		}
	};

	const loadTeams = async () => {
		setLoading(true);
		setError(null);
		try {
			const token = await getToken();
			const tournamentId = selectedTournament !== "all" ? selectedTournament : undefined;
			const data = await searchTeams(searchTerm || undefined, onlyAvailable, tournamentId, token);
			if (Array.isArray(data)) {
				setTeams(data);
			} else {
				setTeams([]);
			}
		} catch (err: any) {
			setError(err.message || "Erreur lors de la recherche d'équipes");
			setTeams([]);
		} finally {
			setLoading(false);
		}
	};

	const handleSearch = () => {
		loadTeams();
	};

	const handleJoinTeam = (team: Team) => {
		setSelectedTeam(team);
		setJoinMessage("");
		setJoinDialogOpen(true);
	};

	const handleSubmitJoinRequest = async () => {
		if (!selectedTeam) return;

		setJoining(true);
		setError(null);
		try {
			const token = await getToken();
			await createJoinRequest(
				selectedTeam.id,
				joinMessage || undefined,
				token
			);
			setSuccess("Demande d'adhésion envoyée avec succès !");
			setJoinDialogOpen(false);
			setJoinMessage("");
			// Recharger la liste pour mettre à jour les statuts
			await loadTeams();
		} catch (err: any) {
			setError(err.message || "Erreur lors de l'envoi de la demande");
		} finally {
			setJoining(false);
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
					🔍 Rechercher une équipe
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Trouvez et rejoignez une équipe pour participer à un tournoi
				</Typography>
			</Box>

			{error && (
				<Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
					{error}
				</Alert>
			)}

			{success && (
				<Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
					{success}
				</Alert>
			)}

			{/* Barre de recherche et filtres */}
			<Card sx={{ mb: 4, p: 2 }}>
				<Grid container spacing={2} alignItems="center">
					<Grid item xs={12} md={4}>
						<TextField
							fullWidth
							label="Rechercher une équipe"
							placeholder="Nom de l'équipe..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							onKeyPress={(e) => {
								if (e.key === 'Enter') {
									handleSearch();
								}
							}}
						/>
					</Grid>
					<Grid item xs={12} md={3}>
						<FormControl fullWidth>
							<InputLabel>Tournoi</InputLabel>
							<Select
								value={selectedTournament}
								label="Tournoi"
								onChange={(e) => setSelectedTournament(e.target.value)}
							>
								<MenuItem value="all">Tous les tournois</MenuItem>
								{Array.isArray(tournaments) && tournaments.map((tournament) => (
									<MenuItem key={tournament.id} value={tournament.id}>
										{tournament.name} ({tournament.sport})
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Grid>
					<Grid item xs={12} md={3}>
						<FormControl fullWidth>
							<InputLabel>Disponibilité</InputLabel>
							<Select
								value={onlyAvailable ? "available" : "all"}
								label="Disponibilité"
								onChange={(e) => setOnlyAvailable(e.target.value === "available")}
							>
								<MenuItem value="available">Équipes disponibles uniquement</MenuItem>
								<MenuItem value="all">Toutes les équipes</MenuItem>
							</Select>
						</FormControl>
					</Grid>
					<Grid item xs={12} md={2}>
						<Button
							fullWidth
							variant="contained"
							startIcon={<SearchIcon />}
							onClick={handleSearch}
							disabled={loading}
						>
							Rechercher
						</Button>
					</Grid>
				</Grid>
			</Card>

			{loading ? (
				<Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
					<CircularProgress />
				</Box>
			) : !Array.isArray(teams) || teams.length === 0 ? (
				<Alert severity="info">
					Aucune équipe trouvée. Essayez de modifier vos critères de recherche.
				</Alert>
			) : (
				<Grid container spacing={3}>
					{Array.isArray(teams) && teams.map((team) => (
						<Grid item xs={12} sm={6} md={4} key={team.id}>
							<Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
								<CardContent sx={{ flexGrow: 1 }}>
									<Typography variant="h6" component="h2" gutterBottom>
										{team.name}
									</Typography>

									{team.tournament_name && (
										<Typography variant="body2" color="text.secondary" gutterBottom>
											🏆 {team.tournament_name}
										</Typography>
									)}

									{team.tournament_sport && (
										<Chip
											label={team.tournament_sport}
											color="primary"
											size="small"
											sx={{ mb: 1 }}
										/>
									)}

									<Typography variant="body2" color="text.secondary" gutterBottom>
										👥 {team.current_capacity}/{team.max_capacity} membres
									</Typography>

									{team.available_spots !== undefined && team.available_spots > 0 && (
										<Typography variant="body2" color="success.main" gutterBottom>
											✅ {team.available_spots} place(s) disponible(s)
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

								<CardActions>
									<Button
										size="small"
										variant="contained"
										onClick={() => handleJoinTeam(team)}
										disabled={team.is_full}
										fullWidth
									>
										{team.is_full ? "Équipe complète" : "Rejoindre l'équipe"}
									</Button>
								</CardActions>
							</Card>
						</Grid>
					))}
				</Grid>
			)}

			{/* Dialog pour rejoindre une équipe */}
			<Dialog
				open={joinDialogOpen}
				onClose={() => setJoinDialogOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>
					Rejoindre l'équipe: {selectedTeam?.name}
				</DialogTitle>
				<DialogContent>
					{selectedTeam && (
						<Box>
							<Typography variant="body2" color="text.secondary" gutterBottom>
								🏆 Tournoi: {selectedTeam.tournament_name} ({selectedTeam.tournament_sport})
							</Typography>
							<Typography variant="body2" color="text.secondary" gutterBottom>
								👥 {selectedTeam.current_capacity}/{selectedTeam.max_capacity} membres
							</Typography>

							<TextField
								fullWidth
								multiline
								rows={4}
								label="Message de motivation (optionnel)"
								placeholder="Pourquoi souhaitez-vous rejoindre cette équipe ?"
								value={joinMessage}
								onChange={(e) => setJoinMessage(e.target.value)}
								sx={{ mt: 2 }}
							/>
						</Box>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setJoinDialogOpen(false)}>
						Annuler
					</Button>
					<Button
						variant="contained"
						onClick={handleSubmitJoinRequest}
						disabled={joining}
					>
						{joining ? (
							<>
								<CircularProgress size={16} sx={{ mr: 1 }} />
								Envoi...
							</>
						) : (
							"Envoyer la demande"
						)}
					</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
};

export { RechercheEquipesPage };

