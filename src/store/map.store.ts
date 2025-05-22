// src/stores/map.store.ts
import { defineStore } from 'pinia'
import { ref, Ref, watch } from 'vue'
import axios from 'axios'
import L, { Map as LeafletMap, Marker, Icon, LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine'
import truckSvgUrl from '@/assets/truck.svg'
import storeSvgUrl from '@/assets/store.svg'
import warehouseSvgUrl from '@/assets/warehouse.svg'
import { useBranchStore } from './branch.store'
import type { Branch } from '../interfaces/Branch'
import { useRoutesStore } from './routes.store'
import { useSimulationStore } from './simulation.store'

axios.defaults.baseURL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export interface TruckMap {
  id: number
  name: string
  routeId: number | null
  latitude: number
  longitude: number
  timestamp: string
}

export interface Coordinate {
  lat: number
  lng: number
}

export const useMapStore = defineStore('map', () => {
  // — STATE —
  const map: Ref<LeafletMap | null> = ref(null)
  const markers: Record<string, Marker> = {}
  const branchMarkers: Record<string, Marker> = {}
  const routingControl: Ref<L.Control | null> = ref(null)
  let intervalId: ReturnType<typeof setInterval> | null = null

  // Cache de rutas completas (truckId → LatLngExpression[])
  const routeCache: Record<number, LatLngExpression[]> = {}

  // Otros stores
  const branchStore = useBranchStore()
  const routesStore = useRoutesStore()
  const simulationStore = useSimulationStore()

  // Íconos
  const defaultBranchIcon = new Icon.Default()
  const warehouseIcon = new Icon({
    iconUrl: warehouseSvgUrl,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })
  const storeIcon = new Icon({
    iconUrl: storeSvgUrl,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })
  const truckIcon = new Icon({
    iconUrl: truckSvgUrl,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  })

  // — HELPERS DE RUTA —

  function clearRoute() {
    if (!map.value) return
    if (routingControl.value) {
      map.value.removeControl(routingControl.value)
      routingControl.value = null
    }
  }

  function drawRoute(waypoints: LatLngExpression[]) {
    if (!map.value) return
    clearRoute()
    routingControl.value = (L as any).Routing.control({
      waypoints: waypoints.map(p => L.latLng(p)),
      routeWhileDragging: false,
      createMarker: () => null,
      lineOptions: { styles: [{ weight: 6, opacity: 1 }], addWaypoints: false },
    }).addTo(map.value)
  }

  /**
   * Anima el movimiento de un marker de su posición actual a `target`,
   * interpolando sobre `duration` milisegundos.
   */
  function animateMarker(
    marker: Marker,
    target: LatLngExpression,
    duration = 1000
  ) {
    const start = marker.getLatLng()
    const end = L.latLng(target)
    const startTime = performance.now()

    function step(now: number) {
      const t = Math.min(1, (now - startTime) / duration)
      const lat = start.lat + (end.lat - start.lat) * t
      const lng = start.lng + (end.lng - start.lng) * t
      marker.setLatLng([lat, lng])
      if (t < 1) {
        requestAnimationFrame(step)
      }
    }
    requestAnimationFrame(step)
  }

  /**
   * Calcula y cachea la ruta completa si no existe.
   */
  async function ensureRouteCached(truckId: number): Promise<LatLngExpression[]> {
    if (routeCache[truckId]) {
      return routeCache[truckId]
    }
    const dto = await routesStore.getRoute(truckId)
    if (!dto) {
      throw new Error(`No hay datos de ruta para camión ${truckId}`)
    }
    const raw: LatLngExpression[] = [
      [dto.warehouse.latitude, dto.warehouse.longitude],
      ...dto.stops.map((s: { latitude: number; longitude: number }) => [s.latitude, s.longitude] as [number, number]),
    ]
    return new Promise((resolve, reject) => {
      if (!map.value) return reject(new Error('Mapa no inicializado'))
      const ctl = (L as any).Routing.control({
        waypoints: raw.map(p => L.latLng(p)),
        routeWhileDragging: false,
        createMarker: () => null,
        lineOptions: { styles: [{ weight: 6, opacity: 1 }], addWaypoints: false },
      })
      ctl.on('routesfound', (e: any) => {
        const coords: LatLngExpression[] = e.routes[0].coordinates.map(
          (c: L.LatLng) => [c.lat, c.lng]
        )
        routeCache[truckId] = coords
        ctl.remove()
        resolve(coords)
      })
      ctl.on('routingerror', (err: any) => {
        ctl.remove()
        reject(err)
      })
      map.value.addControl(ctl)
    })
  }

  /**
   * Click en camión: pinta solo primer + último punto.
   */
  async function onTruckClick(id: string) {
    const truckId = Number(id)
    try {
      const full = await ensureRouteCached(truckId)
      // tomar solo endpoints para dibujo
      const endpoints: LatLngExpression[] =
        full.length >= 2 ? [full[0], full[full.length - 1]] : full
      drawRoute(endpoints)
    } catch (err) {
      console.error('Error pintando ruta del camión', truckId, err)
    }
  }

  // — HELPERS DE MARCADORES —

  function updateTruckMarker(id: string, latitude: number, longitude: number) {
    if (!map.value) return
    const pos: LatLngExpression = [latitude, longitude]
    let m = markers[id]
    if (m) {
      // animamos hacia la nueva posición
      animateMarker(m, pos, 1000)
    } else {
      m = L.marker(pos, { icon: truckIcon }).addTo(map.value)
      m.on('click', () => onTruckClick(id))
      markers[id] = m
    }
  }

  function removeStaleMarkers(activeIds: string[]) {
    Object.keys(markers).forEach(id => {
      if (!activeIds.includes(id)) {
        map.value?.removeLayer(markers[id])
        delete markers[id]
      }
    })
  }

  // — SIMULACIÓN —

  async function simulateAllRoutes() {
    try {
      const resp = await axios.get<TruckMap[]>('/api/trucks/active')
      const trucks = resp.data
      await Promise.all(
        trucks.map(async t => {
          const full = await ensureRouteCached(t.id)
          await simulationStore.startSimulation(t.id)
          const simRoute: Coordinate[] = full.map(pt => {
            const [lat, lng] = pt as [number, number]
            return { lat, lng }
          })
          await simulationStore.addRoute(t.id, simRoute)
        })
      )
    } catch (e) {
      console.error('Error iniciando simulación global:', e)
    }
  }

  async function setSimulationInterval(ms: number) {
    try {
      await axios.post('/api/sim/interval', null, { params: { ms } })
    } catch (e) {
      console.error('Error ajustando intervalo de simulación:', e)
    }
  }

  // — POLLING de camiones —

  async function fetchActiveTrucks() {
    try {
      const resp = await axios.get<TruckMap[]>('/api/trucks/active')
      const data = resp.data
      const ids = data.map(t => String(t.id))
      data.forEach(t =>
        updateTruckMarker(String(t.id), t.latitude, t.longitude)
      )
      removeStaleMarkers(ids)
    } catch (e) {
      console.error('Error fetching active trucks:', e)
    }
  }

  function startPolling() {
    fetchActiveTrucks()
    intervalId = setInterval(fetchActiveTrucks, 1000)
  }

  function stopPolling() {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  // — BRANCHES y MAPA —

  watch(
    () => branchStore.branches,
    () => {
      if (!map.value) return
      Object.values(branchMarkers).forEach(m => map.value!.removeLayer(m))
      Object.keys(branchMarkers).forEach(k => delete branchMarkers[k])
      addBranches()
    },
    { immediate: true }
  )

  function addBranches() {
    if (!map.value) return
    branchStore.branches.forEach(branch => {
      const id = String(branch.id)
      if (branchMarkers[id]) return
      const { latitude, longitude } = branch.address
      if (latitude == null || longitude == null) return
      const icon =
        branch.type === 'Almacen'
          ? warehouseIcon
          : branch.type === 'Tienda'
          ? storeIcon
          : defaultBranchIcon
      const marker = L.marker([latitude, longitude], { icon }).addTo(map.value!)
      marker.bindTooltip(branch.name, { permanent: false, direction: 'top' })
      branchMarkers[id] = marker
    })
  }

  function addBranch(branch: Branch) {
    if (!map.value) return
    const id = String(branch.id)
    if (branchMarkers[id]) return
    const { latitude, longitude } = branch.address
    if (latitude == null || longitude == null) return
    const marker = L.marker([latitude, longitude], { icon: defaultBranchIcon }).addTo(
      map.value!
    )
    marker.bindTooltip(branch.name, { permanent: false, direction: 'top' })
    branchMarkers[id] = marker
  }

function initMap(
  container: HTMLElement | string,
  center: LatLngExpression = [40.416775, -3.70379],
  zoom = 12
) {
  if (map.value) {
    // 1) Quita la ruta activa
    clearRoute()

    // 2) Borra todos los markers del mapa viejo
    Object.values(markers).forEach(m => map.value!.removeLayer(m))
    Object.values(branchMarkers).forEach(m => map.value!.removeLayer(m))

    // 3) Vacía los caches para que addBranches/fetchActiveTrucks los repueblen
    Object.keys(markers).forEach(k => delete markers[k])
    Object.keys(branchMarkers).forEach(k => delete branchMarkers[k])

    // 4) Destruye el map antiguo
    map.value.remove()
  }

  // 5) Inicializa uno nuevo
  map.value = L.map(container).setView(center, zoom)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map.value)

  // 6) Forzar repaint
  setTimeout(() => map.value?.invalidateSize(), 100)

  // 7) Añade sucursales y dispara el primer fetch de camiones
  addBranches()
  fetchActiveTrucks()
}


  return {
    map,
    initMap,
    startPolling,
    stopPolling,
    clearRoute,
    drawRoute,
    addBranches,
    addBranch,
    simulateAllRoutes,
    setSimulationInterval,
  }
})
