import React from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ProfilePlayerPage } from "./ProfilePlayerPage";
import { ProfileOrganizerPage } from "./ProfileOrganizerPage";

const ProfilePage: React.FC = () =>
{
	const { user } = useAuth();
	
	// Rediriger vers la bonne page selon le rôle
	if (user?.role === 'player') {
		return <ProfilePlayerPage />;
	} else if (user?.role === 'organizer') {
		return <ProfileOrganizerPage />;
	}
	
	// Par défaut, afficher un message si pas de rôle
	return (
		<Container
			maxWidth="lg"
			sx={{
				mt: { xs: 8, sm: 10 },
				px: { xs: 2, sm: 3 },
			}}
		>
			<Typography variant="h4" component="h1" gutterBottom>
				Profil
			</Typography>
			<Typography variant="body1" color="text.secondary">
				Veuillez sélectionner un rôle pour accéder à votre profil.
			</Typography>
		</Container>
	);
};

export { ProfilePage };
