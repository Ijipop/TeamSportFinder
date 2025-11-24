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
	const [isEditing, setIsEditing] = useState(false);
	const levelLabels: Record<string, string> = {
		beginner: "Débutant",
		intermediate: "Intermédiaire",
		advanced: "Avancé",
	};


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
			setIsEditing(false);
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

	const handleCancel = () => {
		if (profile) {
		setFormData({
			city: profile.city || '',
			favorite_sport: profile.favorite_sport || '',
			level: profile.level || 'beginner',
			position: profile.position || '',
		});
		}
		setIsEditing(false);
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
				👤 Mon profil joueur
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

			{/* Informations de base */}
			<Card sx={{ mb: 3 }}>
				<CardContent>
					<Typography variant="h6" gutterBottom>
						Informations personnelles
					</Typography>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
						<Box>
							<Typography variant="body2" color="text.secondary">
								Nom complet
							</Typography>
							<Typography variant="body1">
								{clerkUser?.fullName || `${clerkUser?.firstName || ''} ${clerkUser?.lastName || ''}`.trim() || 'Non disponible'}
							</Typography>
						</Box>
						<Box>
							<Typography variant="body2" color="text.secondary">
								Email
							</Typography>
							<Typography variant="body1">
								{realEmail || profile?.email || 'Non disponible'}
							</Typography>
						</Box>
						<Box>
							<Typography variant="body2" color="text.secondary">
								Rôle
							</Typography>
							<Typography variant="body1">
								Joueur
							</Typography>
						</Box>
					</Box>
				</CardContent>
			</Card>

			{/* Informations */}
			<Card>
				<Card>
					<CardContent>
					<Typography variant="h6" gutterBottom>
						Informations de joueur
					</Typography>

					{/* <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}> */}
					<Box
						sx={{
							display: 'grid',
							gridTemplateColumns: {
								xs: '1fr',
								sm: 'repeat(2, 1fr)',
							},
							gap: 2,
							mt: 2,
						}}
					>
						{/* Ville */}
						<Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
						<Typography variant="body2" color="text.secondary">Ville</Typography>
						{isEditing ? (
							<TextField
							fullWidth
							value={formData.city}
							onChange={(e) => handleChange('city', e.target.value)}
							placeholder="Ex: Paris, Lyon, Marseille..."
							required
							/>
						) : (
							// ✅ rouge si Non disponible
							<Typography variant="h4" color={formData.city ? "primary" : "error"}> {formData.city || "Non disponible"} </Typography>
						)}
						</Box>

						{/* Sport principal */}
						<Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
						<Typography variant="body2" color="text.secondary">Sport principal</Typography>
						{isEditing ? (
							<TextField
							fullWidth
							value={formData.favorite_sport}
							onChange={(e) => handleChange('favorite_sport', e.target.value)}
							placeholder="Ex: Football, Basketball, Tennis..."
							required
							/>
						) : (
							<Typography variant="h4" color={formData.favorite_sport ? "primary" : "error"}> {formData.favorite_sport || "Non disponible"} </Typography>
						)}
						</Box>

						{/* Niveau */}
						<Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
						<Typography variant="body2" color="text.secondary">Niveau</Typography>
						{isEditing ? (
							<FormControl fullWidth>
							<Select
								value={formData.level}
								onChange={(e) => handleChange("level", e.target.value as "beginner" | "intermediate" | "advanced")}
							>
								<MenuItem value="beginner">Débutant</MenuItem>
								<MenuItem value="intermediate">Intermédiaire</MenuItem>
								<MenuItem value="advanced">Avancé</MenuItem>
							</Select>
							</FormControl>
						) : (
							<Typography variant="h4" color={formData.level ? "primary" : "error"}> {formData.level ? levelLabels[formData.level] : "Non disponible"} </Typography>
						)}
						</Box>

						{/* Poste préféré */}
						<Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
						<Typography variant="body2" color="text.secondary">Poste préféré</Typography>
						{isEditing ? (
							<TextField
							fullWidth
							value={formData.position}
							onChange={(e) => handleChange('position', e.target.value)}
							placeholder="Ex: Attaquant, Gardien, Meneur..."
							helperText="Indiquez votre poste préféré dans votre sport"
							/>
						) : (
							<Typography variant="h4" color={formData.position ? "primary" : "error"}> {formData.position || "Non disponible"} </Typography>
						)}
						</Box>
					</Box>
					</CardContent>

					<Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, p: 2 }}>
					{isEditing ? (
						<>
						<Button
							variant="contained"
							color="primary"
							onClick={handleSubmit}
							disabled={saving}
						>
							{saving ? <CircularProgress size={20} /> : 'Sauvegarder'}
						</Button>
						<Button variant="outlined" color="secondary" onClick={handleCancel}>
							Annuler
						</Button>
						</>
					) : (
						<Button variant="contained" onClick={() => setIsEditing(true)}>
						Modifier
						</Button>
					)}
					</Box>
				</Card>
			</Card>

			{/* Bouton de déconnexion */}
			<Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
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
			</Box>
		</Container>
	);
};

export { ProfilePlayerPage };
