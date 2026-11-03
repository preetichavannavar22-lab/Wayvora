/**
 * Wayvora - Cloud Firestore Service
 * 
 * Reusable CRUD functions to save, read, update, and delete user-specific data
 * (User Profile, Saved Favourites, Trip Itineraries, Custom Collections).
 * Encapsulates secure document and subcollection access patterns.
 */

const FirestoreService = {
  /**
   * Returns the initialized Cloud Firestore instance
   */
  getDb() {
    if (window.firestore) return window.firestore;
    if (typeof firebase !== "undefined" && typeof firebase.firestore === "function") {
      window.firestore = firebase.firestore();
      return window.firestore;
    }
    return null;
  },

  /**
   * Verifies if Cloud Firestore is available and ready for operations
   */
  isAvailable() {
    return !!this.getDb();
  },

  // =========================================================================
  // 1. GENERIC USER-SPECIFIC DATA CRUD
  // =========================================================================

  /**
   * Save (Create or Replace/Merge) a document in a user's scoped subcollection
   * Firestore Path: users/{userId}/{collectionName}/{docId}
   * 
   * @param {string} userId - User UID
   * @param {string} collectionName - Subcollection name (e.g. "trips", "notes", "preferences")
   * @param {string} docId - Document ID (auto-generated if omitted)
   * @param {object} data - Document content
   * @param {boolean} merge - Whether to merge with existing document (default: true)
   * @returns {Promise<object>} The saved document data including its ID
   */
  async saveUserDocument(userId, collectionName, docId, data, merge = true) {
    if (!userId) throw new Error("FirestoreService: userId is required.");
    if (!collectionName) throw new Error("FirestoreService: collectionName is required.");
    const db = this.getDb();
    if (!db) throw new Error("FirestoreService: Cloud Firestore is not initialized.");

    const colRef = db.collection("users").doc(userId).collection(collectionName);
    const docRef = docId ? colRef.doc(docId) : colRef.doc();

    const timestamp = (typeof firebase !== "undefined" && firebase.firestore)
      ? firebase.firestore.FieldValue.serverTimestamp()
      : new Date().toISOString();

    const payload = {
      ...data,
      id: docRef.id,
      updatedAt: timestamp
    };

    if (!docId && !payload.createdAt) {
      payload.createdAt = timestamp;
    }

    await docRef.set(payload, { merge });
    return { id: docRef.id, ...payload };
  },

  /**
   * Alias for saveUserDocument
   */
  async saveUserData(userId, collectionName, docId, data, merge = true) {
    return this.saveUserDocument(userId, collectionName, docId, data, merge);
  },

  /**
   * Read a single document from a user's scoped subcollection
   * Firestore Path: users/{userId}/{collectionName}/{docId}
   * 
   * @param {string} userId - User UID
   * @param {string} collectionName - Subcollection name
   * @param {string} docId - Document ID
   * @returns {Promise<object|null>} Document data with id, or null if not found
   */
  async getUserDocument(userId, collectionName, docId) {
    if (!userId || !collectionName || !docId) return null;
    const db = this.getDb();
    if (!db) return null;

    const docSnap = await db.collection("users").doc(userId).collection(collectionName).doc(docId).get();
    if (!docSnap.exists) return null;
    return { id: docSnap.id, ...docSnap.data() };
  },

  /**
   * Alias for getUserDocument
   */
  async getUserData(userId, collectionName, docId) {
    return this.getUserDocument(userId, collectionName, docId);
  },

  /**
   * Read all documents from a user's scoped subcollection
   * Firestore Path: users/{userId}/{collectionName}
   * 
   * @param {string} userId - User UID
   * @param {string} collectionName - Subcollection name
   * @param {string|null} orderByField - Field to sort by (optional)
   * @param {"asc"|"desc"} direction - Sort direction (default: "desc")
   * @returns {Promise<Array<object>>} Array of document objects
   */
  async getUserCollection(userId, collectionName, orderByField = "updatedAt", direction = "desc") {
    if (!userId || !collectionName) return [];
    const db = this.getDb();
    if (!db) return [];

    let query = db.collection("users").doc(userId).collection(collectionName);
    if (orderByField) {
      try {
        query = query.orderBy(orderByField, direction);
      } catch (err) {
        console.warn("FirestoreService: query ordering fallback:", err.message);
      }
    }

    const snapshot = await query.get();
    const results = [];
    snapshot.forEach(doc => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results;
  },

  /**
   * Update specific fields of an existing document in a user's scoped subcollection
   * Firestore Path: users/{userId}/{collectionName}/{docId}
   * 
   * @param {string} userId - User UID
   * @param {string} collectionName - Subcollection name
   * @param {string} docId - Document ID
   * @param {object} updates - Key-value map of fields to update
   * @returns {Promise<boolean>} True if update succeeded
   */
  async updateUserDocument(userId, collectionName, docId, updates) {
    if (!userId || !collectionName || !docId) {
      throw new Error("FirestoreService: Missing required parameters for updateUserDocument.");
    }
    const db = this.getDb();
    if (!db) throw new Error("FirestoreService: Cloud Firestore is not initialized.");

    const docRef = db.collection("users").doc(userId).collection(collectionName).doc(docId);
    const timestamp = (typeof firebase !== "undefined" && firebase.firestore)
      ? firebase.firestore.FieldValue.serverTimestamp()
      : new Date().toISOString();

    await docRef.update({
      ...updates,
      updatedAt: timestamp
    });
    return true;
  },

  /**
   * Alias for updateUserDocument
   */
  async updateUserData(userId, collectionName, docId, updates) {
    return this.updateUserDocument(userId, collectionName, docId, updates);
  },

  /**
   * Delete a document from a user's scoped subcollection
   * Firestore Path: users/{userId}/{collectionName}/{docId}
   * 
   * @param {string} userId - User UID
   * @param {string} collectionName - Subcollection name
   * @param {string} docId - Document ID to delete
   * @returns {Promise<boolean>} True if deletion succeeded
   */
  async deleteUserDocument(userId, collectionName, docId) {
    if (!userId || !collectionName || !docId) {
      throw new Error("FirestoreService: Missing required parameters for deleteUserDocument.");
    }
    const db = this.getDb();
    if (!db) throw new Error("FirestoreService: Cloud Firestore is not initialized.");

    await db.collection("users").doc(userId).collection(collectionName).doc(docId).delete();
    return true;
  },

  /**
   * Alias for deleteUserDocument
   */
  async deleteUserData(userId, collectionName, docId) {
    return this.deleteUserDocument(userId, collectionName, docId);
  },

  // =========================================================================
  // 2. USER PROFILE CRUD (users/{userId})
  // =========================================================================

  /**
   * Save or merge user profile document
   * Firestore Path: users/{userId}
   * 
   * @param {string} userId - User UID
   * @param {object} profileData - Profile attributes (name, email, preferences, etc.)
   * @returns {Promise<object>} The saved profile payload
   */
  async saveUserProfile(userId, profileData) {
    if (!userId) throw new Error("FirestoreService: userId is required.");
    const db = this.getDb();
    if (!db) throw new Error("FirestoreService: Cloud Firestore is not initialized.");

    const timestamp = (typeof firebase !== "undefined" && firebase.firestore)
      ? firebase.firestore.FieldValue.serverTimestamp()
      : new Date().toISOString();

    const payload = {
      ...profileData,
      uid: userId,
      updatedAt: timestamp
    };

    await db.collection("users").doc(userId).set(payload, { merge: true });
    return payload;
  },

  /**
   * Read user profile document
   * Firestore Path: users/{userId}
   * 
   * @param {string} userId - User UID
   * @returns {Promise<object|null>} Profile data or null if not found
   */
  async getUserProfile(userId) {
    if (!userId) return null;
    const db = this.getDb();
    if (!db) return null;

    const snap = await db.collection("users").doc(userId).get();
    if (!snap.exists) return null;
    return snap.data();
  },

  /**
   * Update specific fields of user profile
   * Firestore Path: users/{userId}
   */
  async updateUserProfile(userId, updates) {
    if (!userId) throw new Error("FirestoreService: userId is required.");
    const db = this.getDb();
    if (!db) throw new Error("FirestoreService: Cloud Firestore is not initialized.");

    const timestamp = (typeof firebase !== "undefined" && firebase.firestore)
      ? firebase.firestore.FieldValue.serverTimestamp()
      : new Date().toISOString();

    await db.collection("users").doc(userId).update({
      ...updates,
      updatedAt: timestamp
    });
    return true;
  },

  /**
   * Delete user profile document
   * Firestore Path: users/{userId}
   */
  async deleteUserProfile(userId) {
    if (!userId) throw new Error("FirestoreService: userId is required.");
    const db = this.getDb();
    if (!db) throw new Error("FirestoreService: Cloud Firestore is not initialized.");

    await db.collection("users").doc(userId).delete();
    return true;
  },

  // =========================================================================
  // 3. USER FAVOURITES CRUD
  // =========================================================================

  /**
   * Read user favourites list from Firestore
   * @param {string} userId - User UID
   * @returns {Promise<Array<string>>} Array of favorite destination IDs
   */
  async getUserFavourites(userId) {
    const profile = await this.getUserProfile(userId);
    return (profile && Array.isArray(profile.favourites)) ? profile.favourites : [];
  },

  /**
   * Overwrite user favourites list in Firestore
   * @param {string} userId - User UID
   * @param {Array<string>} favouritesList - Array of destination IDs
   */
  async saveUserFavourites(userId, favouritesList) {
    return this.saveUserProfile(userId, { favourites: favouritesList });
  },

  /**
   * Add a destination ID to user favourites using atomic arrayUnion
   * @param {string} userId - User UID
   * @param {string} destinationId - ID of destination to add
   */
  async addUserFavourite(userId, destinationId) {
    if (!userId || !destinationId) return false;
    const db = this.getDb();
    if (!db) return false;

    await db.collection("users").doc(userId).set({
      favourites: firebase.firestore.FieldValue.arrayUnion(destinationId),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    return true;
  },

  /**
   * Remove a destination ID from user favourites using atomic arrayRemove
   * @param {string} userId - User UID
   * @param {string} destinationId - ID of destination to remove
   */
  async removeUserFavourite(userId, destinationId) {
    if (!userId || !destinationId) return false;
    const db = this.getDb();
    if (!db) return false;

    await db.collection("users").doc(userId).set({
      favourites: firebase.firestore.FieldValue.arrayRemove(destinationId),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    return true;
  },

  // =========================================================================
  // 4. USER TRIPS CRUD (users/{userId}/trips/{tripId})
  // =========================================================================

  /**
   * Save (Create or Update) a trip itinerary for a user
   * Firestore Path: users/{userId}/trips/{trip.id}
   * 
   * @param {string} userId - User UID
   * @param {object} trip - Trip object containing id, title, days, activities, etc.
   * @returns {Promise<object>} Saved trip object
   */
  async saveUserTrip(userId, trip) {
    if (!userId || !trip || !trip.id) {
      throw new Error("FirestoreService: userId and valid trip.id are required.");
    }
    return this.saveUserDocument(userId, "trips", trip.id, trip, true);
  },

  /**
   * Read all trips saved by a user
   * Firestore Path: users/{userId}/trips
   * 
   * @param {string} userId - User UID
   * @returns {Promise<Array<object>>} List of trips
   */
  async getUserTrips(userId) {
    return this.getUserCollection(userId, "trips", "updatedAt", "desc");
  },

  /**
   * Read a single trip by ID
   * Firestore Path: users/{userId}/trips/{tripId}
   * 
   * @param {string} userId - User UID
   * @param {string} tripId - Trip ID
   * @returns {Promise<object|null>} Trip object or null
   */
  async getUserTripById(userId, tripId) {
    return this.getUserDocument(userId, "trips", tripId);
  },

  /**
   * Update specific fields of a user's trip
   * Firestore Path: users/{userId}/trips/{tripId}
   * 
   * @param {string} userId - User UID
   * @param {string} tripId - Trip ID
   * @param {object} updates - Fields to update
   */
  async updateUserTrip(userId, tripId, updates) {
    return this.updateUserDocument(userId, "trips", tripId, updates);
  },

  /**
   * Delete a trip from Firestore
   * Firestore Path: users/{userId}/trips/{tripId}
   * 
   * @param {string} userId - User UID
   * @param {string} tripId - Trip ID
   */
  async deleteUserTrip(userId, tripId) {
    return this.deleteUserDocument(userId, "trips", tripId);
  },

  // =========================================================================
  // 5. CUSTOMER SUPPORT & CONTACT INQUIRIES
  // =========================================================================

  /**
   * Submit a customer support inquiry or contact message to Firestore
   * Firestore Path: support_requests/{requestId}
   * 
   * @param {object} inquiry - Contains name, email, message, and optional category
   * @returns {Promise<object>} Created inquiry record
   */
  async submitSupportRequest({ name, email, message, category = "General Inquiry" }) {
    const db = this.getDb();
    if (!db) throw new Error("FirestoreService: Cloud Firestore is not initialized.");

    const currentUser = (window.firebaseAuth && window.firebaseAuth.currentUser)
      ? window.firebaseAuth.currentUser
      : null;

    const timestamp = (typeof firebase !== "undefined" && firebase.firestore)
      ? firebase.firestore.FieldValue.serverTimestamp()
      : new Date().toISOString();

    const payload = {
      name: (name || "").trim(),
      email: (email || "").trim(),
      category: category || "General Inquiry",
      message: (message || "").trim(),
      status: "open", // Initial status: 'open', 'in_progress', 'resolved'
      createdAt: timestamp,
      updatedAt: timestamp
    };

    // Attach user ID if submitted by an authenticated traveler
    if (currentUser && currentUser.uid) {
      payload.userId = currentUser.uid;
    }

    const docRef = await db.collection("support_requests").add(payload);
    return { id: docRef.id, ...payload };
  },

  /**
   * Read support requests submitted by the authenticated user
   * Firestore Path: support_requests where userId == currentUser.uid
   */
  async getUserSupportRequests(userId) {
    if (!userId) return [];
    const db = this.getDb();
    if (!db) return [];

    try {
      const snap = await db.collection("support_requests")
        .where("userId", "==", userId)
        .get();
      const results = [];
      snap.forEach(doc => results.push({ id: doc.id, ...doc.data() }));
      // Sort in memory by createdAt descending
      results.sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      return results;
    } catch (err) {
      console.warn("FirestoreService: getUserSupportRequests error:", err);
      return [];
    }
  },

  /**
   * Read ALL support requests (Administrator Only)
   * Firestore Path: support_requests
   */
  async getAllSupportRequests() {
    const db = this.getDb();
    if (!db) return [];

    try {
      const snap = await db.collection("support_requests").get();
      const results = [];
      snap.forEach(doc => results.push({ id: doc.id, ...doc.data() }));
      results.sort((a, b) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      return results;
    } catch (err) {
      console.error("FirestoreService: getAllSupportRequests error:", err);
      throw err;
    }
  },

  /**
   * Update support request status and admin reply (Administrator Only)
   * Firestore Path: support_requests/{requestId}
   */
  async updateSupportRequest(requestId, { status, adminReply }) {
    if (!requestId) throw new Error("requestId is required.");
    const db = this.getDb();
    if (!db) throw new Error("Cloud Firestore is not initialized.");

    const timestamp = (typeof firebase !== "undefined" && firebase.firestore)
      ? firebase.firestore.FieldValue.serverTimestamp()
      : new Date().toISOString();

    const payload = {
      updatedAt: timestamp
    };

    if (status) payload.status = status;
    if (adminReply !== undefined) {
      payload.adminReply = adminReply.trim();
      payload.repliedAt = timestamp;
    }

    await db.collection("support_requests").doc(requestId).update(payload);
    return true;
  },

  /**
   * Delete or archive a support request (Administrator Only)
   */
  async deleteSupportRequest(requestId) {
    if (!requestId) throw new Error("requestId is required.");
    const db = this.getDb();
    if (!db) throw new Error("Cloud Firestore is not initialized.");

    await db.collection("support_requests").doc(requestId).delete();
    return true;
  },

  /**
   * Live real-time subscription for customer's own tickets
   */
  subscribeToUserSupportRequests(userId, onUpdate, onError) {
    if (!userId) return () => {};
    const db = this.getDb();
    if (!db) return () => {};

    return db.collection("support_requests")
      .where("userId", "==", userId)
      .onSnapshot(snap => {
        const results = [];
        snap.forEach(doc => results.push({ id: doc.id, ...doc.data() }));
        results.sort((a, b) => {
          const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
          const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });
        if (typeof onUpdate === "function") onUpdate(results);
      }, err => {
        console.warn("User support subscription error:", err);
        if (typeof onError === "function") onError(err);
      });
  },

  /**
   * Live real-time subscription for Administrator support inbox
   */
  subscribeToAllSupportRequests(onUpdate, onError) {
    const db = this.getDb();
    if (!db) return () => {};

    return db.collection("support_requests")
      .onSnapshot(snap => {
        const results = [];
        snap.forEach(doc => results.push({ id: doc.id, ...doc.data() }));
        results.sort((a, b) => {
          const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
          const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });
        if (typeof onUpdate === "function") onUpdate(results);
      }, err => {
        console.warn("All support subscription error:", err);
        if (typeof onError === "function") onError(err);
      });
  },

  // =========================================================================
  // 6. REAL-TIME SUBSCRIPTIONS
  // =========================================================================

  /**
   * Listen to live updates of a user's trips collection
   * @param {string} userId - User UID
   * @param {Function} onUpdate - Callback receiving Array of trips
   * @param {Function} onError - Callback receiving Error
   * @returns {Function} Unsubscribe function
   */
  subscribeToUserTrips(userId, onUpdate, onError) {
    if (!userId) return () => {};
    const db = this.getDb();
    if (!db) return () => {};

    return db.collection("users").doc(userId).collection("trips")
      .onSnapshot(
        snapshot => {
          const trips = [];
          snapshot.forEach(doc => trips.push({ id: doc.id, ...doc.data() }));
          if (typeof onUpdate === "function") onUpdate(trips);
        },
        err => {
          console.warn("FirestoreService: trips subscription error:", err);
          if (typeof onError === "function") onError(err);
        }
      );
  },

  /**
   * Listen to live updates of a user profile document
   * @param {string} userId - User UID
   * @param {Function} onUpdate - Callback receiving profile object
   * @param {Function} onError - Callback receiving Error
   * @returns {Function} Unsubscribe function
   */
  subscribeToUserProfile(userId, onUpdate, onError) {
    if (!userId) return () => {};
    const db = this.getDb();
    if (!db) return () => {};

    return db.collection("users").doc(userId)
      .onSnapshot(
        docSnap => {
          if (docSnap.exists && typeof onUpdate === "function") {
            onUpdate({ id: docSnap.id, ...docSnap.data() });
          }
        },
        err => {
          console.warn("FirestoreService: profile subscription error:", err);
          if (typeof onError === "function") onError(err);
        }
      );
  },

  // =========================================================================
  // 6. HEALTH CHECK & CONNECTION DIAGNOSTICS
  // =========================================================================

  /**
   * Tests the Cloud Firestore database connection.
   * Checks SDK state, reachability, latency, and security rules enforcement.
   * 
   * @returns {Promise<object>} Diagnostic details
   */
  async testConnection() {
    const startTime = Date.now();
    const result = {
      projectId: window.FIREBASE_CONFIG ? window.FIREBASE_CONFIG.projectId : "unknown",
      sdkLoaded: typeof firebase !== "undefined" && typeof firebase.firestore === "function",
      isConfigured: window.isFirebaseConfigured ? window.isFirebaseConfigured() : false,
      connected: false,
      authenticated: false,
      currentUserUid: null,
      latencyMs: 0,
      details: "",
      timestamp: new Date().toISOString()
    };

    const db = this.getDb();
    if (!db) {
      result.details = "Cloud Firestore SDK is not available or not initialized.";
      return result;
    }

    const auth = window.firebaseAuth;
    if (auth && auth.currentUser) {
      result.authenticated = true;
      result.currentUserUid = auth.currentUser.uid;
    }

    try {
      if (result.authenticated && result.currentUserUid) {
        // Authenticated probe: Read own profile doc from server
        const userRef = db.collection("users").doc(result.currentUserUid);
        await userRef.get({ source: "server" });
        result.connected = true;
        result.latencyMs = Date.now() - startTime;
        result.details = `Successfully connected to Cloud Firestore. User document read verified in ${result.latencyMs}ms.`;
      } else {
        // Unauthenticated probe: Probe collection
        // Secure rules correctly reject with permission-denied, confirming active server connection
        try {
          await db.collection("users").doc("__wayvora_probe__").get({ source: "server" });
          result.connected = true;
          result.latencyMs = Date.now() - startTime;
          result.details = `Connected to Cloud Firestore (response in ${result.latencyMs}ms).`;
        } catch (readErr) {
          result.latencyMs = Date.now() - startTime;
          if (readErr.code === "permission-denied") {
            result.connected = true;
            result.details = `Connected to Cloud Firestore in ${result.latencyMs}ms. Security rules active and properly enforced (PERMISSION_DENIED for unauthenticated probe).`;
          } else {
            result.details = `Connection returned: ${readErr.message || readErr.code}`;
          }
        }
      }
    } catch (err) {
      result.latencyMs = Date.now() - startTime;
      result.details = `Cloud Firestore connection test error: ${err.message}`;
    }

    return result;
  }
};

// Export to window
window.FirestoreService = FirestoreService;

if (typeof module !== "undefined" && module.exports) {
  module.exports = FirestoreService;
}
