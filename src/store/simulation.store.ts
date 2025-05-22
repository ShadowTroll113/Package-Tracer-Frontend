// src/stores/simulation.store.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export interface Coordinate {
  lat: number
  lng: number
}

export const useSimulationStore = defineStore('simulation', () => {
  // — State —
  const simulatedTrucks = ref<number[]>([]) // IDs de camiones en simulación
  const intervalMs = ref<number>(3000)      // intervalo global (ms)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // — Actions —

  /**
   * Inicia la simulación para un camión (solo una vez).
   * POST /api/sim/start/{truckId}
   */
  const startSimulation = async (truckId: number) => {
    isLoading.value = true
    error.value = null
    try {
      await axios.post(`/api/sim/start/${truckId}`)
      if (!simulatedTrucks.value.includes(truckId)) {
        simulatedTrucks.value.push(truckId)
      }
    } catch (err: any) {
      console.error('Error iniciando simulación:', err)
      error.value = 'No se pudo iniciar la simulación.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Añade una ruta de coordenadas a la simulación de un camión.
   * POST /api/sim/{truckId}/route
   */
  const addRoute = async (truckId: number, route: Coordinate[]) => {
    isLoading.value = true
    error.value = null
    try {
      await axios.post(`/api/sim/${truckId}/route`, route)
    } catch (err: any) {
      console.error('Error añadiendo ruta:', err)
      error.value = 'No se pudo añadir la ruta al simulador.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Recupera la ruta completa almacenada en el simulador para dibujarla.
   * GET /api/sim/{truckId}/route
   */
  const getRoute = async (truckId: number): Promise<Coordinate[]> => {
    isLoading.value = true
    error.value = null
    try {
      const resp = await axios.get<Coordinate[]>(`/api/sim/${truckId}/route`)
      return resp.data
    } catch (err: any) {
      console.error('Error obteniendo ruta simulada:', err)
      error.value = 'No se pudo obtener la ruta simulada.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Cambia el intervalo global de la simulación (ms).
   * POST /api/sim/interval?ms={ms}
   */
  const setIntervalMs = async (ms: number) => {
    isLoading.value = true
    error.value = null
    try {
      await axios.post(`/api/sim/interval`, null, { params: { ms } })
      intervalMs.value = ms
    } catch (err: any) {
      console.error('Error ajustando intervalo:', err)
      error.value = 'No se pudo cambiar la velocidad de simulación.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    // state
    simulatedTrucks,
    intervalMs,
    isLoading,
    error,
    // actions
    startSimulation,
    addRoute,
    getRoute,
    setIntervalMs,
  }
})
