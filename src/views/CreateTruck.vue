<template>
  <div class="form-container">
    <div class="header">
      <h1>Dar de Alta Camión</h1>
    </div>
    <button class="green-button back-button" @click="goBack">Volver</button>

    <form @submit.prevent="handleCreateTruck">
      <!-- Selección de Almacén sólo para admin -->
      <div class="form-group" v-if="isAdmin">
        <label for="warehouse">Almacén:</label>
        <select
          id="warehouse"
          v-model.number="selectedWarehouseId"
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

      <!-- Almacén fijo para usuario normal -->
      <div class="form-group" v-else>
        <label>Almacén:</label>
        <div class="current-warehouse">
          {{ currentWarehouse?.name }} – {{ currentWarehouse?.address.locality }}
        </div>
      </div>

      <div class="form-group">
        <label for="name">Nombre del Camión:</label>
        <input
          id="name"
          v-model="truckName"
          type="text"
          required
          placeholder="Ej. Camión 001"
        />
      </div>

      <div class="form-group">
        <label for="route">Ruta Asignada (opcional):</label>
        <select id="route" v-model.number="selectedRouteId">
          <option :value="null">Sin asignar</option>
          <option
            v-for="route in availableRoutes"
            :key="route.id"
            :value="route.id"
          >
            {{ route.name }}
          </option>
        </select>
      </div>

      <button
        class="green-button"
        type="submit"
        :disabled="submitting"
      >
        {{ submitting ? 'Creando…' : 'Crear Camión' }}
      </button>
    </form>

    <div v-if="message" class="message">{{ message }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTruckStore } from '../store/truck.store';
import { useRoutesStore } from '../store/routes.store';
import { useBranchStore } from '../store/branch.store';
import { useUsersStore } from '../store/user.store';
import type { Route } from '../interfaces/Route';
import type { Branch } from '../interfaces/Branch';

const router = useRouter();
const truckStore = useTruckStore();
const routesStore = useRoutesStore();
const branchStore = useBranchStore();
const userStore = useUsersStore();

const truckName = ref<string>('');
const selectedRouteId = ref<number | null>(null);
const selectedWarehouseId = ref<number | null>(null);
const message = ref<string>('');
const submitting = ref<boolean>(false);

// Fetch inicial de rutas, camiones y sucursales
onMounted(async () => {
  await Promise.all([
    routesStore.fetchRoutes(),
    truckStore.fetchTrucks(),
    branchStore.fetchBranches()
  ]);
});

// Computed para saber si es admin (branchId = -1)
const isAdmin = computed(() => userStore.user?.branchId === -1);

// Lista de almacenes (type === 'Almacen')
const warehouses = computed<Branch[]>(() =>
  branchStore.branches.filter(b => b.type === 'Almacen')
);

// Almacén asignado al usuario normal
const currentWarehouse = computed<Branch | null>(() =>
  warehouses.value.find(w => w.id === userStore.user?.branchId) || null
);

// Rutas disponibles (sin camión asignado)
const availableRoutes = computed<Route[]>(() =>
  routesStore.routes.filter(r => !r.assignedTruck)
);

async function handleCreateTruck() {
  message.value = '';

  // Validaciones básicas
  if (!truckName.value.trim()) {
    message.value = 'El nombre del camión es obligatorio.';
    return;
  }

  // Determinar warehouseId según admin o no
  const warehouseId = isAdmin.value
    ? selectedWarehouseId.value
    : userStore.user?.branchId;

  if (warehouseId == null) {
    message.value = 'Debes seleccionar un almacén.';
    return;
  }

  // Validar que la ruta no tenga camión
  if (
    selectedRouteId.value !== null &&
    truckStore.trucks.some(t => t.routeId === selectedRouteId.value)
  ) {
    message.value = 'Esta ruta ya tiene un camión asignado.';
    return;
  }

  submitting.value = true;
  try {
    await truckStore.addTruck({
      name: truckName.value.trim(),
      routeId: selectedRouteId.value,
      warehouseId:warehouseId,
    });
    message.value = 'Camión creado exitosamente.';
    setTimeout(() => router.push('/main'), 1500);
  } catch (err) {
    console.error(err);
    message.value = 'Error al crear el camión.';
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
  max-width: 600px;
  margin: 0 auto;
}
.back-button {
  margin-bottom: 20px;
}
.message {
  margin-top: 15px;
  color: green;
}
.current-warehouse {
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
}
</style>
