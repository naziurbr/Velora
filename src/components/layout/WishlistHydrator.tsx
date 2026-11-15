"use client";

import { useEffect } from "react";
import { useWishlistStore } from "@/store/wishlist";

export function WishlistHydrator() {
  useEffect(() => {
    void useWishlistStore.persist.rehydrate();
  }, []);

  return null;
}
