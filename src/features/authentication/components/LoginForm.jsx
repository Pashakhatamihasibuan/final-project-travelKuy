"use client";

import { useEffect, useState } from "react";
import { useActionState, useFormStatus } from "react-dom";
import React from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { login } from "@/features/authentication/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Loader2, Lock, Mail, ShoppingCart } from "lucide-react";

function SubmitButton({ isDisabled }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending || isDisabled}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>Logging in...</span>
        </>
      ) : (
        "Login"
      )}
    </Button>
  );
}

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const restoreCart = searchParams.get("restore_cart");
  const loginIntent = searchParams.get("login_intent");

  const initialState = { status: null, message: null };
  const [state, formAction] = React.useActionState(login, initialState);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const canSubmit = formData.email.trim() !== "" && formData.password.trim() !== "";

  // Get login intent message
  const getLoginMessage = () => {
    switch (loginIntent) {
      case "cart_access":
        return {
          icon: <ShoppingCart className="h-5 w-5 text-blue-500" />,
          title: "Akses Keranjang Belanja",
          message: "Login untuk melihat dan mengelola keranjang belanja Anda",
        };
      case "add_to_cart":
        return {
          icon: <Calendar className="h-5 w-5 text-green-500" />,
          title: "Tambahkan ke Keranjang",
          message: "Login untuk menambahkan aktivitas ini ke keranjang belanja",
        };
      default:
        return null;
    }
  };

  const loginMessage = getLoginMessage();

  useEffect(() => {
    if (state?.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <div className="space-y-6">
      {/* Login Intent Message */}
      {loginMessage && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            {loginMessage.icon}
            <div>
              <h3 className="font-semibold text-blue-900">{loginMessage.title}</h3>
              <p className="text-sm text-blue-700 mt-1">{loginMessage.message}</p>
            </div>
          </div>
        </div>
      )}

      <form action={formAction} className="space-y-6">
        <input type="hidden" name="callbackUrl" value={callbackUrl || ""} />
        <input type="hidden" name="login_intent" value={loginIntent || ""} />
        {restoreCart && <input type="hidden" name="restore_cart" value={restoreCart} />}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="kamu@contoh.com"
              required
              className="pl-10"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input id="password" name="password" type="password" required className="pl-10" value={formData.password} onChange={handleInputChange} />
          </div>
        </div>

        <SubmitButton isDisabled={!canSubmit} />
      </form>
    </div>
  );
}
