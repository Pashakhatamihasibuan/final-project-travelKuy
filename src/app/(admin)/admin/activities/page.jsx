import {getAllActivities, getAllCategories} from "@/lib/server-data";
import ActivitiesClientPage from "./ActivitiesClientPage";

export default async function AdminActivitiesPage() {
    // Ambil data awal di server
    const activities = await getAllActivities();
    const categories = await getAllCategories(); // Pastikan Anda sudah punya fungsi ini di server-data.js

    // Teruskan data ke komponen klien
    return (
        <ActivitiesClientPage
            initialActivities={activities}
            initialCategories={categories}
        />
    );
}