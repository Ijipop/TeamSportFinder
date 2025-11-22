// Composant simple pour gérer les redirections d'authentification
import { useUser } from "@clerk/clerk-react";
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface AuthGuardProps {
	children: React.ReactNode;
	requireAuth?: boolean;
	allowedRoles?: ('player' | 'organizer')[];
	requireRole?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
	children,
	requireAuth = false,
	allowedRoles = [],
	requireRole = false,
}) => {
	const { user, isLoading } = useAuth();
	const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
	const location = useLocation();

	// Routes publiques : login et register sont TOUJOURS accessibles SANS vérification
	if (location.pathname.startsWith('/login') || location.pathname.startsWith('/register')) {
		// Si Clerk est chargé ET que l'utilisateur a un compte complet, rediriger
		if (isClerkLoaded && !isLoading && user && user.role) {
			const dashboardPath = user.role === 'organizer' ? '/dashboard-organizer' : '/dashboard';
			return <Navigate to={dashboardPath} replace />;
		}
		// Sinon, TOUJOURS permettre l'accès (même pendant le chargement)
		return <>{children}</>;
	}

	// Attendre que Clerk soit chargé pour les autres routes
	if (!isClerkLoaded || isLoading) {
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

	// Route dashboard-redirect : toujours accessible
	if (location.pathname === '/dashboard-redirect') {
		return <>{children}</>;
	}

	// Route select-role : accessible SEULEMENT si connecté avec Clerk ET pas de compte Django
	if (location.pathname === '/select-role') {
		// Pas connecté avec Clerk
		if (!clerkUser) {
			return <Navigate to="/login" replace />;
		}
		// Déjà un compte complet
		if (user && user.role) {
			const dashboardPath = user.role === 'organizer' ? '/dashboard-organizer' : '/dashboard';
			return <Navigate to={dashboardPath} replace />;
		}
		// Connecté avec Clerk mais pas de compte Django, permettre l'accès
		return <>{children}</>;
	}

	// Routes protégées : nécessitent une authentification complète
	if (requireAuth) {
		// Pas connecté avec Clerk
		if (!clerkUser) {
			return <Navigate to="/login" replace />;
		}

		// Pas de compte Django
		if (!user) {
			// Rediriger vers dashboard-redirect pour vérifier le backend
			return <Navigate to="/dashboard-redirect" replace />;
		}

		// Vérifier le rôle si nécessaire
		if (requireRole && allowedRoles.length > 0) {
			if (!user.role || !allowedRoles.includes(user.role)) {
				// Rediriger vers le dashboard approprié
				const dashboardPath = user.role === 'organizer' ? '/dashboard-organizer' : '/dashboard';
				return <Navigate to={dashboardPath} replace />;
			}
		}
	}

	return <>{children}</>;
};
