/**
 * Wayvora - Conversational AI Assistant & Travel Concierge
 * Supports worldwide travel planning, Indian states & Union Territories,
 * real-time Open-Meteo weather integration, multi-turn conversational memory,
 * two-way voice interaction (Speech-to-Text & Text-to-Speech in English, Kannada, Hindi),
 * and general multi-topic assistance.
 */

const AIChatbot = {
  isOpen: false,
  isTyping: false,
  isRecording: false,
  recognitionInstance: null,
  selectedVoiceLang: "auto", // 'auto', 'en-IN', 'kn-IN', 'hi-IN'
  availableVoices: [],
  activeSpeakingIndex: null,
  activeUtterance: null,
  speechBaseInputVal: "",
  _toastTimer: null,
  conversationHistory: [],
  messages: [
    {
      sender: "ai",
      time: "Just now",
      text: "Hello! 👋 I'm **Wayvora AI**, your versatile general-purpose AI assistant and travel concierge.\n\nYou can ask me **anything**—from programming, computer science, and cybersecurity, to math, science, language translations (**English**, **Kannada**, **Hindi**), vocabulary, career guidance, and creative writing—as well as personalized day-by-day travel itineraries worldwide. How can I help you today?"
    }
  ],

  suggestedQuestions: [
    "Plan a 3-day trip in India.",
    "Explore the best destinations in India.",
    "Suggest budget-friendly international trips.",
    "What are the best places to visit in Goa?",
    "Estimate my travel budget.",
    "What is the best time to visit Bali?"
  ],

  init() {
    this.createChatWidget();
    this.bindEvents();
    this.initVoices();
  },

  /**
   * Initialize speech synthesis voices
   */
  initVoices() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const loadVoices = () => {
        try {
          this.availableVoices = window.speechSynthesis.getVoices() || [];
        } catch (e) {
          this.availableVoices = [];
        }
      };
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  },

  createChatWidget() {
    if (document.getElementById("ai-chat-container")) return;

    const container = document.createElement("div");
    container.id = "ai-chat-container";
    container.className = "ai-chat-container";

    container.innerHTML = `
      <!-- Floating Trigger Button -->
      <button class="ai-chat-trigger" id="ai-chat-trigger" aria-label="Open AI Travel Assistant">
        <div class="ai-trigger-icon-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
          </svg>
        </div>
        <span class="ai-trigger-label">Ask AI Assistant</span>
      </button>

      <!-- Chat Window Panel -->
      <div class="ai-chat-window" id="ai-chat-window" role="dialog" aria-modal="false" aria-label="Wayvora AI Travel Assistant">
        <!-- Voice Toast Notification -->
        <div class="ai-voice-toast" id="ai-voice-toast" role="status" aria-live="polite"></div>

        <!-- Chat Header -->
        <div class="ai-chat-header">
          <div class="ai-concierge-profile">
            <div class="ai-avatar-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
              </svg>
              <span class="online-indicator" title="Online"></span>
            </div>
            <div>
              <h3 class="ai-concierge-title">Wayvora AI Assistant</h3>
              <p class="ai-concierge-status">Online • General AI Assistant & Travel Concierge</p>
            </div>
          </div>
          <div class="ai-header-controls">
            <button class="ai-btn-icon" id="ai-chat-minimize" title="Minimize chat" aria-label="Minimize chat">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>
        </div>

        <!-- Chat Conversation Messages Area -->
        <div class="ai-chat-body" id="ai-chat-messages"></div>

        <!-- Quick Suggestions Carousel -->
        <div class="ai-suggested-prompts-bar" id="ai-suggested-prompts">
          <span class="prompts-label">Quick suggestions:</span>
          <div class="prompts-scroll">
            ${this.suggestedQuestions.map(q => `
              <button type="button" class="ai-prompt-chip" data-prompt="${q.replace(/"/g, '&quot;')}">${q}</button>
            `).join("")}
          </div>
        </div>

        <!-- Voice Recognition Live Status Bar -->
        <div class="ai-voice-status-bar" id="ai-voice-status-bar">
          <div class="voice-status-info">
            <span class="voice-rec-dot"></span>
            <span class="voice-status-text" id="voice-status-text">Listening... Speak now</span>
          </div>
          <div class="voice-status-actions">
            <button type="button" class="voice-cancel-btn" id="voice-cancel-btn" title="Cancel voice input">Cancel</button>
            <button type="button" class="voice-done-btn" id="voice-done-btn" title="Finish voice input">Done</button>
          </div>
        </div>

        <!-- Chat Input Footer -->
        <form class="ai-chat-input-row" id="ai-chat-form">
          <!-- Voice Language Selector -->
          <div class="ai-voice-lang-picker" id="ai-voice-lang-picker">
            <button type="button" class="ai-btn-lang" id="ai-btn-lang" title="Select Voice Recognition Language" aria-label="Select voice recognition language">
              <span id="ai-current-lang-label">Auto</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div class="ai-lang-menu" id="ai-lang-menu">
              <button type="button" class="ai-lang-opt active" data-lang="auto">🌐 Auto Detect</button>
              <button type="button" class="ai-lang-opt" data-lang="en-IN">🇬🇧 English (India)</button>
              <button type="button" class="ai-lang-opt" data-lang="kn-IN">🇮🇳 Kannada (ಕನ್ನಡ)</button>
              <button type="button" class="ai-lang-opt" data-lang="hi-IN">🇮🇳 Hindi (हिंदी)</button>
            </div>
          </div>

          <!-- Microphone Voice Input Button -->
          <button type="button" class="ai-btn-mic" id="ai-btn-mic" title="Voice typing (Speak to assistant)" aria-label="Voice typing">
            <svg class="icon-mic" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="22"></line>
              <line x1="8" y1="22" x2="16" y2="22"></line>
            </svg>
          </button>

          <input 
            type="text" 
            id="ai-chat-input" 
            placeholder="Ask anything (coding, math, translations, travel)..." 
            autocomplete="off" 
            required 
          />
          <button type="submit" class="ai-btn-send" id="ai-btn-send" title="Send message" aria-label="Send message">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(container);
    this.renderMessages();
  },

  bindEvents() {
    const trigger = document.getElementById("ai-chat-trigger");
    const minimizeBtn = document.getElementById("ai-chat-minimize");
    const form = document.getElementById("ai-chat-form");
    const input = document.getElementById("ai-chat-input");
    const micBtn = document.getElementById("ai-btn-mic");
    const cancelBtn = document.getElementById("voice-cancel-btn");
    const doneBtn = document.getElementById("voice-done-btn");
    const langBtn = document.getElementById("ai-btn-lang");
    const langMenu = document.getElementById("ai-lang-menu");
    const langPicker = document.getElementById("ai-voice-lang-picker");
    const langLabel = document.getElementById("ai-current-lang-label");

    if (trigger) trigger.addEventListener("click", () => this.toggleChat());
    if (minimizeBtn) minimizeBtn.addEventListener("click", () => this.closeChat());

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text || this.isTyping) return;
        if (this.isRecording) {
          this.stopVoiceRecognition(true);
        }
        this.stopSpeaking();
        this.sendMessage(text);
        input.value = "";
      });
    }

    // Microphone button toggle
    if (micBtn) {
      micBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (this.isRecording) {
          this.stopVoiceRecognition(true);
        } else {
          this.startVoiceRecognition();
        }
      });
    }

    // Voice status bar action buttons
    if (cancelBtn) {
      cancelBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.cancelVoiceRecognition();
      });
    }
    if (doneBtn) {
      doneBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.stopVoiceRecognition(true);
      });
    }

    // Language picker toggle
    if (langBtn && langMenu) {
      langBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        langMenu.classList.toggle("show");
      });

      // Language selection
      langMenu.querySelectorAll(".ai-lang-opt").forEach(opt => {
        opt.addEventListener("click", (e) => {
          e.preventDefault();
          const lang = opt.dataset.lang;
          this.selectedVoiceLang = lang;
          langMenu.querySelectorAll(".ai-lang-opt").forEach(o => o.classList.toggle("active", o === opt));
          const labelMap = { auto: "Auto", "en-IN": "EN", "kn-IN": "KN", "hi-IN": "HI" };
          if (langLabel) langLabel.textContent = labelMap[lang] || "Auto";
          langMenu.classList.remove("show");
          this.showVoiceStatusToast(`Voice set to: ${opt.textContent.trim().replace(/^🌐|🇮🇳|🇬🇧\s*/, "")}`);
        });
      });

      // Close dropdown when clicking outside
      document.addEventListener("click", (e) => {
        if (langPicker && !langPicker.contains(e.target)) {
          langMenu.classList.remove("show");
        }
      });
    }

    // Delegated click handler for suggestion chips (handles dynamic updates)
    const promptsBar = document.getElementById("ai-suggested-prompts");
    if (promptsBar) {
      promptsBar.addEventListener("click", (e) => {
        const chip = e.target.closest(".ai-prompt-chip");
        if (chip) {
          const prompt = chip.dataset.prompt;
          if (prompt && !this.isTyping) {
            if (this.isRecording) this.stopVoiceRecognition(true);
            this.stopSpeaking();
            this.sendMessage(prompt);
          }
        }
      });
    }

    // Delegated click listener for copy-code and Text-to-Speech (TTS) speaker buttons
    const messagesContainer = document.getElementById("ai-chat-messages");
    if (messagesContainer) {
      messagesContainer.addEventListener("click", (e) => {
        const copyBtn = e.target.closest(".ai-copy-code-btn");
        if (copyBtn) {
          e.preventDefault();
          const rawCode = copyBtn.getAttribute("data-code");
          if (rawCode) {
            const codeToCopy = decodeURIComponent(rawCode);
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(codeToCopy).then(() => {
                const label = copyBtn.querySelector("span");
                if (label) label.textContent = "Copied! ✓";
                copyBtn.classList.add("copied");
                setTimeout(() => {
                  if (label) label.textContent = "Copy";
                  copyBtn.classList.remove("copied");
                }, 2000);
              }).catch(() => {
                const label = copyBtn.querySelector("span");
                if (label) label.textContent = "Copied! ✓";
              });
            }
          }
          return;
        }

        const speakBtn = e.target.closest(".ai-btn-speak");
        if (speakBtn) {
          e.preventDefault();
          const idx = parseInt(speakBtn.dataset.msgIdx, 10);
          if (!isNaN(idx)) {
            this.speakMessage(idx);
          }
        }
      });
    }
  },

  toggleChat() {
    if (this.isOpen) {
      this.closeChat();
    } else {
      this.openChat();
    }
  },

  openChat() {
    const windowEl = document.getElementById("ai-chat-window");
    const trigger = document.getElementById("ai-chat-trigger");
    if (!windowEl) return;
    this.isOpen = true;
    windowEl.classList.add("active");
    if (trigger) trigger.classList.add("hidden");
    setTimeout(() => {
      document.getElementById("ai-chat-input")?.focus();
    }, 200);
    this.scrollToBottom();
  },

  closeChat() {
    const windowEl = document.getElementById("ai-chat-window");
    const trigger = document.getElementById("ai-chat-trigger");
    if (!windowEl) return;
    this.isOpen = false;
    windowEl.classList.remove("active");
    if (trigger) trigger.classList.remove("hidden");
    if (this.isRecording) this.cancelVoiceRecognition();
    this.stopSpeaking();
  },

  /**
   * Display temporary voice status toast
   */
  showVoiceStatusToast(message, type = "info") {
    const toast = document.getElementById("ai-voice-toast");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    if (this._toastTimer) clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3500);
  },

  /**
   * Start Speech-to-Text Voice Recognition
   */
  startVoiceRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.showVoiceStatusToast("Speech recognition is not supported in this browser. Try Google Chrome or Microsoft Edge.");
      return;
    }

    // Stop active speech playback if currently talking
    this.stopSpeaking();

    const input = document.getElementById("ai-chat-input");
    const micBtn = document.getElementById("ai-btn-mic");
    const statusBar = document.getElementById("ai-voice-status-bar");
    const statusText = document.getElementById("voice-status-text");

    this.speechBaseInputVal = input ? input.value : "";

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      // Determine language
      let targetLang = "en-IN";
      if (this.selectedVoiceLang === "kn-IN") {
        targetLang = "kn-IN";
      } else if (this.selectedVoiceLang === "hi-IN") {
        targetLang = "hi-IN";
      } else if (this.selectedVoiceLang === "en-IN") {
        targetLang = "en-IN";
      } else {
        // Auto: inspect context or default to Indian English / browser language
        const lastMsg = this.conversationHistory.slice(-1)[0]?.content || "";
        if (/[\u0C80-\u0CFF]/.test(lastMsg)) targetLang = "kn-IN";
        else if (/[\u0900-\u097F]/.test(lastMsg)) targetLang = "hi-IN";
        else targetLang = navigator.language || "en-IN";
      }
      recognition.lang = targetLang;

      this.recognitionInstance = recognition;
      this.isRecording = true;

      if (micBtn) micBtn.classList.add("is-recording");
      if (statusBar) statusBar.classList.add("active");
      const langNames = { "kn-IN": "Kannada", "hi-IN": "Hindi", "en-IN": "English" };
      const displayLang = langNames[targetLang] || targetLang.split("-")[0].toUpperCase();
      if (statusText) statusText.textContent = `Listening (${displayLang})... Speak now`;

      let finalTranscript = "";

      recognition.onresult = (event) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i][0];
          if (event.results[i].isFinal) {
            finalTranscript += item.transcript + " ";
          } else {
            interimTranscript += item.transcript;
          }
        }

        if (input) {
          const combined = (this.speechBaseInputVal ? this.speechBaseInputVal + " " : "") + finalTranscript + interimTranscript;
          input.value = combined.trimStart();
        }
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition notice:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          this.showVoiceStatusToast("Microphone permission denied. Please allow microphone access in your browser.");
        } else if (event.error === "no-speech") {
          this.showVoiceStatusToast("No speech detected. Please try speaking again.");
        } else if (event.error === "audio-capture") {
          this.showVoiceStatusToast("Microphone not detected or unavailable.");
        } else if (event.error === "network") {
          this.showVoiceStatusToast("Network issue encountered during speech recognition.");
        }
        this.cleanupVoiceRecognition();
      };

      recognition.onend = () => {
        if (this.isRecording) {
          this.cleanupVoiceRecognition();
        }
      };

      recognition.start();
    } catch (err) {
      console.warn("Failed to start speech recognition:", err);
      this.showVoiceStatusToast("Could not access microphone.");
      this.cleanupVoiceRecognition();
    }
  },

  /**
   * Stop Speech-to-Text Voice Recognition and retain transcribed text
   */
  stopVoiceRecognition(saveResult = true) {
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.stop();
      } catch (e) {}
    }
    this.cleanupVoiceRecognition();
    const input = document.getElementById("ai-chat-input");
    if (!saveResult && input) {
      input.value = this.speechBaseInputVal;
    }
    if (input) input.focus();
  },

  /**
   * Cancel Speech-to-Text Voice Recognition and revert input
   */
  cancelVoiceRecognition() {
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.abort();
      } catch (e) {}
    }
    const input = document.getElementById("ai-chat-input");
    if (input) {
      input.value = this.speechBaseInputVal;
    }
    this.cleanupVoiceRecognition();
    this.showVoiceStatusToast("Voice input cancelled.");
  },

  /**
   * Clean up UI recording states
   */
  cleanupVoiceRecognition() {
    this.isRecording = false;
    this.recognitionInstance = null;
    const micBtn = document.getElementById("ai-btn-mic");
    const statusBar = document.getElementById("ai-voice-status-bar");
    if (micBtn) micBtn.classList.remove("is-recording");
    if (statusBar) statusBar.classList.remove("active");
  },

  /**
   * Clean markdown, symbols, and formatting for natural spoken audio
   */
  cleanTextForSpeech(text) {
    if (!text) return "";
    let clean = text;

    // Remove code blocks
    clean = clean.replace(/```[\s\S]*?```/g, " ");
    // Remove inline code
    clean = clean.replace(/`([^`]+)`/g, "$1");
    // Expand currency symbols
    clean = clean.replace(/₹\s*([0-9,]+)/g, "$1 Rupees");
    clean = clean.replace(/\$\s*([0-9,]+)/g, "$1 Dollars");
    clean = clean.replace(/€\s*([0-9,]+)/g, "$1 Euros");
    // Replace markdown links [label](url) with label
    clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    // Remove markdown headers
    clean = clean.replace(/^#{1,6}\s+/gm, "");
    // Remove bold, italics, strikethrough
    clean = clean.replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1");
    clean = clean.replace(/_{1,3}([^_]+)_{1,3}/g, "$1");
    clean = clean.replace(/~{1,2}([^~]+)~{1,2}/g, "$1");
    // Remove bullet points and numbered list markers
    clean = clean.replace(/^\s*[-*•]\s+/gm, "");
    clean = clean.replace(/^\s*\d+\.\s+/gm, "");
    // Remove emojis and common decorative symbols
    clean = clean.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA00}-\u{1FAFF}]/gu, "");
    // Normalize whitespace
    clean = clean.replace(/\s+/g, " ").trim();

    return clean;
  },

  /**
   * Detect message language for Text-to-Speech voice matching
   */
  detectMessageLanguage(text) {
    if (!text) return "en-IN";
    // Check Kannada Unicode range: 0C80 - 0CFF
    if (/[\u0C80-\u0CFF]/.test(text)) return "kn-IN";
    // Check Devanagari (Hindi) Unicode range: 0900 - 097F
    if (/[\u0900-\u097F]/.test(text)) return "hi-IN";
    // Respect selected voice language if explicitly set
    if (this.selectedVoiceLang && this.selectedVoiceLang !== "auto") {
      return this.selectedVoiceLang;
    }
    return "en-IN";
  },

  /**
   * Read AI response aloud using SpeechSynthesis
   */
  speakMessage(index) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      this.showVoiceStatusToast("Voice playback is not supported on this browser.");
      return;
    }

    // Toggle playback if clicked on currently active message
    if (this.activeSpeakingIndex === index) {
      if (window.speechSynthesis.speaking) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
          this.updateSpeakerButtons(index, true);
          return;
        } else {
          this.stopSpeaking();
          return;
        }
      }
    }

    // Stop any ongoing speech or microphone recording
    this.stopSpeaking();
    if (this.isRecording) {
      this.stopVoiceRecognition(true);
    }

    const msg = this.messages[index];
    if (!msg || !msg.text) return;

    const cleanText = this.cleanTextForSpeech(msg.text);
    if (!cleanText) return;

    const langCode = this.detectMessageLanguage(msg.text);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = langCode;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Select optimal voice available on device
    const voices = window.speechSynthesis.getVoices() || this.availableVoices || [];
    if (voices && voices.length > 0) {
      const langPrefix = langCode.split("-")[0].toLowerCase();
      // 1. Exact language match (e.g. 'kn-IN', 'hi-IN', 'en-IN')
      let matchedVoice = voices.find(v => v.lang && v.lang.toLowerCase() === langCode.toLowerCase());
      // 2. Language prefix match (e.g. 'kn', 'hi', 'en')
      if (!matchedVoice) {
        matchedVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(langPrefix));
      }
      // 3. Indian English preference for English
      if (!matchedVoice && langPrefix === "en") {
        matchedVoice = voices.find(v => v.lang && (v.lang.toLowerCase().includes("in") || (v.name && v.name.toLowerCase().includes("india"))));
      }
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    utterance.onstart = () => {
      this.activeSpeakingIndex = index;
      this.updateSpeakerButtons(index, true);
    };

    utterance.onend = () => {
      this.activeSpeakingIndex = null;
      this.activeUtterance = null;
      this.updateSpeakerButtons(null, false);
    };

    utterance.onerror = (err) => {
      console.warn("Speech synthesis notice:", err);
      this.activeSpeakingIndex = null;
      this.activeUtterance = null;
      this.updateSpeakerButtons(null, false);
    };

    this.activeUtterance = utterance;
    this.activeSpeakingIndex = index;
    this.updateSpeakerButtons(index, true);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  },

  /**
   * Stop active speech synthesis
   */
  stopSpeaking() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    this.activeSpeakingIndex = null;
    this.activeUtterance = null;
    this.updateSpeakerButtons(null, false);
  },

  /**
   * Update visual states of all speaker buttons
   */
  updateSpeakerButtons(activeIdx, isSpeaking) {
    document.querySelectorAll(".ai-btn-speak").forEach(btn => {
      const idx = parseInt(btn.dataset.msgIdx, 10);
      const label = btn.querySelector(".speak-btn-label");
      if (isSpeaking && idx === activeIdx) {
        btn.classList.add("is-speaking");
        btn.title = "Stop speaking";
        btn.setAttribute("aria-label", "Stop speaking");
        if (label) label.textContent = "Stop";
      } else {
        btn.classList.remove("is-speaking");
        btn.title = "Listen to response";
        btn.setAttribute("aria-label", "Listen to response");
        if (label) label.textContent = "Listen";
      }
    });
  },

  /**
   * Safe and robust Markdown formatting supporting code blocks, inline code,
   * bold, italic, headings, bullet lists, and paragraphs.
   */
  formatMarkdown(text) {
    if (!text) return "";

    // 1. Extract and store fenced code blocks with copy button
    const codeBlocks = [];
    let processed = text.replace(/```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g, (match, lang, code) => {
      const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
      const trimmedCode = code.trim();
      const encoded = encodeURIComponent(trimmedCode);
      const displayLang = lang || 'code';
      const escaped = trimmedCode
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      const blockHtml = `
        <div class="ai-code-block-wrapper">
          <div class="ai-code-block-header">
            <span class="code-lang-tag">${displayLang}</span>
            <button type="button" class="ai-copy-code-btn" data-code="${encoded}" title="Copy code to clipboard">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              <span>Copy</span>
            </button>
          </div>
          <pre><code class="language-${displayLang}">${escaped}</code></pre>
        </div>
      `.trim();
      codeBlocks.push(blockHtml);
      return placeholder;
    });

    // 2. Extract and store inline code
    const inlineCodes = [];
    processed = processed.replace(/`([^`\n]+)`/g, (match, code) => {
      const placeholder = `__INLINE_CODE_${inlineCodes.length}__`;
      const escaped = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      inlineCodes.push(`<code>${escaped}</code>`);
      return placeholder;
    });

    // 3. Escape raw HTML brackets
    processed = processed
      .replace(/&(?!(amp|lt|gt|quot|#39);)/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // 4. Headings (### and ##)
    processed = processed.replace(/^### (.*$)/gim, '<h4>$1</h4>');
    processed = processed.replace(/^## (.*$)/gim, '<h3>$1</h3>');

    // 5. Bold & Italic
    processed = processed.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // 6. Markdown Tables
    processed = processed.replace(/(?:^|\n)(\|.+?\|\n\|[-:\s|]+?\|\n(?:\|.+?\|\n?)+)/g, (match, tableText) => {
      const rows = tableText.trim().split('\n').map(r => r.trim()).filter(Boolean);
      if (rows.length < 2) return match;
      const headerCells = rows[0].split('|').slice(1, -1).map(c => `<th>${c.trim()}</th>`).join('');
      const bodyRows = rows.slice(2).map(row => {
        const cells = row.split('|').slice(1, -1).map(c => `<td>${c.trim()}</td>`).join('');
        return `<tr>${cells}</tr>`;
      }).join('');
      return `\n<div class="ai-table-container"><table class="ai-markdown-table"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></div>\n`;
    });

    // 7. Blockquotes
    processed = processed.replace(/^\>\s+(.*)$/gim, '<blockquote>$1</blockquote>');

    // 8. Lists
    processed = processed.replace(/^\s*[-*•]\s+(.*)$/gim, '<li>$1</li>');
    processed = processed.replace(/^\s*\d+\.\s+(.*)$/gim, '<li>$1</li>');
    processed = processed.replace(/(<li>.*?<\/li>(\s*<li>.*?<\/li>)*)/gims, '<ul>$1</ul>');

    // 9. Line breaks
    processed = processed.replace(/\n\n+/g, '</p><p>');
    processed = processed.replace(/\n/g, '<br/>');
    processed = `<p>${processed}</p>`;

    // Clean up unwanted tags around block elements
    processed = processed.replace(/<\/li><br\/>/g, '</li>');
    processed = processed.replace(/<ul><br\/>/g, '<ul>');
    processed = processed.replace(/<br\/><ul>/g, '<ul>');
    processed = processed.replace(/<\/ul><br\/>/g, '</ul>');
    processed = processed.replace(/<p>\s*<\/p>/g, '');
    processed = processed.replace(/<p><br\/>/g, '<p>');
    processed = processed.replace(/<br\/><\/p>/g, '</p>');
    processed = processed.replace(/<p><(h[34]|ul|ol|pre|div|blockquote)/g, '<$1');
    processed = processed.replace(/<\/(h[34]|ul|ol|pre|div|blockquote)><\/p>/g, '</$1>');

    // 10. Restore code placeholders
    codeBlocks.forEach((block, idx) => {
      processed = processed.replace(`__CODE_BLOCK_${idx}__`, block);
    });
    inlineCodes.forEach((code, idx) => {
      processed = processed.replace(`__INLINE_CODE_${idx}__`, code);
    });

    return processed;
  },

  renderMessages() {
    const container = document.getElementById("ai-chat-messages");
    if (!container) return;

    container.innerHTML = this.messages.map((m, idx) => {
      const isAI = m.sender === "ai";
      const formattedText = this.formatMarkdown(m.text);
      const isSpeakingThis = (this.activeSpeakingIndex === idx);

      return `
        <div class="chat-bubble-wrapper ${isAI ? 'from-ai' : 'from-user'} animate-fade-in">
          ${isAI ? `
            <div class="chat-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>
            </div>
          ` : ''}
          <div class="chat-bubble">
            <div class="bubble-content">${formattedText}</div>
            ${isAI ? `
              <div class="bubble-footer">
                <span class="bubble-timestamp">${m.time}</span>
                <button 
                  type="button" 
                  class="ai-btn-speak ${isSpeakingThis ? 'is-speaking' : ''}" 
                  data-msg-idx="${idx}" 
                  title="${isSpeakingThis ? 'Stop speaking' : 'Listen to response'}" 
                  aria-label="${isSpeakingThis ? 'Stop speaking' : 'Listen to response'}"
                >
                  <svg class="icon-speak-play" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                  </svg>
                  <svg class="icon-speak-stop" xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="6" y="6" width="12" height="12" rx="2"></rect>
                  </svg>
                  <div class="speak-soundwaves" aria-hidden="true">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span class="speak-btn-label">${isSpeakingThis ? 'Stop' : 'Listen'}</span>
                </button>
              </div>
            ` : `
              <div class="bubble-timestamp">${m.time}</div>
            `}
          </div>
        </div>
      `;
    }).join("");

    if (this.isTyping) {
      container.innerHTML += `
        <div class="chat-bubble-wrapper from-ai animate-fade-in">
          <div class="chat-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>
          </div>
          <div class="chat-bubble typing-bubble">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      `;
    }

    this.scrollToBottom();
  },

  scrollToBottom() {
    const container = document.getElementById("ai-chat-messages");
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  },

  async sendMessage(text) {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Append user message to UI
    this.messages.push({
      sender: "user",
      time: nowTime,
      text: text
    });

    // 2. Track message in conversation context
    this.conversationHistory.push({
      role: "user",
      content: text
    });
    // Keep last 20 messages for context
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }

    this.isTyping = true;
    this.renderMessages();

    let reply = null;

    // 3. Attempt to call full-stack backend endpoint (/api/chat)
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: this.conversationHistory
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.reply) {
          reply = data.reply;
        }
      }
    } catch (err) {
      console.warn("Backend /api/chat not reachable, utilizing client-side intelligent engine:", err.message);
    }

    // 4. Client-side intelligent fallback (if server is offline or opened via file://)
    if (!reply) {
      reply = await this.clientFallbackEngine(text, this.conversationHistory);
    }

    // 5. Append AI reply and render
    this.isTyping = false;
    this.conversationHistory.push({
      role: "assistant",
      content: reply
    });

    this.messages.push({
      sender: "ai",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: reply
    });

    this.renderMessages();

    // 6. Update smart context-aware suggestions based on conversation
    const smartSuggestions = this.getSmartSuggestions(text, reply);
    this.renderSuggestions(smartSuggestions);
  },

  /**
   * Render dynamic suggestion chips into the quick suggestions bar
   */
  renderSuggestions(suggestions) {
    const promptsBar = document.getElementById("ai-suggested-prompts");
    if (!promptsBar) return;
    const list = (Array.isArray(suggestions) && suggestions.length > 0) ? suggestions : this.suggestedQuestions;
    const scrollEl = promptsBar.querySelector(".prompts-scroll");
    if (scrollEl) {
      scrollEl.innerHTML = list.map(q => `
        <button type="button" class="ai-prompt-chip" data-prompt="${q.replace(/"/g, '&quot;')}">${q}</button>
      `).join("");
    }
  },

  /**
   * Smart context-aware suggestions generator based on conversation context
   */
  getSmartSuggestions(query, reply) {
    if (!query) return this.suggestedQuestions;
    const q = query.toLowerCase();

    // 1. Kannada / Language Translation context
    if (
      q.includes("kannada") || q.includes("ಕನ್ನಡ") || q.includes("translate") ||
      q.includes("meaning in") || q.includes("word meaning") || q.includes("word in kannada")
    ) {
      return [
        "Translate another English word into Kannada.",
        "Explain this word with an example.",
        "Translate a sentence into Kannada."
      ];
    }

    // 2. Travel Destination & Planning context
    if (
      q.includes("trip") || q.includes("travel") || q.includes("destination") ||
      q.includes("goa") || q.includes("india") || q.includes("bali") ||
      q.includes("kerala") || q.includes("manali") || q.includes("kashmir") ||
      q.includes("itinerary") || q.includes("visit") || q.includes("places to visit") ||
      q.includes("budget")
    ) {
      return [
        "Best attractions nearby.",
        "Estimated travel expenses.",
        "Best time to visit.",
        "Suggested itinerary."
      ];
    }

    // 3. AI / Machine Learning context
    if (
      q.includes("artificial intelligence") || q.includes("what is ai") ||
      q.includes("machine learning") || q.includes("deep learning") || q.includes("neural")
    ) {
      return [
        "How do neural networks work?",
        "What is machine learning?",
        "Give real-world AI applications."
      ];
    }

    // 4. Cybersecurity context
    if (
      q.includes("cybersecurity") || q.includes("security") || q.includes("firewall") ||
      q.includes("osi") || q.includes("encryption") || q.includes("tcp") || q.includes("vulnerability")
    ) {
      return [
        "Explain the CIA triad in security.",
        "How does SSL/TLS encryption work?",
        "What are common web vulnerabilities?"
      ];
    }

    // 5. Programming / Computer Science context
    if (
      q.includes("python") || q.includes("javascript") || q.includes("code") ||
      q.includes("binary search") || q.includes("algorithm") || q.includes("data structure")
    ) {
      return [
        "Explain time and space complexity (Big-O).",
        "Write Python code for this.",
        "Show an example with practical use case."
      ];
    }

    // Default fallback: Always restore the 6 premier travel suggestions
    return this.suggestedQuestions;
  },

  /**
   * Reset conversation and restore default travel suggestions
   */
  resetConversation() {
    this.messages = [
      {
        sender: "ai",
        time: "Just now",
        text: "Hello! 👋 I'm **Wayvora AI**, your versatile general-purpose AI assistant and travel concierge.\n\nYou can ask me **anything**—from programming, computer science, and cybersecurity, to math, science, language translations (**English**, **Kannada**, **Hindi**), vocabulary, career guidance, and creative writing—as well as personalized day-by-day travel itineraries worldwide. How can I help you today?"
      }
    ];
    this.conversationHistory = [];
    this.renderMessages();
    this.renderSuggestions(this.suggestedQuestions);
  },

  /**
   * Fetch live weather directly on client via Open-Meteo API
   */
  async fetchClientLiveWeather(place) {
    try {
      const geoUrl = 'https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(place) + '&count=1';
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();
      if (geoData && geoData.results && geoData.results.length > 0) {
        const loc = geoData.results[0];
        const wUrl = 'https://api.open-meteo.com/v1/forecast?latitude=' + loc.latitude + '&longitude=' + loc.longitude + '&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto';
        const wRes = await fetch(wUrl);
        const wData = await wRes.json();
        if (wData && wData.current) {
          const tempC = Math.round(wData.current.temperature_2m);
          const humidity = wData.current.relative_humidity_2m;
          const wind = wData.current.wind_speed_10m;
          const high = wData.daily ? Math.round(wData.daily.temperature_2m_max[0]) : tempC + 2;
          const low = wData.daily ? Math.round(wData.daily.temperature_2m_min[0]) : tempC - 3;

          let condition = 'Clear & Sunny';
          const code = wData.current.weather_code;
          if (code === 0) condition = 'Clear Sky';
          else if (code >= 1 && code <= 3) condition = 'Mainly Clear / Partly Cloudy';
          else if (code >= 45 && code <= 48) condition = 'Foggy & Misty';
          else if (code >= 51 && code <= 67) condition = 'Drizzle & Rain';
          else if (code >= 71 && code <= 77) condition = 'Snowfall';
          else if (code >= 80 && code <= 82) condition = 'Rain Showers';
          else if (code >= 95) condition = 'Thunderstorm';

          return {
            place: loc.name + (loc.country ? ', ' + loc.country : ''),
            tempC,
            tempF: Math.round((tempC * 9) / 5 + 32),
            humidity,
            wind,
            high,
            low,
            condition
          };
        }
      }
    } catch (e) {
      // Ignore network errors and return fallback
    }
    return null;
  },

  /**
   * Client-side intelligent conversational fallback engine
   * Uses WayvoraAIEngine with multilingual support, context memory, and live Open-Meteo telemetry.
   */
  async clientFallbackEngine(query, history) {
    if (window.WayvoraAIEngine) {
      return await window.WayvoraAIEngine.processConversation(history, (target) => this.fetchClientLiveWeather(target));
    }
    return "Hello! I am your **Wayvora AI Assistant & Travel Concierge**. How can I help you plan your next trip or answer your travel questions today?";
  }
};

// Initialize chatbot when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  AIChatbot.init();
});

// Expose globally
window.AIChatbot = AIChatbot;
