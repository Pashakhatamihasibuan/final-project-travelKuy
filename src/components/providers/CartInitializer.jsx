// src/components/providers/CartInitializer.jsx
"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cartStore";

// Komponen ini bertugas untuk menyinkronkan data dari server ke client store
export default function CartInitializer({ cart }) {
  const setCart = useCartStore((state) => state.setCart);

  useEffect(() => {
    // Set initial state dari server saat komponen pertama kali dimuat
    if (cart) {
      setCart(cart);
    }
  }, [cart, setCart]);

  return null; // Komponen ini tidak me-render UI apapun
}
