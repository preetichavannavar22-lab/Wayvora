/**
 * Wayvora - Worldwide Currency & Exchange Rate Service
 * Provides multi-currency support, destination native currency mapping,
 * live exchange rate syncing with reliable offline fallbacks,
 * accurate conversion calculations, and trip affordability analysis.
 */

const CurrencyService = {
  // Supported Worldwide Currencies with Baseline Rates (USD = 1.0)
  currencies: {
    USD: { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸", rate: 1.0, decimals: 0 },
    EUR: { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺", rate: 0.892, decimals: 0 },
    GBP: { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧", rate: 0.756, decimals: 0 },
    JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵", rate: 158.0, decimals: 0 },
    INR: { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳", rate: 86.5, decimals: 0 },
    AUD: { code: "AUD", symbol: "A$", name: "Australian Dollar", flag: "🇦🇺", rate: 1.433, decimals: 0 },
    CAD: { code: "CAD", symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦", rate: 1.425, decimals: 0 },
    CHF: { code: "CHF", symbol: "CHF", name: "Swiss Franc", flag: "🇨🇭", rate: 0.831, decimals: 0 },
    AED: { code: "AED", symbol: "AED", name: "UAE Dirham", flag: "🇦🇪", rate: 3.673, decimals: 0 },
    IDR: { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", flag: "🇮🇩", rate: 15800.0, decimals: 0 },
    SGD: { code: "SGD", symbol: "S$", name: "Singapore Dollar", flag: "🇸🇬", rate: 1.340, decimals: 0 }
  },

  // Country to native currency mapping
  countryCurrencyMap: {
    "United States": "USD",
    "USA": "USD",
    "United Kingdom": "GBP",
    "UK": "GBP",
    "France": "EUR",
    "Italy": "EUR",
    "Greece": "EUR",
    "Germany": "EUR",
    "Spain": "EUR",
    "Netherlands": "EUR",
    "Portugal": "EUR",
    "Austria": "EUR",
    "Japan": "JPY",
    "India": "INR",
    "Australia": "AUD",
    "Canada": "CAD",
    "Switzerland": "CHF",
    "United Arab Emirates": "AED",
    "UAE": "AED",
    "Indonesia": "IDR",
    "Singapore": "SGD",
    "Maldives": "USD" // International tourism in Maldives is standardly USD
  },

  STORAGE_KEY: "wayvora_preferred_currency",
  RATES_STORAGE_KEY: "wayvora_exchange_rates",
  currentPref: "LOCAL",
  subscribers: [],

  init() {
    this.loadCachedRates();
    this.syncLiveRates();
  },

  subscribe(callback) {
    if (typeof callback === "function") {
      this.subscribers.push(callback);
    }
  },

  notifySubscribers() {
    const pref = this.getPreferredCurrency();
    this.subscribers.forEach(cb => {
      try { cb(pref); } catch (e) { console.error("Currency listener error:", e); }
    });
  },

  // Load cached rates from localStorage
  loadCachedRates() {
    if (typeof localStorage === "undefined") return;
    try {
      const cached = localStorage.getItem(this.RATES_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.rates && Date.now() - parsed.timestamp < 86400000) { // 24 hours
          Object.keys(parsed.rates).forEach(c => {
            if (this.currencies[c]) {
              this.currencies[c].rate = parsed.rates[c];
            }
          });
        }
      }
    } catch (e) {
      console.warn("Could not read cached exchange rates:", e);
    }
  },

  // Sync live rates from public exchange rate API
  async syncLiveRates() {
    if (typeof fetch === "undefined") return;
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/USD");
      if (res.ok) {
        const data = await res.json();
        if (data && data.rates) {
          const toSave = {};
          Object.keys(this.currencies).forEach(c => {
            if (data.rates[c]) {
              this.currencies[c].rate = data.rates[c];
              toSave[c] = data.rates[c];
            }
          });
          if (typeof localStorage !== "undefined") {
            localStorage.setItem(this.RATES_STORAGE_KEY, JSON.stringify({
              timestamp: Date.now(),
              rates: toSave
            }));
          }
          this.notifySubscribers();
        }
      }
    } catch (e) {
      // Graceful fallback to verified baseline rates
    }
  },

  // Get user preferred display currency ("LOCAL", "USD", "EUR", "GBP", "JPY", "INR", "AUD", etc.)
  getPreferredCurrency() {
    if (typeof localStorage !== "undefined") {
      return localStorage.getItem(this.STORAGE_KEY) || this.currentPref || "LOCAL";
    }
    return this.currentPref || "LOCAL";
  },

  // Set user preferred display currency
  setPreferredCurrency(currencyCode) {
    this.currentPref = currencyCode;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(this.STORAGE_KEY, currencyCode);
    }
    this.notifySubscribers();
    // Dispatch a window event for other controllers
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("currency-changed", { detail: { currency: currencyCode } }));
    }
  },

  // Resolve native currency of a destination
  getDestinationCurrency(dest) {
    if (!dest) return "USD";
    if (dest.currency) return dest.currency;
    if (dest.country && this.countryCurrencyMap[dest.country]) {
      return this.countryCurrencyMap[dest.country];
    }
    if (dest.id && (dest.id.startsWith("in-") || dest.id === "india" || dest.id === "goa" || dest.id === "kerala")) {
      return "INR";
    }
    return "USD";
  },

  // Convert amount from one currency to another
  convert(amount, fromCurrency, toCurrency) {
    const num = Number(amount) || 0;
    const from = fromCurrency ? fromCurrency.toUpperCase() : "USD";
    const to = toCurrency ? toCurrency.toUpperCase() : "USD";

    if (from === to) return Math.round(num);

    const fromRate = this.currencies[from] ? this.currencies[from].rate : 1.0;
    const toRate = this.currencies[to] ? this.currencies[to].rate : 1.0;

    // Convert via USD base: USD = amount / fromRate; Target = USD * toRate
    const amountInUSD = num / fromRate;
    const converted = amountInUSD * toRate;

    // Rounding based on currency magnitude
    if (to === "JPY" || to === "IDR") {
      return Math.round(converted / 10) * 10;
    }
    if (to === "INR") {
      return Math.round(converted / 5) * 5;
    }
    return Math.round(converted);
  },

  // Format currency with correct symbol and locale
  format(amount, currencyCode) {
    const code = (currencyCode || "USD").toUpperCase();
    const curr = this.currencies[code] || this.currencies.USD;
    const val = Math.round(Number(amount) || 0);

    // Format with commas
    const formattedNum = val.toLocaleString("en-US");

    if (code === "USD") return `$${formattedNum}`;
    if (code === "EUR") return `€${formattedNum}`;
    if (code === "GBP") return `£${formattedNum}`;
    if (code === "JPY") return `¥${formattedNum}`;
    if (code === "INR") return `₹${formattedNum}`;
    if (code === "AUD") return `A$${formattedNum}`;
    if (code === "CAD") return `C$${formattedNum}`;
    if (code === "CHF") return `CHF ${formattedNum}`;
    if (code === "AED") return `AED ${formattedNum}`;
    if (code === "IDR") return `Rp ${formattedNum}`;
    if (code === "SGD") return `S$${formattedNum}`;

    return `${curr.symbol}${formattedNum}`;
  },

  // Get daily budget information for a destination with user conversion applied
  getDisplayBudget(dest) {
    if (!dest) return { amount: 150, currency: "USD", formatted: "$150", isConverted: false };

    const nativeCurrency = this.getDestinationCurrency(dest);
    const nativeAmount = Number(dest.dailyBudgetEstimated) || this.getDefaultDailyBudget(dest, nativeCurrency);
    const preferred = this.getPreferredCurrency();

    if (preferred === "LOCAL" || preferred === nativeCurrency) {
      return {
        amount: nativeAmount,
        currency: nativeCurrency,
        formatted: this.format(nativeAmount, nativeCurrency),
        isConverted: false,
        nativeAmount,
        nativeCurrency
      };
    }

    const convertedAmount = this.convert(nativeAmount, nativeCurrency, preferred);
    return {
      amount: convertedAmount,
      currency: preferred,
      formatted: this.format(convertedAmount, preferred),
      isConverted: true,
      nativeAmount,
      nativeCurrency,
      nativeFormatted: this.format(nativeAmount, nativeCurrency)
    };
  },

  // Default daily budget if not explicitly set on item
  getDefaultDailyBudget(dest, nativeCurrency) {
    if (nativeCurrency === "INR") {
      if (dest.category === "city") return 4800;
      if (dest.category === "tourist_place") return 3600;
      return 4000;
    }
    if (nativeCurrency === "EUR") return 150;
    if (nativeCurrency === "GBP") return 135;
    if (nativeCurrency === "JPY") return 22000;
    if (nativeCurrency === "CHF") return 195;
    if (nativeCurrency === "AED") return 750;
    if (nativeCurrency === "IDR") return 1000000;
    if (nativeCurrency === "AUD") return 240;
    return 150;
  },

  // Get formatted and converted breakdown for a destination
  getDisplayBreakdown(dest) {
    const nativeCurrency = this.getDestinationCurrency(dest);
    const preferred = this.getPreferredCurrency();
    const targetCurrency = (preferred === "LOCAL") ? nativeCurrency : preferred;

    let nativeBreakdown = dest.budgetBreakdown;

    // Fallback breakdown for Indian items or items missing breakdown
    if (!nativeBreakdown) {
      const daily = this.getDefaultDailyBudget(dest, nativeCurrency);
      nativeBreakdown = {
        accommodation: Math.round(daily * 0.52),
        food: Math.round(daily * 0.25),
        transport: Math.round(daily * 0.11),
        activities: Math.round(daily * 0.12)
      };
    }

    const parseVal = (v) => {
      if (typeof v === "number") return v;
      if (typeof v === "string") {
        const num = parseInt(v.replace(/[^0-9]/g, ""), 10);
        return isNaN(num) ? 50 : num;
      }
      return 50;
    };

    const accomVal = parseVal(nativeBreakdown.accommodation);
    const foodVal = parseVal(nativeBreakdown.food);
    const transVal = parseVal(nativeBreakdown.transport);
    const actVal = parseVal(nativeBreakdown.activities);

    const convertOrKeep = (val) => {
      if (targetCurrency === nativeCurrency) return val;
      return this.convert(val, nativeCurrency, targetCurrency);
    };

    const cAccom = convertOrKeep(accomVal);
    const cFood = convertOrKeep(foodVal);
    const cTrans = convertOrKeep(transVal);
    const cAct = convertOrKeep(actVal);
    const cTotal = cAccom + cFood + cTrans + cAct;

    return {
      currency: targetCurrency,
      nativeCurrency,
      isConverted: targetCurrency !== nativeCurrency,
      accommodation: `${this.format(cAccom, targetCurrency)} / night`,
      food: `${this.format(cFood, targetCurrency)} / day`,
      transport: `${this.format(cTrans, targetCurrency)} / day`,
      activities: `${this.format(cAct, targetCurrency)} / day`,
      totalDaily: `${this.format(cTotal, targetCurrency)} / day`,
      totalRaw: cTotal
    };
  },

  /**
   * Affordability Health Check
   * Evaluates user budget against destination baseline, trip duration, and traveler count.
   */
  checkAffordability(destination, durationDays = 3, travelersCount = 1, userBudget = 1000, budgetCurrency = "USD") {
    let dest = destination;
    let days = durationDays;
    let travelers = travelersCount;
    let totalBudget = userBudget;
    let bCurrency = budgetCurrency;

    if (destination && typeof destination === "object" && ("budget" in destination || "days" in destination || "destination" in destination)) {
      dest = destination.destination || destination;
      days = destination.days || destination.durationDays || 3;
      travelers = destination.travelers || destination.travelersCount || 1;
      totalBudget = destination.budget !== undefined ? destination.budget : (destination.userBudget !== undefined ? destination.userBudget : 1000);
      bCurrency = destination.currency || destination.budgetCurrency || "USD";
    }

    if (typeof dest === "string") {
      dest = (typeof window !== "undefined" && window.DataService?.getDestinationById(dest)) || 
             (typeof window !== "undefined" && window.IndiaDataService?.getById(dest)) || 
             dest;
    }

    days = Math.max(1, Number(days) || 1);
    travelers = Math.max(1, Number(travelers) || 1);
    totalBudget = Math.max(0, Number(totalBudget) || 0);

    const destCurrency = this.getDestinationCurrency(dest);
    const destDaily = dest?.dailyBudgetEstimated || this.getDefaultDailyBudget(dest, destCurrency);

    // Total baseline cost in destination native currency
    const totalBaselineDestCurr = destDaily * days * travelers;

    // Convert user budget into destination native currency
    const userBudgetInDestCurr = this.convert(totalBudget, bCurrency, destCurrency);

    // Ratio: user budget vs baseline cost
    const ratio = totalBaselineDestCurr > 0 ? (userBudgetInDestCurr / totalBaselineDestCurr) : 1.0;

    // Per person per day budget in user's currency
    const userDailyPerPerson = totalBudget / (days * travelers);
    // Baseline daily per person in user's currency
    const baselineDailyInUserCurr = this.convert(destDaily, destCurrency, bCurrency);

    let status = "balanced";
    let statusLabel = "Balanced Mid-Range";
    let badgeClass = "badge-success";
    let summaryText = "";

    if (ratio >= 1.4) {
      status = "luxury";
      statusLabel = "Generous / Luxury";
      badgeClass = "badge-primary";
      summaryText = `Your budget allows for upscale 4-5★ hotels, fine dining, private tours, and extra shopping without constraints.`;
    } else if (ratio >= 0.9) {
      status = "comfortable";
      statusLabel = "Balanced Mid-Range";
      badgeClass = "badge-success";
      summaryText = `Your budget comfortably covers quality mid-range hotels, local dining, public transit, and popular attractions.`;
    } else if (ratio >= 0.65) {
      status = "budget";
      statusLabel = "Budget-Conscious";
      badgeClass = "badge-warning";
      summaryText = `Affordable with smart choices: recommend boutique hostels, local street dining, and public metro/bus passes.`;
    } else {
      status = "tight";
      statusLabel = "Tight Budget Alert";
      badgeClass = "badge-danger";
      summaryText = `Your budget is below typical averages for ${days} days and ${travelers} traveler${travelers > 1 ? 's' : ''}. Consider reducing trip duration or increasing target budget.`;
    }

    const baselineTotalInUserCurr = Math.round(this.convert(totalBaselineDestCurr, destCurrency, bCurrency));

    return {
      status,
      statusLabel,
      badgeClass,
      ratio: Math.round(ratio * 100),
      days,
      travelers,
      estimatedTotalBaseline: baselineTotalInUserCurr,
      totalBudgetFormatted: this.format(totalBudget, bCurrency),
      baselineTotalFormatted: this.format(baselineTotalInUserCurr, bCurrency),
      destNativeTotalFormatted: this.format(totalBaselineDestCurr, destCurrency),
      userDailyPerPersonFormatted: this.format(userDailyPerPerson, bCurrency),
      baselineDailyFormatted: this.format(baselineDailyInUserCurr, bCurrency),
      summaryText
    };
  }
};

// Auto-initialize when loaded
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    CurrencyService.init();
  });
}

// Expose globally
if (typeof window !== "undefined") {
  window.CurrencyService = CurrencyService;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = CurrencyService;
}
