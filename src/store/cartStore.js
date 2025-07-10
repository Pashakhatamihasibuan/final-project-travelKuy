import { create } from "zustand";

export const useCartStore = create((set) => ({
  items: [],
  count: 0,
  setCart: (cartData) =>
    set({
      items: cartData,
      count: cartData.reduce((acc, item) => acc + item.quantity, 0),
    }),
  addItem: () => set((state) => ({ count: state.count + 1 })),
  clearCart: () => set({ items: [], count: 0 }),
}));
