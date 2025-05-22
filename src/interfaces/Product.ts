// src/interfaces/Product.ts

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category?: string;
}

// Interfaz para crear o actualizar un producto (DTO)
export interface ProductDto {
  name: string;
  description?: string;
  price: number;
  category?: string;
}

export interface ProductInventory {
  id: number;
  product: Product;
  quantity: number;
  warehouse: {
    id: number;
    name: string;
    type: string;
  };
}

// Interfaz para la creación de un ProductInventory (DTO)
export interface ProductInventoryDto {
  productId: number;
  branchId: number;
  quantity: number;
  productName: string;
}
