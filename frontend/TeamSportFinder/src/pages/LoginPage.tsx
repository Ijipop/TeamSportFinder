import { SignIn } from '@clerk/clerk-react';
import { Box, Container } from "@mui/material";
import React from "react";

const LoginPage: React.FC = () => {
	return (
		<Container
			maxWidth="lg"
			sx={{
				mt: { xs: 8, sm: 10 }, // Compensation pour AppBar fixe
				px: { xs: 2, sm: 3 },
			}}
		>
			{/* <Typography variant="h1">LoginPage</Typography> */}
			
			<Box className="flex justify-center gap-4">
				<SignIn 
					routing="path"
					path="/login"
					signUpUrl="/register"
					afterSignInUrl="/dashboard-redirect"
				/>
			</Box>
		</Container>
    );
};

export { LoginPage };

