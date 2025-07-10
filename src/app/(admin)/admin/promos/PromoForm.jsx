"use client";

import { useActionState, useEffect, useState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { createPromo, updatePromo } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getTokenFromCookie } from "@/lib/utils";

function SubmitButton({ isEditing }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Menyimpan..." : isEditing ? "Update Promo" : "Create Promo"}
    </Button>
  );
}

export default function PromoForm({ initialData, onFinished }) {
  const isEditing = !!initialData;
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const [state, formAction] = useActionState(isEditing ? updatePromo.bind(null, initialData.id) : createPromo, { success: false, message: null });

  // Gunakan nama state 'imageUrl' secara konsisten
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const uploadToast = toast.loading("Mengunggah gambar...");
    const formData = new FormData();
    formData.append("image", file);
    const token = getTokenFromCookie();

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/upload-image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, apiKey: process.env.NEXT_PUBLIC_API_KEY },
        body: formData,
      });
      const result = await response.json();
      if (response.ok && result.url) {
        setImageUrl(result.url); // Set state 'imageUrl'
        toast.success("Gambar berhasil diunggah!", { id: uploadToast });
      } else {
        throw new Error(result.message || "Gagal mengunggah gambar.");
      }
    } catch (error) {
      toast.error(`Upload Gagal: ${error.message}`, { id: uploadToast });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
        onFinished();
      } else {
        toast.error(state.message);
      }
    }
  }, [state, onFinished]);

  return (
    <form action={formAction} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
      {/* Pastikan nama input hidden ini 'imageUrl' */}
      <input type="hidden" name="imageUrl" value={imageUrl} />

      <div>
        <Label htmlFor="title">Promo Title</Label>
        <Input id="title" name="title" defaultValue={initialData?.title} required />
      </div>
      <div>
        <Label htmlFor="promo_code">Promo Code</Label>
        <Input id="promo_code" name="promo_code" defaultValue={initialData?.promo_code} required />
      </div>

      <div>
        <Label>Promo Image</Label>
        <div className="p-4 border rounded-md mt-1 space-y-3">
          {/* PERBAIKAN: Gunakan 'imageUrl' untuk mengecek dan menampilkan */}
          {imageUrl && (
            <div className="relative w-full h-40">
              <img src={imageUrl} alt="Promo preview" className="w-full h-full object-contain rounded-md" />
            </div>
          )}
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/png, image/jpeg, image/gif" />
          <Button type="button" variant="outline" onClick={() => fileInputRef.current.click()} disabled={isUploading}>
            {isUploading ? "Uploading..." : "Upload Image"}
          </Button>
        </div>
        {/* PERBAIKAN: Gunakan 'imageUrl' untuk validasi */}
        {!imageUrl && <p className="text-sm text-red-500 mt-1">Please upload an image.</p>}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={initialData?.description} />
      </div>
      <div>
        <Label htmlFor="terms_condition">Terms & Condition</Label>
        <Textarea id="terms_condition" name="terms_condition" defaultValue={initialData?.terms_condition} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="promo_discount_price">Discount Price (IDR)</Label>
          <Input id="promo_discount_price" name="promo_discount_price" type="number" defaultValue={initialData?.promo_discount_price} required />
        </div>
        <div>
          <Label htmlFor="minimum_claim_price">Minimum Claim Price (IDR)</Label>
          <Input id="minimum_claim_price" name="minimum_claim_price" type="number" defaultValue={initialData?.minimum_claim_price} required />
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <SubmitButton isEditing={!!initialData} />
      </div>
    </form>
  );
}
