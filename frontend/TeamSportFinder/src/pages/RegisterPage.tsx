import { SignUp, useUser } from '@clerk/clerk-react';
import { Box, Container, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

const RegisterPage: React.FC = () => {
	const [role, setRole] = useState<'player' | 'organizer'>('player');
	const { user: clerkUser } = useUser();

	// Stocker le rôle dans sessionStorage pour le récupérer après la validation email
	useEffect(() => {
		sessionStorage.setItem('pendingRole', role);
	}, [role]);

	// Si l'utilisateur est déjà connecté avec Clerk, mettre à jour les métadonnées
	useEffect(() => {
		const updateMetadata = async () => {
			if (clerkUser && role) {
				try {
					await clerkUser.update({
						unsafeMetadata: {
							role: role
						}
					});
				} catch (error) {
					console.error("Erreur lors de la mise à jour des métadonnées:", error);
				}
			}
		};
		updateMetadata();
	}, [clerkUser, role]);

	return (
		<Container
			maxWidth="lg"
			sx={{
				mt: { xs: 8, sm: 10 },
				px: { xs: 2, sm: 3 },
			}}
		>
			<Box sx={{ mb: 4, textAlign: 'center' }}>
				<Typography variant="h4" gutterBottom>
					Créez votre compte
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Choisissez votre rôle pour commencer
				</Typography>
			</Box>

			<Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
				<FormControl component="fieldset">
					<FormLabel component="legend">Je suis un :</FormLabel>
					<RadioGroup
						row
						value={role}
						onChange={(e) => setRole(e.target.value as 'player' | 'organizer')}
					>
						<FormControlLabel value="player" control={<Radio />} label="Joueur" />
						<FormControlLabel value="organizer" control={<Radio />} label="Organisateur" />
					</RadioGroup>
				</FormControl>
			</Box>

			<Box className="flex justify-center gap-4">
				<SignUp 
					routing="path"
					path="/register"
					signInUrl="/login"
					afterSignUpUrl={`/register/complete?role=${role}`}
				/>
			</Box>
		</Container>
	);
};

export { RegisterPage };

