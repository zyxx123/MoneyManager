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
    <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-50 animate-fade-in-up">
      <nav 
        aria-label="Bottom Navigation" 
        className="bg-[#083328]/95 text-white rounded-full py-2 px-3 flex justify-around items-center shadow-nav border border-white/10 backdrop-blur-xl transition-smooth"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          if (item.isFab) {
            return (
              <Link 
                key={item.href} 
                href={item.href}
                aria-label={item.label}
                className="flex items-center justify-center w-12 h-12 bg-gradient-to-tr from-[#A3F03A] to-[#B8FF4F] rounded-full text-[#083328] shadow-lime-glow hover:shadow-lime-glow-lg hover:scale-110 active:scale-90 transition-spring animate-bounce-subtle"
              >
                <item.icon size={24} strokeWidth={2.8} />
              </Link>
            );
          }

          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3.5 rounded-full tap-pill ${
                isActive 
                  ? "text-[#A3F03A] bg-white/12 shadow-[0_2px_12px_rgba(163,240,58,0.2)] font-bold scale-105" 
                  : "text-white/65 hover:text-white/95"
              }`}
            >
              <item.icon 
                size={20} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={`transition-transform duration-300 ${isActive ? "scale-110" : ""}`} 
              />
              <span className={`text-[10px] mt-0.5 tracking-tight transition-all duration-300 ${isActive ? "font-bold text-[#A3F03A]" : "font-medium"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
