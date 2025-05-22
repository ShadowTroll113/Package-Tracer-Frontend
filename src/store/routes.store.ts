import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import type { Route } from '../interfaces/Route'; // Asegúrate que esta ruta sea correcta

axios.defaults.baseURL = "http://localhost:8080";

export const useRoutesStore = defineStore('routes', () => {
  const routes = ref<Route[]>([]);
  const selectedRouteIndex = ref<number>(-1);


  const fetchRoutes = async () => {
    try {
      const response = await axios.get("/api/routes");
      routes.value = response.data.map((route: Route) => ({
        ...route,
        isNew: false,
      }));
    } catch (error) {
      console.error("Error fetching routes:", error);
    }
  };

  const addRoute = async (route: { name: string; details?: string }) => {
    try {
      const response = await axios.post("/api/routes", route);
      if (response.status === 201) {
        routes.value.push({ ...response.data, isNew: true });
      } else {
        console.warn("Respuesta inesperada al agregar ruta:", response.status);
      }
    } catch (error) {
      console.error("Error adding route:", error);
    }
  };

  const updateRoute = async (id: number, routeDetails: Partial<Route>): Promise<boolean> => {
    try {
      const response = await axios.put(`/api/routes/${id}`, routeDetails);
      const index = routes.value.findIndex((route: { id: number; }) => route.id === id);

      if (index !== -1) {
        routes.value[index] = { ...response.data, isNew: false };
        return true;
      }
    } catch (error) {
      console.error("Error updating route:", error);
    }
    return false;
  };

  const deleteRoute = async (id: number) => {
    try {
      await axios.delete(`/api/routes/${id}`);
      routes.value = routes.value.filter((route: { id: number; }) => route.id !== id);
    } catch (error) {
      console.error("Error deleting route:", error);
    }
  };

    const getRoute = async (truckId: number) =>{
      try {
        const resp = await axios.get(`/api/routes/by-truck/${truckId}`);
        return resp.data;
      } catch (e) {
        return null;
      }
    }

  const fetchRouteById = async (id: number): Promise<Route | null> => {
    try {
      const response = await axios.get(`/api/routes/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching route by ID:", error);
      return null;
    }
  };

  const clearRoutes = () => {
    routes.value = [];
    selectedRouteIndex.value = -1;
  };

  const selectRoute = (index: number) => {
    selectedRouteIndex.value = index;
  };

  const selectedRoute = computed(() => {
    return selectedRouteIndex.value !== -1 ? routes.value[selectedRouteIndex.value] : null;
  });


const partialUpdateRoute = async (id: number, updates: Partial<Route>): Promise<boolean> => {
  try {
    const response = await axios.patch<Route>(`/api/routes/${id}`, updates);
    const idx = routes.value.findIndex(r => r.id === id);
    if (idx !== -1) {
      routes.value[idx] = { ...response.data, isNew: false };
      return true;
    }
  } catch (error) {
    console.error("Error en partialUpdateRoute:", error);
  }
  return false;
};
const assignTruck = async (routeId: number, truckId: number): Promise<boolean> => {
  try {
    const response = await axios.post<Route>(
      `/api/routes/${routeId}/assign-truck/${truckId}`
    )

    const idx = routes.value.findIndex(r => r.id === routeId)
    if (idx !== -1) {
      routes.value[idx] = { ...response.data, isNew: false }
    } else {
      routes.value.push({ ...response.data, isNew: false })
    }
    return true
  } catch (error) {
    console.error('Error asignando camión:', error)
    return false
  }
}

  return {
    assignTruck,
    partialUpdateRoute,
    routes,
    selectedRouteIndex,
    selectedRoute,
    fetchRoutes,
    addRoute,
    updateRoute,
    deleteRoute,
    fetchRouteById,
    selectRoute,
    clearRoutes,
    getRoute
  };
});
