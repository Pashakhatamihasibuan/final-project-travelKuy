"use client";

import Link from "next/link";
import {Button} from "@/components/ui/button";

export default function PaginationControls({currentPage, totalPages}) {
    const page = Number(currentPage);

    return (
        <div className="flex items-center justify-between mt-6">
            <div>
                <p className="text-sm text-gray-700">
                    Page <span className="font-medium">{page}</span> of{" "}
                    <span className="font-medium">{totalPages}</span>
                </p>
            </div>
            <div className="flex items-center space-x-2">
                <Link href={`/admin/users?page=${page - 1}`} passHref>
                    <Button variant="outline" size="sm" disabled={page <= 1}>
                        Previous
                    </Button>
                </Link>
                <Link href={`/admin/users?page=${page + 1}`} passHref>
                    <Button variant="outline" size="sm" disabled={page >= totalPages}>
                        Next
                    </Button>
                </Link>
            </div>
        </div>
    );
}