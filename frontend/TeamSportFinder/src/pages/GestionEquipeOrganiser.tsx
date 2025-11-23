import React from 'react'
import { Container, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const GestionEquipeOrganiser = () =>
{
	const navigate = useNavigate();
	
	return (
		<Container maxWidth="lg" sx={{ mt: { xs: 8, sm: 10 }, px: { xs: 2, sm: 3 } }}>
			<Typography variant="h4" component="h1" gutterBottom align="center">
				{"Gestion des équipes organisateur"}
			</Typography>
			
			<Button variant="contained" color="primary" onClick={() => navigate("/create-equipe-organiser")}>Créer une équipe</Button>
		</Container>
	)
}

export { GestionEquipeOrganiser };
