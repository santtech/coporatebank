import { type NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import dbConnect from '@/lib/database'
import User from '@/models/User'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const users = await User.find({}, 'email username bankInfo bankAccount bankBalance roles registerTime')
      .sort({ registerTime: -1 })
      .lean()

    // Map to a format that includes balance easily for the dashboard reduce
    const mappedUsers = users.map((u: any) => {
      // Handle the Map which might be returned as an object from .lean()
      const balanceMap = u.bankBalance || {}
      const usdBalance = balanceMap instanceof Map ? (balanceMap.get('USD') || 0) : (balanceMap['USD'] || 0)
      
      return {
        ...u,
        _id: u._id.toString(),
        bankAccount: {
          ...u.bankAccount,
          balance: usdBalance
        }
      }
    })

    return NextResponse.json({ users: mappedUsers })
  } catch (error) {
    console.error('Admin users list error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
