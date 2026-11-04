/**
 * Wayvora - Worldwide Live Currency & Real-Time Exchange Rate Engine
 * Powered by ExchangeRate-API with serverless /api/currency proxy,
 * multi-currency conversion (INR, USD, CNY, EUR, GBP, JPY, AED, CHF, AUD, CAD, SGD),
 * live rate caching, timestamp transparency, and interactive converter widget.
 */

const CurrencyService = {
  // Supported Worldwide Currencies with verified metadata and live rate placeholders (Base: USD = 1.0)
  currencies: {
    USD: { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸", rate: 1.0, decimals: 2 },
    INR: { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳", rate: 95.20, decimals: 2 },
    CNY: { code: "CNY", symbol: "¥", name: "Chinese Yuan", flag: "🇨🇳", rate: 6.68, decimals: 2 },
    EUR: { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺", rate: 0.897, decimals: 2 },
    GBP: { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧", rate: 0.751, decimals: 2 },
    JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵", rate: 157.89, decimals: 0 },
    AED: { code: "AED", symbol: "AED", name: "UAE Dirham", flag: "🇦🇪", rate: 3.6725, decimals: 2 },
    CHF: { code: "CHF", symbol: "CHF", name: "Swiss Franc", flag: "🇨🇭", rate: 0.835, decimals: 2 },
    AUD: { code: "AUD", symbol: "A$", name: "Australian Dollar", flag: "🇦🇺", rate: 1.432, decimals: 2 },
    CAD: { code: "CAD", symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦", rate: 1.428, decimals: 2 },
    SGD: { code: "SGD", symbol: "S$", name: "Singapore Dollar", flag: "🇸🇬", rate: 1.281, decimals: 2 },
    IDR: { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", flag: "🇮🇩", rate: 15850.0, decimals: 0 },
    THB: { code: "THB", symbol: "฿", name: "Thai Baht", flag: "🇹🇭", rate: 33.80, decimals: 2 },
    KRW: { code: "KRW", symbol: "₩", name: "South Korean Won", flag: "🇰🇷", rate: 1420.0, decimals: 0 },
    NZD: { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", flag: "🇳🇿", rate: 1.685, decimals: 2 }
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
    "China": "CNY",
    "Australia": "AUD",
    "Canada": "CAD",
    "Switzerland": "CHF",
    "United Arab Emirates": "AED",
    "UAE": "AED",
    "Indonesia": "IDR",
    "Singapore": "SGD",
    "Thailand": "THB",
    "South Korea": "KRW",
    "New Zealand": "NZD",
    "Maldives": "USD" // International tourism standard in Maldives
  },

  // Storage & State Configuration
  STORAGE_KEY: "wayvora_preferred_currency",
  RATES_STORAGE_KEY: "wayvora_live_exchange_rates",
  currentPref: "USD",
  allRates: {}, // Holds full 160+ live currency rates from the API
  isLive: false,
  isCached: false,
  isOutdated: false,
  rateStatus: "loading", // "loading" | "live" | "cached" | "offline"
  lastUpdatedUtc: "",
  lastUpdatedFormatted: "",
  lastFetchTimestamp: 0,
  activeProvider: "ExchangeRate-API",
  subscribers: [],
  periodicSyncTimer: null,

  init() {
    this.loadCachedRates();
    this.syncLiveRates();
    this.startPeriodicSync();
    if (typeof window !== "undefined") {
      this.bindConverterTriggerEvents();
    }
  },

  startPeriodicSync() {
    if (this.periodicSyncTimer) clearInterval(this.periodicSyncTimer);
    // Refresh live rates every 60 minutes
    this.periodicSyncTimer = setInterval(() => {
      this.syncLiveRates(true);
    }, 60 * 60 * 1000);
  },

  subscribe(callback) {
    if (typeof callback === "function") {
      this.subscribers.push(callback);
    }
  },

  notifySubscribers() {
    const pref = this.getPreferredCurrency();
    this.subscribers.forEach(cb => {
      try { cb(pref, this.getRateStatusMeta()); } catch (e) { console.error("Currency listener error:", e); }
    });
  },

  getRateStatusMeta() {
    return {
      status: this.rateStatus,
      isLive: this.isLive,
      isCached: this.isCached,
      isOutdated: this.isOutdated,
      provider: this.activeProvider,
      lastUpdatedFormatted: this.lastUpdatedFormatted || "Awaiting live rate fetch...",
      lastUpdatedUtc: this.lastUpdatedUtc
    };
  },

  // Format UTC string into friendly local time string
  formatRateTimestamp(rawUtc) {
    if (!rawUtc) return "";
    try {
      const d = new Date(rawUtc);
      if (isNaN(d.getTime())) return rawUtc;
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }) + ", " + d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short"
      });
    } catch (e) {
      return rawUtc;
    }
  },

  // Load cached rates from localStorage (used instantly while live fetch is in flight or as fallback)
  loadCachedRates() {
    if (typeof localStorage === "undefined") return;
    try {
      const cached = localStorage.getItem(this.RATES_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.rates) {
          this.allRates = parsed.rates;
          Object.keys(this.currencies).forEach(c => {
            if (parsed.rates[c]) {
              this.currencies[c].rate = Number(parsed.rates[c]);
            }
          });
          this.lastUpdatedUtc = parsed.timeLastUpdateUtc || parsed.lastUpdatedUtc || "";
          this.lastUpdatedFormatted = this.formatRateTimestamp(this.lastUpdatedUtc);
          this.lastFetchTimestamp = parsed.timestamp || 0;
          this.activeProvider = parsed.provider || "ExchangeRate-API";

          // If cache is less than 6 hours old, consider it valid cached data
          const age = Date.now() - (parsed.timestamp || 0);
          if (age < 6 * 3600 * 1000) {
            this.isLive = true;
            this.isCached = false;
            this.rateStatus = "live";
          } else {
            this.isLive = false;
            this.isCached = true;
            this.isOutdated = true;
            this.rateStatus = "cached";
          }
        }
      }
    } catch (e) {
      console.warn("Could not read cached exchange rates:", e);
    }
  },

  /**
   * Fetch real-time exchange rates from serverless API or direct provider.
   * Updates rates across all supported currencies and notifies subscribers.
   */
  async syncLiveRates(forceRefresh = false) {
    if (typeof fetch === "undefined") return;

    // Check if we already have fresh rates in memory (less than 1 hour old)
    const now = Date.now();
    if (!forceRefresh && this.isLive && (now - this.lastFetchTimestamp < 3600000)) {
      return { success: true, fromMemory: true, ...this.getRateStatusMeta() };
    }

    this.rateStatus = "loading";
    let data = null;
    let fetchError = null;

    // 1. Try serverless backend proxy (/api/currency)
    try {
      const apiUrl = `/api/currency${forceRefresh ? "?refresh=true" : ""}`;
      const res = await fetch(apiUrl, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json && (json.rates || json.conversion_rates)) {
          data = json;
        }
      }
    } catch (err) {
      fetchError = err;
    }

    // 2. Direct fallback to official open ExchangeRate-API endpoint if proxy failed
    if (!data) {
      try {
        const directRes = await fetch("https://open.er-api.com/v6/latest/USD", { cache: "no-store" });
        if (directRes.ok) {
          const directJson = await directRes.json();
          if (directJson && directJson.rates) {
            data = directJson;
          }
        }
      } catch (err) {
        fetchError = err;
      }
    }

    // 3. Process live data if received
    if (data && (data.rates || data.conversion_rates)) {
      const rawRates = data.conversion_rates || data.rates;
      this.allRates = rawRates;

      Object.keys(this.currencies).forEach(code => {
        if (rawRates[code] !== undefined) {
          this.currencies[code].rate = Number(rawRates[code]);
        }
      });

      this.lastUpdatedUtc = data.time_last_update_utc || data.timeLastUpdateUtc || new Date().toUTCString();
      this.lastUpdatedFormatted = this.formatRateTimestamp(this.lastUpdatedUtc);
      this.lastFetchTimestamp = Date.now();
      this.activeProvider = data.provider || "ExchangeRate-API";
      this.isLive = true;
      this.isCached = false;
      this.isOutdated = false;
      this.rateStatus = "live";

      // Cache locally
      if (typeof localStorage !== "undefined") {
        try {
          localStorage.setItem(this.RATES_STORAGE_KEY, JSON.stringify({
            timestamp: this.lastFetchTimestamp,
            lastUpdatedUtc: this.lastUpdatedUtc,
            provider: this.activeProvider,
            rates: rawRates
          }));
        } catch (e) { /* ignore quota */ }
      }

      this.notifySubscribers();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("currency-rates-updated", { detail: this.getRateStatusMeta() }));
      }
      return { success: true, ...this.getRateStatusMeta() };
    }

    // 4. Fallback Handling if Live API is unavailable
    console.warn("Live currency exchange-rate API unavailable. Activating cached fallback.", fetchError);
    if (this.lastFetchTimestamp > 0 && Object.keys(this.allRates).length > 0) {
      // We have previous cache
      this.isLive = false;
      this.isCached = true;
      this.isOutdated = true;
      this.rateStatus = "cached";
      this.lastUpdatedFormatted = `${this.formatRateTimestamp(this.lastUpdatedUtc)} (Cached Rate)`;
    } else {
      // Complete offline without prior cache -> use verified emergency baseline
      this.isLive = false;
      this.isCached = false;
      this.isOutdated = true;
      this.rateStatus = "offline";
      this.lastUpdatedFormatted = "Offline Fallback Rates";
    }

    this.notifySubscribers();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("currency-rates-updated", { detail: this.getRateStatusMeta() }));
    }
    return { success: false, ...this.getRateStatusMeta(), error: fetchError?.message };
  },

  // Get user preferred display currency ("USD", "INR", "CNY", "EUR", "GBP", "JPY", etc.)
  getPreferredCurrency() {
    let pref = null;
    if (typeof localStorage !== "undefined") {
      try { pref = localStorage.getItem(this.STORAGE_KEY); } catch (e) {}
    }
    // Check DOM select elements if stored pref is missing, legacy "LOCAL" or unknown
    if (!pref || pref === "LOCAL" || pref === "AUTO" || !this.currencies[pref]) {
      if (typeof document !== "undefined") {
        const sel = document.getElementById("nav-currency-select") || document.getElementById("mobile-currency-select");
        if (sel && sel.value && this.currencies[sel.value]) {
          pref = sel.value;
        }
      }
    }
    if (!pref || pref === "LOCAL" || pref === "AUTO" || !this.currencies[pref]) {
      pref = this.currentPref || "USD";
    }
    return pref;
  },

  // Set user preferred display currency across whole site
  setPreferredCurrency(currencyCode) {
    let clean = (currencyCode || "USD").toUpperCase();
    if (clean === "LOCAL" || clean === "AUTO" || !this.currencies[clean]) {
      clean = "USD";
    }
    this.currentPref = clean;
    if (typeof localStorage !== "undefined") {
      try { localStorage.setItem(this.STORAGE_KEY, clean); } catch (e) {}
    }
    this.notifySubscribers();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("currency-changed", { detail: { currency: clean } }));
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

  // Get conversion rate from USD to target currency
  getRateToUSD(currencyCode) {
    const code = (currencyCode || "USD").toUpperCase();
    if (this.currencies[code]) return this.currencies[code].rate;
    if (this.allRates[code]) return Number(this.allRates[code]);
    return 1.0;
  },

  /**
   * High-accuracy currency conversion calculation.
   * Converts any amount between any supported currency pair via live exchange rate.
   * 
   * @param {number|string} amount 
   * @param {string} fromCurrency - ISO code (e.g. "INR", "USD", "CNY")
   * @param {string} toCurrency - ISO code (e.g. "USD", "INR", "EUR")
   * @param {object} options - { precision: boolean, decimals: number }
   * @returns {number} Converted value
   */
  convert(amount, fromCurrency, toCurrency, options = {}) {
    const num = Number(amount) || 0;
    const from = (fromCurrency || "USD").toUpperCase();
    const to = (toCurrency || "USD").toUpperCase();

    if (from === to) {
      if (options.precision) {
        const dec = options.decimals !== undefined ? options.decimals : (this.currencies[to]?.decimals ?? 2);
        return Number(num.toFixed(dec));
      }
      return Math.round(num);
    }

    const fromRate = this.getRateToUSD(from);
    const toRate = this.getRateToUSD(to);

    // Baseline calculation: 1 USD = fromRate [FROM] = toRate [TO]
    // Value in USD = num / fromRate; Converted value = (num / fromRate) * toRate
    const converted = num * (toRate / fromRate);

    // High precision mode for Currency Converter widget:
    if (options.precision) {
      const dec = options.decimals !== undefined ? options.decimals : (this.currencies[to]?.decimals ?? 2);
      return Number(converted.toFixed(dec));
    }

    // Default destination price rounding for readable travel cards:
    if (to === "JPY" || to === "IDR" || to === "KRW") {
      return Math.round(converted / 10) * 10;
    }
    if (to === "INR") {
      return Math.round(converted / 5) * 5;
    }
    return Math.round(converted);
  },

  /**
   * Get direct and inverse exchange rate between two currencies.
   * e.g., 1 USD = 95.20 INR and 1 INR = 0.0105 USD
   */
  getExchangeRate(fromCurrency, toCurrency) {
    const from = (fromCurrency || "USD").toUpperCase();
    const to = (toCurrency || "USD").toUpperCase();

    const fromRate = this.getRateToUSD(from);
    const toRate = this.getRateToUSD(to);

    const directRate = toRate / fromRate;
    const inverseRate = fromRate / toRate;

    const fromCurr = this.currencies[from] || { code: from, symbol: from, name: from };
    const toCurr = this.currencies[to] || { code: to, symbol: to, name: to };

    // Format rate decimals nicely
    const formatRateNum = (val) => {
      if (val >= 100) return val.toFixed(2);
      if (val >= 1) return val.toFixed(4);
      return val.toFixed(6);
    };

    return {
      from,
      to,
      fromSymbol: fromCurr.symbol,
      toSymbol: toCurr.symbol,
      fromName: fromCurr.name,
      toName: toCurr.name,
      rate: directRate,
      inverseRate: inverseRate,
      rateFormatted: formatRateNum(directRate),
      inverseRateFormatted: formatRateNum(inverseRate),
      rateFormula: `1 ${from} = ${formatRateNum(directRate)} ${to}`,
      inverseFormula: `1 ${to} = ${formatRateNum(inverseRate)} ${from}`,
      isLive: this.isLive,
      isCached: this.isCached,
      isOutdated: this.isOutdated,
      lastUpdatedFormatted: this.lastUpdatedFormatted
    };
  },

  /**
   * Detailed conversion breakdown for the Currency Converter modal.
   */
  convertDetailed(amount, fromCurrency, toCurrency) {
    const from = (fromCurrency || "USD").toUpperCase();
    const to = (toCurrency || "INR").toUpperCase();
    const num = Number(amount) || 0;

    const rateInfo = this.getExchangeRate(from, to);
    const toDecimals = this.currencies[to]?.decimals ?? 2;
    const fromDecimals = this.currencies[from]?.decimals ?? 2;

    const convertedVal = num * rateInfo.rate;

    return {
      fromAmount: num,
      fromCurrency: from,
      fromFormatted: this.format(num, from, { precision: true, decimals: fromDecimals }),
      toAmount: convertedVal,
      toCurrency: to,
      toFormatted: this.format(convertedVal, to, { precision: true, decimals: toDecimals }),
      rate: rateInfo.rate,
      rateFormula: rateInfo.rateFormula,
      inverseFormula: rateInfo.inverseFormula,
      isLive: this.isLive,
      isCached: this.isCached,
      isOutdated: this.isOutdated,
      rateStatus: this.rateStatus,
      lastUpdatedFormatted: this.lastUpdatedFormatted,
      provider: this.activeProvider
    };
  },

  // Format currency with correct symbol, separators, and decimals
  format(amount, currencyCode, options = {}) {
    const code = (currencyCode || "USD").toUpperCase();
    const curr = this.currencies[code] || { code, symbol: code + " ", name: code, decimals: 2 };
    const num = Number(amount) || 0;

    let decimals = 0;
    if (options.precision) {
      decimals = options.decimals !== undefined ? options.decimals : (curr.decimals ?? 2);
    } else if (options.showDecimals) {
      decimals = 2;
    }

    const formattedNum = num.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });

    if (code === "USD") return `$${formattedNum}`;
    if (code === "EUR") return `€${formattedNum}`;
    if (code === "GBP") return `£${formattedNum}`;
    if (code === "JPY") return `¥${formattedNum}`;
    if (code === "INR") return `₹${formattedNum}`;
    if (code === "CNY") return `¥${formattedNum}`;
    if (code === "AUD") return `A$${formattedNum}`;
    if (code === "CAD") return `C$${formattedNum}`;
    if (code === "CHF") return `CHF ${formattedNum}`;
    if (code === "AED") return `AED ${formattedNum}`;
    if (code === "IDR") return `Rp ${formattedNum}`;
    if (code === "SGD") return `S$${formattedNum}`;
    if (code === "THB") return `฿${formattedNum}`;
    if (code === "KRW") return `₩${formattedNum}`;
    if (code === "NZD") return `NZ$${formattedNum}`;

    return `${curr.symbol}${formattedNum}`;
  },

  // Get daily budget information for a destination with user conversion applied
  getDisplayBudget(dest) {
    const preferred = this.getPreferredCurrency();
    if (!dest) {
      return {
        amount: 150,
        currency: preferred,
        formatted: this.format(150, preferred),
        isConverted: false
      };
    }

    const nativeCurrency = this.getDestinationCurrency(dest);
    const nativeAmount = Number(dest.dailyBudgetEstimated) || this.getDefaultDailyBudget(dest, nativeCurrency);

    if (preferred === nativeCurrency) {
      return {
        amount: nativeAmount,
        currency: preferred,
        formatted: this.format(nativeAmount, preferred),
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
      nativeCurrency
    };
  },

  // Default daily budget if not explicitly set on item
  getDefaultDailyBudget(dest, nativeCurrency) {
    if (nativeCurrency === "INR") {
      if (dest?.category === "city") return 4800;
      if (dest?.category === "tourist_place") return 3600;
      return 4000;
    }
    if (nativeCurrency === "EUR") return 150;
    if (nativeCurrency === "GBP") return 135;
    if (nativeCurrency === "JPY") return 22000;
    if (nativeCurrency === "CHF") return 195;
    if (nativeCurrency === "AED") return 750;
    if (nativeCurrency === "IDR") return 1000000;
    if (nativeCurrency === "AUD") return 240;
    if (nativeCurrency === "CNY") return 650;
    if (nativeCurrency === "SGD") return 210;
    return 150;
  },

  // Get formatted and converted breakdown for a destination
  getDisplayBreakdown(dest) {
    const nativeCurrency = this.getDestinationCurrency(dest);
    const targetCurrency = this.getPreferredCurrency();

    let nativeBreakdown = dest?.budgetBreakdown;

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

  // Affordability Health Check for Trip Planner
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

    const totalBaselineDestCurr = destDaily * days * travelers;
    const userBudgetInDestCurr = this.convert(totalBudget, bCurrency, destCurrency);

    const ratio = totalBaselineDestCurr > 0 ? (userBudgetInDestCurr / totalBaselineDestCurr) : 1.0;
    const userDailyPerPerson = totalBudget / (days * travelers);
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
  },

  // Wire trigger buttons on load
  bindConverterTriggerEvents() {
    document.getElementById("nav-converter-btn")?.addEventListener("click", () => {
      CurrencyConverterUI.openModal();
    });
    document.getElementById("mobile-converter-btn")?.addEventListener("click", () => {
      if (window.App && typeof window.App.closeMobileMenu === "function") {
        window.App.closeMobileMenu();
      }
      CurrencyConverterUI.openModal();
    });
    document.getElementById("footer-converter-btn")?.addEventListener("click", () => {
      CurrencyConverterUI.openModal();
    });
  }
};

