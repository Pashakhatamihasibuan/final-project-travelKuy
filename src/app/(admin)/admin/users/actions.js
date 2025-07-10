"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const API_BASE_URL = "https://travel-journal-api-bootcamp.do.dibimbing.id/api/v1";

// Server action to update a user's role
export async function updateUserRole(userId, newRole) {
  const token = cookies().get("token")?.value;

  if (!token) {
    return { success: false, message: "Authentication required." };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/update-user-role/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        apiKey: "24405e01-fbc1-45a5-9f5a-be13afcd757c",
      },
      body: JSON.stringify({ role: newRole }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to update role.");
    }

    // Refresh the users page to show the updated data
    revalidatePath("/admin/users");
    return { success: true, message: "User role updated successfully." };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
