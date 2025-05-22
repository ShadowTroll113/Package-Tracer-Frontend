export interface AddressDetails {
  country: string;
  country_code: string;
  state?: string;
  city?: string;
  postcode?: string;
  [key: string]: string | undefined;
}

export interface NominatimSearchResult {
  place_id: number;
  osm_type: string;
  osm_id: number;
  boundingbox: [string, string, string, string];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  address: AddressDetails;
}

export interface NominatimReverseResult {
  place_id: number;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: AddressDetails;
}
