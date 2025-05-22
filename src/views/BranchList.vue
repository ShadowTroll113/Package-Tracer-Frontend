<template>
  <div class="branch-list-container" style="overflow: auto;">
    <div class="header">
      <h1>Listado de Sucursales</h1>
    </div>

    <!-- Botón para Volver al Menú Principal -->
    <router-link to="/main">
      <button class="green-button">Volver</button>
    </router-link>

    <!-- Tabla de sucursales con scroll -->
    <table class="branch-list" style="overflow: auto;">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Tipo</th>
          <th>Dirección</th>
          <th>Teléfono</th>
          <th>Email</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="branch in branchStore.branches" :key="branch.id">
          <td>{{ branch.id }}</td>
          <td>{{ branch.name }}</td>
          <td>{{ branch.type }}</td>
          <td>
            {{ branch.address.streetName }} {{ branch.address.streetNumber }},
            {{ branch.address.locality }}, {{ branch.address.autonomousCommunity }}
            ({{ branch.address.postalCode }}), {{ branch.address.country }}
          </td>
          <td>{{ branch.phone }}</td>
          <td>{{ branch.email }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useBranchStore } from '../store/branch.store';
import { useRouter } from 'vue-router';

const branchStore = useBranchStore();
const router = useRouter();

const goBack = () => {
  router.push('/main');
};

onMounted(() => {
  branchStore.fetchBranches();
});
</script>

<style scoped>
.header {
  margin-bottom: 1em;
}

.branch-list-container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.branch-list {
  width: 100%;
  border-collapse: collapse;
}

.branch-list th,
.branch-list td {
  border: 1px solid #ddd;
  padding: 0.75em;
  text-align: left;
}

.branch-list thead {
  background-color: #f9f9f9;
}

.branch-list tr:nth-child(even) {
  background-color: #f2f2f2;
}

</style>
