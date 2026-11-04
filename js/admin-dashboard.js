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
  gmailStatus: null,

  /**
   * Initializes Admin Dashboard DOM and listeners
   */
  init() {
    this.createDashboardDOM();
    this.bindEvents();

    // Check if redirected back with OAuth status parameters
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has("gmail_status")) {
        const gStatus = urlParams.get("gmail_status");
        urlParams.delete("gmail_status");
        const newQuery = urlParams.toString();
        const newUrl = window.location.pathname + (newQuery ? "?" + newQuery : "") + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);

        setTimeout(() => {
          if (window.AuthService && typeof AuthService.isAdministrator === "function" && AuthService.isAdministrator()) {
            this.open();
          }
          if (gStatus === "connected") {
            this.checkGmailStatus();
            if (window.UI && typeof window.UI.showToast === "function") {
              window.UI.showToast("Admin Gmail authorized & connected successfully!", "success");
            }
          } else if (gStatus === "failed") {
            this.checkGmailStatus();
            if (window.UI && typeof window.UI.showToast === "function") {
              window.UI.showToast("Gmail authorization was incomplete or cancelled.", "warning");
            }
          }
        }, 600);
      }
    } catch (e) {}
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
      const modalContent = modal.querySelector(".admin-modal-content");
      if (modalContent) modalContent.scrollTop = 0;
      this.subscribeToLiveTickets();
      this.checkGmailStatus();
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
   * Sets the active filter for tickets, synchronizing pills and stat cards
   */
  setFilter(filterKey, scrollToSection = false) {
    this.activeFilter = filterKey || "all";

    // Synchronize filter pills
    document.querySelectorAll(".admin-filter-pill").forEach(pill => {
      const pFilter = pill.getAttribute("data-filter") || "all";
      if (pFilter === this.activeFilter) {
        pill.classList.add("active");
      } else {
        pill.classList.remove("active");
      }
    });

    // Synchronize stat cards
    document.querySelectorAll(".admin-stat-card").forEach(card => {
      const cFilter = card.getAttribute("data-filter") || "all";
      if (cFilter === this.activeFilter) {
        card.classList.add("active");
      } else {
        card.classList.remove("active");
      }
    });

    this.renderTickets();

    if (scrollToSection) {
      const controls = document.querySelector(".admin-inbox-controls");
      if (controls && typeof controls.scrollIntoView === "function") {
        controls.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  },

  /**
   * Renders ticket count statistics in dashboard header
   */
  updateStats() {
    const total = this.tickets.length;
    const open = this.tickets.filter(t => {
      const s = (t.status || "open").toLowerCase().replace("-", "_");
      return s === "open";
    }).length;
    const inProgress = this.tickets.filter(t => {
      const s = (t.status || "").toLowerCase().replace("-", "_");
      return s === "in_progress" || s === "progress";
    }).length;
    const resolved = this.tickets.filter(t => {
      const s = (t.status || "").toLowerCase().replace("-", "_");
      return s === "resolved";
    }).length;

    const elTotal = document.getElementById("admin-stat-total");
    const elOpen = document.getElementById("admin-stat-open");
    const elProg = document.getElementById("admin-stat-progress");
    const elRes = document.getElementById("admin-stat-resolved");

    if (elTotal) elTotal.textContent = total;
    if (elOpen) elOpen.textContent = open;
    if (elProg) elProg.textContent = inProgress;
    if (elRes) elRes.textContent = resolved;

    // Keep active stat card highlight synced
    document.querySelectorAll(".admin-stat-card").forEach(card => {
      const cFilter = card.getAttribute("data-filter") || "all";
      if (cFilter === this.activeFilter) {
        card.classList.add("active");
      } else {
        card.classList.remove("active");
      }
    });
  },

  /**
   * Renders the list of filtered support tickets
   */
  renderTickets() {
    const container = document.getElementById("admin-tickets-container");
    if (!container) return;

    let filtered = [...this.tickets];
    if (this.activeFilter !== "all") {
      filtered = filtered.filter(t => {
        const s = (t.status || "open").toLowerCase().replace("-", "_");
        if (this.activeFilter === "in_progress") {
          return s === "in_progress" || s === "progress";
        }
        return s === this.activeFilter;
      });
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
      const s = (t.status || "open").toLowerCase().replace("-", "_");
      let statusBadgeClass = "badge-warning";
      let statusLabel = "Open";
      if (s === "in_progress" || s === "progress") {
        statusBadgeClass = "badge-info";
        statusLabel = "In Progress";
      } else if (s === "resolved") {
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
        <div class="admin-ticket-card ${hasReply ? 'ticket-replied' : ''}" data-ticket-id="${t.id}" role="button" tabindex="0" title="Click to view details or respond to this inquiry">
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
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <span class="text-xs font-bold text-primary">✓ Official Response:</span>
                  ${t.replyEmailStatus ? `
                    <span class="admin-status-badge ${t.replyEmailStatus.status === 'delivered' || t.replyEmailStatus.sent ? 'badge-success' : 'badge-warning'}" style="font-size: 10px; padding: 2px 6px;" title="${t.replyEmailStatus.id ? ((t.replyEmailStatus.provider === 'gmail_smtp' ? 'Gmail SMTP ID: ' : (t.replyEmailStatus.provider === 'gmail' ? 'Gmail API ID: ' : 'Resend ID: ')) + t.replyEmailStatus.id) : (t.replyEmailStatus.error || '')}">
                      ${t.replyEmailStatus.status === 'delivered' ? '✓ Delivered' : (t.replyEmailStatus.sent ? (t.replyEmailStatus.provider === 'gmail_smtp' ? '✉️ Gmail SMTP Sent' : (t.replyEmailStatus.provider === 'gmail' ? '✉️ Gmail API Sent' : '✉️ Resend Sent')) : '❌ Email Failed')}
                    </span>
                  ` : ''}
                </div>
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
    document.getElementById("manage-ticket-email").textContent = ticket.registeredEmail || ticket.email || "";
    document.getElementById("manage-ticket-category").textContent = ticket.category || "General Inquiry";
    document.getElementById("manage-ticket-message").textContent = ticket.message || "";
    document.getElementById("manage-ticket-status").value = (ticket.status || "open").toLowerCase();
    document.getElementById("manage-ticket-reply").value = ticket.adminReply || "";

    // Render previous reply history if present
    const historyBox = document.getElementById("manage-ticket-history-box");
    const historyList = document.getElementById("manage-ticket-history-list");
    if (historyBox && historyList) {
      if (Array.isArray(ticket.replyHistory) && ticket.replyHistory.length > 0) {
        historyBox.style.display = "block";
        historyList.innerHTML = ticket.replyHistory.map(r => {
          const rText = typeof r === "string" ? r : (r.reply || "");
          let rDate = "";
          if (r && r.repliedAt) {
            const rd = new Date(r.repliedAt);
            if (!isNaN(rd.getTime())) {
              rDate = rd.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
            }
          }
          return `
            <div style="border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 6px; margin-bottom: 6px;">
              <div style="font-size: 11px; color: #10b981; font-weight: 700;">✓ Official Response${rDate ? ' (' + rDate + ')' : ''}:</div>
              <div style="font-size: 13px; color: #cbd5e1; white-space: pre-wrap; margin-top: 2px;">${this.escapeHtml(rText)}</div>
            </div>
          `;
        }).join("");
      } else {
        historyBox.style.display = "none";
      }
    }

    // Show email dispatch channel indicator (Gmail SMTP vs Gmail API vs Resend)
    const channelInd = document.getElementById("manage-ticket-channel-indicator");
    if (channelInd) {
      if (this.gmailStatus && (this.gmailStatus.method === 'smtp' || this.gmailStatus.provider === 'gmail_smtp')) {
        channelInd.innerHTML = `📬 Channel: <strong>Gmail SMTP</strong> (${this.escapeHtml(this.gmailStatus.connectedEmail || 'wayvora.admin@gmail.com')})`;
        channelInd.style.color = "#4ade80";
      } else if (this.gmailStatus && this.gmailStatus.isConnected) {
        channelInd.innerHTML = `📬 Channel: <strong>Gmail API</strong> (${this.escapeHtml(this.gmailStatus.connectedEmail || 'wayvora.admin@gmail.com')})`;
        channelInd.style.color = "#38bdf8";
      } else {
        channelInd.innerHTML = `📨 Channel: <strong>Resend API</strong>`;
        channelInd.style.color = "#94a3b8";
      }
    }

    // Pre-fill mailto link for direct desktop/mobile email client replies
    const mailtoBtn = document.getElementById("manage-ticket-mailto");
    if (mailtoBtn) {
      const shortId = (ticket.id || "").slice(0, 8).toUpperCase();
      const subject = encodeURIComponent(`Re: WAYVORA Support [#${shortId}] - ${ticket.category || 'Inquiry'}`);
      const body = encodeURIComponent(`\n\n--- Original Inquiry ---\nFrom: ${ticket.name || 'Traveler'} <${ticket.email || ''}>\nCategory: ${ticket.category || ''}\nTicket: #${shortId}\n\n${ticket.message || ''}`);
      mailtoBtn.href = `mailto:${encodeURIComponent(ticket.email || '')}?subject=${subject}&body=${body}`;
    }

    modal.classList.add("active");
  },

  closeManageModal() {
    const modal = document.getElementById("admin-manage-modal");
    if (modal) modal.classList.remove("active");
    this.activeTicket = null;
  },

  /**
   * Saves administrator reply, updates Firestore, and dispatches official reply email via Resend
   */
  async saveTicketUpdate() {
    if (!this.activeTicket) return;

    const saveBtn = document.getElementById("manage-ticket-save-btn");
    const status = document.getElementById("manage-ticket-status")?.value || "open";
    const adminReply = (document.getElementById("manage-ticket-reply")?.value || "").trim();

    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = adminReply ? "Saving & Sending Email..." : "Updating Ticket...";
    }

    try {
      let idToken = null;
      if (window.firebaseAuth && window.firebaseAuth.currentUser && typeof window.firebaseAuth.currentUser.getIdToken === "function") {
        try {
          idToken = await window.firebaseAuth.currentUser.getIdToken(true);
        } catch (tErr) {
          // Token retrieval failed
        }
      }

      if (!idToken) {
        if (window.UI && typeof window.UI.showToast === "function") {
          window.UI.showToast("Admin session expired. Please sign in with your administrator account.", "warning");
        }
        if (window.AuthService && typeof window.AuthService.openAuthModal === "function") {
          window.AuthService.openAuthModal("Please sign in with your administrator account to send official replies.");
        }
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = "Save Changes & Send Reply";
        }
        return;
      }

      // 1. Submit through secure backend /api/support/reply
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${idToken}`
      };

      let backendSuccess = false;
      let emailDelivered = false;
      let responseData = null;

      try {
        const response = await fetch("/api/support/reply", {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            action: "reply",
            ticketId: this.activeTicket.id,
            userId: this.activeTicket.userId || null,
            adminReply: adminReply,
            status: status,
            travelerEmail: this.activeTicket.registeredEmail || this.activeTicket.email,
            travelerName: this.activeTicket.name,
            category: this.activeTicket.category,
            originalMessage: this.activeTicket.message
          })
        });

        if (response.status === 401 || response.status === 403) {
          const errPayload = await response.json().catch(() => ({}));
          const errMsg = errPayload.error || "Forbidden: Only authenticated administrators can send replies.";
          if (window.UI && typeof window.UI.showToast === "function") {
            window.UI.showToast(errMsg, "error");
          }
          alert(errMsg);
          if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = "Save Changes & Send Reply";
          }
          return;
        }

        if (response.ok) {
          responseData = await response.json();
          backendSuccess = !!responseData.success;
          emailDelivered = !!responseData.emailSent;
        } else {
          const errPayload = await response.json().catch(() => ({}));
          throw new Error(errPayload.error || `Server responded with HTTP ${response.status}`);
        }
      } catch (fetchErr) {
        console.error("Backend /api/support/reply error:", fetchErr);
        if (window.UI && typeof window.UI.showToast === "function") {
          window.UI.showToast(`Error communicating with backend: ${fetchErr.message}`, "error");
        }
        alert("Failed to submit reply: " + fetchErr.message);
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = "Save Changes & Send Reply";
        }
        return;
      }

      // 2. Show accurate toast notifications (Never claim "Message sent" if email delivery failed)
      if (window.UI && typeof window.UI.showToast === "function") {
        if (emailDelivered) {
          const recEmail = (responseData && responseData.emailDelivery && responseData.emailDelivery.recipient) || this.activeTicket.registeredEmail || this.activeTicket.email;
          const provider = (responseData && responseData.provider) || (responseData && responseData.emailDelivery && responseData.emailDelivery.provider) || 'gmail_smtp';
          const providerName = provider === 'gmail_smtp'
            ? 'Gmail SMTP'
            : (provider === 'gmail' ? 'Gmail API' : 'Resend');
          const idVal = (responseData && responseData.emailDelivery && responseData.emailDelivery.id) || '';
          const idText = idVal ? ` (ID: ${idVal.slice(0, 10)}...)` : '';
          window.UI.showToast(`Ticket updated & official reply delivered to ${recEmail} via ${providerName}${idText}!`, "success");
        } else if (adminReply && responseData && responseData.emailDelivery && !responseData.emailDelivery.sent) {
          const errReason = responseData.emailDelivery.error || "Email delivery failed";
          window.UI.showToast(`Ticket updated in database, but email delivery to customer failed: ${errReason}`, "warning");
        } else if (adminReply) {
          window.UI.showToast("Ticket updated in database. (Email delivery could not be verified)", "info");
        } else {
          window.UI.showToast("Support ticket status updated.", "success");
        }
      }

      // 3. Refresh tickets list to reflect updated data
      if (this.isLiveConnected && typeof this.refreshTickets === "function") {
        this.refreshTickets();
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
      pill.addEventListener("click", () => {
        const filter = pill.getAttribute("data-filter") || "all";
        this.setFilter(filter, false);
      });
    });

    // Stat cards as interactive filters
    document.querySelectorAll(".admin-stat-card").forEach(card => {
      const filter = card.getAttribute("data-filter");
      if (filter) {
        card.addEventListener("click", () => {
          this.setFilter(filter, true);
        });
        card.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            this.setFilter(filter, true);
          }
        });
      }
    });

    // Search filter input
    document.getElementById("admin-search-input")?.addEventListener("input", () => {
      this.renderTickets();
    });

    // Delegate tickets clicks (Manage, Delete, or click card)
    const container = document.getElementById("admin-tickets-container");
    if (container) {
      container.addEventListener("click", (e) => {
        const btnDelete = e.target.closest(".admin-btn-delete");
        if (btnDelete) {
          const id = btnDelete.getAttribute("data-id");
          this.deleteTicket(id);
          return;
        }

        const btnManage = e.target.closest(".admin-btn-manage");
        if (btnManage) {
          const id = btnManage.getAttribute("data-id");
          this.openManageTicketModal(id);
          return;
        }

        const card = e.target.closest(".admin-ticket-card");
        if (card) {
          const id = card.getAttribute("data-ticket-id");
          if (id) {
            this.openManageTicketModal(id);
          }
        }
      });

      // Keydown accessibility on cards
      container.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          const card = e.target.closest(".admin-ticket-card");
          if (card && !e.target.closest("button") && !e.target.closest("a")) {
            e.preventDefault();
            const id = card.getAttribute("data-ticket-id");
            if (id) {
              this.openManageTicketModal(id);
            }
          }
        }
      });
    }

    // Refresh button
    document.getElementById("admin-btn-refresh")?.addEventListener("click", () => {
      this.subscribeToLiveTickets();
      this.checkGmailStatus();
    });

    // Listen for Gmail OAuth completion message from popup window
    window.addEventListener("message", (e) => {
      if (e.data && e.data.type === "GMAIL_AUTH_SUCCESS") {
        this.checkGmailStatus();
        if (window.UI && typeof window.UI.showToast === "function") {
          window.UI.showToast("Gmail API connected successfully!", "success");
        }
      } else if (e.data && e.data.type === "GMAIL_AUTH_FAILED") {
        this.checkGmailStatus();
        if (window.UI && typeof window.UI.showToast === "function") {
          window.UI.showToast("Gmail authorization failed: " + (e.data.error || "Please try again"), "error");
        }
      }
    });

    // Listen on BroadcastChannel for OAuth events (works across tabs/windows regardless of opener status)
    try {
      if (typeof BroadcastChannel !== "undefined") {
        const bc = new BroadcastChannel("wayvora_gmail_oauth");
        bc.onmessage = (e) => {
          if (e.data && e.data.type === "GMAIL_AUTH_SUCCESS") {
            this.checkGmailStatus();
            if (window.UI && typeof window.UI.showToast === "function") {
              window.UI.showToast("Gmail API connected successfully!", "success");
            }
          } else if (e.data && e.data.type === "GMAIL_AUTH_FAILED") {
            this.checkGmailStatus();
            if (window.UI && typeof window.UI.showToast === "function") {
              window.UI.showToast("Gmail authorization failed: " + (e.data.error || "Please try again"), "error");
            }
          }
        };
      }
    } catch (bcErr) {}

    // Listen on localStorage for cross-window OAuth events
    window.addEventListener("storage", (e) => {
      if (e.key === "wayvora_gmail_oauth_event" && e.newValue) {
        try {
          const payload = JSON.parse(e.newValue);
          if (payload.type === "GMAIL_AUTH_SUCCESS") {
            this.checkGmailStatus();
            if (window.UI && typeof window.UI.showToast === "function") {
              window.UI.showToast("Gmail API connected successfully!", "success");
            }
          } else if (payload.type === "GMAIL_AUTH_FAILED") {
            this.checkGmailStatus();
            if (window.UI && typeof window.UI.showToast === "function") {
              window.UI.showToast("Gmail authorization failed: " + (payload.error || "Please try again"), "error");
            }
          }
        } catch (parseErr) {}
      }
    });
  },

  /**
   * Checks the Gmail API OAuth2 connection status from the server
   */
  async checkGmailStatus() {
    const badge = document.getElementById("admin-gmail-badge");
    const detail = document.getElementById("admin-gmail-detail");
    const actions = document.getElementById("admin-gmail-actions");
    const emailEl = document.getElementById("admin-gmail-connected-email");
    const emailCheck = document.getElementById("admin-gmail-email-check");
    const scopeEl = document.getElementById("admin-gmail-scope");
    const channelEl = document.getElementById("admin-gmail-channel");

    if (!badge || !detail || !actions) return;

    try {
      const res = await fetch("/api/auth/google/status");
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      this.gmailStatus = data;

      if (data.isConnected) {
        const isSmtp = data.method === 'smtp' || data.provider === 'gmail_smtp';
        badge.className = "admin-dispatch-badge badge-connected";
        badge.textContent = isSmtp ? "🟢 Gmail SMTP Active" : "🟢 Gmail Connected";

        if (emailEl) emailEl.textContent = data.connectedEmail || "wayvora.admin@gmail.com";
        if (emailCheck) emailCheck.style.display = "inline";
        if (scopeEl) scopeEl.textContent = data.scope || (isSmtp ? "smtp.gmail.com:465 (SSL)" : "https://www.googleapis.com/auth/gmail.send");
        if (channelEl) channelEl.textContent = data.channel || (isSmtp ? "Gmail SMTP (Nodemailer) • wayvora.admin@gmail.com" : "Gmail REST API (Active Primary) • Resend Sandbox (Fallback)");

        if (isSmtp) {
          detail.innerHTML = `<span style="color: #4ade80; font-weight: 700;">✓ Active &amp; Ready:</span> Official customer support replies to traveler inquiries will be dispatched directly from <strong>${this.escapeHtml(data.connectedEmail || 'wayvora.admin@gmail.com')}</strong> via Gmail SMTP (Nodemailer).`;

          actions.innerHTML = `
            <button type="button" class="btn-dispatch-test" id="btn-gmail-test" title="Send a verification test email via Gmail SMTP to ${this.escapeHtml(data.connectedEmail || 'wayvora.admin@gmail.com')}">
              ✉️ Send Test Email
            </button>
            <div style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 6px;">
              Configured via GMAIL_APP_PASSWORD
            </div>
          `;
          document.getElementById("btn-gmail-test")?.addEventListener("click", () => this.testGmailConnection());
        } else {
          detail.innerHTML = `<span style="color: #4ade80; font-weight: 700;">✓ Active &amp; Ready:</span> Official customer support replies to traveler inquiries will be dispatched directly from <strong>${this.escapeHtml(data.connectedEmail || 'wayvora.admin@gmail.com')}</strong> via the Google Cloud Gmail API.`;

          actions.innerHTML = `
            <button type="button" class="btn-dispatch-test" id="btn-gmail-test" title="Send a verification test email to ${this.escapeHtml(data.connectedEmail || 'wayvora.admin@gmail.com')}">
              ✉️ Send Test Email
            </button>
            <button type="button" class="btn-dispatch-disconnect" id="btn-gmail-disconnect" title="Disconnect Gmail integration and revert support replies to Resend">
              Disconnect Gmail
            </button>
          `;
          document.getElementById("btn-gmail-test")?.addEventListener("click", () => this.testGmailConnection());
          document.getElementById("btn-gmail-disconnect")?.addEventListener("click", () => this.disconnectGmail());
        }
      } else if (data.isConfigured) {
        badge.className = "admin-dispatch-badge badge-warning";
        badge.textContent = "🟡 Authorization Required";

        if (emailEl) emailEl.textContent = "Authorization Pending";
        if (emailCheck) emailCheck.style.display = "none";
        if (channelEl) channelEl.textContent = "Resend Sandbox (Active) • Gmail API (Pending Authorization)";

        detail.innerHTML = `Google Cloud Client ID configured. Click <strong>Connect Admin Gmail</strong> to authorize <code>${this.escapeHtml(data.connectedEmail || 'wayvora.admin@gmail.com')}</code>.`;

        actions.innerHTML = `
          <button type="button" class="btn-dispatch-connect" id="btn-gmail-connect">
            Connect Admin Gmail
          </button>
        `;
        document.getElementById("btn-gmail-connect")?.addEventListener("click", () => this.connectGmail());
      } else {
        badge.className = "admin-dispatch-badge";
        badge.textContent = "⚪ Pending Configuration";

        if (emailEl) emailEl.textContent = "Not Configured";
        if (emailCheck) emailCheck.style.display = "none";

        detail.textContent = "GMAIL_APP_PASSWORD or GOOGLE_CLIENT_ID not configured in .env. (Support replies currently dispatch via Resend).";

        actions.innerHTML = `
          <button type="button" class="btn-dispatch-connect" id="btn-gmail-connect" disabled style="opacity: 0.5; cursor: not-allowed;" title="Add GMAIL_APP_PASSWORD or GOOGLE_CLIENT_ID to .env">
            Configure Gmail Password
          </button>
        `;
      }
    } catch (err) {
      console.warn("Failed to check Gmail status:", err);
      badge.className = "admin-dispatch-badge badge-error";
      badge.textContent = "⚠️ Unreachable";

      if (emailEl) emailEl.textContent = "Server Offline";
      if (emailCheck) emailCheck.style.display = "none";

      detail.textContent = `Could not reach backend /api/auth/google/status (${err.message}). Restart the Node server (node server.js) to load latest routes.`;
      actions.innerHTML = `
        <button type="button" class="btn btn-outline btn-sm" id="btn-gmail-retry" style="font-size: 11px;">
          🔄 Retry
        </button>
      `;
      document.getElementById("btn-gmail-retry")?.addEventListener("click", () => this.checkGmailStatus());
    }
  },

  /**
   * Initiates the Google OAuth 2.0 authorization flow
   */
  async connectGmail() {
    const connectBtn = document.getElementById("btn-gmail-connect");
    if (connectBtn) {
      connectBtn.disabled = true;
      connectBtn.textContent = "Opening Google Sign-In...";
    }

    try {
      const res = await fetch("/api/auth/google/url");
      const data = await res.json();
      if (!data.success || !data.authUrl) {
        alert("Failed to initiate Google authorization: " + (data.error || "Missing client credentials in server environment"));
        return;
      }

      // Open Google OAuth in a popup window
      const popup = window.open(data.authUrl, "wayvora_gmail_oauth", "width=600,height=720,status=no,resizable=yes");
      if (!popup || popup.closed || typeof popup.closed === "undefined") {
        window.location.href = data.authUrl;
      }

      // Active status polling fallback: Checks every 2 seconds while user is authorizing
      let pollCount = 0;
      if (this._oauthPollInterval) clearInterval(this._oauthPollInterval);
      this._oauthPollInterval = setInterval(async () => {
        pollCount++;
        if (pollCount > 30) {
          clearInterval(this._oauthPollInterval);
          this._oauthPollInterval = null;
          return;
        }
        try {
          const sRes = await fetch("/api/auth/google/status");
          if (sRes.ok) {
            const sData = await sRes.json();
            if (sData.isConnected) {
              clearInterval(this._oauthPollInterval);
              this._oauthPollInterval = null;
              this.checkGmailStatus();
              if (window.UI && typeof window.UI.showToast === "function") {
                window.UI.showToast("Gmail API connected successfully!", "success");
              }
            }
          }
        } catch (e) {}
      }, 2000);

    } catch (err) {
      alert("Error initiating Google OAuth: " + err.message);
    } finally {
      if (connectBtn) {
        connectBtn.disabled = false;
        connectBtn.textContent = "Connect Admin Gmail";
      }
    }
  },

  /**
   * Sends a verification test email via Gmail SMTP or Gmail REST API
   */
  async testGmailConnection() {
    const testBtn = document.getElementById("btn-gmail-test");
    const banner = document.getElementById("admin-gmail-test-banner");
    const isSmtp = this.gmailStatus && (this.gmailStatus.method === 'smtp' || this.gmailStatus.provider === 'gmail_smtp');
    const channelName = isSmtp ? 'Gmail SMTP (Nodemailer)' : 'Gmail REST API';

    if (testBtn) {
      testBtn.disabled = true;
      testBtn.innerHTML = "⏳ Sending Test Email...";
    }
    if (banner) {
      banner.style.display = "block";
      banner.className = "admin-test-feedback feedback-loading";
      banner.innerHTML = `⏳ Dispatching verification test email via ${channelName} to <strong>wayvora.admin@gmail.com</strong>...`;
    }

    try {
      let idToken = null;
      if (window.firebaseAuth && window.firebaseAuth.currentUser) {
        idToken = await window.firebaseAuth.currentUser.getIdToken().catch(() => null);
      }
      const headers = { "Content-Type": "application/json" };
      if (idToken) headers["Authorization"] = `Bearer ${idToken}`;

      const res = await fetch("/api/auth/google/test", {
        method: "POST",
        headers
      });
      const data = await res.json();
      if (data.success) {
        const msgId = data.messageId || "Dispatched";
        const recipient = data.recipient || "wayvora.admin@gmail.com";
        const prov = data.provider === 'gmail_smtp' ? 'Gmail SMTP (Nodemailer)' : (data.provider === 'gmail' ? 'Gmail REST API' : 'Gmail');
        if (banner) {
          banner.className = "admin-test-feedback feedback-success";
          banner.innerHTML = `<strong>✓ Verification Test Email Sent Successfully!</strong><br>Dispatched from <strong>${this.escapeHtml(recipient)}</strong> via ${prov}.<br><span style="font-size: 11.5px; opacity: 0.9;">Message ID: <code>${this.escapeHtml(msgId)}</code></span>`;
        }
        if (window.UI && typeof window.UI.showToast === "function") {
          window.UI.showToast(`Test email verified via ${prov}! Message ID: ${msgId}`, "success");
        } else {
          alert(`Test email verified via ${prov}! Message ID: ${msgId}`);
        }
      } else {
        const prov = data.provider === 'gmail_smtp' ? 'Gmail SMTP' : 'Gmail';
        if (banner) {
          banner.className = "admin-test-feedback feedback-error";
          banner.innerHTML = `<strong>✕ ${prov} Test Failed:</strong> ${this.escapeHtml(data.error || "Unknown error")}`;
        }
        if (window.UI && typeof window.UI.showToast === "function") {
          window.UI.showToast(`${prov} test failed: ${data.error || "Unknown error"}`, "error");
        } else {
          alert(`${prov} test failed: ${data.error || "Unknown error"}`);
        }
      }
    } catch (err) {
      if (banner) {
        banner.className = "admin-test-feedback feedback-error";
        banner.innerHTML = `<strong>✕ Network Error:</strong> ${this.escapeHtml(err.message)}`;
      }
      alert("Failed to send test email: " + err.message);
    } finally {
      if (testBtn) {
        testBtn.disabled = false;
        testBtn.innerHTML = "✉️ Send Test Email";
      }
    }
  },

  /**
   * Disconnects the Gmail API integration
   */
  async disconnectGmail() {
    if (!confirm("Are you sure you want to disconnect the Gmail API integration? Support replies will revert to Resend.")) return;

    const banner = document.getElementById("admin-gmail-test-banner");
    if (banner) banner.style.display = "none";

    try {
      let idToken = null;
      if (window.firebaseAuth && window.firebaseAuth.currentUser) {
        idToken = await window.firebaseAuth.currentUser.getIdToken().catch(() => null);
      }
      const headers = { "Content-Type": "application/json" };
      if (idToken) headers["Authorization"] = `Bearer ${idToken}`;

      const res = await fetch("/api/auth/google/disconnect", { method: "POST", headers });
      const data = await res.json();
      if (data.success) {
        if (window.UI && typeof window.UI.showToast === "function") {
          window.UI.showToast("Gmail API integration disconnected.", "info");
        }
        await this.checkGmailStatus();
      } else {
        alert("Disconnect failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Disconnect failed: " + err.message);
    }
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

        <!-- System Stats Bar (Clickable Filter Cards) -->
        <div class="admin-stats-grid">
          <div class="admin-stat-card active" data-filter="all" title="View all support inquiries" role="button" tabindex="0">
            <div class="admin-stat-value" id="admin-stat-total">0</div>
            <div class="admin-stat-label">Total Inquiries</div>
            <span class="admin-stat-hint">Click to filter</span>
          </div>
          <div class="admin-stat-card stat-open" data-filter="open" title="Filter by Open inquiries" role="button" tabindex="0">
            <div class="admin-stat-value" id="admin-stat-open">0</div>
            <div class="admin-stat-label">Open Tickets</div>
            <span class="admin-stat-hint">Click to filter</span>
          </div>
          <div class="admin-stat-card stat-progress" data-filter="in_progress" title="Filter by In Progress inquiries" role="button" tabindex="0">
            <div class="admin-stat-value" id="admin-stat-progress">0</div>
            <div class="admin-stat-label">In Progress</div>
            <span class="admin-stat-hint">Click to filter</span>
          </div>
          <div class="admin-stat-card stat-resolved" data-filter="resolved" title="Filter by Resolved inquiries" role="button" tabindex="0">
            <div class="admin-stat-value" id="admin-stat-resolved">0</div>
            <div class="admin-stat-label">Resolved</div>
            <span class="admin-stat-hint">Click to filter</span>
          </div>
        </div>

        <!-- Gmail Support Dispatch Section (Administrator Only) -->
        <div class="admin-dispatch-section" id="admin-gmail-dispatch-section">
          <div class="admin-dispatch-header">
            <div class="admin-dispatch-title-group">
              <div class="admin-dispatch-icon-box">✉️</div>
              <div style="flex: 1;">
                <div class="admin-dispatch-title-row">
                  <h3 class="admin-dispatch-title">Gmail Support Dispatch</h3>
                  <span class="admin-dispatch-badge" id="admin-gmail-badge">Checking connection...</span>
                  <span class="admin-private-tag">Admin Only</span>
                </div>
                <p class="admin-dispatch-desc">
                  Official customer support replies sent to travelers are dispatched directly from your authorized administrator Gmail address via the Google Cloud Gmail API.
                </p>
              </div>
            </div>
          </div>

          <div class="admin-dispatch-card" id="admin-gmail-card">
            <div class="admin-dispatch-card-left">
              <div class="admin-dispatch-meta-grid">
                <div class="admin-dispatch-meta-item">
                  <span class="admin-meta-label">Connected Administrator Email</span>
                  <div class="admin-meta-email-pill" id="admin-gmail-email-display">
                    <span class="email-check" id="admin-gmail-email-check">✓</span>
                    <strong id="admin-gmail-connected-email">wayvora.admin@gmail.com</strong>
                  </div>
                </div>
                <div class="admin-dispatch-meta-item">
                  <span class="admin-meta-label">Google Cloud OAuth Scope</span>
                  <code class="admin-meta-scope" id="admin-gmail-scope">https://www.googleapis.com/auth/gmail.send</code>
                </div>
                <div class="admin-dispatch-meta-item">
                  <span class="admin-meta-label">Delivery Channel &amp; Fallback</span>
                  <span class="admin-meta-val" id="admin-gmail-channel">Gmail REST API (Active) • Resend Sandbox (Fallback)</span>
                </div>
              </div>
              <div id="admin-gmail-detail" class="admin-dispatch-status-note">
                Connected and ready to send official support replies.
              </div>
              <div id="admin-gmail-test-banner" class="admin-test-feedback" style="display: none;"></div>
            </div>

            <div class="admin-dispatch-card-right" id="admin-gmail-actions">
              <!-- Action buttons dynamically injected by checkGmailStatus() -->
            </div>
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

          <div id="manage-ticket-history-box" class="mt-3" style="display: none;">
            <span class="text-xs text-muted font-bold block mb-1">Previous Reply History:</span>
            <div id="manage-ticket-history-list" style="background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 0.75rem; max-height: 140px; overflow-y: auto;"></div>
          </div>

          <div class="manage-form-group mt-3">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <label for="manage-ticket-reply" class="text-xs font-bold block" style="margin: 0;">Official Administrator Response</label>
              <span id="manage-ticket-channel-indicator" style="font-size: 11px; color: #38bdf8; font-weight: 600;"></span>
            </div>
            <textarea id="manage-ticket-reply" class="form-control" rows="4" placeholder="Write an official response visible to this traveler in their account..."></textarea>
            <span class="text-xs text-muted mt-1 block">This response will be securely delivered to the customer's portal and dispatched by email.</span>
          </div>
        </div>
        <div class="admin-submodal-footer">
          <div class="admin-submodal-footer-left">
            <a id="manage-ticket-mailto" href="#" class="btn btn-outline btn-sm" target="_blank" title="Open your email client to reply directly">
              ✉️ Email Traveler Directly
            </a>
          </div>
          <div class="admin-submodal-footer-right">
            <button type="button" class="btn btn-outline btn-sm" id="manage-ticket-cancel-btn">Cancel</button>
            <button type="button" class="btn btn-primary btn-sm" id="manage-ticket-save-btn">Save Changes &amp; Send Reply</button>
          </div>
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
