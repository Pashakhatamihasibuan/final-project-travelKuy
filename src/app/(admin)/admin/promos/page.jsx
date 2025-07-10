import {getAllPromos} from "@/lib/server-data";
import PromosClientPage from "./PromosClientPage";

export default async function AdminPromosPage() {
    const promos = await getAllPromos();

    return (
        <PromosClientPage initialPromos={promos}/>
    );
}