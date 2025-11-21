// Composant Layout principal
import { Box } from "@mui/material";
import React from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";

interface LayoutProps
{
    children: React.ReactNode;
    darkMode: boolean;
    toggleDarkMode: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, darkMode, toggleDarkMode }) =>
{
    return (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            <Box component="main" sx={{ flexGrow: 1 }}>
                {children}
            </Box>
            <Footer />
        </Box>
    );
};

export { Layout };

// export const Layout: React.FC<LayoutProps> = ({ children }) =>
// {
//     return (
//         <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
//             <Header darkMode={false} toggleDarkMode={() => {}} />
//             <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
//                 <Container maxWidth="lg">{children}</Container>
//             </Box>
//         </Box>
//     );
// };
