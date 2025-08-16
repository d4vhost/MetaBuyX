import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,   // escucha todas las interfaces de red
    port: 5173,   // puedes dejar el puerto por defecto o cambiarlo
  },
})
