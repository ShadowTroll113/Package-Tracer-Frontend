<template>
  <div class="form-container">
    <div class="header">
      <h1>Crear Nueva Ruta</h1>
    </div>
    <button class="green-button back-button" @click="goBack">Volver</button>

    <form @submit.prevent="createRoute">

      <!-- Selección de Almacén (warehouseId) -->
      <div class="form-group" v-if="isAdmin">
        <label for="warehouse">Almacén:</label>
        <select
          id="warehouse"
          v-model.number="route.warehouseId"
          required
        >
          <option :value="null" disabled>Seleccione un almacén</option>
          <option
            v-for="wh in warehouses"
            :key="wh.id"
            :value="wh.id"
          >
            {{ wh.name }} – {{ wh.address.locality }}
          </option>
        </select>
      </div>

      <!-- Almacén actual para usuarios no-admin -->
      <div class="form-group" v-else>
        <label>Almacén:</label>
        <div class="current-warehouse">
          {{ currentWarehouse?.name }} – {{ currentWarehouse?.address.locality }}
        </div>
      </div>

      <div class="form-group">
        <label for="name">Nombre:</label>
        <input id="name" v-model="route.name" type="text" required />
      </div>

      <div class="form-group">
        <label for="details">Detalles:</label>
        <textarea id="details" v-model="route.details" rows="3" required></textarea>
      </div>

      <div class="form-group">
        <label for="truck">Camión asignado:</label>
        <!-- 1) Quitamos .number y ahora v-model liga el objeto completo -->
        <select
          id="truck"
          v-model="route.assignedTruck"
          required
        >
          <option :value="null" disabled>Sin asignar</option>
          <option
            v-for="truck in availableTrucks"
            :key="truck.id"
            :value="truck"
          >
            {{ truck.name }} (ID: {{ truck.id }})
          </option>
        </select>
      </div>

      <button
        class="green-button"
        type="submit"
        :disabled="submitting"
      >
        {{ submitting ? 'Creando…' : 'Crear Ruta' }}
      </button>
    </form>

    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useRoutesStore } from '../store/routes.store';
import { useTruckStore, type Truck } from '../store/truck.store';
import { useBranchStore } from '../store/branch.store';
import { useUsersStore } from '../store/user.store';

const router = useRouter();
const routesStore = useRoutesStore();
const trucksStore = useTruckStore();
const branchStore = useBranchStore();
const userStore = useUsersStore();

// Traer todas las sucursales (incluye almacenes)
branchStore.fetchBranches();

// Reactive DTO: assignedTruck es ahora un objeto Truck o null
const route = reactive<{
  warehouseId?: number;
  name: string;
  details: string;
  assignedTruck: Truck | null;
  startTime?: string;
  estimatedEndTime?: string;
  actualEndTime: string | null;
  status?: string;
  orderIds: number[];
}>({
  warehouseId: undefined,
  name: '',
  details: '',
  assignedTruck: null,
  startTime: undefined,
  estimatedEndTime: undefined,
  actualEndTime: null,
  status: undefined,
  orderIds: []
});

const message = ref('');
const submitting = ref(false);

// Cargar lista de camiones sin ruta
onMounted(async () => {
  try {
    await trucksStore.fetchTrucks();
  } catch (e) {
    console.error('Error cargando camiones:', e);
  }
});

const availableTrucks = computed(() =>
  trucksStore.trucks.filter(t => t.routeId == null)
);

const isAdmin = computed(() => userStore.user?.branchId === -1);

const warehouses = computed(() =>
  branchStore.branches.filter(b => b.type === 'Almacen')
);

const currentWarehouse = computed(() =>
  warehouses.value.find(w => w.id === userStore.user?.branchId) || null
);

const nowIso = () => new Date().toISOString();
const estimateEnd = () => {
  const dt = new Date();
  dt.setHours(dt.getHours() + 1);
  return dt.toISOString();
};

async function createRoute() {
  submitting.value = true;
  message.value = '';

  // Seleccionar warehouseId según rol
  const selectedWarehouse = isAdmin.value
    ? route.warehouseId
    : userStore.user?.branchId;

  // Validar campos (ahora assignedTruck es objeto)
  if (
    selectedWarehouse == null ||
    !route.name ||
    !route.details
  ) {
    alert('Completa todos los campos requeridos.');
    submitting.value = false;
    return;
  }

  // Construir DTO, enviamos el objeto completo de Camión
  const dto = {
    warehouseId: selectedWarehouse,
    name: route.name,
    details: route.details,
    startTime: nowIso(),
    estimatedEndTime: estimateEnd(),
    actualEndTime: null,
    assignedTruck: route.assignedTruck,
    status: 'en espera',
    orderIds: []
  };

  try {
    await routesStore.addRoute(dto);
      message.value = 'Ruta creada exitosamente.';
    setTimeout(() => router.push('/route/list'), 500);
  } catch (error) {
    console.error('Error al crear la ruta:', error);
    message.value = 'Ocurrió un error al crear la ruta.';
  } finally {
    submitting.value = false;
  }
}

function goBack() {
  router.push('/main');
}
</script>

<style scoped>
@import './CreateProduct.css';

.form-container {
  width: 600px;
  max-width: 100%;
  padding: 20px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin: 0 auto;
}
.header h1 {
  margin-bottom: 20px;
  font-size: 24px;
  color: #333;
}
.back-button {
  margin-bottom: 20px;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}
.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.green-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.message {
  margin-top: 15px;
  color: #28a745;
  font-weight: 500;
}
.current-warehouse {
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
}
</style>
