import {cookies} from 'next/headers';
import {getProfile} from '@/lib/data';
import ProfileClient from './ProfileClient';

export const metadata = {
    title: 'User Profile',
};

export default async function ProfilePage() {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return <div className="text-center py-10">Kamu harus login untuk melihat profil.</div>;
    }

    const user = await getProfile(token);

    return (
        <ProfileClient user={user}/>
    );
}