<template>
  <div class="form-container">
    <div class="header">
      <h1>Asignar Ruta</h1>
    </div>
    <button class="green-button back-button" @click="goBack">Volver</button>
    <div v-if="assignedOrder">
      <p class="form-group">
        Asignar ruta al pedido: <strong>#{{ assignedOrder.id }}</strong>
      </p>

      <div class="form-group">
        <label>Rutas Disponibles</label>
        <table class="order-list">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Detalles</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="route in routes" :key="route.id">
              <td>{{ route.id }}</td>
              <td>{{ route.name }}</td>
              <td>{{ route.details || '—' }}</td>
              <td>{{ route.status || '—' }}</td>
              <td class="actions-cell">
                <button
                  v-if="!hasRouteAssigned"
                  class="green-button assign-button"
                  @click="assignRouteToOrder(route.id)"
                >
                  Asignar
                </button>
                <button
                  v-else
                  class="green-button assign-button"
                  @click="assignRouteToOrder(route.id)"
                >
                  Reasignar
                </button>
              </td>
            </tr>
            <tr v-if="routes.length === 0">
              <td colspan="5" class="no-products">No hay rutas disponibles.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <button
        v-if="routes.length === 0"
        class="green-button"
        @click="goToRouteCreation"
      >
        Crear nueva ruta
      </button>

      <p v-if="message" class="message">{{ message }}</p>
    </div>

    <div v-else class="form-group no-data">
      <p>No se ha seleccionado ningún pedido.</p>
      <button class="green-button" @click="goToOrderList">
        Seleccionar pedido
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useRoutesStore } from '../store/routes.store';
import { useOrderStore } from '../store/order.store';
import type { Order, OrderDto, OrderStatus } from '../interfaces/Order';

const router = useRouter();
const routesStore = useRoutesStore();
const orderStore = useOrderStore();

const routes = computed(() => routesStore.routes);
const assignedOrder = computed<Order | undefined>(() => orderStore.assignedOrder);
const hasRouteAssigned = computed(() => !!assignedOrder.value?.routeId);
const message = ref<string>('');

function getFullDto(routeId: number): OrderDto {
  const order = assignedOrder.value!;
  return {
    warehouseId: order.warehouseId!,
    storeId: order.storeId!,
    status: order.status as OrderStatus,
    orderDetails: order.orderDetails,
    orderProducts: order.orderProducts.map(op => ({
      productId: op.productId,
      quantity: op.quantity
    })),
    routeId
  };
}

async function assignRouteToOrder(routeId: number) {
  try {
    await orderStore.updateOrder(assignedOrder.value!.id!, getFullDto(routeId));
    message.value = `Ruta #${routeId} ${hasRouteAssigned.value ? 'reasignada' : 'asignada'} al pedido #${assignedOrder.value!.id}`;
    setTimeout(() => router.push('/order/list'), 1500);
  } catch (e) {
    console.error(e);
    message.value = 'Error al asignar la ruta.';
  }
}

function goBack() { router.push('/main'); }
function goToRouteCreation() { router.push('/route/creation'); }
function goToOrderList() { router.push('/order/list'); }

onMounted(() => {
  routesStore.fetchRoutes();
});

onUnmounted(() => {
  orderStore.assignedOrder = undefined;
});
</script>

<style scoped>
@import './OrderList.css';

.form-container {
  max-width: 600px;
  margin: 0 auto;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.order-list-container {
  overflow: hidden;
}
.order-list {
  table-layout: fixed;
  max-height: 40vh;
  overflow-y: auto;
  background-color: transparent;
  display: table !important;
}
.order-list thead th {
  background-color: #f8f8f8;
  font-weight: bold;
  padding: 12px 15px;
  border: 1px solid #ddd;
}
.order-list tbody td {
  padding: 12px 15px;
  border: 1px solid #ddd;
}
.order-list tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}
.order-list tbody tr:hover {
  background-color: #f1f1f1;
}
.actions-cell > button {
  margin: 0;
}
.no-products {
  text-align: center;
  padding: 15px;
  color: #666;
}
.message {
  margin-top: 10px;
  color: #28a745;
}
.no-data {
  text-align: center;
  margin-top: 20px;
}
.back-button {
  margin: 0;
}
</style>
