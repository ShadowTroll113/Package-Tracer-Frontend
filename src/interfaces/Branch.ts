// interfaces/Branch.ts
export interface Branch {
  id: number;
  name: string;
  type: 'Tienda' | 'Almacen';
  address: BranchAddress;
  phone: string;
  email: string;
}

export interface BranchAddress {
  streetName: string;
  streetNumber: number;
  locality: string;
  autonomousCommunity: string;
  country: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
}

// interfaces/BranchDto.ts
export interface BranchDto {
  name: string;
  type: 'Tienda' | 'Almacen';
  streetName: string;
  streetNumber?: number;
  locality: string;
  autonomousCommunity: string;
  country: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  phone: string;
  email: string;
}


