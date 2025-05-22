import { defineStore } from "pinia";



// Define la store
export const useRouteApiStore = defineStore("routeApi", {


  actions: {
    async geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      }
      return null;
    },
  },

});

// Encapsulación para exponer solo lo necesario
export function useRouteApi() {
  const store = useRouteApiStore();

  // Lista explícita de métodos y propiedades accesibles
  return {
    geocodeAddress: store.geocodeAddress,
  };
}
