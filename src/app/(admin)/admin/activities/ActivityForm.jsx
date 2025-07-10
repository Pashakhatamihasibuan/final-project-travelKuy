"use client";

import { useActionState, useEffect, useState, useRef } from "react"; // UBAH: Impor useActionState dari "react"
import { useFormStatus } from "react-dom"; // useFormStatus tetap dari "react-dom"
import { toast } from "sonner";
import { createActivity, updateActivity } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getTokenFromCookie } from "@/lib/utils";

// Tombol submit dengan state loading
function SubmitButton({ isEditing }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Menyimpan..." : isEditing ? "Update Activity" : "Create Activity"}
    </Button>
  );
}

export default function ActivityForm({ categories, initialData, onFinished }) {
  const isEditing = !!initialData;
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // UBAH: Gunakan useActionState sebagai pengganti useFormState
  const [state, formAction] = useActionState(isEditing ? updateActivity.bind(null, initialData.id) : createActivity, { success: false, message: null });

  const [imageUrls, setImageUrls] = useState(initialData?.imageUrls || []);

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
        headers: {
          Authorization: `Bearer ${token}`,
          apiKey: process.env.NEXT_PUBLIC_API_KEY,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.url) {
        setImageUrls((prevUrls) => [...prevUrls, result.url]);
        toast.success("Gambar berhasil diunggah!", { id: uploadToast });
      } else {
        throw new Error(result.message || "Gagal mengunggah gambar. Respons API tidak valid.");
      }
    } catch (error) {
      toast.error(`Upload Gagal: ${error.message}`, { id: uploadToast });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImageUrl = (indexToRemove) => {
    setImageUrls((prevUrls) => prevUrls.filter((_, index) => index !== indexToRemove));
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
      {imageUrls.map((url, index) => (
        <input key={index} type="hidden" name="imageUrls" value={url} />
      ))}

      {/* Title */}
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={initialData?.title} required />
      </div>

      {/* Category */}
      <div>
        <Label htmlFor="categoryId">Category</Label>
        <select id="categoryId" name="categoryId" defaultValue={initialData?.categoryId} required className="w-full mt-1 p-2 border rounded-md bg-white">
          <option value="">Select a category</option>
          {(categories || []).map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={initialData?.description} />
      </div>

      {/* Upload Gambar */}
      <div>
        <Label>Activity Images</Label>
        <div className="p-4 border rounded-md mt-1 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img src={url} alt={`Uploaded image ${index + 1}`} className="w-full h-24 object-cover rounded-md" />
                <button
                  type="button"
                  onClick={() => removeImageUrl(index)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/png, image/jpeg, image/gif" />
          <Button type="button" variant="outline" onClick={() => fileInputRef.current.click()} disabled={isUploading}>
            {isUploading ? "Uploading..." : "Upload Image"}
          </Button>
        </div>
        {imageUrls.length === 0 && <p className="text-sm text-red-500 mt-1">Please upload at least one image.</p>}
      </div>

      {/* Price, Discount & Rating */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price (IDR)</Label>
          <Input id="price" name="price" type="number" defaultValue={initialData?.price} required />
        </div>
        <div>
          <Label htmlFor="price_discount">Discount Price (IDR)</Label>
          <Input id="price_discount" name="price_discount" type="number" defaultValue={initialData?.price_discount} required />
        </div>
      </div>
      <div>
        <Label htmlFor="rating">Rating (1-5)</Label>
        <Input id="rating" name="rating" type="number" step="0.1" min="1" max="5" defaultValue={initialData?.rating} required />
      </div>

      {/* Location */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" defaultValue={initialData?.city} />
        </div>
        <div>
          <Label htmlFor="province">Province</Label>
          <Input id="province" name="province" defaultValue={initialData?.province} />
        </div>
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea id="address" name="address" defaultValue={initialData?.address} />
      </div>

      <div className="flex justify-end pt-4">
        <SubmitButton isEditing={isEditing} />
      </div>
    </form>
  );
}