/**
 * Interactive Real-Time Currency Converter Modal UI Controller
 */
const CurrencyConverterUI = {
  currentFrom: "USD",
  currentTo: "INR",
  currentAmount: 1000,
  modalEl: null,

  openModal(from = null, to = null, amount = null) {
    if (from) this.currentFrom = from.toUpperCase();
    if (to) this.currentTo = to.toUpperCase();
    if (amount) this.currentAmount = Number(amount) || 1000;

    let modal = document.getElementById("currency-converter-modal");
    if (!modal) {
      modal = this.createModalDOM();
      document.body.appendChild(modal);
      this.bindModalEvents(modal);
    }

    this.modalEl = modal;
    this.updateModalState();
    modal.classList.add("active");
    document.body.classList.add("modal-open");

    // Focus input
    setTimeout(() => {
      const input = document.getElementById("converter-amount-input");
      if (input) {
        input.focus();
        input.select();
      }
    }, 150);
  },

  closeModal() {
    const modal = document.getElementById("currency-converter-modal");
    if (modal) {
      modal.classList.remove("active");
    }
    document.body.classList.remove("modal-open");
  },

  createModalDOM() {
    const div = document.createElement("div");
    div.id = "currency-converter-modal";
    div.className = "modal-overlay-converter";

    const currencyList = Object.keys(CurrencyService.currencies);

    div.innerHTML = `
      <div class="converter-modal-dialog animate-scale-up" role="dialog" aria-modal="true" aria-labelledby="converter-dialog-title">
        
        <!-- Modal Header -->
        <div class="converter-modal-header">
          <div class="converter-header-info">
            <div class="converter-header-badge">
              <span class="converter-icon-bubble">💱</span>
              <span class="converter-live-pill" id="converter-live-indicator">
                <span class="pulse-dot"></span> <span id="converter-status-text">Fetching Live Rates...</span>
              </span>
            </div>
            <h2 id="converter-dialog-title">Live Currency Converter</h2>
            <p class="text-xs text-muted mt-1">Real-time foreign exchange conversions powered by verified interbank data.</p>
          </div>
          <button type="button" class="btn-close-converter" id="btn-close-converter" aria-label="Close currency converter">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <!-- Warning / Outdated Banner (Displayed only if API is offline/cached) -->
        <div class="converter-alert-banner" id="converter-alert-banner" style="display: none;" role="alert">
          <span class="alert-icon">⚠️</span>
          <div class="alert-text">
            <strong>Network Notice:</strong> <span id="converter-alert-msg">Live exchange rate service is temporarily unreachable. Displaying cached rates.</span>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="converter-modal-body">
          
          <!-- Amount Input -->
          <div class="form-group mb-3">
            <label for="converter-amount-input" class="converter-label">
              <span>Amount to Convert</span>
              <span class="converter-sublabel">Enter any value</span>
            </label>
            <div class="converter-input-wrapper">
              <span class="converter-currency-symbol" id="converter-from-symbol">$</span>
              <input 
                type="number" 
                id="converter-amount-input" 
                class="converter-amount-input" 
                value="${this.currentAmount}" 
                min="0.01" 
                step="any" 
                placeholder="1000"
              />
            </div>
          </div>

          <!-- Quick Amount Preset Chips -->
          <div class="converter-presets-row mb-3">
            <span class="preset-label">Presets:</span>
            <button type="button" class="preset-chip" data-amount="100">100</button>
            <button type="button" class="preset-chip" data-amount="500">500</button>
            <button type="button" class="preset-chip active" data-amount="1000">1,000</button>
            <button type="button" class="preset-chip" data-amount="5000">5,000</button>
            <button type="button" class="preset-chip" data-amount="10000">10,000</button>
            <button type="button" class="preset-chip" data-amount="50000">50,000</button>
          </div>

          <!-- Currencies Selection Row with Swap Button -->
          <div class="converter-currencies-grid mb-4">
            
            <!-- Source Currency -->
            <div class="converter-select-col">
              <label for="converter-from-select" class="converter-label">From Currency</label>
              <div class="converter-select-box">
                <span class="select-flag" id="converter-from-flag">🇺🇸</span>
                <select id="converter-from-select" class="converter-dropdown" aria-label="Source Currency">
                  ${currencyList.map(code => {
                    const c = CurrencyService.currencies[code];
                    return `<option value="${code}" ${code === this.currentFrom ? 'selected' : ''}>${c.flag} ${c.code} - ${c.name} (${c.symbol})</option>`;
                  }).join("")}
                </select>
              </div>
            </div>

            <!-- Swap Button -->
            <div class="converter-swap-col">
              <button type="button" class="btn-swap-currency" id="btn-swap-currency" title="Swap Source and Target Currencies" aria-label="Swap Currencies">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16"></path>
                </svg>
              </button>
            </div>

            <!-- Target Currency -->
            <div class="converter-select-col">
              <label for="converter-to-select" class="converter-label">To Currency</label>
              <div class="converter-select-box">
                <span class="select-flag" id="converter-to-flag">🇮🇳</span>
                <select id="converter-to-select" class="converter-dropdown" aria-label="Target Currency">
                  ${currencyList.map(code => {
                    const c = CurrencyService.currencies[code];
                    return `<option value="${code}" ${code === this.currentTo ? 'selected' : ''}>${c.flag} ${c.code} - ${c.name} (${c.symbol})</option>`;
                  }).join("")}
                </select>
              </div>
            </div>

          </div>

          <!-- Conversion Result Display Card -->
          <div class="converter-result-card" id="converter-result-card">
            <div class="result-top-label">Converted Total:</div>
            <div class="result-primary-val" id="converter-primary-display">
              <span id="converter-result-number">Calculating...</span>
            </div>
            
            <div class="result-formula-row">
              <span class="formula-icon">📊</span>
              <span class="formula-text" id="converter-rate-formula">1 USD = 95.20 INR</span>
            </div>
            <div class="result-inverse-row">
              <span class="formula-icon">🔄</span>
              <span class="formula-text text-muted" id="converter-inverse-formula">1 INR = 0.0105 USD</span>
            </div>

            <div class="result-meta-footer">
              <div class="meta-timestamp" id="converter-meta-timestamp">
                Rates updated: <strong id="converter-timestamp-label">Today</strong>
              </div>
              <button type="button" class="btn-refresh-rates" id="btn-refresh-rates" title="Check for latest live rates">
                <svg id="refresh-spinner-icon" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
                <span>Refresh Rates</span>
              </button>
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="converter-bottom-actions mt-4">
            <button type="button" class="btn btn-primary btn-block" id="btn-apply-as-site-currency">
              Set <span id="converter-apply-target-code">INR</span> as Website Currency
            </button>
          </div>

        </div>
      </div>
    `;

    return div;
  },

  bindModalEvents(modal) {
    // Close button
    modal.querySelector("#btn-close-converter")?.addEventListener("click", () => this.closeModal());

    // Backdrop click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) this.closeModal();
    });

    // Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("active")) {
        this.closeModal();
      }
    });

    // Amount input change
    const amountInput = modal.querySelector("#converter-amount-input");
    amountInput?.addEventListener("input", () => {
      this.currentAmount = Number(amountInput.value) || 0;
      this.recalculate();
      this.updatePresetChips();
    });

    // From Currency Select
    const fromSelect = modal.querySelector("#converter-from-select");
    fromSelect?.addEventListener("change", () => {
      this.currentFrom = fromSelect.value;
      this.updateModalState();
    });

    // To Currency Select
    const toSelect = modal.querySelector("#converter-to-select");
    toSelect?.addEventListener("change", () => {
      this.currentTo = toSelect.value;
      this.updateModalState();
    });

    // Swap Currencies Button
    modal.querySelector("#btn-swap-currency")?.addEventListener("click", () => {
      const temp = this.currentFrom;
      this.currentFrom = this.currentTo;
      this.currentTo = temp;

      fromSelect.value = this.currentFrom;
      toSelect.value = this.currentTo;

      // Animate swap button
      const btn = modal.querySelector("#btn-swap-currency");
      if (btn) {
        btn.classList.add("is-swapping");
        setTimeout(() => btn.classList.remove("is-swapping"), 300);
      }

      this.updateModalState();
    });

    // Preset Chips
    modal.querySelectorAll(".preset-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const amt = Number(chip.dataset.amount);
        if (amt && amountInput) {
          amountInput.value = amt;
          this.currentAmount = amt;
          this.recalculate();
          this.updatePresetChips();
        }
      });
    });

    // Refresh Rates Button
    modal.querySelector("#btn-refresh-rates")?.addEventListener("click", async () => {
      const spinner = modal.querySelector("#refresh-spinner-icon");
      if (spinner) spinner.classList.add("spin");
      await CurrencyService.syncLiveRates(true);
      if (spinner) spinner.classList.remove("spin");
      this.updateModalState();
      if (window.UI && typeof window.UI.showToast === "function") {
        window.UI.showToast("Exchange rates updated to latest live market figures!", "success");
      }
    });

    // Apply as Website Currency
    modal.querySelector("#btn-apply-as-site-currency")?.addEventListener("click", () => {
      CurrencyService.setPreferredCurrency(this.currentTo);
      this.closeModal();
      if (window.UI && typeof window.UI.showToast === "function") {
        window.UI.showToast(`Display currency set to ${this.currentTo} (${CurrencyService.currencies[this.currentTo]?.symbol || ''}) across all destinations.`, "success");
      }
    });

    // Listen to rates update event
    window.addEventListener("currency-rates-updated", () => {
      if (modal.classList.contains("active")) {
        this.updateModalState();
      }
    });
  },

  updatePresetChips() {
    if (!this.modalEl) return;
    this.modalEl.querySelectorAll(".preset-chip").forEach(chip => {
      const val = Number(chip.dataset.amount);
      chip.classList.toggle("active", val === this.currentAmount);
    });
  },

  updateModalState() {
    if (!this.modalEl) return;

    // Update flags & symbols
    const fromCurr = CurrencyService.currencies[this.currentFrom] || { flag: "🌐", symbol: "$" };
    const toCurr = CurrencyService.currencies[this.currentTo] || { flag: "🌐", symbol: "₹" };

    const fromFlag = this.modalEl.querySelector("#converter-from-flag");
    const toFlag = this.modalEl.querySelector("#converter-to-flag");
    const fromSymbol = this.modalEl.querySelector("#converter-from-symbol");
    const applyBtnCode = this.modalEl.querySelector("#converter-apply-target-code");

    if (fromFlag) fromFlag.textContent = fromCurr.flag;
    if (toFlag) toFlag.textContent = toCurr.flag;
    if (fromSymbol) fromSymbol.textContent = fromCurr.symbol;
    if (applyBtnCode) applyBtnCode.textContent = this.currentTo;

    // Update status indicator
    this.updateStatusBadge();

    // Recalculate result
    this.recalculate();
  },

  updateStatusBadge() {
    if (!this.modalEl) return;
    const meta = CurrencyService.getRateStatusMeta();
    const liveIndicator = this.modalEl.querySelector("#converter-live-indicator");
    const statusText = this.modalEl.querySelector("#converter-status-text");
    const alertBanner = this.modalEl.querySelector("#converter-alert-banner");
    const alertMsg = this.modalEl.querySelector("#converter-alert-msg");
    const timestampLabel = this.modalEl.querySelector("#converter-timestamp-label");

    if (meta.isLive) {
      if (liveIndicator) {
        liveIndicator.className = "converter-live-pill is-live";
      }
      if (statusText) statusText.textContent = "Live Exchange Rates";
      if (alertBanner) alertBanner.style.display = "none";
    } else if (meta.isCached) {
      if (liveIndicator) {
        liveIndicator.className = "converter-live-pill is-cached";
      }
      if (statusText) statusText.textContent = "Cached Rates (Network Standby)";
      if (alertBanner) {
        alertBanner.style.display = "flex";
        if (alertMsg) alertMsg.textContent = `Live rate provider unreachable. Using saved rates from ${meta.lastUpdatedFormatted}. Real-time market rates may differ slightly.`;
      }
    } else {
      if (liveIndicator) {
        liveIndicator.className = "converter-live-pill is-offline";
      }
      if (statusText) statusText.textContent = "Offline Fallback Rates";
      if (alertBanner) {
        alertBanner.style.display = "flex";
        if (alertMsg) alertMsg.textContent = "Could not reach live rate provider. Showing verified standard baseline conversions.";
      }
    }

    if (timestampLabel) {
      timestampLabel.textContent = meta.lastUpdatedFormatted || "Just now";
    }
  },

  recalculate() {
    if (!this.modalEl) return;
    const details = CurrencyService.convertDetailed(this.currentAmount, this.currentFrom, this.currentTo);

    const primaryDisplay = this.modalEl.querySelector("#converter-primary-display");
    const formulaDisplay = this.modalEl.querySelector("#converter-rate-formula");
    const inverseDisplay = this.modalEl.querySelector("#converter-inverse-formula");

    if (primaryDisplay) {
      primaryDisplay.innerHTML = `
        <span class="result-number">${details.toFormatted}</span>
        <span class="result-code">${details.toCurrency}</span>
      `;
    }

    if (formulaDisplay) formulaDisplay.textContent = details.rateFormula;
    if (inverseDisplay) inverseDisplay.textContent = details.inverseFormula;
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
  window.CurrencyConverterUI = CurrencyConverterUI;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { CurrencyService, CurrencyConverterUI };
}
