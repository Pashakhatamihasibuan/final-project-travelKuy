"use server";

import { revalidatePath } from "next/cache";
import { fetchServerApi } from "@/lib/server-data";

function processFormData(formData) {
  const payload = {
    imageUrls: formData.getAll("imageUrls"),
  };
  for (const [key, value] of formData.entries()) {
    if (key !== "imageUrls") {
      if (["price", "price_discount", "rating"].includes(key)) {
        payload[key] = parseFloat(value) || 0;
      } else {
        payload[key] = value;
      }
    }
  }
  return payload;
}

export async function createActivity(previousState, formData) {
  const payload = processFormData(formData);
  try {
    await fetchServerApi("/create-activity", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    revalidatePath("/admin/activities");
    return { success: true, message: "Aktivitas berhasil dibuat!" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function updateActivity(id, previousState, formData) {
  const payload = processFormData(formData);
  try {
    if (!id) throw new Error("ID Aktivitas tidak valid.");
    await fetchServerApi(`/update-activity/${id}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    revalidatePath("/admin/activities");
    return { success: true, message: "Aktivitas berhasil diperbarui!" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function deleteActivity(id) {
  try {
    if (!id) {
      return { success: false, message: "ID Aktivitas tidak valid." };
    }
    await fetchServerApi(`/delete-activity/${id}`, {
      method: "DELETE",
    });
    revalidatePath("/admin/activities");
    return { success: true, message: "Aktivitas berhasil dihapus!" };
  } catch (error) {
    if (error.message.includes("Something went wrong")) {
      return {
        success: false,
        message: "Gagal Hapus: Aktivitas ini mungkin terikat dengan data lain (misal: Transaksi).",
      };
    }
    return { success: false, message: error.message };
  }
}
