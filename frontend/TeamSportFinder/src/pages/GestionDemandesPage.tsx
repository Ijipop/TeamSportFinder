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
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import {
	getReceivedRequests,
	acceptRequest,
	rejectRequest,
	type JoinRequest
} from "../core/services/JoinRequestService";

const GestionDemandesPage: React.FC = () => {
	const { getToken } = useClerkAuth();
	const [requests, setRequests] = useState<JoinRequest[]>([]);
	const [filteredRequests, setFilteredRequests] = useState<JoinRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>("all");
	const [processingId, setProcessingId] = useState<string | null>(null);
	const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);
	const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

	useEffect(() => {
		loadReceivedRequests();
	}, []);

	useEffect(() => {
		filterRequests();
	}, [selectedTeamFilter, requests]);

	const loadReceivedRequests = async () => {
		setLoading(true);
		setError(null);
		try {
			const token = await getToken();
			const data = await getReceivedRequests(token);
			if (Array.isArray(data)) {
				setRequests(data);
			} else {
				setRequests([]);
			}
		} catch (err: any) {
			setError(err.message || "Erreur lors du chargement des demandes");
			setRequests([]);
		} finally {
			setLoading(false);
		}
	};

	const filterRequests = () => {
		if (selectedTeamFilter === "all") {
			setFilteredRequests(requests);
		} else {
			setFilteredRequests(requests.filter(req => req.team.id === selectedTeamFilter));
		}
	};

	const getUniqueTeams = () => {
		const teamsMap = new Map<string, { id: string; name: string }>();
		requests.forEach(req => {
			if (!teamsMap.has(req.team.id)) {
				teamsMap.set(req.team.id, { id: req.team.id, name: req.team.name });
			}
		});
		return Array.from(teamsMap.values());
	};

	const handleAccept = async (requestId: string) => {
		setProcessingId(requestId);
		setError(null);
		try {
			const token = await getToken();
			await acceptRequest(requestId, token);
			setSuccess("Demande acceptée avec succès. Le joueur a été ajouté à l'équipe.");
			await loadReceivedRequests();
		} catch (err: any) {
			setError(err.message || "Erreur lors de l'acceptation de la demande");
		} finally {
			setProcessingId(null);
		}
	};

	const handleReject = async (requestId: string) => {
		if (!window.confirm("Êtes-vous sûr de vouloir refuser cette demande ?")) {
			return;
		}

		setProcessingId(requestId);
		setError(null);
		try {
			const token = await getToken();
			await rejectRequest(requestId, token);
			setSuccess("Demande refusée avec succès");
			await loadReceivedRequests();
		} catch (err: any) {
			setError(err.message || "Erreur lors du refus de la demande");
		} finally {
			setProcessingId(null);
		}
	};

	const handleViewDetails = (request: JoinRequest) => {
		setSelectedRequest(request);
		setDetailsDialogOpen(true);
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'pending':
				return <Chip label="En attente" color="warning" size="small" />;
			case 'accepted':
				return <Chip label="Acceptée" color="success" size="small" />;
			case 'rejected':
				return <Chip label="Refusée" color="error" size="small" />;
			default:
				return <Chip label={status} size="small" />;
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('fr-FR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
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
					📬 Demandes d'adhésion reçues
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Gérez les demandes des joueurs pour rejoindre vos équipes
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

			{/* Filtre par équipe */}
			<Box sx={{ mb: 3 }}>
				<FormControl fullWidth sx={{ maxWidth: 300 }}>
					<InputLabel>Filtrer par équipe</InputLabel>
					<Select
						value={selectedTeamFilter}
						label="Filtrer par équipe"
						onChange={(e) => setSelectedTeamFilter(e.target.value)}
					>
						<MenuItem value="all">Toutes les équipes</MenuItem>
						{getUniqueTeams().map((team) => (
							<MenuItem key={team.id} value={team.id}>
								{team.name}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</Box>

			{loading ? (
				<Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
					<CircularProgress />
				</Box>
			) : !Array.isArray(filteredRequests) || filteredRequests.length === 0 ? (
				<Alert severity="info">
					{selectedTeamFilter === "all"
						? "Aucune demande reçue pour le moment."
						: "Aucune demande pour cette équipe."}
				</Alert>
			) : (
				<Grid container spacing={3}>
					{Array.isArray(filteredRequests) && filteredRequests.map((request) => (
						<Grid item xs={12} key={request.id}>
							<Card>
								<CardContent>
									<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
										<Box sx={{ flex: 1 }}>
											<Typography variant="h6" component="h2" gutterBottom>
												👤 {request.player.full_name}
											</Typography>
											<Typography variant="body2" color="text.secondary" gutterBottom>
												📧 {request.player.email}
											</Typography>
											<Typography variant="body2" color="text.secondary" gutterBottom>
												🏆 Équipe: {request.team.name} - {request.tournament.name} ({request.tournament.sport})
											</Typography>
										</Box>
										{getStatusBadge(request.status)}
									</Box>

									{request.message && (
										<Box sx={{ mb: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
											<Typography variant="body2" sx={{ fontStyle: 'italic' }}>
												💬 "{request.message}"
											</Typography>
										</Box>
									)}

									<Typography variant="body2" color="text.secondary">
										📅 Demandée le: {formatDate(request.created_at)}
									</Typography>
								</CardContent>

								<CardActions>
									<Button
										size="small"
										onClick={() => handleViewDetails(request)}
									>
										Voir détails
									</Button>
									{request.status === 'pending' && (
										<>
											<Button
												size="small"
												color="success"
												variant="contained"
												onClick={() => handleAccept(request.id)}
												disabled={processingId === request.id}
											>
												{processingId === request.id ? (
													<>
														<CircularProgress size={16} sx={{ mr: 1 }} />
														Traitement...
													</>
												) : (
													'Accepter'
												)}
											</Button>
											<Button
												size="small"
												color="error"
												variant="outlined"
												onClick={() => handleReject(request.id)}
												disabled={processingId === request.id}
											>
												Refuser
											</Button>
										</>
									)}
								</CardActions>
							</Card>
						</Grid>
					))}
				</Grid>
			)}

			{/* Dialog détails */}
			<Dialog
				open={detailsDialogOpen}
				onClose={() => setDetailsDialogOpen(false)}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>
					Détails de la demande
				</DialogTitle>
				<DialogContent>
					{selectedRequest && (
						<Box>
							<Typography variant="h6" gutterBottom>
								Joueur
							</Typography>
							<Typography variant="body2" color="text.secondary" gutterBottom>
								Nom: {selectedRequest.player.full_name}
							</Typography>
							<Typography variant="body2" color="text.secondary" gutterBottom>
								Email: {selectedRequest.player.email}
							</Typography>

							<Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
								Équipe
							</Typography>
							<Typography variant="body2" color="text.secondary" gutterBottom>
								{selectedRequest.team.name}
							</Typography>

							<Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
								Tournoi
							</Typography>
							<Typography variant="body2" color="text.secondary" gutterBottom>
								{selectedRequest.tournament.name} ({selectedRequest.tournament.sport})
							</Typography>

							{selectedRequest.message && (
								<>
									<Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
										Message
									</Typography>
									<Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
										"{selectedRequest.message}"
									</Typography>
								</>
							)}

							<Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
								Statut
							</Typography>
							{getStatusBadge(selectedRequest.status)}

							<Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
								Dates
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Demandée le: {formatDate(selectedRequest.created_at)}
							</Typography>
							{selectedRequest.updated_at !== selectedRequest.created_at && (
								<Typography variant="body2" color="text.secondary">
									Mise à jour le: {formatDate(selectedRequest.updated_at)}
								</Typography>
							)}
						</Box>
					)}
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDetailsDialogOpen(false)}>Fermer</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
};

export { GestionDemandesPage };

