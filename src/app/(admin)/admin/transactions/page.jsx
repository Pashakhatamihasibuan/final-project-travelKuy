// src/app/(admin)/admin/transactions/page.js
import { getAllTransactions, getAllUsers } from "@/lib/server-data";
import TransactionsClientPage from "./TransactionsClientPage";

export default async function AdminTransactionsPage({ searchParams = {} }) {
  try {
    // ✅ PERBAIKAN: Await searchParams untuk Next.js 15+
    const resolvedSearchParams = await searchParams;

    // 1. Ambil semua data dari server
    const [allTransactions, allUsers] = await Promise.all([getAllTransactions(), getAllUsers()]);

    // 2. Buat "peta" untuk nama pengguna agar efisien
    const userMap = new Map((allUsers || []).map((user) => [user.id, user.name]));

    // 3. Gabungkan dan normalisasi data transaksi
    const transactionsWithUserData = (allTransactions || []).map((trx) => ({
      ...trx,
      userName: userMap.get(trx.userId) || "Unknown User",
      status: trx.status?.toLowerCase() || "pending",
    }));

    // 4. Urutkan data dari yang terbaru
    transactionsWithUserData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // 5. Terapkan filter status jika ada di URL
    const statusFilter = resolvedSearchParams.status;
    const filteredTransactions = statusFilter ? transactionsWithUserData.filter((t) => t.status === statusFilter.toLowerCase()) : transactionsWithUserData;

    // 6. Implementasi paginasi pada data yang sudah difilter
    const page = resolvedSearchParams.page ?? "1";
    const currentPage = Math.max(1, Number(page));
    const transactionsPerPage = 15;
    const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

    const startIndex = (currentPage - 1) * transactionsPerPage;
    const endIndex = startIndex + transactionsPerPage;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    // 7. Teruskan data ke komponen klien
    return <TransactionsClientPage initialTransactions={paginatedTransactions} pagination={{ currentPage, totalPages }} />;
  } catch (error) {
    console.error("Error loading transactions page:", error);
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">Terjadi kesalahan saat memuat data transaksi.</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
}

// ✅ PERBAIKAN: Tambahkan metadata untuk SEO
export const metadata = {
  title: "Admin - All Transactions",
  description: "Manage all transactions in the admin panel",
};
