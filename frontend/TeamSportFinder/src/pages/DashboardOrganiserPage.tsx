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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MailIcon from "@mui/icons-material/Mail";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { getMyTournaments, createTournament, type Tournament } from "../core/services/TournamentService";

const DashboardOrganiserPage: React.FC = () =>
{
	const { getToken } = useClerkAuth();
	const navigate = useNavigate();
	const [tournaments, setTournaments] = useState<Tournament[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [creating, setCreating] = useState(false);
	const [tournamentForm, setTournamentForm] = useState({
		name: "",
		sport: "",
		city: "",
		start_date: "",
	});

	useEffect(() => {
		loadMyTournaments();
	}, []);

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
			// Recharger la liste des tournois
			await loadMyTournaments();
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
						<TextField
							label="Sport"
							value={tournamentForm.sport}
							onChange={(e) => setTournamentForm({ ...tournamentForm, sport: e.target.value })}
							fullWidth
							required
							disabled={creating}
							placeholder="Ex: Football, Basketball, Tennis..."
						/>
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
