"use client";

import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {Input} from './input';

export default function Search({placeholder}) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const {replace} = useRouter();

    // Fungsi ini akan dijalankan setiap kali pengguna mengetik
    const handleSearch = (term) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', '1'); // Selalu reset ke halaman 1 saat ada pencarian baru
        if (term) {
            params.set('query', term);
        } else {
            params.delete('query');
        }
        // Ganti URL tanpa me-reload halaman penuh
        replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="relative flex flex-1 flex-shrink-0">
            <label htmlFor="search" className="sr-only">Search</label>
            <Input
                id="search"
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                placeholder={placeholder}
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={searchParams.get('query')?.toString()}
            />
        </div>
    );
}