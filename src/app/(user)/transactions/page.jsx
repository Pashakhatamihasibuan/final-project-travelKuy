// src/app/(user)/transactions/page.jsx

'use client';

import {useEffect, useMemo, useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {Badge} from '@/components/ui/badge';
import {Card, CardContent} from "@/components/ui/card";
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {CreditCard, History, ListFilter, Search} from 'lucide-react';

const getStatusClasses = (status) => {
    switch (status?.toLowerCase()) {
        case 'success':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'failed':
        case 'canceled':
            return 'bg-red-100 text-red-800 border-red-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const statusOptions = ['all', 'success', 'pending', 'failed'];

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const fetchTransactions = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/transactions');
                const data = await response.json();
                setTransactions(data || []); // Pastikan transactions selalu array
            } catch (error) {
                console.error("Failed to fetch transactions:", error);
                setTransactions([]); // Set array kosong jika error
            } finally {
                setIsLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    const filteredTransactions = useMemo(() => {
        if (!Array.isArray(transactions)) return []; // Jaga-jaga jika API tidak mengembalikan array
        return transactions
            .filter(transaction => {
                if (statusFilter === 'all') return true;
                return transaction.status?.toLowerCase() === statusFilter;
            })
            .filter(transaction => {
                if (!searchTerm) return true;
                return transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
            });
    }, [transactions, statusFilter, searchTerm]);

    return (
        <div className="container mx-auto max-w-4xl py-8 px-4">
            <div className="flex items-center gap-3 mb-6">
                <History className="h-8 w-8 text-slate-700"/>
                <h1 className="text-3xl font-bold text-slate-800">Riwayat Transaksi</h1>
            </div>

            {/* Fitur Filter dan Search */}
            <Card className="mb-6 p-4">
                {/* ... UI Filter dan Search tetap sama ... */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                        <Input type="text" placeholder="Cari berdasarkan ID Transaksi..." className="pl-10" value={searchTerm}
                               onChange={(e) => setSearchTerm(e.target.value)}/>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <ListFilter className="h-5 w-5 text-gray-500 md:ml-2"/>
                        {statusOptions.map(status => (
                            <Button key={status} variant={statusFilter === status ? 'default' : 'outline'} onClick={() => setStatusFilter(status)}
                                    className="capitalize">
                                {status === 'all' ? 'Semua' : status}
                            </Button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Daftar Transaksi */}
            <div className="space-y-6">
                {isLoading ? (
                    <p className="text-center text-gray-500">Memuat data transaksi...</p>
                ) : filteredTransactions.length === 0 ? (
                    <Card><CardContent className="text-center py-20">...</CardContent></Card>
                ) : (
                    filteredTransactions.map((transaction) => (
                        <Card key={transaction.id} className="transition-all duration-200 overflow-hidden">
                            <CardContent className="p-6">
                                {/* Header */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    {/* ... Info ID dan tanggal ... */}
                                    <div>
                                        <p className="text-sm text-gray-500">ID Transaksi</p>
                                        <p className="font-mono text-sm font-medium text-slate-800">{transaction.id}</p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className="font-bold text-xl text-sky-600">
                                            Rp {new Intl.NumberFormat('id-ID').format(transaction.totalAmount || 0)}
                                        </p>
                                        <Badge className={`mt-1 capitalize text-xs ${getStatusClasses(transaction.status)}`}>
                                            {transaction.status || 'unknown'}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Detail Item - AKAN TAMPIL JIKA DATA ADA DARI API */}
                                {transaction.transaction_items && transaction.transaction_items.length > 0 && (
                                    <div className="border-t my-4 pt-4">
                                        <div className="space-y-3">
                                            {transaction.transaction_items.map((item, index) => (
                                                <div key={index} className="flex items-center gap-4">
                                                    <div className="relative w-16 h-16 flex-shrink-0 bg-slate-100 rounded-md">
                                                        <Image
                                                            src={item.imageUrls?.[0] || '/placeholder.jpg'}
                                                            alt={item.title || 'Gambar Aktivitas'}
                                                            fill
                                                            className="object-cover rounded-md"
                                                        />
                                                    </div>
                                                    <div className="flex-grow">
                                                        <p className="font-semibold text-gray-800">{item.title}</p>
                                                        <p className="text-sm text-gray-500">{item.quantity} x
                                                            Rp {new Intl.NumberFormat('id-ID').format(item.price || 0)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Footer Card */}
                                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                    {transaction.payment_method ? (
                                        <div className="flex items-center gap-2">
                                            <div className="relative w-8 h-8">
                                                <Image src={transaction.payment_method.imageUrl} alt={transaction.payment_method.name} fill
                                                       className="object-contain"/>
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{transaction.payment_method.name}</span>
                                        </div>
                                    ) : (
                                        <div className='flex items-center gap-2 text-sm text-gray-500'>
                                            <CreditCard className='h-4 w-4'/>
                                            <span>Metode Pembayaran</span>
                                        </div>
                                    )}
                                    <Link href={`/transactions/${transaction.id}`} className="text-sm font-semibold text-sky-600 hover:underline">
                                        Lihat Detail
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}