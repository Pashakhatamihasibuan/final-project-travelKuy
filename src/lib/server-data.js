import { cookies } from "next/headers";
import { notFound } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export async function fetchServerApi(endpoint, options = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const headers = {
    apiKey: API_KEY,
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    // Pastikan body di-stringify dengan benar
    const body = options.body ? JSON.stringify(options.body) : undefined;

    const response = await fetch(url, {
      ...options,
      headers,
      body,
      cache: "no-store",
    });

    // Handle response error lebih detail
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Tambahkan logging untuk debugging
      console.error("Error response:", {
        status: response.status,
        endpoint,
        errorData,
      });

      if (response.status === 400) {
        throw new Error(errorData.message || `Data tidak valid: ${JSON.stringify(errorData.errors || {})}`);
      }
      if (response.status === 404) notFound();
      throw new Error(errorData.message || `Gagal memproses permintaan`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Gagal memanggil API ${endpoint}:`, error);
    throw new Error(error.message || "Terjadi kesalahan pada server");
  }
}

// --- FUNGSI-FUNGSI DI BAWAH INI TIDAK PERLU DIUBAH LAGI ---
// Mereka akan secara otomatis menggunakan `fetchServerApi` yang sudah benar.

export async function getMyTransactions() {
  const result = await fetchServerApi("/my-transactions");
  if (result.status === "OK" || result.status === "success") {
    return result.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  return [];
}

export async function getTransactionById(id) {
  if (!id) return null;
  const result = await fetchServerApi(`/transaction/${id}`);
  if (result.status === "OK" || result.status === "success") {
    return result.data;
  }
  return null;
}

export async function addToCartWithBookingDetails(prevState, formData) {
  try {
    const activityId = formData.get("activityId");
    const selectedDate = formData.get("selectedDate");
    const guestCount = parseInt(formData.get("guestCount"));
    const specialRequests = formData.get("specialRequests") || "";

    if (!activityId || !selectedDate || !guestCount || guestCount < 1) {
      return { status: "error", message: "Semua field harus diisi dengan benar" };
    }
    // ... (sisa logika validasi Anda)

    const cartPayload = {
      activityId,
      bookingDate: selectedDate,
      guestCount,
      specialRequests,
      addedAt: new Date().toISOString(),
    };

    const result = await fetchServerApi("/add-cart", {
      method: "POST",
      body: cartPayload, // Kirim sebagai objek, `fetchServerApi` akan menanganinya
    });

    if (result && (result.status === "OK" || result.status === "success")) {
      return { status: "success", message: "Berhasil ditambahkan ke keranjang!", data: result.data };
    } else {
      return { status: "error", message: result?.message || "Gagal menambahkan ke keranjang" };
    }
  } catch (error) {
    return { status: "error", message: "Terjadi kesalahan server: " + error.message };
  }
}

export async function getAllUsers() {
  const result = await fetchServerApi("/all-user");
  return result?.data || [];
}

export async function getAllTransactions() {
  const result = await fetchServerApi("/all-transactions");
  return result?.data || [];
}

export async function getAllActivities() {
  const result = await fetchServerApi("/activities", { authRequired: false });
  return result?.data || [];
}

export async function getAllPromos() {
  const result = await fetchServerApi("/promos", { authRequired: false });
  return result?.data || [];
}

export async function getAllCategories() {
  const result = await fetchServerApi("/categories", { authRequired: false });
  return result?.data || [];
}

export async function getBannerDetails(id) {
  const result = await fetchServerApi(`/banner/${id}`, { authRequired: false });
  return result?.data || [];
}
