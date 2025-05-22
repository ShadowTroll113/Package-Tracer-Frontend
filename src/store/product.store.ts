import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import axios from 'axios';
import type { Product } from '../interfaces/Product';

axios.defaults.baseURL = 'http://localhost:8080';

export const useProductStore = defineStore('products', () => {
  const products = ref<Product[]>([]);
  const error = ref<string | null>(null);
  const isLoading = ref(false);
  const currentProduct = ref<Product | null>(null);

  // Obtener todos los productos
  const fetchProducts = async (): Promise<Product[]> => {
    try {
      isLoading.value = true;
      error.value = null;
      const response = await axios.get<Product[]>('/api/products');
      products.value = response.data;
      return response.data;
    } catch (err) {
      error.value = 'Error al cargar los productos';
      console.error('Error fetching products:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Obtener un producto por ID
  const fetchProductById = async (id: number): Promise<Product | null> => {
    try {
      isLoading.value = true;
      error.value = null;
      const localProduct = products.value.find(p => p.id === id);
      if (localProduct) {
        currentProduct.value = localProduct;
        return localProduct;
      }
      const response = await axios.get<Product>(`/api/products/${id}`);
      currentProduct.value = response.data;
      return response.data;
    } catch (err) {
      error.value = 'Error al cargar el producto';
      console.error('Error fetching product by ID:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Crear un nuevo producto (envía el DTO sin stock ni branchId)
  const createProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
    try {
      isLoading.value = true;
      error.value = null;
      const response = await axios.post<Product>('/api/products', productData);
      products.value.push(response.data);
      return response.data;
    } catch (err) {
      error.value = 'Error al crear el producto';
      console.error('Error creating product:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Actualizar un producto
  const updateProduct = async (id: number, productData: Partial<Product>): Promise<Product> => {
    try {
      isLoading.value = true;
      error.value = null;
      const response = await axios.put<Product>(`/api/products/${id}`, productData);
      const index = products.value.findIndex(p => p.id === id);
      if (index !== -1) {
        products.value[index] = response.data;
      }
      if (currentProduct.value?.id === id) {
        currentProduct.value = response.data;
      }
      return response.data;
    } catch (err) {
      error.value = 'Error al actualizar el producto';
      console.error('Error updating product:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Eliminar un producto
  const deleteProduct = async (id: number): Promise<boolean> => {
    try {
      isLoading.value = true;
      error.value = null;
      await axios.delete(`/api/products/${id}`);
      products.value = products.value.filter(p => p.id !== id);
      if (currentProduct.value?.id === id) {
        currentProduct.value = null;
      }
      return true;
    } catch (err) {
      error.value = 'Error al eliminar el producto';
      console.error('Error deleting product:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Buscar productos por nombre o categoría
  const searchProducts = async (query: string): Promise<Product[]> => {
    try {
      isLoading.value = true;
      error.value = null;
      const response = await axios.get<Product[]>(`/api/products/search?q=${query}`);
      return response.data;
    } catch (err) {
      error.value = 'Error al buscar productos';
      console.error('Error searching products:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    products,
    currentProduct,
    error,
    isLoading,
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    featuredProducts: computed(() => products.value.slice(0, 5))
  };
});
