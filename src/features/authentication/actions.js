"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { addToCartApi, removeFromCartApi, updateCartItemApi } from "@/lib/data";
import { jwtDecode } from "jwt-decode";

const API_BASE_URL = process.env.API_BASE_URL || "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1";
const API_KEY = process.env.API_KEY || "24405e01-fbc1-45a5-9f5a-be13afcd757c";

/**
 * Fungsi terpusat untuk melakukan panggilan API.
 */
async function apiCall(endpoint, options = {}, token = null) {
  const baseUrl = process.env.API_BASE_URL || "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1";
  const apiKey = process.env.API_KEY || "24405e01-fbc1-45a5-9f5a-be13afcd757c";

  const headers = {
    apiKey: apiKey,
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${endpoint}`, { cache: "no-store", ...options, headers });

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error(`Respons dari server tidak valid. Status: ${response.status}`);
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Terjadi kesalahan pada permintaan API.");
  }
  return data;
}

// --- FUNGSI BARU UNTUK VERIFIKASI SESI ---
export async function authenticate() {
  // --- PERBAIKAN PENTING DI SINI ---
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  // --------------------------------

  if (!token) {
    return { user: null };
  }

  try {
    const user = jwtDecode(token);
    return { user };
  } catch (error) {
    console.error("Invalid token:", error);
    // Hapus cookie yang salah jika ada
    cookies().delete("token");
    return { user: null };
  }
}

export async function login(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return { status: "error", message: "Email dan password harus diisi" }; // Mengembalikan pesan asli
  }

  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apiKey: API_KEY,
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { status: "error", message: result.message || "Login gagal" }; // Mengembalikan pesan asli
    }

    const cookieStore = cookies(); // Tidak perlu await di sini

    // Server-side token (HTTP-only for security)
    cookieStore.set("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // Client-side accessible token (for API calls) - PASTIKAN BARIS INI ADA!
    cookieStore.set("client_token", result.token, {
      httpOnly: false, // ACCESSIBLE FROM CLIENT-SIDE
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // Simpan data pengguna (opsional, tapi jika digunakan di client, pertimbangkan httpOnly: false atau ambil dari JWT decode di client)
    // Untuk konsistensi dan keamanan yang lebih baik, jika user info dibutuhkan di client, bisa di-decode dari client_token
    // atau pastikan data user juga tidak httpOnly jika memang diakses client.
    cookieStore.set("user", JSON.stringify(result.data), {
      httpOnly: true, // Biarkan ini httpOnly jika hanya digunakan server-side atau untuk validasi awal.
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
  } catch (error) {
    console.error("Login error:", error);
    return { status: "error", message: "Terjadi kesalahan saat login" }; // Mengembalikan pesan asli
  }

  // Redirect logic remains the same...
  const callbackUrl = formData.get("callbackUrl");
  const loginIntent = formData.get("login_intent");
  let redirectUrl = "/";

  if (loginIntent === "add_to_cart" && callbackUrl) {
    redirectUrl = callbackUrl;
  } else if (loginIntent === "cart_access") {
    redirectUrl = "/cart";
  } else if (callbackUrl) {
    redirectUrl = callbackUrl;
  }

  revalidatePath("/", "layout"); // Revalidate the entire layout to update UI everywhere
  redirect(redirectUrl); // Pastikan ini mengarah ke redirectUrl
}

export async function register(prevState, formData) {
  try {
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");
    const passwordRepeat = formData.get("passwordRepeat");

    if (password !== passwordRepeat) {
      return { status: "error", message: "Password dan Ulangi Password tidak cocok." };
    }

    const dataToSend = {
      email,
      name,
      password,
      passwordRepeat,
      role: formData.get("role"),
      phoneNumber: formData.get("phoneNumber"),
      profilePictureUrl: `https://placehold.co/200x200/E2E8F0/4A5568?text=${name.charAt(0).toUpperCase()}`,
    };

    await apiCall("/register", {
      method: "POST",
      body: JSON.stringify(dataToSend),
    });

    return { status: "success", message: "Registrasi berhasil!" };
  } catch (error) {
    return { status: "error", message: error.message || "Terjadi kesalahan saat registrasi." };
  }
}

export async function logout() {
  const cookieStore = cookies(); // Tidak perlu await di sini
  cookieStore.delete("token");
  cookieStore.delete("user");
  redirect("/");
}

