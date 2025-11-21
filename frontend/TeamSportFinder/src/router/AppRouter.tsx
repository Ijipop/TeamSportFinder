// Routeur principal de l'application
import { CssBaseline  } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
// import { useAuth } from "@clerk/clerk-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Layout } from "../components/layout/Layout";
import { AuthProvider } from "../contexts/AuthContext";

import React from "react";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { ProfilePage } from "../pages/ProfilePage";

import { WhoAreWe } from "../pages/WhoAreWePage";
import { FaqPage } from "../pages/FaqPage";
import { SupportPage } from "../pages/SupportPage";
import { ConditionOfUsePage } from "../pages/ConditionOfUsePage";
import { PrivacyPolicyPage } from "../pages/PrivacyPolicyPage";
import { CookiesPolicyPage } from "../pages/CookiesPolicyPage";


// Composant pour les routes protégées avec vérification de profil complet
const ProtectedRoute: React.FC<{ children: React.ReactNode; requireCompleteProfile?: boolean }> = ({ 
	children, 
	requireCompleteProfile = false 
}) =>
{
	// const { isAuthenticated, isLoading, user, clerkUser, isProfileComplete } = useAuth();

	// // Afficher un état de chargement pendant l'initialisation
	// if (isLoading)
	// {
	// 	return (
	// 		<div style={{ 
	// 			display: "flex", 
	// 			justifyContent: "center", 
	// 			alignItems: "center", 
	// 			minHeight: "100vh" 
	// 		}}>
	// 			Chargement...
	// 		</div>
	// 	);
	// }

	// Rediriger vers login si non authentifié
	// if (!isAuthenticated)
	// {
	// 	return <Navigate to="/login" replace />;
	// }

	// Vérifier si le profil est complet si requis
	// Rediriger vers onboarding si :
	// - L'email est "user@example.com" ou vide
	// - L'email n'est pas vérifié (SEULEMENT pour les utilisateurs email/password, pas OAuth)
	// - Les infos perso ne sont pas complètes
	// NOTE: Si StackAuth n'a pas finalisé l'authentification (stackUser est null), on permet quand même l'accès
	// si l'utilisateur a un profil complet dans la base de données (sauf pour l'email non vérifié)
	// IMPORTANT: Les utilisateurs OAuth n'ont pas besoin de vérifier leur email
	// car le fournisseur OAuth l'a déjà vérifié
	// let hasCompleteAddress = false;
	// if (user?.address)
	// {
	// 	if (typeof user.address === "object")
	// 	{
	// 		const addr = user.address as any;
	// 		hasCompleteAddress = !!(addr.address || addr.Address) && !!(addr.city || addr.City) && 
	// 			!!(addr.postalCode || addr.PostalCode) && !!(addr.country || addr.Country);
	// 	}
	// 	else if (typeof user.address === "string")
	// 	{
	// 		try
	// 		{
	// 			const addr = JSON.parse(user.address);
	// 			hasCompleteAddress = !!(addr.address || addr.Address) && !!(addr.city || addr.City) && 
	// 				!!(addr.postalCode || addr.PostalCode) && !!(addr.country || addr.Country);
	// 		}
	// 		catch
	// 		{
	// 			hasCompleteAddress = false;
	// 		}
	// 	}
	// }
	
	// const hasCompleteProfileInDB = user && 
	// 	user.email && 
	// 	user.email !== "user@example.com" && 
	// 	user.email.trim() !== "" &&
	// 	user.firstName && 
	// 	user.lastName && 
	// 	user.phone &&
	// 	hasCompleteAddress;
	
	// Si Clerk n'a pas finalisé l'authentification mais que l'utilisateur a un profil complet dans la DB,
	// permettre l'accès même si l'email n'est pas vérifié (pour les utilisateurs email/password)
	// IMPORTANT: Cette vérification est maintenant gérée par isProfileComplete qui différencie OAuth et email/password
	// if (requireCompleteProfile && user && !clerkUser && hasCompleteProfileInDB)
	// {
	// 	// Vérifier si le profil est complet (isProfileComplete gère déjà la vérification d'email)
	// 	if (isProfileComplete(user))
	// 	{
	// 		return <>{children}</>;
	// 	}
	// }
	
	// Vérifier si le profil est complet
	// IMPORTANT: isProfileComplete vérifie déjà si l'email doit être vérifié
	// (seulement pour email/password, pas pour OAuth)
	// if (requireCompleteProfile && user && !isProfileComplete(user))
	// {
	// 	// Rediriger vers onboarding si le profil n'est pas complet
	// 	return <Navigate to="/onboarding" replace />;
	// }

	// Rendre les enfants uniquement si authentifié (et profil complet si requis)
	return <>{children}</>;
};

