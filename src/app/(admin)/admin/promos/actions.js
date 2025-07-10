"use server";

import { revalidatePath } from "next/cache";
import { fetchServerApi } from "@/lib/server-data";

/**
 * Helper function untuk memproses data form Promo.
 */
function processPromoFormData(formData) {
  const payload = {};
  for (const [key, value] of formData.entries()) {
    // Cek apakah field ini seharusnya berupa angka
    if (["promo_discount_price", "minimum_claim_price"].includes(key)) {
      payload[key] = parseFloat(value) || 0; // Konversi ke angka
    } else {
      payload[key] = value;
    }
  }
  return payload;
}

export async function createPromo(previousState, formData) {
  const payload = processPromoFormData(formData);
  try {
    await fetchServerApi("/create-promo", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    revalidatePath("/admin/promos");
    return { success: true, message: "Promo berhasil dibuat!" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function updatePromo(id, previousState, formData) {
  const payload = processPromoFormData(formData);
  try {
    await fetchServerApi(`/update-promo/${id}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    revalidatePath("/admin/promos");
    return { success: true, message: "Promo berhasil diperbarui!" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function deletePromo(id) {
  try {
    await fetchServerApi(`/delete-promo/${id}`, {
      method: "DELETE",
    });
    revalidatePath("/admin/promos");
    return { success: true, message: "Promo berhasil dihapus!" };
  } catch (error) {
    // Memberikan pesan error yang lebih spesifik jika gagal hapus
    if (error.message.includes("Something went wrong")) {
      return { success: false, message: "Gagal Hapus: Promo mungkin terikat dengan data lain." };
    }
    return { success: false, message: error.message };
  }
}
