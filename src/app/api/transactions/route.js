// src/app/api/transactions/route.js

import {NextResponse} from 'next/server';
import {getMyTransactions} from '@/lib/server-data'; // Kita panggil fungsi server yang sudah ada

export async function GET() {
    try {
        // Fungsi getMyTransactions sudah aman karena menggunakan cookies di sisi server
        const transactions = await getMyTransactions();
        return NextResponse.json(transactions);
    } catch (error) {
        console.error('API Route Error fetching transactions:', error);
        return NextResponse.json({message: 'Failed to fetch transactions'}, {status: 500});
    }
}