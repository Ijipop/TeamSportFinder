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
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Tabs,
	Tab,
} from "@mui/material";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { getMyMatches, type Match } from "../core/services/MatchService";
import { useAuth } from "../contexts/AuthContext";

const MesMatchsPage: React.FC = () => {
	const { getToken } = useClerkAuth();
	const { user } = useAuth();
	const [matches, setMatches] = useState<Match[]>([]);
	const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
	const [tabValue, setTabValue] = useState(0);

	useEffect(() => {
		loadMatches();
	}, []);

	useEffect(() => {
		filterMatches();
	}, [filter, matches]);

	const loadMatches = async () => {
		setLoading(true);
		setError(null);
		try {
			const token = await getToken();
			const data = await getMyMatches(undefined, token);
			if (Array.isArray(data)) {
				setMatches(data);
			} else {
				setMatches([]);
			}
		} catch (err: any) {
			setError(err.message || "Erreur lors du chargement de vos matchs");
			setMatches([]);
		} finally {
			setLoading(false);
		}
	};

	const filterMatches = () => {
		if (filter === 'all') {
			setFilteredMatches(matches);
		} else {
			const now = new Date();
			if (filter === 'upcoming') {
				setFilteredMatches(matches.filter(m => new Date(m.date) >= now));
			} else {
				setFilteredMatches(matches.filter(m => new Date(m.date) < now));
			}
		}
	};

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
		if (newValue === 0) {
			setFilter('all');
		} else if (newValue === 1) {
			setFilter('upcoming');
		} else {
			setFilter('past');
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

	const getMyTeam = (match: Match) => {
		// Pour un joueur, on ne peut pas déterminer directement son équipe depuis le match
		// On affiche les deux équipes et le joueur saura laquelle est la sienne
		return null;
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
					⚽ Mes matchs
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Consultez tous vos matchs à venir et passés
				</Typography>
			</Box>

			{error && (
				<Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
					{error}
				</Alert>
			)}

			{/* Tabs pour filtrer */}
			<Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
				<Tabs value={tabValue} onChange={handleTabChange}>
					<Tab label="Tous les matchs" />
					<Tab label="À venir" />
					<Tab label="Passés" />
				</Tabs>
			</Box>

			{loading ? (
				<Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
					<CircularProgress />
				</Box>
			) : !Array.isArray(filteredMatches) || filteredMatches.length === 0 ? (
				<Alert severity="info">
					{filter === 'all' 
						? "Vous n'avez aucun match pour le moment."
						: filter === 'upcoming'
						? "Vous n'avez aucun match à venir."
						: "Vous n'avez aucun match passé."}
				</Alert>
			) : (
				<Grid container spacing={3}>
					{Array.isArray(filteredMatches) && filteredMatches.map((match) => (
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
							</Card>
						</Grid>
					))}
				</Grid>
			)}
		</Container>
	);
};

export { MesMatchsPage };

