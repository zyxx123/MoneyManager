export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  rate: number; // rate against 1 IDR
}

export const SUPPORTED_CURRENCIES: Record<string, { name: string; symbol: string; flag: string; defaultRate: number }> = {
  IDR: { name: "Rupiah", symbol: "Rp", flag: "🇮🇩", defaultRate: 1 },
  USD: { name: "US Dollar", symbol: "$", flag: "🇺🇸", defaultRate: 0.000062 },
  EUR: { name: "Euro", symbol: "€", flag: "🇪🇺", defaultRate: 0.000059 },
  SGD: { name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬", defaultRate: 0.000083 },
  MYR: { name: "Malaysian Ringgit", symbol: "RM", flag: "🇲🇾", defaultRate: 0.00028 },
  JPY: { name: "Japanese Yen", symbol: "¥", flag: "🇯🇵", defaultRate: 0.0096 },
  AUD: { name: "Australian Dollar", symbol: "A$", flag: "🇦🇺", defaultRate: 0.000096 },
  GBP: { name: "British Pound", symbol: "£", flag: "🇬🇧", defaultRate: 0.000050 },
  SAR: { name: "Saudi Riyal", symbol: "SR", flag: "🇸🇦", defaultRate: 0.00023 },
};

const CACHE_KEY = "pundi_currency_rates_v1";
const CACHE_TIME_KEY = "pundi_currency_rates_time";
const CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours

export const currencyService = {
  async getRates(): Promise<Record<string, number>> {
    // Check local storage cache
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
        if (cached && cachedTime && Date.now() - Number(cachedTime) < CACHE_DURATION) {
          return JSON.parse(cached);
        }
      } catch (e) {
        // Ignore cache read errors
      }
    }

    // Try fetching latest rates from public API
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch("https://open.er-api.com/v6/latest/IDR", {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.rates) {
          const rates: Record<string, number> = {};
          for (const code of Object.keys(SUPPORTED_CURRENCIES)) {
            rates[code] = data.rates[code] || SUPPORTED_CURRENCIES[code].defaultRate;
          }
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(CACHE_KEY, JSON.stringify(rates));
              localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
            } catch (e) {
              // Ignore cache write errors
            }
          }
          return rates;
        }
      }
    } catch (e) {
      // Offline or network error - fallback to defaults
    }

    // Fallback default rates
    const defaults: Record<string, number> = {};
    for (const [code, info] of Object.entries(SUPPORTED_CURRENCIES)) {
      defaults[code] = info.defaultRate;
    }
    return defaults;
  },

  convertFromIDR(amountInIDR: number, targetCurrency: string, rates: Record<string, number>): number {
    if (targetCurrency === "IDR") return amountInIDR;
    const rate = rates[targetCurrency] || SUPPORTED_CURRENCIES[targetCurrency]?.defaultRate || 1;
    return amountInIDR * rate;
  },

  format(amountInIDR: number, targetCurrency: string, rates: Record<string, number>, prefix: string = ""): string {
    const converted = this.convertFromIDR(amountInIDR, targetCurrency, rates);
    const curr = SUPPORTED_CURRENCIES[targetCurrency] || SUPPORTED_CURRENCIES.IDR;

    if (targetCurrency === "IDR") {
      return `${prefix}${new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amountInIDR)}`;
    }

    if (targetCurrency === "JPY") {
      return `${prefix}${curr.symbol} ${new Intl.NumberFormat("ja-JP", {
        maximumFractionDigits: 0,
      }).format(Math.round(converted))}`;
    }

    return `${prefix}${curr.symbol} ${new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(converted)}`;
  }
};

