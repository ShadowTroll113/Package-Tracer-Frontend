import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

axios.defaults.baseURL = 'http://localhost:8080'

export interface Truck {
  id: number
  name: string
  routeId: number | null
  latitude: number
  longitude: number
}

export const useTruckStore = defineStore('trucks', () => {
  const trucks = ref<Truck[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Obtiene todos los camiones desde el backend
  const fetchTrucks = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response = await axios.get<Truck[]>('/api/trucks')
      trucks.value = response.data
    } catch (err: any) {
      console.error('Error fetching trucks:', err)
      error.value = 'No se pudieron cargar los camiones.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Crea un camión en el backend
  const addTruck = async (truckData: any) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await axios.post<Truck>('/api/trucks', truckData)
      trucks.value.push(response.data)
    } catch (err: any) {
      console.error('Error adding truck:', err)
      error.value = 'No se pudo crear el camión.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateTruck = async (id: number, data: Partial<Truck>) => {
    isLoading.value = true
    error.value = null
    try {
      const existing = trucks.value.find(t => t.id === id)
      if (!existing) throw new Error(`Camión ${id} no encontrado`)
      const fullTruck: Truck = {
        ...existing,
        ...data,
        id
      }
      const payload = { id, truck: fullTruck }
      const res = await axios.put<Truck>(`/api/trucks/${id}`, payload)
      const idx = trucks.value.findIndex(t => t.id === id)
      if (idx !== -1) trucks.value.splice(idx, 1, res.data)
    } catch (e: any) {
      console.error('Error updating truck:', e)
      error.value = 'No se pudo actualizar el camión.'
      throw e
    } finally {
      isLoading.value = false
    }
  }
  return {
    trucks,
    isLoading,
    error,
    fetchTrucks,
    updateTruck,
    addTruck
  }
})
