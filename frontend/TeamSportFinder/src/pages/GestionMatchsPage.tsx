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
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	TextField,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import {
	getMyTournaments,
	getTournamentTeams,
	type Tournament,
	type Team,
} from "../core/services/TournamentService";
import {
	getMyMatches,
	createMatch,
	updateMatch,
	deleteMatch,
	type Match,
	type MatchCreateData,
	type MatchUpdateData,
} from "../core/services/MatchService";

const GestionMatchsPage: React.FC = () => {
	const { getToken } = useClerkAuth();
	const [matches, setMatches] = useState<Match[]>([]);
	const [tournaments, setTournaments] = useState<Tournament[]>([]);
	const [teams, setTeams] = useState<Team[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	
	// Dialog pour créer/modifier un match
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingMatch, setEditingMatch] = useState<Match | null>(null);
	const [selectedTournament, setSelectedTournament] = useState<string>("");
	const [processing, setProcessing] = useState(false);
	const [matchForm, setMatchForm] = useState<MatchCreateData>({
		team_a_id: "",
		team_b_id: "",
		date: "",
		location: "",
	});

	useEffect(() => {
		loadData();
	}, []);

	useEffect(() => {
		if (selectedTournament) {
			loadTeams(selectedTournament);
		} else {
			setTeams([]);
		}
	}, [selectedTournament]);

	const loadData = async () => {
		setLoading(true);
		setError(null);
		try {
			const token = await getToken();
			const [matchesData, tournamentsData] = await Promise.all([
				getMyMatches(undefined, token),
				getMyTournaments(token),
			]);
			
			if (Array.isArray(matchesData)) {
				setMatches(matchesData);
			} else {
				setMatches([]);
			}
			
			if (Array.isArray(tournamentsData)) {
				setTournaments(tournamentsData);
			}
		} catch (err: any) {
			setError(err.message || "Erreur lors du chargement des données");
		} finally {
			setLoading(false);
		}
	};

	const loadTeams = async (tournamentId: string) => {
		try {
			const token = await getToken();
			const data = await getTournamentTeams(tournamentId, token);
			if (Array.isArray(data)) {
				setTeams(data);
			}
		} catch (err: any) {
			console.error("Erreur lors du chargement des équipes:", err);
		}
	};

	const handleOpenCreateDialog = () => {
		setEditingMatch(null);
		setMatchForm({
			team_a_id: "",
			team_b_id: "",
			date: "",
			location: "",
		});
		setSelectedTournament("");
		setDialogOpen(true);
	};

	const handleOpenEditDialog = (match: Match) => {
		setEditingMatch(match);
		// Trouver le tournoi du match
		const tournament = tournaments.find(t => t.id === match.tournament_id);
		if (tournament) {
			setSelectedTournament(tournament.id);
			loadTeams(tournament.id);
		}
		setMatchForm({
			team_a_id: match.team_a.id,
			team_b_id: match.team_b.id,
			date: new Date(match.date).toISOString().slice(0, 16), // Format datetime-local
			location: match.location,
			score_a: match.score_a || undefined,
			score_b: match.score_b || undefined,
		});
		setDialogOpen(true);
	};

	const handleSubmit = async () => {
		// Validation
		if (!matchForm.team_a_id || !matchForm.team_b_id || !matchForm.date || !matchForm.location) {
			setError("Veuillez remplir tous les champs obligatoires");
			return;
		}

		if (matchForm.team_a_id === matchForm.team_b_id) {
			setError("Les deux équipes doivent être différentes");
			return;
		}

		setProcessing(true);
		setError(null);
		setSuccess(null);

		try {
			const token = await getToken();
			
			if (editingMatch) {
				// Modifier le match
				const updateData: MatchUpdateData = {
					date: matchForm.date,
					location: matchForm.location,
					score_a: matchForm.score_a || null,
					score_b: matchForm.score_b || null,
				};
				await updateMatch(editingMatch.id, updateData, token);
				setSuccess("Match modifié avec succès !");
			} else {
				// Créer le match
				await createMatch(matchForm, token);
				setSuccess("Match créé avec succès !");
			}
			
			setDialogOpen(false);
			await loadData();
		} catch (err: any) {
			setError(err.message || "Erreur lors de l'enregistrement du match");
		} finally {
			setProcessing(false);
		}
	};

	const handleDelete = async (matchId: string) => {
		if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce match ?")) {
			return;
		}

		setProcessing(true);
		setError(null);
		try {
			const token = await getToken();
			await deleteMatch(matchId, token);
			setSuccess("Match supprimé avec succès !");
			await loadData();
		} catch (err: any) {
			setError(err.message || "Erreur lors de la suppression du match");
		} finally {
			setProcessing(false);
		}
	};

	const formatDateTime = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleString('fr-FR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	const isUpcoming = (dateString: string) => {
		return new Date(dateString) >= new Date();
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
						⚽ Gestion des matchs
					</Typography>
					<Typography variant="body1" color="text.secondary">
						Créez et gérez les matchs de vos tournois
					</Typography>
				</Box>
				<Button
					variant="contained"
					startIcon={<AddIcon />}
					onClick={handleOpenCreateDialog}
				>
					Créer un match
				</Button>
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

			{loading ? (
				<Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
					<CircularProgress />
				</Box>
			) : !Array.isArray(matches) || matches.length === 0 ? (
				<Alert severity="info">
					Vous n'avez créé aucun match pour le moment.
				</Alert>
			) : (
				<Grid container spacing={3}>
					{Array.isArray(matches) && matches.map((match) => (
						<Grid item xs={12} sm={6} md={4} key={match.id}>
							<Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
								<CardContent sx={{ flexGrow: 1 }}>
									<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
										<Typography variant="h6" component="h2" gutterBottom>
											{match.team_a.name} vs {match.team_b.name}
										</Typography>
										{isUpcoming(match.date) ? (
											<Chip label="À venir" color="primary" size="small" />
										) : (
											<Chip label="Terminé" color="default" size="small" />
										)}
									</Box>

									{match.tournament_name && (
										<Typography variant="body2" color="text.secondary" gutterBottom>
											🏆 {match.tournament_name}
										</Typography>
									)}

									<Typography variant="body2" color="text.secondary" gutterBottom>
										📅 {formatDateTime(match.date)}
									</Typography>

									<Typography variant="body2" color="text.secondary" gutterBottom>
										📍 {match.location}
									</Typography>

									{(match.score_a !== null && match.score_a !== undefined) && 
									 (match.score_b !== null && match.score_b !== undefined) && (
										<Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
											<Typography variant="h5" align="center">
												{match.score_a} - {match.score_b}
											</Typography>
										</Box>
									)}
								</CardContent>

								<CardActions>
									<IconButton
										size="small"
										color="primary"
										onClick={() => handleOpenEditDialog(match)}
									>
										<EditIcon />
									</IconButton>
									<IconButton
										size="small"
										color="error"
										onClick={() => handleDelete(match.id)}
										disabled={processing}
									>
										<DeleteIcon />
									</IconButton>
								</CardActions>
							</Card>
						</Grid>
					))}
				</Grid>
			)}

			{/* Dialog pour créer/modifier un match */}
			<Dialog
				open={dialogOpen}
				onClose={() => !processing && setDialogOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>
					{editingMatch ? "Modifier le match" : "Créer un nouveau match"}
				</DialogTitle>
				<DialogContent>
					<Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
						{!editingMatch && (
							<FormControl fullWidth required>
								<InputLabel>Tournoi</InputLabel>
								<Select
									value={selectedTournament}
									label="Tournoi"
									onChange={(e) => setSelectedTournament(e.target.value)}
									disabled={processing}
								>
									{Array.isArray(tournaments) && tournaments.map((tournament) => (
										<MenuItem key={tournament.id} value={tournament.id}>
											{tournament.name} ({tournament.sport})
										</MenuItem>
									))}
								</Select>
							</FormControl>
						)}

						{!editingMatch && (
							<FormControl fullWidth required>
								<InputLabel>Équipe A</InputLabel>
								<Select
									value={matchForm.team_a_id}
									label="Équipe A"
									onChange={(e) => setMatchForm({ ...matchForm, team_a_id: e.target.value })}
									disabled={processing || !selectedTournament}
								>
									{Array.isArray(teams) && teams.map((team) => (
										<MenuItem key={team.id} value={team.id}>
											{team.name}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						)}

						{!editingMatch && (
							<FormControl fullWidth required>
								<InputLabel>Équipe B</InputLabel>
								<Select
									value={matchForm.team_b_id}
									label="Équipe B"
									onChange={(e) => setMatchForm({ ...matchForm, team_b_id: e.target.value })}
									disabled={processing || !selectedTournament}
								>
									{Array.isArray(teams) && teams
										.filter(team => team.id !== matchForm.team_a_id)
										.map((team) => (
											<MenuItem key={team.id} value={team.id}>
												{team.name}
											</MenuItem>
										))}
								</Select>
							</FormControl>
						)}

						<TextField
							label="Date et heure"
							type="datetime-local"
							value={matchForm.date}
							onChange={(e) => setMatchForm({ ...matchForm, date: e.target.value })}
							fullWidth
							required
							disabled={processing}
							InputLabelProps={{ shrink: true }}
							inputProps={{
								min: new Date().toISOString().slice(0, 16)
							}}
						/>

						<TextField
							label="Lieu"
							value={matchForm.location}
							onChange={(e) => setMatchForm({ ...matchForm, location: e.target.value })}
							fullWidth
							required
							disabled={processing}
						/>

						<TextField
							label="Score équipe A (optionnel)"
							type="number"
							value={matchForm.score_a || ""}
							onChange={(e) => setMatchForm({ ...matchForm, score_a: e.target.value ? parseInt(e.target.value) : undefined })}
							fullWidth
							disabled={processing}
							inputProps={{ min: 0 }}
						/>

						<TextField
							label="Score équipe B (optionnel)"
							type="number"
							value={matchForm.score_b || ""}
							onChange={(e) => setMatchForm({ ...matchForm, score_b: e.target.value ? parseInt(e.target.value) : undefined })}
							fullWidth
							disabled={processing}
							inputProps={{ min: 0 }}
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => setDialogOpen(false)}
						disabled={processing}
					>
						Annuler
					</Button>
					<Button
						onClick={handleSubmit}
						variant="contained"
						disabled={processing}
						startIcon={processing ? <CircularProgress size={20} /> : <AddIcon />}
					>
						{processing ? "Enregistrement..." : editingMatch ? "Modifier" : "Créer"}
					</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
};

export { GestionMatchsPage };

