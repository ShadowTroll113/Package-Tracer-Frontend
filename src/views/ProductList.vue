<template>
  <div class="order-list-container">
    <div class="header">
      <h1>Lista de Productos</h1>
    </div>
    <button class="green-button back-button" @click="goToMain">Volver</button>

    <!-- Loading state -->
    <div v-if="isLoading" class="loading-message">Cargando datos...</div>

    <!-- Tabla de productos con scroll interno -->
    <table v-else class="order-list">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Categoría</th>
          <th>Precio</th>
          <th>Stock Total</th>
          <th>Sucursal</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(inventory, index) in products"
          :key="inventory.product.id"
          :class="{ selected: selectedProductIndex === index }"
        >
          <td>{{ inventory.product.id }}</td>
          <td>{{ inventory.product.name }}</td>
          <td>{{ inventory.product.category || 'Sin categoría' }}</td>
          <td>${{ inventory.product.price.toFixed(2) }}</td>
          <td>{{ getTotalStock(inventory.product.id) }}</td>
 <td>{{ 'Nombre: '+ inventory.warehouse.name + ' Id:' + inventory.warehouse.id }}</td>
          <td class="actions-cell">
            <button class="green-button" @click="viewDetails(index)">Ver Detalles</button>
          </td>
        </tr>
        <tr v-if="!isLoading && products.length === 0">
          <td colspan="6" class="no-products">No hay productos disponibles.</td>
        </tr>
      </tbody>
    </table>

    <!-- Detalles del Producto Seleccionado -->
    <div v-if="showDetails && selectedProduct" class="order-details">
      <h3>Detalles del Producto</h3>
      <p>
        <strong>Nombre:</strong>
        <span v-if="!isEditing">{{ selectedProduct.name }}</span>
        <input v-else v-model="editingProduct.name" type="text" />
      </p>
      <p>
        <strong>Descripción:</strong>
        <span v-if="!isEditing">{{ selectedProduct.description || 'No disponible' }}</span>
        <input v-else v-model="editingProduct.description" type="text" />
      </p>
      <p>
        <strong>Categoría:</strong>
        <span v-if="!isEditing">{{ selectedProduct.category || 'No especificada' }}</span>
        <input v-else v-model="editingProduct.category" type="text" />
      </p>
      <p>
        <strong>Precio Unitario:</strong>
        <span v-if="!isEditing">${{ selectedProduct.price.toFixed(2) }}</span>
        <input v-else v-model.number="editingProduct.price" type="number" step="0.01" />
      </p>
      <p>
        <strong>Stock Total:</strong> {{ totalStock }} unidades
      </p>
      <p v-if="message" :class="['message', { error: message.includes('Error') }]">
        {{ message }}
      </p>
      <div class="button-group">
        <button v-if="isAdmin" @click="toggleEdit" class="green-button">
          {{ isEditing ? 'Guardar' : 'Editar' }}
        </button>
        <button      v-if="isAdmin" @click="deleteProduct" class="red-button">Borrar</button>
        <button @click="cancelSelection" class="green-button">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProductInventoryStore } from '../store/productInventory.store';
import { useUsersStore } from '../store/user.store';
import { useProductStore } from '../store/product.store';
import type { Product, ProductDto, ProductInventory } from '../interfaces/Product';

const isAdmin = computed(() => userStore.user?.role === 'Admin');
const router = useRouter();
const productInventoryStore = useProductInventoryStore();
const productStore = useProductStore();
const userStore = useUsersStore();

const products = ref<ProductInventory[]>([]);
const selectedProductIndex = ref<number | null>(null);
const showDetails = ref(false);
const isEditing = ref(false);
const isLoading = ref(false);
const message = ref('');
const editingProduct = ref<ProductDto>({
  name: '',
  description: '',
  category: '',
  price: 0
});

const selectedProduct = computed<Product | null>(() => {
  const idx = selectedProductIndex.value;
  return idx === null ? null : products.value[idx].product;
});

const totalStock = computed(() => {
  const prod = selectedProduct.value;
  if (!prod) return 0;
  return products.value
    .filter(inv => inv.product.id === prod.id)
    .reduce((sum, inv) => sum + inv.quantity, 0);
});

const goToMain = () => router.push('/main');

const getTotalStock = (productId: number) =>
  products.value
    .filter(inv => inv.product.id === productId)
    .reduce((sum, inv) => sum + inv.quantity, 0);

const viewDetails = (index: number) => {
  selectedProductIndex.value = index;
  showDetails.value = true;
  isEditing.value = false;
  message.value = '';
};

const toggleEdit = async () => {
  if (!selectedProduct.value) return;
  if (isEditing.value) {
    try {
      await productStore.updateProduct(
        selectedProduct.value.id,
        editingProduct.value
      );
      message.value = 'Producto actualizado correctamente.';
      products.value[selectedProductIndex.value!].product = {
        ...selectedProduct.value,
        ...editingProduct.value
      };
      isEditing.value = false;
    } catch (error) {
      console.error(error);
      message.value = 'Error al actualizar el producto.';
    }
  } else {
    editingProduct.value = {
      name: selectedProduct.value.name,
      description: selectedProduct.value.description || '',
      category: selectedProduct.value.category || '',
      price: selectedProduct.value.price
    };
    isEditing.value = true;
    message.value = '';
  }
};

const deleteProduct = async () => {
  if (!selectedProduct.value) return;
  if (!confirm('¿Seguro que quieres eliminar este producto?')) return;
  try {
    await productStore.deleteProduct(selectedProduct.value.id);
    products.value = products.value.filter(
      (_, i) => i !== selectedProductIndex.value
    );
    message.value = 'Producto eliminado correctamente.';
    selectedProductIndex.value = null;
    showDetails.value = false;
  } catch (error) {
    console.error(error);
    message.value = 'Error al eliminar el producto.';
  }
};

const cancelSelection = () => {
  selectedProductIndex.value = null;
  showDetails.value = false;
  isEditing.value = false;
  message.value = '';
};

onMounted(async () => {
  isLoading.value = true;
  try {
    if (userStore.user?.branchId != null) {
      products.value = await productInventoryStore.getProductsByWarehouse(
        userStore.user.branchId
      );
    } else {
      console.warn('Usuario no autenticado, no se cargará inventario.');
    }
  } catch (error) {
    console.error('Error cargando datos:', error);
    message.value = 'Error al cargar los datos';
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
@import './OrderList.css';

</style>
