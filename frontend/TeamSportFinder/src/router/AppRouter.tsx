// Routeur principal de l'application
import { CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
// import { useAuth } from "@clerk/clerk-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Layout } from "../components/layout/Layout";
import { AuthProvider, useAuth } from "../contexts/AuthContext";

import React from "react";
import { DashboardPage } from "../pages/DashboardPage";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { ProfilePage } from "../pages/ProfilePage";
import { RegisterPage } from "../pages/RegisterPage";

import { ConditionOfUsePage } from "../pages/ConditionOfUsePage";
import { CookiesPolicyPage } from "../pages/CookiesPolicyPage";
import { FaqPage } from "../pages/FaqPage";
import { PrivacyPolicyPage } from "../pages/PrivacyPolicyPage";
import { SupportPage } from "../pages/SupportPage";
import { WhoAreWe } from "../pages/WhoAreWePage";


// Composant pour les routes protégées avec vérification de profil complet
const ProtectedRoute: React.FC<{ children: React.ReactNode; requireCompleteProfile?: boolean }> = ({ 
	children, 
	requireCompleteProfile = false 
}) =>
{
	const { isAuthenticated, isLoading, user, isProfileComplete } = useAuth();

	// Afficher un état de chargement pendant l'initialisation
	if (isLoading)
	{
		return (
			<div style={{ 
				display: "flex", 
				justifyContent: "center", 
				alignItems: "center", 
				minHeight: "100vh" 
			}}>
				Chargement...
			</div>
		);
	}

	// Rediriger vers login si non authentifié
	if (!isAuthenticated)
	{
		return <Navigate to="/login" replace />;
	}

	// Vérifier si le profil est complet si requis
	// IMPORTANT: isProfileComplete vérifie déjà si l'email doit être vérifié
	// (seulement pour email/password, pas pour OAuth)
	if (requireCompleteProfile && user && !isProfileComplete(user))
	{
		// Rediriger vers le profil si le profil n'est pas complet
		// Note: Vous pouvez créer une page /onboarding si nécessaire
		return <Navigate to="/profile" replace />;
	}

	// Rendre les enfants uniquement si authentifié (et profil complet si requis)
	return <>{children}</>;
};

// Composant pour les routes publiques
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) =>
{
	const { isLoading } = useAuth();

	if (isLoading)
	{
		return (
			<div style={{ 
				display: "flex", 
				justifyContent: "center", 
				alignItems: "center", 
				minHeight: "100vh" 
			}}>
				Chargement...
			</div>
		);
	}

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
							<Route
								path="/dashboard"
								element={
									<ProtectedRoute requireCompleteProfile={false}>
										<Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
											<DashboardPage />
										</Layout>
									</ProtectedRoute>
								}
							/>
							<Route
								path="/profile"
								element={
									<ProtectedRoute requireCompleteProfile={false}>
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
