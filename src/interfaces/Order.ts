export type OrderStatus = 'pendiente' | 'aceptado' | 'en camino' | 'entregado' | 'cancelado' |'terminado';

export interface Order {
  id?: number;
  warehouseId: number;
  storeId: number;
  routeId?: number;
  orderProducts: Array<{ productId: number; quantity: number }>;
  orderDetails: string;
  status: OrderStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderProductDto {
  productId: number;
  quantity: number;
}

export interface OrderDto {
  id?: number;
  storeId?: number;
  warehouseId?: number;
  routeId?: number;
  orderProducts: OrderProductDto[];
  status: OrderStatus;
  orderDetails: string;
}
