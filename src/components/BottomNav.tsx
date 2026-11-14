"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, PieChart, MoreHorizontal, Plus } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Wallet, label: "Dompet", href: "/wallets" },
    { icon: Plus, label: "Catat", href: "/transactions/new", isFab: true },
    { icon: PieChart, label: "Budget", href: "/budget" },
    { icon: MoreHorizontal, label: "Lainnya", href: "/more" },
  ];

  if (pathname.includes('/new') || pathname.includes('/edit')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50">
      <nav aria-label="Bottom Navigation" className="bg-[#083328] text-white rounded-full py-2.5 px-3 flex justify-around items-center shadow-[0_12px_32px_rgba(8,51,40,0.45)] border border-white/10 backdrop-blur-md">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          if (item.isFab) {
            return (
              <Link 
                key={item.href} 
                href={item.href}
                aria-label={item.label}
                className="flex items-center justify-center w-11 h-11 bg-[#A3F03A] rounded-full text-[#083328] shadow-[0_4px_14px_rgba(163,240,58,0.45)] hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <item.icon size={22} strokeWidth={2.8} />
              </Link>
            );
          }

          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-200 ${
                isActive 
                  ? "text-[#A3F03A] bg-white/10 font-bold" 
                  : "text-white/60 hover:text-white"
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
