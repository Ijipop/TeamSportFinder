import React from "react";
import { Container, Typography, Button } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const ProfilePlayerPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const confirmLogout = async () => {
    await logout();
    localStorage.removeItem("auth_token");
    navigate("/");
  };

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 8, sm: 10 }, px: { xs: 2, sm: 3 } }}>
      <Typography variant="h1">Profil Joueur</Typography>
      <Button onClick={confirmLogout} color="error" variant="contained">
        Déconnexion
      </Button>
    </Container>
  );
};

export { ProfilePlayerPage };

// import React, { useState, useEffect } from "react";
// import {
//   Container,
//   Typography,
//   Button,
//   TextField,
//   MenuItem,
//   Box,
//   Skeleton,
//   Snackbar,
//   Alert,
//   Grid,
//   Card,
//   CardContent,
//   CardActions,
// } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
// import SearchIcon from "@mui/icons-material/Search";
// import MailIcon from "@mui/icons-material/Mail";
// import { useAuth } from "@clerk/clerk-react";

// type PlayerProfile = {
//   id: number | null;
//   full_name: string;
//   city: string;
//   main_sport: string;
//   level: string;
//   preferred_position: string | null;
// };

// const DashboardPlayerPage: React.FC = () => {
//   const navigate = useNavigate();
//   const { getToken } = useAuth();

//   const [formData, setFormData] = useState<PlayerProfile>({
//     id: null,
//     full_name: "",
//     city: "",
//     main_sport: "",
//     level: "beginner",
//     preferred_position: null,
//   });

//   const [loading, setLoading] = useState(true);
//   const [editing, setEditing] = useState(false);

//   const [snackbarOpen, setSnackbarOpen] = useState(false);
//   const [snackbarMessage, setSnackbarMessage] = useState("");
//   const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const token = await getToken({ template: "default" });

//         // 🔥 Utilise l’URL correcte avec "players"
//         const res = await fetch("http://localhost:8000/api/players/profile/", {
//         // const res = await fetch("/api/player/profile/", {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         // Vérifie si la réponse est OK
//         if (!res.ok) {
//           const text = await res.text(); // lire le HTML ou message d’erreur
//           throw new Error(`Erreur ${res.status}: ${text}`);
//         }

//         const data = await res.json();
//         console.log("Profil reçu:", data);

//         if (data && data.full_name) {
//           setFormData(data);
//         } else {
//           setSnackbarMessage("Aucun profil trouvé.");
//           setSnackbarSeverity("error");
//           setSnackbarOpen(true);
//         }
//       } catch (err) {
//         console.error("Erreur fetch profile:", err);
//         setSnackbarMessage("Erreur lors du chargement du profil");
//         setSnackbarSeverity("error");
//         setSnackbarOpen(true);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProfile();
//   }, [getToken]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const baseUrl = "http://localhost:8000";
//     const url = formData.id
//       ? `${baseUrl}/api/players/profile/` // PUT sur le profil existant
//       : `${baseUrl}/api/players/profile/`; // POST si jamais il n’existe pas
//     const method = formData.id ? "PUT" : "POST";

//     try {
//       const token = await getToken({ template: "default" });
//       const res = await fetch(url, {
//         method,
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(formData),
//       });

//       if (!res.ok) {
//         const text = await res.text();
//         throw new Error(`Erreur ${res.status}: ${text}`);
//       }

//       const data = await res.json();
//       setFormData(data);
//       setSnackbarMessage(`Profil de ${data.full_name} mis à jour !`);
//       setSnackbarSeverity("success");
//       setSnackbarOpen(true);
//       setEditing(false);
//     } catch (err) {
//       console.error("Erreur submit profile:", err);
//       setSnackbarMessage("Erreur réseau ou serveur");
//       setSnackbarSeverity("error");
//       setSnackbarOpen(true);
//     }
//   };

//   const handleSnackbarClose = () => {
//     setSnackbarOpen(false);
//   };

//   return (
//     <Container maxWidth="lg" sx={{ mt: { xs: 8, sm: 10 }, px: { xs: 2, sm: 3 } }}>
//       {/* HEADER GLOBAL */}
//       <Typography variant="h1" gutterBottom align="center">
//         Dashboard Joueur
//       </Typography>

//       {/* GRID EN DEUX COLONNES RESPONSIVE */}
//       <Grid container spacing={4}>
//         {/* Colonne gauche : Gestion des équipes */}
//         <Grid sx={{ display: "flex" }}>
//           <Card sx={{ flex: 1 }}>
//             <CardContent>
//               <Typography variant="h4" gutterBottom>
//                 Gestion des équipes
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 Accédez à vos équipes et gérez leur composition.
//               </Typography>
//               <Typography variant="body1" color="text.secondary">
//                 Accédez à toutes vos fonctionnalités
//               </Typography>
//             </CardContent>
//             <CardActions>
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={() => navigate("/gestion-equipe-player")}
//               >
//                 Accéder
//               </Button>
//             </CardActions>

