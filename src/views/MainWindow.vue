<template>
  <div class="main-container">
    <h1>Menú Principal</h1>
    <div v-if="isLoading" class="loading-message">Cargando datos...</div>
    <div v-else class="menu">
      <!-- SOLO ADMIN -->
      <router-link
        v-if="isAdmin"
        to="/branch/creation"
        class="menu-item"
        title="Creación de Sucursal"
      >
        <font-awesome-icon icon="branch" />
        <span>Creación de Sucursal</span>
      </router-link>
      <router-link
        v-if="isAdmin"
        to="/branch/list"
        class="menu-item"
        title="Lista de Sucursales"
      >
        <font-awesome-icon icon="clipboard-list" />
        <span>Lista de Sucursales</span>
      </router-link>
      <router-link
        v-if="isAdmin"
        to="/truck/creation"
        class="menu-item"
        title="Crear Camión"
      >
        <font-awesome-icon icon="plus" />
        <span>Crear Camión</span>
      </router-link>

      <!-- TODOS LOS AUTENTICADOS -->
      <router-link
        v-if="isLoggedIn"
        to="/order/creation"
        class="menu-item"
        title="Crear Pedido"
      >
        <font-awesome-icon icon="shopping-cart" />
        <span>Crear Pedido</span>
      </router-link>
      <router-link
        v-if="isLoggedIn"
        to="/order/list"
        class="menu-item"
        title="Lista de Pedidos"
      >
        <font-awesome-icon icon="clipboard-list" />
        <span>Lista de Pedidos</span>
      </router-link>
      <router-link
        v-if="isLoggedIn"
        to="/product/creation"
        class="menu-item"
        title="Crear Producto"
      >
        <font-awesome-icon icon="clipboard-list" />
        <span>Crear Producto</span>
      </router-link>
      <router-link
        v-if="isLoggedIn"
        to="/product/list"
        class="menu-item"
        title="Lista de Productos"
      >
        <font-awesome-icon icon="clipboard-list" />
        <span>Lista de Productos</span>
      </router-link>
      <router-link
        v-if="canAssignOrListRoutes"
        to="/route/creation"
        class="menu-item"
        title="Crear Ruta"
      >
        <font-awesome-icon icon="plus" />
        <span>Crear Ruta</span>
      </router-link>
      <router-link
        v-if="isLoggedIn"
        to="/map"
        class="menu-item"
        title="Ver Mapa"
      >
        <font-awesome-icon icon="route" />
        <span>Mapa</span>
      </router-link>

      <!-- ALMACÉN y ADMIN -->
      <router-link
        v-if="canAssignOrListRoutes"
        to="/assign-route"
        class="menu-item"
        title="Asignar Ruta"
      >
        <font-awesome-icon icon="route" />
        <span>Asignar Ruta</span>
      </router-link>
      <router-link
        v-if="canAssignOrListRoutes"
        to="/route/list"
        class="menu-item"
        title="Lista de Rutas"
      >
        <font-awesome-icon icon="clipboard-list" />
        <span>Lista de Rutas</span>
      </router-link>

      <!-- Salir -->
      <button class="menu-item" title="Salir" @click="logout">
        <font-awesome-icon icon="sign-out-alt" />
        <span>Salir</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useUsersStore } from '../store/user.store';
import { useOrderStore } from '../store/order.store';
import { useProductStore } from '../store/product.store';
import { useRoutesStore } from '../store/routes.store';
import { useBranchStore } from '../store/branch.store';
import './MainWindow.css';
import router from '../router';
import { useLoginStore } from '../store/login.store';

export default defineComponent({
  name: 'MainMenu',
  setup() {
    const usersStore = useUsersStore();
    const ordersStore = useOrderStore();
    const productsStore = useProductStore();
    const routesStore = useRoutesStore();
    const branchStore = useBranchStore();
const loginStore = useLoginStore();
    const isLoading = ref(true);

    const isAdmin = computed(() => usersStore.user?.role === 'Admin');
    const isAlmacen = computed(() => usersStore.user?.role === 'Almacen');
    const isLoggedIn = computed(() => !!usersStore.user);
    const canAssignOrListRoutes = computed(
      () => isAlmacen.value || isAdmin.value
    );

    onMounted(async () => {
      try {
        await Promise.all([
          usersStore.fetchUsers(),
          ordersStore.fetchOrders(),
          productsStore.fetchProducts(),
          routesStore.fetchRoutes(),
          branchStore.fetchBranches()

        ]);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        alert('Error al cargar datos. Por favor, intente nuevamente.');
      } finally {
        isLoading.value = false;
      }
    });

    const logout = () => {
      router.push('/');
      loginStore.logout();

    };

    return {
      isLoading,
      isAdmin,
      isAlmacen,
      isLoggedIn,
      canAssignOrListRoutes,
      logout,
    };
  },
});
</script>

<style scoped>
@import 'leaflet/dist/leaflet.css';
@import './MainWindow.css';

/* Puedes añadir aquí estilos específicos para los v-if si lo deseas */
</style>
