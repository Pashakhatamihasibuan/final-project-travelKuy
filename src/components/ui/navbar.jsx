// src/components/ui/navbar.jsx

import Link from "next/link";
import {cookies} from "next/headers";
import {LogOut, Plane, User} from "lucide-react"; // Ditambahkan User dan LogOut
import {Button} from "@/components/ui/button";
import {logout} from "@/features/authentication/actions";
import SearchModal from "@/features/search/components/SearchModal";
import {getAllActivities} from "@/lib/data";
import NavigationLinks from "@/components/ui/NavigationLinks";
import MobileMenu from "./MobileMenu";
import CartIcon from "./CartIcon";
// Impor baru untuk Popover dan Avatar
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";

export default async function Navbar() {
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    const userCookie = cookieStore.get("user")?.value;

    let user = null;
    if (userCookie) {
        try {
            user = JSON.parse(userCookie);
        } catch (e) {
            console.error("Failed to parse user cookie:", e);
        }
    }

    const isLoggedIn = !!token;

    const activitiesData = await getAllActivities();
    const activities = activitiesData?.data || [];

    const navLinks = [
        {href: "/", label: "Home"},
        {href: "/categories", label: "Categories"},
        {href: "/activities", label: "Activities"},
        {href: "/promos", label: "Promos"},
        {href: "/about", label: "About"},
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <MobileMenu navLinks={navLinks}/>
                    <Link href="/" className="flex items-center gap-2">
                        <Plane className="h-6 w-6 text-blue-600"/>
                        <span className="text-xl font-bold text-gray-800">TravelKuy</span>
                    </Link>
                </div>

                <div className="hidden md:flex">
                    <NavigationLinks navLinks={navLinks}/>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <SearchModal activities={activities}/>
                    <CartIcon isAuthenticated={isLoggedIn}/>
                    <div className="hidden md:block h-6 border-l"></div>

                    {/* BLOK INI DIUBAH MENJADI POPOVER/DROPDOWN */}
                    {isLoggedIn && user ? (
                        <Popover>
                            <PopoverTrigger asChild>
                                <button className="flex items-center gap-3 rounded-full p-1 pr-3 transition-colors hover:bg-gray-100">
                                    <Avatar className="h-8 w-8 border">
                                        <AvatarImage src={user.profilePictureUrl} alt={user.name || 'User'}/>
                                        <AvatarFallback>
                                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden sm:inline text-sm font-medium text-gray-700">
                                        Halo, {user.name || "Pengguna"}
                                    </span>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56" align="end">
                                <div className="flex flex-col gap-1 p-1">
                                    <div className="border-b px-3 py-2">
                                        <p className="font-semibold">{user.name}</p>
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                    </div>
                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-2 rounded-md p-2 text-sm transition-colors hover:bg-accent"
                                    >
                                        <User className="h-4 w-4"/>
                                        <span>Lihat Profil</span>
                                    </Link>
                                    <form action={logout} className="w-full">
                                        <button
                                            type="submit"
                                            className="flex w-full items-center gap-2 rounded-md p-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                                        >
                                            <LogOut className="h-4 w-4"/>
                                            <span>Logout</span>
                                        </button>
                                    </form>
                                </div>
                            </PopoverContent>
                        </Popover>
                    ) : (
                        <div className="hidden sm:flex items-center gap-2">
                            <Link href="/auth/login">
                                <Button variant="outline" size="sm">
                                    Login
                                </Button>
                            </Link>
                            <Link href="/auth/register">
                                <Button size="sm">Register</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}