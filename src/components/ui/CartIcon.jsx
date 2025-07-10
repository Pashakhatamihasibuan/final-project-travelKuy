"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useState } from "react";

export default function CartIcon({ isAuthenticated }) {
  const count = useCartStore((state) => state.count);
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCartClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      const loginUrl = new URL("/auth/login", window.location.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      loginUrl.searchParams.set("login_intent", "cart_access");
      router.push(loginUrl.toString());
    }
  };

  if (!isClient) {
    return (
      <div className="relative">
        <Button variant="ghost" size="icon">
          <ShoppingCart className="h-5 w-5 text-gray-600" />
        </Button>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <Link href="/cart" className="relative">
        <Button variant="ghost" size="icon">
          <ShoppingCart className="h-5 w-5 text-gray-600" />
        </Button>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">{count}</span>
        )}
      </Link>
    );
  }

  // For unauthenticated users - show button that redirects to login
  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={handleCartClick} className="cursor-pointer">
        <ShoppingCart className="h-5 w-5 text-gray-600" />
      </Button>
      {/* Show a subtle indicator that login is required */}
      <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500">
        <span className="text-white font-bold text-[8px]">!</span>
      </div>
    </div>
  );
}
