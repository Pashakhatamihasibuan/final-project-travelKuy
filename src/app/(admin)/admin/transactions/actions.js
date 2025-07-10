// src/app/(admin)/admin/transactions/actions.js
"use server";

import { revalidatePath } from "next/cache";
import { fetchServerApi } from "@/lib/server-data";

// ✅ PERBAIKAN: Sesuaikan dengan status yang diterima API
const STATUS_YANG_VALID = ["pending", "success", "failed"]; // Hapus "cancelled"

export async function updateTransactionStatus(transactionId, newStatus) {
  try {
    // Validasi input
    if (!transactionId) {
      throw new Error("ID transaksi harus diisi");
    }

    const statusYangDivalidasi = newStatus?.toLowerCase()?.trim();

    // ✅ PERBAIKAN: Validasi dengan status yang benar-benar diterima API
    if (!STATUS_YANG_VALID.includes(statusYangDivalidasi)) {
      throw new Error(`Status tidak valid. API hanya menerima: ${STATUS_YANG_VALID.join(", ")}`);
    }

    // Format data sesuai kebutuhan API
    const dataRequest = {
      status: statusYangDivalidasi,
    };

    console.log("Mengirim data update status:", {
      transactionId,
      dataRequest,
    });

    const response = await fetchServerApi(`/update-transaction-status/${transactionId}`, {
      method: "POST",
      body: dataRequest,
    });

    console.log("Response dari API:", response);

    // ✅ PERBAIKAN: Improved response handling
    const isSuccess = response?.success === true || response?.status === "success" || response?.message === "Status Updated" || (response && !response.error);

    if (!isSuccess) {
      const errorMessage = response?.error || response?.message || response?.data?.message || "Gagal memperbarui status transaksi";

      throw new Error(errorMessage);
    }

    // Perbarui cache
    revalidatePath("/admin/transactions");

    return {
      success: true,
      message: response?.message || "Status transaksi berhasil diperbarui",
      data: response?.data || response,
    };
  } catch (error) {
    console.error("Gagal memperbarui status transaksi:", {
      transactionId,
      error: error.message,
    });

    // ✅ PERBAIKAN: Better error handling
    if (error.message === "Status Updated") {
      revalidatePath("/admin/transactions");
      return {
        success: true,
        message: "Status transaksi berhasil diperbarui",
        data: null,
      };
    }

    // ✅ PERBAIKAN: Specific error messages for different scenarios
    let errorMessage = "Terjadi kesalahan saat memperbarui status";

    if (error.message.includes("tidak valid") || error.message.includes("does not match")) {
      errorMessage = "Status yang dipilih tidak didukung oleh sistem";
    } else if (error.message.includes("API hanya menerima")) {
      errorMessage = error.message;
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
}

// ✅ TAMBAHAN: Helper function untuk debugging
export async function debugApiResponse(transactionId, newStatus) {
  try {
    const response = await fetchServerApi(`/update-transaction-status/${transactionId}`, {
      method: "POST",
      body: { status: newStatus },
    });

    console.log("Debug API Response:", {
      transactionId,
      newStatus,
      response,
      responseType: typeof response,
      responseKeys: Object.keys(response || {}),
    });

    return response;
  } catch (error) {
    console.error("Debug API Error:", error);
    throw error;
  }
}
