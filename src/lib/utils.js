import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getTokenFromCookie() {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    const trimmedCookie = cookie.trim();
    if (!trimmedCookie) continue;

    const [name, value] = trimmedCookie.split("=");

    if (name === "client_token" && value && value !== "undefined") {
      try {
        const decoded = decodeURIComponent(value);
        return decoded;
      } catch (e) {
        return value;
      }
    }
  }
  return null;
}
