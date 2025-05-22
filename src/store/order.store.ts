import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import type { Order } from '../interfaces/Order';
import type { OrderDto } from '../interfaces/Order'; // Asegúrate de que OrderDto esté definido en tus interfaces
import { useUsersStore } from './user.store';

// Configuración de axios
axios.defaults.baseURL = 'http://localhost:8080';

export const useOrderStore = defineStore('orders', () => {
  const userstore = useUsersStore();
  const orders = ref<Order[]>([]);
  const error = ref<string | null>(null);
  const isLoading = ref(false);
  const assignedOrder = ref<Order>();
  /**
   * Obtiene todos los pedidos
   */
const fetchOrders = async (): Promise<Order[]> => {
  // Recupera el branchId del usuario
  const branchId = userstore.user?.branchId;

  // Si no hay sucursal definida
  if (branchId == null) {
    const msg = 'Usuario sin sucursal asignada';
    error.value = msg;
    return Promise.reject(new Error(msg));
  }

  isLoading.value = true;
  try {
    let response;
    if (branchId === -1) {
      // Si branchId es -1, llamamos sin params
      response = await axios.get<Order[]>('/api/orders');
    } else {
      // En otro caso, enviamos el parámetro branchId
      response = await axios.get<Order[]>('/api/orders', {
        params: { branchId }
      });
    }

    orders.value = response.data;
    error.value = null;
    return response.data;
  } catch (err) {
    error.value = 'Error al cargar los pedidos';
    console.error('Error fetching orders:', err);
    throw err;
  } finally {
    isLoading.value = false;
  }
};

  const setAssignedOrder = (order: Order) => {
    assignedOrder.value = order;
  };


  /**
   * Obtiene un pedido por ID
   */
  const getOrderById = async (id: number): Promise<Order> => {
    try {
      isLoading.value = true;
      const response = await axios.get<Order>(`/api/orders/${id}`);
      error.value = null;
      return response.data;
    } catch (err) {
      error.value = 'Error al cargar el pedido';
      console.error('Error fetching order:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Crea un nuevo pedido
   * Se espera que orderData sea de tipo OrderDto, que incluye orderProducts (cada uno con productId y quantity)
   */
  const addOrder = async (orderData: OrderDto): Promise<Order> => {
    try {
      isLoading.value = true;
      console.log("Enviando OrderDto:", JSON.stringify(orderData, null, 2));
      const response = await axios.post<Order>('/api/orders', orderData);
      orders.value.push(response.data);
      error.value = null;
      return response.data;
    } catch (err) {
      error.value = 'Error al crear el pedido';
      console.error('Error creating order:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateOrder = async (id: number, orderData: Partial<OrderDto>): Promise<Order> => {
    try {
      isLoading.value = true;
      const response = await axios.put<Order>(`/api/orders/${id}`, orderData);
      const updated = response.data;
      const index = orders.value.findIndex(o => o.id === id);
      if (index !== -1) orders.value[index] = updated;
      error.value = null;
      return updated;
    } catch (err) {
      error.value = 'Error al actualizar el pedido';
      console.error('Error updating order:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };


  /**
   * Elimina un pedido
   */
  const deleteOrder = async (id: number): Promise<boolean> => {
    try {
      isLoading.value = true;
      await axios.delete(`/api/orders/${id}`);
      orders.value = orders.value.filter(o => o.id !== id);
      error.value = null;
      return true;
    } catch (err) {
      error.value = 'Error al eliminar el pedido';
      console.error('Error deleting order:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    assignedOrder,
    setAssignedOrder,
    orders,
    error,
    isLoading,
    fetchOrders,
    getOrderById,
    addOrder,
    updateOrder,
    deleteOrder
  };
});
