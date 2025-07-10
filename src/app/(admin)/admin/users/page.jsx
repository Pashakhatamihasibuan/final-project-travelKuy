import {getAllUsers} from "@/lib/server-data";
import UsersTable from "./UsersTable";
import PaginationControls from "./PaginationControls";

// Ubah fungsi untuk menerima searchParams
export default async function AdminUsersPage({searchParams}) {
    // 1. Ambil semua pengguna
    const allUsers = await getAllUsers();

    // 2. Tentukan parameter paginasi
    const page = searchParams['page'] ?? '1';
    const currentPage = Number(page);
    const usersPerPage = 10;
    const totalPages = Math.ceil(allUsers.length / usersPerPage);

    // 3. Potong array pengguna sesuai halaman saat ini
    const startIndex = (page - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const paginatedUsers = allUsers.slice(startIndex, endIndex);

    console.log(`Menampilkan halaman ${page} dari ${totalPages}. Total pengguna: ${allUsers.length}`);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Users</h1>
            </div>

            {/* Kirim hanya data yang sudah dipaginasi ke tabel */}
            <UsersTable users={paginatedUsers}/>

            {/* Tampilkan kontrol paginasi jika ada lebih dari 1 halaman */}
            {totalPages > 1 && (
                <PaginationControls currentPage={page} totalPages={totalPages}/>
            )}
        </div>
    );
}