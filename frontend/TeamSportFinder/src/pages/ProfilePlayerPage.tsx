import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import {
	Alert,
	Box,
	Button,
	Card,
	CardContent,
	CircularProgress,
	Container,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	TextField,
	Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
	createPlayerProfile,
	getPlayerProfile,
	updatePlayerProfile,
	type PlayerProfile,
	type PlayerProfileUpdate,
} from '../core/services/PlayerProfileService';

const ProfilePlayerPage = () =>
{
	const { getToken } = useClerkAuth();
	const { user: clerkUser } = useUser();
	const { logout } = useAuth();
	const navigate = useNavigate();
	const [profile, setProfile] = useState<PlayerProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [formData, setFormData] = useState<PlayerProfileUpdate>({
		city: '',
		favorite_sport: '',
		level: 'beginner',
		position: '',
	});

	// Récupérer l'email réel depuis Clerk
	const realEmail = clerkUser?.primaryEmailAddress?.emailAddress || '';

	useEffect(() =>
	{
		loadProfile();
	}, []);

	const loadProfile = async () =>
	{
		setLoading(true);
		setError(null);
		try
		{
			const token = await getToken();
			const data = await getPlayerProfile(token);
			if (data)
			{
				setProfile(data);
				setFormData(
				{
					city: data.city || '',
					favorite_sport: data.favorite_sport || '',
					level: data.level || 'beginner',
					position: data.position || '',
				});
			}
		}
		catch (err: any)
		{
			console.error("Erreur lors du chargement du profil:", err);
			setError(err.message || "Erreur lors du chargement du profil");
		}
		finally
		{
			setLoading(false);
		}
	};

	const handleSubmit = async () =>
	{
		// Validation
		if (!formData.city.trim() || !formData.favorite_sport.trim())
		{
			setError("Veuillez remplir tous les champs obligatoires");
			return;
		}

		setSaving(true);
		setError(null);
		setSuccess(null);

		try
		{
			const token = await getToken();
			let updatedProfile: PlayerProfile;
			
			if (profile)
			{
				// Mise à jour du profil existant
				updatedProfile = await updatePlayerProfile(formData, token);
			}
			else
			{
				// Création d'un nouveau profil
				updatedProfile = await createPlayerProfile(formData, token);
			}
			
			setProfile(updatedProfile);
			setSuccess("Profil sauvegardé avec succès !");
		}
		catch (err: any)
		{
			setError(err.message || "Erreur lors de la sauvegarde du profil");
			console.error("Erreur:", err);
		}
		finally
		{
			setSaving(false);
		}
	};

	const handleChange = (field: keyof PlayerProfileUpdate, value: string) =>
	{
		setFormData(prev => ({
			...prev,
			[field]: value,
		}));
	};

	if (loading)
	{
		return (
			<Container maxWidth="md" sx={{ mt: { xs: 8, sm: 10 }, px: { xs: 2, sm: 3 }, pb: 4 }}>
				<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
					<CircularProgress />
				</Box>
			</Container>
		);
	}

	return (
		<Container maxWidth="md" sx={{ mt: { xs: 8, sm: 10 }, px: { xs: 2, sm: 3 }, pb: 4 }}>
			<Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
				👤 Mon profil
			</Typography>

			{success && (
				<Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
					{success}
				</Alert>
			)}

			{error && (
				<Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
					{error}
				</Alert>
			)}

			<Card>
				<CardContent>
					{profile && (
						<Box sx={{ mb: 3 }}>
							<Typography variant="body2" color="text.secondary" gutterBottom>
								Email: {realEmail || profile.email}
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Nom complet: {profile.full_name}
							</Typography>
						</Box>
					)}

					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
						<TextField
							label="Nom complet"
							fullWidth
							value={profile?.full_name || ''}
							disabled
							helperText="Le nom complet ne peut pas être modifié ici"
						/>

						<TextField
							label="Ville"
							fullWidth
							required
							value={formData.city}
							onChange={(e) => handleChange('city', e.target.value)}
							placeholder="Ex: Paris, Lyon, Marseille..."
						/>

						<TextField
							label="Sport principal"
							fullWidth
							required
							value={formData.favorite_sport}
							onChange={(e) => handleChange('favorite_sport', e.target.value)}
							placeholder="Ex: Football, Basketball, Tennis..."
						/>

						<FormControl fullWidth required>
							<InputLabel>Niveau</InputLabel>
							<Select
								value={formData.level}
								label="Niveau"
								onChange={(e) => handleChange('level', e.target.value as 'beginner' | 'intermediate' | 'advanced')}
							>
								<MenuItem value="beginner">Débutant</MenuItem>
								<MenuItem value="intermediate">Intermédiaire</MenuItem>
								<MenuItem value="advanced">Avancé</MenuItem>
							</Select>
						</FormControl>

						<TextField
							label="Poste préféré (optionnel)"
							fullWidth
							value={formData.position || ''}
							onChange={(e) => handleChange('position', e.target.value)}
							placeholder="Ex: Attaquant, Gardien, Meneur..."
							helperText="Indiquez votre poste préféré dans votre sport"
						/>
					</Box>

					<Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 4 }}>
						<Button
							variant="outlined"
							color="error"
							onClick={async () =>
							{
								await logout();
								localStorage.removeItem("auth_token");
								navigate("/");
							}}
						>
							Déconnexion
						</Button>
						<Button
							variant="contained"
							onClick={handleSubmit}
							disabled={saving || !formData.city.trim() || !formData.favorite_sport.trim()}
							sx={{ minWidth: 120 }}
						>
							{saving ? <CircularProgress size={20} /> : 'Sauvegarder'}
						</Button>
					</Box>
				</CardContent>
			</Card>
		</Container>
	);
};

export { ProfilePlayerPage };

