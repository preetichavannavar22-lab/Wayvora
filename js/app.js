/**
 * Wayvora - Master Application Controller
 * Handles view routing (SPA), live search, multi-filter engine,
 * navbar interactions, mobile drawer, and view rendering.
 */

const App = {
  activeView: "home",
  exploreFilters: {
    query: "",
    region: "All",
    budget: "All",
    tag: "All",
    sortBy: "popular"
  },
  indiaFilters: {
    query: "",
    category: "all",
    subCategory: "all",
    zone: "all"
  },

  init() {
    if (this._initialized) return;
    this._initialized = true;

    this.bindNavigation();
    this.bindHomeEvents();
    this.bindExploreFilters();
    this.bindIndiaEvents();
    this.bindGlobalStateEvents();
    this.bindCurrencySelector();
    this.handleRoute();

    // Initialize planner
    if (window.PlannerController && typeof window.PlannerController.init === "function") {
      PlannerController.init();
    }

    // Initial renders
    this.renderHomeSections();
    this.updateFavouritesBadge();

    // Listen to hash and popstate changes for browser history navigation
    window.addEventListener("hashchange", () => this.handleRoute());
    window.addEventListener("popstate", () => this.handleRoute());
  },

  // Navigation and Route Handling
  bindNavigation() {
    // 1. Navigation links in header (desktop & mobile)
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(link => {
      link.addEventListener("click", (e) => {
        if (link.id === "nav-weather-btn") {
          e.preventDefault();
          this.closeMobileMenu();
          if (window.WeatherUI && typeof window.WeatherUI.openWeatherModal === "function") {
            window.WeatherUI.openWeatherModal(window.WeatherUI.activeDestId || "paris");
          }
          return;
        }

        const href = link.getAttribute("href");
        if (href && href.startsWith("#")) {
          e.preventDefault();
          const targetView = href.replace("#", "");
          this.closeMobileMenu();
          this.navigateTo(targetView);
        }
      });
    });

    // 2. Brand logo (Wayvora) -> Home
    document.querySelectorAll(".navbar-brand").forEach(brand => {
      brand.addEventListener("click", (e) => {
        e.preventDefault();
        this.closeMobileMenu();
        this.navigateTo("home");
      });
    });

    // 3. Plan a Trip nav CTA button -> Planner
    document.getElementById("nav-cta-plan-trip")?.addEventListener("click", (e) => {
      e.preventDefault();
      this.closeMobileMenu();
      this.navigateTo("planner");
    });

    // 4. Mobile menu toggle, close button & backdrop
    const menuBtn = document.getElementById("mobile-menu-toggle");
    const navMenu = document.getElementById("navbar-menu");
    const backdrop = document.getElementById("nav-backdrop");
    const drawerCloseBtn = document.getElementById("mobile-drawer-close");

    if (menuBtn && navMenu) {
      menuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (navMenu.classList.contains("active")) {
          this.closeMobileMenu();
        } else {
          this.openMobileMenu();
        }
      });
    }

    if (drawerCloseBtn) {
      drawerCloseBtn.addEventListener("click", () => this.closeMobileMenu());
    }

    if (backdrop) {
      backdrop.addEventListener("click", () => this.closeMobileMenu());
    }

    // Close mobile drawer on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navMenu && navMenu.classList.contains("active")) {
        this.closeMobileMenu();
      }
    });

    // 5. Mobile header user shortcut button
    document.getElementById("mobile-header-user-btn")?.addEventListener("click", () => {
      if (window.AuthService) {
        if (AuthService.isAuthenticated()) {
          this.openMobileMenu();
        } else {
          AuthService.openAuthModal();
        }
      }
    });

    // 6. User profile dropdown links (My Itineraries, Saved Favourites)
    document.querySelectorAll(".profile-dropdown-item").forEach(item => {
      const href = item.getAttribute("href");
      if (href && href.startsWith("#")) {
        item.addEventListener("click", (e) => {
          e.preventDefault();
          const dropdown = document.getElementById("user-menu-dropdown");
          if (dropdown) dropdown.classList.remove("active");
          this.closeMobileMenu();
          this.navigateTo(href.replace("#", ""));
        });
      }
    });

    // 7. About page pill tabs
    document.querySelectorAll(".about-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        const tab = pill.getAttribute("data-tab");
        if (tab) this.switchAboutTab(tab);
      });
    });

    // 8. Footer About and Legal links (direct to specific tab)
    document.querySelectorAll(".footer-about-link").forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const tab = link.getAttribute("data-about-tab") || "overview";
        this.navigateTo("about");
        this.switchAboutTab(tab);
      });
    });

    // 9. Footer Region filters
    document.querySelectorAll(".footer-link-region").forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const region = link.getAttribute("data-region");
        this.navigateTo("explore");
        if (region) {
          const regionSelect = document.getElementById("filter-region");
          if (regionSelect) {
            regionSelect.value = region;
            regionSelect.dispatchEvent(new Event("change"));
          }
        }
      });
    });

    // 10. Footer Live Weather Button
    document.getElementById("footer-weather-btn")?.addEventListener("click", (e) => {
      e.preventDefault();
      if (window.WeatherUI && typeof window.WeatherUI.openWeatherModal === "function") {
        window.WeatherUI.openWeatherModal(window.WeatherUI.activeDestId || "paris");
      }
    });

    // 10b. Currency Converter Triggers (desktop header, mobile drawer, footer)
    const openConverterModal = () => {
      if (window.CurrencyConverterUI && typeof window.CurrencyConverterUI.openModal === "function") {
        window.CurrencyConverterUI.openModal();
      }
    };
    document.getElementById("nav-converter-btn")?.addEventListener("click", openConverterModal);
    document.getElementById("mobile-converter-btn")?.addEventListener("click", () => {
      this.closeMobileMenu();
      openConverterModal();
    });
    document.getElementById("footer-converter-btn")?.addEventListener("click", (e) => {
      e.preventDefault();
      openConverterModal();
    });

    // 11. Other Footer navigation links
    document.querySelectorAll(".footer-links a[href^='#']:not(.footer-about-link):not(.footer-link-region)").forEach(link => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (href && href.startsWith("#")) {
          e.preventDefault();
          this.navigateTo(href.replace("#", ""));
        }
      });
    });

    // 12. Contact Support Form Submission
    const contactForm = document.getElementById("form-contact-support");
    if (contactForm) {
      contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("contact-name")?.value.trim();
        const email = document.getElementById("contact-email")?.value.trim();
        const message = document.getElementById("contact-message")?.value.trim();
        const banner = document.getElementById("contact-success-banner");

        if (!name || !email || !message) {
          if (window.UI && typeof window.UI.showToast === "function") {
            window.UI.showToast("Please fill out your name, email, and message.", "warning");
          }
          return;
        }

        if (banner) {
          banner.innerHTML = `<strong>✓ Thank you, ${name}!</strong> Your message has been received. Our support team will follow up at <em>${email}</em> within 24 hours.`;
          banner.style.display = "block";
          banner.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }

        contactForm.reset();

        if (window.UI && typeof window.UI.showToast === "function") {
          window.UI.showToast("Message sent successfully!", "success");
        }
      });
    }
  },

  switchAboutTab(tabName) {
    const clean = (tabName || "mission").toLowerCase().replace("about-", "").trim();
    const validTabs = ["mission", "philosophy", "tips", "privacy", "contact", "developer"];
    const targetTab = validTabs.includes(clean) ? clean : "mission";

    document.querySelectorAll(".about-pill").forEach(pill => {
      const isCurrent = pill.getAttribute("data-tab") === targetTab;
      pill.classList.toggle("active", isCurrent);
      pill.setAttribute("aria-selected", isCurrent ? "true" : "false");
    });

    document.querySelectorAll(".about-panel").forEach(panel => {
      panel.classList.remove("active");
    });

    const activePanel = document.getElementById(`about-panel-${targetTab}`);
    if (activePanel) {
      activePanel.classList.add("active");
    }
  },

  openMobileMenu() {
    const navMenu = document.getElementById("navbar-menu");
    const backdrop = document.getElementById("nav-backdrop");
    const navbar = document.getElementById("main-navbar");
    if (navMenu) navMenu.classList.add("active");
    if (backdrop) backdrop.classList.add("active");
    if (navbar) navbar.classList.add("menu-open");
    document.body.classList.add("mobile-menu-open");
    document.body.style.overflow = "hidden";
  },

  closeMobileMenu() {
    const navMenu = document.getElementById("navbar-menu");
    const backdrop = document.getElementById("nav-backdrop");
    const navbar = document.getElementById("main-navbar");
    if (navMenu) navMenu.classList.remove("active");
    if (backdrop) backdrop.classList.remove("active");
    if (navbar) navbar.classList.remove("menu-open");
    document.body.classList.remove("mobile-menu-open");
    document.body.style.overflow = "";
  },

  navigateTo(viewName) {
    const clean = (viewName || "home").replace("#", "").trim();
    const targetHash = `#${clean}`;

    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
    this.handleRoute(clean);
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  handleRoute(overrideHash) {
    this.clearHomeSearch();
    let hash = (overrideHash !== undefined && overrideHash !== null) ? overrideHash : (window.location.hash.replace("#", "") || "home");
    let scrollToTarget = null;

    let targetAboutTab = null;
    if (hash.startsWith("about-")) {
      targetAboutTab = hash.replace("about-", "");
      hash = "about";
    } else if (hash === "weather") {
      hash = "home";
      setTimeout(() => {
        if (window.WeatherUI && typeof window.WeatherUI.openWeatherModal === "function") {
          window.WeatherUI.openWeatherModal(window.WeatherUI.activeDestId || "paris");
        }
      }, 50);
    } else if (hash === "destinations") {
      hash = "explore";
    } else if (hash === "section-popular") {
      hash = "home";
      scrollToTarget = "section-popular";
    } else if (hash.startsWith("destination-") || hash.startsWith("destination/")) {
      const targetDestId = hash.replace(/^destination[-/]/, "");
      if (targetDestId === "india") {
        hash = "india";
      } else if (DataService.getDestinationById(targetDestId)) {
        this.activeDestId = targetDestId;
        hash = "destination";
      } else {
        hash = "explore";
      }
    } else if (DESTINATIONS.some(d => d.id === hash)) {
      if (hash === "india") {
        hash = "india";
      } else {
        this.activeDestId = hash;
        hash = "destination";
      }
    } else if (hash === "login" || hash === "signin") {
      hash = "home";
      setTimeout(() => {
        if (window.AuthService) AuthService.openAuthModal(null, "login");
      }, 50);
    } else if (hash === "signup" || hash === "register") {
      hash = "home";
      setTimeout(() => {
        if (window.AuthService) AuthService.openAuthModal(null, "signup");
      }, 50);
    }

    const validViews = ["home", "explore", "planner", "favourites", "about", "india", "destination"];
    const view = validViews.includes(hash) ? hash : "home";

    this.activeView = view;

    // Toggle active section
    document.querySelectorAll(".view-section").forEach(sec => {
      sec.classList.remove("active");
    });
    const targetSection = document.getElementById(`view-${view}`);
    if (targetSection) {
      targetSection.classList.add("active");
    }

    // Update active nav link
    document.querySelectorAll(".nav-link").forEach(link => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("#")) {
        const linkView = href.replace("#", "");
        const isExploreActive = (view === "explore" || view === "india" || view === "destination") && (linkView === "explore" || linkView === "destinations");
        link.classList.toggle("active", linkView === view || isExploreActive);
      } else {
        link.classList.remove("active");
      }
    });

    // Update page title
    const viewTitles = {
      home: "Wayvora - Explore. Discover. Travel.",
      explore: "Explore Destinations - Wayvora",
      india: "Explore India - 64 Curated Destinations | Wayvora",
      planner: "Trip Itinerary Planner - Wayvora",
      favourites: "Saved Destinations - Wayvora",
      about: "About Us - Wayvora"
    };

    if (view === "destination" && this.activeDestId) {
      const dest = DataService.getDestinationById(this.activeDestId);
      document.title = dest ? `Explore ${dest.name}, ${dest.country} - Wayvora` : "Explore Destination - Wayvora";
    } else {
      document.title = viewTitles[view] || "Wayvora - Travel Platform";
    }

    // View specific triggers
    if (view === "explore") {
      this.renderExploreView();
    } else if (view === "planner") {
      const plannerEl = document.getElementById("view-planner");
      if (plannerEl) plannerEl.scrollTop = 0;
      if (window.PlannerController && typeof window.PlannerController.render === "function") {
        PlannerController.render();
      }
    } else if (view === "favourites") {
      this.renderFavouritesView();
    } else if (view === "india") {
      this.renderIndiaView();
    } else if (view === "destination") {
      this.renderDestinationPage(this.activeDestId || "paris");
    } else if (view === "about") {
      this.switchAboutTab(targetAboutTab || "mission");
    }

    // Scroll handling
    if (scrollToTarget) {
      setTimeout(() => {
        const el = document.getElementById(scrollToTarget);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
      const plannerEl = document.getElementById("view-planner");
      if (plannerEl) plannerEl.scrollTop = 0;
    }
  },

  // State Subscriptions
  bindGlobalStateEvents() {
    AppState.subscribe("favourites", () => {
      this.updateFavouritesBadge();
      if (this.activeView === "favourites") {
        this.renderFavouritesView();
      }
    });
  },

  updateFavouritesBadge() {
    const favs = AppState.getFavourites();
    const badges = document.querySelectorAll(".fav-count-badge");
    badges.forEach(b => {
      b.textContent = favs.length;
      b.style.display = favs.length > 0 ? "inline-flex" : "none";
    });
  },

  // Currency Selector Controller
  bindCurrencySelector() {
    const selects = [
      document.getElementById("nav-currency-select"),
      document.getElementById("mobile-currency-select")
    ].filter(Boolean);

    if (selects.length === 0 || !window.CurrencyService) return;

    const currentPref = CurrencyService.getPreferredCurrency() || "USD";
    selects.forEach(s => s.value = currentPref);

    const rerenderAllPrices = () => {
      this.renderHomeSections();
      this.renderExploreView();
      if (typeof this.renderIndiaView === "function") this.renderIndiaView();
      if (typeof this.renderFavouritesView === "function") this.renderFavouritesView();
      if (this.activeDestId) this.renderDestinationPage(this.activeDestId);
      if (window.PlannerController && typeof window.PlannerController.render === "function") {
        PlannerController.render();
      }

      // If a destination modal is currently open, re-render it in place with updated currency
      if (window.UI) {
        if (UI.activeDestModalId) {
          const m = document.getElementById("dest-details-modal");
          if (m && m.classList.contains("active")) {
            const dest = DataService.getDestinationById(UI.activeDestModalId);
            if (dest) UI.openDestinationModal(dest.id);
          }
        }
        if (UI.activeIndiaModalId) {
          const m = document.getElementById("india-detail-modal");
          if (m && m.classList.contains("active") && window.IndiaDataService) {
            const item = IndiaDataService.getById(UI.activeIndiaModalId);
            if (item) UI.openIndiaDetailModal(item);
          }
        }
      }
    };

    const onCurrencyChange = (newCurrency) => {
      CurrencyService.setPreferredCurrency(newCurrency);
      selects.forEach(s => s.value = newCurrency);
      const curr = CurrencyService.currencies[newCurrency];
      UI.showToast(
        `Prices converted to ${newCurrency} (${curr?.symbol || ''})`,
        "info"
      );

      // Re-render views
      rerenderAllPrices();
    };

    selects.forEach(select => {
      select.addEventListener("change", (e) => {
        onCurrencyChange(e.target.value);
      });
    });

    window.addEventListener("currency-changed", (e) => {
      const code = e.detail?.currency || CurrencyService.getPreferredCurrency();
      selects.forEach(s => s.value = code);
      rerenderAllPrices();
    });

    window.addEventListener("currency-rates-updated", () => {
      rerenderAllPrices();
    });
  },

  // Home Page Section Renderers & Interactivity
  renderHomeSections() {
    // 1. Popular Destinations Grid (including India as a major destination)
    const popularGrid = document.getElementById("home-popular-grid");
    if (popularGrid) {
      popularGrid.innerHTML = "";
      const indiaDest = DataService.getDestinationById("india");
      const otherPopular = DataService.getPopularDestinations().filter(d => d.id !== "india");
      const popularDests = indiaDest ? [indiaDest, ...otherPopular.slice(0, 5)] : otherPopular.slice(0, 6);
      popularDests.forEach(dest => {
        popularGrid.appendChild(UI.renderDestinationCard(dest));
      });
    }

    // 2. Trending Destinations
    const trendingGrid = document.getElementById("home-trending-grid");
    if (trendingGrid) {
      trendingGrid.innerHTML = "";
      const indiaDest = DataService.getDestinationById("india");
      const otherTrending = DataService.getTrendingDestinations().filter(d => d.id !== "india");
      const trendingDests = indiaDest ? [indiaDest, ...otherTrending.slice(0, 3)] : otherTrending.slice(0, 4);
      trendingDests.forEach(dest => {
        trendingGrid.appendChild(UI.renderDestinationCard(dest));
      });
    }

    // 3. Travel Articles / Inspiration
    const articlesGrid = document.getElementById("home-articles-grid");
    if (articlesGrid) {
      articlesGrid.innerHTML = "";
      const articles = DataService.getArticles();
      articles.forEach(art => {
        const artEl = document.createElement("div");
        artEl.className = "article-card animate-fade-in";
        artEl.innerHTML = `
          <div class="article-media">
            <img src="${art.image}" alt="${art.title}" loading="lazy" />
            <span class="article-category-badge">${art.category}</span>
          </div>
          <div class="article-body">
            <div class="article-meta text-sm text-muted">${art.readTime}</div>
            <h3 class="article-title">${art.title}</h3>
            <p class="article-snippet">${art.snippet}</p>
            <button class="btn-read-article">
              Read Story ${UI.icons.chevronRight}
            </button>
          </div>
        `;

        artEl.querySelector(".btn-read-article").addEventListener("click", () => {
          UI.showToast(`Full article "${art.title}" coming soon in the Wayvora Magazine!`, "info");
        });

        articlesGrid.appendChild(artEl);
      });
    }
  },

  /**
   * Toggle visibility of the "Plan Your Itinerary" area, options,
   * and planning section on the main page while destination search is active.
   */
  setHomeSearchState(isSearching) {
    const heroPlanArea = document.getElementById("hero-plan-itinerary-area");
    const sectionWhyUs = document.getElementById("section-why-us");
    const clearBtn = document.getElementById("hero-clear-search-btn");
    const heroContent = document.querySelector(".hero-content");

    if (isSearching) {
      if (heroPlanArea) heroPlanArea.style.display = "none";
      if (sectionWhyUs) sectionWhyUs.style.display = "none";
      if (clearBtn) clearBtn.style.display = "flex";
      if (heroContent) heroContent.classList.add("search-active");
    } else {
      if (heroPlanArea) heroPlanArea.style.display = "";
      if (sectionWhyUs) sectionWhyUs.style.display = "";
      if (clearBtn) clearBtn.style.display = "none";
      if (heroContent) heroContent.classList.remove("search-active");
    }
  },

  /**
   * Reset the hero destination search input and suggestions,
   * restoring the "Plan Your Itinerary" section and related options.
   */
  clearHomeSearch() {
    const heroInput = document.getElementById("hero-search-input");
    const suggestionsBox = document.getElementById("hero-search-suggestions");
    if (heroInput) heroInput.value = "";
    if (suggestionsBox) {
      suggestionsBox.innerHTML = "";
      suggestionsBox.style.display = "none";
    }
    this.setHomeSearchState(false);
  },

  bindHomeEvents() {
    // Hero Search Bar and Autocomplete Suggestions
    const heroInput = document.getElementById("hero-search-input");
    const heroBtn = document.getElementById("hero-search-btn");
    const heroClearBtn = document.getElementById("hero-clear-search-btn");
    const suggestionsBox = document.getElementById("hero-search-suggestions");

    if (heroInput && suggestionsBox) {
      // 1. User starts typing a destination -> hide "Plan Your Itinerary" & show search results
      heroInput.addEventListener("input", () => {
        const query = heroInput.value.trim().toLowerCase();
        if (query.length === 0) {
          this.clearHomeSearch();
          return;
        }

        // Active searching: Hide the "Plan Your Itinerary" section & options
        this.setHomeSearchState(true);

        let matches = DataService.getAllDestinations().filter(d => 
          d.name.toLowerCase().includes(query) ||
          d.country.toLowerCase().includes(query) ||
          d.tags.some(t => t.toLowerCase().includes(query))
        );

        if (window.IndiaDataService) {
          const inMatches = window.IndiaDataService.search(query).slice(0, 4);
          matches = [...matches, ...inMatches.filter(im => !matches.some(m => m.id === im.id))];
        }
        matches = matches.slice(0, 6);

        if (matches.length === 0) {
          const safeQuery = UI.escapeHTML ? UI.escapeHTML(heroInput.value.trim()) : heroInput.value.trim();
          suggestionsBox.innerHTML = `
            <div class="suggestions-header">
              <span>Destination Search</span>
              <button type="button" class="btn-close-suggestions" id="btn-close-suggestions" title="Close Search" aria-label="Close search">✕</button>
            </div>
            <div class="suggestion-empty">
              <div class="empty-icon">🔍</div>
              <h4>No matching destinations found</h4>
              <p>We couldn't find any destination matching "<strong>${safeQuery}</strong>". Try searching for Paris, Bali, Tokyo, India, Goa, or Switzerland.</p>
            </div>
          `;
          suggestionsBox.style.display = "block";
          document.getElementById("btn-close-suggestions")?.addEventListener("click", () => {
            this.clearHomeSearch();
          });
          return;
        }

        suggestionsBox.innerHTML = `
          <div class="suggestions-header">
            <span>Matching Destinations (${matches.length})</span>
            <button type="button" class="btn-close-suggestions" id="btn-close-suggestions" title="Close Search" aria-label="Close search">✕</button>
          </div>
          <div class="suggestions-list">
            ${matches.map(m => {
              const isIndia = m.id === "india";
              const imgSrc = m.image || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=300&q=80";
              const subText = isIndia ? '64 States, UTs, Cities & Tourist Places' : (m.country || 'India');
              const badgeText = isIndia ? 'Major Destination' : (m.region || m.categoryLabel || 'Destination');
              return `
                <div class="suggestion-item" data-id="${m.id}" data-name="${m.name}" role="button" tabindex="0">
                  <img src="${imgSrc}" alt="${m.name}" class="sugg-thumb" loading="lazy" />
                  <div class="sugg-text">
                    <strong>${m.name}</strong>
                    <span class="text-muted text-xs">${subText}</span>
                  </div>
                  <span class="sugg-badge">${badgeText}</span>
                  <span class="sugg-action">View Details →</span>
                </div>
              `;
            }).join("")}
          </div>
        `;
        suggestionsBox.style.display = "block";

        // Bind Close button in suggestions header
        document.getElementById("btn-close-suggestions")?.addEventListener("click", () => {
          this.clearHomeSearch();
        });

        // Bind suggestion clicks: select destination & restore normal view
        suggestionsBox.querySelectorAll(".suggestion-item").forEach(item => {
          item.addEventListener("click", () => {
            const destId = item.dataset.id;
            this.clearHomeSearch();
            if (destId) {
              if (destId === "india") {
                this.navigateTo("india");
              } else if (destId.startsWith("in-")) {
                const inItem = window.IndiaDataService ? window.IndiaDataService.getById(destId) : null;
                if (inItem) UI.openIndiaDetailModal(inItem);
              } else {
                UI.openDestinationModal(destId);
              }
            }
          });
        });
      });

      // 2. Clear Search button inside search box
      if (heroClearBtn) {
        heroClearBtn.addEventListener("click", (e) => {
          e.preventDefault();
          this.clearHomeSearch();
          heroInput.focus();
        });
      }

      // 3. Escape key clears search and restores section
      heroInput.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          this.clearHomeSearch();
        }
      });

      // 4. Focus back on search: if text exists, restore search state & suggestions
      heroInput.addEventListener("focus", () => {
        if (heroInput.value.trim().length > 0) {
          this.setHomeSearchState(true);
          suggestionsBox.style.display = "block";
        }
      });

      // 5. Hide suggestions when clicking outside
      document.addEventListener("click", (e) => {
        if (!heroInput.contains(e.target) && !suggestionsBox.contains(e.target) && !(heroClearBtn && heroClearBtn.contains(e.target))) {
          if (suggestionsBox.style.display === "block") {
            suggestionsBox.style.display = "none";
            if (heroInput.value.trim().length === 0) {
              this.setHomeSearchState(false);
            }
          }
        }
      });
    }

    if (heroBtn && heroInput) {
      heroBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const query = heroInput.value.trim();
        this.clearHomeSearch();
        this.exploreFilters.query = query;
        this.navigateTo("explore");
        const exploreSearchInput = document.getElementById("explore-search-input");
        if (exploreSearchInput) exploreSearchInput.value = query;
      });

      heroInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          heroBtn.click();
        }
      });
    }

    // Quick filter chips on Home Hero
    document.querySelectorAll(".hero-quick-tag").forEach(tagBtn => {
      tagBtn.addEventListener("click", () => {
        const tag = tagBtn.dataset.tag;
        this.exploreFilters.tag = tag;
        this.navigateTo("explore");
        const tagSelect = document.getElementById("filter-tag-select");
        if (tagSelect) tagSelect.value = tag;
      });
    });

    // Hero Plan Button
    document.getElementById("hero-plan-btn")?.addEventListener("click", (e) => {
      e.preventDefault();
      this.navigateTo("planner");
    });

    // Newsletter Subscribe Form
    const newsletterForm = document.getElementById("newsletter-form");
    if (newsletterForm) {
      newsletterForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const emailInput = document.getElementById("newsletter-email");
        if (emailInput && emailInput.value.trim()) {
          UI.showToast(`Thank you! Weekly travel inspiration will be sent to ${emailInput.value.trim()}`, "success");
          emailInput.value = "";
        }
      });
    }
  },

  // Explore Destinations View Controller
  bindExploreFilters() {
    const searchInput = document.getElementById("explore-search-input");
    const clearBtn = document.getElementById("btn-clear-search");
    const regionPills = document.querySelectorAll(".region-pill");
    const budgetSelect = document.getElementById("filter-budget-select");
    const tagSelect = document.getElementById("filter-tag-select");
    const sortSelect = document.getElementById("filter-sort-select");
    const resetBtn = document.getElementById("btn-reset-filters");

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.exploreFilters.query = e.target.value.trim();
        if (clearBtn) {
          clearBtn.style.display = this.exploreFilters.query ? "block" : "none";
        }
        this.renderExploreView();
      });
    }

    if (clearBtn && searchInput) {
      clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        this.exploreFilters.query = "";
        clearBtn.style.display = "none";
        this.renderExploreView();
      });
    }

    regionPills.forEach(pill => {
      pill.addEventListener("click", () => {
        regionPills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.exploreFilters.region = pill.dataset.region || "All";
        this.renderExploreView();
      });
    });

    if (budgetSelect) {
      budgetSelect.addEventListener("change", (e) => {
        this.exploreFilters.budget = e.target.value;
        this.renderExploreView();
      });
    }

    if (tagSelect) {
      tagSelect.addEventListener("change", (e) => {
        this.exploreFilters.tag = e.target.value;
        this.renderExploreView();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener("change", (e) => {
        this.exploreFilters.sortBy = e.target.value;
        this.renderExploreView();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        this.resetExploreFilters();
      });
    }
  },

  resetExploreFilters() {
    this.exploreFilters = {
      query: "",
      region: "All",
      budget: "All",
      tag: "All",
      sortBy: "popular"
    };

    const searchInput = document.getElementById("explore-search-input");
    if (searchInput) searchInput.value = "";

    const clearBtn = document.getElementById("btn-clear-search");
    if (clearBtn) clearBtn.style.display = "none";

    document.querySelectorAll(".region-pill").forEach(p => {
      p.classList.toggle("active", p.dataset.region === "All");
    });

    const budgetSelect = document.getElementById("filter-budget-select");
    if (budgetSelect) budgetSelect.value = "All";

    const tagSelect = document.getElementById("filter-tag-select");
    if (tagSelect) tagSelect.value = "All";

    const sortSelect = document.getElementById("filter-sort-select");
    if (sortSelect) sortSelect.value = "popular";

    this.renderExploreView();
  },

  renderExploreView() {
    const grid = document.getElementById("explore-destinations-grid");
    const countEl = document.getElementById("explore-results-count");
    if (!grid) return;

    grid.innerHTML = "";

    const results = DataService.searchDestinations(this.exploreFilters.query, {
      region: this.exploreFilters.region,
      budget: this.exploreFilters.budget,
      tag: this.exploreFilters.tag,
      sortBy: this.exploreFilters.sortBy
    });

    if (countEl) {
      countEl.textContent = `Showing ${results.length} destination${results.length === 1 ? '' : 's'}`;
    }

    if (results.length === 0) {
      grid.innerHTML = `
        <div class="empty-results-box col-span-full animate-fade-in">
          <div class="empty-icon-circle">${UI.icons.search}</div>
          <h3>No Destinations Found</h3>
          <p class="text-muted">We couldn't find any destinations matching your criteria. Try adjusting your search query or reset filters.</p>
          <button class="btn btn-outline mt-3" id="btn-empty-reset-filters">
            Reset All Filters
          </button>
        </div>
      `;

      document.getElementById("btn-empty-reset-filters")?.addEventListener("click", () => {
        this.resetExploreFilters();
      });
      return;
    }

    results.forEach(dest => {
      grid.appendChild(UI.renderDestinationCard(dest));
    });
  },

  // Favourites View Controller
  renderFavouritesView() {
    const grid = document.getElementById("favourites-grid");
    const countEl = document.getElementById("favourites-count-text");
    if (!grid) return;

    grid.innerHTML = "";

    const favIds = AppState.getFavourites();
    const favDests = favIds.map(id => DataService.getDestinationById(id)).filter(Boolean);

    if (countEl) {
      countEl.textContent = `${favDests.length} saved destination${favDests.length === 1 ? '' : 's'}`;
    }

    // If visitor is unauthenticated, show a helpful non-blocking sync suggestion banner
    if (window.AuthService && !AuthService.isAuthenticated()) {
      const banner = document.createElement("div");
      banner.className = "col-span-full mb-4 p-3 rounded-lg border border-primary-soft bg-primary-soft text-sm flex items-center justify-between";
      banner.innerHTML = `
        <div style="display:flex;align-items:center;gap:0.6rem;">
          <span>❤️</span>
          <span><strong>Favorites:</strong> Browse and view saved destinations. Sign in to sync your bucket list across devices.</span>
        </div>
        <button class="btn btn-sm btn-outline ml-3" id="btn-fav-guest-signin" style="white-space:nowrap;">Sign In</button>
      `;
      grid.appendChild(banner);
      banner.querySelector("#btn-fav-guest-signin")?.addEventListener("click", () => {
        AuthService.openAuthModal("Sign in to sync your travel bucket list across devices.", "login");
      });
    }

    if (favDests.length === 0) {
      const emptyBox = document.createElement("div");
      emptyBox.className = "empty-favourites-box col-span-full animate-scale-up";
      emptyBox.innerHTML = `
        <div class="empty-icon-circle-lg">${UI.icons.heart}</div>
        <h2>Your Favourites List is Empty</h2>
        <p class="text-lead text-muted">Click the heart icon on any destination card while exploring to save your dream travel bucket list here.</p>
        <a href="#explore" class="btn btn-primary btn-lg mt-4">
          ${UI.icons.compass} Explore Destinations
        </a>
      `;
      grid.appendChild(emptyBox);
      return;
    }

    favDests.forEach(dest => {
      grid.appendChild(UI.renderDestinationCard(dest));
    });
  },

  // ==========================================
  // INDIA DEDICATED TRAVEL PAGE CONTROLLER
  // ==========================================
  bindIndiaEvents() {
    const searchInput = document.getElementById("india-search-input");
    const clearBtn = document.getElementById("india-btn-clear-search");
    const categoryTabs = document.querySelectorAll(".india-tab-btn");
    const subPills = document.querySelectorAll(".india-sub-pill");
    const zoneSelect = document.getElementById("india-zone-select");
    const resetBtn = document.getElementById("india-btn-reset-filters");
    const statPills = document.querySelectorAll(".india-stat-pill");
    const weatherHeroBtn = document.getElementById("india-hero-weather-btn");

    if (weatherHeroBtn) {
      weatherHeroBtn.addEventListener("click", () => {
        if (window.WeatherUI) {
          window.WeatherUI.openWeatherModal("india");
        }
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.indiaFilters.query = e.target.value.trim();
        if (clearBtn) {
          clearBtn.style.display = this.indiaFilters.query ? "block" : "none";
        }
        this.renderIndiaView();
      });
    }

    if (clearBtn && searchInput) {
      clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        this.indiaFilters.query = "";
        clearBtn.style.display = "none";
        this.renderIndiaView();
      });
    }

    // Category Switcher Tabs (All, States & UTs, Cities, Tourist Places)
    categoryTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        categoryTabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        this.indiaFilters.category = tab.dataset.category || "all";

        // Sync hero stat pills
        statPills.forEach(sp => {
          sp.classList.toggle("active", sp.dataset.category === this.indiaFilters.category);
        });

        // Show/hide subfilter row for states & UTs
        const subRow = document.getElementById("india-states-uts-subpills");
        if (subRow) {
          subRow.style.display = (this.indiaFilters.category === "city" || this.indiaFilters.category === "tourist_place") ? "none" : "flex";
        }

        this.renderIndiaView();
      });
    });

    // Hero stat pills click sync
    statPills.forEach(pill => {
      pill.addEventListener("click", () => {
        const cat = pill.dataset.category || "all";
        const matchingTab = document.querySelector(`.india-tab-btn[data-category="${cat}"]`);
        if (matchingTab) {
          matchingTab.click();
        }
      });
    });

    // Sub-pills (All / States / Union Territories)
    subPills.forEach(pill => {
      pill.addEventListener("click", () => {
        subPills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.indiaFilters.subCategory = pill.dataset.sub || "all";
        this.renderIndiaView();
      });
    });

    // Zone Select Dropdown
    if (zoneSelect) {
      zoneSelect.addEventListener("change", (e) => {
        this.indiaFilters.zone = e.target.value;
        this.renderIndiaView();
      });
    }

    // Reset Filters Button
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        this.resetIndiaFilters();
      });
    }
  },

  resetIndiaFilters() {
    this.indiaFilters = {
      query: "",
      category: "all",
      subCategory: "all",
      zone: "all"
    };

    const searchInput = document.getElementById("india-search-input");
    if (searchInput) searchInput.value = "";

    const clearBtn = document.getElementById("india-btn-clear-search");
    if (clearBtn) clearBtn.style.display = "none";

    document.querySelectorAll(".india-tab-btn").forEach(t => {
      t.classList.toggle("active", t.dataset.category === "all");
    });

    document.querySelectorAll(".india-stat-pill").forEach(p => {
      p.classList.toggle("active", p.dataset.category === "all");
    });

    document.querySelectorAll(".india-sub-pill").forEach(p => {
      p.classList.toggle("active", p.dataset.sub === "all");
    });

    const subRow = document.getElementById("india-states-uts-subpills");
    if (subRow) subRow.style.display = "flex";

    const zoneSelect = document.getElementById("india-zone-select");
    if (zoneSelect) zoneSelect.value = "all";

    this.renderIndiaView();
  },

  renderIndiaView() {
    const grid = document.getElementById("india-destinations-grid");
    const countEl = document.getElementById("india-results-count");
    if (!grid || !window.IndiaDataService) return;

    grid.innerHTML = "";

    let list = window.IndiaDataService.getAll();

    // 1. Category filtering
    if (this.indiaFilters.category === "states_uts") {
      if (this.indiaFilters.subCategory === "state") {
        list = list.filter(d => d.category === "state");
      } else if (this.indiaFilters.subCategory === "ut") {
        list = list.filter(d => d.category === "ut");
      } else {
        list = list.filter(d => d.category === "state" || d.category === "ut");
      }
    } else if (this.indiaFilters.category === "city") {
      list = list.filter(d => d.category === "city");
    } else if (this.indiaFilters.category === "tourist_place") {
      list = list.filter(d => d.category === "tourist_place");
    } else {
      // "all" - subCategory may be applied
      if (this.indiaFilters.subCategory === "state") {
        list = list.filter(d => d.category === "state");
      } else if (this.indiaFilters.subCategory === "ut") {
        list = list.filter(d => d.category === "ut");
      }
    }

    // 2. Geographic Zone filtering
    if (this.indiaFilters.zone && this.indiaFilters.zone !== "all") {
      list = list.filter(d => d.zone === this.indiaFilters.zone);
    }

    // 3. Search query filtering
    if (this.indiaFilters.query && this.indiaFilters.query.trim() !== "") {
      const q = this.indiaFilters.query.toLowerCase().trim();
      list = list.filter(d => {
        const nameMatch = d.name.toLowerCase().includes(q);
        const descMatch = (d.shortDescription || "").toLowerCase().includes(q);
        const zoneMatch = (d.zone || "").toLowerCase().includes(q);
        const tagMatch = d.tags && d.tags.some(t => t.toLowerCase().includes(q));
        const attrMatch = d.topAttractions && d.topAttractions.some(a => a.name.toLowerCase().includes(q) || (a.description || "").toLowerCase().includes(q));
        return nameMatch || descMatch || zoneMatch || tagMatch || attrMatch;
      });
    }

    // Update results count
    if (countEl) {
      let catName = "destination";
      if (this.indiaFilters.category === "states_uts") {
        if (this.indiaFilters.subCategory === "state") catName = "state";
        else if (this.indiaFilters.subCategory === "ut") catName = "union territory";
        else catName = "state & union territory";
      } else if (this.indiaFilters.category === "city") {
        catName = "popular city";
      } else if (this.indiaFilters.category === "tourist_place") {
        catName = "tourist landmark";
      }
      countEl.textContent = `Showing ${list.length} ${catName}${list.length === 1 ? '' : 's'}`;
    }

    // Empty state
    if (list.length === 0) {
      grid.innerHTML = `
        <div class="empty-results-box col-span-full animate-fade-in">
          <div class="empty-icon-circle">${UI.icons.search}</div>
          <h3>No Indian Destinations Found</h3>
          <p class="text-muted">No locations matched "${this.indiaFilters.query}". Try a different city, state name, landmark, or reset filters.</p>
          <button class="btn btn-outline mt-3" id="btn-empty-reset-india">
            Reset All India Filters
          </button>
        </div>
      `;
      document.getElementById("btn-empty-reset-india")?.addEventListener("click", () => {
        this.resetIndiaFilters();
      });
      return;
    }

    // Render cards
    list.forEach(item => {
      grid.appendChild(UI.renderIndiaCard(item));
    });
  },

  renderDestinationPage(destId) {
    const dest = DataService.getDestinationById(destId);
    if (!dest) {
      this.navigateTo("explore");
      return;
    }

    const container = document.getElementById("destination-page-content");
    if (!container) return;

    const isFav = AppState.isFavourite(dest.id);
    const displayBudget = window.CurrencyService ? CurrencyService.getDisplayBudget(dest) : { formatted: `${dest.dailyBudgetEstimated}`, isConverted: false, currency: "USD" };
    const breakdown = window.CurrencyService ? CurrencyService.getDisplayBreakdown(dest) : dest.budgetBreakdown;
    const budgetTier = dest.budgetLevel === "$$$$" ? "Luxury" : (dest.budgetLevel === "$$$" ? "Moderate" : (dest.budgetLevel === "$$" ? "Mid-Range" : "Budget-Friendly"));

    container.innerHTML = `
      <div class="destination-detail-page animate-fade-in" style="padding: 2.5rem 0 5rem;">
        <div class="container">
          <!-- Breadcrumb navigation -->
          <nav class="india-breadcrumb" aria-label="Breadcrumb">
            <a href="#home">Home</a>
            <span class="breadcrumb-separator">›</span>
            <a href="#explore">Destinations</a>
            <span class="breadcrumb-separator">›</span>
            <span class="breadcrumb-current">${dest.name}</span>
          </nav>

          <!-- Hero Banner Card -->
          <div class="india-hero-card" style="background-image: url('${dest.heroImage}');">
            <div class="india-hero-bg-overlay"></div>
            <div class="india-hero-content">
              <div class="india-hero-badges">
                <span class="badge badge-primary">${dest.region}</span>
                <span class="badge badge-glass">${dest.seasonTag}</span>
                <span class="badge badge-glass">${budgetTier}</span>
                <button class="badge badge-glass badge-dest-weather" id="dest-hero-weather-btn" title="Check live weather forecast">
                  ☀️ Live Weather Updates
                </button>
              </div>

              <h1 class="india-hero-title">
                Explore <span class="india-gradient-text">${dest.name}</span>
                <span style="font-size: 1.5rem; font-weight: 400; opacity: 0.85; margin-left: 0.5rem;">${dest.country}</span>
              </h1>
              
              <p class="india-hero-desc">
                ${dest.tagline}
              </p>
            </div>
          </div>

          <!-- Quick Info Bar -->
          <div class="modal-quick-bar" style="margin-bottom: 2.5rem; border-radius: var(--radius-lg); background: var(--bg-card); border: 1px solid var(--border-color); padding: 1.5rem; box-shadow: var(--shadow-sm);">
            <div class="quick-bar-item">
              <span class="q-label">Traveler Rating</span>
              <span class="q-val">${UI.icons.star} ${dest.rating.toFixed(1)} (${dest.reviewsCount} reviews)</span>
            </div>
            <div class="quick-bar-item">
              <span class="q-label">Best Visiting Season</span>
              <span class="q-val">${UI.icons.calendar} ${dest.bestTimeToVisit}</span>
            </div>
            <div class="quick-bar-item dest-quick-weather-btn" role="button" tabindex="0" title="Click to view live weather forecast" style="cursor: pointer;">
              <span class="q-label">Current Climate</span>
              <span class="q-val highlight-weather">
                ☀️ ${dest.weather ? dest.weather.temp : '22°C'} • ${dest.weather ? dest.weather.condition : 'Pleasant'}
                <span class="pill-live-mini">Live</span>
              </span>
            </div>
            <div class="quick-bar-item">
              <span class="q-label">Est. Daily Budget</span>
              <span class="q-val highlight">${displayBudget.formatted} / day</span>
            </div>
          </div>

          <!-- In-Depth Overview -->
          <div class="dest-page-card">
            <h2 class="section-title-sm mb-3">About ${dest.name}</h2>
            <p class="dest-page-lead" style="font-size: 1.08rem; line-height: 1.8; color: var(--text-main);">${dest.fullOverview}</p>
            <div class="tags-cloud mt-4">
              ${dest.tags.map(t => `<span class="tag-pill tag-lg">${t}</span>`).join("")}
            </div>
          </div>

          <!-- Top Attractions Showcase -->
          <div class="dest-page-card mt-4">
            <div class="section-header-flex mb-4">
              <div>
                <h2 class="section-title-sm">Top Attractions & Landmarks</h2>
                <p class="text-muted">Must-visit places and iconic sights in ${dest.name}</p>
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
                      onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80';"
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
                        ${UI.icons.plus} Plan in Trip
                      </button>
                    </div>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Things to Do & Local Experiences -->
          <div class="dest-page-card mt-4">
            <h2 class="section-title-sm mb-4">Things to Do & Local Experiences</h2>
            <div class="things-todo-grid">
              ${dest.thingsToDo.map(thing => `
                <div class="todo-item">
                  <span class="todo-icon">${UI.icons.compass}</span>
                  <span>${thing}</span>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Budget Breakdown & Practical Tips -->
          <div class="grid-2-col dest-budget-tips-grid mt-4">
            <div class="budget-card dest-page-subcard">
              <div class="section-header-flex" style="margin-bottom: 0.5rem;">
                <h3 class="card-heading" style="margin-bottom: 0;">${UI.icons.wallet} Estimated Daily Budget</h3>
                <span class="badge badge-outline" style="font-size:0.75rem;">${displayBudget.currency}</span>
              </div>
              <p class="text-sm text-muted mb-3">Mid-range traveler estimate per person (${displayBudget.currency})</p>
              <div class="budget-rows">
                <div class="b-row"><span>Accommodation (Mid-range)</span><strong>${breakdown.accommodation}</strong></div>
                <div class="b-row"><span>Food & Dining</span><strong>${breakdown.food}</strong></div>
                <div class="b-row"><span>Local Transit</span><strong>${breakdown.transport}</strong></div>
                <div class="b-row"><span>Sightseeing & Activities</span><strong>${breakdown.activities}</strong></div>
                <div class="b-row" style="border-top: 1px dashed var(--border-color); padding-top: 0.5rem; margin-top: 0.25rem;">
                  <span><strong>Total Estimated / Day</strong></span>
                  <strong class="highlight" style="font-size: 1.05rem;">${displayBudget.formatted}</strong>
                </div>
              </div>
            </div>

            <div class="tips-card dest-page-subcard">
              <h3 class="card-heading">${UI.icons.info} Essential Travel Tips</h3>
              <ul class="travel-tips-list" style="margin-top: 1rem;">
                ${dest.travelTips.map(tip => `<li>${tip}</li>`).join("")}
              </ul>
            </div>
          </div>

          <!-- Action Bar CTAs -->
          <div class="dest-page-cta-bar mt-4">
            <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
              <button class="btn btn-primary btn-lg" id="dest-page-plan-btn">
                ${UI.icons.plus} Plan a Trip to ${dest.name}
              </button>
              <button class="btn btn-outline btn-lg ${isFav ? 'active' : ''}" id="dest-page-fav-btn">
                ${isFav ? UI.icons.heartFilled : UI.icons.heart}
                <span id="dest-page-fav-text">${isFav ? 'Saved in Favourites' : 'Save to Favourites'}</span>
              </button>
            </div>
            <a href="#explore" class="btn btn-outline">
              ← Back to All Destinations
            </a>
          </div>
        </div>
      </div>
    `;

    // Event listeners
    const weatherHandler = () => {
      if (window.WeatherUI) window.WeatherUI.openWeatherModal(dest.id);
    };
    container.querySelector("#dest-hero-weather-btn")?.addEventListener("click", weatherHandler);
    container.querySelector(".dest-quick-weather-btn")?.addEventListener("click", weatherHandler);

    // Plan trip button (Opens Trip Planner form directly)
    container.querySelector("#dest-page-plan-btn")?.addEventListener("click", () => {
      UI.openTripModalWithDestination(dest.id);
    });

    // Add attraction button (Opens Trip Planner form directly)
    container.querySelectorAll(".btn-add-attr-to-trip").forEach(btn => {
      btn.addEventListener("click", () => {
        UI.openTripModalWithDestination(dest.id);
      });
    });

    // Favourites toggle (Requires Authentication)
    const favBtn = container.querySelector("#dest-page-fav-btn");
    favBtn?.addEventListener("click", () => {
      if (window.AuthService) {
        AuthService.requireAuth(() => {
          const isNowFav = AppState.toggleFavourite(dest.id);
          favBtn.classList.toggle("active", isNowFav);
          favBtn.innerHTML = `
            ${isNowFav ? UI.icons.heartFilled : UI.icons.heart}
            <span id="dest-page-fav-text">${isNowFav ? 'Saved in Favourites' : 'Save to Favourites'}</span>
          `;
          UI.showToast(
            isNowFav ? `Saved ${dest.name} to favourites` : `Removed ${dest.name} from favourites`,
            isNowFav ? "heart" : "info"
          );
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
  }
};

// Expose globally
if (typeof window !== "undefined") {
  window.App = App;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = App;
}

// Auto-run on DOM ready or immediately if already loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    App.init();
  });
} else {
  App.init();
}
