import { type NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import dbConnect from '@/lib/database'
import Transfer from '@/models/Transfer'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    await dbConnect()
    const transactions = await Transfer.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    const total = await Transfer.countDocuments()

    return NextResponse.json({ 
      transactions: transactions.map((t: any) => ({
        ...t,
        _id: t._id.toString(),
        recipient: t.accountHolder || t.bankHolder,
        userName: t.senderName || "System Provision"
      })), 
      total 
    })
  } catch (error) {
    console.error('Admin transactions history error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
