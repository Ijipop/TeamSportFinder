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
} from "@mui/material";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { getMyRequests, cancelRequest, type JoinRequest } from "../core/services/JoinRequestService";

const MesDemandesPage: React.FC = () => {
	const { getToken } = useClerkAuth();
	const [requests, setRequests] = useState<JoinRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [cancellingId, setCancellingId] = useState<string | null>(null);

	useEffect(() => {
		loadMyRequests();
	}, []);

	const loadMyRequests = async () => {
		setLoading(true);
		setError(null);
		try {
			const token = await getToken();
			const data = await getMyRequests(token);
			if (Array.isArray(data)) {
				setRequests(data);
			} else {
				setRequests([]);
			}
		} catch (err: any) {
			setError(err.message || "Erreur lors du chargement de vos demandes");
			setRequests([]);
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = async (requestId: string) => {
		if (!window.confirm("Êtes-vous sûr de vouloir annuler cette demande ?")) {
			return;
		}

		setCancellingId(requestId);
		setError(null);
		try {
			const token = await getToken();
			await cancelRequest(requestId, token);
			setSuccess("Demande annulée avec succès");
			// Recharger la liste
			await loadMyRequests();
		} catch (err: any) {
			setError(err.message || "Erreur lors de l'annulation de la demande");
		} finally {
			setCancellingId(null);
		}
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
					📋 Mes demandes d'adhésion
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Suivez l'état de vos demandes pour rejoindre des équipes
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

			{loading ? (
				<Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
					<CircularProgress />
				</Box>
			) : !Array.isArray(requests) || requests.length === 0 ? (
				<Alert severity="info">
					Vous n'avez aucune demande d'adhésion pour le moment.
				</Alert>
			) : (
				<Grid container spacing={3}>
					{Array.isArray(requests) && requests.map((request) => (
						<Grid item xs={12} key={request.id}>
							<Card>
								<CardContent>
									<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
										<Box>
											<Typography variant="h6" component="h2" gutterBottom>
												{request.team.name}
											</Typography>
											<Typography variant="body2" color="text.secondary" gutterBottom>
												🏆 Tournoi: {request.tournament.name} ({request.tournament.sport})
											</Typography>
										</Box>
										{getStatusBadge(request.status)}
									</Box>

									{request.message && (
										<Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
											💬 "{request.message}"
										</Typography>
									)}

									<Typography variant="body2" color="text.secondary">
										📅 Demandée le: {formatDate(request.created_at)}
									</Typography>

									{request.updated_at !== request.created_at && (
										<Typography variant="body2" color="text.secondary">
											🔄 Mise à jour le: {formatDate(request.updated_at)}
										</Typography>
									)}
								</CardContent>

								<CardActions>
									{request.status === 'pending' && (
										<Button
											size="small"
											color="error"
											onClick={() => handleCancel(request.id)}
											disabled={cancellingId === request.id}
										>
											{cancellingId === request.id ? (
												<>
													<CircularProgress size={16} sx={{ mr: 1 }} />
													Annulation...
												</>
											) : (
												'Annuler la demande'
											)}
										</Button>
									)}
								</CardActions>
							</Card>
						</Grid>
					))}
				</Grid>
			)}
		</Container>
	);
};

export { MesDemandesPage };

