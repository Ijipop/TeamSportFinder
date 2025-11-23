import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PeopleIcon from '@mui/icons-material/People';
import {
	Alert,
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	Chip,
	CircularProgress,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	IconButton,
	InputLabel,
	List,
	ListItem,
	ListItemText,
	MenuItem,
	Select,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import {
	createTeam,
	deleteTeam,
	getMyTournaments,
	getTeamMembers,
	getTeams,
	updateTeam,
	type Team,
	type TeamMember,
	type Tournament,
} from '../core/services/TournamentService';

const GestionEquipeOrganiser = () =>
{
	const { getToken } = useClerkAuth();
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [creating, setCreating] = useState(false);
	const [teams, setTeams] = useState<Team[]>([]);
	const [tournaments, setTournaments] = useState<Tournament[]>([]);
	const [teamsLoading, setTeamsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [teamForm, setTeamForm] = useState(
	{
		name: '',
		tournament_id: '',
		max_capacity: 10,
	});
	
	// États pour les dialogs de gestion
	const [membersDialogOpen, setMembersDialogOpen] = useState(false);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
	const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
	const [membersLoading, setMembersLoading] = useState(false);
	const [editing, setEditing] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [editForm, setEditForm] = useState({
		name: '',
		max_capacity: 10,
	});

	// Charger les tournois au montage
	useEffect(() =>
	{
		loadTournaments();
	}, []);

	const loadTournaments = async () =>
	{
		try
		{
			const token = await getToken();
			const data = await getMyTournaments(token);
			if (Array.isArray(data))
			{
				setTournaments(data);
			}
			else
			{
				setTournaments([]);
			}
		}
		catch (err: any)
		{
			console.error("Erreur lors du chargement des tournois:", err);
			setTournaments([]);
		}
	};

	const loadTeams = async () =>
	{
		setTeamsLoading(true);
		try
		{
			const token = await getToken();
			// Charger toutes les équipes
			const data = await getTeams(token);
			if (Array.isArray(data))
			{
				// Filtrer pour ne garder que les équipes de mes tournois
				const myTournamentIds = tournaments.map(t => t.id);
				const filteredTeams = data.filter(team => 
					team.tournament_id && myTournamentIds.includes(team.tournament_id)
				);
				setTeams(filteredTeams);
			}
			else
			{
				setTeams([]);
			}
		}
		catch (err: any)
		{
			console.error("Erreur lors du chargement des équipes:", err);
			setTeams([]);
		}
		finally
		{
			setTeamsLoading(false);
		}
	};

	// Recharger les équipes quand les tournois sont chargés
	useEffect(() =>
	{
		if (tournaments.length > 0)
		{
			loadTeams();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tournaments.length]);

	const handleOpenDialog = () =>
	{
		setCreateDialogOpen(true);
		setError(null);
		setSuccess(null);
		setTeamForm({ name: '', tournament_id: '', max_capacity: 10 });
	};

	const handleCloseDialog = () =>
	{
		setCreateDialogOpen(false);
		setError(null);
		setSuccess(null);
		setTeamForm({ name: '', tournament_id: '', max_capacity: 10 });
	};

	const handleCreateTeam = async () =>
	{
		// Validation
		if (!teamForm.name.trim() || !teamForm.tournament_id || !teamForm.max_capacity)
		{
			setError("Veuillez remplir tous les champs");
			return;
		}

		if (teamForm.max_capacity < 1 || teamForm.max_capacity > 50)
		{
			setError("La capacité maximale doit être entre 1 et 50");
			return;
		}

		setCreating(true);
		setError(null);
		setSuccess(null);

		try
		{
			const token = await getToken();
			const newTeam = await createTeam(
				{
					name: teamForm.name.trim(),
					tournament_id: teamForm.tournament_id,
					max_capacity: teamForm.max_capacity,
				},
				token
			);
			setSuccess(`Équipe "${newTeam.name}" créée avec succès !`);
			setCreateDialogOpen(false);
			setTeamForm({ name: '', tournament_id: '', max_capacity: 10 });
			// Recharger la liste des équipes
			await loadTeams();
		}
		catch (err: any)
		{
			setError(err.message || "Erreur lors de la création de l'équipe");
			console.error("Erreur:", err);
		}
		finally
		{
			setCreating(false);
		}
	};

	// Fonction pour ouvrir le dialog des membres
	const handleViewMembers = async (team: Team) =>
	{
		setSelectedTeam(team);
		setMembersDialogOpen(true);
		setMembersLoading(true);
		setTeamMembers([]);
		
		try
		{
			const token = await getToken();
			const members = await getTeamMembers(team.id, token);
			setTeamMembers(members);
		}
		catch (err: any)
		{
			setError(err.message || "Erreur lors du chargement des membres");
			console.error("Erreur:", err);
		}
		finally
		{
			setMembersLoading(false);
		}
	};

	// Fonction pour ouvrir le dialog de modification
	const handleEditTeam = (team: Team) =>
	{
		setSelectedTeam(team);
		setEditForm({
			name: team.name,
			max_capacity: team.max_capacity,
		});
		setEditDialogOpen(true);
		setError(null);
	};

	// Fonction pour modifier l'équipe
	const handleUpdateTeam = async () =>
	{
		if (!selectedTeam) return;

		if (!editForm.name.trim() || !editForm.max_capacity)
		{
			setError("Veuillez remplir tous les champs");
			return;
		}

		if (editForm.max_capacity < 1 || editForm.max_capacity > 50)
		{
			setError("La capacité maximale doit être entre 1 et 50");
			return;
		}

		setEditing(true);
		setError(null);
		setSuccess(null);

		try
		{
			const token = await getToken();
			const updatedTeam = await updateTeam(
				selectedTeam.id,
				{
					name: editForm.name.trim(),
					max_capacity: editForm.max_capacity,
				},
				token
			);
			setSuccess(`Équipe "${updatedTeam.name}" modifiée avec succès !`);
			setEditDialogOpen(false);
			await loadTeams();
		}
		catch (err: any)
		{
			setError(err.message || "Erreur lors de la modification de l'équipe");
			console.error("Erreur:", err);
		}
		finally
		{
			setEditing(false);
		}
	};

	// Fonction pour ouvrir le dialog de suppression
	const handleDeleteTeam = (team: Team) =>
	{
		setSelectedTeam(team);
		setDeleteDialogOpen(true);
		setError(null);
	};

	// Fonction pour supprimer l'équipe
	const handleConfirmDelete = async () =>
	{
		if (!selectedTeam) return;

		// Vérifier qu'il n'y a pas de joueurs
		if (selectedTeam.current_capacity > 0)
		{
			setError("Impossible de supprimer une équipe qui contient des joueurs");
			return;
		}

		setDeleting(true);
		setError(null);
		setSuccess(null);

		try
		{
			const token = await getToken();
			await deleteTeam(selectedTeam.id, token);
			setSuccess(`Équipe "${selectedTeam.name}" supprimée avec succès !`);
			setDeleteDialogOpen(false);
			await loadTeams();
		}
		catch (err: any)
		{
			setError(err.message || "Erreur lors de la suppression de l'équipe");
			console.error("Erreur:", err);
		}
		finally
		{
			setDeleting(false);
		}
	};

	return (
		<Container maxWidth="lg" sx={{ mt: { xs: 8, sm: 10 }, px: { xs: 2, sm: 3 }, pb: 4 }}>
			<Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
				Gestion des équipes organisateur
			</Typography>

			<Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
				<Button
					variant="contained"
					color="primary"
					onClick={handleOpenDialog}
					disabled={tournaments.length === 0}
				>
					Créer une équipe
				</Button>
			</Box>

			{success && (
				<Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
					{success}
				</Alert>
			)}

			{error && !createDialogOpen && (
				<Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
					{error}
				</Alert>
			)}

			{/* Liste des équipes */}
			<Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
				Mes équipes
			</Typography>

			{teamsLoading ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
					<CircularProgress />
				</Box>
			) : teams.length === 0 ? (
				<Alert severity="info">
					Vous n'avez pas encore créé d'équipe. Cliquez sur "Créer une équipe" pour commencer.
				</Alert>
			) : (
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: {
							xs: '1fr',
							sm: 'repeat(2, 1fr)',
							md: 'repeat(3, 1fr)',
						},
						gap: 2,
					}}
				>
					{Array.isArray(teams) && teams.map((team) => (
						<Card variant="outlined" key={team.id}>
							<CardContent>
								<Typography variant="h6" gutterBottom>
									{team.name}
								</Typography>
								{team.tournament_name && (
									<Typography variant="body2" color="text.secondary" gutterBottom>
										Tournoi: {team.tournament_name}
									</Typography>
								)}
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
							<CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
								<Tooltip title="Voir les membres">
									<IconButton
										size="small"
										color="primary"
										onClick={() => handleViewMembers(team)}
									>
										<PeopleIcon />
									</IconButton>
								</Tooltip>
								<Tooltip title="Modifier">
									<IconButton
										size="small"
										color="primary"
										onClick={() => handleEditTeam(team)}
									>
										<EditIcon />
									</IconButton>
								</Tooltip>
								<Tooltip title={team.current_capacity > 0 ? "Impossible de supprimer : équipe contient des joueurs" : "Supprimer"}>
									<span>
										<IconButton
											size="small"
											color="error"
											onClick={() => handleDeleteTeam(team)}
											disabled={team.current_capacity > 0}
										>
											<DeleteIcon />
										</IconButton>
									</span>
								</Tooltip>
							</CardActions>
						</Card>
					))}
				</Box>
			)}

			{/* Dialog pour créer une équipe */}
			<Dialog
				open={createDialogOpen}
				onClose={handleCloseDialog}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>Créer une équipe</DialogTitle>
				<DialogContent>
					{error && (
						<Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
							{error}
						</Alert>
					)}
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
						<TextField
							label="Nom de l'équipe"
							fullWidth
							value={teamForm.name}
							onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
							required
						/>
						<FormControl fullWidth required>
							<InputLabel>Tournoi parent</InputLabel>
							<Select
								value={teamForm.tournament_id}
								label="Tournoi parent"
								onChange={(e) => setTeamForm({ ...teamForm, tournament_id: e.target.value })}
							>
								{tournaments.map((tournament) => (
									<MenuItem key={tournament.id} value={tournament.id}>
										{tournament.name} - {tournament.sport} ({tournament.city})
									</MenuItem>
								))}
							</Select>
						</FormControl>
						<TextField
							label="Capacité maximale"
							type="number"
							fullWidth
							value={teamForm.max_capacity}
							onChange={(e) =>
								setTeamForm({ ...teamForm, max_capacity: parseInt(e.target.value) || 10 })
							}
							inputProps={{ min: 1, max: 50 }}
							required
							helperText="Nombre de joueurs maximum (ex: 10-15 joueurs)"
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDialog} disabled={creating}>
						Annuler
					</Button>
					<Button
						onClick={handleCreateTeam}
						variant="contained"
						color="primary"
						disabled={creating || !teamForm.name.trim() || !teamForm.tournament_id}
					>
						{creating ? <CircularProgress size={20} /> : 'Créer'}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Dialog pour voir les membres */}
			<Dialog
				open={membersDialogOpen}
				onClose={() => setMembersDialogOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>
					Membres de l'équipe: {selectedTeam?.name}
				</DialogTitle>
				<DialogContent>
					{membersLoading ? (
						<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
							<CircularProgress />
						</Box>
					) : teamMembers.length === 0 ? (
						<Alert severity="info">
							Cette équipe n'a pas encore de membres.
						</Alert>
					) : (
						<List>
							{teamMembers.map((member) => (
								<ListItem key={member.id}>
									<ListItemText
										primary={member.full_name}
										secondary={member.email}
									/>
								</ListItem>
							))}
						</List>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setMembersDialogOpen(false)}>Fermer</Button>
				</DialogActions>
			</Dialog>

			{/* Dialog pour modifier l'équipe */}
			<Dialog
				open={editDialogOpen}
				onClose={() => setEditDialogOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>Modifier l'équipe</DialogTitle>
				<DialogContent>
					{error && (
						<Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
							{error}
						</Alert>
					)}
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
						<TextField
							label="Nom de l'équipe"
							fullWidth
							value={editForm.name}
							onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
							required
						/>
						<TextField
							label="Capacité maximale"
							type="number"
							fullWidth
							value={editForm.max_capacity}
							onChange={(e) =>
								setEditForm({ ...editForm, max_capacity: parseInt(e.target.value) || 10 })
							}
							inputProps={{ min: 1, max: 50 }}
							required
							helperText="Nombre de joueurs maximum (ex: 10-15 joueurs)"
						/>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setEditDialogOpen(false)} disabled={editing}>
						Annuler
					</Button>
					<Button
						onClick={handleUpdateTeam}
						variant="contained"
						color="primary"
						disabled={editing || !editForm.name.trim()}
					>
						{editing ? <CircularProgress size={20} /> : 'Enregistrer'}
					</Button>
				</DialogActions>
			</Dialog>

			{/* Dialog de confirmation pour supprimer */}
			<Dialog
				open={deleteDialogOpen}
				onClose={() => setDeleteDialogOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>Supprimer l'équipe</DialogTitle>
				<DialogContent>
					{error && (
						<Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
							{error}
						</Alert>
					)}
					<Typography>
						Êtes-vous sûr de vouloir supprimer l'équipe "{selectedTeam?.name}" ?
					</Typography>
					{selectedTeam && selectedTeam.current_capacity > 0 && (
						<Alert severity="warning" sx={{ mt: 2 }}>
							Cette équipe contient {selectedTeam.current_capacity} joueur(s). 
							Vous ne pouvez pas la supprimer tant qu'elle contient des joueurs.
						</Alert>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
						Annuler
					</Button>
					<Button
						onClick={handleConfirmDelete}
						variant="contained"
						color="error"
						disabled={deleting || (selectedTeam?.current_capacity ?? 0) > 0}
					>
						{deleting ? <CircularProgress size={20} /> : 'Supprimer'}
					</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
};

export { GestionEquipeOrganiser };

