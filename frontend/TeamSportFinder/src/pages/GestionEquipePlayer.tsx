import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import SearchIcon from '@mui/icons-material/Search';
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
	InputLabel,
	List,
	ListItem,
	ListItemText,
	MenuItem,
	Select,
	TextField,
	Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import {
	getTeam,
	getTeamMembers,
	getTournaments,
	searchTeams,
	type Team,
	type TeamMember,
	type Tournament,
} from '../core/services/TournamentService';

const GestionEquipePlayer = () =>
{
	const { getToken } = useClerkAuth();
	const [teams, setTeams] = useState<Team[]>([]);
	const [tournaments, setTournaments] = useState<Tournament[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Filtres
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedCity, setSelectedCity] = useState<string>('all');
	const [selectedSport, setSelectedSport] = useState<string>('all');
	const [onlyAvailable, setOnlyAvailable] = useState(true);

	// Dialog pour voir les détails d'une équipe
	const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
	const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
	const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
	const [membersLoading, setMembersLoading] = useState(false);
	const [teamDetailsLoading, setTeamDetailsLoading] = useState(false);

	useEffect(() =>
	{
		loadTournaments();
		loadTeams();
	}, []);

	const loadTournaments = async () =>
	{
		try
		{
			const token = await getToken();
			const data = await getTournaments(token);
			if (Array.isArray(data))
			{
				setTournaments(data);
			}
		}
		catch (err: any)
		{
			console.error("Erreur lors du chargement des tournois:", err);
		}
	};

	const loadTeams = async () =>
	{
		setLoading(true);
		setError(null);
		try
		{
			const token = await getToken();
			// Récupérer toutes les équipes disponibles
			const data = await searchTeams(undefined, onlyAvailable, undefined, token);
			
			// Filtrer côté client par ville et sport
			let filtered = Array.isArray(data) ? data : [];
			
			if (selectedCity !== 'all')
			{
				filtered = filtered.filter(team =>
				{
					const tournament = tournaments.find(t => t.id === team.tournament_id);
					return tournament?.city === selectedCity;
				});
			}
			
			if (selectedSport !== 'all')
			{
				filtered = filtered.filter(team =>
				{
					const tournament = tournaments.find(t => t.id === team.tournament_id);
					return tournament?.sport === selectedSport;
				});
			}
			
			if (searchTerm)
			{
				filtered = filtered.filter(team => 
					team.name.toLowerCase().includes(searchTerm.toLowerCase())
				);
			}
			
			setTeams(filtered);
		}
		catch (err: any)
		{
			setError(err.message || "Erreur lors de la recherche d'équipes");
			setTeams([]);
		}
		finally
		{
			setLoading(false);
		}
	};

	const handleSearch = () =>
	{
		loadTeams();
	};

	const handleViewDetails = async (team: Team) =>
	{
		setSelectedTeam(team);
		setDetailsDialogOpen(true);
		setTeamDetailsLoading(true);
		setMembersLoading(true);
		setTeamMembers([]);

		try
		{
			const token = await getToken();
			// Récupérer les détails complets de l'équipe
			const teamDetails = await getTeam(team.id, token);
			setSelectedTeam(teamDetails);
			
			// Récupérer les membres
			const members = await getTeamMembers(team.id, token);
			setTeamMembers(members);
		}
		catch (err: any)
		{
			setError(err.message || "Erreur lors du chargement des détails");
			console.error("Erreur:", err);
		}
		finally
		{
			setTeamDetailsLoading(false);
			setMembersLoading(false);
		}
	};

	// Obtenir les villes uniques
	const getUniqueCities = (): string[] =>
	{
		const cities = new Set<string>();
		tournaments.forEach(tournament =>
		{
			if (tournament.city)
			{
				cities.add(tournament.city);
			}
		});
		return Array.from(cities).sort();
	};

	// Obtenir les sports uniques
	const getUniqueSports = (): string[] =>
	{
		const sports = new Set<string>();
		tournaments.forEach(tournament =>
		{
			if (tournament.sport)
			{
				sports.add(tournament.sport);
			}
		});
		
		return Array.from(sports).sort();
	};

	// Obtenir le tournoi d'une équipe
	const getTeamTournament = (team: Team): Tournament | undefined =>
	{
		return tournaments.find(t => t.id === team.tournament_id);
	};

	return (
		<Container maxWidth="lg" sx={{ mt: { xs: 8, sm: 10 }, px: { xs: 2, sm: 3 }, pb: 4 }}>
			<Box sx={{ mb: 4 }}>
				<Typography variant="h4" component="h1" gutterBottom>
					🔍 Rechercher des équipes disponibles
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Trouvez des équipes qui correspondent à vos critères
				</Typography>
			</Box>

			{error && (
				<Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
					{error}
				</Alert>
			)}

			{/* Barre de recherche et filtres */}
			<Card sx={{ mb: 4, p: 2 }}>
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: {
							xs: '1fr',
							md: '2fr 1.5fr 1.5fr 1fr 1fr',
						},
						gap: 2,
						alignItems: 'center',
					}}
				>
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
					<FormControl fullWidth>
						<InputLabel>Ville</InputLabel>
						<Select
							value={selectedCity}
							label="Ville"
							onChange={(e) => setSelectedCity(e.target.value)}
						>
							<MenuItem value="all">Toutes les villes</MenuItem>
							{getUniqueCities().map((city) => (
								<MenuItem key={city} value={city}>
									{city}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<FormControl fullWidth>
						<InputLabel>Sport</InputLabel>
						<Select
							value={selectedSport}
							label="Sport"
							onChange={(e) => setSelectedSport(e.target.value)}
						>
							<MenuItem value="all">Tous les sports</MenuItem>
							{getUniqueSports().map((sport) => (
								<MenuItem key={sport} value={sport}>
									{sport}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<FormControl fullWidth>
						<InputLabel>Disponibilité</InputLabel>
						<Select
							value={onlyAvailable ? "available" : "all"}
							label="Disponibilité"
							onChange={(e) => setOnlyAvailable(e.target.value === "available")}
						>
							<MenuItem value="available">Places disponibles uniquement</MenuItem>
							<MenuItem value="all">Toutes les équipes</MenuItem>
						</Select>
					</FormControl>
					<Button
						fullWidth
						variant="contained"
						startIcon={<SearchIcon />}
						onClick={handleSearch}
						disabled={loading}
					>
						Rechercher
					</Button>
				</Box>
			</Card>

			{loading ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
					<CircularProgress />
				</Box>
			) : teams.length === 0 ? (
				<Alert severity="info">
					Aucune équipe trouvée. Essayez de modifier vos critères de recherche.
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
						gap: 3,
					}}
				>
					{teams.map((team) => {
						const tournament = getTeamTournament(team);
						return (
							<Card key={team.id} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
								<CardContent sx={{ flexGrow: 1 }}>
									<Typography variant="h6" component="h2" gutterBottom>
										{team.name}
									</Typography>

									{tournament && (
										<>
											<Typography variant="body2" color="text.secondary" gutterBottom>
												🏆 {tournament.name}
											</Typography>
											<Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
												<Chip
													label={tournament.sport}
													color="primary"
													size="small"
												/>
												<Chip
													label={tournament.city}
													color="secondary"
													size="small"
												/>
											</Box>
										</>
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
										onClick={() => handleViewDetails(team)}
										fullWidth
									>
										Voir les détails
									</Button>
								</CardActions>
							</Card>
						);
					})}
				</Box>
			)}

			{/* Dialog pour voir les détails d'une équipe */}
			<Dialog
				open={detailsDialogOpen}
				onClose={() => setDetailsDialogOpen(false)}
				maxWidth="md"
				fullWidth
			>
				<DialogTitle>
					Détails de l'équipe: {selectedTeam?.name}
				</DialogTitle>
				<DialogContent>
					{teamDetailsLoading ? (
						<Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
							<CircularProgress />
						</Box>
					) : selectedTeam ? (
						<Box>
							{/* Informations générales */}
							<Typography variant="h6" gutterBottom sx={{ mt: 1 }}>
								Informations générales
							</Typography>
							<Typography variant="body1" gutterBottom>
								<strong>Nom:</strong> {selectedTeam.name}
							</Typography>
							
							{selectedTeam.tournament_name && (
								<Typography variant="body1" gutterBottom>
									<strong>Tournoi:</strong> {selectedTeam.tournament_name}
								</Typography>
							)}
							
							{selectedTeam.tournament_sport && (
								<Typography variant="body1" gutterBottom>
									<strong>Sport:</strong> {selectedTeam.tournament_sport}
								</Typography>
							)}
							
							{(() => {
								const tournament = getTeamTournament(selectedTeam);
								return tournament && (
									<Typography variant="body1" gutterBottom>
										<strong>Ville:</strong> {tournament.city}
									</Typography>
								);
							})()}

							{/* Places disponibles */}
							<Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
								Places disponibles
							</Typography>
							<Typography variant="body1" gutterBottom>
								<strong>{selectedTeam.current_capacity}/{selectedTeam.max_capacity}</strong> membres
							</Typography>
							{selectedTeam.available_spots !== undefined && (
								<Typography variant="body1" color="success.main" gutterBottom>
									✅ <strong>{selectedTeam.available_spots}</strong> place(s) disponible(s)
								</Typography>
							)}

							{/* Niveau requis - Note: cette information n'est pas dans le modèle actuel */}
							{/* Si vous ajoutez un champ "required_level" ou similaire dans le futur, vous pouvez l'afficher ici */}

							{/* Liste des membres */}
							<Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
								Membres actuels ({teamMembers.length})
							</Typography>
							{membersLoading ? (
								<Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
									<CircularProgress size={24} />
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
						</Box>
					) : null}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDetailsDialogOpen(false)}>Fermer</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
};

export { GestionEquipePlayer };

