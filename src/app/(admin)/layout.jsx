import AdminSidebar from "@/components/ui/AdminSidebar";
import {authenticate} from "@/features/authentication/actions";
import {redirect} from "next/navigation";

export default async function AdminLayout({children}) {
    // Verifikasi otentikasi di sisi server
    const {user} = await authenticate(); // Ini sudah benar (async)

    // Jika tidak ada user atau rolenya bukan admin, redirect ke halaman login
    if (!user || user.role !== "admin") {
        redirect("/auth/login");
    }

    return (
        <div className="flex min-h-screen">
            <AdminSidebar/>
            <main className="flex-1 p-8 bg-gray-50">{children}</main>
        </div>
    );
}