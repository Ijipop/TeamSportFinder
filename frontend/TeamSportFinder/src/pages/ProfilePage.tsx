import { useAuth } from "../contexts/AuthContext";
import { PlayerProfilePage } from "./PlayerProfilePage";
import { OrganizerProfilePage } from "./OrganizerProfilePage";

const ProfilePageRouter: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  if (user.role === "player") {
    return <PlayerProfilePage />;
  } else if (user.role === "organizer") {
    return <OrganizerProfilePage />;
  } else {
    return <div>Rôle inconnu</div>;
  }
};

export { ProfilePageRouter };
// import React from "react";
// import { Box, Button, Container, Typography } from "@mui/material";
// import { useAuth } from "../contexts/AuthContext";
// import { useNavigate } from "react-router-dom";

// const ProfilePage: React.FC = () =>
// {
// 	const navigate = useNavigate();
// 	const { user, logout, refreshUser } = useAuth();
	
// 	const confirmLogout = async () =>
// 	{
//         await logout();
//         // setOpenDialog(false);
// 		localStorage.removeItem("auth_token");
// 		navigate("/");
//     };
	
// 	return (
// 		<Container
// 			maxWidth="lg"
// 			sx={{
// 				mt: { xs: 8, sm: 10 }, // Compensation pour AppBar fixe
// 				px: { xs: 2, sm: 3 },
// 			}}
// 		>
// 			<Typography variant="h1">ProfilePage</Typography>
// 			<Button onClick={confirmLogout} color="error" variant="contained">
//                 {"Déconnexion"}
//             </Button>
// 		</Container>
// 	);
// };

// export { ProfilePage };
