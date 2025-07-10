"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { removeFromCart, updateCartQuantity } from "@/features/authentication/actions";
import { useCartStore } from "@/store/cartStore";
import { Card } from "@/components/ui/card";
import { createTransaction } from "@/lib/data"; // Import the createTransaction function
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation"; // Import useRouter

function QuantityControl({ item, onUpdate, isPending }) {
  const [optimisticQuantity, setOptimisticQuantity] = useState(item.quantity);

  const handleUpdate = (newQuantity) => {
    if (newQuantity < 1) return;
    setOptimisticQuantity(newQuantity);
    startTransition(() => {
      onUpdate(item.id, newQuantity);
    });
  };

  const [isTransitionPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2 border rounded-full p-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 rounded-full"
        onClick={() => handleUpdate(optimisticQuantity - 1)}
        disabled={isPending || optimisticQuantity <= 1}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="font-semibold text-sm min-w-[2ch] text-center">{optimisticQuantity}</span>
      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => handleUpdate(optimisticQuantity + 1)} disabled={isPending}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

function getTokenFromCookie() {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    const trimmedCookie = cookie.trim();
    if (!trimmedCookie) continue;

    const [name, value] = trimmedCookie.split("=");

    if (name === "client_token" && value && value !== "undefined") {
      try {
        const decoded = decodeURIComponent(value);
        return decoded;
      } catch (e) {
        return value;
      }
    }
  }
  return null;
}

