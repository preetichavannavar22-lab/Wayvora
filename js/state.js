/**
 * Wayvora - Application State Management
 * Handles user-scoped persistent storage for Favourites and Trip Itineraries,
 * synchronizes with Cloud Firestore when authenticated, and notifies subscribers.
 */

const STORAGE_KEYS = {
  FAVOURITES: "wayvora_favourites",
  TRIPS: "wayvora_trips",
  ACTIVE_TRIP_ID: "wayvora_active_trip_id"
};

// Default sample trip template for newly onboarded user accounts
const DEFAULT_SAMPLE_TRIP = {
  id: "trip-sample-paris",
  title: "Romantic Summer in Paris",
  destinationId: "paris",
  destinationName: "Paris",
  country: "France",
  startDate: "2026-07-10",
  endDate: "2026-07-13",
  travelers: 2,
  currency: "EUR",
  targetBudget: 1200,
  days: [
    {
      dayNumber: 1,
      dateStr: "2026-07-10",
      notes: "Arrival & Classic Monuments",
      activities: [
        {
          id: "act-1",
          name: "Check into Boutique Hotel in Le Marais",
          timeSlot: "Morning",
          category: "Accommodation",
          notes: "Drop luggage and freshen up",
          cost: 150,
          completed: true
        },
        {
          id: "act-2",
          name: "Eiffel Tower & Champ de Mars",
          timeSlot: "Afternoon",
          category: "Landmark",
          notes: "Ascend to 2nd level for city panoramic views",
          cost: 35,
          completed: true
        },
        {
          id: "act-3",
          name: "Seine River Sunset Cruise",
          timeSlot: "Evening",
          category: "Experience",
          notes: "Board cruise near Pont Neuf at 7:30 PM",
          cost: 20,
          completed: false
        }
      ]
    },
    {
      dayNumber: 2,
      dateStr: "2026-07-11",
      notes: "Art, History & Bohemian Cafés",
      activities: [
        {
          id: "act-4",
          name: "Louvre Museum Masterpieces",
          timeSlot: "Morning",
          category: "Museum",
          notes: "Skip-the-line pass at Pyramid entrance",
          cost: 22,
          completed: false
        },
        {
          id: "act-5",
          name: "Lunch at Traditional Bistro & Saint-Germain stroll",
          timeSlot: "Afternoon",
          category: "Dining",
          notes: "Try beef bourguignon and crème brûlée",
          cost: 45,
          completed: false
        },
        {
          id: "act-6",
          name: "Montmartre & Sacré-Cœur Sunset",
          timeSlot: "Evening",
          category: "Neighborhood",
          notes: "Watch street portrait painters in Place du Tertre",
          cost: 0,
          completed: false
        }
      ]
    },
    {
      dayNumber: 3,
      dateStr: "2026-07-12",
      notes: "Palaces, Gardens & Fashion",
      activities: [
        {
          id: "act-7",
          name: "Luxembourg Gardens & Latin Quarter",
          timeSlot: "Morning",
          category: "Scenic Walk",
          notes: "Morning espresso and reading by the Medici fountain",
          cost: 8,
          completed: false
        },
        {
          id: "act-8",
          name: "Shopping & Architecture along Boulevard Haussmann",
          timeSlot: "Afternoon",
          category: "Shopping",
          notes: "Visit Galeries Lafayette rooftop viewing terrace",
          cost: 0,
          completed: false
        },
        {
          id: "act-9",
          name: "Celebratory French Dinner with wine pairing",
          timeSlot: "Evening",
          category: "Dining",
          notes: "Reserve table at a cozy candlelit bistro",
          cost: 75,
          completed: false
        }
      ]
    }
  ],
  createdAt: "2026-06-01T10:00:00.000Z",
  updatedAt: "2026-06-01T10:00:00.000Z"
};

class StateManager {
  constructor() {
    this.currentUserId = null;
    this.subscribers = {
      favourites: [],
      trips: [],
      activeTrip: []
    };
    this.init();
  }

  init() {
    // Check if an active user was already cached
    try {
      const storedUser = localStorage.getItem("wayvora_active_user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.uid) {
          this.currentUserId = parsed.uid;
        }
      }
    } catch (e) {
      this.currentUserId = null;
    }

