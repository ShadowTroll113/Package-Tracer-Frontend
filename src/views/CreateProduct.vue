<template>
  <div class="form-container">
    <div class="header"><h1>Crear Nuevo Producto</h1></div>
    <button class="green-button back-button" @click="goBack">Volver</button>
    <form @submit.prevent="submitProduct">


      <!-- Campo: Nombre -->
      <div class="form-group">
        <label for="name">Nombre:</label>
        <input type="text" id="name" v-model="product.name" required />
      </div>

      <!-- Campo: Descripción -->
      <div class="form-group">
        <label for="description">Descripción:</label>
        <textarea id="description" v-model="product.description" rows="3"></textarea>
      </div>

      <!-- Campo: Precio -->
      <div class="form-group">
        <label for="price">Precio:</label>
        <input type="number" id="price" v-model="product.price" step="0.01" required />
      </div>

      <!-- Campo: Categoría -->
      <div class="form-group">
        <label for="category">Categoría:</label>
        <input type="text" id="category" v-model="product.category" />
      </div>

      <!-- Campo: Cantidad en Stock (para el ProductInventory) -->
      <div class="form-group">
        <label for="initialStock">Cantidad en Stock:</label>
        <input type="number" id="initialStock" v-model="initialStock" required />
      </div>

      <!-- Campo: Sucursal (dropdown con todas las branches) -->
      <div class="form-group">
        <label for="branchId">Sucursal:</label>
        <select id="branchId" v-model="selectedBranchId" required>
          <option :value="null" disabled>Seleccione una sucursal</option>
          <option v-for="branch in branches" :key="branch.id" :value="branch.id">
            {{ branch.name }} - {{ branch.type }}
          </option>
        </select>
      </div>

      <!-- Botón de Envío -->
      <button type="submit" class="green-button">Crear Producto</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useProductStore } from '../store/product.store';
import { useBranchStore } from '../store/branch.store';
import { useProductInventoryStore } from '../store/productInventory.store';
import { useRouter } from 'vue-router';
import type { Product } from '../interfaces/Product';
import "./CreateProduct.css";

// Inicializa los stores
const productStore = useProductStore();
const branchStore = useBranchStore();
const productInventoryStore = useProductInventoryStore();
const router = useRouter();

// Cargar sucursales al montar el componente
onMounted(async () => {
  await branchStore.fetchBranches();
});

// Computed para obtener la lista de sucursales (tiendas y almacenes)
const branches = computed(() => branchStore.branches);

// Objeto product sin stock ni branchId (se envía al backend mediante ProductStore)
const product = ref<Omit<Product, 'id'>>({
  name: '',
  description: '',
  price: 0,
  category: ''
});

// Campo para la cantidad inicial en stock (para crear el ProductInventory)
const initialStock = ref<number>(0);

// Campo para seleccionar la sucursal (branchId) mediante dropdown
const selectedBranchId = ref<number | null>(null);

// Función para enviar el formulario
const submitProduct = async () => {
  try {
    // Primero se crea el producto
    const newProduct = await productStore.createProduct(product.value);
    if (!newProduct) {
      alert('Error al crear el producto. Inténtalo de nuevo.');
      return;
    }
    // Luego, si se seleccionó una sucursal y se indicó stock, se crea el registro de inventario.
    if (selectedBranchId.value && initialStock.value > 0) {
      await productInventoryStore.createProductInventory({
        productId: newProduct.id,
        branchId: selectedBranchId.value,
        quantity: initialStock.value,
        productName: newProduct.name
      });
    }
    alert('Producto creado exitosamente!');
    product.value = {
      name: '',
      description: '',
      price: 0,
      category: ''
    };
    initialStock.value = 0;
    selectedBranchId.value = null;
    router.push('/product/list');
  } catch (error) {
    console.error('Error creating product:', error);
    alert('Hubo un error al crear el producto. Inténtalo de nuevo.');
  }
};

// Función para volver atrás
const goBack = () => {
  router.push('/main');
};
</script>
