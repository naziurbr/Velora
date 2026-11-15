import { create } from "zustand";
import { DEFAULT_FILTERS, type ProductFilters } from "@/utils/filters";

interface ClosetState {
  filters: ProductFilters;
  filtersOpen: boolean;
  setFilters: (patch: Partial<ProductFilters>) => void;
  resetFilters: () => void;
  setFiltersOpen: (open: boolean) => void;
}

/** UI state for the closet page (filters). Selection lives in the closet component. */
export const useClosetStore = create<ClosetState>((set) => ({
  filters: DEFAULT_FILTERS,
  filtersOpen: false,
  setFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
  setFiltersOpen: (open) => set({ filtersOpen: open }),
}));
