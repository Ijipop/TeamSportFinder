import "./App.css";

import { AppRouter } from "./router/AppRouter";

function App()
{
    return <AppRouter />;
}

export default App;

// /// <reference types="vite/client" />
// import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
// import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
// import { Container, Typography, Box } from '@mui/material'
// import './App.css'

// // Configuration du thème Material UI
// const theme = createTheme({
//   palette: {
//     mode: 'light',
//     primary: {
//       main: '#1976d2',
//     },
//     secondary: {
//       main: '#dc004e',
//     },
//   },
// })

// function App() {
//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <Container maxWidth="lg" className="min-h-screen flex items-center justify-center">
//         <Box className="text-center">
//           <Typography 
//             variant="h2" 
//             component="h1" 
//             className="mb-4 font-bold text-blue-600"
//             sx={{ mb: 2 }}
//           >
//             TeamSportFinder 🏆
//           </Typography>
//           <Typography 
//             variant="h6" 
//             component="p" 
//             className="mb-6 text-gray-600"
//             sx={{ mb: 4 }}
//           >
//             Bienvenue sur votre plateforme de gestion de tournois
//           </Typography>
          
//           <Box className="flex justify-center gap-4">
//             <SignedOut>
//               <SignInButton />
//             </SignedOut>
//             <SignedIn>
//               <UserButton />
//             </SignedIn>
//           </Box>
//         </Box>
//       </Container>
//     </ThemeProvider>
//   )
// }

// export default App
