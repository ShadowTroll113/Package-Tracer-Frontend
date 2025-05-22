import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Branch, BranchDto } from '../interfaces/Branch';
import axios from 'axios';
import { useUsersStore } from './user.store';

axios.defaults.baseURL = 'http://localhost:8080';

export const useBranchStore = defineStore('branchStore', () => {
  const branches = ref<Branch[]>([]);
  const userStore = useUsersStore();

  function mapBranchToDto(branch: Branch): BranchDto {
    return {
      name: branch.name,
      type: branch.type,
      streetName: branch.address.streetName,
      streetNumber: branch.address.streetNumber,
      locality: branch.address.locality,
      autonomousCommunity: branch.address.autonomousCommunity,
      country: branch.address.country,
      postalCode: branch.address.postalCode,
      latitude: branch.address.latitude,
      longitude: branch.address.longitude,
      phone: branch.phone,
      email: branch.email,
    };
  }

  function mapDtoToBranch(dto: BranchDto & { id?: number }): Branch {
    return {
      id: dto.id || 0,
      name: dto.name,
      type: dto.type,
      address: {
        streetName: dto.streetName,
        streetNumber: dto.streetNumber || 0,
        locality: dto.locality,
        autonomousCommunity: dto.autonomousCommunity,
        country: dto.country,
        postalCode: dto.postalCode,
        latitude: dto.latitude,
        longitude: dto.longitude,
      },
      phone: dto.phone,
      email: dto.email,
    };
  }

  const fetchBranches = async () => {
    try {
      const response = await axios.get('/api/branch');
      branches.value = response.data.map((dto: BranchDto & { id?: number }) =>
        mapDtoToBranch(dto)
      );
    } catch (error) {
      console.error('Error al cargar sucursales', error);
    }
  };

  const addBranch = async (branch: Branch) => {
    const branchDto = mapBranchToDto(branch);
    try {
      const response = await axios.post('/api/branch', branchDto);
      const newBranch = mapDtoToBranch(response.data);
      branches.value.push(newBranch);
    } catch (error) {
      console.error('Error al crear sucursal', error);
    }
  };

  const updateBranch = async (branch: Branch) => {
    const branchDto = mapBranchToDto(branch);
    try {
      const response = await axios.put(`/api/branch/${branch.id}`, branchDto);
      const updatedBranch = mapDtoToBranch(response.data);
      const index = branches.value.findIndex(b => b.id === branch.id);
      if (index !== -1) branches.value[index] = updatedBranch;
    } catch (error) {
      console.error('Error al actualizar sucursal', error);
    }
  };

  const deleteBranch = async (id: number) => {
    try {
      await axios.delete(`/api/branch/${id}`);
      branches.value = branches.value.filter(branch => branch.id !== id);
    } catch (error) {
      console.error('Error al eliminar sucursal', error);
    }
  };

  const currentBranch = computed(() =>
    branches.value.find(b => b.id === userStore.user?.branchId)
  );

  function isCurrentWarehouse(branchId?: number) {
    return (
      currentBranch.value?.id === branchId &&
      currentBranch.value?.type === 'Almacen'
    );
  }

  function isCurrentStore(branchId?: number) {
    return (
      currentBranch.value?.id === branchId &&
      currentBranch.value?.type === 'Tienda'
    );
  }

  return {
    branches,
    fetchBranches,
    addBranch,
    updateBranch,
    deleteBranch, 
    mapBranchToDto,
    mapDtoToBranch,
    isCurrentWarehouse,
    isCurrentStore,
  };
});
