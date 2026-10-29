/**
 * Wayvora - Authentication & Account Management Service
 * Supports Google Firebase Authentication (Email/Password) with Cloud Firestore sync,
 * robust form validation, session persistence, and protected feature guards.
 */

const AuthService = {
  currentUser: null,
  firebaseActive: false,
  firebaseApp: null,
  firebaseAuth: null,
  firestore: null,
  pendingAction: null,
  authSubscribers: [],
  icons: {
    eye: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
    eyeOff: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-eye-off"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>`
  },

  init() {
    this.initFirebase();
    this.bindGlobalAuthEvents();
    this.updateNavbarUI();
  },

  /**
   * Attempt to initialize Firebase SDK if configured.
   */
  initFirebase() {
    const isConfigured = window.isFirebaseConfigured ? window.isFirebaseConfigured() : false;
    const hasSdk = typeof firebase !== "undefined" && firebase.initializeApp;

    if (hasSdk && isConfigured) {
      try {
        this.firebaseApp = window.firebaseApp || (!firebase.apps.length ? firebase.initializeApp(window.FIREBASE_CONFIG) : firebase.app());
        this.firebaseAuth = window.firebaseAuth || (firebase.auth ? firebase.auth() : null);
        this.firestore = window.firestore || (firebase.firestore ? firebase.firestore() : null);

        window.firebaseApp = this.firebaseApp;
        window.firebaseAuth = this.firebaseAuth;
        window.firestore = this.firestore;

        if (firebase.analytics && window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.measurementId) {
          try { firebase.analytics(); } catch (e) { /* optional analytics */ }
        }
        this.firebaseActive = true;
        console.log("Firebase Auth & Cloud Services successfully initialized.");

        // Subscribe to live Firebase auth changes
        this.firebaseAuth.onAuthStateChanged((user) => {
          if (user) {
            this.currentUser = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || user.email.split("@")[0],
              photoURL: user.photoURL || null,
              isAnonymous: user.isAnonymous
            };
          } else {
            this.currentUser = null;
          }
          this.notifyAuthSubscribers(this.currentUser);
          this.updateNavbarUI();
          this.handleAuthStateChange(this.currentUser);
        });

      } catch (err) {
        console.warn("Failed to initialize Firebase:", err);
        this.firebaseActive = false;
        this.loadLocalCachedSession();
      }
    } else {
      this.firebaseActive = false;
      this.loadLocalCachedSession();
    }
  },

  /**
   * Load local cached session for developer testing or demo use
   */
  loadLocalCachedSession() {
    try {
      const stored = localStorage.getItem("wayvora_active_user");
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    } catch (e) {
      this.currentUser = null;
    }
    this.updateNavbarUI();
    this.handleAuthStateChange(this.currentUser);
  },

  isConfigured() {
    return this.firebaseActive;
  },

  isAuthenticated() {
    return !!this.currentUser;
  },

  getCurrentUser() {
    return this.currentUser;
  },

  onAuthStateChanged(callback) {
    if (typeof callback === "function") {
      this.authSubscribers.push(callback);
      // Immediately call with current state
      callback(this.currentUser);
    }
  },

  notifyAuthSubscribers(user) {
    this.authSubscribers.forEach(cb => {
      try { cb(user); } catch (e) { console.error("Error in auth subscriber:", e); }
    });
  },

  /**
   * Handle internal state updates when user logs in or out
   */
  handleAuthStateChange(user) {
    if (window.AppState) {
      if (user) {
        AppState.setUser(user.uid);
      } else {
        AppState.setUser(null);
      }
    }

    if (window.App && typeof App.updateFavouritesBadge === "function") {
      App.updateFavouritesBadge();
    }
  },

  // =================== AUTH ACTIONS ===================

  /**
   * Sign In with Email & Password
   */
  async signIn(email, password) {
    this.validateCredentials(email, password);

    if (this.firebaseActive && this.firebaseAuth) {
      try {
        const userCred = await this.firebaseAuth.signInWithEmailAndPassword(email, password);
        const user = userCred.user;
        this.currentUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email.split("@")[0],
          photoURL: user.photoURL || null
        };
        this.closeAuthModal();
        this.executePendingAction();
        return this.currentUser;
      } catch (err) {
        throw new Error(this.getHumanReadableError(err));
      }
    } else {
      // Firebase is not configured with live credentials
      throw new Error(
        "Firebase credentials not detected. Please add your Firebase API keys to js/firebase-config.js, or use 'Try Demo Account' to test features."
      );
    }
  },

  /**
   * Create Account with Name, Email & Password
   */
  async signUp(name, email, password) {
    this.validateCredentials(email, password);
    if (!name || name.trim().length < 2) {
      throw new Error("Please enter your full name (at least 2 characters).");
    }

    if (this.firebaseActive && this.firebaseAuth) {
      try {
        const userCred = await this.firebaseAuth.createUserWithEmailAndPassword(email, password);
        const user = userCred.user;

        // Set user display name
        if (name && user.updateProfile) {
          await user.updateProfile({ displayName: name.trim() });
        }

        this.currentUser = {
          uid: user.uid,
          email: user.email,
          displayName: name.trim(),
          photoURL: null
        };

        // If Firestore is available, initialize user profile document
        if (this.firestore) {
          try {
            await this.firestore.collection("users").doc(user.uid).set({
              uid: user.uid,
              name: name.trim(),
              email: email.trim().toLowerCase(),
              createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
          } catch (fsErr) {
            console.warn("Firestore user profile save error (non-fatal):", fsErr);
          }
        }

        this.closeAuthModal();
        this.executePendingAction();
        return this.currentUser;
      } catch (err) {
        throw new Error(this.getHumanReadableError(err));
      }
    } else {
      throw new Error(
        "Firebase credentials not detected. Please add your Firebase API keys to js/firebase-config.js, or use 'Try Demo Account' to test features."
      );
    }
  },

  /**
   * Password Reset Email
   */
  async resetPassword(email) {
    if (!email || !this.isValidEmail(email)) {
      throw new Error("Please enter a valid email address.");
    }

    if (this.firebaseActive && this.firebaseAuth) {
      try {
        await this.firebaseAuth.sendPasswordResetEmail(email);
        return true;
      } catch (err) {
        throw new Error(this.getHumanReadableError(err));
      }
    } else {
      throw new Error(
        "Firebase credentials not detected. Please add your Firebase API keys to js/firebase-config.js to send live password reset emails."
      );
    }
  },

  /**
   * Demo Mode Login (Allows testing all protected features even before user pastes keys)
   */
  loginDemoUser(customName = "Alex Explorer", customEmail = "alex.traveler@wayvora.com") {
    const demoUser = {
      uid: "demo-traveler-uid-42",
      email: customEmail,
      displayName: customName,
      photoURL: null,
      isDemo: true
    };

    this.currentUser = demoUser;
    localStorage.setItem("wayvora_active_user", JSON.stringify(demoUser));
    this.notifyAuthSubscribers(demoUser);
    this.updateNavbarUI();
    this.handleAuthStateChange(demoUser);

    if (window.UI) {
      UI.showToast(`Welcome, ${demoUser.displayName}! Signed in (Demo Mode)`, "success");
    }

    this.closeAuthModal();
    this.executePendingAction();
    return demoUser;
  },

  /**
   * Sign Out
   */
  async signOut() {
    if (this.firebaseActive && this.firebaseAuth) {
      try {
        await this.firebaseAuth.signOut();
      } catch (e) {
        console.warn("Firebase sign out error:", e);
      }
    }

    this.currentUser = null;
    localStorage.removeItem("wayvora_active_user");
    this.notifyAuthSubscribers(null);
    this.updateNavbarUI();
    this.handleAuthStateChange(null);

    if (window.UI) {
      UI.showToast("You have been signed out.", "info");
    }
  },

  // =================== FEATURE PROTECTION & INTENT RESUMPTION ===================

  /**
   * Guard for protected actions (Saving favourites, planning trips, itinerary saving).
   * If authenticated: invokes callback immediately.
   * If unauthenticated: shows login modal with context, stores pending action, and resumes upon login.
   */
  requireAuth(callback, pendingActionData = null) {
    if (this.isAuthenticated()) {
      if (typeof callback === "function") {
        callback();
      }
      return true;
    }

    // Store pending intent
    this.pendingAction = {
      callback: callback,
      data: pendingActionData
    };

    let reasonPrompt = "Please sign in to access your personal travel features.";
    if (pendingActionData && pendingActionData.label) {
      reasonPrompt = `Please sign in to ${pendingActionData.label}.`;
    }

    this.openAuthModal(reasonPrompt);
    return false;
  },

  /**
   * Resumes the user's intended action after successful authentication.
   */
  executePendingAction() {
    if (!this.pendingAction) return;

    const action = this.pendingAction;
    this.pendingAction = null;

    setTimeout(() => {
      if (typeof action.callback === "function") {
        action.callback();
      } else if (action.data) {
        if (action.data.type === "route" && action.data.route) {
          window.location.hash = `#${action.data.route}`;
        } else if (action.data.type === "favourite" && action.data.destinationId) {
          if (window.AppState) {
            const isNowFav = AppState.toggleFavourite(action.data.destinationId);
            if (window.UI) {
              UI.showToast(isNowFav ? "Destination saved to your favourites!" : "Removed from favourites", isNowFav ? "heart" : "info");
            }
          }
        } else if (action.data.type === "plan_trip" && action.data.destinationId) {
          if (window.UI) {
            UI.openTripModalWithDestination(action.data.destinationId);
          }
        } else if (action.data.type === "generate_trip" && action.data.tripData) {
          const t = action.data.tripData;
          if (window.AppState) {
            const selectedDest = window.DataService ? DataService.getDestinationById(t.destId) : null;
            const destCurrency = window.CurrencyService ? CurrencyService.getDestinationCurrency(selectedDest || t.destId) : "USD";
            const newTrip = AppState.createNewTrip({
              title: t.title || "Vacation",
              destinationId: t.destId,
              destinationName: selectedDest ? selectedDest.name : (t.destId.toUpperCase()),
              country: selectedDest ? selectedDest.country : "",
              startDate: t.startDate,
              endDate: t.endDate,
              travelers: t.travelers,
              targetBudget: t.targetBudget,
              currency: destCurrency
            });
            AppState.saveTrip(newTrip);
            AppState.setActiveTripId(newTrip.id);
            if (window.UI) UI.showToast(`Itinerary for ${newTrip.title} created!`, "success");
            window.location.hash = "#planner";
            if (window.Planner) Planner.render();
          }
        }
      }
    }, 250);
  },

  // =================== VALIDATION & HELPERS ===================

  validateCredentials(email, password) {
    if (!email || !this.isValidEmail(email)) {
      throw new Error("Please enter a valid email address.");
    }
    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }
  },

  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  },

  getHumanReadableError(err) {
    if (!err) return "An unexpected error occurred. Please try again.";
    const code = err.code || "";
    const msg = err.message || "";

    switch (code) {
      case "auth/invalid-email":
        return "The email address is formatted incorrectly.";
      case "auth/user-not-found":
        return "No account found with this email address. Please verify your email or create an account.";
      case "auth/missing-email":
        return "Please enter your registered email address.";
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Incorrect email or password. Please verify and try again.";
      case "auth/email-already-in-use":
        return "An account with this email address already exists. Try signing in instead.";
      case "auth/weak-password":
        return "Password is too weak. Please use at least 6 characters.";
      case "auth/network-request-failed":
        return "Network connection issue. Please check your internet connection.";
      case "auth/too-many-requests":
        return "Too many unsuccessful attempts. Please wait a few moments before trying again.";
      default:
        return msg || "Authentication request failed. Please check your credentials.";
    }
  },

  // =================== UI BINDINGS & MODAL CONTROLLERS ===================

  bindGlobalAuthEvents() {
    // Top nav auth button
    document.getElementById("nav-auth-btn")?.addEventListener("click", () => {
      this.openAuthModal();
    });

    // Mobile nav auth button
    document.getElementById("nav-mobile-auth-btn")?.addEventListener("click", () => {
      if (window.App && App.closeMobileMenu) App.closeMobileMenu();
      this.openAuthModal();
    });

    // User profile dropdown toggle
    const userBtn = document.getElementById("nav-user-btn");
    const dropdown = document.getElementById("user-menu-dropdown");
    if (userBtn && dropdown) {
      userBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.contains("active");
        dropdown.classList.toggle("active", !isOpen);
        userBtn.setAttribute("aria-expanded", String(!isOpen));
      });

      document.addEventListener("click", (e) => {
        if (!dropdown.contains(e.target) && !userBtn.contains(e.target)) {
          dropdown.classList.remove("active");
          userBtn.setAttribute("aria-expanded", "false");
        }
      });
    }

    // Sign out button
    document.getElementById("btn-user-logout")?.addEventListener("click", () => {
      if (dropdown) dropdown.classList.remove("active");
      this.signOut();
    });

    // Mobile sign out button
    document.getElementById("btn-user-logout-mobile")?.addEventListener("click", () => {
      if (window.App && App.closeMobileMenu) App.closeMobileMenu();
      this.signOut();
    });
  },

  updateNavbarUI() {
    const unauthWrapper = document.getElementById("nav-auth-unauth");
    const authWrapper = document.getElementById("nav-auth-authenticated");
    const mobileUnauth = document.getElementById("mobile-auth-unauth");
    const mobileAuth = document.getElementById("mobile-auth-authenticated");

    const avatarInitial = document.getElementById("user-avatar-initials");
    const displayNameEl = document.getElementById("user-display-name");
    const menuNameEl = document.getElementById("user-menu-name");
    const menuEmailEl = document.getElementById("user-menu-email");

    const mobileMenuNameEl = document.getElementById("mobile-user-name");
    const mobileMenuEmailEl = document.getElementById("mobile-user-email");
    const mobileAvatarInitial = document.getElementById("mobile-user-avatar");

    if (this.currentUser) {
      const name = this.currentUser.displayName || "Traveler";
      const initial = name.charAt(0).toUpperCase();

      if (unauthWrapper) unauthWrapper.style.display = "none";
      if (authWrapper) authWrapper.style.display = "flex";
      if (mobileUnauth) mobileUnauth.style.display = "none";
      if (mobileAuth) mobileAuth.style.display = "block";

      if (avatarInitial) avatarInitial.textContent = initial;
      if (displayNameEl) displayNameEl.textContent = name;
      if (menuNameEl) menuNameEl.textContent = name;
      if (menuEmailEl) menuEmailEl.textContent = this.currentUser.email || "";

      if (mobileAvatarInitial) mobileAvatarInitial.textContent = initial;
      if (mobileMenuNameEl) mobileMenuNameEl.textContent = name;
      if (mobileMenuEmailEl) mobileMenuEmailEl.textContent = this.currentUser.email || "";
    } else {
      if (unauthWrapper) unauthWrapper.style.display = "flex";
      if (authWrapper) authWrapper.style.display = "none";
      if (mobileUnauth) mobileUnauth.style.display = "block";
      if (mobileAuth) mobileAuth.style.display = "none";
    }
  },

  /**
   * Open the Authentication Modal
   */
  openAuthModal(reasonPrompt = null, initialTab = "login") {
    let modal = document.getElementById("auth-modal");
    if (!modal) {
      this.createAuthModalDOM();
      modal = document.getElementById("auth-modal");
    }

    const reasonEl = document.getElementById("auth-modal-reason");
    if (reasonEl) {
      if (reasonPrompt) {
        reasonEl.textContent = reasonPrompt;
        reasonEl.style.display = "block";
      } else {
        reasonEl.style.display = "none";
      }
    }

    // Update status banner for Firebase connection
    this.updateFirebaseStatusBanner();

    // Switch to initial tab
    this.switchAuthTab(initialTab);

    // Clear any previous error messages
    this.setAuthError("");

    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    // Reset dialog scroll position to top
    const dialog = modal.querySelector(".auth-dialog");
    if (dialog) dialog.scrollTop = 0;
  },

  closeAuthModal() {
    const modal = document.getElementById("auth-modal");
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
  },

  switchAuthTab(tabName) {
    const tabsNav = document.getElementById("auth-tabs-nav");
    if (tabsNav) {
      tabsNav.style.display = tabName === "forgot" ? "none" : "flex";
    }

    const tabs = document.querySelectorAll(".auth-tab-btn");
    tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === tabName));

    const panels = {
      login: document.getElementById("auth-panel-login"),
      signup: document.getElementById("auth-panel-signup"),
      forgot: document.getElementById("auth-panel-forgot")
    };

    Object.keys(panels).forEach(key => {
      if (panels[key]) {
        panels[key].style.display = key === tabName ? "block" : "none";
      }
    });

    // If switching to forgot password, prefill email if user already typed in login
    if (tabName === "forgot") {
      const loginEmail = document.getElementById("login-email")?.value.trim();
      const forgotEmail = document.getElementById("forgot-email");
      if (loginEmail && forgotEmail && !forgotEmail.value) {
        forgotEmail.value = loginEmail;
      }
    }

    this.setAuthError("");
    this.setAuthSuccess("");

    // Reset scroll position to top when switching auth panels
    const dialog = document.querySelector(".auth-dialog");
    if (dialog) dialog.scrollTop = 0;

    // Reset any revealed password fields back to masked
    document.querySelectorAll(".btn-toggle-password").forEach(btn => {
      const targetId = btn.getAttribute("data-target");
      const input = document.getElementById(targetId);
      if (input && input.type === "text") {
        input.type = "password";
        btn.innerHTML = this.icons.eye;
        btn.setAttribute("aria-label", "Show password");
        btn.setAttribute("title", "Show password");
        btn.classList.remove("is-revealed");
      }
    });
  },

  setAuthError(message) {
    const errContainer = document.getElementById("auth-error-banner");
    if (errContainer) {
      if (message) {
        errContainer.textContent = message;
        errContainer.style.display = "block";
      } else {
        errContainer.textContent = "";
        errContainer.style.display = "none";
      }
    }
  },

  setAuthSuccess(message) {
    const succContainer = document.getElementById("auth-success-banner");
    if (succContainer) {
      if (message) {
        succContainer.textContent = message;
        succContainer.style.display = "block";
      } else {
        succContainer.textContent = "";
        succContainer.style.display = "none";
      }
    }
  },

  updateFirebaseStatusBanner() {
    const banner = document.getElementById("auth-firebase-status-banner");
    if (!banner) return;

    const isConfigured = window.isFirebaseConfigured ? window.isFirebaseConfigured() : false;
    if (isConfigured) {
      banner.className = "auth-config-banner banner-live";
      banner.innerHTML = `
        <span class="status-dot dot-live"></span>
        <span><strong>Live Backend:</strong> Connected to Google Firebase Authentication</span>
      `;
    } else {
      banner.className = "auth-config-banner banner-pending";
      banner.innerHTML = `
        <div class="banner-top-row">
          <span class="status-dot dot-pending"></span>
          <span><strong>Firebase Configuration Needed:</strong> Live cloud authentication requires your Firebase keys in <code>js/firebase-config.js</code>.</span>
        </div>
        <div class="banner-actions-row">
          <button type="button" class="btn btn-xs btn-outline" id="btn-view-setup-guide">View Setup Instructions</button>
          <button type="button" class="btn btn-xs btn-primary-soft" id="btn-quick-demo-login">Test Demo Account</button>
        </div>
      `;

      banner.querySelector("#btn-view-setup-guide")?.addEventListener("click", () => {
        this.openSetupGuideModal();
      });

      banner.querySelector("#btn-quick-demo-login")?.addEventListener("click", () => {
        this.loginDemoUser();
      });
    }
  },

  /**
   * Create dynamic Auth modal DOM structure
   */
  createAuthModalDOM() {
    let modal = document.createElement("div");
    modal.id = "auth-modal";
    modal.className = "modal-overlay auth-modal-overlay";

    modal.innerHTML = `
      <div class="modal-dialog auth-dialog animate-scale-up" role="dialog" aria-modal="true">
        <button class="modal-close-btn" id="auth-modal-close" aria-label="Close dialog">
          ${window.UI ? UI.icons.x : '✕'}
        </button>

        <div class="auth-header">
          <div class="brand-icon-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
            </svg>
          </div>
          <h2 class="auth-title">Wayvora Account</h2>
          <p class="auth-subtitle">Sign in to save your personal itineraries, sync bucket lists, and plan trips.</p>
          <div class="auth-context-reason" id="auth-modal-reason" style="display: none;"></div>
        </div>

        <!-- Firebase status info banner -->
        <div id="auth-firebase-status-banner" class="auth-config-banner banner-pending"></div>

        <!-- Feedback error / success banners -->
        <div class="auth-alert alert-error" id="auth-error-banner" style="display: none;"></div>
        <div class="auth-alert alert-success" id="auth-success-banner" style="display: none;"></div>

        <!-- Auth Tabs (Sign In & Create Account only) -->
        <div class="auth-tabs-nav" id="auth-tabs-nav">
          <button class="auth-tab-btn active" data-tab="login">Sign In</button>
          <button class="auth-tab-btn" data-tab="signup">Create Account</button>
        </div>

        <!-- ================= PANEL 1: LOGIN ================= -->
        <div class="auth-panel" id="auth-panel-login">
          <form id="form-auth-login" class="auth-form" novalidate>
            <div class="form-group">
              <label for="login-email">Email Address</label>
              <div class="input-with-icon">
                <span class="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </span>
                <input type="email" id="login-email" class="form-control" placeholder="name@example.com" required autocomplete="email" />
              </div>
            </div>

            <div class="form-group mb-1">
              <label for="login-password">Password</label>
              <div class="input-with-icon">
                <span class="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </span>
                <input type="password" id="login-password" class="form-control has-toggle-password" placeholder="••••••••" required autocomplete="current-password" />
                <button type="button" class="btn-toggle-password" data-target="login-password" aria-label="Show password" title="Show password">
                  ${this.icons.eye}
                </button>
              </div>
            </div>

            <!-- Single Forgot Password link directly below password input -->
            <div class="auth-forgot-link-wrap">
              <button type="button" class="btn-text-link" id="link-goto-forgot">Forgot Password?</button>
            </div>

            <button type="submit" class="btn btn-primary btn-block btn-lg mt-3" id="btn-submit-login">
              Sign In to Wayvora
            </button>
          </form>

          <div class="auth-footer-prompt">
            <span>Don't have an account yet?</span>
            <button type="button" class="btn-text-link font-semibold" id="link-goto-signup">Create one now</button>
          </div>
        </div>

        <!-- ================= PANEL 2: SIGN UP ================= -->
        <div class="auth-panel" id="auth-panel-signup" style="display: none;">
          <form id="form-auth-signup" class="auth-form" novalidate>
            <div class="form-group">
              <label for="signup-name">Full Name</label>
              <div class="input-with-icon">
                <span class="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </span>
                <input type="text" id="signup-name" class="form-control" placeholder="e.g. Maya Sharma" required autocomplete="name" />
              </div>
            </div>

            <div class="form-group">
              <label for="signup-email">Email Address</label>
              <div class="input-with-icon">
                <span class="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </span>
                <input type="email" id="signup-email" class="form-control" placeholder="name@example.com" required autocomplete="email" />
              </div>
            </div>

            <div class="form-group">
              <label for="signup-password">Password (minimum 6 characters)</label>
              <div class="input-with-icon">
                <span class="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </span>
                <input type="password" id="signup-password" class="form-control has-toggle-password" placeholder="At least 6 characters" minlength="6" required autocomplete="new-password" />
                <button type="button" class="btn-toggle-password" data-target="signup-password" aria-label="Show password" title="Show password">
                  ${this.icons.eye}
                </button>
              </div>
            </div>

            <div class="form-group">
              <label for="signup-confirm-password">Confirm Password</label>
              <div class="input-with-icon">
                <span class="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </span>
                <input type="password" id="signup-confirm-password" class="form-control has-toggle-password" placeholder="Repeat your password" minlength="6" required autocomplete="new-password" />
                <button type="button" class="btn-toggle-password" data-target="signup-confirm-password" aria-label="Show password" title="Show password">
                  ${this.icons.eye}
                </button>
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-block btn-lg mt-3" id="btn-submit-signup">
              Create My Free Account
            </button>
          </form>

          <div class="auth-footer-prompt">
            <span>Already have an account?</span>
            <button type="button" class="btn-text-link font-semibold" id="link-goto-login">Sign in instead</button>
          </div>
        </div>

        <!-- ================= PANEL 3: FORGOT PASSWORD ================= -->
        <div class="auth-panel" id="auth-panel-forgot" style="display: none;">
          <div class="auth-panel-header mb-3">
            <h3 class="font-bold text-lg" style="color: var(--text-main); margin-bottom: 0.25rem;">Reset Your Password</h3>
            <p class="text-muted text-sm">
              Enter the email address registered with your Wayvora account. We will send a secure Firebase password-reset link to your inbox.
            </p>
          </div>

          <form id="form-auth-forgot" class="auth-form" novalidate>
            <div class="form-group">
              <label for="forgot-email">Registered Email Address</label>
              <div class="input-with-icon">
                <span class="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </span>
                <input type="email" id="forgot-email" class="form-control" placeholder="name@example.com" required autocomplete="email" />
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-block btn-lg mt-3" id="btn-submit-forgot">
              Send Password Reset Link
            </button>
          </form>

          <div class="auth-footer-prompt mt-3">
            <button type="button" class="btn-text-link font-semibold" id="link-back-login">← Back to Sign In</button>
          </div>
        </div>

      </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    modal.querySelector("#auth-modal-close")?.addEventListener("click", () => this.closeAuthModal());
    modal.addEventListener("click", (e) => {
      if (e.target === modal) this.closeAuthModal();
    });

    // Tab buttons
    modal.querySelectorAll(".auth-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => this.switchAuthTab(btn.dataset.tab));
    });

    // Quick switch links
    modal.querySelector("#link-goto-signup")?.addEventListener("click", () => this.switchAuthTab("signup"));
    modal.querySelector("#link-goto-login")?.addEventListener("click", () => this.switchAuthTab("login"));
    modal.querySelector("#link-goto-forgot")?.addEventListener("click", () => this.switchAuthTab("forgot"));
    modal.querySelector("#link-back-login")?.addEventListener("click", () => this.switchAuthTab("login"));

    // Toggle Password Visibility (Show / Hide Password)
    modal.querySelectorAll(".btn-toggle-password").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const targetId = btn.getAttribute("data-target");
        const input = document.getElementById(targetId);
        if (!input) return;

        const isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";
        btn.innerHTML = isPassword ? this.icons.eyeOff : this.icons.eye;
        btn.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
        btn.setAttribute("title", isPassword ? "Hide password" : "Show password");
        btn.classList.toggle("is-revealed", isPassword);
        input.focus();
      });
    });

    // Form Submissions
    // 1. Login
    modal.querySelector("#form-auth-login")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      this.setAuthError("");
      const email = document.getElementById("login-email").value.trim();
      const pass = document.getElementById("login-password").value;
      const submitBtn = document.getElementById("btn-submit-login");

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = "Signing In...";
        await this.signIn(email, pass);
        if (window.UI) UI.showToast("Signed in successfully!", "success");
      } catch (err) {
        this.setAuthError(err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Sign In to Wayvora";
      }
    });

    // 2. Sign Up
    modal.querySelector("#form-auth-signup")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      this.setAuthError("");
      const name = document.getElementById("signup-name").value.trim();
      const email = document.getElementById("signup-email").value.trim();
      const pass = document.getElementById("signup-password").value;
      const confirmPass = document.getElementById("signup-confirm-password").value;
      const submitBtn = document.getElementById("btn-submit-signup");

      if (pass !== confirmPass) {
        this.setAuthError("Passwords do not match. Please re-enter.");
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = "Creating Account...";
        await this.signUp(name, email, pass);
        if (window.UI) UI.showToast(`Welcome to Wayvora, ${name}!`, "success");
      } catch (err) {
        this.setAuthError(err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Create My Free Account";
      }
    });

    // 3. Forgot Password
    modal.querySelector("#form-auth-forgot")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      this.setAuthError("");
      this.setAuthSuccess("");
      const email = document.getElementById("forgot-email").value.trim();
      const submitBtn = document.getElementById("btn-submit-forgot");

      if (!email) {
        this.setAuthError("Please enter your registered email address.");
        return;
      }

      if (!this.isValidEmail(email)) {
        this.setAuthError("Please enter a valid email address (e.g. name@example.com).");
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending Reset Link...";
        await this.resetPassword(email);
        this.setAuthSuccess(`Password reset email sent! Please check your inbox at ${email} for instructions to reset your password.`);
        if (window.UI) UI.showToast("Password reset link sent to your email!", "success");
      } catch (err) {
        this.setAuthError(err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Password Reset Link";
      }
    });
  },

  /**
   * Dedicated modal displaying exact Firebase setup steps
   */
  openSetupGuideModal() {
    let guideModal = document.getElementById("firebase-setup-guide-modal");
    if (!guideModal) {
      guideModal = document.createElement("div");
      guideModal.id = "firebase-setup-guide-modal";
      guideModal.className = "modal-overlay";
      document.body.appendChild(guideModal);
    }

    guideModal.innerHTML = `
      <div class="modal-dialog modal-lg animate-scale-up" role="dialog" aria-modal="true" style="max-width: 680px;">
        <button class="modal-close-btn" id="guide-modal-close" aria-label="Close dialog">
          ${window.UI ? UI.icons.x : '✕'}
        </button>

        <div class="modal-header-simple">
          <div class="icon-circle bg-primary-soft">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 9.4 7.55 4.24a1.78 1.78 0 0 0-2.5 1.55v12.42a1.78 1.78 0 0 0 2.5 1.55L16.5 14.6a1.78 1.78 0 0 0 0-3.2z"></path></svg>
          </div>
          <div>
            <h3>Google Firebase Setup Guide</h3>
            <p class="text-muted text-sm">Step-by-step instructions to connect live Firebase Authentication</p>
          </div>
        </div>

        <div class="guide-steps-list" style="max-height: 60vh; overflow-y: auto; padding-right: 0.5rem;">
          <div class="guide-step-card">
            <div class="step-badge">Step 1</div>
            <div class="step-content">
              <h4>Open Firebase Console</h4>
              <p>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener">https://console.firebase.google.com/</a> and log in with your Google account.</p>
            </div>
          </div>

          <div class="guide-step-card">
            <div class="step-badge">Step 2</div>
            <div class="step-content">
              <h4>Create or Select a Firebase Project</h4>
              <p>Click <strong>"Add project"</strong>, enter a name like <code>Wayvora Travel</code>, and follow the simple on-screen prompts.</p>
            </div>
          </div>

          <div class="guide-step-card">
            <div class="step-badge">Step 3</div>
            <div class="step-content">
              <h4>Add a Web App (<code>&lt;/&gt;</code>)</h4>
              <p>In the project dashboard, click the Web icon (<code>&lt;/&gt;</code>) to register an app. Name it <code>Wayvora Web</code>.</p>
              <p>Firebase will display your configuration credentials containing <code>apiKey</code>, <code>projectId</code>, <code>authDomain</code>, etc.</p>
            </div>
          </div>

          <div class="guide-step-card">
            <div class="step-badge">Step 4</div>
            <div class="step-content">
              <h4>Enable Email / Password Sign-In</h4>
              <p>In the left sidebar, navigate to <strong>Build → Authentication → Sign-in method</strong>.</p>
              <p>Click on <strong>Email/Password</strong>, switch the <strong>Enable</strong> toggle to ON, and save.</p>
            </div>
          </div>

          <div class="guide-step-card">
            <div class="step-badge">Step 5</div>
            <div class="step-content">
              <h4>Paste Keys into <code>js/firebase-config.js</code></h4>
              <p>Open <code>c:\\Users\\HP\\Desktop\\Wayvora\\js\\firebase-config.js</code> in your editor and paste the values into the <code>FIREBASE_CONFIG</code> object:</p>
              <pre class="code-preview-block"><code>const FIREBASE_CONFIG = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef..."
};</code></pre>
            </div>
          </div>

          <div class="guide-step-card">
            <div class="step-badge">Step 6 (Optional)</div>
            <div class="step-content">
              <h4>Enable Cloud Firestore (For Cloud Data Sync)</h4>
              <p>Go to <strong>Build → Firestore Database → Create database</strong> (choose Start in Test mode for development). Users' saved trips and favourites will automatically sync across devices!</p>
            </div>
          </div>
        </div>

        <div class="modal-form-actions mt-4">
          <button type="button" class="btn btn-primary" id="btn-close-guide">Understood, Got It!</button>
        </div>
      </div>
    `;

    guideModal.classList.add("active");

    const close = () => guideModal.classList.remove("active");
    guideModal.querySelector("#guide-modal-close").addEventListener("click", close);
    guideModal.querySelector("#btn-close-guide").addEventListener("click", close);
    guideModal.addEventListener("click", (e) => {
      if (e.target === guideModal) close();
    });
  }
};

// Global export
window.AuthService = AuthService;

if (typeof module !== "undefined" && module.exports) {
  module.exports = AuthService;
}

// Auto initialize on DOMContentLoaded or immediately if DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => AuthService.init());
} else {
  AuthService.init();
}
