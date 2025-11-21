import React from "react";
import { Box, Container, Typography } from "@mui/material";

const HomePage: React.FC = () => {
	return (
		<Container
			maxWidth="lg"
			sx={{
				mt: { xs: 8, sm: 10 }, // Compensation pour AppBar fixe
				px: { xs: 2, sm: 3 },
			}}
		>
			<Typography variant="h1">HomePage</Typography>
		</Container>
	);
};

export { HomePage };