<template>
  <div class="order-list-container">
    <div class="header">
      <h1>Lista de Rutas</h1>
    </div>
    <button class="green-button back-button" @click="goToMain">Volver</button>

    <!-- Mensaje de estado -->
    <p v-if="message" class="status-message">{{ message }}</p>

    <!-- Tabla de rutas con scroll interno -->
    <table class="order-list">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Estado</th>
          <th>Detalles</th>
          <th>Inicio</th>
          <th>Fin Estimado</th>
          <th>Camión</th>
          <th>Pedidos</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="route in routes" :key="route.id">
          <td>{{ route.id }}</td>
          <td>{{ route.name }}</td>
          <td>{{ route.status || 'Sin estado' }}</td>
          <td>{{ route.details || '—' }}</td>
          <td>{{ formatDate(route.startTime) }}</td>
          <td>{{ formatDate(route.estimatedEndTime) }}</td>
          <td>
            {{ route.assignedTruck
               ? `${route.assignedTruck.name} (ID: ${route.assignedTruck.id})`
               : 'Sin asignar' }}
          </td>
          <td>
            <ul class="order-products">
              <li v-for="order in getOrdersForRoute(route.id)" :key="order.id">
                #{{ order.id }} ({{ order.status }})
              </li>
              <li v-if="!getOrdersForRoute(route.id).length">—</li>
            </ul>
          </td>
          <td class="actions-cell">
            <!-- Estado "en espera": muestro todas las acciones -->
            <template v-if="route.status === 'en espera'">
              <button
                v-if="!route.assignedTruck"
                class="green-button"
                @click="openAssignModal(route)"
              >
                Asignar Camión
              </button>

              <button
                v-else
                class="green-button"
                :disabled="removingId === route.id"
                @click="removeTruck(route)"
              >
                {{ removingId === route.id ? 'Eliminando…' : 'Eliminar Camión' }}
              </button>

              <button
                class="green-button"
                @click="addOrderToRoute"
              >
                Añadir Pedido
              </button>

              <button
                class="green-button"
                @click="desplegarRoute(route)"
              >
                Desplegar
              </button>
            </template>

            <!-- Estado "en camino": muestro solo "Ver en el mapa" -->
            <template v-else-if="route.status === 'en camino'">
              <button
                class="green-button"
                @click="viewOnMap(route)"
              >
                Ver en el mapa
              </button>
            </template>
          </td>
        </tr>
        <tr v-if="routes.length === 0">
          <td colspan="9" class="no-products">No hay rutas disponibles.</td>
        </tr>
      </tbody>
    </table>

    <!-- Modal de asignación -->
    <div v-if="showAssignModal" class="modal-overlay">
      <div class="modal-content">
        <h2>Asignar camión a ruta “{{ routeToAssign?.name }}”</h2>
        <ul class="order-products">
          <li v-for="truck in availableTrucks" :key="truck.id">
            {{ truck.name }} (ID: {{ truck.id }})
            <button class="green-button small" @click="selectTruck(truck)">Seleccionar</button>
          </li>
          <li v-if="availableTrucks.length === 0">No hay camiones disponibles.</li>
        </ul>
        <button class="green-button outline" @click="closeAssignModal">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRoutesStore } from '../store/routes.store';
import { useOrderStore } from '../store/order.store';
import { useTruckStore, type Truck } from '../store/truck.store';
import type { Route } from '../interfaces/Route';

const router = useRouter();
const routesStore = useRoutesStore();
const orderStore = useOrderStore();
const truckStore = useTruckStore();

const routes = computed(() => routesStore.routes);
const orders = computed(() => orderStore.orders);
const availableTrucks = computed(() =>
  truckStore.trucks.filter(t => t.routeId == null)
);

const showAssignModal = ref(false);
const routeToAssign = ref<Route | null>(null);
const removingId = ref<number | null>(null);
const message = ref<string | null>(null);

const goToMain = () => router.push('/main');
const getOrdersForRoute = (id: number) =>
  orders.value.filter(o => o.routeId === id);
const formatDate = (d?: string) => (d ? new Date(d).toLocaleString() : '—');
const addOrderToRoute = () => router.push('/order/list');

async function openAssignModal(route: Route) {
  routeToAssign.value = route;
  await truckStore.fetchTrucks();
  showAssignModal.value = true;
}
function closeAssignModal() {
  showAssignModal.value = false;
  routeToAssign.value = null;
}
async function selectTruck(truck: Truck) {
  if (!routeToAssign.value) return;
  const ok = await routesStore.assignTruck(routeToAssign.value.id, truck.id);
  if (ok) {
    await routesStore.fetchRoutes();
    closeAssignModal();
  }
}
async function removeTruck(route: Route) {
  if (!route.assignedTruck) return;
  removingId.value = route.id;
  await routesStore.partialUpdateRoute(route.id, { assignedTruck: null });
  await routesStore.fetchRoutes();
  removingId.value = null;
}

// Validación para desplegar: al menos 1 pedido y todos terminados
function validarParaDesplegar(route: Route): string[] {
  const errores: string[] = [];
  if (!route.assignedTruck)
    errores.push('La ruta no tiene un camión asignado.');
  if (route.status !== 'en espera')
    errores.push('La ruta no está en estado "en espera".');

  const ords = getOrdersForRoute(route.id);
  if (ords.length === 0)
    errores.push('La ruta no tiene ningún pedido.');
  else if (!ords.every(o => o.status.toLowerCase() === 'terminado'))
    errores.push('No todos los pedidos están en estado "terminado".');

  return errores;
}

async function desplegarRoute(route: Route) {
  message.value = null;
  const errores = validarParaDesplegar(route);
  if (errores.length) {
    message.value = errores.join(' ');
    return;
  }
  const ok = await routesStore.partialUpdateRoute(route.id, {
    status: 'en camino',
    assignedTruck: route.assignedTruck!
  });
  if (!ok) {
    message.value = 'Error al actualizar el estado de la ruta.';
    return;
  }
  await routesStore.fetchRoutes();
  message.value = 'La ruta se ha desplegado correctamente y ahora está "en camino".';
}

// Nueva acción: ver en el mapa
function viewOnMap(route: Route) {
  router.push('/map');
}

onMounted(async () => {
  await Promise.all([
    routesStore.fetchRoutes(),
    orderStore.fetchOrders(),
    truckStore.fetchTrucks()
  ]);
});
</script>

<style scoped>
@import './OrderList.css';

.status-message {
  color: green;
  margin: 16px 0;
}
.modal-content .order-products li {
  color: #000 !important;
}
.actions-cell button {
  margin-right: 8px;
}
</style>
