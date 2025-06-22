<template>
  <div class="branch-list-container">
    <div class="header">
      <h1>Listado de Sucursales</h1>
    </div>

    <button class="green-button back-button" @click="goBack">Volver</button>

    <!-- Panel de edición -->
    <div v-if="editingId !== null" class="form-container">
      <h2>Editar Sucursal {{ editingId }}</h2>
      <div class="form-row">
        <label>Nombre:</label>
        <input v-model="editedBranch.name" />
      </div>
      <div class="form-row">
        <label>Tipo:</label>
        <select v-model="editedBranch.type">
          <option value="Almacen">Almacén</option>
          <option value="Tienda">Tienda</option>
        </select>
      </div>
      <div class="form-row">
        <label>Teléfono:</label>
        <input v-model="editedBranch.phone" />
      </div>
      <div class="form-row">
        <label>Email:</label>
        <input v-model="editedBranch.email" type="email" />
      </div>
      <button class="green-button" @click="saveEdit">Guardar</button>
      <button class="red-button" @click="cancelEdit">Cancelar</button>
    </div>

    <div class="table-wrapper">
      <table class="branch-list">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Dirección</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in branchStore.branches" :key="b.id">
            <td>{{ b.id }}</td>
            <td>{{ b.name }}</td>
            <td>{{ b.type }}</td>
            <td>
              {{ b.address.streetName }} {{ b.address.streetNumber }},
              {{ b.address.locality }}, {{ b.address.autonomousCommunity }}
              ({{ b.address.postalCode }}), {{ b.address.country }}
            </td>
            <td>{{ b.phone }}</td>
            <td>{{ b.email }}</td>
            <td class="actions-cell">
              <button class="green-button" @click="startEdit(b)">Editar</button>
              <button class="red-button" @click="deleteBranchFn(b.id)">Borrar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useBranchStore } from '../store/branch.store'
import { useRouter } from 'vue-router'
import type { Branch } from '../interfaces/Branch'

const branchStore = useBranchStore()
const router = useRouter()

const editingId = ref<number | null>(null)
const editedBranch = reactive<Partial<Branch>>({})

const goBack = () => router.push('/main')

onMounted(() => {
  branchStore.fetchBranches()
})

function startEdit(b: Branch) {
  editingId.value = b.id
  Object.assign(editedBranch, {
    id: b.id,
    name: b.name,
    type: b.type,
    phone: b.phone,
    email: b.email
  })
}

function cancelEdit() {
  editingId.value = null
  Object.keys(editedBranch).forEach(k => delete (editedBranch as any)[k])
}

async function saveEdit() {
  if (editingId.value == null) return
  const orig = branchStore.branches.find(b => b.id === editingId.value)!
  const updated: Branch = {
    ...orig,
    name: editedBranch.name ?? orig.name,
    type: editedBranch.type as 'Almacen' | 'Tienda' ?? orig.type,
    phone: editedBranch.phone ?? orig.phone,
    email: editedBranch.email ?? orig.email
  }
  await branchStore.updateBranch(updated)
  cancelEdit()
}

async function deleteBranchFn(id: number) {
  if (!confirm(`¿Borrar sucursal ${id}?`)) return
  await branchStore.deleteBranch(id)
}
</script>
<style scoped>
@import './OrderList.css'; /* asume que contiene .table-wrapper */

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

.table-wrapper {
  max-height: 350px;
  overflow-y: auto;
  margin-top: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
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
