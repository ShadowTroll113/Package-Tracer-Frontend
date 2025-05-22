import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5173", // Dirección del backend (o cualquier API)
        changeOrigin: true, // Cambia el origen para evitar problemas de CORS
        secure: false, // Si usas HTTPS pero no tienes un certificado válido
        rewrite: (path) => path.replace(/^\/api/, ""), // Opcional: reescribe la ruta
      },
    },
  },
});
