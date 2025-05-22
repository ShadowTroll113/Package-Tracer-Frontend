<template>
  <div class="form-container">
    <div class="header">
      <h1>Crear Nuevo Pedido</h1>
    </div>
    <button class="green-button back-button" @click="goBack">Volver</button>
    <form @submit.prevent="submitForm">

      <!-- Selección de Almacén Origen -->
      <div class="form-group">
        <label for="warehouse">Almacén de Origen:</label>
        <select
          id="warehouse"
          v-model.number="form.warehouseId"
          @change="loadWarehouseProducts"
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

      <!-- Selección de Tienda Destino sólo para admin -->
      <div class="form-group" v-if="isAdmin">
        <label for="destStore">Tienda Destino:</label>
        <select
          id="destStore"
          v-model.number="form.storeId"
          required
        >
          <option :value="null" disabled>Seleccione una tienda</option>
          <option
            v-for="st in stores"
            :key="st.id"
            :value="st.id"
          >
            {{ st.name }} – {{ st.address.locality }}
          </option>
        </select>
      </div>

      <!-- Tienda Destino (actual del usuario) para no-admin -->
      <div class="form-group" v-else-if="currentStore">
        <label>Tienda Destino:</label>
        <div class="current-store">
          {{ currentStore.name }} – {{ currentStore.address.locality }}
        </div>
      </div>

      <!-- Lista de Productos Disponibles -->
      <div class="form-group" v-if="form.warehouseId">
        <label>Productos Disponibles:</label>
        <div v-if="visibleProducts.length" class="products-scroll">
          <div
            v-for="inv in visibleProducts"
            :key="inv.id"
            class="product-item"
          >
            <div class="product-info">
              {{ inv.product.name }} (Disp: {{ inv.quantity }})
            </div>
            <div class="product-input">
              <input
                type="number"
                min="0"
                :max="inv.quantity"
                v-model.number="orderQuantities[inv.product.id]"
                placeholder="0"
              />
            </div>
          </div>
        </div>
        <div v-else class="no-products">
          No hay productos disponibles.
        </div>
      </div>

      <!-- Detalles Adicionales -->
      <div class="form-group">
        <label for="details">Detalles del Pedido:</label>
        <textarea
          id="details"
          v-model="form.orderDetails"
          rows="3"
        ></textarea>
      </div>

      <button
        type="submit"
        class="green-button"
        :disabled="!hasSelectedProducts"
      >
        Crear Pedido
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useOrderStore } from '../store/order.store';
import { useBranchStore } from '../store/branch.store';
import { useUsersStore } from '../store/user.store';
import { useProductInventoryStore } from '../store/productInventory.store';
import { useRouter } from 'vue-router';
import type { ProductInventory } from '../interfaces/Product';
import type { OrderDto } from '../interfaces/Order';

const router = useRouter();
const orderStore = useOrderStore();
const branchStore = useBranchStore();
const userStore = useUsersStore();
const productInventoryStore = useProductInventoryStore();

// Traer todas las sucursales
branchStore.fetchBranches();

// Formulario reactivo con warehouseId y storeId
const form = ref<Partial<OrderDto>>({
  warehouseId: undefined,
  storeId: undefined,
  orderProducts: [],
  orderDetails: '',
  status: 'pendiente'
});

// Computed para detectar admin (branchId = -1)
const isAdmin = computed(() => userStore.user?.branchId === -1);

// Listas de almacenes y tiendas
const warehouses = computed(() =>
  branchStore.branches.filter(b => b.type === 'Almacen')
);
const stores = computed(() =>
  branchStore.branches.filter(b => b.type === 'Tienda')
);

// Tienda actual del usuario (sólo para no-admin)
const currentStore = computed(() =>
  !isAdmin.value && userStore.user?.branchId
    ? branchStore.branches.find(b => b.id === userStore.user?.branchId) || null
    : null
);

// Inventario y cantidades
const availableProducts = ref<ProductInventory[]>([]);
const orderQuantities = ref<Record<number, number>>({});

// Filtrar productos con stock > 0
const visibleProducts = computed(() =>
  availableProducts.value.filter(inv => inv.quantity > 0)
);

// Carga de inventario al cambiar almacén
const loadWarehouseProducts = async () => {
  if (!form.value.warehouseId) return;
  try {
    availableProducts.value =
      await productInventoryStore.getProductsByWarehouse(
        form.value.warehouseId
      );
    orderQuantities.value = {};
    form.value.orderProducts = [];
  } catch (e) {
    console.error(e);
    availableProducts.value = [];
  }
};

// ¿Hay al menos un producto seleccionado?
const hasSelectedProducts = computed(() =>
  Object.values(orderQuantities.value).some(q => q > 0)
);

// Prepara array de productos para el pedido
const prepareProducts = () =>
  Object.entries(orderQuantities.value)
    .map(([id, qty]) => ({ productId: +id, quantity: qty }))
    .filter(p => p.quantity > 0);

// Enviar formulario
const submitForm = async () => {
  // Validaciones
  if (
    !form.value.warehouseId ||
    (isAdmin.value ? !form.value.storeId : !userStore.user?.branchId) ||
    !hasSelectedProducts.value
  ) {
    alert('Completa todos los campos y selecciona al menos un producto.');
    return;
  }
  form.value.orderProducts = prepareProducts();

  // Determinar tienda destino según admin o no
  const destStoreId = isAdmin.value
    ? form.value.storeId!
    : userStore.user!.branchId!;

  try {
    await orderStore.addOrder({
      warehouseId: form.value.warehouseId!,
      storeId: destStoreId,
      orderProducts: form.value.orderProducts!,
      orderDetails: form.value.orderDetails!,
      status: 'pendiente'
    });
    alert('Pedido creado exitosamente!');
    router.push('/order/list');
  } catch (e) {
    console.error(e);
    alert('Error al crear el pedido.');
  }
};

const goBack = () => router.back();
</script>

<style scoped>
@import './CreateProduct.css';

.products-scroll {
  max-height: 150px;
  overflow-y: auto;
  border: 1px solid #eee;
  padding: 8px;
  border-radius: 4px;
}

.product-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
}
.product-item:last-child {
  border-bottom: none;
}
</style>
