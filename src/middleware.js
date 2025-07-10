import {NextResponse} from "next/server";
import {jwtDecode} from "jwt-decode";

export async function middleware(request) {
    const token = request.cookies.get("token")?.value;
    const {pathname} = request.nextUrl;

    // BARU: Redirect admin ke dashboard jika mereka mengunjungi homepage
    if (pathname === "/" && token) {
        try {
            const decoded = jwtDecode(token);
            if (decoded.role === "admin") {
                return NextResponse.redirect(new URL("/admin", request.url));
            }
        } catch (error) {
            // Token tidak valid atau rusak, biarkan saja.
            // Logika di bawah akan menangani rute yang dilindungi.
        }
    }

    // ---- KODE ASLI ANDA (TETAP SAMA) ----

    // Rute khusus admin
    if (pathname.startsWith("/admin")) {
        if (!token) {
            return NextResponse.redirect(new URL("/auth/login", request.url));
        }
        try {
            const decoded = jwtDecode(token);
            if (decoded.role !== "admin") {
                return NextResponse.redirect(new URL("/", request.url));
            }
        } catch (error) {
            return NextResponse.redirect(new URL("/auth/login", request.url));
        }
    }

    const protectedRoutes = ["/profile", "/cart", "/booking"];
    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    );

    if (!token && isProtectedRoute) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname + request.nextUrl.search);

        if (pathname.startsWith("/cart")) {
            loginUrl.searchParams.set("login_intent", "cart_access");
        }

        return NextResponse.redirect(loginUrl);
    }

    const isActivityPage = pathname.match(/^\/activities\/[^\/]+$/);

    if (isActivityPage) {
        const response = NextResponse.next();
        response.headers.set("x-user-authenticated", token ? "true" : "false");
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/", // DITAMBAHKAN: untuk memeriksa homepage
        "/profile/:path*",
        "/cart/:path*",
        "/booking/:path*",
        "/activities/:id*",
        "/admin/:path*",
    ],
};