// Composant pour les routes publiques
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) =>
{
	// const { isLoading } = useAuth();

	// if (isLoading)
	// {
	// 	return <div>Chargement...</div>;
	// }

	return <>{children}</>;
};

// Thème Material UI avec support du mode sombre
const createAppTheme = (darkMode: boolean) => createTheme(
{
	palette:
	{
		mode: darkMode ? "dark" : "light",
		primary:
		{
			main: darkMode ? "#00058E" : "#00058E", // Background color
			dark: darkMode ? "#00058E" : "#00058E", // Text color
		},
		secondary:
		{
			main: darkMode ? "#f48fb1" : "#764ba2", // Text color
		},
		background:
		{
			default: darkMode ? "#121212" : "#fafafa", // Background color
			paper: darkMode ? "#1e1e1e" : "#fafafa", // Paper color
		},
	},
	typography:
	{
		fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
	},
});

export const AppRouter: React.FC = () =>
{
	const [darkMode, setDarkMode] = React.useState(() =>
	{
		const saved : string | null = localStorage.getItem("darkMode");
		
		return saved ? JSON.parse(saved) : false;
	});

	const toggleDarkMode = () =>
	{
		const newMode = !darkMode;
		setDarkMode(newMode);
		localStorage.setItem("darkMode", JSON.stringify(newMode));
	};

	const theme = createAppTheme(darkMode);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
					<Tooltip.Provider>
						<BrowserRouter>
						<AuthProvider>
						<Routes>
						{/* Routes publiques */}
						<Route
							path="/"
							element={
								<PublicRoute>
									<Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
										<HomePage />
									</Layout>
								</PublicRoute>
							}
						/>
						{/* Route login avec catch-all pour gérer les callbacks SSO de Clerk */}
						<Route
							path="/login/*"
							element={
								<PublicRoute>
									<Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
										<LoginPage />
									</Layout>
								</PublicRoute>
							}
						/>
						{/* Route register avec catch-all pour gérer les callbacks SSO de Clerk */}
						<Route
							path="/register/*"
							element={
								<PublicRoute>
									<Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
										<RegisterPage />
									</Layout>
								</PublicRoute>
							}
						/>
						
						<Route
							path="/who-are-we"
							element={
								<PublicRoute>
									<Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
										<WhoAreWe />
									</Layout>
								</PublicRoute>
							}
						/>
						<Route
							path="/faq"
							element={
								<PublicRoute>
									<Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
										<FaqPage />
									</Layout>
								</PublicRoute>
							}
						/>
						<Route
							path="/support"
							element={
								<PublicRoute>
									<Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
										<SupportPage />
									</Layout>
								</PublicRoute>
							}
						/>
						<Route
							path="/condition-of-use"
							element={
								<PublicRoute>
									<Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
										<ConditionOfUsePage />
									</Layout>
								</PublicRoute>
							}
						/>
						<Route
							path="/privacy-policy"
							element={
								<PublicRoute>
									<Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
										<PrivacyPolicyPage />
									</Layout>
								</PublicRoute>
							}
						/>
						<Route
							path="/cookies-policy"
							element={
								<PublicRoute>
									<Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
										<CookiesPolicyPage />
									</Layout>
								</PublicRoute>
							}
						/>
						
						{/* Routes protégées */}
						{/* <Route
							path="/dashboard"
							element={
								<ProtectedRoute requireCompleteProfile={true}>
									<Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
										<DashboardPage />
									</Layout>
								</ProtectedRoute>
							}
						/> */}
						<Route
							path="/profile"
							element={
								<ProtectedRoute requireCompleteProfile={true}>
									<Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
										<ProfilePage />
									</Layout>
								</ProtectedRoute>
							}
						/>
					</Routes>
							</AuthProvider>
						{/* </ClerkProviderWithLang>
					</TranslationProvider> */}
			</BrowserRouter>
			</Tooltip.Provider>
		</ThemeProvider>
	);
};
