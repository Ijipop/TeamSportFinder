import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Chercher le fichier .env à la racine du projet
  envDir: resolve(fileURLToPath(new URL('.', import.meta.url)), '../..'),
  resolve: {
    // Forcer une seule copie de React pour éviter les erreurs "Invalid hook call"
    dedupe: ['react', 'react-dom'],
  },
})
