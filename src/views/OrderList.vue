<template>
  <div class="order-list-container">
    <div class="header">
      <h1>Lista de Pedidos</h1>
    </div>
    <button class="green-button back-button" @click="goToMain">Volver</button>

    <table class="order-list">
      <thead>
        <tr>
          <th>ID</th>
          <th>Almacén</th>
          <th>Tienda Destino</th>
          <th>Estado</th>
          <th>Ruta Asignada</th>
          <th>Productos</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in orders" :key="order.id">
          <td>{{ order.id }}</td>
          <td>{{ getBranchName(order.warehouseId) }}</td>
          <td>{{ getBranchName(order.storeId) }}</td>
          <td>{{ order.status }}</td>
          <td>{{ getRouteName(order.routeId) }}</td>
          <td>
            <ul class="order-products">
              <li v-for="(op, idx) in order.orderProducts" :key="idx">
                Producto ID: {{ op.productId }}, Cantidad: {{ op.quantity }}
              </li>
            </ul>
          </td>
          <td class="actions-cell">
            <!-- Aceptar / Cancelar -->
            <button
              v-if="order.status === 'pendiente' && userStore.user?.role!='Tienda'"
              class="green-button"
              @click="acceptOrder(order)"
            >Aceptar</button>
            <button
              v-else-if="order.status !== 'cancelado'"
              class="red-button"
              @click="cancelOrder(order)"
            >Cancelar</button>

            <!-- Terminar Pedido (solo en almacén actual) -->
            <button
              v-if="order.status === 'aceptado'
                    && (branchStore.isCurrentWarehouse(order.warehouseId) || userStore.user?.branchId==-1)"
              class="green-button"
              @click="finishOrder(order)"
            >Terminar Pedido</button>

            <!-- Asignar / Reasignar Ruta (solo en almacén actual) -->
            <button
              v-if=" branchStore.isCurrentWarehouse(order.warehouseId) || userStore.user?.branchId==-1"
              class="green-button"
              @click="goToAssignRoute(order)"
            >
              {{ order.routeId ? 'Reasignar Ruta' : 'Asignar Ruta' }}
            </button>
          </td>
        </tr>
        <tr v-if="orders.length === 0">
          <td colspan="7" class="no-products">No hay pedidos disponibles.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useOrderStore } from '../store/order.store';
import { useBranchStore } from '../store/branch.store';
import { useProductInventoryStore } from '../store/productInventory.store';
import { useRoutesStore } from '../store/routes.store';
import type { Order, OrderDto, OrderStatus } from '../interfaces/Order';
import { useUsersStore } from '../store/user.store';

const router = useRouter();
const orderStore = useOrderStore();
const branchStore = useBranchStore();
const productInventoryStore = useProductInventoryStore();
const routesStore = useRoutesStore();
const userStore= useUsersStore();
onMounted(() => {
  orderStore.fetchOrders();
  branchStore.fetchBranches();
  routesStore.fetchRoutes();
});

const orders = computed(() => orderStore.orders);

const goToMain = () => router.push('/main');

const getBranchName = (id: number | undefined) => {
  const b = branchStore.branches.find(x => x.id === id);
  return b ? `${b.name} (${b.address.locality})` : 'Desconocido';
};

const getRouteName = (id: number | null | undefined) => {
  if (id == null) return 'Sin asignar';
  const r = routesStore.routes.find(x => x.id === id);
  return r ? r.name : 'Desconocida';
};

const acceptOrder = async (order: Order) => {
  if (!order.id || !order.warehouseId) return alert('Datos incompletos.');
  try {
    await Promise.all(order.orderProducts.map(op =>
      productInventoryStore.decreaseProductStock(op.productId, op.quantity, order.warehouseId!)
    ));
    const dto: OrderDto = {
      warehouseId: order.warehouseId,
      storeId: order.storeId!,
      status: 'aceptado' as OrderStatus,
      orderDetails: order.orderDetails,
      orderProducts: order.orderProducts.map(op => ({ productId: op.productId, quantity: op.quantity }))
    };
    await orderStore.updateOrder(order.id, dto);
  } catch {
    alert('Error al aceptar el pedido.');
  }
};

const cancelOrder = async (order: Order) => {
  if (!order.id || !order.warehouseId) return alert('Datos incompletos.');
  try {
    if (order.status === 'aceptado') {
      await Promise.all(order.orderProducts.map(op =>
        productInventoryStore.increaseProductStock(op.productId, op.quantity, order.warehouseId!)
      ));
    }
    const dto: OrderDto = {
      warehouseId: order.warehouseId,
      storeId: order.storeId!,
      status: 'cancelado' as OrderStatus,
      orderDetails: order.orderDetails,
      orderProducts: order.orderProducts.map(op => ({ productId: op.productId, quantity: op.quantity }))
    };
    await orderStore.updateOrder(order.id, dto);
  } catch {
    alert('Error al cancelar el pedido.');
  }
};

const finishOrder = async (order: Order) => {
  if (!order.id || !order.warehouseId) return alert('Datos incompletos.');
  try {
    const dto: OrderDto = {
      warehouseId: order.warehouseId,
      storeId: order.storeId!,
      status: 'terminado' as OrderStatus,
      orderDetails: order.orderDetails,
      orderProducts: order.orderProducts.map(op => ({ productId: op.productId, quantity: op.quantity })),
      routeId: order.routeId
    };
    await orderStore.updateOrder(order.id, dto);
  } catch {
    alert('Error al terminar el pedido.');
  }
};

const goToAssignRoute = (order: Order) => {
  orderStore.setAssignedOrder(order);
  router.push('/assign-route');
};
</script>

<style scoped>
@import './OrderList.css';

.order-list-container {
  overflow: hidden;
}

.order-list {
  max-height: 50vh;
  overflow-y: auto;
  display: block;
}
</style>
