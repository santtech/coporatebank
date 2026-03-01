"use client"

import { useState } from "react"
import { Eye, EyeOff, Copy, Check, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getVendorColor, maskCardNumber, getVendorLogo } from "@/lib/utils/card"
import type { ICard } from "@/models/Card"
import Image from "next/image"
import { motion } from "framer-motion"

interface CardComponentProps {
  card: ICard
  showDetails?: boolean
}

export default function CardComponent({ card, showDetails = false }: CardComponentProps) {
  const [showCardNumber, setShowCardNumber] = useState(false)
  const [showCVV, setShowCVV] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopyCardNumber = async () => {
    await navigator.clipboard.writeText(card.cardNumber.replace(/\s/g, ""))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active": return { label: "Live Gateway", color: "text-orange-400 bg-orange-500/10 border-orange-500/20 shadow-[0_0_10px_rgba(99,102,241,0.2)]" }
      case "pending": return { label: "Pending Auth", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" }
      case "blocked": return { label: "Circuit Broken", color: "text-red-500 bg-red-500/10 border-red-500/20 animate-pulse" }
      case "rejected": return { label: "Auth Denied", color: "text-red-400 bg-red-500/10 border-red-500/20" }
      default: return { label: status, color: "text-slate-500 bg-white/5" }
    }
  }

  const getVendorStyles = (vendor: string) => {
    switch (vendor.toLowerCase()) {
      case "visacard":
        return {
          background: "linear-gradient(135deg, #1a1f71 0%, #0056b3 100%)",
          pattern: "radial-gradient(circle at 100% 0%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 0% 100%, rgba(255,255,255,0.08) 0%, transparent 50%)",
          logo: (
            <svg viewBox="0 0 100 32" className="w-14 h-8 md:w-16 md:h-10 fill-white drop-shadow-lg">
              <path d="M41.87 2.14l-2.73 17.51h4.42l2.73-17.51h-4.42zm-12.22 0l-5.32 12.39-.56-2.74c-.95-3.21-3.9-6.68-7.3-8.47l.08-.18h7.24c.94 0 1.76.62 1.96 1.54l2.19 11.52 4.38-12.54h4.57L29.65 2.14zM10.85 2.14c-1.42 0-2.6.82-3.17 2.2L0 21.04h4.63l.92-2.55h5.66l.53 2.55h4.09l-3.56-18.9h-1.42zm2.08 6.44l-1.93 5.3h3.87l-1.94-5.3z" />
            </svg>
          )
        }
      case "mastercard":
        return {
          background: "linear-gradient(135deg, #0f0f0f 0%, #2a2a2a 100%)",
          pattern: "repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 15px)",
          logo: (
            <div className="flex -space-x-3 md:-space-x-4">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#eb001b] opacity-90 shadow-2xl" />
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#f79e1b] opacity-90 shadow-2xl" />
            </div>
          )
        }
      case "amex":
        return {
          background: "linear-gradient(135deg, #022c43 0%, #053f5e 100%)",
          pattern: "linear-gradient(rgba(255,255,255,0.08) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(255,255,255,0.08) 1.5px, transparent 1.5px)",
          logo: (
            <div className="bg-[#0070d1] p-1 rounded-sm shadow-2xl border border-white/20">
              <div className="bg-white px-1.5 py-0.5 rounded-[1px]">
                <p className="text-[8px] md:text-[10px] font-black text-[#0070d1] leading-none tracking-tighter uppercase font-sans">American</p>
                <p className="text-[8px] md:text-[10px] font-black text-[#0070d1] leading-none tracking-tighter uppercase font-sans">Express</p>
              </div>
            </div>
          )
        }
      default:
        return {
          background: "linear-gradient(135deg, #333 0%, #000 100%)",
          pattern: "none",
          logo: <CreditCard className="w-8 h-8 md:w-10 md:h-10 text-white opacity-50" />
        }
    }
  }

  const vendorStyles = getVendorStyles(card.vendor)
  const statusConfig = getStatusConfig(card.status)

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 relative group">
      {/* Glossy Overlay for the whole container */}
      <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/10 to-blue-500/10 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-300"></div>

      {/* Card Front */}
      <div
        className="relative rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 text-white shadow-3xl min-h-[220px] md:min-h-[300px] flex flex-col justify-between overflow-hidden border border-white/10 transition-all duration-700 group-hover:scale-[1.02] group-hover:border-white/20"
        style={{ background: vendorStyles.background }}
      >
        {/* Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: vendorStyles.pattern, backgroundSize: card.vendor === 'amex' ? '30px 30px' : 'auto' }}
        />

        {/* Holographic Shimmer */}
        <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg] pointer-events-none group-hover:left-[150%] transition-all duration-1000 ease-in-out" />

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none opacity-40" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/40 rounded-full -ml-16 -mb-16 blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-start relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Corporate Bank</p>
              <span className="h-1 w-1 bg-orange-500 rounded-full animate-pulse shadow-[0_0_5px_#f97316]" />
            </div>
            <h3 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-white/90">
              {card.cardType} <span className="opacity-30 italic text-xs md:text-sm font-normal">Secure</span>
            </h3>
          </div>
          <div className="transform transition-all duration-500 group-hover:translate-x-1 group-hover:scale-110 drop-shadow-xl">
            {vendorStyles.logo}
          </div>
        </div>

        {/* Chip & NFC Icon */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="w-12 h-9 md:w-16 md:h-12 bg-gradient-to-br from-yellow-100 via-yellow-400 to-yellow-700 rounded-lg shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_2px_4px_rgba(0,0,0,0.3)] flex flex-col gap-1 p-1 md:p-1.5 overflow-hidden border border-black/10">
            <div className="flex gap-1 h-full"><div className="w-full h-full border-r border-b border-black/10 rounded-sm"></div><div className="w-full h-full border-l border-b border-black/10 rounded-sm"></div></div>
            <div className="flex gap-1 h-full"><div className="w-full h-full border-r border-t border-black/10 rounded-sm"></div><div className="w-full h-full border-l border-t border-black/10 rounded-sm"></div></div>
          </div>
          <div className="opacity-30 group-hover:opacity-80 transition-opacity transform rotate-90 md:rotate-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M2 9a10 10 0 0 1 20 0" /><path d="M5 12a7 7 0 0 1 14 0" /><path d="M8 15a4 4 0 0 1 8 0" /><circle cx="12" cy="18" r="1" /></svg>
          </div>
        </div>

        {/* Card Number */}
        <div className="relative z-10 mt-4 md:mt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="text-lg md:text-3xl font-mono font-bold tracking-[0.25em] text-white overflow-hidden whitespace-nowrap drop-shadow-lg">
              {showCardNumber ? card.cardNumber : maskCardNumber(card.cardNumber)}
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 md:h-8 md:w-8 p-0 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/10 backdrop-blur-sm"
                onClick={() => setShowCardNumber(!showCardNumber)}
              >
                {showCardNumber ? <EyeOff size={14} /> : <Eye size={14} />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 md:h-8 md:w-8 p-0 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/10 backdrop-blur-sm"
                onClick={handleCopyCardNumber}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Details Footer */}
        <div className="flex justify-between items-end relative z-10 pt-4 md:pt-6">
          <div className="space-y-0.5">
            <div className="text-[7px] md:text-[8px] font-black uppercase text-white/40 tracking-[0.2em]">Authorized User</div>
            <div className="text-xs md:text-lg font-black text-white uppercase tracking-tight italic drop-shadow-md">{card.cardHolderName}</div>
          </div>
          <div className="text-right space-y-0.5">
            <div className="text-[7px] md:text-[8px] font-black uppercase text-white/40 tracking-[0.2em]">Expiry Date</div>
            <div className="text-xs md:text-lg font-black text-white font-mono drop-shadow-md">{card.expiry}</div>
          </div>
        </div>
      </div>

      {/* Extended Details Area */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Card Back / CVV Section */}
          <div className="border border-white/5 bg-white/[0.04] backdrop-blur-2xl rounded-[2rem] p-6 md:p-10 shadow-3xl">
            <div className="flex flex-col md:flex-row gap-8 md:gap-12">
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Security Node</p>
                    <h4 className="text-white font-black text-base md:text-lg italic">Provisioning CVV</h4>
                  </div>
                  <div className="px-4 py-2 bg-black/40 border border-white/10 rounded-xl md:rounded-2xl flex items-center gap-4 shadow-inner">
                    <span className="font-mono text-xl md:text-2xl font-black text-white tracking-widest">
                      {showCVV ? card.cvv : "••••"}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 md:h-10 md:w-10 p-0 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg md:rounded-xl"
                      onClick={() => setShowCVV(!showCVV)}
                    >
                      {showCVV ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2 p-4 md:p-5 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl hover:bg-white/[0.08] transition-colors group/stat">
                  <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none group-hover/stat:text-orange-500 transition-colors">Daily Threshold</p>
                  <p className="text-lg md:text-xl font-black text-white italic">${card.dailyLimit?.toLocaleString()}</p>
                </div>
                <div className="space-y-2 p-4 md:p-5 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl hover:bg-white/[0.08] transition-colors group/stat">
                  <p className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none group-hover/stat:text-blue-500 transition-colors">Monthly Band</p>
                  <p className="text-lg md:text-xl font-black text-white italic">${card.monthlyLimit?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
