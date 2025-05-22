<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useBranchStore } from '../store/branch.store';
import { useRouter } from 'vue-router';
import type { Branch } from '../interfaces/Branch';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder';
import './CreateBranch.css';

export default defineComponent({
  setup() {
    const branchStore = useBranchStore();
    const branchTypes = ['Tienda', 'Almacen'] as const;

    const form = ref<Branch>({
      id: Date.now(),
      name: '',
      type: 'Tienda',
      address: {
        streetName: '',
        streetNumber: 0,
        locality: '',
        autonomousCommunity: '',
        country: 'España',
        postalCode: '',
        latitude: undefined,
        longitude: undefined,
      },
      phone: '',
      email: '',
    });

    const router = useRouter();
    const mapContainer = ref<HTMLDivElement | null>(null);
    let map: L.Map;
    let draggableMarker: L.Marker | undefined;

    onMounted(() => {
      if (!mapContainer.value) return;
      map = L.map(mapContainer.value).setView([40.416775, -3.703790], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

      // Creamos el geocoder sin el marcador por defecto
      const geocoder = (L.Control as any).geocoder({
        placeholder: 'Buscar dirección...',
        defaultMarkGeocode: false,
        geocoder: (L.Control as any).Geocoder.nominatim({
          geocodingQueryParams: { countrycodes: 'es', addressdetails: 1 },
        }),
      })
      .on('markgeocode', (e: any) => {
        const center = e.geocode.center;
        const addr = e.geocode.properties.address;

        // Se intenta obtener el nombre de la calle desde 'road' o 'street'
        const streetName = addr.road || addr.street || '';
        form.value.address.streetName = streetName;
        if (!streetName) {
          alert("No se ha encontrado el nombre de la calle. Por favor, ingréselo manualmente.");
        }

        // Se convierte el número de la calle a número, o se asigna 0 si no se encuentra
        if (addr.house_number) {
          form.value.address.streetNumber = parseInt(addr.house_number, 10);
        } else {
          form.value.address.streetNumber = 0;
          alert("La búsqueda no ha encontrado el número de la calle. Por favor ajusta el número en el formulario y el mapa.");
        }

        // Se rellenan los demás campos de dirección
        form.value.address.locality = addr.city || addr.town || addr.village || '';
        form.value.address.autonomousCommunity = addr.state || '';
        form.value.address.country = addr.country || 'España';
        form.value.address.postalCode = addr.postcode || '';
        form.value.address.latitude = center.lat;
        form.value.address.longitude = center.lng;

        // Se crea o actualiza el marcador arrastrable
        if (draggableMarker) {
          draggableMarker.setLatLng(center);
        } else {
          draggableMarker = L.marker(center, { draggable: true }).addTo(map);
          draggableMarker.on('dragend', (event: any) => {
            const pos = event.target.getLatLng();
            form.value.address.latitude = pos.lat;
            form.value.address.longitude = pos.lng;
          });
        }

        map.setView(center, 17);
      })
      .addTo(map);
    });

    const validateEmail = (email: string) => /^\S+@\S+\.\S+$/.test(email);
    const validatePhoneNumber = (phone: string) => /^\d{9}$/.test(phone);

    const submitBranch = () => {
  if (
    form.value.address.streetName.trim() === '' ||
   ( Number(form.value.address.streetNumber)) === 0 ||
    form.value.address.locality.trim() === '' ||
    form.value.address.autonomousCommunity.trim() === '' ||
    form.value.address.postalCode.trim() === ''
  ) {
    alert('Por favor, completa todos los campos de dirección.');
    return;
  }

  if (!validateEmail(form.value.email)) {
    alert('Introduce un email válido (xx@xx.xx).');
    return;
  }
  if (!validatePhoneNumber(form.value.phone)) {
    alert('El teléfono debe tener exactamente 9 dígitos.');
    return;
  }

  branchStore.addBranch({ ...form.value, id: Date.now() });
  form.value = {
    id: Date.now(),
    name: '',
    type: 'Tienda',
    address: {
      streetName: '',
      streetNumber: 0,
      locality: '',
      autonomousCommunity: '',
      country: 'España',
      postalCode: '',
      latitude: undefined,
      longitude: undefined,
    },
    phone: '',
    email: '',
  };
};

    const goBack = () => {
      router.back();
    };

    return { form, branchTypes, submitBranch, goBack, mapContainer };
  },
});
</script>

<template>
  <div class="page-container">
    <h3>Crear Nueva Sucursal</h3>
    <div class="branch-columns">
      <!-- Columna Izquierda: Datos generales -->
      <div class="form-column">
        <div class="branch-form-group">
          <label>Nombre</label>
          <input v-model="form.name" required />
        </div>
        <div class="branch-form-group">
          <label>Teléfono</label>
          <input v-model="form.phone" required />
        </div>
        <div class="branch-form-group">
          <label>Email</label>
          <input v-model="form.email" type="email" required />
        </div>
        <div class="branch-form-group">
          <label>Tipo</label>
          <select v-model="form.type">
            <option v-for="type in branchTypes" :key="type">{{ type }}</option>
          </select>
        </div>
        <button class="submit-branch" @click.prevent="submitBranch">Crear Sucursal</button>
        <button class="submit-branch" @click.prevent="goBack">Volver</button>
      </div>

      <!-- Columna Derecha: Dirección y mapa -->
      <div class="address-column">
        <div ref="mapContainer" class="map-container"></div>
        <h4>Dirección</h4>
        <div class="branch-form-group">
          <label>Calle y Nº</label>
          <div class="street-group">
            <input v-model="form.address.streetName" placeholder="Nombre de la calle" required />
            <input v-model.number="form.address.streetNumber" placeholder="Nº" required />
          </div>
        </div>
        <div class="branch-form-group">
          <label>Localidad</label>
          <input v-model="form.address.locality" placeholder="Localidad" required />
        </div>
        <div class="branch-form-group">
          <label>Comunidad Autónoma</label>
          <input v-model="form.address.autonomousCommunity" placeholder="Comunidad Autónoma" required />
        </div>
        <div class="branch-form-group">
          <label>Código Postal</label>
          <input v-model="form.address.postalCode" placeholder="Código Postal" required />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import './CreateBranch.css';
.street-group {
  display: flex;
  gap: 0.5rem;
}
.street-group input {
  flex: 1;
}
</style>
