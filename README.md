# SIGI Frontend

Interfaz web del **Sistema Integral de Gestión de Inventarios (SIGI)**, desarrollada con Vue 3 y Vite para ofrecer una experiencia ágil y reactiva en la gestión de stock, pedidos y rutas de reparto.

**Software libre**

## Características principales

- Componentes modulares organizados en **Views**, **Stores**, **Router**, **Interfaces** y **Assets**.  
- **State management** con Pinia (o Vuex, según configuración) y patrón Domain-Driven Design (DDD).  
- Navegación gestionada por **Vue Router** con rutas protegidas según roles (admin, tienda, almacén).  
- Mapas interactivos integrados con **Leaflet** y **Leaflet Routing Machine**, usando Nominatim para geocoding y OpenRouteService para cálculo de rutas.  
- Clustering de marcadores con `leaflet.markercluster` y actualización en tiempo real de posiciones de camiones con `leaflet.realtime`.  
- **TypeScript** en `.vue` gracias a `vue-tsc` y Volar para autocompletado y chequeo de tipos.

## Requisitos

- Node.js ≥ 16  
- npm ≥ 8 (o yarn ≥ 1.22)  
- VSCode + extensión [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

## Instalación

```
git clone https://github.com/ShadowTroll113/Package-Tracer-Frontend.git sigi-frontend
cd sigi-frontend
npm install
```
Desarrollo
Servidor de desarrollo con hot-reload
```
npm run dev
```
Abre http://localhost:5173 en el navegador; los cambios se recargan automáticamente.

Compilación para producción
```
npm run build
```
Genera los archivos optimizados en la carpeta dist/.

Estructura del proyecto
```
src/
├─ assets/         # Imágenes e iconos
├─ components/     # Componentes reutilizables
├─ interfaces/     # Modelos y tipos TypeScript
├─ router/         # Definición de rutas
├─ stores/         # State management (Pinia/Vuex)
├─ views/          # Vistas principales
├─ App.vue         # Componente raíz
└─ main.ts         # Punto de entrada
```
Enlaces de interés
Repositorio Frontend: https://github.com/ShadowTroll113/Package-Tracer-Frontend

Repositorio Backend: https://github.com/ShadowTroll113/PackageTrackerBackend

Demo en vídeo: https://drive.google.com/file/d/1p2tnTumy5I_rhqN_maW_lE1ZPPXW6_m_/view?usp=sharing
