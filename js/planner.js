/**
 * Wayvora - Trip Planner Controller
 * Manages the day-by-day itinerary builder, activity creation, day notes,
 * completion toggling, budget tracking, and itinerary export/print.
 */

const PlannerController = {
  currentDayIndex: 0,

  init() {
    if (this._initialized) return;
    this._initialized = true;
    AppState.subscribe("activeTrip", () => this.render());
    AppState.subscribe("trips", () => this.render());
    window.addEventListener("currency-changed", () => this.render());
  },

  render() {
    const container = document.getElementById("planner-content-area");
    if (!container) return;

    const activeTrip = AppState.getActiveTrip();
    const trips = AppState.getTrips();

    if (!activeTrip && trips.length > 0) {
      AppState.setActiveTripId(trips[0].id);
      return;
    }

    if (!activeTrip) {
      this.renderEmptyState(container);
      return;
    }

    // Ensure days is an array
    activeTrip.days = activeTrip.days || [];

    // Calculate totals
    let totalActivities = 0;
    let completedCount = 0;
    let totalEstimatedCost = 0;

    activeTrip.days.forEach(day => {
      day.activities = day.activities || [];
      day.activities.forEach(act => {
        totalActivities++;
        if (act.completed) completedCount++;
        totalEstimatedCost += Number(act.cost) || 0;
      });
    });

    const completionRate = totalActivities > 0 ? Math.round((completedCount / totalActivities) * 100) : 0;
    const destInfo = DataService.getDestinationById(activeTrip.destinationId);
    const tripCurrency = activeTrip.currency || (window.CurrencyService ? CurrencyService.getDestinationCurrency(activeTrip.destinationId) : "USD");

    const affordability = window.CurrencyService ? CurrencyService.checkAffordability({
      budget: activeTrip.targetBudget || totalEstimatedCost,
      destination: destInfo || activeTrip.destinationId,
      days: activeTrip.days.length || 1,
      travelers: activeTrip.travelers || 1,
      currency: tripCurrency
    }) : null;

    // Ensure valid currentDayIndex
    if (this.currentDayIndex >= activeTrip.days.length) {
      this.currentDayIndex = 0;
    }
    const currentDay = activeTrip.days[this.currentDayIndex] || null;

    container.innerHTML = `
      <!-- Planner Header & Controls -->
      <div class="planner-header-card animate-fade-in">
        <div class="planner-header-top">
          <div class="trip-meta-info">
            <div class="trip-dest-badge">
              ${UI.icons.mapPin} <span>${activeTrip.destinationName}${activeTrip.country ? `, ${activeTrip.country}` : ''}</span>
            </div>
            <h2 class="trip-title-display" id="trip-title-display">${activeTrip.title}</h2>
            <div class="trip-dates-display">
              ${UI.icons.calendar} 
              <span>${activeTrip.startDate || 'Upcoming'} ${activeTrip.endDate ? `to ${activeTrip.endDate}` : ''}</span>
              <span class="trip-days-count">(${activeTrip.days.length} Days)</span>
              <span class="trip-travelers-count">• ${activeTrip.travelers || 1} Travelers</span>
            </div>
          </div>

          <div class="planner-header-actions">
            <!-- Trip Switcher Dropdown -->
            <div class="trip-switcher-wrapper">
              <label for="trip-select-dropdown" class="sr-only">Switch Trip</label>
              <select id="trip-select-dropdown" class="form-control form-control-sm">
                ${trips.map(t => `
                  <option value="${t.id}" ${t.id === activeTrip.id ? 'selected' : ''}>
                    ${t.title} (${t.destinationName})
                  </option>
                `).join("")}
              </select>
            </div>

            <button class="btn btn-primary btn-sm" id="btn-create-new-trip-planner">
              ${UI.icons.plus} Plan a Trip
            </button>
            <button class="btn btn-outline btn-sm" id="btn-export-trip-planner" title="Print / Export Itinerary">
              ${UI.icons.printer} Print / Export
            </button>
            <button class="btn btn-outline-danger btn-sm" id="btn-delete-trip-planner" title="Delete this trip">
              ${UI.icons.trash}
            </button>
          </div>
        </div>

        <!-- Trip Summary Bar -->
        <div class="trip-stats-bar">
          <div class="stat-pill">
            <span class="stat-label">Total Days</span>
            <span class="stat-value">${activeTrip.days.length}</span>
          </div>
          <div class="stat-pill">
            <span class="stat-label">Scheduled Places</span>
            <span class="stat-value">${totalActivities}</span>
          </div>
          <div class="stat-pill">
            <span class="stat-label">Estimated Spend</span>
            <span class="stat-value highlight-price">${window.CurrencyService ? CurrencyService.format(totalEstimatedCost, tripCurrency) : `\$${totalEstimatedCost}`} <span class="budget-target">/ ${window.CurrencyService ? CurrencyService.format(activeTrip.targetBudget || 1000, tripCurrency) : `\$${activeTrip.targetBudget || 1000}`}</span></span>
          </div>
          <div class="stat-pill progress-pill">
            <div class="progress-pill-header">
              <span class="stat-label">Completed</span>
              <span class="stat-value">${completionRate}% (${completedCount}/${totalActivities})</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width: ${completionRate}%"></div>
            </div>
          </div>
        </div>

        ${affordability ? `
          <!-- Trip Affordability & Budget Health Analysis Card -->
          <div class="budget-health-card mt-3">
            <div class="budget-health-header">
              <div class="budget-health-title">
                <span class="badge ${affordability.status === 'under_budget' ? 'badge-primary' : (affordability.status === 'comfortable' ? 'badge-glass' : (affordability.status === 'tight' ? 'badge-warning' : 'badge-danger'))}">
                  ${affordability.statusLabel}
                </span>
                <strong>Trip Affordability Evaluation (${tripCurrency})</strong>
              </div>
              <div class="budget-health-actions" style="display: flex; align-items: center; gap: 0.75rem;">
                <span class="text-sm text-muted">Est. baseline for ${activeTrip.travelers || 1} travelers: ~${CurrencyService.format(affordability.estimatedTotalBaseline, tripCurrency)} (${activeTrip.days.length} days)</span>
                <button type="button" class="btn btn-outline btn-xs" id="planner-converter-trigger-btn" title="Convert budget with live exchange rates" style="padding: 0.2rem 0.55rem; font-size: 0.75rem;">💱 Currency Converter</button>
              </div>
            </div>
            <p class="budget-health-advice">${affordability.advice}</p>
            <div class="budget-metrics-grid">
              <div class="b-metric-item">
                <span class="b-metric-lbl">Target Budget</span>
                <span class="b-metric-val">${CurrencyService.format(activeTrip.targetBudget || 0, tripCurrency)}</span>
              </div>
              <div class="b-metric-item">
                <span class="b-metric-lbl">Target / Person / Day</span>
                <span class="b-metric-val">${CurrencyService.format(affordability.dailyPerPersonUser, tripCurrency)}/day</span>
              </div>
              <div class="b-metric-item">
                <span class="b-metric-lbl">Dest. Avg Baseline</span>
                <span class="b-metric-val">${CurrencyService.format(affordability.dailyPerPersonBaseline, tripCurrency)}/day</span>
              </div>
              <div class="b-metric-item">
                <span class="b-metric-lbl">Itinerary Spend</span>
                <span class="b-metric-val highlight">${CurrencyService.format(totalEstimatedCost, tripCurrency)}</span>
              </div>
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Main Itinerary Day Organizer -->
      <div class="planner-body-layout">
        <!-- Day Selector Column / Tabs -->
        <div class="planner-days-sidebar">
          <div class="days-sidebar-header">
            <h3>Itinerary Days</h3>
            <button class="btn-add-day-icon" id="btn-add-day" title="Add another day">
              ${UI.icons.plus} Add Day
            </button>
          </div>

          <div class="days-list-nav" id="days-list-nav">
            ${activeTrip.days.map((day, idx) => `
              <button 
                class="day-nav-item ${idx === this.currentDayIndex ? 'active' : ''}" 
                data-day-index="${idx}"
              >
                <div class="day-nav-badge">Day ${day.dayNumber}</div>
                <div class="day-nav-info">
                  <span class="day-date-str">${day.dateStr || `Day ${day.dayNumber}`}</span>
                  <span class="day-places-count">${day.activities.length} place${day.activities.length === 1 ? '' : 's'}</span>
                </div>
                ${UI.icons.chevronRight}
              </button>
            `).join("")}
          </div>

          ${destInfo ? `
            <!-- Quick Attractions Recommender Box in Sidebar -->
            <div class="sidebar-recommendations-card">
              <div class="rec-header">
                ${UI.icons.sparkles}
                <h4>Must-See in ${destInfo.name}</h4>
              </div>
              <p class="rec-intro">One-click add to today's schedule:</p>
              <div class="rec-attractions-list">
                ${destInfo.topAttractions.slice(0, 4).map(attr => `
                  <div class="rec-attraction-row">
                    <span class="rec-attr-name" title="${attr.description}">${attr.name}</span>
                    <button 
                      class="btn-quick-add-rec" 
                      data-name="${attr.name.replace(/"/g, '&quot;')}" 
                      data-cat="${attr.category}"
                      title="Add to Day ${this.currentDayIndex + 1}"
                    >
                      ${UI.icons.plus}
                    </button>
                  </div>
                `).join("")}
              </div>
            </div>
          ` : ""}
        </div>

        <!-- Day Schedule Content Column -->
        <div class="planner-day-detail">
          ${currentDay ? this.renderDaySchedule(activeTrip, currentDay) : ""}
        </div>
      </div>
    `;

    this.attachPlannerEvents(activeTrip);
  },

  renderDaySchedule(trip, day) {
    const tripCurrency = trip.currency || (window.CurrencyService ? CurrencyService.getDestinationCurrency(trip.destinationId) : "USD");
    return `
      <div class="day-schedule-card animate-fade-in">
        <div class="day-schedule-header">
          <div class="day-title-block">
            <span class="day-badge-lg">Day ${day.dayNumber}</span>
            <div>
              <h3>${day.dateStr ? `Day ${day.dayNumber} • ${day.dateStr}` : `Day ${day.dayNumber} Itinerary`}</h3>
              <p class="text-muted text-sm">${day.notes || "Add morning coffee, museum stops, dinner plans, and sightseeing."}</p>
            </div>
          </div>
          <div class="day-schedule-header-actions">
            <button class="btn btn-outline btn-ai-fill" id="btn-ai-generate-schedule" title="Auto-curate Day with AI">
              ✨ Auto-Curate with AI
            </button>
            <button class="btn btn-primary" id="btn-open-add-activity">
              ${UI.icons.plus} Add Place
            </button>
          </div>
        </div>

        <!-- Day Notes Editor -->
        <div class="day-notes-wrapper">
          <input 
            type="text" 
            id="day-notes-input" 
            class="form-control day-notes-input" 
            placeholder="Notes for Day ${day.dayNumber} (e.g. Pack walking shoes, pre-book tickets, bring portable charger)..." 
            value="${day.notes || ''}"
          />
        </div>

        <!-- Timeline of Activities for Current Day -->
        <div class="activities-timeline" id="activities-timeline">
          ${day.activities.length === 0 ? `
            <div class="empty-timeline-state">
              <div class="empty-icon-circle">${UI.icons.compass}</div>
              <h4>No places planned for Day ${day.dayNumber} yet</h4>
              <p class="text-muted">Start organizing by adding attractions, or click "Auto-Curate with AI" to generate a complete daily schedule in 1 click!</p>
              <div class="mt-3">
                <button class="btn btn-primary" id="btn-empty-ai-schedule">
                  ✨ Auto-Curate Day with AI
                </button>
                <button class="btn btn-outline ml-2" id="btn-empty-add-activity">
                  ${UI.icons.plus} Custom Place
                </button>
              </div>
            </div>
          ` : `
            <div class="timeline-items-list">
              ${day.activities.map((act, actIdx) => `
                <div class="timeline-activity-card ${act.completed ? 'is-completed' : ''}" data-act-id="${act.id}">
                  <div class="activity-left">
                    <label class="custom-checkbox-container" title="Mark as visited / done">
                      <input type="checkbox" class="activity-check-toggle" data-act-id="${act.id}" ${act.completed ? 'checked' : ''} />
                      <span class="checkmark"></span>
                    </label>
                    <div class="time-slot-badge slot-${(act.timeSlot || 'morning').split(' ')[0].toLowerCase()}">
                      ${act.timeSlot || 'Anytime'}
                    </div>
                  </div>

                  <div class="activity-center">
                    <div class="act-name-row">
                      <h4 class="act-name">${act.name}</h4>
                      ${act.category ? `<span class="tag-pill tag-sm">${act.category}</span>` : ''}
                      ${act.location ? `<span class="location-pill">${UI.icons.mapPin} ${act.location}</span>` : ''}
                    </div>
                    ${act.notes ? `<p class="act-notes">${act.notes}</p>` : ''}
                  </div>

                  <div class="activity-right">
                    ${act.cost ? `<span class="act-cost">${window.CurrencyService ? CurrencyService.format(act.cost, tripCurrency) : `\$${act.cost}`}</span>` : '<span class="act-cost free">Free</span>'}
                    <button class="btn-icon btn-delete-act" data-act-id="${act.id}" title="Remove place from itinerary">
                      ${UI.icons.trash}
                    </button>
                  </div>
                </div>
              `).join("")}
            </div>
          `}
        </div>
      </div>
    `;
  },

  renderAuthRequiredState(container) {
    container.innerHTML = `
      <div class="planner-auth-box animate-scale-up">
        <div class="empty-icon-circle-lg">${UI.icons.compass}</div>
        <h2>Sign In to Access Trip Planner</h2>
        <p class="text-lead text-muted">
          Your personal itineraries, scheduled activities, and travel budgets are securely linked to your account. Sign in to start planning or view your journeys.
        </p>
        <div class="mt-4">
          <button class="btn btn-primary btn-lg" id="btn-planner-auth-login">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Sign In or Create Account
          </button>
          <a href="#explore" class="btn btn-outline btn-lg ml-2">
            Explore Destinations First
          </a>
        </div>
      </div>
    `;

    container.querySelector("#btn-planner-auth-login")?.addEventListener("click", () => {
      if (window.AuthService) {
        AuthService.openAuthModal("Please sign in to plan and manage your personal itineraries.", "login");
      }
    });
  },

  renderEmptyState(container) {
    const allDests = window.DataService ? DataService.getAllDestinations() : [];
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const end = new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000);
    const endStr = end.toISOString().split("T")[0];

    container.innerHTML = `
      <div class="planner-empty-box planner-page-form-wrapper animate-scale-up">
        <div class="empty-icon-circle-lg">${UI.icons.compass}</div>
        <h2>Trip Planner</h2>
        <p class="text-lead text-muted">Create your personalized day-by-day travel itinerary with attractions, schedule, and budget tracking.</p>

        <form id="page-planner-form" class="planner-page-form mt-4" style="text-align: left;">
          <div class="form-row-2">
            <div class="form-group">
              <label for="page-plan-dest">Destination</label>
              <select id="page-plan-dest" class="form-control" required>
                <optgroup label="Global Destinations">
                  ${allDests.map(d => `
                    <option value="${d.id}" ${d.id === 'paris' ? 'selected' : ''}>
                      ${d.name}, ${d.country}
                    </option>
                  `).join("")}
                </optgroup>
                ${window.IndiaDataService ? `
                  <optgroup label="Indian States, Cities & Sights">
                    ${window.IndiaDataService.getAll().filter(d => d.category === "city" || d.category === "tourist_place").map(d => `
                      <option value="${d.id}">
                        ${d.name}, India (${d.categoryLabel})
                      </option>
                    `).join("")}
                  </optgroup>
                ` : ''}
              </select>
            </div>
            <div class="form-group">
              <label for="page-plan-title">Trip Name</label>
              <input type="text" id="page-plan-title" class="form-control" placeholder="e.g. Paris Holiday" value="Paris Getaway" required />
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label for="page-plan-start">Start Date</label>
              <input type="date" id="page-plan-start" class="form-control" value="${todayStr}" required />
            </div>
            <div class="form-group">
              <label for="page-plan-end">End Date</label>
              <input type="date" id="page-plan-end" class="form-control" value="${endStr}" required />
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label for="page-plan-travelers">Travelers</label>
              <input type="number" id="page-plan-travelers" class="form-control" min="1" max="20" value="2" required />
            </div>
            <div class="form-group">
              <label for="page-plan-budget">Target Budget (<span id="page-plan-curr-label">EUR</span>)</label>
              <input type="number" id="page-plan-budget" class="form-control" min="50" step="50" value="1200" required />
              <div id="page-affordability-hint" class="text-xs text-muted mt-1" style="display:flex;align-items:center;gap:0.4rem;flex-wrap:wrap;min-height:18px;"></div>
            </div>
          </div>

          <div class="modal-form-actions mt-4" style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
            <button type="submit" class="btn btn-primary btn-lg" id="btn-page-generate-trip">
              🚀 Plan My Trip
            </button>
            <a href="#explore" class="btn btn-ghost btn-lg">
              Explore Destinations
            </a>
          </div>
        </form>
      </div>
    `;

    // Dynamic currency label update
    const destSelect = document.getElementById("page-plan-dest");
    const titleInput = document.getElementById("page-plan-title");
    const budgetInput = document.getElementById("page-plan-budget");
    const currLabel = document.getElementById("page-plan-curr-label");
    const hintEl = document.getElementById("page-affordability-hint");

    const updatePageCurrency = () => {
      if (!destSelect) return;
      const destId = destSelect.value;
      const d = window.DataService ? DataService.getDestinationById(destId) : null;
      const curr = window.CurrencyService ? CurrencyService.getDestinationCurrency(d || destId) : "USD";
      if (currLabel) currLabel.textContent = curr;
      if (d && titleInput && (titleInput.value.includes("Getaway") || titleInput.value.includes("Holiday") || !titleInput.value)) {
        titleInput.value = `${d.name} Getaway`;
      }
      if (window.CurrencyService && hintEl && budgetInput) {
        const destDaily = d?.dailyBudgetEstimated || CurrencyService.getDefaultDailyBudget(d, curr);
        const estTotal = destDaily * 4 * 2;
        budgetInput.value = Math.round(estTotal);
        const check = CurrencyService.checkAffordability(d || destId, 4, 2, estTotal, curr);
        hintEl.innerHTML = `<span class="badge ${check.badgeClass}" style="font-size:0.75rem;">${check.statusLabel}</span> <span class="text-xs text-muted">Baseline ~${check.baselineTotalFormatted}</span>`;
      }
    };

    destSelect?.addEventListener("change", updatePageCurrency);
    updatePageCurrency();

    // Form submit: Generate trip (Guarded by Firebase authentication only when generating)
    const form = document.getElementById("page-planner-form");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = document.getElementById("page-plan-title").value.trim() || "My Vacation";
      const destId = document.getElementById("page-plan-dest").value;
      const startDate = document.getElementById("page-plan-start").value;
      const endDate = document.getElementById("page-plan-end").value;
      const travelers = document.getElementById("page-plan-travelers").value;
      const targetBudget = document.getElementById("page-plan-budget").value;

      const runGeneration = () => {
        const selectedDest = window.DataService ? DataService.getDestinationById(destId) : null;
        const destCurrency = window.CurrencyService ? CurrencyService.getDestinationCurrency(selectedDest || destId) : "USD";

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
        }

        AppState.saveTrip(newTrip);
        AppState.setActiveTripId(newTrip.id);
        UI.showToast(`Itinerary for ${newTrip.title} generated successfully!`, "success");
        window.location.hash = "#planner";
        PlannerController.render();
      };

      // Check Firebase authentication status only when generating trip
      if (window.AuthService && !AuthService.isAuthenticated()) {
        AuthService.requireAuth(() => {
          runGeneration();
        }, {
          type: "generate_trip",
          tripData: { title, destId, startDate, endDate, travelers, targetBudget },
          label: `generate your personalized itinerary for ${title}`
        });
        return;
      }

      runGeneration();
    });
  },

  attachPlannerEvents(activeTrip) {
    // Switch day tab
    document.querySelectorAll(".day-nav-item").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = parseInt(btn.dataset.dayIndex, 10);
        this.currentDayIndex = index;
        this.render();
      });
    });

    // Switch active trip dropdown
    const switcher = document.getElementById("trip-select-dropdown");
    if (switcher) {
      switcher.addEventListener("change", (e) => {
        AppState.setActiveTripId(e.target.value);
        this.currentDayIndex = 0;
      });
    }

    // Create new trip button (Opens wizard directly without upfront blocking)
    document.getElementById("btn-create-new-trip-planner")?.addEventListener("click", () => {
      UI.openTripModalWithDestination(activeTrip.destinationId || "paris");
    });

    // Delete trip button
    document.getElementById("btn-delete-trip-planner")?.addEventListener("click", () => {
      if (confirm(`Are you sure you want to delete the itinerary "${activeTrip.title}"?`)) {
        AppState.deleteTrip(activeTrip.id);
        UI.showToast("Trip itinerary deleted", "info");
      }
    });

    // Trip Affordability Live Currency Converter trigger
    document.getElementById("planner-converter-trigger-btn")?.addEventListener("click", () => {
      if (window.CurrencyConverterUI) {
        window.CurrencyConverterUI.openModal(activeTrip.currency || "USD", "INR", activeTrip.targetBudget || 1000);
      }
    });

    // Export / Print button
    document.getElementById("btn-export-trip-planner")?.addEventListener("click", () => {
      this.exportItinerary(activeTrip);
    });

    // Add another day
    document.getElementById("btn-add-day")?.addEventListener("click", () => {
      const nextDayNum = activeTrip.days.length + 1;
      let nextDateStr = "";
      if (activeTrip.startDate) {
        const d = new Date(activeTrip.startDate);
        d.setDate(d.getDate() + activeTrip.days.length);
        nextDateStr = !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : `Day ${nextDayNum}`;
      } else {
        nextDateStr = `Day ${nextDayNum}`;
      }

      activeTrip.days.push({
        dayNumber: nextDayNum,
        dateStr: nextDateStr,
        notes: "",
        activities: []
      });

      AppState.saveTrip(activeTrip);
      this.currentDayIndex = activeTrip.days.length - 1;
      UI.showToast(`Added Day ${nextDayNum} to itinerary!`, "success");
    });

    // Day notes auto-save on input/blur
    const notesInput = document.getElementById("day-notes-input");
    if (notesInput) {
      notesInput.addEventListener("change", () => {
        if (activeTrip.days[this.currentDayIndex]) {
          activeTrip.days[this.currentDayIndex].notes = notesInput.value.trim();
          AppState.saveTrip(activeTrip);
        }
      });
    }

    // Toggle activity completed checkbox
    document.querySelectorAll(".activity-check-toggle").forEach(chk => {
      chk.addEventListener("change", (e) => {
        const actId = chk.dataset.actId;
        const currentDay = activeTrip.days[this.currentDayIndex];
        if (currentDay) {
          const act = currentDay.activities.find(a => a.id === actId);
          if (act) {
            act.completed = chk.checked;
            AppState.saveTrip(activeTrip);
          }
        }
      });
    });

    // Delete activity
    document.querySelectorAll(".btn-delete-act").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const actId = btn.dataset.actId;
        const currentDay = activeTrip.days[this.currentDayIndex];
        if (currentDay) {
          currentDay.activities = currentDay.activities.filter(a => a.id !== actId);
          AppState.saveTrip(activeTrip);
          UI.showToast("Activity removed", "info");
        }
      });
    });

    // Quick add from recommendations in sidebar
    document.querySelectorAll(".btn-quick-add-rec").forEach(btn => {
      btn.addEventListener("click", () => {
        const name = btn.dataset.name;
        const cat = btn.dataset.cat;
        const currentDay = activeTrip.days[this.currentDayIndex];
        if (!currentDay) return;

        // Check duplicate
        if (currentDay.activities.some(a => a.name.toLowerCase() === name.toLowerCase())) {
          UI.showToast(`"${name}" is already in Day ${currentDay.dayNumber}`, "info");
          return;
        }

        const tripCurrency = activeTrip.currency || (window.CurrencyService ? CurrencyService.getDestinationCurrency(activeTrip.destinationId) : "USD");
        const actCost = window.CurrencyService ? Math.round(CurrencyService.convert(25, 'USD', tripCurrency)) : 25;

        currentDay.activities.push({
          id: "act-" + Date.now(),
          name: name,
          timeSlot: "Afternoon",
          category: cat,
          notes: "Curated highlight",
          cost: actCost,
          completed: false
        });

        AppState.saveTrip(activeTrip);
        UI.showToast(`Added "${name}" to Day ${currentDay.dayNumber}`, "success");
      });
    });

    // Open add activity modal
    const openAddActModal = () => {
      this.openAddActivityModal(activeTrip, this.currentDayIndex);
    };

    document.getElementById("btn-open-add-activity")?.addEventListener("click", openAddActModal);
    document.getElementById("btn-empty-add-activity")?.addEventListener("click", openAddActModal);

    // AI Itinerary Auto-Generate (Guarded by Firebase authentication only when generating)
    const triggerAIGenerate = () => {
      if (window.AuthService && !AuthService.isAuthenticated()) {
        AuthService.requireAuth(() => {
          this.generateAISchedule(activeTrip, this.currentDayIndex);
        }, {
          type: "generate_ai_schedule",
          label: "generate an AI-curated itinerary schedule"
        });
        return;
      }
      this.generateAISchedule(activeTrip, this.currentDayIndex);
    };
    document.getElementById("btn-ai-generate-schedule")?.addEventListener("click", triggerAIGenerate);
    document.getElementById("btn-empty-ai-schedule")?.addEventListener("click", triggerAIGenerate);
  },

  // Intelligently generate a curated 3-part schedule for a specific day
  generateAISchedule(trip, dayIndex) {
    const day = trip.days[dayIndex];
    if (!day) return;
    const dest = DataService.getDestinationById(trip.destinationId) || DataService.getAllDestinations()[0];

    const attractions = dest ? (dest.topAttractions || []) : [];
    const things = dest ? (dest.thingsToDo || []) : [];

    const morningAttr = attractions[(dayIndex * 2) % Math.max(1, attractions.length)] || { name: "Historic City Promenade", category: "Sightseeing", description: "Wander picturesque cobblestone lanes." };
    const afternoonAttr = attractions[(dayIndex * 2 + 1) % Math.max(1, attractions.length)] || { name: "Cultural Landmark Tour", category: "Culture", description: "Explore the most famous museum or monument." };
    const eveningActivity = things[dayIndex % Math.max(1, things.length)] || "Authentic local dinner and twilight walk";

    const tripCurrency = trip.currency || (window.CurrencyService ? CurrencyService.getDestinationCurrency(trip.destinationId) : "USD");
    const cost1 = window.CurrencyService ? Math.round(CurrencyService.convert(25, 'USD', tripCurrency)) : 25;
    const cost2 = window.CurrencyService ? Math.round(CurrencyService.convert(30, 'USD', tripCurrency)) : 30;
    const cost3 = window.CurrencyService ? Math.round(CurrencyService.convert(45, 'USD', tripCurrency)) : 45;

    day.activities = [
      {
        id: "act-ai-" + Date.now() + "-1",
        name: morningAttr.name,
        timeSlot: "Morning (09:00 AM)",
        category: morningAttr.category || "Sightseeing",
        location: `${dest.name} Center`,
        notes: morningAttr.description || "Start the day fresh with sightseeing.",
        cost: cost1,
        completed: false
      },
      {
        id: "act-ai-" + Date.now() + "-2",
        name: afternoonAttr.name,
        timeSlot: "Afternoon (02:00 PM)",
        category: afternoonAttr.category || "Culture",
        location: `${dest.name} Landmark District`,
        notes: afternoonAttr.description || "Explore prominent architectural sights.",
        cost: cost2,
        completed: false
      },
      {
        id: "act-ai-" + Date.now() + "-3",
        name: eveningActivity,
        timeSlot: "Evening (07:00 PM)",
        category: "Dining & Leisure",
        location: `${dest.name} Promenade`,
        notes: "Savor authentic regional cuisine and evening atmosphere.",
        cost: cost3,
        completed: false
      }
    ];

    day.notes = `AI Curated Itinerary: Visiting ${morningAttr.name} & local authentic dining.`;
    AppState.saveTrip(trip);
    this.render();
    UI.showToast(`✨ AI generated a curated schedule for Day ${day.dayNumber}!`, "success");
  },

  // Modal to add a customized activity to a specific day
  openAddActivityModal(trip, dayIndex) {
    const day = trip.days[dayIndex];
    if (!day) return;

    let modal = document.getElementById("add-activity-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "add-activity-modal";
      modal.className = "modal-overlay";
      document.body.appendChild(modal);
    }

    const dest = DataService.getDestinationById(trip.destinationId);
    const tripCurrency = trip.currency || (window.CurrencyService ? CurrencyService.getDestinationCurrency(trip.destinationId) : "USD");
    const defaultCost = window.CurrencyService ? Math.round(CurrencyService.convert(20, 'USD', tripCurrency)) : 20;

    modal.innerHTML = `
      <div class="modal-dialog modal-md modal-scrollable animate-scale-up" role="dialog" aria-modal="true">
        <button class="modal-close-btn" id="act-modal-close-btn" aria-label="Close modal">
          ${UI.icons.x}
        </button>

        <div class="modal-header-simple">
          <div class="icon-circle bg-primary-soft">${UI.icons.mapPin}</div>
          <div>
            <h3>Add Place to Day ${day.dayNumber}</h3>
            <p class="text-muted text-sm">${day.dateStr ? `Scheduled for ${day.dateStr}` : `Day ${day.dayNumber}`}</p>
          </div>
        </div>

        <form id="add-act-form" class="modal-form">
          <div class="form-group">
            <label for="act-name-input">Place or Activity Name</label>
            <input 
              type="text" 
              id="act-name-input" 
              class="form-control" 
              placeholder="e.g. Visit Museum, Beach Sunset, Michelin Bistro" 
              required 
            />
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label for="act-slot-select">Time Slot</label>
              <select id="act-slot-select" class="form-control">
                <option value="Morning">Morning (8 AM - 12 PM)</option>
                <option value="Afternoon" selected>Afternoon (12 PM - 5 PM)</option>
                <option value="Evening">Evening (5 PM - 9 PM)</option>
                <option value="Night">Night (9 PM onwards)</option>
              </select>
            </div>
            <div class="form-group">
              <label for="act-category-input">Category</label>
              <select id="act-category-input" class="form-control">
                <option value="Sightseeing">Sightseeing</option>
                <option value="Dining">Dining & Food</option>
                <option value="Culture">Art & Culture</option>
                <option value="Adventure">Adventure / Outdoor</option>
                <option value="Relaxation">Relaxation / Beach</option>
                <option value="Shopping">Shopping</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="act-cost-input">Estimated Cost (${tripCurrency})</label>
            <input type="number" id="act-cost-input" class="form-control" min="0" step="5" value="${defaultCost}" />
          </div>

          <div class="form-group">
            <label for="act-notes-input">Notes or Booking Details (Optional)</label>
            <input type="text" id="act-notes-input" class="form-control" placeholder="e.g. Reservation confirmation #1234, wear sunscreen" />
          </div>

          <div class="modal-form-actions">
            <button type="button" class="btn btn-outline" id="btn-cancel-add-act">Cancel</button>
            <button type="submit" class="btn btn-primary">Add to Day ${day.dayNumber}</button>
          </div>
        </form>
      </div>
    `;

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
    const actDialog = modal.querySelector(".modal-dialog");
    if (actDialog) actDialog.scrollTop = 0;
    modal.scrollTop = 0;

    const closeModal = () => {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    };

    modal.querySelector("#act-modal-close-btn").addEventListener("click", closeModal);
    modal.querySelector("#btn-cancel-add-act").addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    // Form submit
    modal.querySelector("#add-act-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("act-name-input").value.trim();
      const timeSlot = document.getElementById("act-slot-select").value;
      const category = document.getElementById("act-category-input").value;
      const cost = Number(document.getElementById("act-cost-input").value) || 0;
      const notes = document.getElementById("act-notes-input").value.trim();

      day.activities.push({
        id: "act-" + Date.now(),
        name,
        timeSlot,
        category,
        cost,
        notes,
        completed: false
      });

      AppState.saveTrip(trip);
      closeModal();
      UI.showToast(`Added "${name}" to Day ${day.dayNumber}!`, "success");
    });
  },

  // Printable and exportable clean itinerary view
  exportItinerary(trip) {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to export/print your itinerary.");
      return;
    }

    let totalCost = 0;
    (trip.days || []).forEach(d => (d.activities || []).forEach(a => totalCost += (Number(a.cost) || 0)));
    const tripCurrency = trip.currency || (window.CurrencyService ? CurrencyService.getDestinationCurrency(trip.destinationId) : "USD");
    const formattedTotal = window.CurrencyService ? CurrencyService.format(totalCost, tripCurrency) : ('$' + totalCost);

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Wayvora Itinerary - ${trip.title}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.5; color: #1e293b; padding: 40px; max-width: 800px; margin: auto; }
          .header { border-bottom: 2px solid #0ea5e9; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
          .logo { font-size: 24px; font-weight: 800; color: #0ea5e9; }
          .trip-title { font-size: 28px; margin: 10px 0 5px; color: #0f172a; }
          .meta { color: #64748b; font-size: 14px; }
          .day-box { margin-bottom: 30px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; page-break-inside: avoid; }
          .day-header { background: #f8fafc; padding: 12px 18px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
          .day-title { font-weight: 700; color: #0f172a; font-size: 16px; margin: 0; }
          .activity-item { padding: 12px 18px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
          .activity-item:last-child { border-bottom: none; }
          .slot-badge { background: #e0f2fe; color: #0369a1; padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; margin-right: 10px; display: inline-block; }
          .act-name { font-weight: 600; font-size: 15px; }
          .act-notes { font-size: 13px; color: #64748b; margin-top: 2px; }
          .cost { font-weight: 600; color: #0f172a; }
          .summary-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 15px 20px; margin-top: 30px; display: flex; justify-content: space-between; }
          @media print {
            .no-print { display: none; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px;">
          <button onclick="window.print()" style="background: #0ea5e9; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 600;">
            Print Itinerary
          </button>
        </div>

        <div class="header">
          <div>
            <div class="logo">Wayvora</div>
            <h1 class="trip-title">${trip.title}</h1>
            <div class="meta">
              Destination: <strong>${trip.destinationName}, ${trip.country}</strong> | 
              Dates: <strong>${trip.startDate || 'Upcoming'} ${trip.endDate ? `to ${trip.endDate}` : ''}</strong> | 
              Travelers: <strong>${trip.travelers || 1}</strong>
            </div>
          </div>
        </div>

        ${trip.days.map(d => `
          <div class="day-box">
            <div class="day-header">
              <h3 class="day-title">Day ${d.dayNumber} - ${d.dateStr}</h3>
              <span style="font-size: 13px; color: #64748b;">${d.activities.length} activities</span>
            </div>
            ${d.notes ? `<div style="padding: 10px 18px; font-size: 13px; background: #fffbeb; color: #92400e; border-bottom: 1px solid #fef3c7;"><strong>Notes:</strong> ${d.notes}</div>` : ''}
            <div>
              ${d.activities.length === 0 ? `
                <div style="padding: 15px 18px; color: #94a3b8; font-style: italic;">No activities scheduled for this day.</div>
              ` : d.activities.map(a => `
                <div class="activity-item">
                  <div>
                    <span class="slot-badge">${a.timeSlot}</span>
                    <span class="act-name">${a.name}</span>
                    ${a.notes ? `<div class="act-notes">${a.notes}</div>` : ''}
                  </div>
                  <div class="cost">${a.cost ? (window.CurrencyService ? CurrencyService.format(a.cost, tripCurrency) : ('$' + a.cost)) : 'Free'}</div>
                </div>
              `).join("")}
            </div>
          </div>
        `).join("")}

        <div class="summary-card">
          <span><strong>Total Days:</strong> ${trip.days.length}</span>
          <span><strong>Estimated Itinerary Cost:</strong> ${formattedTotal}</span>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
};

// Expose globally
if (typeof window !== "undefined") {
  window.PlannerController = PlannerController;
  window.Planner = PlannerController;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = PlannerController;
}

// Auto initialize on DOM ready or immediately
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    PlannerController.init();
  });
} else {
  PlannerController.init();
}
