import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Standard clean Vite configuration
export default defineConfig({
  plugins: [react()],
});