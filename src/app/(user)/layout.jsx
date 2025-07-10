import {cookies} from 'next/headers';
import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import {getCart} from '@/lib/data';
import CartInitializer from '@/components/providers/CartInitializer';
import {Toaster} from "@/components/ui/sonner";

export default async function UserLayout({children}) {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    const userCookie = cookieStore.get('user')?.value;

    let initialCart = [];
    let user = null;

    // Ambil data pengguna dari cookie jika ada
    if (userCookie) {
        try {
            user = JSON.parse(userCookie);
        } catch (error) {
            console.error("Gagal mem-parsing cookie pengguna:", error);
            // Hapus cookie yang rusak jika perlu
            // cookies().delete('user');
        }
    }

    // Ambil data keranjang jika pengguna sudah login (ada token)
    if (token) {
        const cartData = await getCart(token);
        if (cartData && cartData.data) {
            initialCart = cartData.data;
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <CartInitializer cart={initialCart}/>
            {/* Teruskan data token dan user ke Navbar */}
            <Navbar user={user} token={token}/>
            <main className="flex-grow">
                {children}
                <Toaster position="top-center" richColors/>
            </main>
            <Footer/>
        </div>
    );
}