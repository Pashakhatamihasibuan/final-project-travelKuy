// src/features/activities/components/PaymentMethods.jsx

import Image from "next/image";

export default function PaymentMethods({methods}) {
    if (!methods || methods.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
                Metode Pembayaran
            </h3>
            <div className="grid grid-cols-4 gap-4 items-center">
                {methods.map((method) => (
                    <div key={method.id} className="flex justify-center p-2 bg-gray-50 rounded-lg">
                        <Image
                            src={method.imageUrl}
                            alt={method.name}
                            width={64}
                            height={40}
                            className="object-contain h-10"
                            title={method.name}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}