// --- Aksi Keranjang (Cart) ---
export async function addToCart(prevState, formData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return {
        status: "error",
        message: "Token tidak ditemukan. Silakan login kembali.",
      };
    }

    // Extract form data
    const activityId = formData.get("activityId");
    const selectedDate = formData.get("selectedDate");
    const guestCount = parseInt(formData.get("guestCount"));
    const pathname = formData.get("pathname");

    // Validation
    if (!activityId) {
      return {
        status: "error",
        message: "Activity ID tidak ditemukan",
      };
    }

    if (!selectedDate) {
      return {
        status: "error",
        message: "Tanggal booking harus dipilih",
      };
    }

    if (!guestCount || guestCount < 1) {
      return {
        status: "error",
        message: "Jumlah tamu minimal 1 orang",
      };
    }

    // Validate date is not in the past
    const bookingDate = new Date(selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      return {
        status: "error",
        message: "Tanggal booking tidak boleh di masa lalu",
      };
    }

    // Prepare payload for API
    const cartPayload = {
      activityId,
      bookingDate: selectedDate,
      guestCount,
      // Add other booking details if needed
    };

    console.log("Adding to cart with payload:", cartPayload);

    // Call API to add to cart
    // Note: Adjust this based on your actual API structure
    const result = await addToCartApi(activityId, token, {
      bookingDate: selectedDate,
      guestCount: guestCount,
    });

    if (result && (result.status === "OK" || result.status === "success")) {
      return {
        status: "success",
        message: `Berhasil ditambahkan ke keranjang! ${guestCount} tamu untuk tanggal ${new Date(selectedDate).toLocaleDateString("id-ID")}`,
        data: result.data,
      };
    } else {
      return {
        status: "error",
        message: result?.message || "Gagal menambahkan ke keranjang",
      };
    }
  } catch (error) {
    console.error("Add to cart server action error:", error);
    return {
      status: "error",
      message: "Terjadi kesalahan server: " + error.message,
    };
  }
}

export async function removeFromCart(cartId) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return {
        status: "error",
        message: "Token tidak ditemukan. Silakan login kembali.",
      };
    }

    const result = await removeFromCartApi(cartId, token);

    if (result && (result.status === "OK" || result.status === "success")) {
      return {
        status: "success",
        message: "Item berhasil dihapus dari keranjang",
        data: result.data,
      };
    } else {
      return {
        status: "error",
        message: result?.message || "Gagal menghapus item dari keranjang",
      };
    }
  } catch (error) {
    console.error("Remove from cart server action error:", error);
    return {
      status: "error",
      message: "Terjadi kesalahan server: " + error.message,
    };
  }
}

export async function updateCartQuantity(cartId, quantity) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return {
        status: "error",
        message: "Token tidak ditemukan. Silakan login kembali.",
      };
    }

    if (quantity < 1) {
      return {
        status: "error",
        message: "Jumlah tidak boleh kurang dari 1",
      };
    }

    const result = await updateCartItemApi(cartId, token, quantity);

    if (result && (result.status === "OK" || result.status === "success")) {
      return {
        status: "success",
        message: "Jumlah item berhasil diperbarui",
        data: result.data,
      };
    } else {
      return {
        status: "error",
        message: result?.message || "Gagal memperbarui jumlah item",
      };
    }
  } catch (error) {
    console.error("Update cart quantity server action error:", error);
    return {
      status: "error",
      message: "Terjadi kesalahan server: " + error.message,
    };
  }
}

// --- Aksi Profil Pengguna (TAMBAHAN BARU) ---
export async function getProfileAction() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      // Jika tidak ada token, mungkin pengguna belum login
      return { status: "error", message: "Pengguna tidak terautentikasi.", data: null };
    }

    const result = await apiCall("/user", { method: "GET" }, token);

    // result sudah berisi data dari 'apiCall', yang akan berisi 'data' jika sukses
    return { status: "success", message: "Data profil berhasil diambil.", data: result.data };
  } catch (error) {
    // 'apiCall' akan melempar error jika respons tidak OK
    return { status: "error", message: error.message, data: null };
  }
}

