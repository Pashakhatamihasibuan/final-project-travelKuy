// src/features/activities/components/ApplicableCoupons.jsx

'use client';

import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Copy, Tag} from "lucide-react";

const handleCopy = (promoCode) => {
    navigator.clipboard.writeText(promoCode);
    toast.success(`Kode promo "${promoCode}" berhasil disalin!`);
};

export default function ApplicableCoupons({promos}) {
    if (!promos || promos.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
                Kupon Tersedia
            </h3>
            <div className="space-y-3">
                {promos.slice(0, 3).map((promo) => ( // Show first 3 promos
                    <div key={promo.id} className="border border-dashed rounded-lg p-3 flex justify-between items-center bg-green-50/50">
                        <div>
                            <p className="font-bold text-green-700 flex items-center gap-2">
                                <Tag className="h-4 w-4"/>
                                {promo.promo_code}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-1">{promo.title}</p>
                        </div>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="text-gray-500 hover:bg-green-100"
                            onClick={() => handleCopy(promo.promo_code)}
                        >
                            <Copy className="h-4 w-4"/>
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}