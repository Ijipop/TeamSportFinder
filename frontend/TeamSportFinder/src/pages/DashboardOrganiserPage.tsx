import React, { useState, useEffect } from "react";
import {
	Container,
	Typography,
	Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
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
			<Typography variant="h1">Dashboard Organisateur</Typography>
			<Button variant="contained" color="primary" onClick={() => navigate("/gestion-equipe-organiser")}>Gestion des équipes</Button>
		</Container>
	);
};

export { DashboardOrganiserPage };
