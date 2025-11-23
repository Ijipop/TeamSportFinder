import React from "react";
import { Container, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const DashboardOrganiserPage: React.FC = () =>
{
	const navigate = useNavigate();
	
	return (
		<Container
			maxWidth="lg"
			sx={{
				mt: { xs: 8, sm: 10 }, // Compensation pour AppBar fixe
				px: { xs: 2, sm: 3 },
			}}
		>
			<Typography variant="h1">Dashboard Organisateur</Typography>
			<Button variant="contained" color="primary" onClick={() => navigate("/gestion-equipe-organiser")}>Gestion des équipes</Button>
		</Container>
	);
};

export { DashboardOrganiserPage };
