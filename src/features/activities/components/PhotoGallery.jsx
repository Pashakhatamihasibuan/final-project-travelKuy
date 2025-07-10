'use client';

import Image from 'next/image';

export default function PhotoGallery({images, title}) {
    if (!images || images.length === 0) {
        return (
            <div className="relative h-[60vh] md:h-[70vh] overflow-hidden bg-slate-200">
                {/* Placeholder jika tidak ada gambar */}
            </div>
        );
    }
    return (
        <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
            <Image
                width={300}
                height={300}
                src={images[0]}
                alt={title}
                className="w-full h-full object-cover"
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/1920x1080/e2e8f0/4a5568?text=Image+Not+Available';
                }}
            />
        </div>
    );
}