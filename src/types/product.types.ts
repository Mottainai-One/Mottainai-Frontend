export type ProductTrafficLight = "regular" | "attention" | "critical";

export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: string;
  supplier: string;
  stockQuantity: number;
  shelfQuantity: number;
  priceInCents: number;
  trafficLight: ProductTrafficLight;
}

export interface ProductFilterState {
  search: string;
  category: string;
}

export interface ProductsFiltersProps {
  value: ProductFilterState;
  categories: readonly string[];
  onChange: (filters: ProductFilterState) => void;
}
