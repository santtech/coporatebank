"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  MoreHorizontal, 
  Edit, 
  DollarSign, 
  CheckCircle, 
  Trash2, 
  Zap, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldAlert, 
  RefreshCw 
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface UserActionsProps {
  userId: string
}

export default function UserActions({ userId }: UserActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [txOpen, setTxOpen] = useState(false)
  const [txType, setTxType] = useState<"credit" | "debit">("credit")
  const [txAmount, setTxAmount] = useState<string>("")
  const [txCurrency, setTxCurrency] = useState<string>("USD")
  const [txDesc, setTxDesc] = useState<string>("")
  const [txSuccess, setTxSuccess] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const openTxModal = async (type: "credit" | "debit") => {
    setTxType(type)
    setTxAmount("")
    setTxDesc("")
    try {
      const res = await fetch(`/api/admin/users/${userId}`)
      if (res.ok) {
        const data = await res.json()
        const assigned = data?.user?.bankInfo?.system?.currency
        setTxCurrency(assigned || "USD")
      } else {
        setTxCurrency("USD")
      }
    } catch {
      setTxCurrency("USD")
    }
    setTxOpen(true)
  }

  const submitTransaction = async () => {
    if (!txAmount || Number.isNaN(Number(txAmount)) || Number(txAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than zero.",
        variant: "destructive",
      })
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          type: txType,
          amount: Number(txAmount),
          currency: txCurrency,
          description: txDesc || `System ${txType === 'credit' ? 'Credit' : 'Debit'}`,
        }),
      })
      if (res.ok) {
        setTxSuccess(true)
        toast({
          title: "Transaction Successful",
          description: `Successfully ${txType === 'credit' ? 'credited' : 'debited'} ${txAmount} ${txCurrency}.`,
        })
        router.refresh()
        setTimeout(() => {
          setTxOpen(false)
          setTxSuccess(false)
        }, 1500)
      } else {
        const j = await res.json().catch(() => ({}))
        toast({
          title: "Transaction Failed",
          description: j?.message || "Internal server error occurred.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("[CORPORATE BANK] admin tx error:", err)
      toast({
        title: "System Error",
        description: "Could not process transaction at this time.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async (action: string) => {
    setIsLoading(true)
    try {
      switch (action) {
        case "view":
          router.push(`/admin/users/${userId}/edit`)
          break
        case "approve":
          const approveResponse = await fetch("/api/admin/users/approve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
          })
          if (approveResponse.ok) {
            toast({
              title: "Account Verified",
              description: "The customer account has been successfully verified.",
            })
            router.refresh()
          } else {
            toast({
              title: "Verification Failed",
              description: "Could not verify the account.",
              variant: "destructive",
            })
          }
          break
        case "delete":
          if (confirm("Permanently delete this user account? This cannot be reversed.")) {
            const deleteResponse = await fetch(`/api/admin/users/${userId}`, {
              method: "DELETE",
            })
            if (deleteResponse.ok) {
              toast({
                title: "User Deleted",
                description: "The account has been permanently removed.",
              })
              router.refresh()
            } else {
              toast({
                title: "Deletion Failed",
                description: "An error occurred while deleting the account.",
                variant: "destructive",
              })
            }
          }
          break
        case "credit":
          await openTxModal("credit")
          break
        case "debit":
          await openTxModal("debit")
          break
      }
    } catch (error) {
      console.error("Action error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-end gap-1.5 md:gap-2">
        {/* Edit Customer */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleAction("view")}
          className="h-9 w-9 rounded-xl border-slate-200 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-all shadow-sm"
          title="Edit Customer"
        >
          <Edit className="h-4 w-4" />
        </Button>

        {/* Add Funds (Credit) */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleAction("credit")}
          className="h-9 w-9 rounded-xl border-slate-200 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm"
          title="Add Funds"
        >
          <ArrowUpRight className="h-4 w-4" />
        </Button>

        {/* Deduct Funds (Debit) */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleAction("debit")}
          className="h-9 w-9 rounded-xl border-slate-200 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
          title="Deduct Funds"
        >
          <ArrowDownLeft className="h-4 w-4" />
        </Button>

        {/* Delete Account (Dangerous) */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleAction("delete")}
          className="h-9 w-9 rounded-xl border-slate-200 hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-all shadow-sm"
          title="Delete Account"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        {/* More Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-xl border-slate-200 hover:border-slate-900 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white border border-slate-200 rounded-2xl p-2 shadow-xl z-[101]">
            <DropdownMenuItem
              onClick={() => handleAction("approve")}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer group"
            >
              <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-all flex-shrink-0">
                <CheckCircle className="h-3.5 w-3.5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-black uppercase tracking-widest">Verify Account</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Mark as safe</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={txOpen} onOpenChange={setTxOpen}>
        <DialogContent className="sm:max-w-md bg-white border-slate-200 text-slate-900 rounded-2xl overflow-hidden p-0 shadow-xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-orange-600/10 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="p-8 space-y-6">
            <DialogHeader>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 text-xs font-black uppercase tracking-widest mb-4">
                <Zap className="w-3.5 h-3.5 text-orange-500" /> Admin Transaction
              </div>
              <DialogTitle className="text-2xl font-black tracking-tighter flex items-center gap-3 text-slate-900">
                {txType === "credit" ? (
                  <>
                    <ArrowUpRight className="w-7 h-7 text-emerald-600" />
                    Add <span className="text-emerald-600">Funds</span>
                  </>
                ) : (
                  <>
                    <ArrowDownLeft className="w-7 h-7 text-blue-600" />
                    Deduct <span className="text-blue-600">Funds</span>
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-medium text-sm mt-2 text-left">
                {txType === "credit"
                  ? "Manually add funds to this customer's account."
                  : "Manually deduct funds from this customer's account."}
              </DialogDescription>
            </DialogHeader>

            {txSuccess ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Transaction Successful</h3>
                  <p className="text-slate-500 font-medium text-sm mt-1">Account balance has been updated.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-left block">Amount</Label>
                  <div className="relative group">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={txAmount}
                      onChange={(e) => setTxAmount(e.target.value)}
                      placeholder="0.00"
                      className="bg-slate-900 border-white/5 rounded-2xl h-16 text-3xl font-black text-white focus:border-orange-500 focus:ring-orange-500/10 transition-all pl-12 shadow-inner group-hover:bg-slate-900 group-hover:border-white/10"
                    />
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-700 group-focus-within:text-orange-600 transition-colors" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-left block">Currency</Label>
                  <Select value={txCurrency} onValueChange={setTxCurrency}>
                    <SelectTrigger className="bg-slate-900 border-white/5 rounded-2xl h-14 text-white font-black uppercase text-[10px] tracking-widest focus:ring-orange-500/10">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-950 border-white/10 text-white backdrop-blur-xl rounded-2xl">
                      {["USD", "EUR", "GBP", "JPY", "INR", "CHF", "CAD", "AUD", "SGD"].map(c => (
                        <SelectItem key={c} value={c} className="font-black py-3 hover:bg-orange-600 hover:text-white transition-colors">{c} — BANKING</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-left block">Transaction Description</Label>
                  <Input
                    value={txDesc}
                    onChange={(e) => setTxDesc(e.target.value)}
                    placeholder={`System ${txType === 'credit' ? 'Credit' : 'Debit'} Transaction`}
                    className="bg-slate-900 border-white/5 rounded-2xl h-14 text-white font-bold italic placeholder:text-slate-800 focus:border-orange-500 shadow-inner"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setTxOpen(false)} className="flex-1 h-11 rounded-xl border-slate-200 text-slate-500 hover:text-slate-900 font-black uppercase tracking-widest text-xs transition-all">
                    Cancel
                  </Button>
                  <Button
                    onClick={submitTransaction}
                    disabled={isLoading}
                    className={cn(
                      "flex-1 h-11 rounded-xl font-black uppercase tracking-widest text-xs transition-all border-none",
                      txType === 'credit'
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    )}
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      txType === 'credit' ? 'Add Funds' : 'Deduct Funds'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {!txSuccess && (
            <div className="bg-orange-50 p-4 flex items-start gap-3 border-t border-orange-100">
              <div className="h-8 w-8 min-w-[32px] rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-500 leading-relaxed mt-0.5 text-left">
                <span className="text-orange-600 font-black">Admin Warning:</span> This will directly modify the account balance, bypassing standard verification.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
