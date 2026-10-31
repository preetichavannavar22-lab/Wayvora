/**
 * Wayvora - Developer Admin Dashboard & Customer Support Management
 * 
 * Protected module accessible ONLY to authorized administrators
 * (Validated via custom claim 'admin: true' OR authorized UID: MXMCpQFfM7Zyp865ljTXiasFB2M2).
 */

const AdminDashboard = {
  activeFilter: "all", // "all", "open", "in_progress", "resolved"
  tickets: [],
  unsubscribeListener: null,
  activeTicket: null,

  /**
   * Initializes Admin Dashboard DOM and listeners
   */
  init() {
    this.createDashboardDOM();
    this.bindEvents();
  },

  /**
   * Protected open method - verifies administrator status before rendering
   */
  open() {
    if (!window.AuthService || !AuthService.isAdministrator()) {
      if (window.UI && typeof window.UI.showToast === "function") {
        window.UI.showToast("Access Denied: Administrator privileges required.", "error");
      } else {
        alert("Access Denied: Administrator privileges required.");
      }
      return;
    }

    let modal = document.getElementById("admin-dashboard-modal");
    if (!modal) {
      this.createDashboardDOM();
      modal = document.getElementById("admin-dashboard-modal");
    }

    if (modal) {
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
      this.subscribeToLiveTickets();
    }
  },

  close() {
    const modal = document.getElementById("admin-dashboard-modal");
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
    if (this.unsubscribeListener) {
      this.unsubscribeListener();
      this.unsubscribeListener = null;
    }
  },

  /**
   * Subscribes to real-time updates of all customer support requests
   */
  subscribeToLiveTickets() {
    if (!window.FirestoreService || !FirestoreService.isAvailable()) {
      this.renderErrorState("Cloud Firestore is currently offline or not configured.");
      return;
    }

    const loader = document.getElementById("admin-tickets-loader");
    if (loader) loader.style.display = "block";

    if (this.unsubscribeListener) {
      this.unsubscribeListener();
    }

    this.unsubscribeListener = FirestoreService.subscribeToAllSupportRequests(
      (tickets) => {
        this.tickets = tickets;
        if (loader) loader.style.display = "none";
        this.updateStats();
        this.renderTickets();
      },
      (err) => {
        console.error("AdminDashboard tickets subscription error:", err);
        if (loader) loader.style.display = "none";
        this.renderErrorState("Failed to stream support tickets: " + (err.message || err.code));
      }
    );
  },

  /**
   * Renders ticket count statistics in dashboard header
   */
  updateStats() {
    const total = this.tickets.length;
    const open = this.tickets.filter(t => (t.status || "open").toLowerCase() === "open").length;
    const inProgress = this.tickets.filter(t => (t.status || "").toLowerCase() === "in_progress").length;
    const resolved = this.tickets.filter(t => (t.status || "").toLowerCase() === "resolved").length;

    const elTotal = document.getElementById("admin-stat-total");
    const elOpen = document.getElementById("admin-stat-open");
    const elProg = document.getElementById("admin-stat-progress");
    const elRes = document.getElementById("admin-stat-resolved");

    if (elTotal) elTotal.textContent = total;
    if (elOpen) elOpen.textContent = open;
    if (elProg) elProg.textContent = inProgress;
    if (elRes) elRes.textContent = resolved;
  },

  /**
   * Renders the list of filtered support tickets
   */
  renderTickets() {
    const container = document.getElementById("admin-tickets-container");
    if (!container) return;

    let filtered = [...this.tickets];
    if (this.activeFilter !== "all") {
      filtered = filtered.filter(t => (t.status || "open").toLowerCase() === this.activeFilter);
    }

    const searchQuery = (document.getElementById("admin-search-input")?.value || "").toLowerCase().trim();
    if (searchQuery) {
      filtered = filtered.filter(t => 
        (t.name || "").toLowerCase().includes(searchQuery) ||
        (t.email || "").toLowerCase().includes(searchQuery) ||
        (t.message || "").toLowerCase().includes(searchQuery) ||
        (t.category || "").toLowerCase().includes(searchQuery)
      );
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="admin-empty-state">
          <div class="admin-empty-icon">📭</div>
          <h4>No support requests found</h4>
          <p class="text-sm text-muted">No tickets match the selected status filter (${this.activeFilter}).</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(t => {
      const status = (t.status || "open").toLowerCase();
      let statusBadgeClass = "badge-warning";
      let statusLabel = "Open";
      if (status === "in_progress") {
        statusBadgeClass = "badge-info";
        statusLabel = "In Progress";
      } else if (status === "resolved") {
        statusBadgeClass = "badge-success";
        statusLabel = "Resolved";
      }

      let dateStr = "Recent";
      if (t.createdAt) {
        const d = t.createdAt.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
        if (!isNaN(d.getTime())) {
          dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
        }
      }

      const hasReply = !!t.adminReply;

      return `
        <div class="admin-ticket-card ${hasReply ? 'ticket-replied' : ''}" data-ticket-id="${t.id}">
          <div class="admin-ticket-header">
            <div class="admin-ticket-user">
              <span class="admin-ticket-avatar">${(t.name || "U").charAt(0).toUpperCase()}</span>
              <div>
                <strong class="admin-ticket-name">${this.escapeHtml(t.name || "Anonymous Traveler")}</strong>
                <span class="admin-ticket-email">${this.escapeHtml(t.email || "No email")}</span>
              </div>
            </div>
            <div class="admin-ticket-meta">
              <span class="admin-status-badge ${statusBadgeClass}">${statusLabel}</span>
              <span class="admin-ticket-date">${dateStr}</span>
            </div>
          </div>

          <div class="admin-ticket-body">
            <div class="admin-ticket-category">Category: <span>${this.escapeHtml(t.category || "General Inquiry")}</span></div>
            <p class="admin-ticket-message">${this.escapeHtml(t.message || "")}</p>
            ${hasReply ? `
              <div class="admin-existing-reply">
                <span class="text-xs font-bold text-primary">✓ Official Response Sent:</span>
                <p class="text-sm">${this.escapeHtml(t.adminReply)}</p>
              </div>
            ` : ''}
          </div>

          <div class="admin-ticket-footer">
            <span class="text-xs text-muted">Ticket ID: <code>${t.id.slice(0, 10)}...</code></span>
            <div class="admin-ticket-actions">
              <button type="button" class="btn btn-outline btn-sm admin-btn-manage" data-action="manage" data-id="${t.id}">
                ${hasReply ? 'Edit Reply / Status' : 'Respond & Manage'}
              </button>
              <button type="button" class="btn btn-danger-ghost btn-sm admin-btn-delete" data-action="delete" data-id="${t.id}" title="Delete inquiry">
                ✕
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  },

  /**
   * Opens ticket reply & status update modal
   */
  openManageTicketModal(ticketId) {
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    this.activeTicket = ticket;
    let modal = document.getElementById("admin-manage-modal");
    if (!modal) {
      this.createManageModalDOM();
      modal = document.getElementById("admin-manage-modal");
    }

    document.getElementById("manage-ticket-name").textContent = ticket.name || "Traveler";
    document.getElementById("manage-ticket-email").textContent = ticket.email || "";
    document.getElementById("manage-ticket-category").textContent = ticket.category || "General Inquiry";
    document.getElementById("manage-ticket-message").textContent = ticket.message || "";
    document.getElementById("manage-ticket-status").value = (ticket.status || "open").toLowerCase();
    document.getElementById("manage-ticket-reply").value = ticket.adminReply || "";

    modal.classList.add("active");
  },

  closeManageModal() {
    const modal = document.getElementById("admin-manage-modal");
    if (modal) modal.classList.remove("active");
    this.activeTicket = null;
  },

  /**
   * Saves administrator reply and updates status in Firestore
   */
  async saveTicketUpdate() {
    if (!this.activeTicket) return;

    const saveBtn = document.getElementById("manage-ticket-save-btn");
    const status = document.getElementById("manage-ticket-status")?.value || "open";
    const adminReply = document.getElementById("manage-ticket-reply")?.value || "";

    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = "Saving...";
    }

    try {
      await FirestoreService.updateSupportRequest(this.activeTicket.id, {
        status: status,
        adminReply: adminReply
      });

      if (window.UI && typeof window.UI.showToast === "function") {
        window.UI.showToast("Support ticket updated and response recorded.", "success");
      }
      this.closeManageModal();
    } catch (err) {
      console.error("Failed to update ticket:", err);
      alert("Error saving ticket update: " + (err.message || err.code));
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = "Save Changes & Send Reply";
      }
    }
  },

  /**
   * Deletes a ticket from Firestore
   */
  async deleteTicket(ticketId) {
    if (!confirm("Are you sure you want to permanently delete this customer support inquiry?")) return;

    try {
      await FirestoreService.deleteSupportRequest(ticketId);
      if (window.UI && typeof window.UI.showToast === "function") {
        window.UI.showToast("Inquiry deleted from database.", "info");
      }
    } catch (err) {
      console.error("Failed to delete inquiry:", err);
      alert("Delete failed: " + (err.message || err.code));
    }
  },

  renderErrorState(msg) {
    const container = document.getElementById("admin-tickets-container");
    if (container) {
      container.innerHTML = `
        <div class="admin-empty-state error">
          <div class="admin-empty-icon">⚠️</div>
          <h4>Connection Error</h4>
          <p class="text-sm text-muted">${this.escapeHtml(msg)}</p>
        </div>
      `;
    }
  },

  bindEvents() {
    // Backdrop close
    document.addEventListener("click", (e) => {
      if (e.target.id === "admin-dashboard-modal") this.close();
      if (e.target.id === "admin-manage-modal") this.closeManageModal();
    });

    // Close buttons
    document.getElementById("admin-dashboard-close")?.addEventListener("click", () => this.close());
    document.getElementById("manage-ticket-close")?.addEventListener("click", () => this.closeManageModal());
    document.getElementById("manage-ticket-cancel-btn")?.addEventListener("click", () => this.closeManageModal());

    // Save ticket update
    document.getElementById("manage-ticket-save-btn")?.addEventListener("click", () => this.saveTicketUpdate());

    // Filter pills
    document.querySelectorAll(".admin-filter-pill").forEach(pill => {
      pill.addEventListener("click", (e) => {
        document.querySelectorAll(".admin-filter-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.activeFilter = pill.getAttribute("data-filter") || "all";
        this.renderTickets();
      });
    });

    // Search filter input
    document.getElementById("admin-search-input")?.addEventListener("input", () => {
      this.renderTickets();
    });

    // Delegate tickets clicks (Manage and Delete)
    const container = document.getElementById("admin-tickets-container");
    if (container) {
      container.addEventListener("click", (e) => {
        const btnManage = e.target.closest(".admin-btn-manage");
        if (btnManage) {
          const id = btnManage.getAttribute("data-id");
          this.openManageTicketModal(id);
          return;
        }

        const btnDelete = e.target.closest(".admin-btn-delete");
        if (btnDelete) {
          const id = btnDelete.getAttribute("data-id");
          this.deleteTicket(id);
          return;
        }
      });
    }

    // Refresh button
    document.getElementById("admin-btn-refresh")?.addEventListener("click", () => {
      this.subscribeToLiveTickets();
    });
  },

  escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  /**
   * Injects the Admin Dashboard Modal into the document body
   */
  createDashboardDOM() {
    if (document.getElementById("admin-dashboard-modal")) return;

    const modal = document.createElement("div");
    modal.id = "admin-dashboard-modal";
    modal.className = "admin-modal-overlay";
    modal.innerHTML = `
      <div class="admin-modal-content">
        <!-- Dashboard Header -->
        <div class="admin-modal-header">
          <div class="admin-header-title-row">
            <div class="admin-badge-icon">🛡️</div>
            <div>
              <h2 class="admin-heading">WAYVORA Developer Admin Portal</h2>
              <div class="admin-subheading">
                <span>Account UID: <code>MXMCpQFfM7Zyp865ljTXiasFB2M2</code></span>
                <span class="admin-pill-badge">Official Administrator</span>
              </div>
            </div>
          </div>
          <div class="admin-header-actions">
            <button type="button" class="btn btn-outline btn-sm" id="admin-btn-refresh" title="Refresh data">
              🔄 Live Refresh
            </button>
            <button type="button" class="admin-modal-close" id="admin-dashboard-close" aria-label="Close Admin Portal">
              ✕
            </button>
          </div>
        </div>

        <!-- System Stats Bar -->
        <div class="admin-stats-grid">
          <div class="admin-stat-card">
            <div class="admin-stat-value" id="admin-stat-total">0</div>
            <div class="admin-stat-label">Total Inquiries</div>
          </div>
          <div class="admin-stat-card stat-open">
            <div class="admin-stat-value" id="admin-stat-open">0</div>
            <div class="admin-stat-label">Open Tickets</div>
          </div>
          <div class="admin-stat-card stat-progress">
            <div class="admin-stat-value" id="admin-stat-progress">0</div>
            <div class="admin-stat-label">In Progress</div>
          </div>
          <div class="admin-stat-card stat-resolved">
            <div class="admin-stat-value" id="admin-stat-resolved">0</div>
            <div class="admin-stat-label">Resolved</div>
          </div>
        </div>

        <!-- Support Inbox Controls -->
        <div class="admin-inbox-controls">
          <div class="admin-filters-group">
            <button type="button" class="admin-filter-pill active" data-filter="all">All Inquiries</button>
            <button type="button" class="admin-filter-pill" data-filter="open">Open</button>
            <button type="button" class="admin-filter-pill" data-filter="in_progress">In Progress</button>
            <button type="button" class="admin-filter-pill" data-filter="resolved">Resolved</button>
          </div>
          <div class="admin-search-wrapper">
            <input type="text" id="admin-search-input" class="admin-search-input" placeholder="Search traveler name, email, message..." />
          </div>
        </div>

        <!-- Tickets Stream -->
        <div class="admin-tickets-scroll-area">
          <div id="admin-tickets-loader" class="admin-loader" style="display: none;">
            <div class="admin-spinner"></div>
            <span>Streaming customer support requests from Cloud Firestore...</span>
          </div>
          <div id="admin-tickets-container" class="admin-tickets-container"></div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.createManageModalDOM();
  },

  createManageModalDOM() {
    if (document.getElementById("admin-manage-modal")) return;

    const modal = document.createElement("div");
    modal.id = "admin-manage-modal";
    modal.className = "admin-submodal-overlay";
    modal.innerHTML = `
      <div class="admin-submodal-content">
        <div class="admin-submodal-header">
          <h3>Manage Support Request</h3>
          <button type="button" class="admin-modal-close" id="manage-ticket-close">✕</button>
        </div>
        <div class="admin-submodal-body">
          <div class="manage-info-row">
            <div>
              <span class="text-xs text-muted block">Traveler</span>
              <strong id="manage-ticket-name">-</strong>
            </div>
            <div>
              <span class="text-xs text-muted block">Email Address</span>
              <span id="manage-ticket-email">-</span>
            </div>
            <div>
              <span class="text-xs text-muted block">Category</span>
              <span id="manage-ticket-category">-</span>
            </div>
          </div>

          <div class="manage-message-box mt-3">
            <span class="text-xs text-muted font-bold block mb-1">Traveler Inquiry:</span>
            <div class="manage-message-content" id="manage-ticket-message"></div>
          </div>

          <div class="manage-form-group mt-3">
            <label for="manage-ticket-status" class="text-xs font-bold block mb-1">Ticket Status</label>
            <select id="manage-ticket-status" class="form-control">
              <option value="open">Open (Needs Attention)</option>
              <option value="in_progress">In Progress (Under Review)</option>
              <option value="resolved">Resolved (Complete)</option>
            </select>
          </div>

          <div class="manage-form-group mt-3">
            <label for="manage-ticket-reply" class="text-xs font-bold block mb-1">Official Administrator Response</label>
            <textarea id="manage-ticket-reply" class="form-control" rows="4" placeholder="Write an official response visible to this traveler in their account..."></textarea>
            <span class="text-xs text-muted mt-1 block">This response will be securely delivered to the customer's portal in real time.</span>
          </div>
        </div>
        <div class="admin-submodal-footer">
          <button type="button" class="btn btn-outline btn-sm" id="manage-ticket-cancel-btn">Cancel</button>
          <button type="button" class="btn btn-primary btn-sm" id="manage-ticket-save-btn">Save Changes & Send Reply</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }
};

// Global export
window.AdminDashboard = AdminDashboard;

// Auto-initialize on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => AdminDashboard.init());
} else {
  AdminDashboard.init();
}
