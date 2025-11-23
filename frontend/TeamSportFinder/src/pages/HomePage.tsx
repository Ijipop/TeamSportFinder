import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GroupIcon from "@mui/icons-material/Group";
import SearchIcon from "@mui/icons-material/Search";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import { Box, Button, Card, CardContent, Container, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage: React.FC = () =>
{
	const navigate = useNavigate();

	return (
		<Container
			maxWidth="lg"
			sx={{
				mt: { xs: 8, sm: 10 },
				px: { xs: 2, sm: 3 },
				pb: 6,
			}}
		>
			{/* Hero Section */}
			<Box
				sx={{
					textAlign: "center",
					py: { xs: 4, md: 6 },
					mb: 6,
				}}
			>
				<Typography
					variant="h2"
					component="h1"
					gutterBottom
					sx={{
						fontSize: { xs: "2rem", sm: "3rem", md: "4rem" },
						fontWeight: "bold",
						mb: 2,
					}}
				>
					🏆 Team Sport Finder
				</Typography>
				<Typography
					variant="h5"
					component="p"
					color="text.secondary"
					sx={{
						fontSize: { xs: "1.1rem", sm: "1.5rem" },
						mb: 4,
						maxWidth: "800px",
						mx: "auto",
					}}
				>
					La plateforme qui connecte les joueurs et les organisateurs de tournois sportifs
				</Typography>
				<Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
					<Button
						variant="contained"
						size="large"
						onClick={() => navigate("/register")}
						sx={{ px: 4, py: 1.5 }}
					>
						Commencer gratuitement
					</Button>
					<Button
						variant="outlined"
						size="large"
						onClick={() => navigate("/login")}
						sx={{ px: 4, py: 1.5 }}
					>
						Se connecter
					</Button>
				</Box>
			</Box>

			{/* Features Section */}
			<Box sx={{ mb: 6 }}>
				<Typography
					variant="h4"
					component="h2"
					align="center"
					gutterBottom
					sx={{ mb: 4, fontWeight: "bold" }}
				>
					Pourquoi choisir Team Sport Finder ?
				</Typography>
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
					<Card sx={{ height: "100%" }}>
						<CardContent sx={{ textAlign: "center", p: 3 }}>
							<EmojiEventsIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
							<Typography variant="h5" component="h3" gutterBottom>
								Organisez vos tournois
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Créez et gérez facilement vos tournois sportifs. Contrôlez les équipes, les matchs et les inscriptions en un seul endroit.
							</Typography>
						</CardContent>
					</Card>

					<Card sx={{ height: "100%" }}>
						<CardContent sx={{ textAlign: "center", p: 3 }}>
							<SearchIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
							<Typography variant="h5" component="h3" gutterBottom>
								Trouvez votre équipe
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Recherchez des équipes disponibles par ville, sport et disponibilité. Rejoignez l'équipe qui vous correspond.
							</Typography>
						</CardContent>
					</Card>

					<Card sx={{ height: "100%" }}>
						<CardContent sx={{ textAlign: "center", p: 3 }}>
							<GroupIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
							<Typography variant="h5" component="h3" gutterBottom>
								Rejoignez une communauté
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Connectez-vous avec d'autres passionnés de sport. Gérez vos demandes d'adhésion et vos équipes en toute simplicité.
							</Typography>
						</CardContent>
					</Card>
				</Box>
			</Box>

			{/* How it works */}
			<Box
				sx={{
					backgroundColor: "background.default",
					borderRadius: 2,
					p: { xs: 3, md: 5 },
					mb: 6,
				}}
			>
				<Typography
					variant="h4"
					component="h2"
					align="center"
					gutterBottom
					sx={{ mb: 4, fontWeight: "bold" }}
				>
					Comment ça marche ?
				</Typography>
				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: {
							xs: "1fr",
							md: "repeat(3, 1fr)",
						},
						gap: 4,
					}}
				>
					<Box sx={{ textAlign: "center" }}>
						<Box
							sx={{
								width: 60,
								height: 60,
								borderRadius: "50%",
								backgroundColor: "primary.main",
								color: "white",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontSize: "1.5rem",
								fontWeight: "bold",
								mx: "auto",
								mb: 2,
							}}
						>
							1
						</Box>
						<Typography variant="h6" gutterBottom>
							Créez votre compte
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Inscrivez-vous en tant que joueur ou organisateur en quelques clics.
						</Typography>
					</Box>

					<Box sx={{ textAlign: "center" }}>
						<Box
							sx={{
								width: 60,
								height: 60,
								borderRadius: "50%",
								backgroundColor: "primary.main",
								color: "white",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontSize: "1.5rem",
								fontWeight: "bold",
								mx: "auto",
								mb: 2,
							}}
						>
							2
						</Box>
						<Typography variant="h6" gutterBottom>
							Explorez les opportunités
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Parcourez les tournois disponibles ou créez votre propre tournoi et formez des équipes.
						</Typography>
					</Box>

					<Box sx={{ textAlign: "center" }}>
						<Box
							sx={{
								width: 60,
								height: 60,
								borderRadius: "50%",
								backgroundColor: "primary.main",
								color: "white",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontSize: "1.5rem",
								fontWeight: "bold",
								mx: "auto",
								mb: 2,
							}}
						>
							3
						</Box>
						<Typography variant="h6" gutterBottom>
							Participez et jouez
						</Typography>
						<Typography variant="body2" color="text.secondary">
							Rejoignez une équipe, participez aux matchs et vivez votre passion du sport !
						</Typography>
					</Box>
				</Box>
			</Box>

			{/* CTA Section */}
			<Box
				sx={{
					textAlign: "center",
					py: 4,
					backgroundColor: "primary.main",
					color: "white",
					borderRadius: 2,
				}}
			>
				<SportsSoccerIcon sx={{ fontSize: 60, mb: 2 }} />
				<Typography variant="h4" component="h2" gutterBottom>
					Prêt à commencer ?
				</Typography>
				<Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
					Rejoignez la communauté Team Sport Finder dès aujourd'hui
				</Typography>
				<Button
					variant="contained"
					size="large"
					onClick={() => navigate("/register")}
					sx={{
						backgroundColor: "white",
						color: "primary.main",
						px: 4,
						py: 1.5,
						"&:hover": {
							backgroundColor: "grey.100",
						},
					}}
				>
					S'inscrire maintenant
				</Button>
			</Box>
		</Container>
	);
};

export { HomePage };