//             <Grid container spacing={3}>
// 				<Grid>
// 					<Card sx={{ height: "100%" }}>
// 						<CardContent>
// 							<Typography variant="h6" gutterBottom>
// 								🔍 Rechercher une équipe
// 							</Typography>
// 							<Typography variant="body2" color="text.secondary">
// 								Trouvez et rejoignez une équipe pour participer à un tournoi
// 							</Typography>
// 						</CardContent>
// 						<CardActions>
// 							<Button
// 								variant="contained"
// 								startIcon={<SearchIcon />}
// 								onClick={() => navigate("/teams/search")}
// 								fullWidth
// 							>
// 								Rechercher
// 							</Button>
// 						</CardActions>
// 					</Card>
// 				</Grid>

// 				<Grid>
// 					<Card sx={{ height: "100%" }}>
// 						<CardContent>
// 							<Typography variant="h6" gutterBottom>
// 								📋 Mes demandes
// 							</Typography>
// 							<Typography variant="body2" color="text.secondary">
// 								Suivez l'état de vos demandes pour rejoindre des équipes
// 							</Typography>
// 						</CardContent>
// 						<CardActions>
// 							<Button
// 								variant="contained"
// 								startIcon={<MailIcon />}
// 								onClick={() => navigate("/my-requests")}
// 								fullWidth
// 							>
// 								Voir mes demandes
// 							</Button>
// 						</CardActions>
// 					</Card>
// 				</Grid>

// 				<Grid>
// 					<Card sx={{ height: "100%" }}>
// 						<CardContent>
// 							<Typography variant="h6" gutterBottom>
// 								⚽ Mes matchs
// 							</Typography>
// 							<Typography variant="body2" color="text.secondary">
// 								Consultez tous vos matchs à venir et passés
// 							</Typography>
// 						</CardContent>
// 						<CardActions>
// 							<Button
// 								variant="contained"
// 								startIcon={<SportsSoccerIcon />}
// 								onClick={() => navigate("/my-matches")}
// 								fullWidth
// 							>
// 								Voir mes matchs
// 							</Button>
// 						</CardActions>
// 					</Card>
// 				</Grid>
// 			</Grid>

//           </Card>
//         </Grid>

//         {/* Colonne droite : Mon profil */}
//         <Grid sx={{ display: "flex" }}>
//           <Card sx={{ flex: 1 }}>
//             <CardContent>
//               <Typography variant="h4" gutterBottom>
//                 Mon profil
//               </Typography>

//               {loading ? (
//                 <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
//                   <Typography><strong>Nom :</strong></Typography>
//                   <Skeleton variant="text" width="60%" />
//                   <Typography><strong>Ville :</strong></Typography>
//                   <Skeleton variant="text" width="40%" />
//                   <Typography><strong>Sport principal :</strong></Typography>
//                   <Skeleton variant="text" width="50%" />
//                   <Typography><strong>Niveau :</strong></Typography>
//                   <Skeleton variant="text" width="30%" />
//                   <Typography><strong>Poste préféré :</strong></Typography>
//                   <Skeleton variant="text" width="40%" />
//                   <Skeleton variant="rectangular" width={200} height={40} sx={{ mt: 2 }} />
//                 </Box>
//               ) : !editing ? (
//                 <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
//                   <Typography><strong>Nom :</strong> {formData.full_name || "-"}</Typography>
//                   <Typography><strong>Ville :</strong> {formData.city || "-"}</Typography>
//                   <Typography><strong>Sport principal :</strong> {formData.main_sport || "-"}</Typography>
//                   <Typography><strong>Niveau :</strong> {formData.level || "-"}</Typography>
//                   <Typography><strong>Poste préféré :</strong> {formData.preferred_position || "-"}</Typography>
//                 </Box>
//               ) : (
//                 <Box component="form" onSubmit={handleSubmit}>
//                   <TextField fullWidth label="Nom complet" name="full_name" value={formData.full_name} onChange={handleChange} margin="normal" required />
//                   <TextField fullWidth label="Ville" name="city" value={formData.city} onChange={handleChange} margin="normal" required />
//                   <TextField fullWidth label="Sport principal" name="main_sport" value={formData.main_sport} onChange={handleChange} margin="normal" required />
//                   <TextField select fullWidth label="Niveau" name="level" value={formData.level} onChange={handleChange} margin="normal" required>
//                     <MenuItem value="beginner">Débutant</MenuItem>
//                     <MenuItem value="intermediate">Intermédiaire</MenuItem>
//                     <MenuItem value="advanced">Avancé</MenuItem>
//                   </TextField>
//                   <TextField fullWidth label="Poste préféré (optionnel)" name="preferred_position" value={formData.preferred_position || ""} onChange={handleChange} margin="normal" />
//                   <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
//                     <Button type="submit" variant="contained">Sauvegarder</Button>
//                     <Button variant="outlined" onClick={() => setEditing(false)}>Annuler</Button>
//                   </Box>
//                 </Box>
//               )}
//             </CardContent>
//             {!loading && !editing && (
//               <CardActions>
//                 <Button variant="contained" onClick={() => setEditing(true)}>
//                   Modifier mon profil
//                 </Button>
//               </CardActions>
//             )}
//           </Card>
//         </Grid>
//       </Grid>
//       {/* Snackbar */}
//       <Snackbar
//         open={snackbarOpen}
//         autoHideDuration={4000}
//         onClose={handleSnackbarClose}
//         anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
//       >
//         <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
//           {snackbarMessage}
//         </Alert>
//       </Snackbar>
//     </Container>
//   );
// };

// export { DashboardPlayerPage };