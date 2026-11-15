"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart";

/** Restores the saved cart from localStorage after hydration. */
export function CartHydrator() {
  useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);
  return null;
}
