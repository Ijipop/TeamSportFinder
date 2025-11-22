import React from "react";
import { Box, Container, Typography } from "@mui/material";
import { SignUp } from '@clerk/clerk-react'

const RegisterPage: React.FC = () => {
	return (
		<Container
			maxWidth="lg"
			sx={{
				mt: { xs: 8, sm: 10 }, // Compensation pour AppBar fixe
				px: { xs: 2, sm: 3 },
			}}
		>
			{/* <Typography variant="h1">RegisterPage</Typography> */}
			<Box className="flex justify-center gap-4">
				<SignUp 
					routing="path"
					path="/register"
					signInUrl="/login"
				/>
			</Box>
		</Container>
	);
};

export { RegisterPage };
