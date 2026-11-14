"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { assetService } from "@/lib/services/assetService";
import { formatCurrency } from "@/lib/utils";
import { Landmark, Plus, ArrowLeft, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function AssetsPage() {
  const assets = useLiveQuery(() => assetService.getAllActive());
  const [isCreating, setIsCreating] = useState(false);
  
  const [name, setName] = useState("");
  const [type, setType] = useState("Emas");
  const [value, setValue] = useState("");

  const ASSET_TYPES = ["Emas", "Reksadana", "Saham", "Properti", "Lainnya"];

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      setValue("");
      return;
    }
    setValue(new Intl.NumberFormat("id-ID").format(Number(raw)));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawValue = Number(value.replace(/\D/g, ""));
    if (name && rawValue > 0) {
      await assetService.create({ name, type, currentValue: rawValue });
      setIsCreating(false);
      setName("");
      setValue("");
      setType("Emas");
    }
  };

  const handleUpdateValue = async (id: string, currentVal: number) => {
    const amountStr = prompt(`Update nilai aset saat ini (sebelumnya ${formatCurrency(currentVal)}):`, currentVal.toString());
    if (!amountStr) return;
    const newVal = Number(amountStr.replace(/\D/g, ""));
    if (newVal > 0) {
      await assetService.updateValue(id, newVal);
    }
  };

  if (isCreating) {
    return (
      <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-28 animate-fade-in-up">
        <header className="sticky top-0 z-10 flex items-center p-4 bg-background/80 backdrop-blur-xl">
          <button onClick={() => setIsCreating(false)} className="w-10 h-10 rounded-full liquid-glass-pill flex items-center justify-center text-text-secondary hover:text-text-main press-spring">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-[20px] font-bold ml-3 tracking-tight">Tambah Aset Baru</h1>
        </header>

        <div className="flex-1 p-5">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="bubble-card p-6 space-y-2 card-smooth">
              <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">
                Nama Aset
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Logam Mulia 10g, Saham BBCA"
                className="w-full p-4 bg-surface-muted border border-border/80 rounded-2xl outline-none text-[15px] font-semibold text-text-main focus:ring-2 focus:ring-[#A3F03A]/60 transition-smooth"
              />
            </div>
            
            <div className="bubble-card p-6 space-y-2 card-smooth">
              <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">
                Jenis Aset
              </label>
              <select
                required
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-3.5 bg-surface-muted border border-border/80 rounded-2xl outline-none text-[14px] font-semibold text-text-main appearance-none cursor-pointer focus:ring-2 focus:ring-[#A3F03A]/60 transition-smooth"
              >
                {ASSET_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            
            <div className="bubble-card p-6 space-y-2 card-smooth">
              <label className="text-[12px] font-bold text-text-secondary uppercase tracking-wider">Nilai Saat Ini</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-medium text-lg">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={value}
                  onChange={handleValueChange}
                  placeholder="0"
                  className="w-full p-4 pl-12 bg-surface-muted border border-border/80 rounded-2xl outline-none text-2xl font-bold text-text-main focus:ring-2 focus:ring-[#A3F03A]/60 transition-smooth"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!name || !value}
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-[#A3F03A] to-[#B6FF4D] text-[#083328] rounded-full font-bold text-[15px] shadow-lime-glow hover:shadow-lime-glow-lg disabled:opacity-50 disabled:cursor-not-allowed press-spring tap-pill"
            >
              Simpan Aset
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-28 animate-fade-in-up">
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center">
          <Link href="/more" className="w-10 h-10 rounded-full liquid-glass-pill flex items-center justify-center text-text-secondary hover:text-text-main press-spring">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-[20px] font-bold ml-3 tracking-tight">Aset & Investasi</h1>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 bg-gradient-to-r from-[#A3F03A] to-[#B6FF4D] text-[#083328] px-4 py-2 rounded-full text-xs font-bold shadow-lime-glow hover:shadow-lime-glow-lg press-spring tap-pill"
        >
          <Plus size={16} strokeWidth={2.8} />
          <span>Tambah</span>
        </button>
      </header>

      <div className="flex-1 p-4 space-y-4">
        {assets === undefined ? (
          <div className="animate-pulse space-y-4">
            {[1, 2].map(i => <div key={i} className="h-24 bubble-card" />)}
          </div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-16 text-text-secondary animate-fade-in bubble-card p-8 text-center">
            <div className="w-16 h-16 bg-[#083328]/10 dark:bg-white/10 text-[#083328] dark:text-[#A3F03A] rounded-full flex items-center justify-center mb-3 animate-bounce-subtle">
              <Landmark size={28} />
            </div>
            <p className="font-bold text-[16px] text-text-main">Belum Ada Aset</p>
            <p className="text-[13px] mt-1 text-text-secondary">Mulai catat aset dan investasi kekayaan Anda.</p>
          </div>
        ) : (
          assets.map((asset, idx) => {
            return (
              <div key={asset.id} className={`bubble-card p-5 flex items-center justify-between card-smooth stagger-${Math.min(idx + 1, 8)}`}>
                <div>
                  <h3 className="font-bold text-[16px] text-text-main tracking-tight">{asset.name}</h3>
                  <span className="text-[11px] font-semibold text-text-secondary bg-[#083328]/5 dark:bg-white/5 px-2.5 py-0.5 rounded-full inline-block mt-1">
                    {asset.type}
                  </span>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-income text-[16px] tracking-tight mb-1">
                    {formatCurrency(asset.currentValue)}
                  </p>
                  <button 
                    onClick={() => handleUpdateValue(asset.id, asset.currentValue)}
                    className="text-xs flex items-center gap-1 ml-auto text-[#083328] dark:text-[#A3F03A] font-bold liquid-glass-pill px-3 py-1.5 press-spring"
                  >
                    <TrendingUp size={14} /> 
                    <span>Update Nilai</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
