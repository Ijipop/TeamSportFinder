import MailIcon from "@mui/icons-material/Mail";
import SearchIcon from "@mui/icons-material/Search";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import { Box, Button, Card, CardActions, CardContent, Container, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";

const DashboardPlayerPage: React.FC = () =>
{
	const navigate = useNavigate();
	
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
					👤 Dashboard Joueur
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Accédez à toutes vos fonctionnalités
				</Typography>
			</Box>

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
				<Card sx={{ height: "100%" }}>
					<CardContent>
						<Typography variant="h6" gutterBottom>
							🔍 Rechercher une équipe
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Trouvez et rejoignez une équipe pour participer à un tournoi
						</Typography>
					</CardContent>
					<CardActions>
						<Button
							variant="contained"
							startIcon={<SearchIcon />}
							onClick={() => navigate("/teams/search")}
							fullWidth
						>
							Rechercher
						</Button>
					</CardActions>
				</Card>

				<Card sx={{ height: "100%" }}>
					<CardContent>
						<Typography variant="h6" gutterBottom>
							📋 Mes demandes
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Suivez l'état de vos demandes pour rejoindre des équipes
						</Typography>
					</CardContent>
					<CardActions>
						<Button
							variant="contained"
							startIcon={<MailIcon />}
							onClick={() => navigate("/my-requests")}
							fullWidth
						>
							Voir mes demandes
						</Button>
					</CardActions>
				</Card>

				<Card sx={{ height: "100%" }}>
					<CardContent>
						<Typography variant="h6" gutterBottom>
							⚽ Mes matchs
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Consultez tous vos matchs à venir et passés
						</Typography>
					</CardContent>
					<CardActions>
						<Button
							variant="contained"
							startIcon={<SportsSoccerIcon />}
							onClick={() => navigate("/my-matches")}
							fullWidth
						>
							Voir mes matchs
						</Button>
					</CardActions>
				</Card>
			</Box>
		</Container>
	);
};

export { DashboardPlayerPage };

