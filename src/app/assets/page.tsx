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
      <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-24">
        <header className="sticky top-0 z-10 flex items-center p-4 bg-background/90 backdrop-blur-md">
          <button onClick={() => setIsCreating(false)} className="p-2 -ml-2 text-text-secondary hover:bg-surface rounded-full transition-colors active:scale-95">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-[20px] font-semibold ml-2">Tambah Aset Baru</h1>
        </header>

        <div className="flex-1 p-5">
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider ml-1">
                Nama Aset
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Logam Mulia 10g"
                className="w-full p-4 bg-surface border border-border-subtle rounded-[16px] focus:ring-1 focus:ring-primary outline-none text-[15px] font-medium shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider ml-1">
                Jenis Aset
              </label>
              <select
                required
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-4 bg-surface border border-border-subtle rounded-[16px] focus:ring-1 focus:ring-primary outline-none text-[15px] font-medium shadow-[0_2px_10px_rgba(0,0,0,0.02)] appearance-none"
              >
                {ASSET_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-text-secondary uppercase tracking-wider ml-1">Nilai Saat Ini</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-medium text-lg">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={value}
                  onChange={handleValueChange}
                  placeholder="0"
                  className="w-full p-5 pl-14 bg-surface border border-border-subtle rounded-[20px] focus:ring-1 focus:ring-primary outline-none transition-all text-3xl font-bold text-text-main shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!name || !value}
              className="w-full py-4 mt-4 bg-primary text-white rounded-full font-semibold text-[16px] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-[0_8px_16px_rgba(47,111,78,0.2)]"
            >
              Simpan Aset
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-background text-text-main pb-24">
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background/90 backdrop-blur-md">
        <div className="flex items-center">
          <Link href="/more" className="p-2 -ml-2 text-text-secondary hover:bg-surface rounded-full transition-colors active:scale-95">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-[24px] font-bold ml-2">Aset & Investasi</h1>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1.5 bg-primary/10 text-primary px-4 py-2 rounded-full text-[14px] font-semibold hover:bg-primary/20 active:scale-95 transition-all"
        >
          <Plus size={18} strokeWidth={2.5} />
          Tambah
        </button>
      </header>

      <div className="flex-1 p-4 space-y-4">
        {assets === undefined ? (
          <div className="animate-pulse space-y-4">
            {[1, 2].map(i => <div key={i} className="h-24 bg-surface rounded-[24px]" />)}
          </div>
        ) : assets.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-text-secondary">
            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <Landmark size={32} className="text-text-secondary/50" />
            </div>
            <p className="font-semibold text-[16px] text-text-main">Belum ada aset</p>
            <p className="text-[14px] mt-1">Mulai catat kekayaan Anda.</p>
          </div>
        ) : (
          assets.map(asset => {
            return (
              <div key={asset.id} className="bg-surface border border-border-subtle rounded-[24px] p-5 shadow-[0_4px_16px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-shadow flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[17px] text-text-main tracking-tight">{asset.name}</h3>
                  <p className="text-[13px] font-medium text-text-secondary mt-0.5">{asset.type}</p>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-income mb-2 text-[17px] tracking-tight">
                    {formatCurrency(asset.currentValue)}
                  </p>
                  <button 
                    onClick={() => handleUpdateValue(asset.id, asset.currentValue)}
                    className="text-[12px] flex items-center gap-1.5 ml-auto text-primary font-medium hover:opacity-80 transition-opacity"
                  >
                    <TrendingUp size={16} strokeWidth={2} /> Update Nilai
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
