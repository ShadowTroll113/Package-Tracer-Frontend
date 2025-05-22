import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios'; // Cliente HTTP para interactuar con la API
import { User } from '../interfaces/User';

axios.defaults.baseURL = "http://localhost:8080";
axios.defaults.withCredentials = true; // Permitir el envío de credenciales (cookies)

export const useUsersStore = defineStore('users', () => {
  // Estado reactivo
  const users = ref<User[]>([]); // Lista de usuarios
  const user = ref<User | null>(null); // Usuario autenticado

  // Obtener todos los usuarios
  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      users.value = response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Obtener un usuario por ID
  const fetchUserById = async (id: number) => {
    try {
      const response = await axios.get(`/api/users/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      return null;
    }
  };

  // Crear un nuevo usuario
  const createUser = async (newUser: User) => {
    try {
      const response = await axios.post('/api/users', newUser);
      users.value.push(response.data); // Agregar el nuevo usuario a la lista
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      return null;
    }
  };

  // Actualizar un usuario existente
  const updateUser = async (id: number, updatedUser: User) => {
    try {
      const response = await axios.put(`/api/users/${id}`, updatedUser);
      const index = users.value.findIndex(user => user.id === id);
      if (index !== -1) {
        users.value[index] = response.data; // Actualizar el usuario en la lista
      }
      return response.data;
    } catch (error) {
      console.error("Error updating user:", error);
      return null;
    }
  };

  // Eliminar un usuario
  const deleteUser = async (id: number) => {
    try {
      await axios.delete(`/api/users/${id}`);
      users.value = users.value.filter(user => user.id !== id); // Eliminar el usuario de la lista
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  };

  // Establecer el usuario autenticado
  const setUser = (authenticatedUser: User) => {
    user.value = authenticatedUser;
  };

  // Limpiar el usuario autenticado
  const clearUser = () => {
    user.value = null;
  };

  return {
    users,
    user,
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser,
    setUser,
    clearUser,
  };
});
