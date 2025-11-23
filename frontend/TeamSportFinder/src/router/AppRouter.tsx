// Routeur principal de l'application
import { CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import * as Tooltip from "@radix-ui/react-tooltip";
import React from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { AuthProvider, useAuth } from "../contexts/AuthContext";

import { DashboardOrganiserPage } from "../pages/DashboardOrganiserPage";
import { DashboardPlayerPage } from "../pages/DashboardPlayerPage";
import { DashboardRedirectPage } from "../pages/DashboardRedirectPage";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { ProfilePageRouter } from "../pages/ProfilePage";
import { RegisterCompletePage } from "../pages/RegisterCompletePage";
import { RegisterPage } from "../pages/RegisterPage";
import { SelectRolePage } from "../pages/SelectRolePage";
import { GestionEquipeOrganiser } from "../pages/GestionEquipeOrganiser";
import { GestionEquipePlayer } from "../pages/GestionEquipePlayer";

import { ConditionOfUsePage } from "../pages/ConditionOfUsePage";
import { CookiesPolicyPage } from "../pages/CookiesPolicyPage";
import { FaqPage } from "../pages/FaqPage";
import { PrivacyPolicyPage } from "../pages/PrivacyPolicyPage";
import { SupportPage } from "../pages/SupportPage";
import { WhoAreWe } from "../pages/WhoAreWePage";
import { TournamentsPage } from "../pages/TournamentsPage";
import { MesDemandesPage } from "../pages/MesDemandesPage";
import { GestionDemandesPage } from "../pages/GestionDemandesPage";
import { RechercheEquipesPage } from "../pages/RechercheEquipesPage";
import { MesMatchsPage } from "../pages/MesMatchsPage";
import { GestionMatchsPage } from "../pages/GestionMatchsPage";


// Composant pour les routes protégées avec vérification de profil complet
const RoleProtectedRoute: React.FC<{ 
	children: React.ReactNode; 
	allowedRoles: string[];
	allowNoRole?: boolean; // Permet l'accès même si l'utilisateur n'a pas de rôle
}> = ({ children, allowedRoles, allowNoRole = false }) =>
{
	const { isAuthenticated, isLoading, user, clerkUser } = useAuth();
	const location = useLocation();

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

	// Si allowNoRole est true, on permet l'accès même si user est null (utilisateur connecté avec Clerk mais pas encore dans Django)
	if (allowNoRole)
	{
		// Vérifier seulement que l'utilisateur est connecté avec Clerk
		if (!clerkUser)
		{
			return <Navigate to="/login" replace />;
		}
		// Permettre l'accès même si user est null
		return <>{children}</>;
	}

	// Pour les routes normales, vérifier l'authentification complète
	// Si l'utilisateur est connecté avec Clerk mais n'a pas encore de compte Django,
	// rediriger vers dashboard-redirect pour vérifier le backend
	// MAIS ne pas rediriger si on vient juste de créer l'utilisateur (on est sur select-role)
	if (clerkUser && !user && !location.pathname.startsWith('/dashboard-redirect') && !location.pathname.startsWith('/select-role'))
	{
		return <Navigate to="/dashboard-redirect" replace />;
	}

	if (!isAuthenticated)
	{
		return <Navigate to="/login" replace />;
	}

	// Si l'utilisateur existe mais n'a pas de rôle, rediriger vers dashboard-redirect d'abord
	// pour vérifier le backend avant de rediriger vers select-role
	// MAIS ne pas rediriger si on vient juste de créer l'utilisateur (on est sur select-role)
	if (user && !user.role && !location.pathname.startsWith('/select-role') && !location.pathname.startsWith('/dashboard-redirect'))
	{
		// Si l'utilisateur est connecté avec Clerk, vérifier le backend d'abord
		if (clerkUser)
		{
			return <Navigate to="/dashboard-redirect" replace />;
		}
		// Sinon, rediriger vers select-role
		return <Navigate to="/select-role" replace />;
	}

	// Si l'utilisateur a un rôle mais n'est pas autorisé, rediriger vers le bon dashboard
	// Ne pas rediriger si on est déjà sur le dashboard approprié pour éviter les boucles
	if (user && user.role && !allowedRoles.includes(user.role))
	{
		// Rediriger vers le dashboard approprié selon le rôle
		const dashboardPath = user.role === 'organizer' ? '/dashboard-organizer' : '/dashboard';
		// Ne rediriger que si on n'est pas déjà sur le bon dashboard ou sur select-role
		if (location.pathname !== dashboardPath && 
			!location.pathname.startsWith('/dashboard-redirect') && 
			!location.pathname.startsWith('/select-role'))
		{
			return <Navigate to={dashboardPath} replace />;
		}
	}
	
	// Si l'utilisateur a un rôle valide et qu'on est sur select-role ou dashboard-redirect, rediriger vers le dashboard
	if (user && user.role && allowedRoles.includes(user.role) && 
		(location.pathname.startsWith('/select-role') || location.pathname.startsWith('/dashboard-redirect')))
	{
		const dashboardPath = user.role === 'organizer' ? '/dashboard-organizer' : '/dashboard';
		return <Navigate to={dashboardPath} replace />;
	}

	return <>{children}</>;
};

// Composant pour rediriger vers le bon dashboard après connexion
const DashboardRedirect: React.FC = () =>
{
	return <DashboardRedirectPage />;
};

// Composant pour les routes publiques
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) =>
{
	const { isLoading, clerkUser } = useAuth();
	const location = useLocation();

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

	// Si l'utilisateur est connecté avec Clerk (même sans compte Django) et accède à login/register, rediriger vers dashboard-redirect
	if (clerkUser && (location.pathname.startsWith('/login') || location.pathname.startsWith('/register')))
	{
		// Ne pas rediriger si on est déjà sur register/complete ou select-role
		if (!location.pathname.startsWith('/register/complete') && !location.pathname.startsWith('/select-role'))
		{
			return <DashboardRedirect />;
		}
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
							{/* Route pour compléter l'inscription */}
							<Route
								path="/register/complete"
								element={
									<PublicRoute>
										<Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
											<RegisterCompletePage />
										</Layout>
									</PublicRoute>
								}
							/>
							{/* Route pour sélectionner le rôle lors de la connexion */}
							<Route
								path="/select-role"
								element={
									<RoleProtectedRoute allowedRoles={['player', 'organizer']} allowNoRole={true}>
										<Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
											<SelectRolePage />
										</Layout>
									</RoleProtectedRoute>
								}
							/>
							{/* Route pour rediriger vers le dashboard après connexion */}
							<Route
								path="/dashboard-redirect"
								element={
									<RoleProtectedRoute allowedRoles={['player', 'organizer']}>
										<Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
											<DashboardRedirectPage />
										</Layout>
									</RoleProtectedRoute>
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
									<RoleProtectedRoute allowedRoles={['player']}>
										<Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
											<DashboardPlayerPage />
										</Layout>
									</RoleProtectedRoute>
								}
							/>
							<Route
								path="/dashboard-organizer"
								element={
									<RoleProtectedRoute allowedRoles={['organizer']}>
										<Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
											<DashboardOrganiserPage />
										</Layout>
									</RoleProtectedRoute>
								}
							/>
							<Route
								path="/gestion-equipe-organiser"
								element={
									<RoleProtectedRoute allowedRoles={['organizer']}>
										<Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
											<GestionEquipeOrganiser />
										</Layout>
									</RoleProtectedRoute>
								}
							/>
							<Route
								path="/gestion-equipe-player"
								element={
									<RoleProtectedRoute allowedRoles={['player']}>
										<Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
											<GestionEquipePlayer />
										</Layout>
									</RoleProtectedRoute>
								}
							/>
							<Route
								path="/profile"
								element={
									<RoleProtectedRoute allowedRoles={['player', 'organizer']}>
										<Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
											<ProfilePageRouter />
										</Layout>
									</RoleProtectedRoute>
								}
							/>
							<Route
								path="/tournaments"
								element={
									<RoleProtectedRoute allowedRoles={['player', 'organizer']}>
										<Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
											<TournamentsPage />
										</Layout>
									</RoleProtectedRoute>
								}
							/>
							{/* Pages joueur */}
							<Route
								path="/my-requests"
								element={
									<RoleProtectedRoute allowedRoles={['player']}>
										<Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
											<MesDemandesPage />
										</Layout>
									</RoleProtectedRoute>
								}
							/>
							<Route
								path="/teams/search"
								element={
									<RoleProtectedRoute allowedRoles={['player']}>
										<Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
											<RechercheEquipesPage />
										</Layout>
									</RoleProtectedRoute>
								}
							/>
							<Route
								path="/my-matches"
								element={
									<RoleProtectedRoute allowedRoles={['player']}>
										<Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
											<MesMatchsPage />
										</Layout>
									</RoleProtectedRoute>
								}
							/>
							{/* Pages organisateur */}
							<Route
								path="/organizer/requests"
								element={
									<RoleProtectedRoute allowedRoles={['organizer']}>
										<Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
											<GestionDemandesPage />
										</Layout>
									</RoleProtectedRoute>
								}
							/>
							<Route
								path="/organizer/matches"
								element={
									<RoleProtectedRoute allowedRoles={['organizer']}>
										<Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
											<GestionMatchsPage />
										</Layout>
									</RoleProtectedRoute>
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