export default function CartContents({ initialItems, paymentMethods }) {
  const [items, setItems] = useState(initialItems);
  const [selectedIds, setSelectedIds] = useState(() => new Set(initialItems.map((item) => item.id)));
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods?.[0]?.id || null);
  const [isPending, startTransition] = useTransition();
  const setCart = useCartStore((state) => state.setCart);
  const router = useRouter(); // Initialize router

  useEffect(() => {
    setCart(items);
  }, [items, setCart]);

  const handleUpdateQuantity = (cartId, newQuantity) => {
    setItems((prevItems) => prevItems.map((item) => (item.id === cartId ? { ...item, quantity: newQuantity } : item)));
    startTransition(async () => {
      await updateCartQuantity(cartId, newQuantity);
    });
  };

  const handleRemove = (cartId) => {
    startTransition(async () => {
      const result = await removeFromCart(cartId);
      if (result.status === "success") {
        toast.success(result.message);
        setItems((prevItems) => prevItems.filter((item) => item.id !== cartId));
        setSelectedIds((prevIds) => {
          const newIds = new Set(prevIds);
          newIds.delete(cartId);
          return newIds;
        });
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleCheckout = async () => {
    if (!selectedPayment || selectedItems.length === 0) {
      toast.error("Pilih metode pembayaran dan item yang akan dibeli");
      return;
    }

    startTransition(async () => {
      const token = getTokenFromCookie();
      if (!token) {
        toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
        router.push("/auth/login?callbackUrl=/cart");
        return;
      }

      try {
        // Enhanced payload with booking details
        const payload = {
          cartIds: Array.from(selectedIds),
          paymentMethodId: selectedPayment,
          // Add booking details for each cart item
          cartItems: selectedItems.map((item) => ({
            cartId: item.id,
            activityId: item.activity.id,
            quantity: item.quantity,
            bookingDate: item.bookingDate, // Make sure this exists
            guestCount: item.guestCount || item.quantity,
            price: item.activity.price_discount,
            activityTitle: item.activity.title,
            activityImageUrl: item.activity.imageUrls[0],
            city: item.activity.city,
            province: item.activity.province,
          })),
          totalPrice: subtotal,
          totalItems: totalSelectedItems,
        };

        console.log("Checkout payload:", payload); // Debug log

        const result = await createTransaction(payload, token);

        if (result.status === "success") {
          toast.success(result.message || "Transaksi Anda sedang diproses!");
          router.push(`/transactions`);

          // Clean up cart
          setItems((prevItems) => prevItems.filter((item) => !selectedIds.has(item.id)));
          setSelectedIds(new Set());
        } else {
          toast.error(result.message || "Gagal membuat transaksi.");
        }
      } catch (error) {
        console.error("Checkout process error:", error);
        toast.error("Terjadi kesalahan: " + error.message);
      }
    });
  };

  const selectedItems = useMemo(() => items.filter((item) => selectedIds.has(item.id)), [items, selectedIds]);
  const subtotal = useMemo(() => selectedItems.reduce((acc, item) => acc + item.activity.price_discount * item.quantity, 0), [selectedItems]);
  const totalSelectedItems = useMemo(() => selectedItems.reduce((acc, item) => acc + item.quantity, 0), [selectedItems]);
  const isAllSelected = items.length > 0 && selectedIds.size === items.length;
  const canCheckout = selectedItems.length > 0 && selectedPayment;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 space-y-4">
        <Card className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Checkbox
              id="select-all"
              checked={isAllSelected}
              onCheckedChange={(checked) => setSelectedIds(checked ? new Set(items.map((item) => item.id)) : new Set())}
            />
            <label htmlFor="select-all" className="font-semibold text-slate-700 cursor-pointer">
              Pilih Semua ({items.length} item)
            </label>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="text-red-500 hover:text-red-600"
            onClick={() => selectedIds.forEach((id) => handleRemove(id))}
            disabled={isPending || selectedIds.size === 0}
          >
            Hapus Terpilih
          </Button>
        </Card>

        {items.map((item) => (
          <Card key={item.id} className="flex items-start p-4 gap-4">
            <Checkbox
              className="mt-2"
              checked={selectedIds.has(item.id)}
              onCheckedChange={() => {
                const newIds = new Set(selectedIds);
                if (newIds.has(item.id)) newIds.delete(item.id);
                else newIds.add(item.id);
                setSelectedIds(newIds);
              }}
            />
            <img src={item.activity.imageUrls[0]} alt={item.activity.title} className="w-28 h-28 object-cover rounded-lg" />
            <div className="flex-grow">
              <h3 className="font-bold text-lg text-slate-800">{item.activity.title}</h3>
              <p className="text-sm text-slate-500 mb-2">
                {item.activity.city}, {item.activity.province}
              </p>
              <p className="font-bold text-lg text-sky-600">Rp {new Intl.NumberFormat("id-ID").format(item.activity.price_discount)}</p>
            </div>
            <div className="flex flex-col items-end justify-between h-full">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRemove(item.id)} disabled={isPending}>
                <Trash2 className="h-4 w-4 text-slate-500 hover:text-red-500" />
              </Button>
              <QuantityControl item={item} onUpdate={handleUpdateQuantity} isPending={isPending} />
            </div>
          </Card>
        ))}
      </div>

      <div className="lg:col-span-1">
        <Card className="sticky top-24 p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Metode Pembayaran</h2>
          <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment} name="paymentMethodId" className="mb-6 space-y-2">
            {paymentMethods.map((method) => (
              <Label
                key={method.id}
                htmlFor={method.id}
                className="flex items-center justify-between p-3 border rounded-lg cursor-pointer has-[:checked]:bg-sky-50 has-[:checked]:border-sky-500"
              >
                <div className="flex items-center gap-3">
                  <img src={method.imageUrl} alt={method.name} className="h-6 object-contain" />
                  <span className="font-medium">{method.name}</span>
                </div>
                <RadioGroupItem value={method.id} id={method.id} />
              </Label>
            ))}
          </RadioGroup>

          <h2 className="text-xl font-bold mb-4">Ringkasan Belanja</h2>
          <div className="space-y-2 border-b pb-4 mb-4">
            <div className="flex justify-between">
              <span className="text-slate-600">Total Harga ({totalSelectedItems} item)</span>
              <span className="font-semibold">Rp {new Intl.NumberFormat("id-ID").format(subtotal)}</span>
            </div>
          </div>
          <div className="flex justify-between font-bold text-lg mb-6">
            <span>Total</span>
            <span>Rp {new Intl.NumberFormat("id-ID").format(subtotal)}</span>
          </div>
          <Button size="lg" className="w-full" onClick={handleCheckout} disabled={!canCheckout || isPending}>
            Bayar Sekarang
          </Button>
        </Card>
      </div>
    </div>
  );
}
