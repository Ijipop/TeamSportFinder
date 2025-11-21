import { ClerkProvider, SignIn, SignUp, useClerk as useClerkInstance, useUser as useClerkUser } from "@clerk/clerk-react";
import React, { type ReactNode, createContext, useContext } from "react";

// Configuration Clerk avec variables d'environnement (Principe de responsabilité unique)
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";

// Vérifier que les variables d'environnement sont définies en développement
if (!publishableKey)
{
	console.warn(
		"⚠️ Variable Clerk non définie. Assurez-vous d'avoir configuré VITE_CLERK_PUBLISHABLE_KEY dans votre fichier .env"
	);
}

// Vérification de la configuration Clerk (Principe de responsabilité unique)
export const isClerkConfigured = !!publishableKey;

// Export des composants d'authentification pour l'intégration React
export { SignIn, SignUp };

// Export de la clé publique pour utilisation dans ClerkProvider
	export { publishableKey };

// Contexte mock pour les hooks quand Clerk n'est pas configuré
const MockClerkContext = createContext<{ user: any; isLoaded: boolean }>({ user: null, isLoaded: true });
const MockClerkInstanceContext = createContext<any>(null);

// Hooks wrapper qui utilisent useContext pour les contextes mock si Clerk n'est pas configuré
// Ces hooks respectent les règles des hooks React en appelant toujours useContext dans le même ordre
export const useUser = (): { user: any; isLoaded: boolean } =>
{
	// Toujours appeler useContext pour respecter les règles des hooks
	const mockValue = useContext(MockClerkContext);
	
	if (!isClerkConfigured)
	{
		// Retourner les valeurs mock si Clerk n'est pas configuré
		return mockValue;
	}
	
	// Appeler le hook Clerk seulement si configuré
	// Si ClerkProvider n'est pas présent, cela échouera mais on retournera mockValue
	try {
		return useClerkUser();
	} catch (error) {
		// Si ClerkProvider n'est pas présent, retourner les valeurs mock
		return mockValue;
	}
};

export const useClerk = () =>
{
	// Toujours appeler useContext pour respecter les règles des hooks
	const mockValue = useContext(MockClerkInstanceContext);
	
	if (!isClerkConfigured)
	{
		return mockValue;
	}
	
	// Appeler le hook Clerk seulement si configuré
	// Si ClerkProvider n'est pas présent, cela échouera mais on retournera mockValue
	try {
		return useClerkInstance();
	} catch (error) {
		// Si ClerkProvider n'est pas présent, retourner null
		return mockValue;
	}
};

// Composant wrapper conditionnel pour ClerkProvider
// Ce wrapper évite les erreurs de hooks lorsque Clerk n'est pas configuré
export const ClerkProviderWrapper: React.FC<{ children: ReactNode }> = ({ children }) =>
{
	if (!isClerkConfigured || !publishableKey)
	{
		// Si Clerk n'est pas configuré, utiliser les contextes mock au lieu de ClerkProvider
		console.warn("Clerk n'est pas configuré. L'application fonctionnera en mode développement sans authentification.");
		return (
			<MockClerkContext.Provider value={{ user: null, isLoaded: true }}>
				<MockClerkInstanceContext.Provider value={null}>
					{children}
				</MockClerkInstanceContext.Provider>
			</MockClerkContext.Provider>
		);
	}
	
	return <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>;
};
