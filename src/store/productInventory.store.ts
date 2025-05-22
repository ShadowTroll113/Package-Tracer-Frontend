import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import type { ProductInventory, ProductInventoryDto } from '../interfaces/Product';

axios.defaults.baseURL = 'http://localhost:8080';

export const useProductInventoryStore = defineStore('productInventory', () => {
  const error = ref<string | null>(null);
  const isLoading = ref(false);

  const getProductsByWarehouse = async (warehouseId: number): Promise<ProductInventory[]> => {
    try {
      isLoading.value = true;
      error.value = null;
      const response = await axios.get<ProductInventory[]>(`/api/product-inventory/branch/${warehouseId}/products`);
      return response.data;
    } catch (err) {
      error.value = 'Error al cargar productos del almacén';
      console.error('Error fetching products by warehouse:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Crear un registro en el inventario de productos
  const createProductInventory = async (data: ProductInventoryDto): Promise<ProductInventory> => {
    try {
      isLoading.value = true;
      error.value = null;
      const response = await axios.post<ProductInventory>('/api/product-inventory', data);
      return response.data;
    } catch (err) {
      error.value = 'Error al crear el inventario del producto';
      console.error('Error creating product inventory:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Disminuir el stock de un producto en un almacén
  const decreaseProductStock = async (
    productId: number,
    quantity: number,
    warehouseId: number
  ): Promise<boolean> => {
    isLoading.value = true
    try {
      await axios.patch('/api/product-inventory/decrease-stock', {
        productId,
        branchId: warehouseId,
        quantity
      })
      return true
    } catch (err: any) {
      console.error('Error decreasing product stock:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

    // Incrementar el stock de un producto en un almacén
    const increaseProductStock = async (
      productId: number,
      quantity: number,
      warehouseId: number
    ): Promise<boolean> => {
      isLoading.value = true
      try {
        await axios.patch('/api/product-inventory/increase-stock', {
          productId,
          branchId: warehouseId,
          quantity
        })
        return true
      } catch (err: any) {
        console.error('Error decreasing product stock:', err)
        throw err
      } finally {
        isLoading.value = false
      }
    }


  return {
    error,
    isLoading,
    getProductsByWarehouse,
    createProductInventory,
    decreaseProductStock,
    increaseProductStock
  };
});
