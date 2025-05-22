import { createApp } from "vue"
import { createPinia } from "pinia"
import piniaPluginPersistedState from "pinia-plugin-persistedstate" // Importar el plugin de persistencia
import "./assets/main.css"
import "leaflet/dist/leaflet.css"


import App from "./App.vue"
import router from "./router"

// Crea una instancia de Pinia
const pinia = createPinia()
pinia.use(piniaPluginPersistedState) // Usar el plugin de persistencia

// Crea la aplicación y registra Pinia y Vue Router
const app = createApp(App)
app.use(pinia) // Registra Pinia globalmente
app.use(router) // Registra Vue Router
// Monta la aplicación
app.mount("#app")
