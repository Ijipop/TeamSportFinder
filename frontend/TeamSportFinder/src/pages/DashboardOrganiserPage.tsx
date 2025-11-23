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
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MailIcon from "@mui/icons-material/Mail";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GroupsIcon from "@mui/icons-material/Groups";
import PeopleIcon from "@mui/icons-material/People";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { getMyTournaments, createTournament, getTeams, type Tournament, type Team } from "../core/services/TournamentService";
import { getReceivedRequests, acceptRequest, rejectRequest, type JoinRequest } from "../core/services/JoinRequestService";

const DashboardOrganiserPage: React.FC = () =>
{
	const { getToken } = useClerkAuth();
	const navigate = useNavigate();
	const [tournaments, setTournaments] = useState<Tournament[]>([]);
	const [teams, setTeams] = useState<Team[]>([]);
	const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [statsLoading, setStatsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [creating, setCreating] = useState(false);
	const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
	const [tournamentForm, setTournamentForm] = useState({
		name: "",
		sport: "",
		city: "",
		start_date: "",
	});

	// Statistiques
	const [stats, setStats] = useState({
		totalTournaments: 0,
		totalTeams: 0,
		totalPlayers: 0,
		pendingRequests: 0,
	});

	useEffect(() => {
		loadMyTournaments();
		loadStatistics();
	}, []);

	useEffect(() => {
		// Recalculer les stats quand les données changent
		calculateStats();
	}, [tournaments, teams, joinRequests]);

	const loadMyTournaments = async () =>
	{
		setLoading(true);
		setError(null);
		
		try
		{
			const token = await getToken();
			const data = await getMyTournaments(token);
			// S'assurer que data est un tableau
			if (Array.isArray(data))
			{
				setTournaments(data);
			}
			else
			{
				console.warn("Les données reçues ne sont pas un tableau:", data);
				setTournaments([]);
			}
		}
		catch (err: any)
		{
			setError(err.message || "Erreur lors du chargement de vos tournois");
			console.error("Erreur:", err);
			setTournaments([]); // S'assurer que tournaments reste un tableau
		}
		finally
		{
			setLoading(false);
		}
	};

	const loadStatistics = async () => {
		setStatsLoading(true);
		try {
			const token = await getToken();
			
			// Charger toutes les données en parallèle
			const [tournamentsData, teamsData, requestsData] = await Promise.all([
				getMyTournaments(token).catch(() => []),
				getTeams(token).catch(() => []),
				getReceivedRequests(token).catch(() => []),
			]);

			if (Array.isArray(tournamentsData)) {
				setTournaments(tournamentsData);
			}
			if (Array.isArray(teamsData)) {
				// Filtrer pour ne garder que les équipes de mes tournois
				const tournamentIds = Array.isArray(tournamentsData) 
					? tournamentsData.map(t => t.id) 
					: [];
				const myTeams = teamsData.filter((team: Team) => 
					team.tournament_id && tournamentIds.includes(team.tournament_id)
				);
				setTeams(myTeams);
			}
			if (Array.isArray(requestsData)) {
				setJoinRequests(requestsData);
			}
		} catch (err: any) {
			console.error("Erreur lors du chargement des statistiques:", err);
		} finally {
			setStatsLoading(false);
		}
	};

	const calculateStats = () => {
		const totalTournaments = tournaments.length;
		const totalTeams = teams.length;
		
		// Calculer le nombre total de joueurs dans toutes les équipes
		const totalPlayers = teams.reduce((sum, team) => sum + (team.current_capacity || 0), 0);
		
		// Compter les demandes en attente
		const pendingRequests = joinRequests.filter(req => req.status === 'pending').length;

		setStats({
			totalTournaments,
			totalTeams,
			totalPlayers,
			pendingRequests,
		});
	};

	const formatDate = (dateString: string) =>
	{
		const date = new Date(dateString);
		return date.toLocaleDateString('fr-FR',
		{
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};

	const formatDateTime = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('fr-FR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const handleAcceptRequest = async (requestId: string) => {
		setProcessingRequestId(requestId);
		setError(null);
		try {
			const token = await getToken();
			await acceptRequest(requestId, token);
			setSuccess("Demande acceptée avec succès !");
			await loadStatistics();
		} catch (err: any) {
			setError(err.message || "Erreur lors de l'acceptation de la demande");
		} finally {
			setProcessingRequestId(null);
		}
	};

	const handleRejectRequest = async (requestId: string) => {
		if (!window.confirm("Êtes-vous sûr de vouloir refuser cette demande ?")) {
			return;
		}
		setProcessingRequestId(requestId);
		setError(null);
		try {
			const token = await getToken();
			await rejectRequest(requestId, token);
			setSuccess("Demande refusée");
			await loadStatistics();
		} catch (err: any) {
			setError(err.message || "Erreur lors du refus de la demande");
		} finally {
			setProcessingRequestId(null);
		}
	};

	const getPendingRequests = () => {
		return joinRequests.filter(req => req.status === 'pending').slice(0, 5); // Limiter à 5 pour l'affichage
	};

	const handleCreateTournament = async () =>
	{
		// Validation
		if (!tournamentForm.name.trim() || !tournamentForm.sport.trim() || !tournamentForm.city.trim() || !tournamentForm.start_date)
		{
			setError("Veuillez remplir tous les champs");
			
			return;
		}

		setCreating(true);
		setError(null);
		setSuccess(null);

		try
		{
			const token = await getToken();
			const newTournament = await createTournament(tournamentForm, token);
			setSuccess(`Tournoi "${newTournament.name}" créé avec succès !`);
			setCreateDialogOpen(false);
			setTournamentForm({ name: "", sport: "", city: "", start_date: "" });
			// Recharger la liste des tournois et les statistiques
			await Promise.all([
				loadMyTournaments(),
				loadStatistics()
			]);
		}
		catch (err: any)
		{
			setError(err.message || "Erreur lors de la création du tournoi");
			console.error("Erreur:", err);
		}
		finally
		{
			setCreating(false);
		}
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
			<Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
				<Box>
					<Typography variant="h4" component="h1" gutterBottom>
						📊 Dashboard Organisateur
					</Typography>
					<Typography variant="body1" color="text.secondary">
						Gérez vos tournois et équipes
					</Typography>
				</Box>
				<Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={() => setCreateDialogOpen(true)}
					>
						Créer un tournoi
					</Button>
					<Button
						variant="contained"
						color="secondary"
						startIcon={<MailIcon />}
						onClick={() => navigate("/organizer/requests")}
					>
						Gérer les demandes
					</Button>
					<Button
						variant="contained"
						color="success"
						startIcon={<SportsSoccerIcon />}
						onClick={() => navigate("/organizer/matches")}
					>
						Gérer les matchs
					</Button>
					<Button
						variant="outlined"
						onClick={() => navigate("/tournaments")}
					>
						Voir tous les tournois
					</Button>
					<Button
						variant="outlined"
						onClick={() => navigate("/gestion-equipe-organiser")}
					>
						Gérer mes équipes
					</Button>
				</Box>
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

			{/* Cartes de statistiques */}
			<Box
				sx={{
					display: 'grid',
					gridTemplateColumns: {
						xs: '1fr',
						sm: 'repeat(2, 1fr)',
						md: 'repeat(4, 1fr)',
					},
					gap: 3,
					mb: 4,
				}}
			>
				<Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
					<CardContent>
						<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
							<Box>
								<Typography variant="h4" component="div" fontWeight="bold">
									{statsLoading ? '...' : stats.totalTournaments}
								</Typography>
								<Typography variant="body2" sx={{ opacity: 0.9 }}>
									Tournois
								</Typography>
							</Box>
							<EmojiEventsIcon sx={{ fontSize: 48, opacity: 0.8 }} />
						</Box>
					</CardContent>
				</Card>

				<Card sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
					<CardContent>
						<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
							<Box>
								<Typography variant="h4" component="div" fontWeight="bold">
									{statsLoading ? '...' : stats.totalTeams}
								</Typography>
								<Typography variant="body2" sx={{ opacity: 0.9 }}>
									Équipes
								</Typography>
							</Box>
							<GroupsIcon sx={{ fontSize: 48, opacity: 0.8 }} />
						</Box>
					</CardContent>
				</Card>

				<Card sx={{ bgcolor: 'success.main', color: 'success.contrastText' }}>
					<CardContent>
						<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
							<Box>
								<Typography variant="h4" component="div" fontWeight="bold">
									{statsLoading ? '...' : stats.totalPlayers}
								</Typography>
								<Typography variant="body2" sx={{ opacity: 0.9 }}>
									Joueurs
								</Typography>
							</Box>
							<PeopleIcon sx={{ fontSize: 48, opacity: 0.8 }} />
						</Box>
					</CardContent>
				</Card>

				<Card sx={{ bgcolor: 'warning.main', color: 'warning.contrastText' }}>
					<CardContent>
						<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
							<Box>
								<Typography variant="h4" component="div" fontWeight="bold">
									{statsLoading ? '...' : stats.pendingRequests}
								</Typography>
								<Typography variant="body2" sx={{ opacity: 0.9 }}>
									Demandes en attente
								</Typography>
							</Box>
							<PendingActionsIcon sx={{ fontSize: 48, opacity: 0.8 }} />
						</Box>
					</CardContent>
				</Card>
			</Box>

			{/* Section des demandes d'adhésion en attente */}
			{getPendingRequests().length > 0 && (
				<Box sx={{ mb: 4 }}>
					<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
						<Typography variant="h5" gutterBottom>
							📬 Demandes d'adhésion en attente ({getPendingRequests().length})
						</Typography>
						<Button
							variant="outlined"
							startIcon={<MailIcon />}
							onClick={() => navigate("/organizer/requests")}
						>
							Voir toutes les demandes
						</Button>
					</Box>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
						{getPendingRequests().map((request) => (
							<Card key={request.id} sx={{ borderLeft: 4, borderColor: 'warning.main' }}>
								<CardContent>
									<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
										<Box sx={{ flex: 1 }}>
											<Typography variant="h6" component="h2" gutterBottom>
												👤 {request.player.full_name}
											</Typography>
											<Typography variant="body2" color="text.secondary" gutterBottom>
												📧 {request.player.email}
											</Typography>
											<Typography variant="body2" color="text.secondary" gutterBottom>
												🏆 Équipe: <strong>{request.team.name}</strong> - {request.tournament.name} ({request.tournament.sport})
											</Typography>
											{request.message && (
												<Box sx={{ mt: 1, p: 1.5, bgcolor: 'background.default', borderRadius: 1 }}>
													<Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
														💬 "{request.message}"
													</Typography>
												</Box>
											)}
											<Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
												📅 Demandée le: {formatDateTime(request.created_at)}
											</Typography>
										</Box>
										<Chip label="En attente" color="warning" size="small" sx={{ ml: 2 }} />
									</Box>
									<CardActions>
										<Button
											size="small"
											variant="contained"
											color="success"
											onClick={() => handleAcceptRequest(request.id)}
											disabled={processingRequestId === request.id}
										>
											{processingRequestId === request.id ? <CircularProgress size={16} /> : "✓ Accepter"}
										</Button>
										<Button
											size="small"
											variant="outlined"
											color="error"
											onClick={() => handleRejectRequest(request.id)}
											disabled={processingRequestId === request.id}
										>
											✗ Refuser
										</Button>
									</CardActions>
								</CardContent>
							</Card>
						))}
					</Box>
				</Box>
			)}

			<Typography variant="h5" gutterBottom sx={{ mt: 3, mb: 2 }}>
				Mes tournois ({tournaments.length})
			</Typography>

			{loading ? (
				<Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
					<CircularProgress />
				</Box>
			) : !Array.isArray(tournaments) || tournaments.length === 0 ? (
				<Alert severity="info">
					Vous n'avez pas encore créé de tournoi. 
					<Button onClick={() => navigate("/tournaments")} sx={{ ml: 2 }}>
						Voir les tournois disponibles
					</Button>
				</Alert>
			) : (
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: {
							xs: "1fr",
							sm: "repeat(2, 1fr)",
							md: "repeat(3, 1fr)",
						},
						gap: 3,
					}}
				>
					{Array.isArray(tournaments) && tournaments.map((tournament) => (
						<Card key={tournament.id} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
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

								{tournament.team_count !== undefined && (
									<Typography variant="body2" color="text.secondary">
										👥 {tournament.team_count} équipe(s)
									</Typography>
								)}
							</CardContent>

							<CardActions>
								<Button
									size="small"
									onClick={() => navigate(`/tournaments`)}
								>
									Voir les détails
								</Button>
							</CardActions>
						</Card>
					))}
				</Box>
			)}

			{/* Dialog pour créer un tournoi */}
			<Dialog
				open={createDialogOpen}
				onClose={() => !creating && setCreateDialogOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>Créer un nouveau tournoi</DialogTitle>
				<DialogContent>
					<Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
						<TextField
							label="Nom du tournoi"
							value={tournamentForm.name}
							onChange={(e) => setTournamentForm({ ...tournamentForm, name: e.target.value })}
							fullWidth
							required
							disabled={creating}
						/>
						<FormControl fullWidth required disabled={creating}>
							<InputLabel>Sport</InputLabel>
							<Select
								value={tournamentForm.sport}
								label="Sport"
								onChange={(e) => setTournamentForm({ ...tournamentForm, sport: e.target.value })}
							>
								<MenuItem value="Badminton">Badminton</MenuItem>
								<MenuItem value="Baseball">Baseball</MenuItem>
								<MenuItem value="Basketball">Basketball</MenuItem>
								<MenuItem value="Boxe">Boxe</MenuItem>
								<MenuItem value="Course à pied">Course à pied</MenuItem>
								<MenuItem value="Curling">Curling</MenuItem>
								<MenuItem value="Cyclisme">Cyclisme</MenuItem>
								<MenuItem value="Football">Football</MenuItem>
								<MenuItem value="Football américain">Football américain</MenuItem>
								<MenuItem value="Golf">Golf</MenuItem>
								<MenuItem value="Hockey sur glace">Hockey sur glace</MenuItem>
								<MenuItem value="Lacrosse">Lacrosse</MenuItem>
								<MenuItem value="Natation">Natation</MenuItem>
								<MenuItem value="Patinage">Patinage</MenuItem>
								<MenuItem value="Rugby">Rugby</MenuItem>
								<MenuItem value="Ski">Ski</MenuItem>
								<MenuItem value="Snowboard">Snowboard</MenuItem>
								<MenuItem value="Soccer">Soccer</MenuItem>
								<MenuItem value="Tennis">Tennis</MenuItem>
								<MenuItem value="Volleyball">Volleyball</MenuItem>
								<MenuItem value="Water-polo">Water-polo</MenuItem>
							</Select>
						</FormControl>
						<TextField
							label="Ville"
							value={tournamentForm.city}
							onChange={(e) => setTournamentForm({ ...tournamentForm, city: e.target.value })}
							fullWidth
							required
							disabled={creating}
						/>
						<TextField
							label="Date de début"
							type="date"
							value={tournamentForm.start_date}
							onChange={(e) => setTournamentForm({ ...tournamentForm, start_date: e.target.value })}
							fullWidth
							required
							disabled={creating}
							InputLabelProps={{ shrink: true }}
							inputProps={{
								min: new Date().toISOString().split('T')[0] // Date minimale = aujourd'hui
							}}
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => setCreateDialogOpen(false)}
						disabled={creating}
					>
						Annuler
					</Button>
					<Button
						onClick={handleCreateTournament}
						variant="contained"
						disabled={creating}
						startIcon={creating ? <CircularProgress size={20} /> : <AddIcon />}
					>
						{creating ? "Création..." : "Créer"}
					</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
};

export { DashboardOrganiserPage };

