<template>
  <div class="order-list-container">
    <div class="header">
      <h1>Lista de Usuarios</h1>
    </div>
    <button class="green-button back-button" @click="goToMain">Volver</button>

    <!-- Botón para mostrar/ocultar formulario de creación -->
    <button class="green-button" @click="showCreate = !showCreate">
      {{ showCreate ? 'Cancelar creación' : 'Crear Usuario' }}
    </button>

    <!-- Formulario de creación -->
    <div v-if="showCreate" class="form-container">
      <h2>Crear Usuario</h2>
      <div class="form-row">
        <label>Nombre:</label>
        <input v-model="newUser.name" />
      </div>
      <div class="form-row">
        <label>Username:</label>
        <input v-model="newUser.username" />
      </div>
      <div class="form-row">
        <label>Email:</label>
        <input v-model="newUser.email" type="email" />
      </div>
      <div class="form-row">
        <label>Contraseña:</label>
        <input v-model="newUser.password" type="password" />
      </div>
      <div class="form-row">
        <label>Rol:</label>
        <select v-model="newUser.role">
          <option value="" disabled>Seleccione un rol</option>
          <option value="Tienda">Tienda</option>
          <option value="Admin">Admin</option>
          <option value="Almacen">Almacen</option>
        </select>
      </div>
      <div class="form-row">
        <label>Sucursal:</label>
        <select v-model.number="newUser.branchId">
          <option value="" disabled>Seleccione sucursal</option>
          <option v-for="b in branches" :key="b.id" :value="b.id">
            {{ b.name }} (ID {{ b.id }})
          </option>
        </select>
      </div>
      <button class="green-button" @click="createUser" :disabled="isSaving">
        {{ isSaving ? 'Creando...' : 'Crear Usuario' }}
      </button>
      <p class="error" v-if="error">{{ error }}</p>
    </div>

    <!-- Formulario de edición -->
    <div v-if="editingId !== null" class="form-container">
      <h2>Editar Usuario {{ editingId }}</h2>
      <div class="form-row">
        <label>Nombre:</label>
        <input v-model="editedUser.name" />
      </div>
      <div class="form-row">
        <label>Username:</label>
        <input v-model="editedUser.username" />
      </div>
      <div class="form-row">
        <label>Email:</label>
        <input v-model="editedUser.email" type="email" />
      </div>
      <div class="form-row">
        <label>Rol:</label>
        <select v-model="editedUser.role">
          <option value="" disabled>Seleccione un rol</option>
          <option value="Tienda">Tienda</option>
          <option value="Admin">Admin</option>
          <option value="Almacen">Almacen</option>
        </select>
      </div>
      <div class="form-row">
        <label>Sucursal:</label>
        <select v-model.number="editedUser.branchId">
          <option value="" disabled>Seleccione sucursal</option>
          <option v-for="b in branches" :key="b.id" :value="b.id">
            {{ b.name }} (ID {{ b.id }})
          </option>
        </select>
      </div>
      <button class="green-button" @click="saveEdit">Guardar</button>
      <button class="red-button" @click="cancelEdit">Cancelar</button>
    </div>

    <table class="order-list">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Username</th>
          <th>Email</th>
          <th>Rol</th>
          <th>Branch ID</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in users" :key="u.id">
          <td>{{ u.id }}</td>
          <td>{{ u.name }}</td>
          <td>{{ u.username }}</td>
          <td>{{ u.email }}</td>
          <td>{{ u.role }}</td>
          <td>{{ u.branchId }}</td>
          <td class="actions-cell">
            <button class="btn" @click="startEdit(u)">Editar</button>
            <button class="btn red-button" @click="deleteUser(u.id)">Borrar</button>
          </td>
        </tr>
        <tr v-if="!isSaving && users.length === 0">
          <td colspan="7" class="no-products">No hay usuarios.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUsersStore } from '../store/user.store'
import { useBranchStore } from '../store/branch.store'
import type { User } from '../interfaces/User'

const router = useRouter()
const userStore = useUsersStore()
const branchStore = useBranchStore()

const users    = computed(() => userStore.users)
const branches = computed(() => branchStore.branches)
const error    = ref<string | null>(null)
const isSaving = ref(false)
const showCreate = ref(false)

// Crear usuario
const newUser = reactive<Partial<User> & { password?: string }>({
  name: '',
  username: '',
  email: '',
  password: '',
  role: '',
  branchId: 0
})

async function createUser() {
  if (
    !newUser.name ||
    !newUser.username ||
    !newUser.email ||
    !newUser.password ||
    !newUser.role ||
    newUser.branchId == null
  ) {
    return alert('Completa todos los campos.')
  }
  isSaving.value = true
  error.value    = null
  try {
    await userStore.createUser(newUser as User & { password: string })
    Object.assign(newUser, { name: '', username: '', email: '', password: '', role: '', branchId: 0 })
    showCreate.value = false
  } catch {
    error.value = 'Error al crear usuario.'
  } finally {
    isSaving.value = false
  }
}

// Edición
const editingId  = ref<number | null>(null)
const editedUser = reactive<Partial<User>>({})

function startEdit(u: User) {
  editingId.value = u.id
  Object.assign(editedUser, u)
}

function cancelEdit() {
  editingId.value = null
  Object.keys(editedUser).forEach(k => delete (editedUser as any)[k])
}

async function saveEdit() {
  if (editingId.value == null) return
  isSaving.value = true
  error.value    = null
  try {
    await userStore.updateUser(editingId.value, editedUser as User)
    cancelEdit()
  } catch {
    error.value = 'Error al actualizar usuario.'
  } finally {
    isSaving.value = false
  }
}

// Eliminar usuario
async function deleteUser(id: number) {
  if (!confirm(`¿Borrar usuario ${id}?`)) return
  try {
    await userStore.deleteUser(id)
  } catch {
    alert('Error al borrar usuario.')
  }
}

// Cargar datos al montar
onMounted(() => {
  userStore.fetchUsers()
  branchStore.fetchBranches()
})

const goToMain = () => router.push('/main')
</script>

<style scoped>
@import './OrderList.css';

.form-container {
  margin: 16px 0;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fafafa;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  color: #000;
  padding: 8px;
  border-radius: 4px;
}

.form-row label {
  width: 100px;
  font-weight: bold;
}

.form-row input,
.form-row select {
  flex: 1;
  padding: 4px 8px;
  color: #222;
  border: 1px solid #555;
  border-radius: 4px;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

.red-button {
  background-color: #dc3545;
  color: white;
}

.red-button:hover {
  background-color: #c82333;
}

.error {
  color: #dc3545;
  margin-top: 8px;
}

.no-products {
  text-align: center;
  color: #666;
}
</style>
