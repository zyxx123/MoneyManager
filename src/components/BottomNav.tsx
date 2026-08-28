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
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          if (item.isFab) {
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full text-white shadow-lg -mt-6 hover:bg-blue-700 transition-colors"
              >
                <item.icon size={24} />
              </Link>
            );
          }

          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex flex-col items-center justify-center w-16 h-full space-y-1 ${
                isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
              }`}
            >
              <item.icon size={20} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
