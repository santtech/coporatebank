"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpRight, ArrowDownLeft, Search, Filter, ChevronLeft, ChevronRight, Download, Activity, User as UserIcon, Calendar, Hash, FileText, CheckCircle2, Clock, XCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { formatCurrency } from "@/lib/utils/banking"
import { Badge } from "@/components/ui/badge"
import UserActions from "@/components/admin/user-actions"
import { cn } from "@/lib/utils"

interface Transaction {
  _id: string
  txRef: string
  txType: "debit" | "credit"
  amount: number
  currency: string
  createdAt: Date
  status: string
  recipient?: string
  bankName?: string
  branchName?: string
  bankAccount?: string
  accountType?: string
  routingCode?: string
  identifierCode?: string
  chargesType?: string
  description?: string
  userId?: string
  userEmail?: string
  userName?: string
  txRegion?: string
  txCharge?: number
  senderName?: string
}

interface UserSummary {
  id: string
  name: string
  email: string
}

interface TransactionsListProps {
  initialTransactions: Transaction[]
  total: number
  currentPage: number
  totalPages: number
  currentFilters: {
    status: string
    type: string
    search: string
    user?: string
  }
  users?: UserSummary[]
  isAdmin?: boolean
}

export default function TransactionsList({
  initialTransactions,
  total,
  currentPage,
  totalPages,
  currentFilters,
  users = [],
  isAdmin = false
}: TransactionsListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [filters, setFilters] = useState(currentFilters)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    setTransactions(initialTransactions)
  }, [initialTransactions])

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    updateURL(newFilters, 1)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateURL(filters, 1)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      updateURL(filters, newPage)
    }
  }

  const updateURL = (newFilters: any, page: number) => {
    const params = new URLSearchParams(searchParams.toString())

    if (newFilters.status !== "all") params.set("status", newFilters.status)
    else params.delete("status")

    if (newFilters.type !== "all") params.set("type", newFilters.type)
    else params.delete("type")

    if (newFilters.search) params.set("search", newFilters.search)
    else params.delete("search")

    if (isAdmin && newFilters.user && newFilters.user !== "all") {
      params.set("user", newFilters.user)
    } else if (isAdmin) {
      params.delete("user")
    }

    if (page > 1) params.set("page", page.toString())
    else params.delete("page")

    const path = isAdmin ? "/admin/transactions" : "/dashboard/transactions"
    router.push(`${path}?${params.toString()}`)
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, any> = {
      success: { color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-100", label: "COMPLETED", icon: CheckCircle2 },
      pending: { color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", label: "PENDING", icon: Clock },
      failed: { color: "text-red-500", bg: "bg-red-50", border: "border-red-100", label: "FAILED", icon: XCircle },
      cancelled: { color: "text-slate-500", bg: "bg-slate-100", border: "border-slate-200", label: "CANCELLED", icon: AlertTriangle },
    }
    const st = statusMap[status] || statusMap.pending

    return (
      <Badge className={cn("px-2 py-0.5 text-[9px] font-black uppercase tracking-widest shadow-sm border flex items-center gap-1", st.bg, st.color, st.border)}>
        <st.icon className="w-3 h-3" />
        {st.label}
      </Badge>
    )
  }

  const handleDownload = async (e: React.MouseEvent, transaction: Transaction) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const { jsPDF } = await import("jspdf")

      const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" })
      const margin = 20
      const pageWidth = 210
      const pageHeight = 297
      const usableWidth = pageWidth - margin * 2
      let y = 20

      const colors = {
        primary: [0, 28, 16], // Dark Emerald
        secondary: [99, 102, 241], // Emerald
        success: [99, 102, 241],
        text: [15, 23, 42],
        textMuted: [71, 85, 105],
        textLight: [148, 163, 184],
        border: [226, 232, 240],
        accent: [248, 250, 252],
      } as const

      // === HEADER / LOGO ===
      doc.setFillColor(...colors.primary)
      doc.rect(0, 0, pageWidth, 45, "F")

      doc.setFont("helvetica", "bold")
      doc.setFontSize(24)
      doc.setTextColor(255, 255, 255)
      doc.text("CORPORATE", margin, 25)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(255, 255, 255)
      doc.text("BANK", margin + 60, 25)

      doc.setFontSize(10)
      doc.setTextColor(99, 102, 241)
      doc.setFont("helvetica", "bold")
      doc.text("ELECTRONIC RECEIPT", margin, 32)

      doc.setFontSize(9)
      doc.setTextColor(148, 163, 184)
      doc.setFont("helvetica", "normal")
      doc.text("Official Banking Record", pageWidth - margin, 25, { align: "right" })
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("Transaction Advice", pageWidth - margin, 32, { align: "right" })

      y = 60

      // === STATUS BANNER ===
      doc.setFillColor(...colors.accent)
      doc.roundedRect(margin, y, usableWidth, 20, 2, 2, "F")

      doc.setFontSize(9)
      doc.setTextColor(...colors.textMuted)
      doc.setFont("helvetica", "bold")
      doc.text("TRANSFER STATUS:", margin + 8, y + 12)

      let statusText = transaction.status.toUpperCase()
      if (transaction.status === "success") {
        doc.setTextColor(...colors.success)
        statusText = "COMPLETED & VERIFIED"
      } else if (transaction.status === "failed" || transaction.status === "cancelled") {
        doc.setTextColor(239, 68, 68) // Red
      } else {
        doc.setTextColor(234, 179, 8) // Yellow
      }

      doc.setFontSize(11)
      doc.text(statusText, margin + 55, y + 12)

      doc.setFontSize(9)
      doc.setTextColor(...colors.textMuted)
      doc.setFont("helvetica", "normal")
      doc.text(`Ref: ${transaction.txRef}`, pageWidth - margin - 8, y + 12, { align: "right" })

      y += 35

      // === AMOUNT SECTION ===
      doc.setFontSize(10)
      doc.setTextColor(...colors.textMuted)
      doc.text("Transfer Amount", margin, y)
      y += 8

      doc.setFontSize(32)
      doc.setTextColor(...colors.text)
      doc.setFont("helvetica", "bold")
      doc.text(formatCurrency(transaction.amount, transaction.currency), margin, y + 10)

      doc.setFontSize(10)
      doc.setTextColor(...colors.textMuted)
      doc.setFont("helvetica", "normal")
      doc.text(`Date & Time: ${new Date(transaction.createdAt).toLocaleString()}`, pageWidth - margin, y + 8, { align: "right" })

      y += 25

      // === DETAILS TABLE ===
      doc.setDrawColor(...colors.border)
      doc.setLineWidth(0.2)
      doc.line(margin, y, pageWidth - margin, y)
      y += 12

      const addRow = (label: string, value: string, currentY: number) => {
        doc.setFontSize(9)
        doc.setTextColor(...colors.textMuted)
        doc.setFont("helvetica", "normal")
        doc.text(label, margin, currentY)

        doc.setTextColor(...colors.text)
        doc.setFont("helvetica", "bold")
        doc.text(value, pageWidth - margin, currentY, { align: "right" })

        doc.setDrawColor(...colors.border)
        doc.line(margin, currentY + 4, pageWidth - margin, currentY + 4)
        return currentY + 12
      }

      doc.setFontSize(12)
      doc.setTextColor(...colors.primary)
      doc.setFont("helvetica", "bold")
      doc.text("Transaction Details", margin, y)
      y += 10

      y = addRow("Reference ID", transaction.txRef, y)
      y = addRow("Sending Account Name", transaction.senderName || transaction.userName || "Unknown", y)
      y = addRow("Receiving Account Name", transaction.recipient || "Unknown", y)
      if (transaction.bankName) y = addRow("Target Bank", transaction.bankName, y)
      if (transaction.bankAccount) y = addRow("Account Number", transaction.bankAccount, y)
      y = addRow("Transfer Region", transaction.txRegion || "International", y)

      y += 10
      doc.setFontSize(12)
      doc.setTextColor(...colors.primary)
      doc.setFont("helvetica", "bold")
      doc.text("Financial Breakdown", margin, y)
      y += 10

      y = addRow("Transfer Amount", formatCurrency(transaction.amount, transaction.currency), y)
      y = addRow("Service Fee", formatCurrency(transaction.txCharge || 0, transaction.currency), y)

      doc.setFillColor(...colors.primary)
      doc.roundedRect(margin, y - 2, usableWidth, 12, 1, 1, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.text("TOTAL AMOUNT", margin + 5, y + 6)
      doc.text(formatCurrency((transaction.amount || 0) + (transaction.txCharge || 0), transaction.currency), pageWidth - margin - 5, y + 6, { align: "right" })

      y += 25

      // === MEMO ===
      if (transaction.description) {
        doc.setFillColor(...colors.accent)
        doc.roundedRect(margin, y, usableWidth, 20, 2, 2, "F")
        doc.setTextColor(...colors.textMuted)
        doc.setFontSize(8)
        doc.setFont("helvetica", "bold")
        doc.text("DESCRIPTION:", margin + 5, y + 7)
        doc.setTextColor(...colors.text)
        doc.setFontSize(9)
        doc.setFont("helvetica", "italic")
        doc.text(`"${transaction.description}"`, margin + 5, y + 14)
      }

      // === FOOTER ===
      const footerY = pageHeight - 30
      doc.setDrawColor(...colors.border)
      doc.setLineWidth(0.5)
      doc.line(margin, footerY, pageWidth - margin, footerY)

      doc.setFontSize(8)
      doc.setTextColor(...colors.textLight)
      doc.setFont("helvetica", "normal")
      doc.text("Corporate Bank", pageWidth / 2, footerY + 8, { align: "center" })
      doc.text("This document is an official record of a financial transfer. Issued by Corporate Bank.", pageWidth / 2, footerY + 12, { align: "center" })
      doc.text("Corporate Bank © 2026 | Secure • Authorized", pageWidth / 2, footerY + 16, { align: "center" })

      const timestamp = new Date().toISOString().slice(0, 10)
      doc.save(`Corporate_Receipt_${transaction.txRef}_${timestamp}.pdf`)
    } catch (err) {
      console.error("Receipt generation failed:", err)
      alert("Failed to generate receipt PDF.")
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters Hub */}
      <Card className="bg-white border-slate-100 rounded-[2.5rem] p-6 md:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          {isAdmin && (
            <div className="lg:col-span-3 space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-2">Client Identity</label>
              <Select value={filters.user || "all"} onValueChange={(value) => handleFilterChange("user", value)}>
                <SelectTrigger className="bg-slate-50 border-slate-200 rounded-xl h-12 text-slate-900 focus:ring-orange-500/20 capitalize font-bold">
                  <SelectValue placeholder="All Clients" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-100 rounded-xl">
                  <SelectItem value="all" className="font-bold">All Accounts</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id} className="focus:bg-orange-50 focus:text-orange-900 font-bold">
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="lg:col-span-2 space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-2">Status</label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
              <SelectTrigger className="bg-slate-50 border-slate-200 rounded-xl h-12 text-slate-900 focus:ring-orange-500/20 capitalize font-bold">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-100 rounded-xl">
                <SelectItem value="all" className="font-bold">All Statuses</SelectItem>
                <SelectItem value="pending" className="font-bold">Pending</SelectItem>
                <SelectItem value="success" className="font-bold">Completed</SelectItem>
                <SelectItem value="failed" className="font-bold">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="lg:col-span-2 space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-2">Direction</label>
            <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
              <SelectTrigger className="bg-slate-50 border-slate-200 rounded-xl h-12 text-slate-900 focus:ring-orange-500/20 capitalize font-bold">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-100 rounded-xl">
                <SelectItem value="all" className="font-bold">All Transactions</SelectItem>
                <SelectItem value="debit" className="font-bold">Debit (Out)</SelectItem>
                <SelectItem value="credit" className="font-bold">Credit (In)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={`${isAdmin ? "lg:col-span-5" : "lg:col-span-8"} space-y-2`}>
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-2">Search Records</label>
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Ref, name, or details..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-12 bg-slate-50 border-slate-200 rounded-xl h-12 text-slate-900 focus:border-orange-500 focus:bg-white transition-all font-bold placeholder:text-slate-400"
                />
              </div>
              <Button type="submit" className="h-12 px-6 rounded-xl bg-orange-600 text-white font-black hover:bg-orange-700 shadow-md uppercase tracking-widest text-xs border-none">
                Search
              </Button>
            </form>
          </div>
        </div>
      </Card>

      {/* Results List */}
      <div className="space-y-4">
        {transactions.length === 0 ? (
          <div className="py-24 text-center space-y-6 bg-white border border-slate-100 border-dashed rounded-[3rem]">
            <Activity className="w-16 h-16 text-slate-200 mx-auto" />
            <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No transactions match the current filters</p>
            <Button
              variant="link"
              className="text-orange-600 font-bold uppercase tracking-widest text-xs hover:text-orange-700 transition-colors"
              onClick={() => {
                const clearFilters = { status: "all", type: "all", search: "" }
                if (isAdmin) (clearFilters as any).user = "all"
                setFilters(clearFilters as any)
                updateURL(clearFilters, 1)
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction._id}
                className="group relative block bg-white border border-slate-100 rounded-3xl p-6 hover:border-orange-300 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
                onClick={() => router.push(isAdmin ? `/admin/transactions/${transaction._id}` : `/dashboard/receipt/${transaction.txRef}`)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="flex-1 flex flex-col md:flex-row md:items-center gap-5">
                    {/* Icon */}
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all shadow-sm",
                      transaction.txType === "credit"
                        ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                        : "bg-slate-900 border-slate-800 text-white group-hover:bg-orange-600 group-hover:border-orange-500"
                    )}>
                      {transaction.txType === "credit" ? (
                        <ArrowDownLeft className="h-5 w-5" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5" />
                      )}
                    </div>

                    {/* Transaction Details */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="font-black text-slate-900 uppercase tracking-tight text-lg italic group-hover:text-orange-600 transition-colors">
                          {transaction.txType === "credit" ? "Remittance Inflow" : "Transfer Out"}
                        </p>
                        {getStatusBadge(transaction.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1">
                        <span className="text-slate-400 font-mono tracking-widest text-[10px] uppercase font-bold text-ellipsis">REF: {transaction.txRef}</span>
                        {transaction.recipient && (
                          <div className="flex items-center gap-2">
                            <div className="hidden md:block h-1 w-1 rounded-full bg-slate-300" />
                            <span className="text-slate-500 font-black uppercase tracking-widest text-[10px] flex items-center gap-1.5">
                              <UserIcon className="w-3 h-3" />
                              {transaction.bankName ? `${transaction.bankName} • ` : ""}{transaction.recipient}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Value and Actions */}
                  <div className="flex flex-row md:flex-col md:items-end justify-between items-center gap-2 md:pl-6 md:border-l border-slate-100">
                    <div className="flex flex-col md:items-end">
                      <p className={cn(
                        "text-xl md:text-2xl font-black tracking-tighter italic",
                        transaction.txType === "credit" ? "text-emerald-500" : "text-slate-900"
                      )}>
                        {transaction.txType === "credit" ? "+" : "-"}{formatCurrency(transaction.amount, transaction.currency)}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3" onClick={e => e.stopPropagation()}>
                       <Button 
                         variant="outline" 
                         size="sm" 
                         className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest border-slate-200 text-slate-600 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition-all font-mono"
                         onClick={(e) => handleDownload(e, transaction)}
                       >
                         <Download className="w-3 h-3 mr-1.5" /> PDF Receipt
                       </Button>
                       {isAdmin && transaction.userId && (
                          <div className="ml-2 pl-3 border-l border-slate-100">
                             <UserActions userId={transaction.userId} />
                          </div>
                       )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col md:flex-row items-center justify-between mt-8 p-6 md:p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 md:mb-0">
              Showing <span className="text-slate-900">{(currentPage - 1) * 10 + 1}</span> to <span className="text-slate-900">{Math.min(currentPage * 10, total)}</span> of <span className="text-slate-900">{total}</span>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-10 px-4 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-black uppercase tracking-widest text-[10px] disabled:opacity-50 transition-all"
              >
                <ChevronLeft className="h-4 w-4 md:mr-2" /> <span className="hidden md:inline">Prev</span>
              </Button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) pageNum = i + 1
                  else if (currentPage <= 3) pageNum = i + 1
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
                  else pageNum = currentPage - 2 + i

                  return (
                    <Button
                      key={pageNum}
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className={cn(
                        "w-10 h-10 rounded-xl font-black text-[10px] transition-all",
                        currentPage === pageNum
                          ? "bg-slate-900 text-white border-none shadow-md"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-10 px-4 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-black uppercase tracking-widest text-[10px] disabled:opacity-50 transition-all"
              >
                <span className="hidden md:inline">Next</span> <ChevronRight className="h-4 w-4 md:ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
