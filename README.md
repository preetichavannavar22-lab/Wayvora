# Wayvora - Modern Travel Platform

**Wayvora** is a modern, responsive, and feature-rich travel website and trip-planning platform designed for travelers worldwide.

---

## 🌟 Key Features

### 1. Cinematic Hero Section & Home Page
- **Cinematic Looping Video Background**: Auto-playing, muted, looping travel video with dark luxury gradient overlay and high-res Unsplash poster fallback.
- **Editorial Typography Hierarchy**: Styled with *Outfit*, *Playfair Display*, and *Plus Jakarta Sans* for a modern startup aesthetic.
- **Hero Banner**: Bold headline *"Explore. Discover. Travel."*, interactive live search bar with real-time autocomplete suggestions, and quick inspiration filter chips (Beaches, Mountains, Culture, Luxury, Foodie).
- **Popular & Trending Destinations**: Destination cards with high-resolution imagery, ratings, tags, live weather badges, and one-click favourite toggling.
- **Why Choose Wayvora**: 4 illustrated feature highlights showcasing curated guides, day-by-day itineraries, budget transparency, and offline-ready persistence.
- **Travel Stories & Inspiration**: Curated travel tips and packing guides.
- **Newsletter Subscription**: Instant validation and toast feedback.
- **Comprehensive Global Footer**: Navigation links, social links, and company details.

### 2. Live Real-Time Weather Updates
- **Keyless Open-Meteo Live API Integration**: Fetches live temperature, weather code conditions, humidity, wind speeds, and UV index.
- **10-Minute Caching & Resilient Offline Fallback**: 3.5s timeout abort and instant fallback to curated local destination climate data ensures it never crashes or hangs.
- **°C / °F Unit Toggle**: Instant temperature conversion across all forecasts.
- **5-Day Daily Weather Forecast Modal**: Includes daily highs/lows, condition icons, and real-time packing advice dynamically tailored to the destination's current temperature.
- **Direct Navbar & Card Access**: Quick-access button in navigation bar (`☀️ Live Weather`) and live weather badges on all destination cards (`☀️ 21°C`).

### 3. AI Travel Concierge Assistant
- **Floating Concierge Trigger**: Modern floating button with gentle pulse animation at the bottom-right corner.
- **Intelligent Assistant Window**:
  - Welcome greeting and conversational flow with smooth typing indicators.
  - **Prompt Suggestion Chips**: *"Suggest 3-day itinerary"*, *"Best budget tips"*, *"Packing advice"*, *"Family destinations"*, *"Check weather"*.
  - Smart keyword intent matching across destinations, best seasons, estimated budgets, local etiquette, and itineraries.
  - Interactive recommendation cards with 1-click *"View Details"* triggers.
  - Fully dismissible and keyboard accessible.

### 4. Explore Destinations
- **Live Search**: Instant keyword search matching destination name, country, tags, and attractions.
- **Multi-Filter System**:
  - Continent / Region pills (All, Europe, Asia, Americas, Middle East).
  - Budget tier selection ($$, $$$, $$$$).
  - Theme filters (Beaches, Culture, Mountains, Metropolis, Romantic, Foodie).
  - Sorting by Popularity, Rating, Alphabetical (A-Z), and Budget.
- **Destination Cards**:
  - Curated high-res imagery with smooth zoom on hover
  - Country badge, region tag, and live weather badge
  - Rating & reviews count
  - Heart icon button to toggle favourites with heart-pop animation
  - Best time to visit and estimated daily cost
  - "View Details" button opening modal
  - "Plan Trip" button pre-populating trip planner
- **Included Destinations**: Paris, Dubai, Bali, Tokyo, Switzerland, London, New York, Maldives, Kerala, Goa, Rome, and Santorini.

### 5. Editorial Destination Details Modal
- Full-bleed hero banner with title, tags, and ratings
- In-depth narrative overview
- **Live Climate & Forecast Preview**: Clickable badge opening real-time 5-day weather modal
- **Top Attractions**: Sights with thumbnails, descriptions, recommended durations, and 1-click *"Add to Trip"* buttons
- **Things to Do & Local Experiences**: Categorized activities
- **Best Time to Visit & Climate Guide**: Seasonal notes and temperature indications
- **Estimated Budget Breakdown**: Itemized daily expenses (accommodation, food, transit, activities)
- **Essential Travel Tips**: Local etiquette, transit cards, drinking water, and packing advice
- **"Plan Trip to Destination"** CTA linking into planner

### 6. Interactive Day-by-Day Trip Planner (Itinerary Builder)
- **Trip Setup**: Trip name, destination selector, date range picker with automatic duration calculation, travelers count, and target budget.
- **✨ 1-Click "Auto-Curate with AI" Schedule**: Automatically populates morning, afternoon, and evening activities from the destination's top attractions and dining spots with time slots, categories, and estimated costs.
- **Day-by-Day Organizer**:
  - Dynamic day tabs (Day 1, Day 2, Day 3...)
  - Custom day notes input with automatic saving
  - Add places & activities with time slots (Morning, Afternoon, Evening, Night), category badges, and estimated cost
  - Sidebar quick-recommender: Add top attractions from the selected destination with 1 click
  - Check off completed activities (updates progress bar and crosses off item)
  - Delete activities or add additional days
- **Budget Tracking**: Live tally of estimated itinerary spend against the target budget.
- **Print & Export**: Built-in printer-friendly formatted view for offline travel.
- **Multiple Trips**: Switch seamlessly between different saved trips or create new ones.

### 7. Persistent Favourites System
- Heart button toggling with live navigation badge counter.
- Dedicated Favourites view displaying all saved destinations.
- Persisted locally in `localStorage` so favorites remain intact across browser refreshes.

### 8. Responsive Design & Mobile Drawer
- Fluid layout tested for Desktop (1440px+), Tablets (768px-1024px), and Mobile devices (360px-480px).
- Mobile navigation drawer with hamburger toggle and backdrop blur.

---

## 🚀 How to Run

Wayvora is built with zero runtime dependencies. You can open and use it immediately:

1. Double-click `index.html` in your file explorer, or right-click and choose **Open with > Chrome / Edge / Firefox / Safari**.
2. Or serve it using any static server:
   ```bash
   # Using Python
   python -m http.server 8000

   # Or using Node's npx serve
   npx serve .
   ```
3. Open `http://localhost:8000` in your web browser.

---

## 📁 File Structure

```
Wayvora/
├── index.html                  # Main SPA HTML structure with semantic views
├── css/
│   ├── style.css               # Core variables, typography, navbar, video hero, animations, footer
│   ├── components.css          # Cards, modals, planner UI, weather modal, AI chatbot window, filters, toast notices
│   └── responsive.css          # Tablet and mobile drawer, media queries (360px–1440px)
├── js/
│   ├── data.js                 # Destination catalog, attractions, budget breakdowns, articles
│   ├── state.js                # LocalStorage state management (Favourites, Trips, Active Trip)
│   ├── weather.js              # Live Open-Meteo weather API, cache, °C/°F toggle, forecast modal
│   ├── chatbot.js              # AI Travel Concierge Assistant, suggestion chips, interactive answers
│   ├── ui.js                   # SVG icons, toast notices, cards, and modal renderers
│   ├── planner.js              # Day-by-day itinerary logic, timeline, progress, AI auto-curate, print/export
│   └── app.js                  # Master SPA router, search/filter controller, event listeners
└── README.md                   # Documentation
```
