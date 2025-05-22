// src/leaflet-geocoder.d.ts
import 'leaflet';

declare module 'leaflet' {
  namespace Control {
    function geocoder(options?: GeocoderOptions): Geocoder;

    interface GeocoderOptions {
      defaultMarkGeocode?: boolean;
      placeholder?: string;
      geocoder?: any;
    }

    interface Geocoder {
      on(type: 'markgeocode', fn: (e: GeocodeEvent) => void): this;
      addTo(map: Map): this;
    }

    interface GeocodeEvent {
      geocode: {
        center: LatLng;
        name: string;
        bbox: LatLngBounds;
        properties: any;
      };
    }

    namespace Geocoder {
      function nominatim(options?: any): any;
    }
  }
}
