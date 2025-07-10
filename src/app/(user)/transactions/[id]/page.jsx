// src/app/(user)/transactions/[id]/page.jsx

import {getTransactionById} from '@/lib/server-data';
import {notFound} from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {format} from 'date-fns';
import {id} from 'date-fns/locale';
import {Badge} from '@/components/ui/badge';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Separator} from '@/components/ui/separator';
import {AlertCircle, ArrowLeft, Calendar, CheckCircle, Clock, FileText} from 'lucide-react';
import {ProofOfPaymentForm} from "@/components/forms/ProofOfPaymentForm";

const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
        case 'success':
            return {
                classes: 'bg-green-100 text-green-800 border-green-200',
                label: 'Success',
                icon: CheckCircle,
                description: 'Pembayaran telah berhasil dan dikonfirmasi'
            };
        case 'pending':
            return {
                classes: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                label: 'Pending',
                icon: Clock,
                description: 'Silakan upload bukti pembayaran'
            };
        case 'waiting_confirmation':
            return {
                classes: 'bg-blue-100 text-blue-800 border-blue-200',
                label: 'Waiting Confirmation',
                icon: Clock,
                description: 'Bukti pembayaran sedang diverifikasi admin'
            };
        case 'failed':
            return {
                classes: 'bg-red-100 text-red-800 border-red-200',
                label: 'Failed',
                icon: AlertCircle,
                description: 'Pembayaran ditolak atau gagal diproses'
            };
        case 'canceled':
            return {
                classes: 'bg-red-100 text-red-800 border-red-200',
                label: 'Canceled',
                icon: AlertCircle,
                description: 'Transaksi telah dibatalkan'
            };
        default:
            return {
                classes: 'bg-gray-100 text-gray-800 border-gray-200',
                label: status || 'Tidak Diketahui',
                icon: AlertCircle,
                description: 'Status tidak diketahui'
            };
    }
};

export default async function TransactionDetailPage({params}) {
    const transaction = await getTransactionById(params.id);

    // Jika transaksi tidak ditemukan, tampilkan halaman 404
    if (!transaction) {
        notFound();
    }

    const statusConfig = getStatusConfig(transaction.status);

    return (
        <div className="container mx-auto max-w-4xl py-8 px-4">
            <Link href="/transactions" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6">
                <ArrowLeft className="h-4 w-4"/>
                Kembali ke Riwayat Transaksi
            </Link>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle className="text-2xl font-bold text-slate-800">Detail Transaksi</CardTitle>
                            <CardDescription className="font-mono text-sm">{transaction.id}</CardDescription>

                        </div>
                        <Badge className={`capitalize text-sm px-4 py-1.5 ${statusConfig.classes}`}>
                            {statusConfig.label}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Ringkasan Transaksi */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-lg"><FileText className="h-5 w-5 text-slate-600"/></div>
                            <div>
                                <p className="text-sm text-gray-500">No. Invoice</p>
                                <p className="font-medium text-slate-700">{transaction.invoiceId}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-lg"><Calendar className="h-5 w-5 text-slate-600"/></div>
                            <div>
                                <p className="text-sm text-gray-500">Tanggal Pesanan</p>
                                <p className="font-medium text-slate-700">{format(new Date(transaction.orderDate), 'dd MMMM yyyy', {locale: id})}</p>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-6"/>

                    {/* Detail Item yang Dibeli */}
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Detail Pembelian</h3>
                        <div className="space-y-4">
                            {transaction.transaction_items?.map((item, index) => (
                                <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border">
                                    <div className="relative w-20 h-20 flex-shrink-0 bg-gray-200 rounded-md">
                                        <Image
                                            src={item.imageUrls?.[0] || '/placeholder.jpg'}
                                            alt={item.title || 'Gambar Aktivitas'}
                                            fill
                                            className="object-cover rounded-md"
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-gray-800">{item.title}</p>
                                        <p className="text-sm text-gray-500">
                                            {item.quantity} barang x Rp {new Intl.NumberFormat('id-ID').format(item.price || 0)}
                                        </p>
                                    </div>
                                    <p className="font-semibold text-gray-800 flex-shrink-0">
                                        Rp {new Intl.NumberFormat('id-ID').format((item.price || 0) * item.quantity)}
                                    </p>
                                </div>

                            ))}
                        </div>
                    </div>

                    <Separator className="my-6"/>

                    {/* Ringkasan Pembayaran */}
                    <div className="bg-slate-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Ringkasan Pembayaran</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-600">Metode Pembayaran</span>
                                <div className="flex items-center gap-2">
                                    <div className="relative w-7 h-7">
                                        {transaction.payment_method?.imageUrl && (
                                            <Image src={transaction.payment_method.imageUrl} alt={transaction.payment_method.name} fill
                                                   className="object-contain"/>
                                        )}
                                    </div>
                                    <span className="font-medium text-slate-800">{transaction.payment_method?.name || 'Tidak diketahui'}</span>
                                </div>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-3 border-t">
                                <span>Total Pembayaran</span>
                                <span className="text-primary">
                                    Rp {new Intl.NumberFormat('id-ID').format(transaction.totalAmount || 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Status Pembayaran</h3>

                        {/* Jika bukti sudah diunggah */}
                        {transaction.proofPaymentUrl ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle className="h-5 w-5"/>
                                    <p className="font-semibold">Bukti pembayaran telah diunggah.</p>
                                </div>
                                <p className="text-sm text-gray-600">Status transaksi akan diperbarui setelah dikonfirmasi oleh admin.</p>
                                <a href={transaction.proofPaymentUrl} target="_blank" rel="noopener noreferrer"
                                   className="text-sm font-medium text-sky-600 hover:underline">
                                    Lihat Bukti Pembayaran
                                </a>
                            </div>
                        ) : transaction.status === 'pending' ? (
                            // Jika status PENDING dan bukti BELUM diunggah, tampilkan form
                            <ProofOfPaymentForm transactionId={transaction.id}/>
                        ) : (
                            // Tampilan untuk status lain (success, failed, etc)
                            <p className="text-sm text-gray-600">
                                Status transaksi saat ini adalah <span className="font-semibold">{statusConfig.label}</span>.
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}