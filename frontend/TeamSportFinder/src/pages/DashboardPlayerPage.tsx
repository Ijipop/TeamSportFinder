// import React from "react";
// import { Container, Typography } from "@mui/material";

// const DashboardPlayerPage: React.FC = () =>
// {
// 	return (
// 		<Container
// 			maxWidth="lg"
// 			sx={{
// 				mt: { xs: 8, sm: 10 }, // Compensation pour AppBar fixe
// 				px: { xs: 2, sm: 3 },
// 			}}
// 		>
// 			<Typography variant="h1">Dashboard Joueur</Typography>
// 		</Container>
// 	);
// };

// export { DashboardPlayerPage };

import React, { useState, useEffect } from "react";
import {
	Container,
	Typography,
	TextField,
	Button,
	MenuItem,
	Box,
	} from "@mui/material";

const DashboardPlayerPage: React.FC = () => {
	const [formData, setFormData] = useState({
		full_name: "",
		city: "",
		main_sport: "",
		level: "",
		preferred_position: "",
	});

	// Exemple : récupération du profil existant
	useEffect(() => {
		fetch("/api/player/profile")
		.then((res) => res.json())
		.then((data) => setFormData(data));
	}, []);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const res = await fetch("/api/player/profile", {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(formData),
		});
		if (res.ok) {
		alert("Profil mis à jour !");
		} else {
		alert("Erreur lors de la sauvegarde.");
		}
	};


	return (
		<Container maxWidth="sm" sx={{ mt: 8 }}>
		<Typography variant="h4" gutterBottom>
			Mon profil
		</Typography>
		<Box component="form" onSubmit={handleSubmit}>
			<TextField
			fullWidth
			label="Nom complet"
			name="full_name"
			value={formData.full_name}
			onChange={handleChange}
			margin="normal"
			required
			/>
			<TextField
			fullWidth
			label="Ville"
			name="city"
			value={formData.city}
			onChange={handleChange}
			margin="normal"
			required
			/>
			<TextField
			fullWidth
			label="Sport principal"
			name="main_sport"
			value={formData.main_sport}
			onChange={handleChange}
			margin="normal"
			required
			/>
			<TextField
			select
			fullWidth
			label="Niveau"
			name="level"
			value={formData.level}
			onChange={handleChange}
			margin="normal"
			required
			>
			<MenuItem value="beginner">Débutant</MenuItem>
			<MenuItem value="intermediate">Intermédiaire</MenuItem>
			<MenuItem value="advanced">Avancé</MenuItem>
			</TextField>
			<TextField
			fullWidth
			label="Poste préféré (optionnel)"
			name="preferred_position"
			value={formData.preferred_position}
			onChange={handleChange}
			margin="normal"
			/>
			<Button type="submit" variant="contained" sx={{ mt: 2 }}>
			Sauvegarder
			</Button>
		</Box>
		</Container>
	);
};


export { DashboardPlayerPage };