    this.ensureUserDefaults();
  }

  getFavKey() {
    return this.currentUserId ? `wayvora_favourites_${this.currentUserId}` : STORAGE_KEYS.FAVOURITES;
  }

  getTripsKey() {
    return this.currentUserId ? `wayvora_trips_${this.currentUserId}` : STORAGE_KEYS.TRIPS;
  }

  getActiveTripKey() {
    return this.currentUserId ? `wayvora_active_trip_id_${this.currentUserId}` : STORAGE_KEYS.ACTIVE_TRIP_ID;
  }

  ensureUserDefaults() {
    if (!this.currentUserId) return;

    const favKey = this.getFavKey();
    const tripsKey = this.getTripsKey();
    const activeKey = this.getActiveTripKey();

    // Default favorites for new user if none exist
    if (!localStorage.getItem(favKey)) {
      const initialFavs = ["paris", "switzerland", "maldives"];
      localStorage.setItem(favKey, JSON.stringify(initialFavs));
    }

    // Default sample trip for new user if none exist
    if (!localStorage.getItem(tripsKey)) {
      localStorage.setItem(tripsKey, JSON.stringify([DEFAULT_SAMPLE_TRIP]));
      localStorage.setItem(activeKey, DEFAULT_SAMPLE_TRIP.id);
    }
  }

  /**
   * Called by AuthService when a user signs in or out
   */
  setUser(userId) {
    this.currentUserId = userId || null;
    if (this.currentUserId) {
      this.ensureUserDefaults();
      this.syncFromFirestore(this.currentUserId);
    }

    // Notify all subscribers of the state change for this user
    this.notify("favourites", { favourites: this.getFavourites() });
    this.notify("trips", this.getTrips());
    this.notify("activeTrip", this.getActiveTrip());
  }

  // Subscribe to changes
  subscribe(event, callback) {
    if (this.subscribers[event]) {
      this.subscribers[event].push(callback);
    }
  }

  notify(event, data) {
    if (this.subscribers[event]) {
      this.subscribers[event].forEach(cb => {
        try {
          cb(data);
        } catch (e) {
          console.error(`Error in state subscriber for ${event}:`, e);
        }
      });
    }
  }

  // =================== CLOUD FIRESTORE SYNC ===================

  async syncFromFirestore(userId) {
    if (!window.AuthService || !AuthService.firestore || !userId) return;

    try {
      const db = AuthService.firestore;
      
      // 1. Sync Favourites
      const userDoc = await db.collection("users").doc(userId).get();
      if (userDoc.exists) {
        const data = userDoc.data();
        if (Array.isArray(data.favourites)) {
          localStorage.setItem(this.getFavKey(), JSON.stringify(data.favourites));
          this.notify("favourites", { favourites: data.favourites });
        }
      }

      // 2. Sync Trips
      const tripsSnapshot = await db.collection("users").doc(userId).collection("trips").get();
      if (!tripsSnapshot.empty) {
        const remoteTrips = [];
        tripsSnapshot.forEach(doc => {
          remoteTrips.push(doc.data());
        });
        if (remoteTrips.length > 0) {
          localStorage.setItem(this.getTripsKey(), JSON.stringify(remoteTrips));
          if (!localStorage.getItem(this.getActiveTripKey())) {
            localStorage.setItem(this.getActiveTripKey(), remoteTrips[0].id);
          }
          this.notify("trips", remoteTrips);
          this.notify("activeTrip", this.getActiveTrip());
        }
      }
    } catch (err) {
      console.warn("Firestore background pull failed (using local data):", err);
    }
  }

  async syncFavsToFirestore(list) {
    if (!window.AuthService || !AuthService.firestore || !this.currentUserId) return;
    try {
      await AuthService.firestore.collection("users").doc(this.currentUserId).set({
        favourites: list,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (e) {
      console.warn("Firestore fav sync error:", e);
    }
  }

  async syncTripToFirestore(trip) {
    if (!window.AuthService || !AuthService.firestore || !this.currentUserId) return;
    try {
      await AuthService.firestore
        .collection("users")
        .doc(this.currentUserId)
        .collection("trips")
        .doc(trip.id)
        .set(trip, { merge: true });
    } catch (e) {
      console.warn("Firestore trip sync error:", e);
    }
  }

  async syncDeleteTripFromFirestore(tripId) {
    if (!window.AuthService || !AuthService.firestore || !this.currentUserId) return;
    try {
      await AuthService.firestore
        .collection("users")
        .doc(this.currentUserId)
        .collection("trips")
        .doc(tripId)
        .delete();
    } catch (e) {
      console.warn("Firestore trip delete error:", e);
    }
  }

  // =================== FAVOURITES API ===================

  getFavourites() {
    if (!this.currentUserId) {
      return [];
    }
    try {
      const data = localStorage.getItem(this.getFavKey());
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to read favourites from localStorage:", e);
      return [];
    }
  }

  isFavourite(destinationId) {
    if (!this.currentUserId) return false;
    const list = this.getFavourites();
    return list.includes(destinationId);
  }

  toggleFavourite(destinationId) {
    const list = this.getFavourites();
    const index = list.indexOf(destinationId);
    let isNowFav = false;

    if (index > -1) {
      list.splice(index, 1);
      isNowFav = false;
    } else {
      list.push(destinationId);
      isNowFav = true;
    }

    if (this.currentUserId) {
      localStorage.setItem(this.getFavKey(), JSON.stringify(list));
      this.syncFavsToFirestore(list);
    }

    this.notify("favourites", { favourites: list, changedId: destinationId, isFavourite: isNowFav });
    return isNowFav;
  }

  toggleFavorite(destinationId) {
    return this.toggleFavourite(destinationId);
  }

  isFavorite(destinationId) {
    return this.isFavourite(destinationId);
  }

  getFavorites() {
    return this.getFavourites();
  }

  // =================== TRIPS API ===================

  getTrips() {
    if (!this.currentUserId) {
      return [];
    }
    try {
      const data = localStorage.getItem(this.getTripsKey());
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Failed to read trips from localStorage:", e);
      return [];
    }
  }

  getTripById(id) {
    const trips = this.getTrips();
    return trips.find(t => t.id === id) || null;
  }

  getActiveTripId() {
    if (!this.currentUserId) return null;
    return localStorage.getItem(this.getActiveTripKey()) || null;
  }

  setActiveTripId(id) {
    if (!this.currentUserId) return null;
    localStorage.setItem(this.getActiveTripKey(), id);
    const trip = this.getTripById(id);
    this.notify("activeTrip", trip);
    return trip;
  }

  getActiveTrip() {
    const activeId = this.getActiveTripId();
    if (!activeId) return null;
    return this.getTripById(activeId);
  }

  saveTrip(trip) {
    if (!this.currentUserId) return trip;

    const trips = this.getTrips();
    const index = trips.findIndex(t => t.id === trip.id);
    trip.updatedAt = new Date().toISOString();

    if (index > -1) {
      trips[index] = trip;
    } else {
      trip.createdAt = trip.createdAt || new Date().toISOString();
      trips.unshift(trip);
    }

    localStorage.setItem(this.getTripsKey(), JSON.stringify(trips));
    localStorage.setItem(this.getActiveTripKey(), trip.id);

    this.syncTripToFirestore(trip);

    this.notify("trips", trips);
    this.notify("activeTrip", trip);
    return trip;
  }

  deleteTrip(tripId) {
    if (!this.currentUserId) return [];

    let trips = this.getTrips();
    trips = trips.filter(t => t.id !== tripId);
    localStorage.setItem(this.getTripsKey(), JSON.stringify(trips));

    this.syncDeleteTripFromFirestore(tripId);

    let activeId = this.getActiveTripId();
    if (activeId === tripId) {
      activeId = trips.length > 0 ? trips[0].id : null;
      if (activeId) {
        localStorage.setItem(this.getActiveTripKey(), activeId);
      } else {
        localStorage.removeItem(this.getActiveTripKey());
      }
    }

    this.notify("trips", trips);
    this.notify("activeTrip", this.getTripById(activeId));
    return trips;
  }

  // Create empty new trip template
  createNewTrip({ title, destinationId, destinationName, country, startDate, endDate, travelers, targetBudget, currency }) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Calculate days difference
    let diffDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
    if (isNaN(diffDays) || diffDays < 1) diffDays = 3;

    const days = [];
    for (let i = 0; i < diffDays; i++) {
      const dayDate = new Date(start);
      dayDate.setDate(dayDate.getDate() + i);
      const dateStr = !isNaN(dayDate.getTime()) ? dayDate.toISOString().split("T")[0] : `Day ${i + 1}`;
      days.push({
        dayNumber: i + 1,
        dateStr: dateStr,
        notes: "",
        activities: []
      });
    }

    const resolvedCurrency = currency || (window.CurrencyService ? CurrencyService.getDestinationCurrency({ id: destinationId, country }) : "USD");

    const newTrip = {
      id: "trip-" + Date.now(),
      title: title || `${destinationName || 'Vacation'} Adventure`,
      destinationId: destinationId || "",
      destinationName: destinationName || "Custom Destination",
      country: country || "",
      startDate: startDate || new Date().toISOString().split("T")[0],
      endDate: endDate || "",
      travelers: Number(travelers) || 1,
      currency: resolvedCurrency,
      targetBudget: Number(targetBudget) || 1000,
      days: days,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return this.saveTrip(newTrip);
  }
}

// Global state instance
const AppState = new StateManager();
window.AppState = AppState;

if (typeof module !== "undefined" && module.exports) {
  module.exports = AppState;
}
