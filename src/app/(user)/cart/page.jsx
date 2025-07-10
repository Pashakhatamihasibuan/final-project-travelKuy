import Link from 'next/link';
import {cookies} from 'next/headers';
import {Button} from '@/components/ui/button';
import {ShoppingCart} from 'lucide-react';
import {getCart, getPaymentMethods} from '@/lib/data';
import CartContents from '@/features/cart/components/CartContents';

export default async function UserCartPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    // If no token, this should be handled by middleware, but just in case
    if (!token) {
        return (
            <div className="bg-slate-50 min-h-screen">
                <div className="container mx-auto px-4 md:px-6 py-8">
                    <div className="text-center border-2 border-dashed border-slate-300 bg-white p-12 rounded-lg">
                        <ShoppingCart className="mx-auto h-16 w-16 text-slate-300"/>
                        <h2 className="mt-4 text-2xl font-bold text-slate-700">Login Diperlukan</h2>
                        <p className="mt-2 text-slate-500">Anda perlu login untuk mengakses keranjang belanja.</p>
                        <Button asChild className="mt-6">
                            <Link href="/auth/login">Login Sekarang</Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const [cartData, paymentMethodsData] = await Promise.all([
        getCart(token),
        getPaymentMethods(token)
    ]);

    const cartItems = cartData?.data || [];
    const paymentMethods = paymentMethodsData?.data || [];

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="container mx-auto px-4 md:px-6 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-800">Keranjang Belanja</h1>
                    <p className="text-slate-500 mt-1">Periksa kembali pesanan Anda sebelum melanjutkan.</p>
                </div>

                {cartItems.length === 0 ? (
                    <div className="text-center border-2 border-dashed border-slate-300 bg-white p-12 rounded-lg">
                        <ShoppingCart className="mx-auto h-16 w-16 text-slate-300"/>
                        <h2 className="mt-4 text-2xl font-bold text-slate-700">Keranjang Anda Kosong</h2>
                        <p className="mt-2 text-slate-500">Sepertinya Anda belum menambahkan aktivitas apapun.</p>
                        <Button asChild className="mt-6">
                            <Link href="/activities">Cari Aktivitas Sekarang</Link>
                        </Button>
                    </div>
                ) : (
                    <CartContents initialItems={cartItems} paymentMethods={paymentMethods}/>
                )}
            </div>
        </div>
    );
}