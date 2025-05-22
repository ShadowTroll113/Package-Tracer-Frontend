import type { Truck } from '../store/truck.store';

export interface Route {
  id: number;
  name: string;
  details?: string;
  orderIds: number[];
  warehouseId: number | null;
  assignedTruck?: Truck | null;
  status?: string;
  startTime?: string;      // o Date si lo conviertes luego
  estimatedEndTime?: string;
  actualEndTime?: string;
  isNew?: boolean;
}
