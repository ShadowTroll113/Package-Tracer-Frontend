<!-- src/views/MapView.vue -->
<template>
  <div class="page-container">
    <h3>Mapa Interactivo</h3>
    <div class="map-container" ref="mapContainer"></div>
    <div class="button-group">
      <button class="btn" @click="startSimulationAll">Iniciar Simulación</button>
      <button class="btn" @click="setInterval2000">x1 (5000 ms)</button>
      <button class="btn" @click="setInterval1000">x2 (2500 ms)</button>
      <button class="btn" @click="setInterval500">x5 (1000 ms)</button>
    </div>
    <button class="green-button back-button" @click="goToMain">
      Volver al Menú Principal
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useMapStore } from '../store/map.store'

export default defineComponent({
  setup() {
    const router = useRouter()
    const mapContainer = ref<HTMLElement | null>(null)
    const mapStore = useMapStore()

    onMounted(() => {
      if (!mapContainer.value) return
      mapStore.initMap(mapContainer.value)
      mapStore.addBranches()
      mapStore.startPolling()
    })

    onBeforeUnmount(() => {
      mapStore.stopPolling()
    })

    const goToMain = () => {
      router.push('/main')
    }

    const startSimulationAll = async () => {
      await mapStore.simulateAllRoutes()
    }

    const setInterval2000 = async () => {
      await mapStore.setSimulationInterval(5000)
    }

    const setInterval1000 = async () => {
      await mapStore.setSimulationInterval(2500)
    }

    const setInterval500 = async () => {
      await mapStore.setSimulationInterval(1000)
    }

    return {
      mapContainer,
      goToMain,
      startSimulationAll,
      setInterval2000,
      setInterval1000,
      setInterval500
    }
  }
})
</script>

<style scoped>
@import 'leaflet/dist/leaflet.css';

.page-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  background-color: #f8f8f8;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.map-container {
  height: 70vh;
  border-radius: 8px;
}

.button-group {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

.btn:hover {
  background-color: #0056b3;
}

/* clases existentes */
.green-button {
  background-color: #28a745;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.green-button:hover {
  background-color: #218838;
}

.back-button {
  align-self: start;
}
</style>
