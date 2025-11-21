import React from "react";
import { Box, Container, Typography } from "@mui/material";

const RegisterPage: React.FC = () => {
	return (
		<Container
			maxWidth="lg"
			sx={{
				mt: { xs: 8, sm: 10 }, // Compensation pour AppBar fixe
				px: { xs: 2, sm: 3 },
			}}
		>
			<Typography variant="h1">RegisterPage</Typography>
		</Container>
	);
};

export { RegisterPage };
