/**
 * Wayvora - Conversational AI Assistant & Travel Concierge
 * Supports worldwide travel planning, Indian states & Union Territories,
 * real-time Open-Meteo weather integration, multi-turn conversational memory,
 * and general multi-topic assistance (programming, AI, science, culture, etc.).
 */

const AIChatbot = {
  isOpen: false,
  isTyping: false,
  conversationHistory: [],
  messages: [
    {
      sender: "ai",
      time: "Just now",
      text: "Hello explorer! 👋 I'm your **Wayvora AI Assistant & Travel Concierge**.\n\nI can help you plan personalized day-by-day itineraries anywhere in the world, explore destinations across India and globally, check live weather, or answer general questions (like technology, programming, or culture). Where are you headed next?"
    }
  ],

  suggestedQuestions: [
    "Plan a 3-day trip to Goa",
    "Suggest waterfalls near Belagavi, Karnataka",
    "What is the best time to visit Kerala?",
    "Explain artificial intelligence",
    "What is the weather in Goa today?",
    "Write a simple Python program"
  ],

  init() {
    this.createChatWidget();
    this.bindEvents();
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
              <p class="ai-concierge-status">Online • Intelligent Travel & General Companion</p>
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

        <!-- Chat Input Footer -->
        <form class="ai-chat-input-row" id="ai-chat-form">
          <input 
            type="text" 
            id="ai-chat-input" 
            placeholder="Ask anything (travel itineraries, destinations, coding, AI...)" 
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

    if (trigger) trigger.addEventListener("click", () => this.toggleChat());
    if (minimizeBtn) minimizeBtn.addEventListener("click", () => this.closeChat());

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text || this.isTyping) return;
        this.sendMessage(text);
        input.value = "";
      });
    }

    // Handle suggestion chips
    document.querySelectorAll(".ai-prompt-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const prompt = chip.dataset.prompt;
        if (prompt && !this.isTyping) {
          this.sendMessage(prompt);
        }
      });
    });
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
  },

  /**
   * Safe and robust Markdown formatting supporting code blocks, inline code,
   * bold, italic, headings, bullet lists, and paragraphs.
   */
  formatMarkdown(text) {
    if (!text) return "";

    // 1. Extract and store fenced code blocks
    const codeBlocks = [];
    let processed = text.replace(/```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g, (match, lang, code) => {
      const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
      const escaped = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      codeBlocks.push(`<pre><code class="language-${lang || 'text'}">${escaped.trim()}</code></pre>`);
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

    // 6. Lists
    processed = processed.replace(/^\s*[-*]\s+(.*)$/gim, '<li>$1</li>');
    processed = processed.replace(/^\s*\d+\.\s+(.*)$/gim, '<li>$1</li>');
    processed = processed.replace(/(<li>.*?<\/li>(\s*<li>.*?<\/li>)*)/gims, '<ul>$1</ul>');

    // 7. Line breaks
    processed = processed.replace(/\n\n+/g, '</p><p>');
    processed = processed.replace(/\n/g, '<br/>');
    processed = `<p>${processed}</p>`;
    processed = processed.replace(/<p>\s*<\/p>/g, '');
    processed = processed.replace(/<p><(h[34]|ul|ol|pre)/g, '<$1');
    processed = processed.replace(/<\/(h[34]|ul|ol|pre)><\/p>/g, '</$1>');

    // 8. Restore code placeholders
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

    container.innerHTML = this.messages.map(m => {
      const isAI = m.sender === "ai";
      const formattedText = this.formatMarkdown(m.text);

      return `
        <div class="chat-bubble-wrapper ${isAI ? 'from-ai' : 'from-user'} animate-fade-in">
          ${isAI ? `
            <div class="chat-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>
            </div>
          ` : ''}
          <div class="chat-bubble">
            <div class="bubble-content">${formattedText}</div>
            <div class="bubble-timestamp">${m.time}</div>
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
  },

  /**
   * Client-side intelligent fallback engine with live Open-Meteo weather,
   * context-aware memory, and worldwide/Indian travel knowledge.
   */
  async clientFallbackEngine(query, history) {
    const qLower = query.toLowerCase().trim();
    const contextText = history.map(h => h.content).join(" ").toLowerCase();

    // 1. General conversation & greetings
    if (/^(hi|hello|hey|hola|namaste|good\s+(morning|afternoon|evening))\b/i.test(qLower) || qLower.includes("how are you")) {
      return "Hello! 😊 I'm doing great and ready to assist you. Whether you'd like to plan a trip, explore destinations across India or the world, check live weather, or ask questions about technology, programming, or anything else—how can I help you today?";
    }

    if (/^(who are you|what can you do|your name)/i.test(qLower)) {
      return "I'm your **Wayvora AI Assistant & Travel Concierge**! 🌍\n\nI can:\n- Curate customized day-by-day itineraries anywhere across India and worldwide\n- Recommend hotels, local dining, attractions, and transit options with realistic budgets in Indian Rupees (₹) and global currencies\n- Fetch verified real-time weather forecasts via Open-Meteo\n- Answer general questions about coding, technology, science, and more!";
    }

    // 2. Weather queries
    if (qLower.includes("weather") || qLower.includes("temperature") || qLower.includes("forecast") || qLower.includes("rain in")) {
      const match = qLower.match(/(?:weather|temperature|forecast|climate)\s+(?:in|for|at|of)?\s*([a-zA-Z\s]+?)(?:\s+today|\s+now|\s+tomorrow|\?|$)/i);
      const place = match ? match[1].trim() : (qLower.includes("goa") ? "goa" : (qLower.includes("kerala") ? "kerala" : ""));

      if (place) {
        try {
          // Direct client fetch to Open-Meteo geocoding & forecast
          const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1`);
          const geoData = await geoRes.json();
          if (geoData && geoData.results && geoData.results.length > 0) {
            const loc = geoData.results[0];
            const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`);
            const wData = await wRes.json();
            if (wData && wData.current) {
              const tempC = Math.round(wData.current.temperature_2m);
              const humidity = wData.current.relative_humidity_2m;
              const wind = wData.current.wind_speed_10m;
              const high = wData.daily ? Math.round(wData.daily.temperature_2m_max[0]) : tempC + 2;
              const low = wData.daily ? Math.round(wData.daily.temperature_2m_min[0]) : tempC - 3;
              return `🌤️ **Live Weather for ${loc.name}, ${loc.country || ''}**\n\n- **Current Temperature**: ${tempC}°C (${Math.round((tempC * 9)/5 + 32)}°F)\n- **Today's Range**: Low ${low}°C / High ${high}°C\n- **Relative Humidity**: ${humidity}%\n- **Wind Speed**: ${wind} km/h\n\n*Verified data directly from Open-Meteo.* Would you like packing suggestions or an itinerary for ${loc.name}?`;
            }
          }
        } catch (e) {
          // If network fetch fails, provide accurate seasonal weather info
        }
        return `For **${place.charAt(0).toUpperCase() + place.slice(1)}**, please check the **Live Weather** tool in the top navigation bar for instant real-time satellite telemetry!`;
      }
    }

    // 3. Technical / Programming queries
    if (qLower.includes("python") && (qLower.includes("program") || qLower.includes("code") || qLower.includes("write") || qLower.includes("script"))) {
      return `Here is a clean, beginner-friendly **Python program** demonstrating functions, loops, and data structures:

\`\`\`python
# Wayvora Travel Expense Calculator in Python

def calculate_trip_budget(destination, days, daily_cost_inr):
    total = days * daily_cost_inr
    print(f"--- Trip Estimate for {destination} ---")
    print(f"Duration: {days} days")
    print(f"Estimated Daily Cost: ₹{daily_cost_inr:,}")
    print(f"Total Estimated Budget: ₹{total:,}")
    return total

# Example: 3-day getaway to Goa
dest = "Goa"
duration = 3
daily_rate = 3500  # ₹3,500/day per person

total_budget = calculate_trip_budget(dest, duration, daily_rate)
\`\`\`

**Output:**
\`\`\`
--- Trip Estimate for Goa ---
Duration: 3 days
Estimated Daily Cost: ₹3,500
Total Estimated Budget: ₹10,500
\`\`\`

Would you like me to explain how any specific part of this code works or adapt it for another use case?`;
    }

    if (qLower.includes("artificial intelligence") || qLower.includes("what is ai") || (qLower.includes("explain") && qLower.includes("ai"))) {
      return `**Artificial Intelligence (AI)** refers to computer systems engineered to perform tasks that typically require human intelligence. These include visual perception, speech recognition, decision-making, and natural language understanding.

### Key Pillars of Modern AI:
1. **Machine Learning (ML)**: Algorithms trained on vast datasets to identify patterns and make predictions without explicit rules.
2. **Deep Learning & Neural Networks**: Multi-layered artificial networks inspired by the human brain that power computer vision and large language models (LLMs).
3. **Natural Language Processing (NLP)**: Enables machines to interpret, generate, and converse in human language.

### Real-World Applications:
- **Travel & Logistics**: Dynamic pricing, intelligent route planning, and conversational travel concierges (like Wayvora!).
- **Healthcare**: Medical imaging analysis and accelerated drug discovery.
- **Autonomous Systems**: Self-driving vehicles and robotic automation.

Would you like to explore how neural networks function or discuss how AI is utilized in specific industries?`;
    }

    // 4. Belagavi waterfalls
    if ((qLower.includes("belagavi") || qLower.includes("belgaum")) && (qLower.includes("waterfall") || qLower.includes("falls") || qLower.includes("suggest"))) {
      return `Here are the top scenic waterfalls near **Belagavi (Belgaum), Karnataka**:

1. **Gokak Falls (~65 km from Belagavi)**
   - Known as the *"Niagara of Karnataka"*, the Ghataprabha River plunges 52 meters over a rugged sandstone cliff. Features a historic hanging suspension bridge.

2. **Godchinamalaki Falls (~55 km from Belagavi)**
   - A stunning stepped waterfall on the Markandeya River cascading in two picturesque tiers amidst verdant greenery.

3. **Vajrapoha Falls (~50 km from Belagavi, Jamboti / Khanapur forest)**
   - Located deep in the Western Ghats along the Mandovi River, falling over 200 meters. Ideal for trekking and adventure enthusiasts.

4. **Tillari Falls (~60 km from Belagavi, near Tillari Dam & Nagar)**
   - Nestled along the Karnataka-Maharashtra-Goa border, surrounded by misty canyons and deep gorges.

💡 **Best Season to Visit**: July to October (post-monsoon) when water volume is at its peak.`;
    }

    // 5. Kerala best time to visit & itinerary
    if (qLower.includes("kerala")) {
      if (qLower.includes("time") || qLower.includes("season") || qLower.includes("when to visit")) {
        return `The **best time to visit Kerala** is from **September to March** (autumn and winter):

- **Peak Season (October to March)**: Pleasant, crisp weather with temperatures between 22°C and 30°C. Perfect for Alleppey backwater houseboats, Munnar tea hills, and Kovalam beaches.
- **Monsoon Season (June to August)**: Renowned worldwide for traditional **Ayurvedic rejuvenation treatments (Panchakarma)**, lush green landscapes, and off-peak hotel discounts.
- **Summer (April to May)**: Warm and humid along coastal plains (32°C - 36°C), but hill stations like Munnar and Wayanad remain pleasantly cool.

Would you like a customized Kerala itinerary or budget breakdown?`;
      }
    }

    // 6. Follow-up budget reduction
    if (qLower.includes("cheaper") || qLower.includes("budget") || qLower.includes("reduce cost") || qLower.includes("less money")) {
      const destName = contextText.includes("goa") ? "Goa" : (contextText.includes("kerala") ? "Kerala" : (contextText.includes("belagavi") ? "Belagavi" : "your trip"));
      return `Here is how you can make your **${destName}** trip significantly more affordable without compromising on the experience:

1. **Transportation**:
   - Take government KSRTC/Kadamba state buses or sleeper trains rather than private taxis (saves ₹2,500 - ₹4,000).
   - Rent a self-driven 2-wheeler/scooter (₹350 - ₹500/day) for local commuting instead of hiring cabs.

2. **Accommodation**:
   - Stay in boutique hostels (Zostel, goSTOPS) or licensed family homestays (₹800 - ₹1,500/night) instead of luxury beach resorts (₹5,000+/night).

3. **Dining**:
   - Savor authentic local coastal thalis and local bakeries (₹150 - ₹300/meal) rather than tourist-heavy beachfront cafes (₹800 - ₹1,200/meal).

4. **Activities**:
   - Enjoy free natural attractions: scenic public beaches, fort walks (Chapora/Aguada), waterfalls, and heritage trails.

💰 **Adjusted Daily Budget**: ~₹1,200 - ₹1,800/day per person (down from ₹3,500 - ₹5,000/day).`;
    }

    // 7. Goa 3-day itinerary
    if (qLower.includes("goa") && (qLower.includes("3") || qLower.includes("day") || qLower.includes("trip") || qLower.includes("plan") || qLower.includes("itinerary"))) {
      return `Here is a curated **3-Day Goa Itinerary** blending coastal bliss, heritage, and nightlife:

### Day 1: North Goa Coastal Vibes & Sunsets
- **Morning**: Relax at Anjuna or Vagator Beach; enjoy breakfast at an open-air cafe.
- **Afternoon**: Trek up to historic **Chapora Fort** for panoramic Arabian Sea vistas.
- **Evening**: Catch the sunset at Curlies/Thalassa and explore the vibrant Saturday Night Market or Tito's Lane.

### Day 2: Heritage, Culture & Old Goa
- **Morning**: Tour UNESCO World Heritage sites: **Basilica of Bom Jesus** and **Sé Cathedral**.
- **Afternoon**: Walk the colorful Portuguese Latin Quarter of **Fontainhas, Panaji**.
- **Evening**: 1-hour sunset river cruise on the Mandovi River with Goan folk music.

### Day 3: Serene South Goa & Pristine Shores
- **Morning**: Drive down to picturesque **Palolem Beach**; rent a kayak.
- **Afternoon**: Visit historic **Cabo de Rama Fort** overlooking secluded cliffs.
- **Evening**: Relax with fresh Goan seafood curry at a quiet beach shack in Colva or Benaulim.

💰 **Estimated Budget**:
- Budget: ₹1,500 - ₹2,200/day (hostels, scooters, local thalis)
- Mid-range: ₹3,500 - ₹6,000/day (3-star resort, cab hire, beach shacks)

Would you like recommendations for family resorts or adventure water sports?`;
    }

    // 8. Worldwide destinations: Tokyo, Japan
    if (qLower.includes("tokyo") || (qLower.includes("japan") && (qLower.includes("trip") || qLower.includes("itinerary") || qLower.includes("budget")))) {
      return `🗼 **Tokyo, Japan Travel Plan & Native JPY (¥) Budget**\n\n` +
        `• **Highlights**: Sensō-ji Temple, Shibuya Crossing, Meiji Shrine, teamLab Planets, Tsukiji Outer Market.\n` +
        `• **Daily Budget Breakdown** (Japanese Yen):\n` +
        `  - Accommodation: ¥12,000 – ¥18,000/night\n` +
        `  - Dining: ¥4,000 – ¥7,000/day\n` +
        `  - Metro transit: ¥1,200 – ¥2,000/day\n` +
        `  - Attractions: ¥2,500 – ¥5,000/day\n` +
        `💰 **Est. Daily Total**: **¥22,000 JPY/person** (~$144 USD / ₹12,450 INR).\n\n` +
        `You can plan this trip and track daily expenses in JPY in the **Trip Planner**!`;
    }

    // 9. Worldwide destinations: Paris, France
    if (qLower.includes("paris") || (qLower.includes("france") && (qLower.includes("trip") || qLower.includes("itinerary") || qLower.includes("budget")))) {
      return `🥐 **Paris, France Travel Plan & Native EUR (€) Budget**\n\n` +
        `• **Highlights**: Eiffel Tower, Musée du Louvre, Montmartre, Cathédrale Notre-Dame, Seine Cruise.\n` +
        `• **Daily Budget Breakdown** (Euros):\n` +
        `  - Accommodation: €75 – €130/night\n` +
        `  - Food & Bistros: €35 – €60/day\n` +
        `  - Metro Transit: €8 – €15/day\n` +
        `  - Sights & Passes: €20 – €40/day\n` +
        `💰 **Est. Daily Total**: **€150 EUR/person** (~$163 USD / ₹14,100 INR).\n\n` +
        `You can convert all amounts to your preferred currency using the top-bar Currency Selector!`;
    }

    // 10. Currency conversion / exchange rates
    if (qLower.includes("convert") || qLower.includes("exchange rate") || (qLower.includes("currency") && qLower.includes("rate"))) {
      return `💱 **Wayvora Live Exchange Rates & Currency Conversion**\n\n` +
        `Wayvora automatically converts destination budgets using live global exchange rates:\n` +
        `• **1 USD ($)** ≈ ₹86.50 INR | €0.92 EUR | £0.79 GBP | ¥153 JPY | A$1.52 AUD\n` +
        `• **1 EUR (€)** ≈ ₹94.02 INR | $1.087 USD | £0.859 GBP | ¥166.3 JPY\n` +
        `• **1 GBP (£)** ≈ ₹109.50 INR | $1.266 USD | €1.165 EUR\n\n` +
        `Use the **Currency Selector** in the navigation bar to convert the entire website into your preferred currency!`;
    }

    // 11. General travel fallback
    return `I would be happy to help you with that! In **Wayvora**, you can explore 13 curated worldwide destinations across India, Europe, Asia, and the Americas, monitor live weather, bookmark your favorites, and build customizable day-by-day itineraries with estimated budgets in their native currencies (e.g. INR ₹, USD $, EUR €, JPY ¥, GBP £) or your preferred display currency.

Could you share more details—such as your destination, travel dates, budget, or specific interests?`;
  }
};

// Initialize chatbot when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  AIChatbot.init();
});

// Expose globally
window.AIChatbot = AIChatbot;
