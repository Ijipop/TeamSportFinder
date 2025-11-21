import { Brightness4, Brightness7, Close, Menu as MenuIcon } from "@mui/icons-material";
import { AppBar, Box, Button, Container, IconButton, Stack, Toolbar, Typography } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Avatar } from "@mui/material";

// Composant Header responsive avec navigation conditionnelle et mode sombre
const Header = ({ darkMode, toggleDarkMode }: { darkMode: boolean; toggleDarkMode: () => void }) =>
{
	// const [isLoggedIn, setIsLoggedIn] = React.useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

	const { isAuthenticated, logout } = useAuth();

	const navigate = useNavigate();
	const { user } = useAuth();

	const handleLogout = async () =>
	{
		await logout();
		setMobileMenuOpen(false);
		navigate("/");
	};


	// Fonction pour fermer le menu mobile
	const closeMobileMenu = () =>
	{
		setMobileMenuOpen(false);
	};
	
	const logoImage = "../../public/vite.svg";

	// Fermer le menu quand on clique à l'extérieur
	React.useEffect(() =>
	{
		const handleClickOutside = (event: MouseEvent) =>
		{
			const target = event.target as HTMLElement;
			if (mobileMenuOpen && !target.closest("[data-mobile-menu]"))
			{
				setMobileMenuOpen(false);
			}
		};

		if (mobileMenuOpen)
		{
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () =>
		{
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [mobileMenuOpen]);

	return (
		<AppBar
			position="fixed"
			sx={{
				backgroundColor: darkMode ? "primary.dark" : "primary.main",
				color: darkMode ? "text.primary" : "white",
				zIndex: 1300,
			}}
		>
			<Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
				<Toolbar sx={{ px: 0 }}>
					<Box
					component="img"
					src={logoImage}
					// alt="Need My Hammer Logo"
					sx={{
						height: 60,
						width: 'auto',
						mr: 2,
						cursor: 'pointer'
					}}
						onClick={() => navigate('/')}
					/>
					<Typography
						variant="h6"
						component="div"
						sx={{
							// flexGrow: 1,
							fontSize: { xs: "1rem", sm: "1.25rem" },
						}}
					>
						{"Team Sport Finder"}
					</Typography>
					
					{/* Separer logo de navigation */}
					<Typography sx={{ flexGrow: 1 }} />

					{/* Navigation desktop */}
					<Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
						<Button
							color="inherit"
							component={Link}
							to="/"
							sx={{ color: darkMode ? "text.primary" : "white" }}
						>
							{"Accueil"}
						</Button>
						{isAuthenticated ? (
							<>
								<Button
									color="inherit"
									component={Link}
									to="/dashboard"
									sx={{ color: darkMode ? "text.primary" : "white" }}
								>
									{"Dashboard"}
								</Button>
								<Button
									color="inherit"
									component={Link}
									to="/profile"
									sx={{ color: darkMode ? "text.primary" : "white" }}
								>
									{/* {t("navigation.profile")} */}
								<Avatar
                                        sx={{ width: 50, height: 50, mr: 2, bgcolor: "primary.main" }}
                                        src={user?.avatar}
                                    >
                                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                                    </Avatar>
								</Button>								
								{/* <Button
									color="inherit"
									onClick={handleLogout}
									sx={{ color: darkMode ? "text.primary" : "white" }}
								>
									Déconnexion
								</Button> */}
							</>
						) : (
							<>
								<Button
									color="inherit"
									component={Link}
									to="/login"
									sx={{ color: darkMode ? "text.primary" : "white" }}
								>
									{"Connexion"}
								</Button>
								{/* <Button
									color="inherit"
									component={Link}
									to="/register"
									sx={{ color: darkMode ? "text.primary" : "white" }}
								>
									{t("navigation.register")}
								</Button> */}
							</>
						)}
						
						
						
						{/* <Menu
							anchorEl={languageMenuAnchor}
							open={languageMenuOpen}
							onClose={handleLanguageMenuClose}
						>
							{availableLanguages.map((lang: string) => (
								<MenuItem
									key={lang}
									onClick={() => handleLanguageChange(lang)}
									selected={currentLanguage === lang}
								>
									{lang === "fr" ? "Français" : "Anglais"}
								</MenuItem>
							))}
						</Menu> */}
					</Box>

					{/* Bouton mode sombre */}
					<IconButton
						color="inherit"
						onClick={toggleDarkMode}
						sx={{
							ml: 1,
							color: darkMode ? "text.primary" : "white",
						}}
					>
						{darkMode ? <Brightness7 /> : <Brightness4 />}
					</IconButton>

					{/* Menu mobile */}
					<IconButton
						color="inherit"
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						sx={{
							display: { xs: "block", md: "none" },
							ml: 1,
							color: darkMode ? "text.primary" : "white",
						}}
					>
						{mobileMenuOpen ? <Close /> : <MenuIcon />}
					</IconButton>
				</Toolbar>

				{/* Menu mobile déroulant */}
				{mobileMenuOpen && (
					<Box
						data-mobile-menu
						sx={{
							display: { xs: "block", md: "none" },
							p: 2,
							bgcolor: "background.paper",
							borderTop: 1,
							borderColor: "divider",
						}}
					>
						<Stack spacing={1}>
							<Button
								color="inherit"
								component={Link}
								to="/"
								onClick={closeMobileMenu}
								fullWidth
								sx={{ color: "text.primary" }}
							>
								Accueil
							</Button>
							<Button
								color="inherit"
								component={Link}
								to="/tools"
								onClick={closeMobileMenu}
								fullWidth
								sx={{ color: "text.primary" }}
							>
								Outils
							</Button>
							{isAuthenticated ? (
								<>
									<Button
										color="inherit"
										component={Link}
										to="/dashboard"
										onClick={closeMobileMenu}
										fullWidth
										sx={{ color: "text.primary" }}
									>
										Dashboard
									</Button>
									<Button
										color="inherit"
										onClick={handleLogout}
										fullWidth
										sx={{ color: "text.primary" }}
									>
										Déconnexion
									</Button>
								</>
							) : (
								<>
									<Button
										color="inherit"
										component={Link}
										to="/login"
										onClick={closeMobileMenu}
										fullWidth
										sx={{ color: "text.primary" }}
									>
										Connexion
									</Button>
									{/* <Button
										color="inherit"
										component={Link}
										to="/register"
										onClick={closeMobileMenu}
										fullWidth
										sx={{ color: "text.primary" }}
									>
										Inscription
									</Button> */}
								</>
							)}
							
							{/* Séparateur */}
							<Box sx={{ borderTop: 1, borderColor: "divider", my: 1 }} />
							
							{/* Sélecteur de langue mobile
							<Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
								<Typography variant="subtitle2" sx={{ color: "text.secondary", px: 1 }}>
									{t("languages.french")} / {t("languages.english")}
								</Typography>
								<Box sx={{ display: "flex", gap: 1 }}>
									<Button
										variant={currentLanguage === "fr" ? "contained" : "outlined"}
										size="small"
										onClick={() => {
											handleLanguageChange("fr");
											closeMobileMenu();
										}}
										sx={{ flex: 1 }}
									>
										{t("languages.french")}
									</Button>
									<Button
										variant={currentLanguage === "en" ? "contained" : "outlined"}
										size="small"
										onClick={() => {
											handleLanguageChange("en");
											closeMobileMenu();
										}}
										sx={{ flex: 1 }}
									>
										{t("languages.english")}
									</Button>
								</Box>
							</Box> */}
						</Stack>
					</Box>
				)}
			</Container>
		</AppBar>
	);
};

export { Header };

