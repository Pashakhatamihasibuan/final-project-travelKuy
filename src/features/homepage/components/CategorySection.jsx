"use client";

import Link from "next/link";
import {Card} from "@/components/ui/card";
import Image from 'next/image';
import {useEffect, useRef, useState} from 'react';
import {ChevronLeft, ChevronRight} from 'lucide-react';

export default function CategorySection({categories = []}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerView, setItemsPerView] = useState(6); // Default untuk SSR
    const [mounted, setMounted] = useState(false);
    const containerRef = useRef(null);

    if (!categories.length) return null;

    // Handle responsive items per view
    useEffect(() => {
        setMounted(true);

        const updateItemsPerView = () => {
            if (window.innerWidth >= 1024) setItemsPerView(6); // lg
            else if (window.innerWidth >= 768) setItemsPerView(4); // md
            else if (window.innerWidth >= 640) setItemsPerView(3); // sm
            else setItemsPerView(2); // default
        };

        updateItemsPerView();
        window.addEventListener('resize', updateItemsPerView);

        return () => window.removeEventListener('resize', updateItemsPerView);
    }, []);

    const maxIndex = Math.max(0, categories.length - itemsPerView);

    // Reset currentIndex jika melebihi maxIndex setelah resize
    useEffect(() => {
        if (currentIndex > maxIndex) {
            setCurrentIndex(maxIndex);
        }
    }, [maxIndex, currentIndex]);

    const slideLeft = () => {
        setCurrentIndex(prev => Math.max(0, prev - 1));
    };

    const slideRight = () => {
        setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
    };

    const canSlideLeft = currentIndex > 0;
    const canSlideRight = currentIndex < maxIndex;

    // Gunakan CSS classes untuk responsive design sebagai fallback
    if (!mounted) {
        return (
            <div className="relative">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {categories.slice(0, 12).map((category) => (
                        <Link
                            href={`/categories/${category.id}`}
                            key={category.id}
                            className="group"
                        >
                            <Card
                                className="overflow-hidden transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm">
                                <div className="aspect-square w-full overflow-hidden relative">
                                    <Image
                                        src={category.imageUrl || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop&crop=center"}
                                        alt={category.name}
                                        width={300}
                                        height={300}
                                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src =
                                                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop&crop=center";
                                        }}
                                    />
                                    <div
                                        className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                                <div className="p-4 text-center bg-gradient-to-r from-blue-50 to-teal-50">
                                    <h3 className="font-bold text-slate-700 truncate group-hover:text-blue-600 transition-colors">
                                        {category.name}
                                    </h3>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Slider Container */}
            <div className="overflow-hidden" ref={containerRef}>
                <div
                    className="flex transition-transform duration-500 ease-in-out gap-6"
                    style={{
                        transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`
                    }}
                >
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className="flex-shrink-0"
                            style={{
                                width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * 1.5 / itemsPerView}rem)`
                            }}
                        >
                            <Link
                                href={`/categories/${category.id}`}
                                className="group block"
                            >
                                <Card
                                    className="overflow-hidden transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm">
                                    <div className="aspect-square w-full overflow-hidden relative">
                                        <Image
                                            src={category.imageUrl || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop&crop=center"}
                                            alt={category.name}
                                            width={300}
                                            height={300}
                                            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src =
                                                    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop&crop=center";
                                            }}
                                        />
                                        <div
                                            className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    </div>
                                    <div className="p-4 text-center bg-gradient-to-r from-blue-50 to-teal-50">
                                        <h3 className="font-bold text-slate-700 truncate group-hover:text-blue-600 transition-colors">
                                            {category.name}
                                        </h3>
                                    </div>
                                </Card>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Arrows - positioned at bottom right */}
            {(canSlideLeft || canSlideRight) && (
                <div className="flex gap-2 justify-end mt-4">
                    <button
                        onClick={slideLeft}
                        disabled={!canSlideLeft}
                        className={`p-2 rounded-full transition-all duration-300 ${
                            canSlideLeft
                                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                        aria-label="Slide left"
                    >
                        <ChevronLeft size={20}/>
                    </button>
                    <button
                        onClick={slideRight}
                        disabled={!canSlideRight}
                        className={`p-2 rounded-full transition-all duration-300 ${
                            canSlideRight
                                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                        aria-label="Slide right"
                    >
                        <ChevronRight size={20}/>
                    </button>
                </div>
            )}

            {/* Optional: Dots indicator */}
            {maxIndex > 0 && (
                <div className="flex justify-center gap-2 mt-4">
                    {Array.from({length: maxIndex + 1}).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                currentIndex === index
                                    ? 'bg-blue-500 w-6'
                                    : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}