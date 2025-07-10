"use client";

import { useEffect, useState } from "react";
import React from "react";
import { useActionState, useFormStatus } from "react-dom";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/features/authentication/actions";
import { Calendar as CalendarIcon, Loader2, Minus, Plus, Users } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { useCartStore } from "@/store/cartStore";

function SubmitButton({ isDisabled, isAuthenticated, onAuthRequired }) {
  const { pending } = useFormStatus();

  const handleClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      onAuthRequired();
    }
  };

  return (
    <Button
      type={isAuthenticated ? "submit" : "button"}
      size="lg"
      className="w-full"
      disabled={pending || (isAuthenticated && isDisabled)}
      onClick={handleClick}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>Menambahkan...</span>
        </>
      ) : isAuthenticated ? (
        "Add to Cart"
      ) : (
        "Login to Add to Cart"
      )}
    </Button>
  );
}

export default function AddToCartForm({ activityId, isAuthenticated }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [date, setDate] = useState(null);
  const [guestCount, setGuestCount] = useState(1);
  const [isAutoAdding, setIsAutoAdding] = useState(false);
  const addItemToCart = useCartStore((state) => state.addItem);
  const [state, formAction] = React.useActionState(addToCart, {
    status: null,
    message: null,
  });

  const canSubmit = date && guestCount > 0;

  // Handle redirect to login when not authenticated
  const handleAuthRequired = () => {
    const loginUrl = new URL("/auth/login", window.location.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    loginUrl.searchParams.set("login_intent", "add_to_cart");

    // Store form data in sessionStorage for restoration after login
    const formData = {
      activityId,
      selectedDate: date ? date.toISOString() : null,
      guestCount,
    };
    sessionStorage.setItem("pendingCartItem", JSON.stringify(formData));
    router.push(loginUrl.toString());
  };

  // Auto-add to cart after login if user came from login intent
  useEffect(() => {
    if (isAuthenticated && searchParams.get("login_intent") === "add_to_cart" && !isAutoAdding) {
      const pendingData = sessionStorage.getItem("pendingCartItem");
      if (pendingData) {
        try {
          const data = JSON.parse(pendingData);
          if (data.activityId === activityId) {
            // Restore form data
            if (data.selectedDate) {
              setDate(new Date(data.selectedDate));
            }
            setGuestCount(data.guestCount);

            // Auto-submit if form is valid
            if (data.selectedDate && data.guestCount > 0) {
              setIsAutoAdding(true);

              // Create FormData and submit
              const formData = new FormData();
              formData.append("activityId", activityId);
              formData.append("pathname", pathname);
              formData.append("selectedDate", data.selectedDate);
              formData.append("guestCount", data.guestCount.toString());

              // Call the server action directly
              addToCart({ status: null, message: null }, formData)
                .then((result) => {
                  if (result.status === "success") {
                    toast.success(result.message);
                    addItemToCart();
                  } else if (result.status === "error") {
                    toast.error(result.message);
                  }
                })
                .finally(() => {
                  setIsAutoAdding(false);
                  sessionStorage.removeItem("pendingCartItem");

                  // Clean up URL
                  const newUrl = new URL(window.location);
                  newUrl.searchParams.delete("login_intent");
                  router.replace(newUrl.toString(), { scroll: false });
                });
            } else {
              sessionStorage.removeItem("pendingCartItem");
              // Clean up URL
              const newUrl = new URL(window.location);
              newUrl.searchParams.delete("login_intent");
              router.replace(newUrl.toString(), { scroll: false });
            }
          }
        } catch (error) {
          console.error("Error restoring form data:", error);
          sessionStorage.removeItem("pendingCartItem");
          setIsAutoAdding(false);
        }
      }
    }
  }, [isAuthenticated, searchParams, activityId, router, pathname, addItemToCart, isAutoAdding]);

  useEffect(() => {
    if (state?.status === "success") {
      toast.success(state.message);
      addItemToCart();
      setDate(null);
      setGuestCount(1);
    } else if (state?.status === "error") {
      toast.error(state.message);
    }
  }, [state, addItemToCart]);

  return (
    <form action={isAuthenticated ? formAction : undefined} className="space-y-4">
      <input type="hidden" name="activityId" value={activityId} />
      <input type="hidden" name="pathname" value={pathname} />
      <input type="hidden" name="selectedDate" value={date ? date.toISOString() : ""} />
      <input type="hidden" name="guestCount" value={guestCount} />

      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1">Select Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
              type="button"
              disabled={isAutoAdding}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus disabled={(date) => date < new Date().setHours(0, 0, 0, 0)} />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-1">Number of Guests</Label>
        <div className="flex items-center justify-between p-2 border rounded-lg">
          <Users className="h-5 w-5 text-gray-500" />
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
              disabled={guestCount <= 1 || isAutoAdding}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="font-bold text-lg min-w-[2rem] text-center">{guestCount}</span>
            <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => setGuestCount(guestCount + 1)} disabled={isAutoAdding}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <SubmitButton isDisabled={!canSubmit || isAutoAdding} isAuthenticated={isAuthenticated} onAuthRequired={handleAuthRequired} />

      {isAutoAdding && (
        <div className="text-center text-sm text-blue-600 bg-blue-50 p-2 rounded">
          <Loader2 className="inline mr-2 h-4 w-4 animate-spin" />
          Menambahkan ke keranjang...
        </div>
      )}

      {!isAuthenticated && (
        <p className="text-xs text-center text-amber-600 bg-amber-50 p-2 rounded">Anda perlu login terlebih dahulu untuk menambahkan item ke keranjang</p>
      )}
    </form>
  );
}
