import React from "react";
import { Container, Typography, Button } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const ProfileOrganizerPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const confirmLogout = async () => {
    await logout();
    localStorage.removeItem("auth_token");
    navigate("/");
  };

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 8, sm: 10 }, px: { xs: 2, sm: 3 } }}>
      <Typography variant="h1">Profil Organisateur</Typography>
      <Button onClick={confirmLogout} color="error" variant="contained">
        Déconnexion
      </Button>
    </Container>
  );
};

export { ProfileOrganizerPage };