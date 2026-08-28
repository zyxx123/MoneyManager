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
      <div className="flex flex-col h-full max-w-md mx-auto bg-gray-50 dark:bg-gray-950">
        <header className="flex items-center p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <button onClick={() => setIsCreating(false)} className="p-2 -ml-2 text-gray-600 dark:text-gray-300">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold ml-2">Tambah Aset Baru</h1>
        </header>

        <div className="p-4 pt-8">
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Nama Aset
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Logam Mulia 10g"
                className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Jenis Aset
              </label>
              <select
                required
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {ASSET_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nilai Saat Ini</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={value}
                  onChange={handleValueChange}
                  placeholder="0"
                  className="w-full p-3 pl-12 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
            >
              Simpan Aset
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-gray-50 dark:bg-gray-950">
      <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center">
          <Link href="/more" className="p-2 -ml-2 text-gray-600 dark:text-gray-300">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl font-bold ml-2">Aset & Investasi</h1>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium hover:bg-blue-700"
        >
          <Plus size={16} />
          Tambah
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {assets === undefined ? (
          <div className="animate-pulse space-y-4">
            {[1, 2].map(i => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-2xl" />)}
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <Landmark size={48} className="mx-auto mb-2 text-gray-400" />
            <p>Belum ada aset yang dicatat.</p>
          </div>
        ) : (
          assets.map(asset => {
            return (
              <div key={asset.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">{asset.name}</h3>
                  <p className="text-xs text-gray-500">{asset.type}</p>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-blue-600 mb-1">
                    {formatCurrency(asset.currentValue)}
                  </p>
                  <button 
                    onClick={() => handleUpdateValue(asset.id, asset.currentValue)}
                    className="text-xs flex items-center gap-1 ml-auto text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                  >
                    <TrendingUp size={14} /> Update Nilai
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
