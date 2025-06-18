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

```bash
git clone https://github.com/ShadowTroll113/Package-Tracer-Frontend.git sigi-frontend
cd sigi-frontend
npm install
```
