/// <reference types="vite/client" />
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import './App.css'

import { ClerkProviderWrapper } from "./clerk/client";
import { AppRouter } from "./router/AppRouter";

function App()
{
    return (
        <ClerkProviderWrapper>
            <AppRouter />
        </ClerkProviderWrapper>
    );
}

export default App;
