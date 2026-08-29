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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md border-t-2 border-black pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          if (item.isFab) {
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className="flex items-center justify-center w-14 h-14 bg-primary border-2 border-black rounded-full text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -mt-6 hover:-translate-y-0.5 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all duration-200"
              >
                <item.icon size={24} strokeWidth={2.5} />
              </Link>
            );
          }

          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors duration-200 active:opacity-70 ${
                isActive ? "text-primary" : "text-text-secondary hover:text-text-main"
              }`}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] ${isActive ? "font-semibold" : "font-medium"}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
