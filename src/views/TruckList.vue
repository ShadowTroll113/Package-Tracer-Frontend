<!-- src/views/TruckList.vue -->
<template>
  <div class="order-list-container">
    <div class="header">
      <h1>Lista de Camiones</h1>
    </div>
    <button class="green-button back-button" @click="goToMain">Volver</button>

    <!-- Formulario de edición -->
    <div v-if="editingId !== null" class="form-container">
      <h2>Editar Camión {{ editingId }}</h2>
      <div class="form-row">
        <label>Nombre:</label>
        <input v-model="editedTruck.name" />
      </div>
      <p class="message">La ruta solo puede ser modificada desde la lista de rutas para evitar inconsistencias.</p>
      <button class="green-button" @click="saveEdit">Guardar</button>
      <button class="red-button" @click="cancelEdit">Cancelar</button>
    </div>

    <table class="order-list">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Ruta Asignada</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="truck in trucks" :key="truck.id">
          <td>{{ truck.id }}</td>
          <td>{{ truck.name }}</td>
          <td>{{ truck.routeId ?? 'Sin ruta' }}</td>
          <td class="actions-cell">
            <button class="green-button back-button" @click="startEdit(truck)">Editar</button>
          </td>
        </tr>
        <tr v-if="!isLoading && trucks.length === 0">
          <td colspan="4" class="no-products">No hay camiones disponibles.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTruckStore, Truck } from '../store/truck.store'

const router = useRouter()
const truckStore = useTruckStore()

// estado de lista
const trucks    = computed(() => truckStore.trucks)
const isLoading = computed(() => truckStore.isLoading)

// edición
const editingId   = ref<number | null>(null)
const editedTruck = reactive<Partial<Truck>>({})

function startEdit(truck: Truck) {
  editingId.value = truck.id
  Object.assign(editedTruck, truck)
}

function cancelEdit() {
  editingId.value = null
  Object.keys(editedTruck).forEach(key => {
    delete (editedTruck as any)[key]
  })
}


async function saveEdit() {
  if (editingId.value == null) return
  try {
    await truckStore.updateTruck(editingId.value, {
      name: editedTruck.name!,
      routeId: editedTruck.routeId ?? null,
      latitude: editedTruck.latitude!,
      longitude: editedTruck.longitude!
    })
    cancelEdit()
  } catch {
    alert('Error al actualizar el camión.')
  }
}

onMounted(() => {
  truckStore.fetchTrucks()
})


const goToMain = () => router.push('/main')
</script>

<style scoped>
@import './OrderList.css';



.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px; /* fondo negro */
  color: #000;              /* texto blanco */
  padding: 8px;             /* algo de padding para verse bien */
  border-radius: 4px;

}

.form-row label {
  width: 50px;
  font-weight: bold;
}

.form-row input {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

.red-button {
  background-color: #dc3545;
  color: white;
}

.red-button:hover {
  background-color: #c82333;
}
.message{
  color: #000;
}
</style>
