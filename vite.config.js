import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

// base './' permite desplegar en cualquier carpeta; la app usa rutas con hash (#/explorar)
export default defineConfig({ base: './', plugins: [tailwindcss()] });
