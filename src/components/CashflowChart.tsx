"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { subDays, startOfDay, endOfDay, format, isSameDay } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { TrendingUp, BarChart2 } from "lucide-react";

interface CashflowChartProps {
  formatValue: (amountInIDR: number) => string;
}

export default function CashflowChart({ formatValue }: CashflowChartProps) {
  const [selectedDayIdx, setSelectedDayIdx] = useState<number | null>(null);

  // Ambil transaksi pengeluaran dalam 7 hari terakhir
  const chartData = useLiveQuery(async () => {
    const now = new Date();
    const days = [];
    
    // Siapkan rentang 7 hari terakhir (dari 6 hari lalu sampai hari ini)
    for (let i = 6; i >= 0; i--) {
      const d = subDays(now, i);
      days.push({
        date: d,
        dayName: format(d, "EEE", { locale: localeID }), // e.g. Sen, Sel, Rab
        dateNum: format(d, "d MMM", { locale: localeID }),
        isToday: i === 0,
        expense: 0,
        income: 0,
      });
    }

    const startDate = startOfDay(days[0].date);
    const endDate = endOfDay(now);

    const txs = await db.transactions
      .where("date")
      .between(startDate, endDate, true, true)
      .toArray();

    for (const tx of txs) {
      const dayItem = days.find((d) => isSameDay(d.date, tx.date));
      if (dayItem) {
        if (tx.type === "expense") {
          dayItem.expense += tx.amount;
        } else if (tx.type === "income") {
          dayItem.income += tx.amount;
        }
      }
    }

    const maxExpense = Math.max(...days.map((d) => d.expense), 100000);
    const totalWeeklyExpense = days.reduce((sum, d) => sum + d.expense, 0);
    const averageDailyExpense = Math.round(totalWeeklyExpense / 7);

    return {
      days,
      maxExpense,
      totalWeeklyExpense,
      averageDailyExpense,
    };
  });

  if (!chartData) {
    return (
      <div className="bubble-card p-6 animate-pulse h-52 flex items-center justify-center">
        <span className="text-xs text-text-secondary font-medium">Memuat grafik pengeluaran...</span>
      </div>
    );
  }

  const { days, maxExpense, totalWeeklyExpense, averageDailyExpense } = chartData;
  const activeDay = selectedDayIdx !== null ? days[selectedDayIdx] : days[days.length - 1];

  return (
    <div className="bubble-card p-6 relative overflow-hidden animate-fade-in-up">
      {/* Header Info */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-1.5 text-text-secondary text-[11px] font-bold uppercase tracking-wider">
            <BarChart2 size={14} className="text-[#083328] dark:text-[#A3F03A]" />
            <span>Tren Pengeluaran 7 Hari</span>
          </div>
          <div className="text-xl font-extrabold text-text-main tracking-tight mt-0.5">
            {formatValue(activeDay ? activeDay.expense : totalWeeklyExpense)}
          </div>
          <p className="text-[11px] text-text-secondary mt-0.5">
            {selectedDayIdx !== null ? (
              <span>Pengeluaran pada {format(activeDay.date, "EEEE, d MMM", { locale: localeID })}</span>
            ) : (
              <span>Rata-rata: <strong className="text-text-main font-semibold">{formatValue(averageDailyExpense)}</strong> / hari</span>
            )}
          </p>
        </div>

        <div className="bg-[#EBF7F2] dark:bg-[#14382E] text-[#083328] dark:text-[#A3F03A] px-3 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1 shadow-sm">
          <TrendingUp size={12} strokeWidth={2.5} />
          <span>7 Hari</span>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="pt-2 pb-1">
        <div className="h-28 flex items-end justify-between gap-2 px-1">
          {days.map((d, idx) => {
            const heightPercent = Math.max(Math.round((d.expense / maxExpense) * 100), 6);
            const isSelected = selectedDayIdx === idx;
            const isHighlight = isSelected || (selectedDayIdx === null && d.isToday);

            return (
              <div
                key={idx}
                onClick={() => setSelectedDayIdx(isSelected ? null : idx)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
              >
                {/* Bar */}
                <div className="w-full max-w-[28px] flex flex-col justify-end items-center h-full">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-2xl transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) relative ${
                      isHighlight
                        ? "bg-gradient-to-t from-[#083328] to-[#A3F03A] shadow-[0_4px_14px_rgba(163,240,58,0.5)] scale-y-105"
                        : "bg-surface-muted group-hover:bg-[#DCF3E8] dark:group-hover:bg-[#1A4237]"
                    }`}
                  >
                    {/* Glowing highlight tip on top */}
                    {isHighlight && (
                      <span className="absolute top-0 inset-x-0 h-1 bg-[#A3F03A] rounded-t-2xl shadow-sm"></span>
                    )}
                  </div>
                </div>

                {/* Day label */}
                <div className="mt-2 text-center">
                  <span
                    className={`text-[11px] block transition-colors leading-none capitalize ${
                      isHighlight
                        ? "font-extrabold text-[#083328] dark:text-[#A3F03A]"
                        : "font-medium text-text-secondary group-hover:text-text-main"
                    }`}
                  >
                    {d.dayName}
                  </span>
                  {d.isToday && (
                    <span className="inline-block w-1 h-1 rounded-full bg-[#083328] dark:bg-[#A3F03A] mt-1"></span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info / Tap Hint */}
      <div className="mt-2 pt-2.5 border-t border-black/5 dark:border-white/5 flex justify-between items-center text-[11px] text-text-secondary">
        <span>Total 7 hari: <strong className="text-text-main font-bold">{formatValue(totalWeeklyExpense)}</strong></span>
        <span className="opacity-70 text-[10px]">Ketuk batang untuk detail</span>
      </div>
    </div>
  );
}

