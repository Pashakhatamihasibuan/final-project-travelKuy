import {notFound} from "next/navigation";
import {cookies} from "next/headers";
import {getActivityDetails} from "@/lib/data";
import {Heart, MapPin, Share2, Star} from "lucide-react";
import AddToCartForm from "@/features/activities/components/AddToCartForm";
import PhotoGallery from "@/features/activities/components/PhotoGallery";

const getMapSrc = (iframeString) => {
    if (!iframeString) return null;
    const match = iframeString.match(/src='([^']+)'/);
    return match ? match[1] : null;
};

export default async function ActivityDetailPage({params}) {
    const activityData = await getActivityDetails(params.id);

    if (!activityData || !activityData.data) {
        notFound();
    }

    // Check authentication status
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const isAuthenticated = !!token;

    const activity = activityData.data;
    const mapSrc = getMapSrc(activity.location_maps);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
            <div className="relative">
                <PhotoGallery images={activity.imageUrls} title={activity.title}/>
                <div className="absolute top-4 right-4 flex gap-2">
                    <button
                        className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                        <Heart className="w-5 h-5 text-gray-600"/>
                    </button>
                    <button
                        className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
                        <Share2 className="w-5 h-5 text-gray-600"/>
                    </button>
                </div>
            </div>
            <div className="container mx-auto px-4 md:px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                                {activity.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                                <div className="flex items-center gap-1">
                                    <Star className="h-5 w-5 text-amber-400 fill-amber-400"/>
                                    <span className="font-semibold text-gray-800">{activity.rating}</span>
                                    <span className="text-sm">({activity.total_reviews} reviews)</span>
                                </div>
                                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4 text-blue-500"/>
                                    <span className="text-sm">{activity.city}, {activity.province}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Experience</h2>
                            <p className="text-gray-600 leading-relaxed text-lg">{activity.description}</p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">What's Included</h2>
                            <div className="text-gray-600 prose prose-lg max-w-none" dangerouslySetInnerHTML={{__html: activity.facilities}}/>
                        </div>
                        {mapSrc && (
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Location</h2>
                                <iframe src={mapSrc} className="w-full h-80 rounded-xl border-0" allowFullScreen="" loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"></iframe>
                            </div>
                        )}
                    </div>
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                                <div className="mb-6">
                                    <div className="flex items-end gap-2 mb-2">
                                        <span
                                            className="text-3xl font-bold text-gray-900">Rp {new Intl.NumberFormat("id-ID").format(activity.price_discount)}</span>
                                        <span className="text-lg text-gray-500 line-through">Rp {new Intl.NumberFormat("id-ID").format(activity.price)}</span>
                                    </div>
                                    <div
                                        className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-sm font-medium rounded-full">
                                        Save {Math.round(((activity.price - activity.price_discount) / activity.price) * 100)}%
                                    </div>
                                </div>
                                <AddToCartForm
                                    activityId={activity.id}
                                    isAuthenticated={isAuthenticated}
                                />
                                <p className="mt-4 text-xs text-center text-slate-500">Free cancellation up to 24 hours before the experience</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}