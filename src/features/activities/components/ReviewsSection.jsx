// src/features/activities/components/ReviewsSection.jsx

import {Star, StarHalf} from 'lucide-react';
import Image from 'next/image';

// Mock data for reviewers
const mockReviews = [
    {
        name: 'Rina Wulandari',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop',
        rating: 5,
        comment: 'Pengalaman yang sangat luar biasa! Pemandu wisatanya ramah dan sangat informatif. Sangat direkomendasikan untuk keluarga.'
    },
    {
        name: 'Budi Santoso',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop',
        rating: 4,
        comment: 'Aktivitasnya seru dan menantang. Sedikit catatan untuk perbaikan fasilitas toilet. Selebihnya, semuanya hebat!'
    },
    {
        name: 'Citra Amelia',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop',
        rating: 5,
        comment: 'Sempurna! Dari awal hingga akhir, semuanya terorganisir dengan baik. Pemandangannya tak terlupakan. Pasti akan kembali lagi.'
    }
];

// Helper to render stars
const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars.push(<Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400"/>);
        } else if (i - 0.5 <= rating) {
            stars.push(<StarHalf key={i} className="w-5 h-5 text-amber-400 fill-amber-400"/>);
        } else {
            stars.push(<Star key={i} className="w-5 h-5 text-gray-300"/>);
        }
    }
    return stars;
};


export default function ReviewsSection({rating, totalReviews}) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ulasan Pelanggan</h2>

            {/* Summary */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-5xl font-bold text-gray-800">{rating.toFixed(1)}</div>
                <div>
                    <div className="flex">{renderStars(rating)}</div>
                    <p className="text-sm text-gray-500 mt-1">Berdasarkan {totalReviews} ulasan</p>
                </div>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-6">
                {mockReviews.map((review, index) => (
                    <div key={index} className="flex gap-4 border-t pt-6 first:border-t-0 first:pt-0">
                        <Image
                            src={review.avatar}
                            alt={review.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-gray-800">{review.name}</h4>
                                <div className="flex">{renderStars(review.rating)}</div>
                            </div>
                            <p className="text-gray-600 mt-2">{review.comment}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}