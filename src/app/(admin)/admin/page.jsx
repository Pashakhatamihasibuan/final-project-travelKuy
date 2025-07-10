import {getAllActivities, getAllTransactions, getAllUsers} from "@/lib/server-data";
import {Landmark, Ticket, Users} from "lucide-react";

function StatCard({title, value, icon: Icon}) {
    return (
        <div className="p-6 bg-white rounded-lg shadow-md flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
                <Icon className="w-6 h-6 text-blue-600"/>
            </div>
            <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </div>
    );
}

export default async function AdminDashboardPage() {
    // Fetch data di server
    const users = await getAllUsers();
    const transactions = await getAllTransactions();
    const activities = await getAllActivities();

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Users" value={users.length} icon={Users}/>
                <StatCard title="Total Activities" value={activities.length} icon={Ticket}/>
                <StatCard title="Total Transactions" value={transactions.length} icon={Landmark}/>
            </div>

            {/* Di sini Anda bisa menambahkan komponen lain seperti chart atau tabel ringkasan */}
        </div>
    );
}