// Enhanced submitProofOfPayment function
export async function submitProofOfPayment(prevState, formData) {
  const transactionId = formData.get("transactionId");
  const imageFile = formData.get("image");
  const token = cookies().get("token")?.value;

  // Validasi input
  if (!transactionId) {
    return { status: "error", message: "ID transaksi tidak valid." };
  }

  if (!imageFile || imageFile.size === 0) {
    return { status: "error", message: "Anda harus memilih file gambar." };
  }

  if (!token) {
    return { status: "error", message: "Sesi tidak valid. Silakan login kembali." };
  }

  // Validasi tipe file
  const validTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (!validTypes.includes(imageFile.type)) {
    return {
      status: "error",
      message: "Format file tidak didukung. Gunakan JPG, JPEG, atau PNG.",
    };
  }

  // Validasi ukuran file (5MB)
  if (imageFile.size > 5 * 1024 * 1024) {
    return {
      status: "error",
      message: "Ukuran file terlalu besar. Maksimal 5MB.",
    };
  }

  try {
    // Step 1: Upload gambar
    console.log("📤 Uploading image...");
    const imageFormData = new FormData();
    imageFormData.append("image", imageFile);

    const imageResponse = await fetch(`${API_BASE_URL}/upload-image`, {
      method: "POST",
      headers: {
        apiKey: API_KEY,
        Authorization: `Bearer ${token}`,
      },
      body: imageFormData,
    });

    if (!imageResponse.ok) {
      const errorData = await imageResponse.json().catch(() => ({}));
      throw new Error(errorData.message || "Gagal mengunggah gambar ke server.");
    }

    const imageData = await imageResponse.json();
    const imageUrl = imageData.url;

    if (!imageUrl) {
      throw new Error("Server tidak mengembalikan URL gambar yang valid.");
    }

    console.log("✅ Image uploaded successfully:", imageUrl);

    // Step 2: Update proof payment
    console.log("📝 Updating transaction proof...");
    const proofPayload = { proofPaymentUrl: imageUrl };

    const proofResponse = await fetch(`${API_BASE_URL}/update-transaction-proof-payment/${transactionId}`, {
      method: "POST",
      headers: {
        apiKey: API_KEY,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(proofPayload),
    });

    if (!proofResponse.ok) {
      const errorData = await proofResponse.json().catch(() => ({}));
      throw new Error(errorData.message || "Gagal memperbarui bukti pembayaran.");
    }

    console.log("✅ Proof payment updated successfully");

    // Step 3: Update status ke 'waiting_confirmation'
    console.log("🔄 Updating transaction status...");
    const statusPayload = { status: "waiting_confirmation" };

    const statusResponse = await fetch(`${API_BASE_URL}/update-transaction-status/${transactionId}`, {
      method: "POST",
      headers: {
        apiKey: API_KEY,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(statusPayload),
    });

    if (!statusResponse.ok) {
      const errorData = await statusResponse.json().catch(() => ({}));
      console.warn("⚠️ Failed to update status, but proof was uploaded successfully");
      // Tidak throw error karena bukti sudah berhasil diupload
    } else {
      console.log("✅ Transaction status updated to waiting_confirmation");
    }

    // Revalidate cache untuk memperbarui UI
    revalidatePath(`/transactions/${transactionId}`);
    revalidatePath("/transactions");

    return {
      status: "success",
      message: 'Bukti pembayaran berhasil diunggah! Status transaksi telah diperbarui menjadi "Menunggu Konfirmasi".',
    };
  } catch (error) {
    console.error("❌ Error in submitProofOfPayment:", error);
    return {
      status: "error",
      message: error.message || "Terjadi kesalahan saat mengunggah bukti pembayaran.",
    };
  }
}

// Function untuk admin mengkonfirmasi pembayaran (opsional)
export async function confirmPayment(transactionId) {
  const token = cookies().get("token")?.value;

  if (!token) {
    return { status: "error", message: "Tidak terotorisasi." };
  }

  try {
    const statusPayload = { status: "success" };

    const response = await fetch(`${API_BASE_URL}/update-transaction-status/${transactionId}`, {
      method: "POST",
      headers: {
        apiKey: API_KEY,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(statusPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Gagal mengkonfirmasi pembayaran.");
    }

    // Revalidate cache
    revalidatePath(`/transactions/${transactionId}`);
    revalidatePath("/transactions");

    return {
      status: "success",
      message: "Pembayaran berhasil dikonfirmasi!",
    };
  } catch (error) {
    console.error("Error confirming payment:", error);
    return {
      status: "error",
      message: error.message || "Terjadi kesalahan saat mengkonfirmasi pembayaran.",
    };
  }
}
