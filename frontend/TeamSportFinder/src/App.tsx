/// <reference types="vite/client" />
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import './App.css'

function App() {
  return (
    <>
      <main>
        <h1>TeamSportFinder 🏆</h1>
        <p>Bienvenue sur votre plateforme de gestion de tournois</p>
        
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </main>
    </>
  )
}

export default App
