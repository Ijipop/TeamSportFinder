// Composant Footer pour l'application Need My Hammer
import { Email, Facebook, Instagram, LinkedIn, Twitter } from "@mui/icons-material";
import { Box, Container, Divider, Grid, IconButton, Link, Stack, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";

const Footer: React.FC = () =>
{
	const navigate = useNavigate();
	const currentYear = new Date().getFullYear();

	return (
		<Box
			component="footer"
			sx={{
				bgcolor: "background.paper",
				borderTop: 2,
				borderColor: "divider",
				mt: "5rem",
				pt: 4,
				pb: 2,
			}}
		>
			<Container sx={{ px: { xs: 2, sm: 3 }, width: "100%" }}>
				<Grid container spacing={4}>
					{/* Section À propos */}
					<Grid>
						<Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
							{"À propos"}
						</Typography>
						<Stack spacing={1}>
							<Link
								component="button"
								variant="body2"
								onClick={() => navigate("/who-are-we")}
								sx={{ textAlign: "left", color: "text.secondary", cursor: "pointer" }}
							>
								{"Qui sommes-nous ?"}
							</Link>
						</Stack>
					</Grid>

					{/* Section Liens utiles */}
					<Grid>
						<Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
							{"Liens utiles"}
						</Typography>
						<Stack spacing={1}>

							<Link
								component="button"
								variant="body2"
								onClick={() => navigate("/faq")}
								sx={{ textAlign: "left", color: "text.secondary", cursor: "pointer" }}
							>
								{"FAQ"}
							</Link>
							<Link
								component="button"
								variant="body2"
								onClick={() => navigate("/support")}
								sx={{ textAlign: "left", color: "text.secondary", cursor: "pointer" }}
							>
								{"Support"}
							</Link>
						</Stack>
					</Grid>

					{/* Section Légal */}
					<Grid>
						<Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
							{"Légal"}
						</Typography>
						<Stack spacing={1}>
							<Link
								component="button"
								variant="body2"
								onClick={() => navigate("/condition-of-use")}
								sx={{ textAlign: "left", color: "text.secondary", cursor: "pointer" }}
							>
								{"Conditions d'utilisation"}
							</Link>
							<Link
								component="button"
								variant="body2"
								onClick={() => navigate("/privacy-policy")}
								sx={{ textAlign: "left", color: "text.secondary", cursor: "pointer" }}
							>
								{"Politique de confidentialité"}
							</Link>
							<Link
								component="button"
								variant="body2"
								onClick={() => navigate("/cookies-policy")}
								sx={{ textAlign: "left", color: "text.secondary", cursor: "pointer" }}
							>
								{"Politique des cookies"}
							</Link>
						</Stack>
					</Grid>

					{/* Section Contact */}
					<Grid>
						<Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
							{"Contact"}
						</Typography>
						<Stack spacing={1}>
							<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
								<Email sx={{ fontSize: 18, color: "text.secondary" }} />
								<Link
									href="mailto:contact@teamsportfinder.com"
									variant="body2"
									sx={{ color: "text.secondary" }}
								>
									contact@teamsportfinder.com
								</Link>
							</Box>
							<Box sx={{ mt: 2 }}>
								<Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
									{"Suivez-nous"}
								</Typography>
								<Stack direction="row" spacing={1}>
									<IconButton
										size="small"
										aria-label="Facebook"
										sx={{ color: "text.secondary" }}
									>
										<Facebook fontSize="small" />
									</IconButton>
									<IconButton
										size="small"
										aria-label="Twitter"
										sx={{ color: "text.secondary" }}
									>
										<Twitter fontSize="small" />
									</IconButton>
									<IconButton
										size="small"
										aria-label="Instagram"
										sx={{ color: "text.secondary" }}
									>
										<Instagram fontSize="small" />
									</IconButton>
									<IconButton
										size="small"
										aria-label="LinkedIn"
										sx={{ color: "text.secondary" }}
									>
										<LinkedIn fontSize="small" />
									</IconButton>
									{/* <IconButton
										size="small"
										aria-label="GitHub"
										sx={{ color: "text.secondary" }}
									>
										<GitHub fontSize="small" />
									</IconButton> */}
								</Stack>
							</Box>
						</Stack>
					</Grid>
				</Grid>

				<Divider sx={{ my: 3 }} />

				{/* Copyright et mentions légales */}
				<Box
					sx={{
						display: "flex",
						flexDirection: { xs: "column", sm: "row" },
						justifyContent: "space-between",
						alignItems: "center",
						gap: 2,
					}}
				>
					<Typography variant="body2" sx={{ color: "text.secondary" }}>
						© {currentYear} {"Team Sport Finder"}.{" "}
						{"Tous droits réservés."}
					</Typography>
				</Box>
			</Container>
		</Box>
	);
};

export { Footer };

