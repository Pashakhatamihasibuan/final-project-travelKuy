// Enhanced API functions untuk cart management

const API_BASE_URL = process.env.API_BASE_URL || "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1";
const API_KEY = process.env.API_KEY || "24405e01-fbc1-45a5-9f5a-be13afcd757c";

async function fetchApi(endpoint, options = {}) {
  const token = options.token;
  const headers = {
    apiKey: API_KEY,
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: headers,
      cache: "no-store",
    });

    if (!response.ok) return null;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Enhanced addToCartApi with booking details
export const addToCartApi = (activityId, token, bookingDetails = {}) => {
  const payload = {
    activityId,
    ...bookingDetails, // includes bookingDate, guestCount, etc.
  };

  return fetchApi("/add-cart", {
    method: "POST",
    body: JSON.stringify(payload),
    token: token,
  });
};

// Alternative if API expects separate fields
export const addToCartApiWithDetails = (activityId, token, bookingDate, guestCount) => {
  const payload = {
    activityId,
    bookingDate,
    guestCount,
    // Add other fields if needed by your API
  };

  return fetchApi("/add-cart", {
    method: "POST",
    body: JSON.stringify(payload),
    token: token,
  });
};

// Get cart with full booking details
export async function getCartWithBookingDetails(token) {
  try {
    const result = await fetchApi("/carts", { token });
    if (result && result.status === "OK" && Array.isArray(result.data)) {
      // Ensure booking details are included
      const cartItems = result.data.map((item) => ({
        ...item,
        // Make sure these fields exist in your cart data
        bookingDate: item.bookingDate || null,
        guestCount: item.guestCount || item.quantity || 1,
        // Additional booking metadata
        bookingDetails: {
          date: item.bookingDate,
          guests: item.guestCount || item.quantity || 1,
          specialRequests: item.specialRequests || null,
        },
      }));

      return { status: "success", data: cartItems };
    }
    return { status: "error", message: "Failed to fetch cart data", data: [] };
  } catch (error) {
    return { status: "error", message: error.message, data: [] };
  }
}

// Update cart item with booking details
export const updateCartItemWithDetails = (cartId, token, updates) => {
  const payload = {
    quantity: updates.quantity,
    bookingDate: updates.bookingDate,
    guestCount: updates.guestCount,
    ...updates,
  };

  return fetchApi(`/update-cart/${cartId}`, {
    method: "POST",
    body: JSON.stringify(payload),
    token: token,
  });
};

// Existing functions remain the same
export const getBanners = () => fetchApi("/banners");
export const getCategories = () => fetchApi("/categories");
export const getCategoryDetails = (id) => fetchApi(`/category/${id}`);
export const getActivitiesByCategoryId = (id) => fetchApi(`/activities-by-category/${id}`);
export const getPromos = () => fetchApi("/promos");
export const getPromoDetails = (id) => fetchApi(`/promo/${id}`);
export const getAllActivities = () => fetchApi("/activities");
export const getActivityDetails = (id) => fetchApi(`/activity/${id}`);

export async function getCart(token) {
  try {
    const result = await fetchApi("/carts", { token });
    if (result && result.status === "OK" && Array.isArray(result.data)) {
      return { status: "success", data: result.data };
    }
    return { status: "error", message: "Failed to fetch cart data", data: [] };
  } catch (error) {
    return { status: "error", message: error.message, data: [] };
  }
}

export const removeFromCartApi = (cartId, token) =>
  fetchApi(`/delete-cart/${cartId}`, {
    method: "DELETE",
    token: token,
  });

export const updateCartItemApi = (cartId, token, quantity) =>
  fetchApi(`/update-cart/${cartId}`, {
    method: "POST",
    body: JSON.stringify({ quantity }),
    token: token,
  });

export const getPaymentMethods = (token) => fetchApi("/payment-methods", { token });

// Enhanced createTransaction function
export async function createTransaction(payload, token) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1";
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "24405e01-fbc1-45a5-9f5a-be13afcd757c";

  try {
    console.log("Creating transaction with payload:", payload);

    const response = await fetch(`${API_BASE_URL}/create-transaction`, {
      method: "POST",
      headers: {
        apiKey: API_KEY,
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const result = await response.json();
    console.log("Transaction API Response:", result);

    if (!response.ok) {
      const serverMessage = result.message || JSON.stringify(result);
      throw new Error(`Server Error: ${serverMessage}`);
    }

    return {
      status: "success",
      message: result.message || "Transaksi berhasil dibuat!",
      data: result.data, // Include response data if available
    };
  } catch (error) {
    console.error("Create Transaction Exception:", error);
    return {
      status: "error",
      message: error.message,
    };
  }
}

// Profile functions
export async function getProfile(token) {
  const result = await fetchApi("/user", { token });
  return result?.data ?? null;
}

/**
 * Mengambil daftar semua transaksi milik pengguna yang sedang login.
 * Endpoint diasumsikan: GET /transactions
 */
export async function getMyTransactionsWithDetails() {
  try {
    const result = await fetchServerApi("/transactions");
    if (result.status === "OK" || result.status === "success") {
      // Enhanced transaction data processing
      const transactions = result.data.map((transaction) => ({
        ...transaction,
        // Ensure transaction items have complete data
        transactionItems:
          transaction.transactionItems?.map((item) => ({
            ...item,
            // Fallback values if data is missing
            quantity: item.quantity || item.guestCount || 1,
            price: item.price || item.activity?.price_discount || 0,
            bookingDate: item.bookingDate || transaction.bookingDate,
            activity: {
              ...item.activity,
              imageUrls: item.activity?.imageUrls || ["/placeholder-activity.jpg"],
              title: item.activity?.title || "Activity",
              city: item.activity?.city || "",
              province: item.activity?.province || "",
            },
          })) || [],
      }));

      return transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return [];
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}

/**
 * Mengambil detail satu transaksi berdasarkan ID.
 * Endpoint diasumsikan: GET /transaction/{id}
 */
export async function getTransactionById(id) {
  if (!id) return null;
  const result = await fetchServerApi(`/transaction/${id}`);
  if (result.status === "OK" || result.status === "success") {
    return result.data;
  }
  // Jika tidak ditemukan, fetchServerApi akan otomatis memanggil notFound()
  return null;
}
