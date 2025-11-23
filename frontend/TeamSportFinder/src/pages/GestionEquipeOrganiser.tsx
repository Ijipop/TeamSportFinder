import React from 'react'
import { Container, Typography } from '@mui/material'

const GestionEquipeOrganiser = () =>
{
	return (
		<Container maxWidth="lg" sx={{ mt: { xs: 8, sm: 10 }, px: { xs: 2, sm: 3 } }}>
			<Typography variant="h4" component="h1" gutterBottom align="center">
				{"Gestion des équipes organisateur"}
			</Typography>
		</Container>
	)
}

export { GestionEquipeOrganiser };
