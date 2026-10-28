/**
 * Wayvora - UI Helpers & Component Renderers
 * Provides SVG icon generators, Toast notifications, Modal handlers, and Card rendering.
 */

const UI = {
  // Collection of SVG icons (Feather / Lucide style)
  icons: {
    compass: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>`,
    mapPin: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`,
    calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
    heart: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
    heartFilled: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
    search: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
    star: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    dollar: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
    clock: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    plus: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    trash: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
    chevronRight: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`,
    x: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    printer: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>`,
    sun: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
    info: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
    sparkles: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>`,
    menu: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`
  },

  // Toast notification manager
  showToast(message, type = "info", duration = 3200) {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type} animate-slide-up`;
    
    let iconSvg = this.icons.info;
    if (type === "success") iconSvg = this.icons.check;
    if (type === "heart") iconSvg = this.icons.heartFilled;

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-message">${message}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("fade-out");
      setTimeout(() => {
        if (toast.parentElement) {
          toast.parentElement.removeChild(toast);
        }
      }, 300);
    }, duration);
  },

  // Render a standard destination card
  renderDestinationCard(destination, options = {}) {
    const isFav = AppState.isFavourite(destination.id);
    const isIndia = destination.id === "india";
    const card = document.createElement("div");
    card.className = `dest-card animate-fade-in ${isIndia ? 'dest-card-major-india' : ''}`;
    card.dataset.id = destination.id;

    card.innerHTML = `
      <div class="dest-card-media">
        <img 
          src="${destination.cardImage}" 
          alt="${destination.name}, ${destination.country}"
          loading="lazy"
          onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';"
        />
        <div class="dest-card-overlay"></div>
        <div class="dest-card-badges">
          ${isIndia ? `<span class="badge badge-india-tri">Major Destination</span>` : `<span class="badge badge-glass badge-region">${destination.region}</span>`}
          ${destination.trending && !isIndia ? `<span class="badge badge-trending">${UI.icons.sparkles} Trending</span>` : ""}
          ${isIndia ? `<span class="badge badge-glass">64 Destinations</span>` : ""}
          <button class="badge badge-glass badge-card-weather" data-id="${destination.id}" title="Check live weather forecast">
            ☀️ ${destination.weather ? destination.weather.temp : '22°C'}
          </button>
        </div>
        <button 
          class="btn-fav-toggle ${isFav ? 'active' : ''}" 
          data-id="${destination.id}" 
          title="${isFav ? 'Remove from favourites' : 'Save to favourites'}"
          aria-label="${isFav ? 'Remove from favourites' : 'Save to favourites'}"
        >
          ${isFav ? UI.icons.heartFilled : UI.icons.heart}
        </button>
      </div>

      <div class="dest-card-body">
        <div class="dest-card-header">
          <div class="dest-card-title-group">
            <h3 class="dest-card-title">${destination.name}</h3>
            <span class="dest-card-country">${UI.icons.mapPin} ${isIndia ? 'Asia' : destination.country}</span>
          </div>
          <div class="dest-card-rating">
            ${UI.icons.star}
            <span class="rating-val">${destination.rating.toFixed(1)}</span>
            <span class="rating-count">(${destination.reviewsCount})</span>
          </div>
        </div>

        <p class="dest-card-desc">${destination.shortDescription}</p>

        <div class="dest-card-meta">
          <div class="meta-item" title="Best Season: ${destination.seasonTag}">
            ${UI.icons.calendar}
            <span>${destination.bestTimeToVisit}</span>
          </div>
          <div class="meta-item meta-budget" title="Estimated daily cost">
            ${UI.icons.dollar}
            <span>~ ${window.CurrencyService ? CurrencyService.getDisplayBudget(destination).formatted : `\$${destination.dailyBudgetEstimated}`} / day</span>
          </div>
        </div>

        <div class="dest-card-tags">
          ${destination.tags.slice(0, 3).map(t => `<span class="tag-pill">${t}</span>`).join("")}
        </div>

        <div class="dest-card-actions">
          <button class="btn btn-primary btn-sm btn-view-details" data-id="${destination.id}">
            Explore ${destination.name} →
          </button>
          <button class="btn btn-outline btn-sm btn-quick-plan" data-id="${destination.id}" title="Plan a trip to ${destination.name}">
            ${UI.icons.plus} Plan a Trip
          </button>
        </div>
      </div>
    `;

    // Event listener for live weather badge on card
    const weatherBtn = card.querySelector(".badge-card-weather");
    if (weatherBtn) {
      weatherBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (window.WeatherUI) {
          window.WeatherUI.openWeatherModal(destination.id);
        }
      });
    }

    // Event listener for favorite button (Requires Authentication)
    const favBtn = card.querySelector(".btn-fav-toggle");
    favBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (window.AuthService) {
        AuthService.requireAuth(() => {
          const isNowFav = AppState.toggleFavourite(destination.id);
          favBtn.classList.toggle("active", isNowFav);
          favBtn.innerHTML = isNowFav ? UI.icons.heartFilled : UI.icons.heart;
          favBtn.title = isNowFav ? "Remove from favourites" : "Save to favourites";
          UI.showToast(
            isNowFav ? `Saved ${destination.name} to favourites` : `Removed ${destination.name} from favourites`,
            isNowFav ? "heart" : "info"
          );
        }, {
          type: "favourite",
          destinationId: destination.id,
          label: `save ${destination.name} to your favourites`
        });
      } else {
        const isNowFav = AppState.toggleFavourite(destination.id);
        favBtn.classList.toggle("active", isNowFav);
        favBtn.innerHTML = isNowFav ? UI.icons.heartFilled : UI.icons.heart;
      }
    });

    // Handle card click / open: if India, open dedicated India travel page; otherwise open destination details page
    const handleCardClick = () => {
      if (isIndia) {
        window.location.hash = "#india";
      } else {
        window.location.hash = `#destination-${destination.id}`;
      }
    };

    // Event listener for view details
    const detailsBtn = card.querySelector(".btn-view-details");
    detailsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      handleCardClick();
    });

    // Event listener for clicking anywhere on the card header/image or body
    card.querySelector(".dest-card-media").addEventListener("click", handleCardClick);
    card.querySelector(".dest-card-title").addEventListener("click", handleCardClick);
    card.addEventListener("click", (e) => {
      if (e.target.closest("button") || e.target.closest("a")) return;
      handleCardClick();
    });

    // Event listener for quick plan (Opens Trip Planner form directly)
    const planBtn = card.querySelector(".btn-quick-plan");
    planBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      UI.openTripModalWithDestination(destination.id);
    });

    return card;
  },

  // Render a specific Indian destination card (State, UT, City, Tourist Place)
  renderIndiaCard(item) {
    const isFav = AppState.isFavourite(item.id);
    const card = document.createElement("div");
    card.className = "dest-card india-catalog-card animate-fade-in";
    card.dataset.id = item.id;
    card.dataset.category = item.category;
    card.dataset.zone = item.zone;

    let catClass = "badge-cat-state";
    let catLabel = item.categoryLabel || "State";
    if (item.category === "ut") {
      catClass = "badge-cat-ut";
      catLabel = "Union Territory";
    } else if (item.category === "city") {
      catClass = "badge-cat-city";
      catLabel = "Popular City";
    } else if (item.category === "tourist_place") {
      catClass = "badge-cat-place";
      catLabel = "Tourist Landmark";
    }

    card.innerHTML = `
      <div class="dest-card-media">
        <img 
          src="${item.image}" 
          alt="${item.name}"
          loading="lazy"
          onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';"
        />
        <div class="dest-card-overlay"></div>
        <div class="dest-card-badges">
          <span class="badge ${catClass}">${catLabel}</span>
          <span class="badge badge-glass badge-zone">${item.zone}</span>
          <button class="badge badge-glass badge-card-weather" data-id="${item.id}" title="Click to view live Open-Meteo weather forecast">
            ☀️ Weather
          </button>
        </div>
        <button 
          class="btn-fav-toggle ${isFav ? 'active' : ''}" 
          data-id="${item.id}" 
          title="${isFav ? 'Remove from favourites' : 'Save to favourites'}"
          aria-label="${isFav ? 'Remove from favourites' : 'Save to favourites'}"
        >
          ${isFav ? UI.icons.heartFilled : UI.icons.heart}
        </button>
      </div>

      <div class="dest-card-body">
        <div class="dest-card-header">
          <div class="dest-card-title-group">
            <h3 class="dest-card-title">${item.name}</h3>
            <span class="dest-card-country">${UI.icons.mapPin} ${item.zone} India</span>
          </div>
        </div>

        <p class="dest-card-desc">${item.shortDescription}</p>

        <div class="dest-card-meta">
          <div class="meta-item" title="Optimal Visiting Season">
            ${UI.icons.calendar}
            <span>${item.bestTimeToVisit}</span>
          </div>
          <div class="meta-item meta-budget" title="Estimated daily cost">
            ${UI.icons.dollar}
            <span>~ ${window.CurrencyService ? CurrencyService.getDisplayBudget(item).formatted : '₹4,000'} / day</span>
          </div>
        </div>

        <div class="dest-card-tags">
          ${(item.tags || []).slice(0, 3).map(t => `<span class="tag-pill">${t}</span>`).join("")}
        </div>

        <div class="dest-card-actions">
          <button class="btn btn-primary btn-sm btn-view-india-details" data-id="${item.id}">
            Explore ${item.name} →
          </button>
          <button class="btn btn-outline btn-sm btn-india-quick-plan" data-id="${item.id}" title="Plan a trip to ${item.name}">
            ${UI.icons.plus} Plan a Trip
          </button>
        </div>
      </div>
    `;

    // Live weather button
    card.querySelector(".badge-card-weather")?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (window.WeatherUI) {
        window.WeatherUI.openWeatherModal(item.id);
      }
    });

    // Favorite button (Requires Authentication)
    const favBtn = card.querySelector(".btn-fav-toggle");
    favBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (window.AuthService) {
        AuthService.requireAuth(() => {
          const isNowFav = AppState.toggleFavourite(item.id);
          favBtn.classList.toggle("active", isNowFav);
          favBtn.innerHTML = isNowFav ? UI.icons.heartFilled : UI.icons.heart;
          favBtn.title = isNowFav ? "Remove from favourites" : "Save to favourites";
          UI.showToast(
            isNowFav ? `Saved ${item.name} to favourites` : `Removed ${item.name} from favourites`,
            isNowFav ? "heart" : "info"
          );
        }, {
          type: "favourite",
          destinationId: item.id,
          label: `save ${item.name} to your favourites`
        });
      } else {
        const isNowFav = AppState.toggleFavourite(item.id);
        favBtn.classList.toggle("active", isNowFav);
        favBtn.innerHTML = isNowFav ? UI.icons.heartFilled : UI.icons.heart;
      }
    });

    // View details handlers
    const openDetail = () => UI.openIndiaDetailModal(item);
    card.querySelector(".btn-view-india-details")?.addEventListener("click", (e) => {
      e.stopPropagation();
      openDetail();
    });
    card.querySelector(".dest-card-media")?.addEventListener("click", openDetail);
    card.querySelector(".dest-card-title")?.addEventListener("click", openDetail);

    // Plan trip (Opens Trip Planner form directly)
    card.querySelector(".btn-india-quick-plan")?.addEventListener("click", (e) => {
      e.stopPropagation();
      UI.openTripModalWithDestination(item.id);
    });

    return card;
  },

  // Navigate to dedicated destination details page
  openDestinationPage(destinationId) {
    if (destinationId === "india") {
      window.location.hash = "#india";
      return;
    }
    window.location.hash = `#destination-${destinationId}`;
  },

  // Open Destination Details Modal
  openDestinationModal(destinationId) {
    if (destinationId && (destinationId.startsWith("in-") || (window.IndiaDataService && window.IndiaDataService.getById(destinationId)))) {
      const inDest = window.IndiaDataService ? window.IndiaDataService.getById(destinationId) : null;
      if (inDest) {
        return this.openIndiaDetailModal(inDest);
      }
    }

    const dest = DataService.getDestinationById(destinationId);
    if (!dest) return;

    let modal = document.getElementById("dest-details-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "dest-details-modal";
      modal.className = "modal-overlay";
      document.body.appendChild(modal);
    }

    const isFav = AppState.isFavourite(dest.id);
    const displayBudget = window.CurrencyService ? CurrencyService.getDisplayBudget(dest) : { formatted: `\$${dest.dailyBudgetEstimated}`, isConverted: false, currency: "USD" };
    const breakdown = window.CurrencyService ? CurrencyService.getDisplayBreakdown(dest) : dest.budgetBreakdown;

    modal.innerHTML = `
      <div class="modal-dialog modal-lg animate-scale-up" role="dialog" aria-modal="true">
        <button class="modal-close-btn" id="modal-close-btn" aria-label="Close modal">
          ${UI.icons.x}
        </button>

        <div class="modal-hero">
          <img 
            src="${dest.heroImage}" 
            alt="${dest.name}" 
            onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';"
          />
          <div class="modal-hero-gradient"></div>
          <div class="modal-hero-content">
            <div class="modal-hero-badges">
              <span class="badge badge-primary">${dest.region}</span>
              <span class="badge badge-glass">${dest.seasonTag}</span>
              <span class="badge badge-glass">${dest.budgetLevel} Budget</span>
            </div>
            <h1 class="modal-hero-title">${dest.name}, <span class="country-sub">${dest.country}</span></h1>
            <p class="modal-hero-tagline">${dest.tagline}</p>
          </div>
        </div>

        <div class="modal-scroll-content">
          <!-- Quick Bar -->
          <div class="modal-quick-bar">
            <div class="quick-bar-item">
              <span class="q-label">Rating</span>
              <span class="q-val">${UI.icons.star} ${dest.rating.toFixed(2)} (${dest.reviewsCount} reviews)</span>
            </div>
            <div class="quick-bar-item">
              <span class="q-label">Best Time</span>
              <span class="q-val">${UI.icons.calendar} ${dest.bestTimeToVisit}</span>
            </div>
            <div class="quick-bar-item quick-bar-weather-trigger" data-dest-id="${dest.id}" role="button" tabindex="0" title="Click to view full 5-day live weather forecast">
              <span class="q-label">Current Climate (Live)</span>
              <span class="q-val highlight-weather">
                ${UI.icons.sun} ${dest.weather.temp} • ${dest.weather.condition} 
                <span class="pill-live-mini">View Forecast</span>
              </span>
            </div>
            <div class="quick-bar-item">
              <span class="q-label">Est. Daily Budget</span>
              <span class="q-val highlight">${displayBudget.formatted} / person</span>
            </div>
          </div>

          <!-- Overview Section -->
          <div class="modal-section">
            <h3 class="section-subtitle">Overview</h3>
            <p class="section-lead">${dest.fullOverview}</p>
            <div class="tags-cloud mt-3">
              ${dest.tags.map(t => `<span class="tag-pill tag-lg">${t}</span>`).join("")}
            </div>
          </div>

          <!-- Top Attractions -->
          <div class="modal-section">
            <div class="section-header-flex">
              <div>
                <h3 class="section-subtitle">Top Attractions</h3>
                <p class="text-muted">Must-see landmarks and experiences in ${dest.name}</p>
              </div>
              <span class="badge badge-outline">${dest.topAttractions.length} Curated Sights</span>
            </div>

            <div class="attractions-grid">
              ${dest.topAttractions.map(attr => `
                <div class="attraction-card">
                  <div class="attraction-media">
                    <img 
                      src="${attr.image}" 
                      alt="${attr.name}" 
                      loading="lazy"
                      onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80';"
                    />
                    <span class="attraction-category">${attr.category}</span>
                  </div>
                  <div class="attraction-details">
                    <h4>${attr.name}</h4>
                    <p class="attraction-desc">${attr.description}</p>
                    <div class="attraction-footer">
                      <span class="duration-badge">${UI.icons.clock} ${attr.duration}</span>
                      <button 
                        class="btn-add-attr-to-trip" 
                        data-dest-id="${dest.id}" 
                        data-attr-name="${attr.name.replace(/"/g, '&quot;')}"
                        data-attr-category="${attr.category}"
                        title="Add to Itinerary"
                      >
                        ${UI.icons.plus} Add to Trip
                      </button>
                    </div>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Things to Do & Experiences -->
          <div class="modal-section">
            <h3 class="section-subtitle">Things to Do & Local Experiences</h3>
            <div class="things-todo-grid">
              ${dest.thingsToDo.map(thing => `
                <div class="todo-item">
                  <span class="todo-icon">${UI.icons.compass}</span>
                  <span>${thing}</span>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Estimated Budget & Weather Breakdown -->
          <div class="modal-section grid-2-col">
            <div class="budget-card">
              <div class="section-header-flex" style="margin-bottom: 0.5rem;">
                <h4 class="card-heading" style="margin-bottom: 0;">${UI.icons.dollar} Daily Budget Breakdown</h4>
                ${displayBudget.isConverted ? `<span class="badge badge-outline" style="font-size:0.72rem;">Converted to ${displayBudget.currency}</span>` : `<span class="badge badge-glass" style="font-size:0.72rem;">Native ${displayBudget.currency}</span>`}
              </div>
              <p class="text-sm text-muted">Estimated per person per day (${displayBudget.currency})</p>
              <div class="budget-rows">
                <div class="b-row">
                  <span>Accommodation (Mid-range)</span>
                  <strong>${breakdown.accommodation}</strong>
                </div>
                <div class="b-row">
                  <span>Food & Dining</span>
                  <strong>${breakdown.food}</strong>
                </div>
                <div class="b-row">
                  <span>Local Transit</span>
                  <strong>${breakdown.transport}</strong>
                </div>
                <div class="b-row">
                  <span>Sightseeing & Activities</span>
                  <strong>${breakdown.activities}</strong>
                </div>
                <div class="b-row" style="border-top: 1px dashed var(--border-color); padding-top: 0.5rem; margin-top: 0.25rem;">
                  <span><strong>Total Estimated / Day</strong></span>
                  <strong class="highlight" style="font-size: 1.05rem;">${displayBudget.formatted}</strong>
                </div>
              </div>
            </div>

            <div class="tips-card">
              <h4 class="card-heading">${UI.icons.info} Essential Travel Tips</h4>
              <ul class="travel-tips-list">
                ${dest.travelTips.map(tip => `<li>${tip}</li>`).join("")}
              </ul>
            </div>
          </div>

          <!-- Sticky Action Bar at Bottom of Modal -->
          <div class="modal-action-bar">
            <button class="btn btn-outline btn-modal-fav ${isFav ? 'active' : ''}" id="modal-fav-btn">
              ${isFav ? UI.icons.heartFilled : UI.icons.heart}
              <span id="modal-fav-text">${isFav ? 'Saved in Favourites' : 'Add to Favourites'}</span>
            </button>
            <button class="btn btn-primary btn-lg" id="modal-plan-btn">
              ${UI.icons.plus} Plan Trip to ${dest.name}
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    // Close handlers
    const closeBtn = modal.querySelector("#modal-close-btn");
    const closeModal = () => {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    };

    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    // Escape key closes modal
    const escHandler = (e) => {
      if (e.key === "Escape") {
        closeModal();
        window.removeEventListener("keydown", escHandler);
      }
    };
    window.addEventListener("keydown", escHandler);

    // Favorite button inside modal (Requires Authentication)
    const favBtn = modal.querySelector("#modal-fav-btn");
    favBtn.addEventListener("click", () => {
      if (window.AuthService) {
        AuthService.requireAuth(() => {
          const isNowFav = AppState.toggleFavourite(dest.id);
          favBtn.classList.toggle("active", isNowFav);
          favBtn.innerHTML = `
            ${isNowFav ? UI.icons.heartFilled : UI.icons.heart}
            <span id="modal-fav-text">${isNowFav ? 'Saved in Favourites' : 'Add to Favourites'}</span>
          `;
          UI.showToast(
            isNowFav ? `Saved ${dest.name} to favourites` : `Removed ${dest.name} from favourites`,
            isNowFav ? "heart" : "info"
          );
          // Sync cards in view
          document.querySelectorAll(`.btn-fav-toggle[data-id="${dest.id}"]`).forEach(btn => {
            btn.classList.toggle("active", isNowFav);
            btn.innerHTML = isNowFav ? UI.icons.heartFilled : UI.icons.heart;
          });
        }, {
          type: "favourite",
          destinationId: dest.id,
          label: `save ${dest.name} to your favourites`
        });
      } else {
        const isNowFav = AppState.toggleFavourite(dest.id);
        favBtn.classList.toggle("active", isNowFav);
      }
    });

    // Live Weather Trigger in Modal
    modal.querySelector(".quick-bar-weather-trigger")?.addEventListener("click", () => {
      closeModal();
      if (window.WeatherUI) {
        window.WeatherUI.openWeatherModal(dest.id);
      }
    });

    // Plan Trip CTA in modal (Opens Trip Planner form directly)
    modal.querySelector("#modal-plan-btn").addEventListener("click", () => {
      closeModal();
      UI.openTripModalWithDestination(dest.id);
    });

    // Quick add attraction buttons (Requires Authentication)
    modal.querySelectorAll(".btn-add-attr-to-trip").forEach(btn => {
      btn.addEventListener("click", (e) => {
        if (window.AuthService) {
          AuthService.requireAuth(() => {
            const attrName = btn.dataset.attrName;
            const attrCat = btn.dataset.attrCategory;
            UI.addAttractionToCurrentTrip(dest, attrName, attrCat);
          }, {
            type: "plan_trip",
            destinationId: dest.id,
            label: `add attractions to your trip`
          });
        } else {
          const attrName = btn.dataset.attrName;
          const attrCat = btn.dataset.attrCategory;
          UI.addAttractionToCurrentTrip(dest, attrName, attrCat);
        }
      });
    });
  },

  // Open Dedicated India Destination Details Modal
  async openIndiaDetailModal(dest) {
    if (!dest) return;
    let modal = document.getElementById("india-detail-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "india-detail-modal";
      modal.className = "modal-overlay";
      document.body.appendChild(modal);
    }

    const isFav = AppState.isFavourite(dest.id);
    const displayBudget = window.CurrencyService ? CurrencyService.getDisplayBudget(dest) : { formatted: `₹${dest.dailyBudgetEstimated || 4000}`, isConverted: false, currency: "INR" };
    const breakdown = window.CurrencyService ? CurrencyService.getDisplayBreakdown(dest) : (dest.budgetBreakdown || {
      accommodation: "₹1,800 - ₹3,200",
      food: "₹800 - ₹1,400",
      transport: "₹400 - ₹800",
      activities: "₹500 - ₹1,200"
    });

    let catClass = "badge-cat-state";
    let catLabel = dest.categoryLabel || "State";
    if (dest.category === "ut") {
      catClass = "badge-cat-ut";
      catLabel = "Union Territory";
    } else if (dest.category === "city") {
      catClass = "badge-cat-city";
      catLabel = "Popular City";
    } else if (dest.category === "tourist_place") {
      catClass = "badge-cat-place";
      catLabel = "Tourist Landmark";
    }

    modal.innerHTML = `
      <div class="modal-dialog modal-lg animate-scale-up" role="dialog" aria-modal="true">
        <button class="modal-close-btn" id="india-modal-close-btn" aria-label="Close modal">
          ${UI.icons.x}
        </button>

        <div class="modal-hero">
          <img 
            src="${dest.image}" 
            alt="${dest.name}" 
            onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';"
          />
          <div class="modal-hero-gradient"></div>
          <div class="modal-hero-content">
            <div class="modal-hero-badges">
              <span class="badge ${catClass}">${catLabel}</span>
              <span class="badge badge-glass">${dest.zone} India</span>
              <span class="badge badge-india-tri">India</span>
            </div>
            <h1 class="modal-hero-title">${dest.name}</h1>
            <p class="modal-hero-tagline">${dest.shortDescription}</p>
          </div>
        </div>

        <div class="modal-scroll-content">
          <!-- Quick Bar -->
          <div class="modal-quick-bar">
            <div class="quick-bar-item">
              <span class="q-label">Category</span>
              <span class="q-val">${catLabel}</span>
            </div>
            <div class="quick-bar-item">
              <span class="q-label">Region / Zone</span>
              <span class="q-val">${dest.zone} India</span>
            </div>
            <div class="quick-bar-item">
              <span class="q-label">Best Time to Visit</span>
              <span class="q-val">${UI.icons.calendar} ${dest.bestTimeToVisit}</span>
            </div>
            <div class="quick-bar-item quick-bar-weather-trigger" id="india-modal-weather-jump" role="button" tabindex="0" title="Click to view live weather forecast">
              <span class="q-label">Live Climate</span>
              <span class="q-val highlight-weather">
                ${UI.icons.sun} <span id="india-modal-quick-temp">Checking...</span>
                <span class="pill-live-mini">Live Feed</span>
              </span>
            </div>
            <div class="quick-bar-item">
              <span class="q-label">Est. Daily Budget</span>
              <span class="q-val highlight">${displayBudget.formatted} / person</span>
            </div>
          </div>

          <!-- Overview Section -->
          <div class="modal-section">
            <h3 class="section-subtitle">Overview</h3>
            <p class="section-lead">${dest.fullOverview || dest.shortDescription}</p>
            <div class="tags-cloud mt-3">
              ${(dest.tags || []).map(t => `<span class="tag-pill tag-lg">${t}</span>`).join("")}
            </div>
          </div>

          <!-- Top Attractions Section -->
          ${dest.topAttractions && dest.topAttractions.length > 0 ? `
            <div class="modal-section">
              <div class="section-header-flex">
                <div>
                  <h3 class="section-subtitle">Top Attractions</h3>
                  <p class="text-muted">Must-see sights and experiences in ${dest.name}</p>
                </div>
                <span class="badge badge-outline">${dest.topAttractions.length} Curated Sights</span>
              </div>

              <div class="attractions-grid">
                ${dest.topAttractions.map(attr => `
                  <div class="attraction-card">
                    <div class="attraction-media">
                      <img 
                        src="${attr.image}" 
                        alt="${attr.name}" 
                        loading="lazy"
                        onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80';"
                      />
                    </div>
                    <div class="attraction-details">
                      <h4>${attr.name}</h4>
                      <p class="attraction-desc">${attr.description}</p>
                      <div class="attraction-footer">
                        <span class="duration-badge">${UI.icons.clock} ${attr.duration || '2 - 3 Hours'}</span>
                        <button 
                          class="btn-add-attr-to-trip" 
                          data-dest-id="${dest.id}" 
                          data-attr-name="${attr.name.replace(/"/g, '&quot;')}"
                          title="Add to Itinerary"
                        >
                          ${UI.icons.plus} Add to Trip
                        </button>
                      </div>
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>
          ` : ''}

          <!-- Estimated Daily Budget Breakdown -->
          <div class="modal-section">
            <div class="budget-card">
              <div class="section-header-flex" style="margin-bottom: 0.5rem;">
                <h4 class="card-heading" style="margin-bottom: 0;">${UI.icons.dollar} Daily Budget Breakdown</h4>
                ${displayBudget.isConverted ? `<span class="badge badge-outline" style="font-size:0.72rem;">Converted to ${displayBudget.currency}</span>` : `<span class="badge badge-glass" style="font-size:0.72rem;">Native ${displayBudget.currency}</span>`}
              </div>
              <p class="text-sm text-muted">Estimated per person per day (${displayBudget.currency})</p>
              <div class="budget-rows">
                <div class="b-row">
                  <span>Accommodation (Mid-range)</span>
                  <strong>${breakdown.accommodation}</strong>
                </div>
                <div class="b-row">
                  <span>Food & Dining</span>
                  <strong>${breakdown.food}</strong>
                </div>
                <div class="b-row">
                  <span>Local Transit</span>
                  <strong>${breakdown.transport}</strong>
                </div>
                <div class="b-row">
                  <span>Sightseeing & Activities</span>
                  <strong>${breakdown.activities}</strong>
                </div>
                <div class="b-row" style="border-top: 1px dashed var(--border-color); padding-top: 0.5rem; margin-top: 0.25rem;">
                  <span><strong>Total Estimated / Day</strong></span>
                  <strong class="highlight" style="font-size: 1.05rem;">${displayBudget.formatted}</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- Best Time & Travel Tips Grid -->
          <div class="modal-two-col-grid">
            <div class="modal-section">
              <h3 class="section-subtitle">Best Time to Visit</h3>
              <div class="best-time-box">
                <div class="season-badge-lg">${UI.icons.calendar} ${dest.bestTimeToVisit}</div>
                <p class="text-muted mt-2">Optimal climatic conditions for sightseeing, cultural festivals, outdoor exploration, and photography.</p>
              </div>
            </div>

            <div class="modal-section">
              <h3 class="section-subtitle">Curated Travel Tips</h3>
              <ul class="travel-tips-list">
                ${(dest.travelTips || ["Pre-book tickets for popular monuments online", "Respect local customs and dress codes at religious sites", "Keep digital copies of IDs and permits"]).map(tip => `
                  <li>
                    <span class="tip-icon">${UI.icons.check}</span>
                    <span>${tip}</span>
                  </li>
                `).join("")}
              </ul>
            </div>
          </div>

          <!-- Connected Live Weather Section (Open-Meteo API) -->
          <div class="modal-section" id="india-modal-weather-section">
            <div class="section-header-flex">
              <div>
                <h3 class="section-subtitle">Live Weather Updates</h3>
                <p class="text-muted">Real-time atmospheric forecast for ${dest.name} powered by Open-Meteo API</p>
              </div>
              <div class="weather-unit-toggle">
                <button class="unit-btn active" id="india-unit-c-btn">°C</button>
                <button class="unit-btn" id="india-unit-f-btn">°F</button>
              </div>
            </div>

            <div id="india-weather-container" class="india-weather-box mt-3">
              <div class="weather-loading-state">
                <div class="spinner"></div>
                <p>Connecting to Open-Meteo satellite feed for ${dest.name} coordinates...</p>
              </div>
            </div>
          </div>

          <!-- Bottom Actions -->
          <div class="modal-footer-actions">
            <button class="btn btn-outline" id="btn-india-modal-fav" data-id="${dest.id}">
              ${isFav ? UI.icons.heartFilled : UI.icons.heart}
              <span id="btn-india-fav-text">${isFav ? 'Saved in Favourites' : 'Save to Favourites'}</span>
            </button>
            <button class="btn btn-primary" id="btn-india-modal-plan" data-id="${dest.id}">
              ${UI.icons.plus} Plan Trip to ${dest.name}
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    // Close handlers
    const closeModal = () => {
      modal.classList.remove("active");
      document.body.style.overflow = "";
      window.removeEventListener("keydown", escHandler);
    };

    const escHandler = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", escHandler);

    modal.querySelector("#india-modal-close-btn")?.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    // Favorite toggle button (Requires Authentication)
    const favBtn = modal.querySelector("#btn-india-modal-fav");
    const favText = modal.querySelector("#btn-india-fav-text");
    favBtn?.addEventListener("click", () => {
      if (window.AuthService) {
        AuthService.requireAuth(() => {
          const isNowFav = AppState.toggleFavourite(dest.id);
          favBtn.classList.toggle("active", isNowFav);
          favBtn.innerHTML = `
            ${isNowFav ? UI.icons.heartFilled : UI.icons.heart}
            <span id="btn-india-fav-text">${isNowFav ? 'Saved in Favourites' : 'Save to Favourites'}</span>
          `;
          UI.showToast(
            isNowFav ? `Saved ${dest.name} to favourites` : `Removed ${dest.name} from favourites`,
            isNowFav ? "heart" : "info"
          );
          document.querySelectorAll(`.btn-fav-toggle[data-id="${dest.id}"]`).forEach(btn => {
            btn.classList.toggle("active", isNowFav);
            btn.innerHTML = isNowFav ? UI.icons.heartFilled : UI.icons.heart;
          });
        }, {
          type: "favourite",
          destinationId: dest.id,
          label: `save ${dest.name} to your favourites`
        });
      } else {
        const isNowFav = AppState.toggleFavourite(dest.id);
        favBtn.classList.toggle("active", isNowFav);
      }
    });

    // Plan trip CTA (Opens Trip Planner form directly)
    modal.querySelector("#btn-india-modal-plan")?.addEventListener("click", () => {
      closeModal();
      UI.openTripModalWithDestination(dest.id);
    });

    // Quick add attraction buttons (Requires Authentication)
    modal.querySelectorAll(".btn-add-attr-to-trip").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (window.AuthService) {
          AuthService.requireAuth(() => {
            const attrName = btn.dataset.attrName;
            UI.addAttractionToCurrentTrip(dest, attrName, "Sightseeing");
          }, {
            type: "plan_trip",
            destinationId: dest.id,
            label: `add attractions to your itinerary`
          });
        } else {
          const attrName = btn.dataset.attrName;
          UI.addAttractionToCurrentTrip(dest, attrName, "Sightseeing");
        }
      });
    });

    // Live weather async fetch & render
    let currentUnit = "C";
    const loadWeather = async () => {
      const weatherBox = modal.querySelector("#india-weather-container");
      const quickTemp = modal.querySelector("#india-modal-quick-temp");
      if (!weatherBox) return;

      try {
        const data = await WeatherService.getDestinationWeather(dest.id);
        const iconSvg = WeatherService.getIconSvg(data.icon);
        const advice = WeatherUI.getPackingAdvice ? WeatherUI.getPackingAdvice(data.temp, data.condition) : "Enjoy comfortable sightseeing.";

        const formatTemp = (c) => currentUnit === "F" ? Math.round((c * 9/5) + 32) + "°F" : Math.round(c) + "°C";

        if (quickTemp) {
          quickTemp.textContent = `${formatTemp(data.temp)} • ${data.condition}`;
        }

        weatherBox.innerHTML = `
          <div class="weather-current-showcase animate-fade-in">
            <div class="current-weather-left">
              <div class="weather-big-icon">${iconSvg}</div>
              <div>
                <div class="current-temp-val">${formatTemp(data.temp)}</div>
                <div class="current-condition-text">${data.condition}</div>
                <div class="weather-location-sub">
                  ${dest.name}, India
                  <span class="live-pill ${data.isLive ? 'live' : ''}">${data.isLive ? '● Live Sensor Feed' : '● Seasonal Estimate'}</span>
                </div>
              </div>
            </div>

            <div class="current-weather-metrics">
              <div class="w-metric-card">
                <span class="metric-icon">${WeatherService.icons.droplets}</span>
                <div>
                  <span class="metric-lbl">Humidity</span>
                  <span class="metric-val">${data.humidity}%</span>
                </div>
              </div>
              <div class="w-metric-card">
                <span class="metric-icon">${WeatherService.icons.wind}</span>
                <div>
                  <span class="metric-lbl">Wind</span>
                  <span class="metric-val">${data.wind} km/h</span>
                </div>
              </div>
              <div class="w-metric-card">
                <span class="metric-icon">${WeatherService.icons.sun}</span>
                <div>
                  <span class="metric-lbl">UV Index</span>
                  <span class="metric-val">${data.uv} / 10</span>
                </div>
              </div>
              <div class="w-metric-card">
                <span class="metric-icon">${WeatherService.icons.eye}</span>
                <div>
                  <span class="metric-lbl">Visibility</span>
                  <span class="metric-val">${data.visibility} km</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 5-Day Forecast Grid -->
          <div class="forecast-section mt-4">
            <h4 class="forecast-section-title">5-Day Outlook for ${dest.name}</h4>
            <div class="forecast-cards-row">
              ${(data.forecast || []).map(day => `
                <div class="forecast-card">
                  <span class="forecast-day">${day.dayName}</span>
                  <div class="forecast-icon">${WeatherService.getIconSvg(day.icon)}</div>
                  <div class="forecast-temps">
                    <span class="f-high">${formatTemp(day.maxTemp)}</span>
                    <span class="f-low">${formatTemp(day.minTemp)}</span>
                  </div>
                  <span class="forecast-cond">${day.condition}</span>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Travel Advice -->
          <div class="weather-advice-box mt-3">
            <div class="advice-header">
              ${WeatherService.icons.thermometer}
              <h4>Current Climate & Travel Advice</h4>
            </div>
            <p class="advice-text">${advice}</p>
          </div>
        `;
      } catch (err) {
        weatherBox.innerHTML = `
          <div class="weather-error-box">
            <p>Real-time weather unavailable at the moment.</p>
          </div>
        `;
      }
    };

    // Unit toggle buttons
    const cBtn = modal.querySelector("#india-unit-c-btn");
    const fBtn = modal.querySelector("#india-unit-f-btn");
    cBtn?.addEventListener("click", () => {
      if (currentUnit !== "C") {
        currentUnit = "C";
        cBtn.classList.add("active");
        fBtn.classList.remove("active");
        loadWeather();
      }
    });
    fBtn?.addEventListener("click", () => {
      if (currentUnit !== "F") {
        currentUnit = "F";
        fBtn.classList.add("active");
        cBtn.classList.remove("active");
        loadWeather();
      }
    });

    // Jump to weather
    modal.querySelector("#india-modal-weather-jump")?.addEventListener("click", () => {
      modal.querySelector("#india-modal-weather-section")?.scrollIntoView({ behavior: "smooth" });
    });

    await loadWeather();
  },

  // Open modal / wizard to create or plan trip with specific destination
  openTripModalWithDestination(destinationId) {
    const dest = DataService.getDestinationById(destinationId);
    let modal = document.getElementById("trip-create-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "trip-create-modal";
      modal.className = "modal-overlay";
      document.body.appendChild(modal);
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const fourDaysLater = new Date();
    fourDaysLater.setDate(fourDaysLater.getDate() + 4);
    const endStr = fourDaysLater.toISOString().split("T")[0];

    const allDests = DataService.getAllDestinations();
    const getDestCurrency = (d) => {
      if (window.CurrencyService && d) {
        return CurrencyService.getDestinationCurrency(d);
      }
      return "USD";
    };
    const currentDestCurrency = getDestCurrency(dest || allDests[0]);
    const initialDaily = dest ? (dest.dailyBudgetEstimated || 150) : 150;
    const initialBudget = initialDaily * 4 * 2;

    modal.innerHTML = `
      <div class="modal-dialog modal-md modal-scrollable trip-create-dialog animate-scale-up" role="dialog" aria-modal="true">
        <button class="modal-close-btn" id="trip-create-close-btn" aria-label="Close modal">
          ${UI.icons.x}
        </button>

        <div class="modal-header-simple">
          <div class="icon-circle bg-primary-soft">${UI.icons.compass}</div>
          <div>
            <h3>Plan a New Trip</h3>
            <p class="text-muted text-sm">Create a personalized day-by-day travel itinerary</p>
          </div>
        </div>

        <form id="new-trip-form" class="modal-form">
          <div class="form-group">
            <label for="trip-title-input">Trip Name</label>
            <input 
              type="text" 
              id="trip-title-input" 
              class="form-control" 
              placeholder="e.g. My Dream Vacation" 
              value="${dest ? `${dest.name} Getaway` : 'Summer Holiday'}" 
              required 
            />
          </div>

          <div class="form-group">
            <label for="trip-dest-select">Destination</label>
            <select id="trip-dest-select" class="form-control" required>
              <optgroup label="Featured & Global Destinations">
                ${dest && !allDests.some(d => d.id === dest.id) ? `
                  <option value="${dest.id}" selected>
                    ${dest.name}, India (${dest.categoryLabel || 'Destination'})
                  </option>
                ` : ''}
                ${allDests.map(d => `
                  <option value="${d.id}" ${dest && dest.id === d.id ? 'selected' : ''}>
                    ${d.id === 'india' ? 'India (Asia)' : `${d.name}, ${d.country}`}
                  </option>
                `).join("")}
              </optgroup>
              ${window.IndiaDataService ? `
                <optgroup label="Popular Indian Cities & Tourist Places">
                  ${window.IndiaDataService.getAll().filter(d => d.category === "city" || d.category === "tourist_place").map(d => `
                    <option value="${d.id}" ${dest && dest.id === d.id ? 'selected' : ''}>
                      ${d.name}, India (${d.categoryLabel})
                    </option>
                  `).join("")}
                </optgroup>
              ` : ''}
            </select>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label for="trip-start-date">Start Date</label>
              <input type="date" id="trip-start-date" class="form-control" value="${todayStr}" required />
            </div>
            <div class="form-group">
              <label for="trip-end-date">End Date</label>
              <input type="date" id="trip-end-date" class="form-control" value="${endStr}" required />
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label for="trip-travelers">Travelers</label>
              <input type="number" id="trip-travelers" class="form-control" min="1" max="20" value="2" />
            </div>
            <div class="form-group">
              <label for="trip-budget">Target Budget (<span id="trip-budget-currency-label">${currentDestCurrency}</span>)</label>
              <input type="number" id="trip-budget" class="form-control" min="10" step="50" value="${initialBudget}" />
              <div id="trip-affordability-hint" class="text-xs text-muted mt-1" style="display:flex;align-items:center;gap:0.4rem;flex-wrap:wrap;min-height:20px;"></div>
            </div>
          </div>

          <div class="modal-form-actions">
            <button type="button" class="btn btn-outline" id="btn-cancel-trip">Cancel</button>
            <button type="submit" class="btn btn-primary btn-lg" id="btn-submit-create-trip">🚀 Plan My Trip</button>
          </div>
        </form>
      </div>
    `;

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
    const tripDialog = modal.querySelector(".modal-dialog");
    if (tripDialog) tripDialog.scrollTop = 0;
    modal.scrollTop = 0;

    // Affordability Preview Calculator
    const updateAffordabilityPreview = () => {
      const destSelect = document.getElementById("trip-dest-select");
      const budgetInput = document.getElementById("trip-budget");
      const travelersInput = document.getElementById("trip-travelers");
      const startInput = document.getElementById("trip-start-date");
      const endInput = document.getElementById("trip-end-date");
      const hintEl = document.getElementById("trip-affordability-hint");
      const currencyLabel = document.getElementById("trip-budget-currency-label");
      if (!destSelect || !budgetInput || !hintEl) return;

      const curDest = DataService.getDestinationById(destSelect.value);
      const curCurrency = getDestCurrency(curDest);
      if (currencyLabel) currencyLabel.textContent = curCurrency;

      const travelers = Math.max(1, parseInt(travelersInput?.value || 1, 10));
      const sDate = new Date(startInput?.value || Date.now());
      const eDate = new Date(endInput?.value || Date.now());
      let days = 4;
      if (!isNaN(sDate.getTime()) && !isNaN(eDate.getTime()) && eDate >= sDate) {
        days = Math.max(1, Math.round((eDate - sDate) / (1000 * 60 * 60 * 24)));
      }

      const budget = parseFloat(budgetInput.value) || 0;
      if (window.CurrencyService && curDest) {
        const analysis = CurrencyService.checkAffordability({
          budget,
          destination: curDest,
          days,
          travelers,
          currency: curCurrency
        });

        const badgeClass = analysis.status === 'under_budget' ? 'badge-primary' : (analysis.status === 'comfortable' ? 'badge-glass' : (analysis.status === 'tight' ? 'badge-warning' : 'badge-danger'));
        hintEl.innerHTML = `
          <span class="badge ${badgeClass}" style="font-size:0.7rem;">${analysis.statusLabel}</span>
          <span>Baseline needed: ~${CurrencyService.format(analysis.estimatedTotalBaseline, curCurrency)} (${days} days, ${travelers} pax)</span>
        `;
      }
    };

    // Recalculate on destination change
    const destSelect = modal.querySelector("#trip-dest-select");
    destSelect?.addEventListener("change", (e) => {
      const newDest = DataService.getDestinationById(e.target.value);
      if (newDest) {
        const travelers = Math.max(1, parseInt(document.getElementById("trip-travelers")?.value || 2, 10));
        const sDate = new Date(document.getElementById("trip-start-date")?.value || Date.now());
        const eDate = new Date(document.getElementById("trip-end-date")?.value || Date.now());
        let days = 4;
        if (!isNaN(sDate.getTime()) && !isNaN(eDate.getTime()) && eDate >= sDate) {
          days = Math.max(1, Math.round((eDate - sDate) / (1000 * 60 * 60 * 24)));
        }
        const suggestedBudget = (newDest.dailyBudgetEstimated || 150) * days * travelers;
        const budgetInput = document.getElementById("trip-budget");
        if (budgetInput) budgetInput.value = suggestedBudget;
        const titleInput = document.getElementById("trip-title-input");
        if (titleInput && (!titleInput.value || titleInput.value.includes("Getaway"))) {
          titleInput.value = `${newDest.name} Getaway`;
        }
      }
      updateAffordabilityPreview();
    });

    ["trip-budget", "trip-travelers", "trip-start-date", "trip-end-date"].forEach(id => {
      modal.querySelector(`#${id}`)?.addEventListener("input", updateAffordabilityPreview);
      modal.querySelector(`#${id}`)?.addEventListener("change", updateAffordabilityPreview);
    });

    // Run once on open
    updateAffordabilityPreview();

    const closeModal = () => {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    };

    modal.querySelector("#trip-create-close-btn").addEventListener("click", closeModal);
    modal.querySelector("#btn-cancel-trip").addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    // Form submit: Generate Trip (Guarded by Firebase authentication only when generating)
    const form = modal.querySelector("#new-trip-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("trip-title-input").value.trim() || "Vacation";
      const destId = document.getElementById("trip-dest-select").value;
      const startDate = document.getElementById("trip-start-date").value;
      const endDate = document.getElementById("trip-end-date").value;
      const travelers = document.getElementById("trip-travelers").value;
      const targetBudget = document.getElementById("trip-budget").value;

      const runTripGeneration = () => {
        const selectedDest = DataService.getDestinationById(destId);
        const destCurrency = getDestCurrency(selectedDest);

        const newTrip = AppState.createNewTrip({
          title,
          destinationId: destId,
          destinationName: selectedDest ? selectedDest.name : (destId.toUpperCase()),
          country: selectedDest ? selectedDest.country : "",
          startDate,
          endDate,
          travelers,
          targetBudget,
          currency: destCurrency
        });

        // Helper to scale default activity cost to trip native currency
        const scaleCost = (usdAmount) => {
          return window.CurrencyService ? Math.round(CurrencyService.convert(usdAmount, 'USD', destCurrency)) : usdAmount;
        };

        // Auto-populate some top attractions into day 1 and day 2 for instant delight
        if (selectedDest && selectedDest.topAttractions && selectedDest.topAttractions.length > 0 && newTrip.days.length > 0) {
          newTrip.days[0].activities.push({
            id: "act-" + Date.now() + "-1",
            name: selectedDest.topAttractions[0].name,
            timeSlot: "Morning",
            category: selectedDest.topAttractions[0].category,
            notes: selectedDest.topAttractions[0].description,
            cost: scaleCost(25),
            completed: false
          });

          if (selectedDest.topAttractions[1]) {
            newTrip.days[0].activities.push({
              id: "act-" + Date.now() + "-2",
              name: selectedDest.topAttractions[1].name,
              timeSlot: "Afternoon",
              category: selectedDest.topAttractions[1].category,
              notes: selectedDest.topAttractions[1].description,
              cost: scaleCost(20),
              completed: false
            });
          }

          if (newTrip.days.length > 1 && selectedDest.topAttractions[2]) {
            newTrip.days[1].activities.push({
              id: "act-" + Date.now() + "-3",
              name: selectedDest.topAttractions[2].name,
              timeSlot: "Morning",
              category: selectedDest.topAttractions[2].category,
              notes: selectedDest.topAttractions[2].description,
              cost: scaleCost(30),
              completed: false
            });
          }
          AppState.saveTrip(newTrip);
        }

        AppState.setActiveTripId(newTrip.id);
        closeModal();
        UI.showToast(`Itinerary for ${newTrip.title} created (${destCurrency})!`, "success");

        // Navigate to trip planner view
        window.location.hash = "#planner";
        if (window.Planner) Planner.render();
      };

      // Check Firebase authentication status only when generating trip
      if (window.AuthService && !AuthService.isAuthenticated()) {
        closeModal();
        AuthService.requireAuth(() => {
          runTripGeneration();
        }, {
          type: "generate_trip",
          tripData: { title, destId, startDate, endDate, travelers, targetBudget },
          label: `generate your personalized itinerary for ${title}`
        });
        return;
      }

      runTripGeneration();
    });
  },

  // Helper to quickly append an attraction to the user's active trip
  addAttractionToCurrentTrip(dest, attrName, attrCategory) {
    let activeTrip = AppState.getActiveTrip();
    if (!activeTrip) {
      // If no active trip, prompt to create one
      this.openTripModalWithDestination(dest.id);
      return;
    }

    // Add to first day by default or create a day if none
    if (!activeTrip.days || activeTrip.days.length === 0) {
      activeTrip.days = [{
        dayNumber: 1,
        dateStr: activeTrip.startDate || "Day 1",
        notes: "",
        activities: []
      }];
    }

    // Check if already in day 1
    const alreadyExists = activeTrip.days.some(d => d.activities.some(a => a.name.toLowerCase() === attrName.toLowerCase()));
    if (alreadyExists) {
      UI.showToast(`"${attrName}" is already in your itinerary`, "info");
      return;
    }

    const tripCurrency = activeTrip.currency || (window.CurrencyService ? CurrencyService.getDestinationCurrency(activeTrip.destinationId) : "USD");
    const actCost = window.CurrencyService ? Math.round(CurrencyService.convert(20, 'USD', tripCurrency)) : 20;

    activeTrip.days[0].activities.push({
      id: "act-" + Date.now(),
      name: attrName,
      timeSlot: "Morning",
      category: attrCategory || "Sightseeing",
      notes: `Added from ${dest.name} sights guide`,
      cost: actCost,
      completed: false
    });

    AppState.saveTrip(activeTrip);
    UI.showToast(`Added "${attrName}" to Day 1 of your "${activeTrip.title}" trip!`, "success");
  }
};

// Expose globally
if (typeof window !== "undefined") {
  window.UI = UI;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = UI;
}
