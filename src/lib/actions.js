"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

/**
 * Server Action for updating the user profile.
 */
export async function updateProfileAction(formData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return { success: false, message: "Authentication failed. Please log in again." };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/update-profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apiKey: API_KEY,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Failed to update profile.");
    }

    revalidatePath("/profile");
    return { success: true, message: "Profile updated successfully!" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Server Action for uploading a profile image.
 */
export async function uploadProfileImageAction(formData) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return { success: false, message: "Authentication failed." };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/upload-image`, {
      method: "POST",
      headers: {
        apiKey: API_KEY,
        Authorization: `Bearer ${token}`,
      },
      body: formData, // Send FormData directly
    });

    const result = await response.json();
    if (!response.ok || result.status !== "success") {
      throw new Error(result.message || "Failed to upload image.");
    }

    return { success: true, url: result.url };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
