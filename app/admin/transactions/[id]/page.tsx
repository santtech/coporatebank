import { notFound } from "next/navigation"
import dbConnect from "@/lib/database"
import Transfer from "@/models/Transfer"
import AdminReceiptClient from "./AdminReceiptClient"

export default async function AdminTransactionDetailsPage({ params }: { params: { id: string } }) {
    await dbConnect()
    let transfer
    try {
        transfer = await Transfer.findById(params.id).lean()
        if (!transfer) return notFound()
    } catch (error) {
        return notFound()
    }

    // Convert MongoDB document to plain JSON object so it can be passed to Client Component
    const transferData = JSON.parse(JSON.stringify(transfer))
    
    return <AdminReceiptClient transfer={transferData} />
}
