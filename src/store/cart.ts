import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/** Only identifiers + choices are stored; prices and stock are always resolved server-side. */
export interface CartLine {
  productId: string;
  size: string;
  color: string;
  quantity: number;
}

export const lineKey = (l: Pick<CartLine, "productId" | "size" | "color">) =>
  `${l.productId}|${l.size}|${l.color}`;

interface CartState {
  lines: CartLine[];
  hydrated: boolean;
  drawerOpen: boolean;
  add: (line: Omit<CartLine, "quantity">, quantity?: number, maxStock?: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      hydrated: false,
      drawerOpen: false,
      add: (line, quantity = 1, maxStock = 20) =>
        set((s) => {
          const key = lineKey(line);
          const existing = s.lines.find((l) => lineKey(l) === key);
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                lineKey(l) === key
                  ? { ...l, quantity: Math.min(maxStock, l.quantity + quantity) }
                  : l,
              ),
            };
          }
          return { lines: [...s.lines, { ...line, quantity: Math.min(maxStock, quantity) }] };
        }),
      setQuantity: (key, quantity) =>
        set((s) => ({
          lines:
            quantity <= 0
              ? s.lines.filter((l) => lineKey(l) !== key)
              : s.lines.map((l) => (lineKey(l) === key ? { ...l, quantity } : l)),
        })),
      remove: (key) => set((s) => ({ lines: s.lines.filter((l) => lineKey(l) !== key) })),
      clear: () => set({ lines: [] }),
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
    }),
    {
      name: "digital-closet-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines }),
      skipHydration: true, // rehydrated in <CartHydrator /> to avoid SSR mismatches
      onRehydrateStorage: () => () => {
        useCartStore.setState({ hydrated: true });
      },
    },
  ),
);
