import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface WishlistState {
  productIds: string[];
  hydrated: boolean;
  toggle: (productId: string) => void;
  remove: (productId: string) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      productIds: [],
      hydrated: false,
      toggle: (productId) =>
        set((state) => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds.filter((id) => id !== productId)
            : [...state.productIds, productId],
        })),
      remove: (productId) =>
        set((state) => ({ productIds: state.productIds.filter((id) => id !== productId) })),
    }),
    {
      name: "velora-wishlist",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ productIds: state.productIds }),
      skipHydration: true,
      onRehydrateStorage: () => () => {
        useWishlistStore.setState({ hydrated: true });
      },
    },
  ),
);
