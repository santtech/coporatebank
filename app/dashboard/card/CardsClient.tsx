"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plus, CreditCard, ChevronLeft, ShieldCheck, Zap, Globe } from "lucide-react"
import Link from "next/link"
import CardComponent from "@/components/cards/CardComponent"
import { cn } from "@/lib/utils"

interface CardsClientProps {
    cards: any[]
}

export default function CardsClient({ cards }: CardsClientProps) {
    const fadeIn = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } }

    const activeCards = cards.filter((card: any) => card.status === "active" || card.status === "pending")

    return (
        <div className="min-h-screen bg-[#F4F6FA] p-4 md:p-6 pt-16 lg:pt-6">
            <div className="max-w-4xl mx-auto space-y-5">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild className="h-10 w-10 rounded-xl text-slate-500 hover:bg-white shadow-sm border border-slate-100">
                            <Link href="/dashboard"><ChevronLeft className="h-5 w-5" /></Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter italic leading-none">My Cards</h1>
                            <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-[0.2em] opacity-60 mt-2">Matrix Management Hub</p>
                        </div>
                    </div>
                    <Button asChild className="bg-slate-900 hover:bg-orange-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all italic h-14 px-8 shadow-xl shadow-slate-900/10 active:scale-95">
                        <Link href="/dashboard/card/apply" className="flex items-center gap-3">
                            <Plus className="h-5 w-5" /> Request New Card
                        </Link>
                    </Button>
                </div>

                {/* Feature Pills */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: "Biometric Lock", sub: "Secure Core", icon: ShieldCheck, color: "text-orange-500", bg: "bg-orange-50" },
                        { label: "Neural Process", sub: "Instant Issue", icon: Zap, color: "text-blue-500", bg: "bg-blue-50" },
                        { label: "Global Mesh", sub: "Worldwide", icon: Globe, color: "text-purple-500", bg: "bg-purple-50" },
                    ].map((item, i) => (
                        <motion.div key={i} {...fadeIn} transition={{ delay: 0.05 * i }}>
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow cursor-default">
                                <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner", item.bg, item.color)}>
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1 opacity-50">{item.label}</p>
                                    <p className="text-sm md:text-base font-black text-slate-900 uppercase tracking-tight italic">{item.sub}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Cards Content */}
                {activeCards.length === 0 ? (
                    <motion.div {...fadeIn} transition={{ delay: 0.15 }}>
                        <div className="bg-white rounded-xl shadow-sm border border-slate-100 py-16 flex flex-col items-center text-center gap-4">
                            <div className="h-12 w-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-300">
                                <CreditCard className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-base md:text-lg font-black text-slate-900 uppercase tracking-tight italic">No cards yet</h3>
                                <p className="text-sm md:text-base text-slate-400 font-bold uppercase tracking-widest opacity-60 mt-1">Request a card to get started.</p>
                            </div>
                            <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs border-none h-9 px-4">
                                <Link href="/dashboard/card/apply">Request a Card</Link>
                            </Button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {activeCards.map((card: any, idx: number) => (
                            <motion.div
                                key={card._id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * idx, duration: 0.4 }}
                            >
                                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                    <div className="p-4">
                                        <CardComponent card={card} showDetails={true} />
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-50 bg-slate-50/50">
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "h-1.5 w-1.5 rounded-full",
                                                card.status === 'active' ? 'bg-emerald-500' : 'bg-orange-400'
                                            )} />
                                            <span className="text-[10px] md:text-xs font-black text-slate-600 uppercase tracking-widest italic">{card.status}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest opacity-60">
                                            <ShieldCheck className="h-3.5 w-3.5 text-orange-400" />
                                            PIN Protected
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
