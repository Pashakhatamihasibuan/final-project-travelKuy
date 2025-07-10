"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {Landmark, LayoutDashboard, LogOut, Percent, Ticket, Users,} from "lucide-react";
import {logout} from "@/features/authentication/actions";

const adminNavLinks = [
    {href: "/admin", label: "Dashboard", icon: LayoutDashboard},
    {href: "/admin/users", label: "Users", icon: Users},
    {href: "/admin/activities", label: "Activities", icon: Ticket},
    {href: "/admin/promos", label: "Promos", icon: Percent},
    {href: "/admin/transactions", label: "Transactions", icon: Landmark},
];

function NavLink({href, label, icon: Icon}) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={`flex items-center p-3 rounded-lg transition-colors ${
                isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
        >
            <Icon className="w-5 h-5 mr-3"/>
            {label}
        </Link>
    );
}

export default function AdminSidebar() {
    return (
        <aside className="w-64 bg-white border-r flex flex-col">
            <div className="p-6">
                <h2 className="text-2xl font-bold text-blue-600">TravelKuy Admin</h2>
            </div>
            <nav className="flex-1 px-4 py-2">
                {adminNavLinks.map((link) => (
                    <NavLink key={link.href} {...link} />
                ))}
            </nav>
            <div className="p-4 border-t">
                <form action={logout}>
                    <button
                        type="submit"
                        className="flex items-center w-full p-3 text-red-500 rounded-lg hover:bg-red-50"
                    >
                        <LogOut className="w-5 h-5 mr-3"/>
                        Logout
                    </button>
                </form>
            </div>
        </aside>
    );
}