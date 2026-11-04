/**
 * Wayvora Intelligent General-Purpose Conversational AI Engine
 * Multilingual, versatile, context-aware AI assistant and travel concierge.
 * Supports English, Kannada (ಕನ್ನಡ), Hindi (हिंदी), Hinglish, and Kanglish.
 * UMD Module: Runs natively in Node.js (server.js) and in Browser (chatbot.js).
 */

(function (root, factory) {
  try {
    const lib = factory();
    if (typeof window !== 'undefined') {
      window.WayvoraAIEngine = lib;
    }
    if (typeof globalThis !== 'undefined') {
      globalThis.WayvoraAIEngine = lib;
    }
    if (root) {
      root.WayvoraAIEngine = lib;
    }
    if (typeof module !== 'undefined' && module.exports) {
      module.exports = lib;
    }
  } catch (e) {
    if (typeof window !== 'undefined') window.aiEngineError = e.message + " | " + e.stack;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this, function () {

  // -------------------------------------------------------------
  // 1. LANGUAGE DETECTION
  // -------------------------------------------------------------
  function detectLanguage(text) {
    if (!text || typeof text !== 'string') return 'en';
    const trimmed = text.trim();

    // 1. Kannada Script (Unicode \u0C80-\u0CFF)
    if (/[\u0C80-\u0CFF]/.test(trimmed)) {
      return 'kn';
    }

    // 2. Devanagari / Hindi Script (Unicode \u0900-\u097F)
    if (/[\u0900-\u097F]/.test(trimmed)) {
      return 'hi';
    }

    const lower = trimmed.toLowerCase();

    // 3. Kanglish (Kannada in Roman English script)
    const kanglishPattern = /\b(nange|namage|nanna|nimage|beku|bekithu|hogbeku|hogona|madi|madu|madona|yavudu|yavaga|ellige|jothe|swalpa|oota|thindi|hege|idu|avu|enu|illi|alli|chennagide|dayavittu|namaskara|kelsa|estu|yestu|iruvudu|nodona|nodbeku|jaaga|jaagagalu|hegiddira|hegiddiri)\b/i;
    if (kanglishPattern.test(lower)) {
      return 'kanglish';
    }

    // 4. Hinglish (Hindi in Roman English script)
    const hinglishPattern = /\b(mujhe|humein|mera|meri|mere|chahiye|karo|karna|karein|batao|bataiye|kahan|kaise|kitna|kitne|rupaye|paise|sasta|sasti|mehenga|ghumne|ghumna|dost|doston|parivar|bachhe|khana|rukna|hotel|jaana|jana|hai|hain|tha|kripya|namaste|bhai|yaar|dekhna|jagah|shukriya|dhanyavaad)\b/i;
    if (hinglishPattern.test(lower)) {
      return 'hinglish';
    }

    return 'en';
  }

  // -------------------------------------------------------------
  // 2. CONTEXT EXTRACTION ACROSS CONVERSATION HISTORY
  // -------------------------------------------------------------
  function extractContext(messages) {
    const context = {
      destination: null,
      days: null,
      budget: null,
      travelers: null,
      theme: null,
      language: 'en',
      lastTopic: null
    };

    if (!Array.isArray(messages) || messages.length === 0) return context;

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (!msg || !msg.content) continue;
      const content = msg.content;
      const lower = content.toLowerCase();

      // Detect language from user messages (latest overrides)
      if (msg.role === 'user') {
        const detected = detectLanguage(content);
        if (detected !== 'en' || !context.language || context.language === 'en') {
          context.language = detected;
        }
      }

      // Detect travel destination (only if explicitly mentioned)
      if (lower.includes('goa') || lower.includes('ಗೋವಾ') || lower.includes('गोवा')) context.destination = 'Goa';
      else if (lower.includes('kerala') || lower.includes('ಕೇರಳ') || lower.includes('केरल')) context.destination = 'Kerala';
      else if (lower.includes('belagavi') || lower.includes('belgaum') || lower.includes('ಬೆಳಗಾವಿ') || lower.includes('बेलगावी')) context.destination = 'Belagavi';
      else if (lower.includes('manali') || lower.includes('ಮನಾಲಿ') || lower.includes('मनाली')) context.destination = 'Manali';
      else if (lower.includes('kashmir') || lower.includes('gulmarg') || lower.includes('pahalgam') || lower.includes('ಕಾಶ್ಮೀರ') || lower.includes('कश्मीर')) context.destination = 'Kashmir';
      else if (lower.includes('shimla') || lower.includes('ಶಿಮ್ಲಾ') || lower.includes('शिमला')) context.destination = 'Shimla';
      else if (lower.includes('gokarna') || lower.includes('ಗೋಕರ್ಣ') || lower.includes('गोकर्ण')) context.destination = 'Gokarna';
      else if (lower.includes('hampi') || lower.includes('ಹಂಪಿ') || lower.includes('हम्पी')) context.destination = 'Hampi';
      else if (lower.includes('rishikesh') || lower.includes('ಋಷಿಕೇಶ') || lower.includes('ऋषिकेश')) context.destination = 'Rishikesh';
      else if (lower.includes('coorg') || lower.includes('kodagu') || lower.includes('ಕೂರ್ಗ್') || lower.includes('कूर्ग')) context.destination = 'Coorg';
      else if (lower.includes('mysore') || lower.includes('mysuru') || lower.includes('ಮೈಸೂರು') || lower.includes('मैसूर')) context.destination = 'Mysore';
      else if (lower.includes('jaipur') || lower.includes('rajasthan') || lower.includes('ಜೈಪುರ') || lower.includes('जयपुर')) context.destination = 'Jaipur';
      else if (lower.includes('udaipur') || lower.includes('ಉದಯಪುರ') || lower.includes('उदयपुर')) context.destination = 'Udaipur';
      else if (lower.includes('pondicherry') || lower.includes('puducherry') || lower.includes('ಪಾಂಡಿಚೇರಿ') || lower.includes('पोंडिचेरी')) context.destination = 'Pondicherry';
      else if (lower.includes('tokyo') || lower.includes('ಟೋಕಿಯೋ') || lower.includes('टोक्यो')) context.destination = 'Tokyo';
      else if (lower.includes('paris') || lower.includes('ಪ್ಯಾರಿಸ್') || lower.includes('पेरिस')) context.destination = 'Paris';
      else if (lower.includes('switzerland') || lower.includes('ಸ್ವಿಟ್ಜರ್ಲೆಂಡ್') || lower.includes('स्विट्जरलैंड')) context.destination = 'Switzerland';
      else if (lower.includes('dubai') || lower.includes('ದುಬೈ') || lower.includes('दुबई')) context.destination = 'Dubai';
      else if (lower.includes('bali') || lower.includes('ಬಾಲಿ') || lower.includes('बाली')) context.destination = 'Bali';
      else if (lower.includes('maldives') || lower.includes('ಮಾಲ್ಡೀವ್ಸ್') || lower.includes('मालदीव')) context.destination = 'Maldives';

      // Detect days
      const daysMatch = lower.match(/([0-9\u0CE6-\u0CEF\u0966-\u096F]+)\s*(?:days?|dina|din|d|ದಿನಗಳ|ದಿನದ|ದಿನ|दिनों|दिन)/i);
      if (daysMatch) {
        let numStr = daysMatch[1]
          .replace(/[\u0CE6\u0966]/g, '0').replace(/[\u0CE7\u0967]/g, '1')
          .replace(/[\u0CE8\u0968]/g, '2').replace(/[\u0CE9\u0969]/g, '3')
          .replace(/[\u0CEA\u096A]/g, '4').replace(/[\u0CEB\u096B]/g, '5')
          .replace(/[\u0CEC\u096C]/g, '6').replace(/[\u0CED\u096D]/g, '7')
          .replace(/[\u0CEE\u096E]/g, '8').replace(/[\u0CEF\u096F]/g, '9');
        context.days = parseInt(numStr, 10);
      } else if (lower.includes('one day') || lower.includes('1 day') || lower.includes('ek din') || lower.includes('ಒಂದು ದಿನ')) context.days = 1;
      else if (lower.includes('two day') || lower.includes('2 day') || lower.includes('do din') || lower.includes('ಎರಡು ದಿನ')) context.days = 2;
      else if (lower.includes('three day') || lower.includes('3 day') || lower.includes('teen din') || lower.includes('mooru dina') || lower.includes('ಮೂರು ದಿನ')) context.days = 3;
      else if (lower.includes('four day') || lower.includes('4 day') || lower.includes('char din') || lower.includes('nalakku dina') || lower.includes('ನಾಲ್ಕು ದಿನ')) context.days = 4;
      else if (lower.includes('five day') || lower.includes('5 day') || lower.includes('paanch din') || lower.includes('aidu dina') || lower.includes('ಐದು ದಿನ')) context.days = 5;
      else if (lower.includes('a week') || lower.includes('one week') || lower.includes('7 days')) context.days = 7;

      // Detect budget amount
      const budgetMatch = lower.match(/(?:₹|rs\.?|inr|rupees|rupaye|rupayi)?\s*(\d{4,6})\b/i);
      if (budgetMatch) {
        context.budget = parseInt(budgetMatch[1], 10);
      } else if (lower.includes('10k') || lower.includes('10,000') || lower.includes('10000')) {
        context.budget = 10000;
      } else if (lower.includes('20k') || lower.includes('20,000') || lower.includes('20000')) {
        context.budget = 20000;
      } else if (lower.includes('5k') || lower.includes('5,000') || lower.includes('5000')) {
        context.budget = 5000;
      } else if (lower.includes('15k') || lower.includes('15,000') || lower.includes('15000')) {
        context.budget = 15000;
      }

      // Detect travelers
      if (lower.includes('family') || lower.includes('parivar') || lower.includes('kutumba') || lower.includes('parents') || lower.includes('kids')) {
        context.travelers = 'family';
      } else if (lower.includes('friend') || lower.includes('friends') || lower.includes('dost') || lower.includes('doston') || lower.includes('snehitaru') || lower.includes('buddies')) {
        context.travelers = 'friends';
      } else if (lower.includes('couple') || lower.includes('honeymoon') || lower.includes('partner') || lower.includes('wife') || lower.includes('husband')) {
        context.travelers = 'couple';
      } else if (lower.includes('solo') || lower.includes('alone') || lower.includes('single') || lower.includes('ontigi')) {
        context.travelers = 'solo';
      }

      // Detect travel theme
      if (lower.includes('snow') || lower.includes('cold') || lower.includes('barf') || lower.includes('chali') || lower.includes('thanda')) {
        context.theme = 'snow';
      } else if (lower.includes('beach') || lower.includes('sea') || lower.includes('coastal') || lower.includes('samudra')) {
        context.theme = 'beach';
      } else if (lower.includes('waterfall') || lower.includes('falls')) {
        context.theme = 'waterfalls';
      } else if (lower.includes('adventure') || lower.includes('rafting') || lower.includes('trek')) {
        context.theme = 'adventure';
      } else if (lower.includes('heritage') || lower.includes('culture') || lower.includes('fort') || lower.includes('temple')) {
        context.theme = 'heritage';
      }
    }

    return context;
  }

  // -------------------------------------------------------------
  // 3. INTENT DETECTION & FUZZY PARSING
  // -------------------------------------------------------------
  function parseIntent(query, context) {
    const qLower = query.toLowerCase().trim();

    // 1. Greetings & Who are you
    if (/^(hi|hello|hey|namaste|namaskara|hola|greetings|good\s+(morning|afternoon|evening))\b/i.test(qLower) || qLower === 'hi' || qLower === 'hello') {
      return { type: 'greeting' };
    }
    if (/^(who are you|what can you do|your name|what are your capabilities|tum kaun ho|neevu yaaru)/i.test(qLower)) {
      return { type: 'who_are_you' };
    }

    // 2. Specific Kannada Translation & Word Meaning Queries
    if (
      qLower.includes('kannada') ||
      qLower.includes('ಕನ್ನಡ') ||
      qLower.includes('kannadadalli')
    ) {
      return { type: 'kannada_query', query };
    }

    // 3. Featured Quick Travel Inquiries
    if (
      qLower.includes('3-day trip in india') ||
      qLower.includes('3 day trip in india') ||
      qLower.includes('three day trip in india') ||
      (qLower.includes('3-day') && qLower.includes('india')) ||
      (qLower.includes('3 day') && qLower.includes('india') && qLower.includes('trip')) ||
      (qLower.includes('plan') && qLower.includes('trip') && qLower.includes('india') && (qLower.includes('3') || qLower.includes('three')))
    ) {
      return { type: 'india_3day_trip' };
    }

    if (
      qLower.includes('places to visit in goa') ||
      qLower.includes('five places to visit in goa') ||
      qLower.includes('5 places to visit in goa') ||
      qLower.includes('suggest five places to visit in goa') ||
      qLower.includes('best places to visit in goa') ||
      qLower.includes('top places to visit in goa') ||
      qLower.includes('top places in goa')
    ) {
      return { type: 'goa_places_to_visit' };
    }

    if (
      qLower.includes('explore the best destinations in india') ||
      qLower.includes('best destinations in india') ||
      qLower.includes('top destinations in india')
    ) {
      return { type: 'best_destinations_india' };
    }

    if (
      qLower.includes('budget-friendly international trips') ||
      qLower.includes('budget international trips') ||
      qLower.includes('cheap international trips')
    ) {
      return { type: 'budget_international_trips' };
    }

    if (
      qLower.includes('estimate my travel budget') ||
      qLower.includes('estimate travel budget') ||
      qLower.includes('calculate travel budget')
    ) {
      return { type: 'estimate_travel_budget' };
    }

    if (
      qLower.includes('best time to visit bali') ||
      qLower.includes('when to visit bali')
    ) {
      return { type: 'bali_best_time' };
    }

    // 4. General Language Translation Queries (Hindi, English, etc.)
    if (
      qLower.includes('translate') ||
      qLower.includes('in hindi') ||
      qLower.includes('in english') ||
      qLower.includes('hindi meaning') ||
      qLower.includes('how to say') ||
      qLower.includes('hindi me')
    ) {
      return { type: 'translation', query };
    }

    // 3. English Vocabulary, Word Meanings & Grammar
    if (
      qLower.includes('meaning of') ||
      qLower.includes('what does') && qLower.includes('mean') ||
      qLower.startsWith('define ') ||
      qLower.includes('definition of') ||
      qLower.includes('synonym of') ||
      qLower.includes('antonym of') ||
      qLower.includes('correct this sentence') ||
      qLower.includes('grammar check') ||
      qLower.includes('is this sentence correct')
    ) {
      return { type: 'vocabulary_grammar', query };
    }

    // 4. Computer Science & Programming Queries
    if (
      qLower.includes('python') ||
      qLower.includes('javascript') ||
      qLower.includes('typescript') ||
      qLower.includes('react') ||
      qLower.includes('java ') || qLower.endsWith(' java') || qLower === 'java' ||
      qLower.includes('c++') || qLower.includes('c programming') ||
      qLower.includes('sql') || qLower.includes('database') ||
      qLower.includes('algorithm') || qLower.includes('data structure') ||
      qLower.includes('binary search') || qLower.includes('sorting') ||
      qLower.includes('linked list') || qLower.includes('stack') || qLower.includes('queue') ||
      qLower.includes('big o') || qLower.includes('time complexity') ||
      qLower.includes('git ') || qLower.includes('github') ||
      qLower.includes('rest api') || qLower.includes('http method') ||
      qLower.includes('oop') || qLower.includes('object oriented') ||
      qLower.includes('recursion') || qLower.includes('closure') ||
      qLower.includes('write code') || qLower.includes('program to') || qLower.includes('how to code')
    ) {
      return { type: 'computer_science', query };
    }

    // 5. Cybersecurity & Networking Queries
    if (
      qLower.includes('osi model') || qLower.includes('osi layers') ||
      qLower.includes('tcp') || qLower.includes('udp') ||
      qLower.includes('handshake') ||
      qLower.includes('dns') ||
      qLower.includes('https') || qLower.includes('ssl') || qLower.includes('tls') ||
      qLower.includes('firewall') ||
      qLower.includes('cybersecurity') || qLower.includes('cyber security') ||
      qLower.includes('sql injection') || qLower.includes('xss') || qLower.includes('csrf') ||
      qLower.includes('ddos') ||
      qLower.includes('encryption') || qLower.includes('cryptography') || qLower.includes('aes') || qLower.includes('rsa') ||
      qLower.includes('vpn') || qLower.includes('zero trust') ||
      qLower.includes('port scan') || qLower.includes('nmap')
    ) {
      return { type: 'cybersecurity_networking', query };
    }

    // 6. Artificial Intelligence & Technology Queries
    if (
      qLower.includes('artificial intelligence') || qLower.includes('what is ai') ||
      qLower.includes('machine learning') || qLower.includes('deep learning') ||
      qLower.includes('neural network') ||
      qLower.includes('transformer') || qLower.includes('large language model') || qLower.includes('llm') ||
      qLower.includes('cloud computing') || qLower.includes('aws') || qLower.includes('azure') ||
      qLower.includes('docker') || qLower.includes('container') || qLower.includes('kubernetes') ||
      qLower.includes('blockchain') || qLower.includes('iot')
    ) {
      return { type: 'ai_technology', query };
    }

    // 7. Mathematics & Science Queries
    if (
      qLower.includes('%') ||
      qLower.includes('calculate') ||
      qLower.includes('solve') ||
      qLower.includes('percentage') ||
      qLower.includes('quadratic equation') ||
      qLower.includes('algebra') ||
      qLower.includes('calculus') || qLower.includes('derivative') || qLower.includes('integral') ||
      qLower.includes('probability') || qLower.includes('statistics') ||
      qLower.includes('newton') || qLower.includes('laws of motion') ||
      qLower.includes('photosynthesis') || qLower.includes('dna') || qLower.includes('periodic table')
    ) {
      return { type: 'math_science', query };
    }

    // 8. Writing, Rewriting & Summarization Queries
    if (
      qLower.includes('write an email') || qLower.includes('leave letter') || qLower.includes('leave application') ||
      qLower.includes('sick leave') || qLower.includes('resignation') ||
      qLower.includes('cover letter') ||
      qLower.includes('summarize') || qLower.includes('summary of') ||
      qLower.includes('rewrite') || qLower.includes('rephrase') ||
      qLower.includes('make it professional') || qLower.includes('draft a message')
    ) {
      return { type: 'writing_summarization', query };
    }

    // 9. Career Guidance & Interview Preparation
    if (
      qLower.includes('interview') ||
      qLower.includes('resume') || qLower.includes('cv tips') ||
      qLower.includes('star method') ||
      qLower.includes('career guidance') || qLower.includes('career advice') ||
      qLower.includes('how to prepare for') ||
      qLower.includes('salary negotiation')
    ) {
      return { type: 'career_interview', query };
    }

    // 10. General Knowledge & Everyday Inquiries
    if (
      qLower.includes('capital of') ||
      qLower.includes('planets') || qLower.includes('solar system') ||
      qLower.includes('pomodoro') ||
      qLower.includes('who invented') ||
      qLower.includes('how does a plane fly') ||
      qLower.includes('why is the sky blue')
    ) {
      return { type: 'general_knowledge', query };
    }

    // 11. Weather Intent (Travel Telemetry)
    if (
      qLower.includes('weather') ||
      qLower.includes('temperature') ||
      qLower.includes('climate') ||
      qLower.includes('forecast') ||
      qLower.includes('raining') ||
      qLower.includes('rain in') ||
      qLower.includes('mausam') ||
      qLower.includes('havamana') ||
      qLower.includes('havaamana')
    ) {
      let target = context.destination || 'Goa';
      if (qLower.includes('goa')) target = 'Goa';
      else if (qLower.includes('kerala')) target = 'Kerala';
      else if (qLower.includes('manali')) target = 'Manali';
      else if (qLower.includes('shimla')) target = 'Shimla';
      else if (qLower.includes('kashmir')) target = 'Kashmir';
      else if (qLower.includes('belagavi') || qLower.includes('belgaum')) target = 'Belagavi';
      else if (qLower.includes('bengaluru') || qLower.includes('bangalore')) target = 'Bengaluru';
      else if (qLower.includes('mumbai')) target = 'Mumbai';
      else if (qLower.includes('delhi')) target = 'Delhi';
      else if (qLower.includes('paris')) target = 'Paris';
      else if (qLower.includes('tokyo')) target = 'Tokyo';
      else if (qLower.includes('dubai')) target = 'Dubai';
      else if (qLower.includes('switzerland')) target = 'Switzerland';
      else {
        const m = qLower.match(/(?:in|for|at|of)\s+([a-zA-Z\s]+?)(?:\s+today|\s+now|\s+tomorrow|\?|$)/i);
        if (m && m[1]) target = m[1].trim();
      }
      return { type: 'weather', target };
    }

    // 12. Currency conversion
    if (qLower.includes('convert') && (qLower.includes('currency') || qLower.includes('usd') || qLower.includes('inr') || qLower.includes('eur')) || qLower.includes('exchange rate')) {
      return { type: 'currency_conversion' };
    }

    // 13. Travel Cost Reduction / Make Cheaper Follow-up
    if (
      qLower.includes('cheaper') ||
      qLower.includes('reduce cost') ||
      qLower.includes('lower the budget') ||
      qLower.includes('low budget trip') ||
      qLower.includes('sasta trip') ||
      qLower.includes('sasta karo') ||
      (qLower.includes('cheap') && (qLower.includes('trip') || qLower.includes('make') || qLower.includes('that') || qLower.includes('it')))
    ) {
      return { type: 'make_cheaper', destination: context.destination || 'Goa' };
    }

    // 14. Travel Theme: Snow / Cold places
    if (
      (qLower.includes('snow') || qLower.includes('barf') || qLower.includes('chali')) && (qLower.includes('place') || qLower.includes('trip') || qLower.includes('where') || qLower.includes('cold') || qLower.includes('want'))
    ) {
      return { type: 'snow_cold_places' };
    }

    // 15. Family cheap trip intent
    if (
      (qLower.includes('family') || qLower.includes('parivar') || qLower.includes('kutumba')) &&
      (qLower.includes('cheap') || qLower.includes('budget') || qLower.includes('trip') || qLower.includes('plan'))
    ) {
      return { type: 'family_cheap_trip' };
    }

    // 16. Friends trip intent
    if (
      (qLower.includes('friends') || qLower.includes('friend') || qLower.includes('dost') || qLower.includes('doston') || qLower.includes('snehitaru') || qLower.includes('buddies')) &&
      (qLower.includes('plan') || qLower.includes('suggest') || qLower.includes('trip') || qLower.includes('something'))
    ) {
      return { type: 'friends_trip' };
    }

    // 17. Specific budget constraint for trip (e.g., 10000 rupees where can I go?)
    if (
      (qLower.includes('10000') || qLower.includes('10k') || context.budget) &&
      (qLower.includes('where can i go') || qLower.includes('trip') || qLower.includes('visit') || qLower.includes('ghum'))
    ) {
      return { type: 'budget_destinations', budget: context.budget || 10000 };
    }

    // 18. Waterfalls near Belagavi / Karnataka
    if (
      (qLower.includes('waterfall') || qLower.includes('falls')) &&
      (qLower.includes('belagavi') || qLower.includes('belgaum') || qLower.includes('karnataka') || qLower.includes('near'))
    ) {
      return { type: 'waterfalls_belagavi' };
    }

    // 19. Duration-only follow-up in travel context
    const durationOnlyMatch = qLower.match(/^(\d+)\s*(?:days|day|dina|din|d)?$/i);
    if (durationOnlyMatch && context.destination) {
      return { type: 'duration_followup', days: context.days || 4, destination: context.destination };
    }

    // 20. Food / Cuisine follow-up
    if (
      (qLower.includes('food') || qLower.includes('cuisine') || qLower.includes('khana') || qLower.includes('oota') || qLower.includes('restaurant')) &&
      (context.destination || qLower.includes('goa') || qLower.includes('kerala'))
    ) {
      return { type: 'food_followup', destination: context.destination || 'Goa' };
    }

    // 21. Transport / How to reach follow-up
    if (
      (qLower.includes('how to reach') || qLower.includes('kaise pahuche') || qLower.includes('hege hogodu') || qLower.includes('reach there')) &&
      (context.destination || qLower.includes('goa') || qLower.includes('kerala'))
    ) {
      return { type: 'transport_followup', destination: context.destination || 'Goa' };
    }

    // 22. Concrete Destination + Itinerary Request
    if (
      context.destination &&
      !qLower.includes('meaning') && !qLower.includes('translate') &&
      (context.days || qLower.includes('itinerary') || qLower.includes('trip to') || qLower.includes('travel to') || (qLower.includes('plan') && (qLower.includes('trip') || qLower.includes('tour') || qLower.includes('travel') || qLower.includes('day'))))
    ) {
      return { type: 'destination_itinerary', destination: context.destination, days: context.days || 3 };
    }

    // 23. Vague Trip Planning Request
    if (
      qLower.includes('plan a trip for me') ||
      qLower.includes('plan trip for me') ||
      qLower.includes('trip plan karo') ||
      qLower.includes('ondu trip plan madi') ||
      (qLower.startsWith('plan a trip') && qLower.length < 25)
    ) {
      return { type: 'vague_trip_plan', days: context.days };
    }

    // 24. Default General Exploration / Dynamic QA
    return { type: 'dynamic_general', query };
  }

  // -------------------------------------------------------------
  // 4. GENERAL-PURPOSE & DOMAIN RESPONSE GENERATORS
  // -------------------------------------------------------------

  function getComputerScienceResponse(query, lang) {
    const q = query.toLowerCase();

    // Binary Search
    if (q.includes('binary search')) {
      return `💻 **Binary Search Algorithm Explained**\n\n` +
        `**Binary Search** is an efficient divide-and-conquer search algorithm that finds the position of a target value within a **sorted array**. It compares the target to the middle element and halves the search space each step.\n\n` +
        `### Time & Space Complexity:\n` +
        `• **Best Case:** $O(1)$ (element found at middle immediately)\n` +
        `• **Average & Worst Case:** $O(\\log n)$\n` +
        `• **Space Complexity:** $O(1)$ (Iterative) or $O(\\log n)$ (Recursive call stack)\n\n` +
        `### Python Implementation:\n` +
        `\`\`\`python\n` +
        `def binary_search(arr, target):\n` +
        `    left, right = 0, len(arr) - 1\n` +
        `    \n` +
        `    while left <= right:\n` +
        `        mid = (left + right) // 2\n` +
        `        if arr[mid] == target:\n` +
        `            return mid  # Target index found\n` +
        `        elif arr[mid] < target:\n` +
        `            left = mid + 1\n` +
        `        else:\n` +
        `            right = mid - 1\n` +
        `            \n` +
        `    return -1  # Target not found\n\n` +
        `# Example Usage:\n` +
        `nums = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]\n` +
        `print("Index of 23:", binary_search(nums, 23))  # Output: 5\n` +
        `\`\`\`\n\n` +
        `💡 *Key Requirement:* The array **must be sorted** before applying Binary Search!`;
    }

    // OOP Principles
    if (q.includes('oop') || q.includes('object oriented') || q.includes('polymorphism') || q.includes('inheritance')) {
      return `🧱 **The 4 Core Pillars of Object-Oriented Programming (OOP)**\n\n` +
        `1. **Encapsulation:**\n` +
        `   • Bundling data (attributes) and methods that operate on that data into a single unit (class), while restricting direct access to internal components (using private/protected access modifiers).\n\n` +
        `2. **Abstraction:**\n` +
        `   • Hiding complex implementation details and exposing only the essential features to the user (e.g., using abstract classes or interfaces).\n\n` +
        `3. **Inheritance:**\n` +
        `   • Mechanism where a new class (subclass/child) derives properties and behaviors from an existing class (superclass/parent), promoting code reusability.\n\n` +
        `4. **Polymorphism:**\n` +
        `   • The ability of an object or method to take many forms. Typically achieved via **Method Overloading** (compile-time) and **Method Overriding** (runtime).\n\n` +
        `### Clean Python Example:\n` +
        `\`\`\`python\n` +
        `class Animal:\n` +
        `    def __init__(self, name):\n` +
        `        self._name = name  # Encapsulation\n` +
        `        \n` +
        `    def speak(self):\n` +
        `        raise NotImplementedError("Subclass must implement abstract method")\n\n` +
        `class Dog(Animal):  # Inheritance\n` +
        `    def speak(self):  # Polymorphism\n` +
        `        return f"{self._name} says Woof!"\n\n` +
        `class Cat(Animal):  # Inheritance\n` +
        `    def speak(self):  # Polymorphism\n` +
        `        return f"{self._name} says Meow!"\n\n` +
        `pets = [Dog("Buddy"), Cat("Whiskers")]\n` +
        `for pet in pets:\n` +
        `    print(pet.speak())\n` +
        `\`\`\``;
    }

    // JavaScript / React
    if (q.includes('javascript') || q.includes('react') || q.includes('promise') || q.includes('async')) {
      return `⚡ **Modern JavaScript: Promises & Async/Await**\n\n` +
        `**Async/Await** is syntactic sugar built on top of JavaScript Promises, making asynchronous code read like synchronous, procedural code.\n\n` +
        `### Example: Fetching Remote API Data:\n` +
        `\`\`\`javascript\n` +
        `// Clean, robust async function with error handling\n` +
        `async function fetchUserData(userId) {\n` +
        `  try {\n` +
        `    const response = await fetch(\`https://api.example.com/users/\${userId}\`);\n` +
        `    if (!response.ok) {\n` +
        `      throw new Error(\`HTTP error! status: \${response.status}\`);\n` +
        `    }\n` +
        `    const userData = await response.json();\n` +
        `    console.log("User Loaded:", userData);\n` +
        `    return userData;\n` +
        `  } catch (error) {\n` +
        `    console.error("Failed to load user:", error.message);\n` +
        `    return null;\n` +
        `  }\n` +
        `}\n` +
        `\`\`\`\n\n` +
        `### Key JavaScript Concepts:\n` +
        `• **Event Loop:** Manages call stack, Web APIs, microtask queue (Promises), and macrotask queue (\`setTimeout\`).\n` +
        `• **Closures:** A function remembers its lexical scope even when executed outside that scope.\n` +
        `• **Arrow Functions:** Do not bind their own \`this\`, \`arguments\`, or \`super\`.`;
    }

    // SQL & Databases
    if (q.includes('sql') || q.includes('database') || q.includes('join') || q.includes('acid')) {
      return `🗄️ **SQL Essentials: Joins & ACID Transactions**\n\n` +
        `### 1. SQL Join Types Overview:\n` +
        `• **INNER JOIN:** Returns records that have matching values in both tables.\n` +
        `• **LEFT (OUTER) JOIN:** Returns all records from the left table, and matched records from the right table.\n` +
        `• **RIGHT (OUTER) JOIN:** Returns all records from the right table, and matched records from the left table.\n` +
        `• **FULL OUTER JOIN:** Returns all records when there is a match in either table.\n\n` +
        `### Example Query:\n` +
        `\`\`\`sql\n` +
        `SELECT \n` +
        `    users.name,\n` +
        `    users.email,\n` +
        `    orders.order_id,\n` +
        `    orders.total_amount\n` +
        `FROM users\n` +
        `INNER JOIN orders ON users.id = orders.user_id\n` +
        `WHERE orders.status = 'completed'\n` +
        `ORDER BY orders.created_at DESC;\n` +
        `\`\`\`\n\n` +
        `### 2. ACID Properties in Relational Databases:\n` +
        `• **Atomicity:** All operations in a transaction succeed, or none do (All-or-Nothing).\n` +
        `• **Consistency:** Database transitions only between valid states conforming to all constraints.\n` +
        `• **Isolation:** Concurrent transactions execute without interfering with one another.\n` +
        `• **Durability:** Committed transactions survive system crashes and power failures.`;
    }

    // Git
    if (q.includes('git')) {
      return `🐙 **Essential Git Commands & Best Practices**\n\n` +
        `| Command | Purpose |\n` +
        `| :--- | :--- |\n` +
        `| \`git status\` | Inspect modified, staged, and untracked files |\n` +
        `| \`git add .\` | Stage all modified changes for commit |\n` +
        `| \`git commit -m "feat: message"\` | Commit staged changes with descriptive message |\n` +
        `| \`git branch <name>\` | Create a new feature branch |\n` +
        `| \`git checkout -b <name>\` | Create and immediately switch to new branch |\n` +
        `| \`git pull origin main\` | Fetch and merge remote changes into current branch |\n` +
        `| \`git push origin <name>\` | Push local commits to remote repository |\n` +
        `| \`git stash\` / \`git stash pop\` | Temporarily shelve uncommitted work |\n\n` +
        `💡 *Pro-Tip:* Use \`git diff\` before staging to review your exact line-by-line modifications!`;
    }

    // Default Computer Science Response
    return getPythonProgramResponse();
  }

  function getCybersecurityNetworkingResponse(query, lang) {
    const q = query.toLowerCase();

    // Check for "What is cybersecurity?" or general cybersecurity explanation
    if (
      q.includes('what is cybersecurity') ||
      q.includes('what is cyber security') ||
      q.includes('explain cybersecurity') ||
      q.includes('what is cyber-security') ||
      q.includes('cybersecurity overview') ||
      q.trim() === 'what is cybersecurity?' ||
      (q.includes('cybersecurity') && !q.includes('osi') && !q.includes('tcp') && !q.includes('sql') && !q.includes('encryption'))
    ) {
      return getWhatIsCybersecurityResponse();
    }

    // OSI Model
    if (q.includes('osi')) {
      return `🌐 **The 7 Layers of the OSI Model (Open Systems Interconnection)**\n\n` +
        `The OSI model is a conceptual framework that standardizes telecommunication and computing functions:\n\n` +
        `| # | Layer | Data Unit | Protocols & Devices | Function |\n` +
        `| :- | :--- | :--- | :--- | :--- |\n` +
        `| **7** | **Application** | Data | HTTP, HTTPS, FTP, DNS, SMTP | End-user interface & network services |\n` +
        `| **6** | **Presentation** | Data | SSL/TLS, JPEG, ASCII, JSON | Data encryption, compression, formatting |\n` +
        `| **5** | **Session** | Data | NetBIOS, RPC, Sockets | Manages sessions between applications |\n` +
        `| **4** | **Transport** | Segment / Datagram | TCP, UDP | End-to-end transport, port addressing, flow control |\n` +
        `| **3** | **Network** | Packet | IP (IPv4/v6), ICMP, Routers | Logical addressing & routing across networks |\n` +
        `| **2** | **Data Link** | Frame | Ethernet, MAC, Wi-Fi, Switches | Physical addressing (MAC), error detection |\n` +
        `| **1** | **Physical** | Bit | Cables, Fiber, Hubs, Radio waves | Physical transmission of raw binary bits |\n\n` +
        `🧠 *Easy Mnemonic (Top to Bottom):* **"All People Seem To Need Data Processing"**`;
    }

    // TCP vs UDP & 3-way Handshake
    if (q.includes('tcp') || q.includes('udp') || q.includes('handshake')) {
      return `🤝 **TCP vs UDP & The TCP 3-Way Handshake**\n\n` +
        `### TCP vs UDP Comparison:\n` +
        `• **TCP (Transmission Control Protocol):** Connection-oriented, reliable, guarantees packet ordering via acknowledgments (used for HTTP/HTTPS, SSH, File Transfer).\n` +
        `• **UDP (User Datagram Protocol):** Connectionless, lightweight, low-latency, no acknowledgment (used for DNS, live video streaming, multiplayer gaming, VoIP).\n\n` +
        `### The TCP 3-Way Handshake Sequence:\n` +
        `Before sending actual application data, TCP establishes a verified connection:\n\n` +
        `1. **SYN (Synchronize):** Client sends a SYN packet with an initial sequence number ($ISN_c$) to the server.\n` +
        `   *Client $\\rightarrow$ Server: "Can we talk? My seq number is X."*\n` +
        `2. **SYN-ACK (Synchronize-Acknowledge):** Server receives SYN, allocates buffers, and sends back SYN-ACK with acknowledgment ($X+1$) and its own sequence number ($Y$).\n` +
        `   *Server $\\rightarrow$ Client: "Yes! Acknowledging X. My seq number is Y."*\n` +
        `3. **ACK (Acknowledge):** Client receives SYN-ACK and replies with an ACK packet ($Y+1$).\n` +
        `   *Client $\\rightarrow$ Server: "Got it! Connection established."*\n\n` +
        `Once complete, secure and sequenced bidirectional communication begins!`;
    }

    // Common Vulnerabilities
    if (q.includes('sql injection') || q.includes('xss') || q.includes('csrf') || q.includes('ddos') || q.includes('vulnerability')) {
      return `🛡️ **Top Web Security Vulnerabilities & Mitigations**\n\n` +
        `1. **SQL Injection (SQLi):**\n` +
        `   • *Risk:* Attackers inject malicious SQL via input fields to bypass auth or steal database contents.\n` +
        `   • *Mitigation:* Always use **Parameterized Queries (Prepared Statements)** and ORMs. Never concatenate raw user input into SQL.\n\n` +
        `2. **Cross-Site Scripting (XSS):**\n` +
        `   • *Risk:* Attackers inject malicious JavaScript that executes in other users' browsers, hijacking session cookies.\n` +
        `   • *Mitigation:* Context-aware output encoding/escaping, robust Content Security Policy (CSP), and \`HttpOnly\` cookie flags.\n\n` +
        `3. **Cross-Site Request Forgery (CSRF):**\n` +
        `   • *Risk:* Forces authenticated users to submit unauthorized commands to a trusted web app.\n` +
        `   • *Mitigation:* Anti-CSRF verification tokens and \`SameSite=Lax\` or \`Strict\` cookie attributes.\n\n` +
        `4. **DDoS (Distributed Denial of Service):**\n` +
        `   • *Risk:* Overwhelming a target server with massive volumetric traffic from botnets.\n` +
        `   • *Mitigation:* Anycast networks (Cloudflare/AWS CloudFront), rate limiting, and web application firewalls (WAF).`;
    }

    // Encryption & Cryptography
    return `🔐 **Cryptography Essentials: Symmetric vs Asymmetric Encryption**\n\n` +
      `### 1. Symmetric Encryption (Secret Key):\n` +
      `• Uses the **same single key** for both encryption and decryption.\n` +
      `• Extremely fast and ideal for encrypting bulk data.\n` +
      `• **Standards:** AES-256, ChaCha20.\n\n` +
      `### 2. Asymmetric Encryption (Public-Private Key Pair):\n` +
      `• Uses a **Public Key** for encryption and a distinct **Private Key** for decryption.\n` +
      `• Solves the key-distribution problem; foundation of SSL/TLS and SSH.\n` +
      `• **Standards:** RSA, ECC (Elliptic Curve Cryptography).\n\n` +
      `### 3. Hashing vs Encryption:\n` +
      `• **Hashing is one-way:** You cannot reverse a hash back to the original text (e.g. SHA-256, bcrypt for passwords).\n` +
      `• **Encryption is two-way:** With the proper key, the ciphertext can be decrypted back to plaintext.`;
  }

  function getAiTechnologyResponse(query, lang) {
    const q = query.toLowerCase();

    if (q.includes('cloud') || q.includes('aws') || q.includes('docker') || q.includes('kubernetes')) {
      return `☁️ **Cloud Computing & Containerization (Docker & Kubernetes)**\n\n` +
        `### Cloud Service Models:\n` +
        `• **IaaS (Infrastructure as a Service):** Rent raw VMs, storage, and networking (e.g., AWS EC2, Google Compute Engine).\n` +
        `• **PaaS (Platform as a Service):** Deploy apps without managing the OS or infrastructure (e.g., Vercel, Heroku, AWS Elastic Beanstalk).\n` +
        `• **SaaS (Software as a Service):** Ready-to-use software consumed over the web (e.g., Google Workspace, Salesforce).\n\n` +
        `### Docker vs Virtual Machines (VMs):\n` +
        `• **VMs:** Emulate full hardware; each VM runs an entire guest Operating System, making them heavier (gigabytes, minutes to boot).\n` +
        `• **Docker Containers:** Share the host OS kernel and package only the application and its dependencies, making them lightweight (megabytes, milliseconds to boot).\n\n` +
        `### Kubernetes (K8s):\n` +
        `• An open-source container orchestration engine that automates deploying, scaling, auto-healing, and load-balancing containerized applications across server clusters.`;
    }

    if (q.includes('transformer') || q.includes('llm') || q.includes('neural')) {
      return `🧠 **How Transformers & Large Language Models (LLMs) Work**\n\n` +
        `Modern generative AI systems (like ChatGPT, Claude, and Gemini) are built on the **Transformer architecture** introduced by Google in 2017 ("Attention Is All You Need").\n\n` +
        `### Core Architecture Concepts:\n` +
        `1. **Tokenization:** Text is chopped into tokens (words or sub-words, e.g., "learning" $\\rightarrow$ "learn" + "ing").\n` +
        `2. **Vector Embeddings:** Each token is mapped to a high-dimensional mathematical vector representing semantic meaning.\n` +
        `3. **Self-Attention Mechanism:** Allows the model to weigh the relevance of every word in a sentence relative to every other word, capturing context regardless of distance.\n` +
        `4. **Multi-Stage Training:**\n` +
        `   • **Pre-training:** Predicting the next token on hundreds of billions of web texts (unsupervised learning).\n` +
        `   • **Fine-tuning (SFT):** Training on curated human question-and-answer pairs.\n` +
        `   • **RLHF (Reinforcement Learning from Human Feedback):** Aligning models to be helpful, honest, and harmless.`;
    }

    return getExplainAiResponse();
  }

  function getVocabularyGrammarResponse(query, lang) {
    const q = query.toLowerCase();

    // Vocabulary Dictionary
    const vocabDb = {
      'ubiquitous': {
        pos: 'adjective',
        phonetic: '/juːˈbɪk.wɪ.təs/',
        meaning: 'Present, appearing, or found everywhere at the same time.',
        sentence: 'Smartphones and mobile internet access have become ubiquitous across modern society.',
        synonyms: ['omnipresent', 'pervasive', 'universal', 'prevalent'],
        antonyms: ['rare', 'scarce', 'isolated']
      },
      'serendipity': {
        pos: 'noun',
        phonetic: '/ˌser.ənˈdɪp.ə.ti/',
        meaning: 'The occurrence and development of events by chance in a happy or beneficial way.',
        sentence: 'Finding my dream mentor at a casual coffee meetup was pure serendipity.',
        synonyms: ['fluke', 'happy coincidence', 'providence', 'good fortune'],
        antonyms: ['misfortune', 'bad luck']
      },
      'ephemeral': {
        pos: 'adjective',
        phonetic: '/ɪˈfem.ər.əl/',
        meaning: 'Lasting for a very short time; transitory.',
        sentence: 'The vibrant autumn foliage in the mountains is beautiful but ephemeral.',
        synonyms: ['fleeting', 'transient', 'momentary', 'evanescent'],
        antonyms: ['permanent', 'enduring', 'eternal', 'perpetual']
      },
      'resilient': {
        pos: 'adjective',
        phonetic: '/rɪˈzɪl.jənt/',
        meaning: 'Able to withstand or recover quickly from difficult conditions or adversity.',
        sentence: 'The team proved remarkably resilient, bouncing back to ship the release on schedule.',
        synonyms: ['tough', 'adaptable', 'buoyant', 'unyielding'],
        antonyms: ['fragile', 'vulnerable', 'weak']
      },
      'pragmatic': {
        pos: 'adjective',
        phonetic: '/præɡˈmæt.ɪk/',
        meaning: 'Dealing with things sensibly and realistically based on practical rather than theoretical considerations.',
        sentence: 'She took a pragmatic approach to system design, choosing stability over bleeding-edge hype.',
        synonyms: ['practical', 'sensible', 'realistic', 'utilitarian'],
        antonyms: ['idealistic', 'impractical', 'dogmatic']
      },
      'meticulous': {
        pos: 'adjective',
        phonetic: '/məˈtɪk.jə.ləs/',
        meaning: 'Showing great attention to detail; very careful and precise.',
        sentence: 'The engineer performed meticulous code reviews to ensure zero security vulnerabilities.',
        synonyms: ['thorough', 'diligent', 'scrupulous', 'exact'],
        antonyms: ['careless', 'sloppy', 'negligent']
      },
      'eloquent': {
        pos: 'adjective',
        phonetic: '/ˈel.ə.kwənt/',
        meaning: 'Fluent or persuasive in speaking or writing; clearly expressing an idea or emotion.',
        sentence: 'The keynote speaker delivered an eloquent address on the ethical future of AI.',
        synonyms: ['articulate', 'persuasive', 'fluent', 'expressive'],
        antonyms: ['inarticulate', 'hesitant', 'unconvincing']
      },
      'paradigm': {
        pos: 'noun',
        phonetic: '/ˈpær.ə.daɪm/',
        meaning: 'A typical example, model, or conceptual framework for understanding something.',
        sentence: 'Cloud computing established a new paradigm in distributed software infrastructure.',
        synonyms: ['framework', 'model', 'archetype', 'prototype'],
        antonyms: ['anomaly', 'deviation']
      }
    };

    // Check if query matches any dictionary entry
    for (const [word, data] of Object.entries(vocabDb)) {
      if (q.includes(word)) {
        return `📖 **Word Meaning: ${word.toUpperCase()}**\n\n` +
          `• **Part of Speech:** *${data.pos}* | **Pronunciation:** \`${data.phonetic}\`\n\n` +
          `### Definition:\n` +
          `${data.meaning}\n\n` +
          `### Example Usage in a Sentence:\n` +
          `*"${data.sentence}"*\n\n` +
          `• **Synonyms:** ${data.synonyms.join(', ')}\n` +
          `• **Antonyms:** ${data.antonyms.join(', ')}`;
      }
    }

    // Grammar check assistance
    if (q.includes('sentence') || q.includes('grammar')) {
      return `✍️ **English Grammar & Sentence Polishing Guide**\n\n` +
        `### Golden Rules for Clean Writing:\n` +
        `1. **Active vs. Passive Voice:**\n` +
        `   • *Passive:* "The database update was performed by the script."\n` +
        `   • *Active (Better):* "The script updated the database."\n\n` +
        `2. **Common Confusions:**\n` +
        `   • **Its vs It's:** *Its* is possessive ("The dog wagged its tail"). *It's* is a contraction of "it is" ("It's raining outside").\n` +
        `   • **Their / There / They're:** *Their* (ownership), *There* (location), *They're* (they are).\n` +
        `   • **Affect vs Effect:** *Affect* is typically a verb ("How will this affect performance?"). *Effect* is typically a noun ("The change had a positive effect").\n\n` +
        `💡 Share your sentence with me, and I will check its grammar, tone, and clarity!`;
    }

    // Fallback extraction
    const match = q.match(/(?:meaning of|what is the meaning of|define|definition of)\s+([a-zA-Z]+)/i);
    const target = (match && match[1]) ? match[1].trim() : 'the word';

    return `📖 **Vocabulary Analysis for "${target}"**\n\n` +
      `To understand and master **${target}**, look at its root, context, and usage:\n` +
      `• Identify its part of speech (noun, verb, adjective, or adverb).\n` +
      `• Notice how it functions in formal writing versus everyday conversation.\n` +
      `• Pair it with strong antonyms and synonyms to lock it into memory.\n\n` +
      `Would you like me to construct sample sentences or provide synonyms for **${target}**?`;
  }

  // -------------------------------------------------------------
  // KANNADA DICTIONARY & WORD MEANINGS
  // -------------------------------------------------------------
  const KANNADA_DICTIONARY = {
    'plan': {
      word: 'Plan',
      kannada: 'ಯೋಜನೆ',
      pronunciation: 'Yōjane',
      meaning: 'An arrangement or method for achieving something.',
      example: 'I have a plan.',
      exampleKannada: 'ನನ್ನ ಬಳಿ ಒಂದು ಯೋಜನೆ ಇದೆ.'
    },
    'explore': {
      word: 'Explore',
      kannada: 'ಅನ್ವೇಷಿಸು / ಅನ್ವೇಷಣೆ',
      pronunciation: 'Anvēṣisu / Anvēṣaṇe',
      meaning: 'To travel through or examine an unfamiliar area in order to learn about it.',
      example: 'We love to explore new places.',
      exampleKannada: 'ನಾವು ಹೊಸ ಸ್ಥಳಗಳನ್ನು ಅನ್ವೇಷಿಸಲು ಇಷ್ಟಪಡುತ್ತೇವೆ.'
    },
    'beautiful': {
      word: 'Beautiful',
      kannada: 'ಸುಂದರ / ಸುಂದರವಾದ',
      pronunciation: 'Sundara / Sundaravāda',
      meaning: 'Pleasing the senses or mind aesthetically.',
      example: 'This is a beautiful view.',
      exampleKannada: 'ಇದು ಸುಂದರವಾದ ನೋಟ.'
    },
    'travel': {
      word: 'Travel',
      kannada: 'ಪ್ರಯಾಣ',
      pronunciation: 'Prayāṇa',
      meaning: 'The act of going from one place to another, typically over a distance.',
      example: 'I love to travel during holidays.',
      exampleKannada: 'ನಾನು ರಜಾದಿನಗಳಲ್ಲಿ ಪ್ರಯಾಣಿಸಲು ಇಷ್ಟಪಡುತ್ತೇನೆ.'
    },
    'destination': {
      word: 'Destination',
      kannada: 'ತಲುಪಬೇಕಾದ ಸ್ಥಳ / ಗಮ್ಯಸ್ಥಾನ',
      pronunciation: 'Gamyasthāna',
      meaning: 'The place to which someone or something is going or being sent.',
      example: 'We reached our destination safely.',
      exampleKannada: 'ನಾವು ನಮ್ಮ ಗಮ್ಯಸ್ಥಾನವನ್ನು ಸುರಕ್ಷಿತವಾಗಿ ತಲುಪಿದೆವು.'
    },
    'journey': {
      word: 'Journey',
      kannada: 'ಪಯಣ / ಯಾತ್ರೆ',
      pronunciation: 'Payaṇa / Yātre',
      meaning: 'An act of traveling from one place to another.',
      example: 'Have a safe journey.',
      exampleKannada: 'ನಿಮ್ಮ ಪಯಣ ಸುಖಕರವಾಗಿರಲಿ.'
    },
    'vacation': {
      word: 'Vacation',
      kannada: 'ರಜೆ / ರಜಾದಿನ',
      pronunciation: 'Raje / Rajādina',
      meaning: 'An extended period of leisure and recreation away from work or school.',
      example: 'We are going on a summer vacation.',
      exampleKannada: 'ನಾವು ಬೇಸಿಗೆಯ ರಜೆಗೆ ಹೋಗುತ್ತಿದ್ದೇವೆ.'
    },
    'nature': {
      word: 'Nature',
      kannada: 'ಪ್ರಕೃತಿ / ನಿಸರ್ಗ',
      pronunciation: 'Prakruti / Nisarga',
      meaning: 'The physical world, including plants, animals, landscapes, and other natural features.',
      example: 'Nature is peaceful and rejuvenating.',
      exampleKannada: 'ಪ್ರಕೃತಿಯು ಶಾಂತ ಮತ್ತು ಚೈತನ್ಯದಾಯಕವಾಗಿದೆ.'
    },
    'hotel': {
      word: 'Hotel',
      kannada: 'ಹೋಟೆಲ್ / ವಸತಿಗೃಹ',
      pronunciation: 'Hotel / Vasatigruha',
      meaning: 'An establishment providing accommodation, meals, and other services for travelers.',
      example: 'We booked a hotel near the beach.',
      exampleKannada: 'ನಾವು ಕಡಲತೀರದ ಬಳಿ ಹೋಟೆಲ್ ಕಾಯ್ದಿರಿಸಿದ್ದೇವೆ.'
    },
    'water': {
      word: 'Water',
      kannada: 'ನೀರು',
      pronunciation: 'Neeru',
      meaning: 'A clear, colorless liquid essential for all living organisms.',
      example: 'Please give me some drinking water.',
      exampleKannada: 'ದಯವಿಟ್ಟು ನನಗೆ ಸ್ವಲ್ಪ ಕುಡಿಯುವ ನೀರು ಕೊಡಿ.'
    },
    'food': {
      word: 'Food',
      kannada: 'ಊಟ / ಆಹಾರ',
      pronunciation: 'Oota / Āhāra',
      meaning: 'Nutritious substance that people eat in order to maintain life and growth.',
      example: 'The local Karnataka food is delicious.',
      exampleKannada: 'ಸ್ಥಳೀಯ ಕರ್ನಾಟಕದ ಊಟವು ಅತ್ಯಂತ ರುಚಿಕರವಾಗಿದೆ.'
    },
    'help': {
      word: 'Help',
      kannada: 'ಸಹಾಯ',
      pronunciation: 'Sahāya',
      meaning: 'The action of providing assistance or support to someone.',
      example: 'Can you please help me with the directions?',
      exampleKannada: 'ದಯವಿಟ್ಟು ನನಗೆ ದಾರಿ ತೋರಿಸಲು ಸಹಾಯ ಮಾಡುವಿರಾ?'
    },
    'friend': {
      word: 'Friend',
      kannada: 'ಸ್ನೇಹಿತ',
      pronunciation: 'Snēhita',
      meaning: 'A person with whom one has a bond of mutual affection and trust.',
      example: 'My friend is visiting from Bengaluru.',
      exampleKannada: 'ನನ್ನ ಸ್ನೇಹಿತ ಬೆಂಗಳೂರಿನಿಂದ ಬರುತ್ತಿದ್ದಾನೆ.'
    },
    'friends': {
      word: 'Friends',
      kannada: 'ಸ್ನೇಹಿತರು',
      pronunciation: 'Snēhitaru',
      meaning: 'People with whom one has a bond of mutual affection.',
      example: 'Traveling with friends is always exciting.',
      exampleKannada: 'ಸ್ನೇಹಿತರೊಂದಿಗೆ ಪ್ರಯಾಣಿಸುವುದು ಯಾವಾಗಲೂ ರೋಮಾಂಚನಕಾರಿಯಾಗಿರುತ್ತದೆ.'
    },
    'family': {
      word: 'Family',
      kannada: 'ಕುಟುಂಬ',
      pronunciation: 'Kuṭumba',
      meaning: 'A group of individuals related by blood, marriage, or adoption.',
      example: 'I love traveling with my family.',
      exampleKannada: 'ನಾನು ನನ್ನ ಕುಟುಂಬದೊಂದಿಗೆ ಪ್ರಯಾಣಿಸಲು ಇಷ್ಟಪಡುತ್ತೇನೆ.'
    },
    'beach': {
      word: 'Beach',
      kannada: 'ಕಡಲತೀರ / ಬೀಚ್',
      pronunciation: 'Kadalatheera',
      meaning: 'A sandy or pebbly shore by the ocean.',
      example: 'Watching the sunset at the beach is beautiful.',
      exampleKannada: 'ಕಡಲತೀರದಲ್ಲಿ ಸೂರ್ಯಾಸ್ತವನ್ನು ನೋಡುವುದು ಸುಂದರವಾಗಿರುತ್ತದೆ.'
    },
    'mountain': {
      word: 'Mountain',
      kannada: 'ಪರ್ವತ / ಬೆಟ್ಟ',
      pronunciation: 'Parvata / Betta',
      meaning: 'A large natural elevation of the earth surface rising abruptly.',
      example: 'The mountain view is breathtaking.',
      exampleKannada: 'ಪರ್ವತದ ನೋಟವು ಅತ್ಯಂತ ಅದ್ಭುತವಾಗಿದೆ.'
    },
    'guide': {
      word: 'Guide',
      kannada: 'ಮಾರ್ಗದರ್ಶಿ',
      pronunciation: 'Mārgadarshi',
      meaning: 'A person who advises or shows the way to travelers.',
      example: 'A local guide helped us explore the temple.',
      exampleKannada: 'ಸ್ಥಳೀಯ ಮಾರ್ಗದರ್ಶಿಯೊಬ್ಬರು ದೇವಾಲಯವನ್ನು ಅನ್ವೇಷಿಸಲು ನಮಗೆ ಸಹಾಯ ಮಾಡಿದರು.'
    },
    'peace': {
      word: 'Peace',
      kannada: 'ಶಾಂತಿ',
      pronunciation: 'Shānti',
      meaning: 'Freedom from disturbance; tranquility.',
      example: 'Nature brings peace of mind.',
      exampleKannada: 'ಪ್ರಕೃತಿಯು ಮನಸ್ಸಿಗೆ ಶಾಂತಿಯನ್ನು ತರುತ್ತದೆ.'
    },
    'happy': {
      word: 'Happy',
      kannada: 'ಸಂತೋಷ',
      pronunciation: 'Santōṣa',
      meaning: 'Feeling or showing pleasure or contentment.',
      example: 'We had a very happy vacation.',
      exampleKannada: 'ನಮಗೆ ತುಂಬಾ ಸಂತೋಷಕರವಾದ ರಜೆ ಇತ್ತು.'
    },
    'book': {
      word: 'Book',
      kannada: 'ಪುಸ್ತಕ (Noun) / ಕಾಯ್ದಿರಿಸು (Verb)',
      pronunciation: 'Pustaka / Kāydirisu',
      meaning: 'A written work (noun) or to reserve accommodation/transportation in advance (verb).',
      example: 'I need to book train tickets.',
      exampleKannada: 'ನಾನು ರೈಲು ಟಿಕೆಟ್‌ಗಳನ್ನು ಕಾಯ್ದಿರಿಸಬೇಕಾಗಿದೆ.'
    },
    'booking': {
      word: 'Booking',
      kannada: 'ಕಾಯ್ದಿರಿಸುವಿಕೆ',
      pronunciation: 'Kāydirisuvaike',
      meaning: 'An act of reserving accommodation, travel, etc.',
      example: 'Our hotel booking is confirmed.',
      exampleKannada: 'ನಮ್ಮ ಹೋಟೆಲ್ ಕಾಯ್ದಿರಿಸುವಿಕೆ ದೃಢಪಟ್ಟಿದೆ.'
    }
  };

  const KANNADA_PHRASES = {
    'good morning': { kannada: 'ಶುಭೋದಯ', pron: 'Shubhodaya' },
    'good night': { kannada: 'ಶುಭರಾತ್ರಿ', pron: 'Shubharatri' },
    'good afternoon': { kannada: 'ಶುಭ ಮಧ್ಯಾಹ್ನ', pron: 'Shubha Madhyāhna' },
    'good evening': { kannada: 'ಶುಭ ಸಂಜೆ', pron: 'Shubha Sanje' },
    'welcome': { kannada: 'ಸ್ವಾಗತ', pron: 'Swagata' },
    'thank you': { kannada: 'ಧನ್ಯವಾದಗಳು', pron: 'Dhanyavadagalu' },
    'thanks': { kannada: 'ಧನ್ಯವಾದಗಳು', pron: 'Dhanyavadagalu' },
    'how are you': { kannada: 'ನೀವು ಹೇಗಿದ್ದೀರಿ?', pron: 'Neevu hegiddiri?' },
    'how are you?': { kannada: 'ನೀವು ಹೇಗಿದ್ದೀರಿ?', pron: 'Neevu hegiddiri?' },
    'i am fine': { kannada: 'ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ', pron: 'Naanu chennagiddene' },
    'what is your name': { kannada: 'ನಿಮ್ಮ ಹೆಸರೇನು?', pron: 'Nimma hesarenu?' },
    'my name is': { kannada: 'ನನ್ನ ಹೆಸರು...', pron: 'Nanna hesaru...' },
    'where is this place': { kannada: 'ಈ ಸ್ಥಳ ಎಲ್ಲಿದೆ?', pron: 'Ee sthala ellide?' },
    'how much does this cost': { kannada: 'ಇದರ ಬೆಲೆ ಎಷ್ಟು?', pron: 'Idara bele estu?' },
    'please help me': { kannada: 'ದಯವಿಟ್ಟು ನನಗೆ ಸಹಾಯ ಮಾಡಿ', pron: 'Dayavittu nanage sahaya madi' },
    'have a safe journey': { kannada: 'ನಿಮ್ಮ ಪಯಣ ಸುಖಕರವಾಗಿರಲಿ', pron: 'Nimma payana sukhakaravagirali' },
    'have a good day': { kannada: 'ನಿಮ್ಮ ದಿನ ಶುಭವಾಗಿರಲಿ', pron: 'Nimma dina shubhavagirali' },
    'i love you': { kannada: 'ನಾನು ನಿನ್ನನ್ನು ಪ್ರೀತಿಸುತ್ತೇನೆ', pron: 'Naanu ninnannu preethisutthene' },
    'see you again': { kannada: 'ಮತ್ತೆ ಸಿಗೋಣ', pron: 'Matte sigona' }
  };

  function getKannadaTranslationOrMeaning(query) {
    const cleanQ = (query || '').trim().replace(/[?!.,]+$/g, '');
    const lower = cleanQ.toLowerCase();

    // 1. Direct Phrase Translations (e.g. "Translate Good Morning into Kannada", "good morning in kannada")
    for (const phrase of Object.keys(KANNADA_PHRASES)) {
      if (lower.includes(phrase)) {
        const item = KANNADA_PHRASES[phrase];
        const formattedPhrase = phrase.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return `**"${formattedPhrase}"** in Kannada is **${item.kannada}** (*${item.pron}*).`;
      }
    }

    // 2. Extract target word from meaning queries
    let targetWord = null;

    let m = lower.match(/(?:what is the meaning of|meaning of|definition of)\s+["']?([a-zA-Z\s]+?)["']?\s+(?:in|into|to)\s+kannada/i);
    if (!m) m = lower.match(/^["']?([a-zA-Z\s]+?)["']?\s+(?:meaning|artha|arth)\s+(?:in|into|to)?\s*kannada/i);
    if (!m) m = lower.match(/what does\s+["']?([a-zA-Z\s]+?)["']?\s+mean\s+(?:in|into|to)\s+kannada/i);
    if (!m) m = lower.match(/kannada\s+(?:meaning|translation|artha)\s+(?:of|for)\s+["']?([a-zA-Z\s]+?)["']?/i);
    if (!m) m = lower.match(/translate\s+["']?([a-zA-Z\s]+?)["']?\s+(?:in|into|to)\s+kannada/i);
    if (!m) m = lower.match(/how to say\s+["']?([a-zA-Z\s]+?)["']?\s+(?:in|into|to)\s+kannada/i);
    if (!m) m = lower.match(/^["']?([a-zA-Z]+)["']?\s+(?:in|alli)\s+kannada/i);
    if (!m) m = lower.match(/explain\s+["']?([a-zA-Z\s]+?)["']?\s+(?:in|into)\s+kannada/i);

    if (m && m[1]) {
      targetWord = m[1].trim().toLowerCase();
    }

    // Direct word match against KANNADA_DICTIONARY
    if (!targetWord) {
      for (const k of Object.keys(KANNADA_DICTIONARY)) {
        if (new RegExp('\\b' + k + '\\b', 'i').test(lower)) {
          targetWord = k;
          break;
        }
      }
    }

    // Explain in simple Kannada request
    if (targetWord === 'this word' || lower.includes('explain this word in simple kannada') || lower.includes('in simple kannada')) {
      return `ಕನ್ನಡದಲ್ಲಿ ಸುಲಭವಾಗಿ ಅರ್ಥೈಸಲು (Learn in Simple Kannada):\n\n` +
        `• ನೀವು ಯಾವುದೇ ಇಂಗ್ಲಿಷ್ ಪದದ ಕನ್ನಡ ಅರ್ಥ, ಉಚ್ಚಾರಣೆ ಮತ್ತು ವಾಕ್ಯ ಬಳಕೆಯನ್ನು ತಿಳಿಯಲು ಕೇಳಬಹುದು.\n` +
        `• ಉದಾಹರಣೆಗೆ (Examples):\n` +
        `  - *"Plan meaning in Kannada?"*\n` +
        `  - *"What is the meaning of Explore in Kannada?"*\n` +
        `  - *"Translate beautiful into Kannada."*\n\n` +
        `ನೀವು ತಿಳಿಯಲು ಬಯಸುವ ಪದವನ್ನು ಕೇಳಿ, ನಾನು ತಕ್ಷಣವೇ ನಿಖರ ಅರ್ಥ ಮತ್ತು ಉದಾಹರಣೆ ನೀಡುತ್ತೇನೆ!`;
    }

    if (targetWord && KANNADA_DICTIONARY[targetWord]) {
      const entry = KANNADA_DICTIONARY[targetWord];
      return `**${entry.word}**\n` +
        `- Kannada: ${entry.kannada}\n` +
        `- Pronunciation: ${entry.pronunciation}\n` +
        `- Meaning: ${entry.meaning}\n` +
        `- Example: ${entry.example}\n` +
        `- Kannada: ${entry.exampleKannada}`;
    }

    // If a custom word translation is requested
    if (targetWord) {
      const capitalized = targetWord.charAt(0).toUpperCase() + targetWord.slice(1);
      return `**${capitalized}**\n` +
        `- Kannada ವಿವರಣೆ: ${capitalized} ಪದದ ಸಾಮಾನ್ಯ ಅರ್ಥ ಮತ್ತು ಬಳಕೆ.\n` +
        `- Example: Learning ${capitalized} helps enrich communication.\n` +
        `- Kannada: ${capitalized} ಬಗ್ಗೆ ಕಲಿಯುವುದು ಸಂವಹನವನ್ನು ಸುಧಾರಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.`;
    }

    // Generic translation inquiry without a specific word
    return `🌐 **ಕನ್ನಡ ಭಾಷಾಂತರ ಮತ್ತು ಶಬ್ದಾರ್ಥ ಸಹಾಯಕ (Kannada Translation Assistant)**\n\n` +
      `ನೀವು ಯಾವುದೇ ಇಂಗ್ಲಿಷ್ ಪದ ಅಥವಾ ವಾಕ್ಯದ ನಿಖರವಾದ ಕನ್ನಡ ಅರ್ಥ ಮತ್ತು ಉಚ್ಚಾರಣೆಯನ್ನು ತಿಳಿಯಬಹುದು:\n\n` +
      `• **ಪದದ ಅರ್ಥ:** *"Plan meaning in Kannada?"* ಅಥವಾ *"What does Explore mean in Kannada?"*\n` +
      `• **ವಾಕ್ಯ ಭಾಷಾಂತರ:** *"Translate Good Morning into Kannada."*\n\n` +
      `ಯಾವ ಪದ ಅಥವಾ ವಾಕ್ಯವನ್ನು ಭಾಷಾಂತರಿಸಲು ಬಯಸುತ್ತೀರಿ?`;
  }

  function getTranslationResponse(query, lang) {
    const q = query.toLowerCase();

    // Kannada Translation
    if (q.includes('kannada') || q.includes('ಕನ್ನಡ') || q.includes('kannadadalli')) {
      return getKannadaTranslationOrMeaning(query);
    }

    // Hindi Translation
    if (q.includes('hindi') || q.includes('हिंदी') || q.includes('hindi me')) {
      return `🇮🇳 **English to Hindi (हिंदी) Translation & Everyday Phrases**\n\n` +
        `| English Phrase | Hindi Script (हिंदी) | Pronunciation (Hinglish) |\n` +
        `| :--- | :--- | :--- |\n` +
        `| **Hello / Greetings** | नमस्ते / नमस्कार | *Namaste / Namaskar* |\n` +
        `| **Good Morning** | शुभ प्रभात | *Shubh Prabhat* |\n` +
        `| **Thank You** | धन्यवाद / शुक्रिया | *Dhanyavaad / Shukriya* |\n` +
        `| **Welcome** | आपका स्वागत है | *Aapka swagat hai* |\n` +
        `| **How are you?** | आप कैसे हैं? | *Aap kaise hain?* |\n` +
        `| **I am fine** | मैं ठीक हूँ | *Main theek hoon* |\n` +
        `| **What is your name?** | आपका नाम क्या है? | *Aapka naam kya hai?* |\n` +
        `| **Where is this place?** | यह जगह कहाँ है? | *Yeh jagah kahan hai?* |\n` +
        `| **How much does this cost?** | इसका कितना दाम है? | *Iska kitna daam hai?* |\n` +
        `| **I need assistance** | मुझे मदद चाहिए | *Mujhe madad chahiye* |\n\n` +
        `💡 *Numbers in Hindi:* 1 (एक - Ek), 2 (दो - Do), 3 (तीन - Teen), 4 (चार - Chaar), 5 (पाँच - Paanch).\n\n` +
        `Ask me any phrase or paragraph you would like translated into Hindi!`;
    }

    // Default English Translation helper
    return `🌐 **Wayvora Multilingual Translation Engine**\n\n` +
      `I support fluent translations between **English**, **Kannada (ಕನ್ನಡ)**, **Hindi (हिंदी)**, and global languages.\n\n` +
      `• Tell me any phrase you would like translated (e.g., *"Translate 'Have a great journey' to Kannada"* or *"Translate 'Where can I find train tickets' to Hindi"*).\n` +
      `• I will provide accurate script, phonetic Roman pronunciation, and cultural context!`;
  }

  function getWritingSummarizationResponse(query, lang) {
    const q = query.toLowerCase();

    // Leave Application / Sick leave
    if (q.includes('leave') || q.includes('sick') || q.includes('vacation')) {
      return `✉️ **Professional Leave Application Template**\n\n` +
        `**Subject:** Leave Application: [Your Full Name] – [Start Date] to [End Date]\n\n` +
        `Dear [Manager's Name],\n\n` +
        `I am writing to formally request leave of absence from **[Start Date]** to **[End Date]** due to **[personal reasons / medical recovery / family engagement]**. I expect to return to work on **[Return Date]**.\n\n` +
        `Before taking leave, I have ensured that my current sprint tasks and deliverables are up to date. During my absence, **[Colleague's Name]** has agreed to assist with any urgent inquiries related to my projects.\n\n` +
        `I will monitor critical emails periodically if urgent matters arise. Thank you for your consideration and understanding.\n\n` +
        `Warm regards,\n\n` +
        `**[Your Full Name]**\n` +
        `[Your Role / Department]\n` +
        `[Your Contact Number]`;
    }

    // Resignation Letter
    if (q.includes('resignation')) {
      return `📄 **Formal Resignation Letter Template (Polite & Professional)**\n\n` +
        `**Subject:** Resignation – [Your Full Name]\n\n` +
        `Dear [Manager's Name],\n\n` +
        `Please accept this letter as formal notification that I am resigning from my position as **[Your Job Title]** at **[Company Name]**. My last working day will be **[Your Last Day, typically 2 weeks or 30 days notice]**.\n\n` +
        `I want to express my sincere gratitude for the opportunities I have had during my tenure with the company. I have truly enjoyed working alongside our team and appreciate your guidance and support throughout my journey here.\n\n` +
        `During my remaining time, I will do everything possible to ensure a seamless transition of my responsibilities, documentation, and ongoing projects.\n\n` +
        `I wish you, the team, and [Company Name] continued growth and success.\n\n` +
        `Sincerely,\n\n` +
        `**[Your Full Name]**\n` +
        `[Your Contact Information]`;
    }

    // Summarization Helper
    return `📝 **Smart Text Summarization Engine**\n\n` +
      `I can condense lengthy articles, academic papers, reports, or business emails into crisp, structured executive summaries:\n\n` +
      `### Summarization Framework:\n` +
      `1. **Core Thesis:** The central message captured in 1–2 direct sentences.\n` +
      `2. **Key Takeaways:** 3 to 5 high-impact bullet points highlighting critical data and arguments.\n` +
      `3. **Actionable Insights:** Next steps or strategic conclusions.\n\n` +
      `Paste the text you want summarized, and I'll break it down for you immediately!`;
  }

  function getMathScienceResponse(query, lang) {
    const q = query.toLowerCase();

    // Percentage Calculation
    const pctMatch = q.match(/(\d+(?:\.\d+)?)\s*%\s*(?:of)\s*(\d+(?:\.\d+)?)/i);
    if (pctMatch) {
      const p = parseFloat(pctMatch[1]);
      const n = parseFloat(pctMatch[2]);
      const res = (p / 100) * n;
      return `🔢 **Percentage Calculation**\n\n` +
        `$$\\text{Formula: } \\text{Result} = \\left( \\frac{\\text{Percentage}}{100} \\right) \\times \\text{Number}$$\n\n` +
        `$$\\text{Calculation: } \\left( \\frac{${p}}{100} \\right) \\times ${n} = ${res}$$\n\n` +
        `**Answer:** **${p}% of ${n} is ${res}**.`;
    }

    // Quadratic Equation
    if (q.includes('quadratic') || (q.includes('ax') && q.includes('bx'))) {
      return `📐 **The Quadratic Equation & Formula**\n\n` +
        `A standard quadratic equation is expressed as:\n` +
        `$$ax^2 + bx + c = 0 \\quad (\\text{where } a \\neq 0)$$\n\n` +
        `### The Quadratic Formula:\n` +
        `$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\n\n` +
        `### Discriminant Analysis ($\\Delta = b^2 - 4ac$):\n` +
        `• If $\\Delta > 0$: **Two distinct real roots**.\n` +
        `• If $\\Delta = 0$: **One real repeated root** ($x = -b / 2a$).\n` +
        `• If $\\Delta < 0$: **Two complex conjugate roots** ($x = \\alpha \\pm \\beta i$).\n\n` +
        `### Example: Solve $x^2 - 5x + 6 = 0$\n` +
        `• Here $a = 1, b = -5, c = 6$\n` +
        `• $\\Delta = (-5)^2 - 4(1)(6) = 25 - 24 = 1$\n` +
        `• $x = \\frac{-(-5) \\pm \\sqrt{1}}{2(1)} = \\frac{5 \\pm 1}{2}$\n` +
        `• **Roots:** $x_1 = 3, \\; x_2 = 2$`;
    }

    // Physics: Newton's Laws
    if (q.includes('newton') || q.includes('motion')) {
      return `🍎 **Sir Isaac Newton's Three Laws of Motion**\n\n` +
        `1. **First Law (Law of Inertia):**\n` +
        `   • An object at rest remains at rest, and an object in uniform motion remains in motion at constant velocity unless acted upon by a net external force.\n\n` +
        `2. **Second Law (Fundamental Law of Dynamics):**\n` +
        `   • The acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass:\n` +
        `   $$\\vec{F} = m\\vec{a} \\quad (\\text{Force} = \\text{Mass} \\times \\text{Acceleration})$$\n\n` +
        `3. **Third Law (Action & Reaction):**\n` +
        `   • For every action, there is an equal and opposite reaction ($F_{AB} = -F_{BA}$). When object A exerts a force on object B, object B simultaneously exerts an equal force in the opposite direction on object A.`;
    }

    // Biology: Photosynthesis or DNA
    if (q.includes('photosynthesis') || q.includes('dna')) {
      return `🧬 **Core Biological Wonders: Photosynthesis & DNA**\n\n` +
        `### 1. Photosynthesis (How Plants Create Food):\n` +
        `The biochemical process by which green plants convert solar light energy into chemical energy (glucose):\n` +
        `$$6CO_2 + 6H_2O + \\text{Light} \\longrightarrow C_6H_{12}O_6 + 6O_2$$\n` +
        `• Takes place inside **chloroplasts** using the green pigment **chlorophyll**.\n\n` +
        `### 2. DNA (Deoxyribonucleic Acid):\n` +
        `• The hereditary blueprint of life, discovered as a **double helix** by Watson, Crick, and Franklin.\n` +
        `• **Four Nitrogenous Bases:**\n` +
        `  - **Adenine (A)** pairs with **Thymine (T)**\n` +
        `  - **Cytosine (C)** pairs with **Guanine (G)**\n` +
        `• Sequences of these bases encode the instructions for building proteins in every living cell.`;
    }

    return `🔬 **Mathematics & Science Solver**\n\n` +
      `I can explain scientific principles and solve mathematical equations step-by-step:\n\n` +
      `• **Algebra & Calculus:** Derivatives, integrals, equations, and factorization.\n` +
      `• **Geometry & Trigonometry:** Pythagorean theorem, angles, areas, and volumes.\n` +
      `• **Physics & Chemistry:** Laws of thermodynamics, kinetics, atomic structure, and chemical reactions.\n\n` +
      `What specific problem or topic would you like to explore?`;
  }

  function getCareerInterviewResponse(query, lang) {
    const q = query.toLowerCase();

    // STAR Method
    if (q.includes('star')) {
      return `⭐ **The STAR Method for Acing Behavioral Interviews**\n\n` +
        `The **STAR framework** is the industry standard for structuring compelling answers to behavioral questions (*"Tell me about a time you..."*):\n\n` +
        `1. **S – Situation:**\n` +
        `   • Set the context. Describe the specific scenario, challenge, or project you were handling.\n\n` +
        `2. **T – Task:**\n` +
        `   • Explain what was required of you and your specific responsibility in that situation.\n\n` +
        `3. **A – Action:**\n` +
        `   • Detail the precise steps **YOU** took. Emphasize leadership, technical decisions, and collaborative problem-solving.\n\n` +
        `4. **R – Result:**\n` +
        `   • Share the measurable outcome. Quantify impact wherever possible (e.g., *"reduced latency by 35%"*, *"delivered 3 days early"*).\n\n` +
        `💡 *Pro-Tip:* Spend 70% of your talking time on **Action** and **Result**!`;
    }

    // Technical Interview Roadmap
    return `🎯 **Software Engineering & Tech Interview Preparation Roadmap**\n\n` +
      `### Phase 1: Data Structures & Algorithms (DSA)\n` +
      `• Master core patterns: Two Pointers, Sliding Window, Fast & Slow Pointers, DFS/BFS, Binary Search, and Dynamic Programming.\n` +
      `• Target 75–100 quality problems (e.g. NeetCode 150 / Blind 75) rather than mindless grinding.\n\n` +
      `### Phase 2: Computer Science Fundamentals\n` +
      `• **Operating Systems:** Threads vs Processes, Concurrency, Deadlocks.\n` +
      `• **DBMS:** SQL Queries, Normalization, Indexing (B-Trees), ACID.\n` +
      `• **Computer Networks:** TCP/IP, DNS, HTTP/HTTPS, WebSockets.\n\n` +
      `### Phase 3: System Design & Architecture\n` +
      `• Understand Caching (Redis), Load Balancers, Database Sharding, Message Queues (Kafka/RabbitMQ), and Microservices.\n\n` +
      `### Phase 4: Resume Optimization (The Google X-Y-Z Formula)\n` +
      `• *"Accomplished [X] as measured by [Y], by doing [Z]"*\n` +
      `• Example: *"Accelerated API response time by 42% (Y) across 50,000 daily users (X) by implementing Redis in-memory caching (Z)."*`;
  }

  function getGeneralKnowledgeResponse(query, lang) {
    const q = query.toLowerCase();

    // World Capitals
    if (q.includes('capital')) {
      return `🏛️ **Major World Capitals Quick Reference**\n\n` +
        `| Country | Capital City |\n` +
        `| :--- | :--- |\n` +
        `| 🇮🇳 **India** | New Delhi |\n` +
        `| 🇺🇸 **United States** | Washington, D.C. |\n` +
        `| 🇬🇧 **United Kingdom** | London |\n` +
        `| 🇫🇷 **France** | Paris |\n` +
        `| 🇯🇵 **Japan** | Tokyo |\n` +
        `| 🇩🇪 **Germany** | Berlin |\n` +
        `| 🇦🇺 **Australia** | Canberra |\n` +
        `| 🇨🇦 **Canada** | Ottawa |\n` +
        `| 🇮🇹 **Italy** | Rome |\n` +
        `| 🇦🇪 **United Arab Emirates** | Abu Dhabi |\n` +
        `| 🇧🇷 **Brazil** | Brasília |\n` +
        `| 🇷🇺 **Russia** | Moscow |\n\n` +
        `Need the capital or details for another specific country? Just ask!`;
    }

    // Solar System
    if (q.includes('planet') || q.includes('solar system')) {
      return `🪐 **The Solar System: Planets in Order from the Sun**\n\n` +
        `1. **Mercury:** Smallest planet, closest to the Sun, extreme temperature swings.\n` +
        `2. **Venus:** "Earth's twin" in size, hottest planet due to thick runaway greenhouse atmosphere ($465^\\circ\\text{C}$).\n` +
        `3. **Earth:** Our home planet, only known celestial body harboring liquid water and life.\n` +
        `4. **Mars:** The "Red Planet", rich in iron oxide, home to Olympus Mons (tallest volcano in solar system).\n` +
        `5. **Jupiter:** Largest planet, gas giant with iconic Great Red Spot storm.\n` +
        `6. **Saturn:** Famous for its dazzling system of icy rings.\n` +
        `7. **Uranus:** Ice giant with unique sideways rotation tilt.\n` +
        `8. **Neptune:** Farthest major planet, supersonic winds and deep blue methane skies.\n\n` +
        `🧠 *Mnemonic:* **"My Very Educated Mother Just Served Us Noodles"**`;
    }

    // Productivity / Pomodoro
    if (q.includes('pomodoro')) {
      return `⏱️ **The Pomodoro Technique for Peak Focus**\n\n` +
        `Invented by Francesco Cirillo, the **Pomodoro Technique** breaks deep work into manageable intervals:\n\n` +
        `1. **Choose a Single Task:** Eliminate all digital distractions.\n` +
        `2. **Set Timer for 25 Minutes:** Work with intense, uninterrupted focus.\n` +
        `3. **Take a 5-Minute Break:** Stand up, hydrate, rest your eyes.\n` +
        `4. **Repeat 4 Times:** After 4 "Pomodoros", reward yourself with a long **15–30 minute break**.\n\n` +
        `💡 *Why it works:* Keeps your prefrontal cortex energized while preventing cognitive burnout!`;
    }

    return getDynamicExplorationResponse(query, lang);
  }

  function getDynamicExplorationResponse(query, lang) {
    const cleanQuery = (query || '').replace(/[?!.,]+$/g, '').trim();

    if (lang === 'kn') {
      return `💡 **ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ವಿವರವಾದ ಮಾಹಿತಿ: "${cleanQuery}"**\n\n` +
        `ನಾನು ನಿಮಗೆ ಈ ವಿಷಯದ ಕುರಿತು ಸಂಪೂರ್ಣ ಮಾಹಿತಿ ಒದಗಿಸಲು ಸಂತೋಷಪಡುತ್ತೇನೆ:\n\n` +
        `• **ವಿಷಯದ ವಿವರಣೆ:** ನೀವು ಕೇಳಿರುವ ವಿಷಯವು ಪ್ರಮುಖ ಜ್ಞಾನ ಮತ್ತು ಅಧ್ಯಯನದ ಭಾಗವಾಗಿದೆ.\n` +
        `• **ಮುಖ್ಯ ಅಂಶಗಳು:**\n` +
        `  - ಈ ವಿಷಯದ ಮೂಲ ತತ್ವಗಳು ಮತ್ತು ಪ್ರಾಯೋಗಿಕ ಬಳಕೆಗಳನ್ನು ಸುಲಭವಾಗಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಬಹುದು.\n` +
        `  - ಇದು ದೈನಂದಿನ ಜೀವನ, ಶಿಕ್ಷಣ ಅಥವಾ ವೃತ್ತಿಜೀವನದಲ್ಲಿ ಅತ್ಯಂತ ಉಪಯುಕ್ತವಾಗಿದೆ.\n\n` +
        `ನೀವು ಈ ವಿಷಯದ ಕುರಿತು ಇನ್ನಷ್ಟು ಆಳವಾದ ವಿವರಣೆ ಅಥವಾ ಉದಾಹರಣೆಗಳನ್ನು ಬಯಸುವಿರಾ?`;
    }

    if (lang === 'hi' || lang === 'hinglish') {
      return `💡 **आपके सवाल का विस्तृत उत्तर: "${cleanQuery}"**\n\n` +
        `इस विषय के बारे में महत्वपूर्ण और व्यावहारिक जानकारी नीचे दी गई है:\n\n` +
        `• **मुख्य अवधारणा (Core Concept):** यह विषय सीखने और समझने के लिहाज़ से बहुत महत्वपूर्ण है।\n` +
        `• **ज़रूरी बातें:**\n` +
        `  - इसे वास्तविक जीवन और प्रैक्टिकल परिदृश्यों में आसानी से लागू किया जा सकता है।\n` +
        `  - इसमें गहरी समझ हासिल करने से कई नए दृष्टिकोण सामने आते हैं।\n\n` +
        `क्या आप इस विषय पर कोई उदाहरण, कोड, या फॉलो-अप सवाल पूछना चाहते हैं?`;
    }

    return `💡 **Insight & Explanation: "${cleanQuery}"**\n\n` +
      `Here is a clear, structured overview regarding your question:\n\n` +
      `### 📌 Core Concept\n` +
      `Understanding **${cleanQuery}** involves examining its fundamental principles, how it operates in practice, and why it is significant.\n\n` +
      `### ⚙️ Key Observations & Principles\n` +
      `• **Clarity & Context:** Breaking down the core elements helps highlight the underlying logic and real-world mechanisms.\n` +
      `• **Practical Application:** Whether in software engineering, everyday reasoning, science, or career planning, mastering this concept yields actionable insights.\n` +
      `• **Continuous Learning:** Delving into specific use cases, trade-offs, and examples solidifies your understanding.\n\n` +
      `Would you like me to elaborate further on a specific aspect, write a code sample, or explain related sub-topics?`;
  }

  // -------------------------------------------------------------
  // CYBERSECURITY DEFINITION & ESSENTIALS
  // -------------------------------------------------------------
  function getWhatIsCybersecurityResponse() {
    return `🛡️ **What is Cybersecurity? Fundamentals, Pillars & Defense Strategies**\n\n` +
      `**Cybersecurity** is the practice of protecting systems, networks, computers, mobile devices, servers, and sensitive data from malicious digital attacks, unauthorized access, corruption, or disruption.\n\n` +
      `### 1. The CIA Triad (The Core Foundation)\n` +
      `Every robust security framework is built around three foundational pillars:\n` +
      `• **Confidentiality:** Ensuring sensitive data is accessible ONLY to authorized individuals and shielded against eavesdropping (enforced via end-to-end encryption and access controls).\n` +
      `• **Integrity:** Maintaining the absolute accuracy, consistency, and trustworthiness of data across its lifecycle without unauthorized modification or tampering (enforced via cryptographic hashes like SHA-256 and digital signatures).\n` +
      `• **Availability:** Ensuring critical services, networks, and databases remain reliably operational and accessible to authorized users whenever needed (enforced via redundancy, load balancers, and DDoS mitigation).\n\n` +
      `### 2. Core Domains & Pillars of Cybersecurity\n` +
      `• **Network Security:** Safeguarding internal network traffic and infrastructure from external intrusions (Next-Gen Firewalls, IDS/IPS, VPNs, VLAN segmentation).\n` +
      `• **Application Security:** Writing secure, vulnerability-free code during software development to block threats such as SQL Injection and Cross-Site Scripting (XSS).\n` +
      `• **Cloud Security:** Protecting identities, sensitive data, and containerized workloads running in AWS, Google Cloud, or Azure via strict IAM policies and encryption at rest.\n` +
      `• **Endpoint Security:** Securing end-user client devices (laptops, workstations, smartphones) through Endpoint Detection & Response (EDR) and real-time behavioral monitoring.\n` +
      `• **Identity & Access Management (IAM):** Enforcing strict authentication, Role-Based Access Control (RBAC), and the Principle of Least Privilege.\n\n` +
      `### 3. Top Cyber Threats in the Modern World\n` +
      `• **Malware:** Malicious software including viruses, trojans, worms, and spyware engineered to damage devices.\n` +
      `• **Ransomware:** Extortion malware that encrypts files and systems, demanding financial ransom for decryption.\n` +
      `• **Phishing:** Social engineering emails and deceptive websites masquerading as legitimate entities to harvest passwords or financial credentials.\n` +
      `• **Man-in-the-Middle (MitM):** Eavesdropping attacks intercepting communication between two parties (mitigated by HTTPS/TLS).\n` +
      `• **DDoS (Distributed Denial of Service):** Overwhelming servers with flood traffic from thousands of infected botnet machines.\n\n` +
      `### 4. Essential Security Best Practices\n` +
      `1. **Enforce Multi-Factor Authentication (MFA):** Requires a critical second verification factor beyond passwords.\n` +
      `2. **Zero Trust Architecture:** "Never trust, always verify" — inspect and authenticate every request regardless of origin.\n` +
      `3. **Continuous Patch Management:** Promptly apply security patches to operating systems, servers, and software libraries.\n` +
      `4. **Automated Immutable Backups:** Maintain isolated, encrypted 3-2-1 backup copies of critical databases to recover swiftly from ransomware.`;
  }

  // -------------------------------------------------------------
  // FEATURED TRAVEL DESTINATION & BUDGET RESPONSES
  // -------------------------------------------------------------
  function getIndia3DayTripResponse(lang) {
    return `🇮🇳 **Curated 3-Day Itinerary: The Classic Golden Triangle of India**\n\n` +
      `For an unforgettable 3-day journey across India, the world-renowned **Golden Triangle (Delhi – Agra – Jaipur)** offers an extraordinary blend of Mughal heritage, royal Rajasthani architecture, and iconic world wonders seamlessly connected by high-speed express trains.\n\n` +
      `---\n\n` +
      `### 📍 Day 1: Historic Delhi – The Heritage Capital\n` +
      `• **Morning (Old Delhi):** Begin at the monumental 17th-century **Red Fort (Lal Qila)**, followed by a cycle-rickshaw ride through the vibrant lanes of **Chandni Chowk** and a visit to **Jama Masjid**, one of India's grandest mosques.\n` +
      `• **Afternoon (New Delhi):** Pay homage at **India Gate**, take in the grand ceremonial vista past **Rashtrapati Bhavan** (President's Estate), and explore the soaring 12th-century **Qutub Minar** (UNESCO World Heritage Site).\n` +
      `• **Evening:** Sample iconic street food (Butter Chicken, Chaat, Kebabs) around Connaught Place or Dilli Haat. Board the evening train or prepare for an early morning departure to Agra.\n\n` +
      `---\n\n` +
      `### 📍 Day 2: Agra – The Monument of Eternal Love\n` +
      `• **Sunrise (The Taj Mahal):** Witness the breathtaking sunrise at the **Taj Mahal** (UNESCO World Wonder), watching the translucent white marble transform from soft pink to radiant pearl in the morning light.\n` +
      `• **Late Morning:** Tour the magnificent **Agra Fort**, the red-sandstone citadel that served as the seat of the Mughal Empire, featuring the Diwan-i-Aam and Jahangiri Mahal.\n` +
      `• **Afternoon & Sunset:** Visit **Mehtab Bagh** across the Yamuna River for a serene sunset reflection of the Taj Mahal. Taste famous **Agra Petha** and explore marble inlay craft studios before departing to Jaipur (~4 hours via expressway/train).\n\n` +
      `---\n\n` +
      `### 📍 Day 3: Jaipur – The Royal Pink City of Rajasthan\n` +
      `• **Morning:** Ascend to the hilltop **Amber Fort (Amer Fort)**; marvel at the mirrored artistry of **Sheesh Mahal** and panoramic views of Maota Lake.\n` +
      `• **Afternoon:** Stop for photos at the romantic **Jal Mahal (Water Palace)**, then explore the honeycombed facade of the **Hawa Mahal (Palace of Winds)** and the royal courtyards of the **City Palace**.\n` +
      `• **Evening:** Stroll through **Johari Bazaar** for handcrafted textiles, blue pottery, and silver jewelry. Conclude with an authentic Rajasthani Thali featuring **Dal Baati Churma**.\n\n` +
      `---\n\n` +
      `### 💡 Practical Travel Tips\n` +
      `• **Fast Transit:** Travel between Delhi and Agra aboard the **Gatimaan Express** (approx. 100 minutes) or Vande Bharat Express.\n` +
      `• **Estimated Budget:** ₹7,500 – ₹14,000 per person (covers comfortable mid-range hotels, AC transit, entry tickets, and dining).\n` +
      `• **Best Season:** October through March offers crisp, pleasant weather ideal for sightseeing.`;
  }

  function getGoaPlacesToVisitResponse(lang) {
    return `🏖️ **Top 5 Places to Visit in Goa (Beaches, Heritage & Waterfalls)**\n\n` +
      `Goa is a vibrant destination of sun-drenched Arabian Sea coastlines, centuries-old Portuguese architecture, cascading waterfalls, and laid-back coastal culture. Here are the **five best places you must visit in Goa**:\n\n` +
      `---\n\n` +
      `### 1. Fort Aguada & 19th-Century Lighthouse (North Goa)\n` +
      `• **Why Visit:** Built by the Portuguese in 1612 at the mouth of the Mandovi River, this sprawling red-laterite fort features freshwater springs (which gave it the name *Aguada*) and a historic 4-storey lighthouse with sweeping 360-degree views of the Arabian Sea and Sinquerim Beach.\n` +
      `• **Highlights:** Panoramic cliff-top ocean views, historic gunpowder room, sunset photography, and nearby Sinquerim watersports.\n\n` +
      `---\n\n` +
      `### 2. Basilica of Bom Jesus & Old Goa (Central Goa)\n` +
      `• **Why Visit:** A UNESCO World Heritage Site and one of the finest examples of Baroque architecture in Asia. It holds the sacred mortal remains and silver casket of St. Francis Xavier, drawing visitors and pilgrims from all over the world.\n` +
      `• **Highlights:** Intricate gilded wood carvings, 16th-century marble floor mosaics, Se Cathedral across the road (Asia's largest church), and the Church of St. Francis of Assisi.\n\n` +
      `---\n\n` +
      `### 3. Palolem Beach (South Goa)\n` +
      `• **Why Visit:** Widely regarded as Goa's most picturesque and serene beach, Palolem is a crescent-shaped bay lined with overhanging coconut palms and colorful wooden beach huts. Its sheltered waters are remarkably calm and safe for swimming.\n` +
      `• **Highlights:** Guided morning dolphin-spotting boat trips, kayaking out to Canacona Island (Green Island), silent headphone beach parties, and fresh seafood shacks.\n\n` +
      `---\n\n` +
      `### 4. Dudhsagar Waterfalls (Goa-Karnataka Border)\n` +
      `• **Why Visit:** Plunging from a staggering height of 310 meters (1,017 feet) down the sheer face of the Western Ghats, Dudhsagar literally means "Sea of Milk" due to the foaming white spray it creates inside the lush Bhagwan Mahaveer Wildlife Sanctuary.\n` +
      `• **Highlights:** Thrilling open-top 4x4 jungle jeep safari through streams, swimming in the natural freshwater pool beneath the falls, and seeing trains traverse the iconic railway bridge arching right across the waterfall.\n\n` +
      `---\n\n` +
      `### 5. Fontainhas Latin Quarter (Panaji)\n` +
      `• **Why Visit:** The historic Portuguese neighborhood in Goa's capital city, Fontainhas retains an authentic Mediterranean ambiance with narrow winding cobblestone lanes flanked by pastel-colored colonial villas in vibrant yellows, terracottas, and cobalt blues.\n` +
      `• **Highlights:** Walking photo tours, quaint heritage art galleries, traditional bakeries serving warm Portuguese egg tarts (*Pastéis de Nata*), and cozy cafés playing live fado music.\n\n` +
      `---\n\n` +
      `### 💡 Insider Travel Tips\n` +
      `• **Best Way to Commute:** Rent a scooter (approx. ₹350–₹500/day) or self-drive car for complete freedom between North and South Goa.\n` +
      `• **Best Season:** Mid-November to mid-February offers sunny days and cool tropical breezes.\n` +
      `• **Must-Try Local Food:** Authentic Goan Fish Curry Thali, Prawn Balchão, Bebinca, and refreshing Kokum juice.`;
  }

  function getBestDestinationsIndiaResponse() {
    return `🇮🇳 **Best Travel Destinations in India (By Travel Style)**\n\n` +
      `India offers an unmatched diversity of travel landscapes. Here are the top destinations categorized by experience:\n\n` +
      `• 🏖️ **Coastal & Beaches:**\n` +
      `  - **Goa:** Sun-kissed beaches, Portuguese heritage, and vibrant nightlife.\n` +
      `  - **Gokarna (Karnataka):** Peaceful cliff-lined beaches (Om Beach, Kudle Beach) and soulful vibes.\n` +
      `  - **Andaman & Nicobar Islands:** Crystal-clear turquoise waters and world-class scuba diving at Radhanagar Beach.\n\n` +
      `• 🏔️ **Mountains, Valleys & Snow:**\n` +
      `  - **Kashmir (Srinagar & Gulmarg):** "Paradise on Earth" with Dal Lake Shikara rides, Gondola cable cars, and snow meadows.\n` +
      `  - **Manali & Spiti Valley (Himachal):** Rohtang Pass, Solang Valley adventures, and high-altitude Himalayan monasteries.\n` +
      `  - **Leh-Ladakh:** Pangong Tso Lake, Khardung La Pass, and dramatic lunar landscapes.\n\n` +
      `• 🏰 **Heritage & Royal Grandeur:**\n` +
      `  - **Jaipur & Udaipur (Rajasthan):** Grand desert forts, mirrored palaces, and serene lake boat rides.\n` +
      `  - **Hampi (Karnataka):** UNESCO World Heritage boulder-strewn ruins of the historic Vijayanagara Empire.\n` +
      `  - **Varanasi (Uttar Pradesh):** The spiritual heart of India along the sacred Ghats of the Ganges River.\n\n` +
      `• 🌴 **Backwaters, Tea Plantations & Rainforests:**\n` +
      `  - **Kerala (Alleppey & Munnar):** Houseboat cruises on emerald backwaters and sprawling misty tea plantations.\n` +
      `  - **Coorg (Karnataka):** The "Scotland of India" with coffee estates, spice trails, and Abbey Falls.`;
  }

  function getBudgetInternationalTripsResponse() {
    return `✈️ **Top Budget-Friendly International Trips from India (Under ₹40,000 – ₹60,000)**\n\n` +
      `You can explore breathtaking international destinations without breaking the bank. Here are the best high-value countries for Indian travelers:\n\n` +
      `1. **Thailand (Bangkok, Phuket, Pattaya or Krabi):**\n` +
      `   • *Estimated Cost:* ₹35,000 – ₹50,000 for 5 Days (including round-trip flights).\n` +
      `   • *Highlights:* Visa-free entry / easy eVisa, affordable beach resorts, island hopping, and incredible street food.\n\n` +
      `2. **Vietnam (Hanoi, Da Nang & Ha Long Bay):**\n` +
      `   • *Estimated Cost:* ₹40,000 – ₹55,000 for 6 Days.\n` +
      `   • *Highlights:* Favorable currency exchange (₹1 ≈ ~300 VND), UNESCO limestone karsts, Lantern city of Hoi An, and coffee culture.\n\n` +
      `3. **Bali, Indonesia:**\n` +
      `   • *Estimated Cost:* ₹45,000 – ₹60,000 for 5 Days.\n` +
      `   • *Highlights:* Affordable luxury private pool villas, iconic cliffside temples (Uluwatu, Tanah Lot), and beach clubs.\n\n` +
      `4. **Sri Lanka (Colombo, Kandy, Nuwara Eliya & Bentota):**\n` +
      `   • *Estimated Cost:* ₹30,000 – ₹45,000 for 5 Days.\n` +
      `   • *Highlights:* Short flight duration, Ramayana trail heritage, tea plantations, and whale watching in Mirissa.\n\n` +
      `5. **Nepal (Kathmandu & Pokhara):**\n` +
      `   • *Estimated Cost:* ₹20,000 – ₹35,000 for 5 Days.\n` +
      `   • *Highlights:* No visa or passport required for Indian citizens (voter ID valid), Annapurna mountain vistas, and paragliding.`;
  }

  function getEstimateTravelBudgetResponse() {
    return `💰 **Wayvora Interactive Travel Budget Estimator**\n\n` +
      `To calculate your estimated travel expenses, here is the standard daily cost breakdown across travel tiers:\n\n` +
      `### 1. Travel Tiers (Per Person Per Day):\n` +
      `• **🎒 Budget / Backpacker:** ₹1,500 – ₹2,500 / day\n` +
      `  - *Stay:* Hostels, homestays, or budget guesthouses (₹600–₹1,200/night)\n` +
      `  - *Food:* Popular local restaurants and street eateries (₹400–₹700/day)\n` +
      `  - *Transit:* Public buses, metro, shared autos, or rental scooter\n\n` +
      `• **✨ Mid-Range (Couples & Families):** ₹3,500 – ₹6,500 / day\n` +
      `  - *Stay:* 3-star to 4-star boutique hotels or beach cottages (₹2,500–₹4,500/night)\n` +
      `  - *Food:* Multi-cuisine sit-down restaurants, beach shacks, and cafes (₹1,000–₹1,800/day)\n` +
      `  - *Transit:* Private AC cabs, rental car, or local sightseeing tours\n\n` +
      `• **🌟 Luxury / Premium:** ₹10,000+ / day\n` +
      `  - *Stay:* 5-star luxury beach resorts or palace hotels (₹8,000–₹25,000+/night)\n` +
      `  - *Food:* Fine-dining, beachfront gourmet meals, and curated dining\n` +
      `  - *Transit:* Chauffeur-driven private luxury vehicles and private yacht charters\n\n` +
      `### 2. Quick Budget Formula:\n` +
      `$$\\text{Total Trip Budget} = (\\text{Daily Tier Cost} \\times \\text{Days}) + \\text{Round-Trip Travel (Flight/Train)} + 15\\% \\text{ Contingency Buffer}$$\n\n` +
      `👉 **Tell me your target destination, duration (in days), and group size**, and I will generate a custom itemized budget for you!`;
  }

  function getBaliBestTimeResponse() {
    return `🌴 **The Best Time to Visit Bali, Indonesia (Seasonal Guide)**\n\n` +
      `Bali is a year-round tropical paradise situated just south of the equator. Choosing the best time depends on weather, crowd preferences, and budget:\n\n` +
      `### 1. Dry Season (April to October) – ⭐ Best Overall Weather\n` +
      `• **Weather:** Sunny, warm days (27°C–30°C), low humidity, and refreshing sea breezes.\n` +
      `• **Ideal For:** Beach days (Seminyak, Nusa Dua), surfing, scuba diving, and temple sightseeing (Uluwatu, Tanah Lot, Besakih).\n` +
      `• **Peak Months:** July and August have the coolest evenings and highest tourist crowds.\n\n` +
      `### 2. Shoulder Months (May, June & September) – 🏆 Best Value for Money\n` +
      `• **Why it's the Sweet Spot:** Fantastic sunny weather, pleasant humidity, significantly fewer crowds than July/August, and **hotel rates are 20% to 35% cheaper**.\n\n` +
      `### 3. Wet / Rainy Season (November to March) – 💰 Best for Budget Travelers\n` +
      `• **Weather:** Warmer and humid with tropical rain showers (most rains occur as heavy 1-2 hour afternoon downpours rather than all-day drizzles).\n` +
      `• **Ideal For:** Lush emerald-green rice terraces in Ubud (Tegallalang), cultural yoga retreats, spa days, and uncrowded waterfalls.\n` +
      `• **Savings:** Deep discounts on flights and luxury private pool villas!`;
  }

  // -------------------------------------------------------------
  // 5. EXISTING TRAVEL ITINERARY & DESTINATION GENERATORS (PRESERVED)
  // -------------------------------------------------------------

  function getGoaItinerary(days, lang) {
    const d = days || 3;

    if (lang === 'kn') {
      return `🏖️ **ಗೋವಾ ${d} ದಿನಗಳ ಸುಂದರ ಪ್ರವಾಸದ ಯೋಜನೆ (ಕಸ್ಟಮ್ ಪ್ಲಾನ್)**\n\n` +
        `ಗೋವಾ ಪ್ರವಾಸಕ್ಕೆ ನಿಮಗೆ ಸ್ವಾಗತ! ನೀವು ಕಡಲತೀರಗಳು, ಪೋರ್ಚುಗೀಸ್ ಇತಿಹಾಸ ಮತ್ತು ರೋಮಾಂಚಕ ಸಂಸ್ಕೃತಿಯನ್ನು ಆನಂದಿಸಲು ಇಲ್ಲಿದೆ ಅತ್ಯುತ್ತಮ ಯೋಜನೆ:\n\n` +
        `📍 **ದಿನ 1: ಉತ್ತರ ಗೋವಾ ಕಡಲತೀರಗಳು ಮತ್ತು ಸೂರ್ಯಾಸ್ತ**\n` +
        `• **ಬೆಳಿಗ್ಗೆ:** ಆಗಮಿಸಿ ರೂಮಿನಲ್ಲಿ ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ. ನಂತರ ಅರಬ್ಬೀ ಸಮುದ್ರದ ಮೇಲಿರುವ 17 ನೇ ಶತಮಾನದ ಭವ್ಯ **ಫೋರ್ಟ್ ಅಗುಡಾ (Fort Aguada)** ವೀಕ್ಷಿಸಿ.\n` +
        `• **ಮಧ್ಯಾಹ್ನ:** ಕ್ಯಾಂಡೋಲಿಮ್ ಅಥವಾ ಕಲಂಗೂಟ್ ಬೀಚ್‌ನಲ್ಲಿ ವಿಶ್ರಾಂತಿ ಪಡೆಯಿರಿ; ರುಚಿಕರವಾದ ತಾಜಾ ಕರಾವಳಿ ಮೀನಿನ ಊಟ (Fish Thali) ಸವಿಯಿರಿ.\n` +
        `• **ಸಂಜೆ:** **ಅಂಜುನಾ (Anjuna)** ಅಥವಾ ವಾಗತೋರ್ ಬೀಚ್‌ನಲ್ಲಿ ಸೂರ್ಯಾಸ್ತ ಆಸ್ವಾದಿಸಿ; ಸಮುದ್ರ ತೀರದ ಶ್ಯಾಕ್‌ಗಳಲ್ಲಿ ಲೈವ್ ಸಂಗೀತ ಆನಂದಿಸಿ.\n\n` +
        `📍 **ದಿನ 2: ಪರಂಪರೆ, ಹಳೆಯ ಗೋವಾ ಮತ್ತು ನದಿ ಕ್ರೂಸ್**\n` +
        `• **ಬೆಳಿಗ್ಗೆ:** ಯುನೆಸ್ಕೋ ವಿಶ್ವ ಪರಂಪರೆಯ ತಾಣಗಳಾದ **ಬಾಸಿಲಿಕಾ ಆಫ್ ಬೊಮ್ ಜೀಸಸ್ (Basilica of Bom Jesus)** ಮತ್ತು ಸೇ ಕೆಥೆಡ್ರಲ್ ಭೇಟಿ ನೀಡಿ.\n` +
        `• **ಮಧ್ಯಾಹ್ನ:** ಪಣಜಿಯ ಬಣ್ಣಬಣ್ಣದ ಪೋರ್ಚುಗೀಸ್ ಲ್ಯಾಟಿನ್ ಕ್ವಾರ್ಟರ್ **ಫಾಂಟೈನ್‌ಹಾಸ್ (Fontainhas)** ನಲ್ಲಿ ಹೆಜ್ಜೆ ಹಾಕಿ; ಬೆಬಿಂಕಾ ಸಿಹಿ ಸವಿಯಿರಿ.\n` +
        `• **ಸಂಜೆ:** ಮಾಂಡೋವಿ ನದಿಯಲ್ಲಿ ಸಾಂಪ್ರದಾಯಿಕ ಗೋವಾ ಸಂಗೀತ-ನೃತ್ಯದೊಂದಿಗೆ 1 ಗಂಟೆಯ ಸನ್ಸೆಟ್ ರಿವರ್ ಕ್ರೂಸ್.\n\n` +
        `📍 **ದಿನ 3: ಪ್ರಶಾಂತ ದಕ್ಷಿಣ ಗೋವಾ ಮತ್ತು ನಿಸರ್ಗ**\n` +
        `• **ಬೆಳಿಗ್ಗೆ:** ದಕ್ಷಿಣ ಗೋವಾದ ಸುಂದರ ಕಾಯಾಕಿಂಗ್ ತಾಣ **ಪಾಲೋಲೆಮ್ ಬೀಚ್ (Palolem Beach)** ಗೆ ತೆರಳಿ.\n` +
        `• **ಮಧ್ಯಾಹ್ನ:** ಬಂಡೆಗಳ ಮೇಲಿರುವ ಐತಿಹಾಸಿಕ **ಕಾಬೊ ಡಿ ರಾಮಾ ಕೋಟೆ (Cabo de Rama Fort)** ವೀಕ್ಷಿಸಿ.\n` +
        `• **ಸಂಜೆ:** ಕೋಲ್ವಾ ಬೀಚ್‌ನಲ್ಲಿ ಶಾಂತಿಯುತ ಸಂಜೆ ಕಳೆದು ವಾಪಸ್ ಪ್ರಯಾಣ.\n\n` +
        `💰 **ಅಂದಾಜು ಬಜೆಟ್ (ಪ್ರತಿ ವ್ಯಕ್ತಿಗೆ ₹ INR):**\n` +
        `• **ಬಜೆಟ್ ಪ್ರವಾಸಿಗರು (ಹಾಸ್ಟೆಲ್ & ಸ್ಕೂಟರ್):** ₹4,500 – ₹7,000\n` +
        `• **ಮಧ್ಯಮ ವರ್ಗ (3-ಸ್ಟಾರ್ ಹೋಟೆಲ್ & ಕಾರು):** ₹11,000 – ₹17,000\n\n` +
        `🛵 **ಸ್ಥಳೀಯ ಸಂಚಾರ:** ದಿನಕ್ಕೆ **₹350–₹500** ಕ್ಕೆ ಸ್ಕೂಟರ್ (ಆಕ್ಟಿವಾ) ಬಾಡಿಗೆ ಪಡೆಯುವುದು ಅತ್ಯಂತ ಲಾಭದಾಯಕ!\n\n` +
        `💡 *ವೇವೋರಾ ಸಲಹೆ:* ನೀವು ಈ ಪ್ಲಾನ್ ಅನ್ನು ನಮ್ಮ **Trip Planner** ಟ್ಯಾಬ್‌ನಲ್ಲಿ ಸೇರಿಸಿ ದಿನವಾರು ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಬಹುದು!`;
    }

    if (lang === 'kanglish') {
      return `🏖️ **Goa ${d}-Day Awesome Travel Itinerary (Coastal Charm & Fun)**\n\n` +
        `Goa ge plan maadtirodhu super choice! Beaches, historic forts, matthe amazing vibes enjoy madoke illide perfect plan:\n\n` +
        `📍 **Day 1: North Goa Coastal Vibes & Sunsets**\n` +
        `• **Morning:** Check-in aagi swalpa fresh aagi. 17th century **Fort Aguada** visit madi, Arabian Sea view thumba beautiful aagide.\n` +
        `• **Afternoon:** Candolim / Calangute beach nalli relax madi. Authentic Goan Fish Thali try madi.\n` +
        `• **Evening:** **Anjuna** athva Vagator beach nalli sunset nodi, beach shacks nalli chill vibes enjoy madi.\n\n` +
        `📍 **Day 2: Heritage, Old Goa & River Cruise**\n` +
        `• **Morning:** UNESCO World Heritage spot **Basilica of Bom Jesus** & Se Cathedral visit madi.\n` +
        `• **Afternoon:** Panaji nalliro colorful Portuguese street **Fontainhas** nalli walking madi, photography ge best spot!\n` +
        `• **Evening:** Mandovi river nalli sunset leisure cruise with music & folk dance.\n\n` +
        `📍 **Day 3: Peaceful South Goa & Water Sports**\n` +
        `• **Morning:** South Goa dhavashyakavada **Palolem Beach** ge drive madi, kayaking enjoy madi.\n` +
        `• **Afternoon:** Cliff-top ruins **Cabo de Rama Fort** visit madi.\n` +
        `• **Evening:** Benaulim / Colva beach shacks nalli candle-light dinner matthe return journey.\n\n` +
        `💰 **Estimated Budget (Per person in ₹ INR):**\n` +
        `• **Budget traveler (Hostel + Scooter):** ₹4,500 – ₹7,000\n` +
        `• **Mid-range (3-Star Hotel + Cabs):** ₹11,000 – ₹16,000\n\n` +
        `🛵 **Travel Tip:** Local travel ge Activa scooter rent madi (just **₹350–₹500/day**), full flexibility sigutthe!\n\n` +
        `💡 Namma **Trip Planner** tab nalli ee itinerary na 1-click nalli curate madbahudu!`;
    }

    if (lang === 'hi') {
      return `🏖️ **गोवा ${d}-दिवसीय यात्रा योजना (शानदार बीचेस और कल्चर)**\n\n` +
        `गोवा की यात्रा के लिए एक बेहतरीन और संतुलित ${d}-दिन का प्लान तैयार है:\n\n` +
        `📍 **दिन 1: नॉर्थ गोवा बीचेस और सनसेट**\n` +
        `• **सुबह:** होटल चेक-इन के बाद ऐतिहासिक **फोर्ट अगुआडा (Fort Aguada)** घूमें, जहाँ से अरब सागर का विहंगम दृश्य दिखता है।\n` +
        `• **दोपहर:** कैंडोलिम या कलंगूट बीच पर रिलैक्स करें और स्वादिष्ट कोस्टल फिश थाली का आनंद लें।\n` +
        `• **शाम:** **अंजुना (Anjuna)** या वागातोर बीच पर सनसेट देखें और बीच शैक्स में लाइव म्यूजिक का मज़ा लें।\n\n` +
        `📍 **दिन 2: ओल्ड गोवा की विरासत और मंडोवी रिवर क्रूज़**\n` +
        `• **सुबह:** यूनेस्को विश्व धरोहर स्थल **बेसिलिका ऑफ बॉम जीसस** और से कैथेड्रल के दर्शन करें।\n` +
        `• **दोपहर:** पणजी के पुर्तगाली रंगीन क्वार्टर **फॉन्टेनहास (Fontainhas)** में पैदल सैर करें और हेरिटेज कैफे में बेबिंका खाएं।\n` +
        `• **शाम:** मंडोवी नदी में 1 घंटे का सनसेट क्रूज़ पारंपरिक संगीत और डांस के साथ।\n\n` +
        `📍 **दिन 3: शांत साउथ गोवा और वाटर एक्टिविटीज़**\n` +
        `• **सुबह:** साउथ गोवा के खूबसूरत **पालोलेम बीच (Palolem Beach)** जाएं और कायाकिंग का आनंद लें।\n` +
        `• **दोपहर:** खूबसूरत चट्टानों पर स्थित **काबो डी रामा फोर्ट** देखें।\n` +
        `• **शाम:** समुद्र किनारे शांत कैंडल-लाइट डिनर और वापसी।\n\n` +
        `💰 **अनुमानित बजट (प्रति व्यक्ति ₹ INR में):**\n` +
        `• **बजट यात्री (हॉस्टल + स्कूटर):** ₹4,500 – ₹7,000\n` +
        `• **मिड-रेंज (3-स्टार होटल + कैब):** ₹11,000 – ₹16,000\n\n` +
        `🛵 **ट्रांसपोर्ट टिप:** घूमने के लिए एक्टिवा स्कूटर किराए पर लें (लगभग **₹350–₹500/दिन**), यह सबसे किफायती है!\n\n` +
        `💡 आप इसे Wayvora के **Trip Planner** में भी आसानी से जोड़ सकते हैं!`;
    }

    if (lang === 'hinglish') {
      return `🏖️ **Goa ${d}-Day Awesome Itinerary (Beaches, Forts & Nightlife)**\n\n` +
        `Goa trip ke liye ekdum mast aur practical ${d}-day plan yeh raha:\n\n` +
        `📍 **Day 1: North Goa Beaches & Sunset Vibes**\n` +
        `• **Morning:** Hotel check-in ke baad 17th-century **Fort Aguada** visit karein, ocean view lajawab hai.\n` +
        `• **Afternoon:** Candolim ya Calangute beach par relax karein aur authentic Goan seafood/thali enjoy karein.\n` +
        `• **Evening:** **Anjuna** ya Vagator beach par magical sunset dekhein aur beach shacks me music enjoy karein.\n\n` +
        `📍 **Day 2: Portuguese Heritage, Panaji & River Cruise**\n` +
        `• **Morning:** Old Goa me UNESCO sites **Basilica of Bom Jesus** aur Se Cathedral visit karein.\n` +
        `• **Afternoon:** Panaji ke colorful Latin Quarter **Fontainhas** me photo walk karein aur heritage bakery me Bebinca try karein.\n` +
        `• **Evening:** Mandovi river par 1-hour sunset river cruise Goan folk music aur dance ke sath.\n\n` +
        `📍 **Day 3: Serene South Goa & Relaxing Shores**\n` +
        `• **Morning:** Scenic **Palolem Beach** jayein, wahan par kayaking aur boat ride ka maza lein.\n` +
        `• **Afternoon:** Cliff par sthit **Cabo de Rama Fort** visit karein.\n` +
        `• **Evening:** Colva / Benaulim beach shack par candle-light dinner aur return journey.\n\n` +
        `💰 **Estimated Budget (Per person in ₹ INR):**\n` +
        `• **Budget traveler (Hostel + Scooter):** ₹4,500 – ₹7,000\n` +
        `• **Mid-range (3-Star resort + Taxi):** ₹11,000 – ₹16,000\n\n` +
        `🛵 **Smart Travel Tip:** Cabs lene ke bajay **₹350–₹500/day** me Activa scooter rent karein, paise aur time dono bachenge!\n\n` +
        `💡 Ise aap Wayvora ke **Trip Planner** tab me bhi save aur customize kar sakte hain!`;
    }

    // Default English
    return `🏖️ **Curated ${d}-Day Goa Itinerary (Coastal Charm, Heritage & Sunsets)**\n\n` +
      `Here is a balanced, high-value ${d}-day itinerary covering vibrant North Goa beaches, Portuguese culture, and pristine coastal vistas:\n\n` +
      `📍 **Day 1: Vibrant North Goa & Fort Aguada**\n` +
      `• **Morning:** Arrive, check into your stay, and explore the historic 17th-century **Fort Aguada** overlooking the Arabian Sea.\n` +
      `• **Afternoon:** Relax at Candolim or Calangute beach; grab fresh Goan seafood or beachside snacks.\n` +
      `• **Evening:** Sunset at **Anjuna** or Vagator Beach; enjoy lively beach shack music and seaside dinner (try Goan Fish Curry and Prawn Balchão).\n\n` +
      `📍 **Day 2: Portuguese Heritage, Fontainhas & Sunset Cruise**\n` +
      `• **Morning:** Tour UNESCO World Heritage sites in **Old Goa**—the magnificent Basilica of Bom Jesus and Se Cathedral.\n` +
      `• **Afternoon:** Stroll through the colorful Portuguese Latin Quarter of **Fontainhas** in Panaji; sample freshly baked Poee and Bebinca at a heritage café.\n` +
      `• **Evening:** Sunset leisure cruise on the **Mandovi River** with traditional folk music and dance.\n\n` +
      `📍 **Day 3: Serene South Goa & Pristine Bays**\n` +
      `• **Morning:** Head to South Goa for tranquil crescent bays like **Palolem Beach**; enjoy kayaking or a boat ride.\n` +
      `• **Afternoon:** Visit the clifftop ruins of **Cabo de Rama Fort** with sweeping turquoise water views.\n` +
      `• **Evening:** Sunset dinner at a tranquil beach shack in Colva or Benaulim before heading home.\n\n` +
      `💰 **Estimated Budget (Per Person in ₹ INR):**\n` +
      `• **Budget explorer:** ₹4,500 – ₹7,000 (Hostels, scooter rental, local beach shacks)\n` +
      `• **Mid-range comfort:** ₹11,000 – ₹16,000 (3-star boutique resorts, private transport, dining)\n` +
      `• **Luxury:** ₹25,000+ (5-star beachfront resorts, fine dining, water sports)\n\n` +
      `🛵 **Transport Tip:** Rent an Activa scooter for **₹350–₹500/day** for maximum freedom and affordability!\n\n` +
      `💡 *Trip Planner Integration:* You can auto-curate and manage this trip day-by-day in your **Trip Planner** tab!`;
  }

  function getKeralaItinerary(days, lang) {
    const d = days || 4;
    return `🌴 **Enchanting Kerala ${d}-Day Itinerary ("God's Own Country")**\n\n` +
      `Kerala is a world-renowned destination famous for emerald tea hills, tranquil backwaters, and Ayurvedic heritage. Here is your ideal ${d}-day plan:\n\n` +
      `📍 **Day 1: Historic Fort Kochi & Cultural Heritage**\n` +
      `• **Morning:** Arrive at Cochin International Airport (COK). Stroll past iconic 14th-century **Chinese Fishing Nets** and St. Francis Church.\n` +
      `• **Afternoon:** Explore Mattancherry Palace (Dutch Palace) and the fragrant spice markets of Jew Town.\n` +
      `• **Evening:** Watch an authentic **Kathakali dance performance** with live classical percussion.\n\n` +
      `📍 **Day 2: Misty Hills & Tea Plantations of Munnar**\n` +
      `• **Morning:** Scenic drive to Munnar (approx. 3.5 hrs) passing Cheeyappara and Valara waterfalls.\n` +
      `• **Afternoon:** Tour the Tata Tea Museum and walk through the rolling green tea estates of Mattupetty.\n` +
      `• **Evening:** Relax with panoramic mountain valley sunset views from Top Station or Echo Point.\n\n` +
      `📍 **Day 3: Serene Alleppey Backwaters**\n` +
      `• **Morning:** Drive to Alleppey (Alappuzha), the "Venice of the East".\n` +
      `• **Afternoon:** Cruise through tranquil palm-fringed canals. (Pro-tip: Government SWTD public ferry costs only ₹25–₹40, or hire a private Shikara boat for ₹600/hr!).\n` +
      `• **Evening:** Relish authentic Kerala Karimeen Pollichathu (pearl spot fish wrapped in banana leaf) at a canal-side homestay.\n\n` +
      `📍 **Day 4: Cliff Beaches of Varkala / Kovalam**\n` +
      `• **Morning:** Drive down to Varkala’s dramatic red laterite cliffs overlooking the Arabian Sea.\n` +
      `• **Afternoon:** Experience a relaxing traditional Ayurvedic herbal massage.\n` +
      `• **Evening:** Clifftop sunset dinner at a beachside café before departure.\n\n` +
      `💰 **Estimated Budget (Per Person in ₹ INR):**\n` +
      `• **Budget traveler:** ₹6,000 – ₹9,500 (Homestays, public ferries, KSRTC buses, local meals)\n` +
      `• **Comfort mid-range:** ₹14,000 – ₹22,000 (Boutique plantation stays, private cab, Shikara cruise)\n\n` +
      `Would you like me to tailor this for a family, couple, or reduce the budget further?`;
  }

  function getFamilyCheapTripResponse(lang) {
    if (lang === 'kn') {
      return `👨‍👩‍👧‍👦 **ಕುಟುಂಬಕ್ಕೆ ಅತ್ಯುತ್ತಮ ಬಜೆಟ್-ಸ್ನೇಹಿ ಪ್ರವಾಸ ತಾಣಗಳು (Family Friendly Trips)**\n\n` +
        `ಕುಟುಂಬದೊಂದಿಗೆ ಪ್ರವಾಸ ಮಾಡುವಾಗ ಸುರಕ್ಷತೆ, ಆರಾಮದಾಯಕ ವಾಸ್ತವ್ಯ ಮತ್ತು ಸಮಂಜಸ ಬಜೆಟ್ ಮುಖ್ಯ. ಇಲ್ಲಿವೆ 4 ಅತ್ಯುತ್ತಮ ತಾಣಗಳು:\n\n` +
        `1. **ಮೈಸೂರು & ಕೂರ್ಗ್ (ಕರ್ನಾಟಕ)**\n` +
        `   • **ವಿಶೇಷತೆ:** ಭವ್ಯ ಮೈಸೂರು ಅರಮನೆ, ಚಾಮುಂಡಿ ಬೆಟ್ಟ, ಬೃಂದಾವನ ಗಾರ್ಡನ್, ಕೂರ್ಗ್‌ನ ಕಾಫಿ ತೋಟಗಳು ಮತ್ತು ದುಬಾರೆ ಆನೆ ಶಿಬಿರ.\n` +
        `   • **ಕುಟುಂಬ ಬಜೆಟ್:** 3 ದಿನಗಳಿಗೆ 4 ಜನರ ಕುಟುಂಬಕ್ಕೆ ಒಟ್ಟು **₹14,000 – ₹20,000**.\n\n` +
        `2. **ಕೇರಳ (ಮುನ್ನಾರ್ & ಅಲೆಪ್ಪಿ)**\n` +
        `   • **ವಿಶೇಷತೆ:** ಪ್ರಶಾಂತ ಹಿನ್ನೀರು (Backwaters), ಚಹಾ ತೋಟಗಳು ಮತ್ತು ಸುರಕ್ಷಿತ ಫ್ಯಾಮಿಲಿ ಹೋಂಸ್ಟೇಗಳು.\n` +
        `   • **ಕುಟುಂಬ ಬಜೆಟ್:** 4 ದಿನಗಳಿಗೆ **₹18,000 – ₹26,000**.\n\n` +
        `3. **ದಕ್ಷಿಣ ಗೋವಾ (ಕೋಲ್ವಾ & ಬೆನೌಲಿಮ್)**\n` +
        `   • **ವಿಶೇಷತೆ:** ಉತ್ತರ ಗೋವಾಕ್ಕಿಂತ ಶಾಂತಿಯುತ, ಮಕ್ಕಳಿಗೆ ಸುರಕ್ಷಿತ ಸಮುದ್ರತೀರಗಳು, ಪೋರ್ಚುಗೀಸ್ ಇತಿಹಾಸ.\n` +
        `   • **ಕುಟುಂಬ ಬಜೆಟ್:** 3 ದಿನಗಳಿಗೆ **₹16,000 – ₹24,000**.\n\n` +
        `4. **ಜೈಪುರ & ಉದಯಪುರ (ರಾಜಸ್ಥಾನ)**\n` +
        `   • **ವಿಶೇಷತೆ:** ಕೋಟೆಗಳು, ಅರಮನೆಗಳು, ಸಾಂಸ್ಕೃತಿಕ ಕೈಗೊಂಬೆ ಆಟಗಳು.\n\n` +
        `ನಿಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ಯಾವ ಸ್ಥಳ ಹೆಚ್ಚು ಇಷ್ಟವಾಗಬಹುದು, ಅಥವಾ ನಿಮ್ಮ ಪ್ರಯಾಣ ಪ್ರಾರಂಭಿಸುವ ನಗರ ಯಾವುದು ತಿಳಿಸುವಿರಾ?`;
    }

    if (lang === 'hi' || lang === 'hinglish') {
      return `👨‍👩‍👧‍👦 **फैमिली के लिए बेस्ट बजट-फ्रेंडली ट्रिप सुझाव (Affordable Family Trips)**\n\n` +
        `फैमिली के साथ ट्रिप में सुरक्षा, आरामदायक स्टे और अच्छा खाना सबसे महत्वपूर्ण होता है। ये 4 जगहें सबसे बेस्ट हैं:\n\n` +
        `1. **मैसूर और कूर्ग (कर्नाटक)**\n` +
        `   • **हाइलाइट्स:** मैसूर पैलेस, चिड़ियाघर, कूर्ग के कॉफी बागान, एबी फॉल्स और दुबारे एलीफेंट कैंप।\n` +
        `   • **बजट:** 4 लोगों की फैमिली के लिए 3 दिन का कुल खर्च लगभग **₹15,000 – ₹22,000**।\n\n` +
        `2. **केरल (मुन्नार और अल्लेप्पी)**\n` +
        `   • **हाइलाइट्स:** चाय के बागान, शांत बैकवाटर्स, और होममेड स्वादिष्ट खाना देने वाले फैमिली होमस्टे।\n` +
        `   • **स्मार्ट टिप:** महंगे प्राइवेट हाउसबोट की जगह गवर्नमेंट SWTD फेरी लें (सिर्फ ₹40 प्रति व्यक्ति), बैकवाटर्स का वही नजारा मिलेगा!\n` +
        `   • **बजट:** 4 दिन का कुल खर्च **₹18,000 – ₹26,000**।\n\n` +
        `3. **साउथ गोवा (कोलवा और बेनाउलिम)**\n` +
        `   • **हाइलाइट्स:** नॉर्थ गोवा की भीड़भाड़ से दूर, बच्चों के लिए सुरक्षित साफ बीचेस और हेरिटेज रिसॉर्ट्स।\n` +
        `   • **बजट:** 3 दिन का खर्च **₹16,000 – ₹24,000**।\n\n` +
        `4. **जयपुर (राजस्थान)**\n` +
        `   • **हाइलाइट्स:** आमेर फोर्ट, हवा महल, चौकी ढाणी में लोकनृत्य और कठपुतली शो।\n\n` +
        `आप किस शहर से अपनी यात्रा शुरू करना चाहते हैं? मैं आपके लिए सटीक ट्रेन और होटल सुझाव दे सकता हूँ!`;
    }

    return `👨‍👩‍👧‍👦 **Best Budget-Friendly Family Trip Recommendations**\n\n` +
      `Traveling with family requires a balance of comfort, safety, relaxed pace, and family-friendly dining. Here are the top 4 destinations offering incredible experiences at an affordable cost:\n\n` +
      `1. **Mysore & Coorg (Karnataka)**\n` +
      `   • **Why it's great:** Mysore Palace lightings, Sri Chamarajendra Zoological Gardens (kids love it!), lush Coorg coffee plantations, and Dubare Elephant Camp.\n` +
      `   • **Transport:** Easily connected via Shatabdi/Vande Bharat trains and state KSRTC buses from Bengaluru/Belagavi.\n` +
      `   • **Estimated Family Budget (Family of 3–4):** **₹15,000 – ₹22,000 total** for 3 days.\n\n` +
      `2. **Kerala (Munnar & Alleppey Backwaters)**\n` +
      `   • **Why it's great:** Misty cool climate in Munnar, gentle backwater boat rides, safe registered homestays with home-cooked meals.\n` +
      `   • **Budget-Smart Move:** Take the Government SWTD public ferry from Alleppey to Kottayam (only ₹25–₹40/person) instead of ₹10,000+ private houseboats!\n` +
      `   • **Estimated Family Budget:** **₹18,000 – ₹26,000 total** for 4 days.\n\n` +
      `3. **South Goa (Benaulim & Colva)**\n` +
      `   • **Why it's great:** Far calmer and safer for children and elders than party-heavy North Goa; clean gentle beaches, dolphin spotting trips, and quiet heritage resorts.\n` +
      `   • **Estimated Family Budget:** **₹16,000 – ₹24,000 total** for 3 days.\n\n` +
      `4. **Jaipur (The Pink City, Rajasthan)**\n` +
      `   • **Why it's great:** Majestic Amer Fort, Hawa Mahal, colorful cultural puppet shows, and delicious royal thalis.\n` +
      `   • **Estimated Family Budget:** **₹16,000 – ₹23,000 total** for 3 days.\n\n` +
      `Which of these sounds most exciting to your family, or do you have a specific departure city in mind?`;
  }

  function getBudget10kResponse(lang) {
    if (lang === 'kn') {
      return `💰 **₹10,000 ಬಜೆಟ್‌ನಲ್ಲಿ ಅದ್ಭುತ ಪ್ರವಾಸ ತಾಣಗಳು (Under ₹10,000 Trips)**\n\n` +
        `₹10,000 ಬಜೆಟ್‌ನಲ್ಲಿ 3 ರಿಂದ 4 ದಿನಗಳ ಅದ್ಭುತ ಪ್ರವಾಸ ಮಾಡಲು ಭಾರತದಲ್ಲಿ ಅತ್ಯುತ್ತಮ ಅವಕಾಶಗಳಿವೆ! ಇಲ್ಲಿವೆ ಟಾಪ್ 4 ಸ್ಥಳಗಳು:\n\n` +
        `1. **ಗೋಕರ್ಣ & ದಾಂಡೇಲಿ (ಕರ್ನಾಟಕ)**\n` +
        `   • ಓಂ ಬೀಚ್, ಕುಡ್ಲೆ ಬೀಚ್, ದಾಂಡೇಲಿ ಕಾಳಿ ನದಿ ರಾಫ್ಟಿಂಗ್ ಮತ್ತು ನಿಸರ್ಗ ಶಿಬಿರ.\n` +
        `   • ಅಂದಾಜು ವೆಚ್ಚ: 3 ದಿನಗಳಿಗೆ **₹6,500 – ₹8,500**.\n\n` +
        `2. **ಹಂಪಿ (ಯುನೆಸ್ಕೋ ವಿಶ್ವ ಪರಂಪರೆ)**\n` +
        `   • ವಿಜಯನಗರ ಸಾಮ್ರಾಜ್ಯದ ಶಿಲ್ಪಕಲೆ, ತುಂಗಭದ್ರಾ ನದಿ, ಸೈಕಲ್ ಬಾಡಿಗೆ (ದಿನಕ್ಕೆ ₹100).\n` +
        `   • ಅಂದಾಜು ವೆಚ್ಚ: 3 ದಿನಗಳಿಗೆ **₹5,500 – ₹7,500**.\n\n` +
        `3. **ರಿಷಿಕೇಶ (ಉತ್ತರಾಖಂಡ)**\n` +
        `   • ಗಂಗಾ ನದಿ ರಾಫ್ಟಿಂಗ್ (₹600–₹1,000), ನದಿ ತೀರದ ಕ್ಯಾಂಪಿಂಗ್, ತ್ರಿವೇಣಿ ಘಾಟ್ ಆರತಿ.\n` +
        `   • ಅಂದಾಜು ವೆಚ್ಚ: 3 ದಿನಗಳಿಗೆ **₹7,500 – ₹9,500**.\n\n` +
        `4. **ಪಾಂಡಿಚೇರಿ (Pondicherry)**\n` +
        `   • ಫ್ರೆಂಚ್ ಕ್ವಾರ್ಟರ್, ಪ್ರೊಮೆನೇಡ್ ಬೀಚ್, ಆರೋವಿಲ್.\n` +
        `   • ಅಂದಾಜು ವೆಚ್ಚ: 3 ದಿನಗಳಿಗೆ **₹7,000 – ₹9,000**.\n\n` +
        `📊 **₹10,000 ಖರ್ಚು ವಿಭಜನೆ:**\n` +
        `• 🏨 ವಾಸ್ತವ್ಯ (ಹಾಸ್ಟೆಲ್ / ಹೋಂಸ್ಟೇ 3 ರಾತ್ರಿ): ₹2,500 – ₹3,000\n` +
        `• 🚂 ಪ್ರಯಾಣ (ರೈಲು ಸ್ಲೀಪರ್ / ಕೆಎಸ್ಆರ್‌ಟಿಸಿ): ₹1,800 – ₹2,500\n` +
        `• 🍛 ಊಟ-ತಿಂಡಿ (ಸ್ಥಳೀಯ ಹೋಟೆಲ್‌ಗಳು): ₹2,000 – ₹2,500\n` +
        `• 🛵 ಸ್ಥಳೀಯ ಸಂಚಾರ & ಪ್ರವೇಶ ಟಿಕೆಟ್: ₹1,500 – ₹2,000\n\n` +
        `ಇವುಗಳಲ್ಲಿ ನಿಮ್ಮ ಮೊದಲ ಆಯ್ಕೆ ಯಾವುದು?`;
    }

    if (lang === 'hi' || lang === 'hinglish') {
      return `💰 **₹10,000 के बजट में बेस्ट टूरिस्ट स्पॉट्स (Under ₹10,000 Trips)**\n\n` +
        `₹10,000 एक शानदार बजट है अगर आप स्मार्ट तरीके से प्लान करें! यहाँ 4 बेहतरीन जगहें हैं जहाँ आप 3-4 दिन आराम से घूम सकते हैं:\n\n` +
        `1. **ऋषिकेश (उत्तराखंड)**\n` +
        `   • **एक्टिविटीज़:** 16 किमी गंगा रिवर राफ्टिंग (₹600-₹1000), रिवरसाइड कैंपिंग और त्रिवेणी घाट की शाम की आरती।\n` +
        `   • **खर्च:** 3 दिन का कुल खर्च **₹7,000 – ₹9,000**।\n\n` +
        `2. **गोकर्ण और दांदेली (कर्नाटक)**\n` +
        `   • **एक्टिविटीज़:** ओम बीच, कुडले बीच ट्रेक, दांदेली में रिवर राफ्टिंग और जंगल सफारी।\n` +
        `   • **खर्च:** 3 दिन का खर्च **₹6,500 – ₹8,500**।\n\n` +
        `3. **हम्पी (कर्नाटक)**\n` +
        `   • **एक्टिविटीज़:** प्राचीन विजयनगर के मंदिर और खंडहर, ₹100/दिन में साइकिल रेंट, हिप्पी आइलैंड सनसेट।\n` +
        `   • **खर्च:** 3 दिन का खर्च **₹5,500 – ₹7,500**।\n\n` +
        `4. **पॉन्डिचेरी (Pondicherry)**\n` +
        `   • **एक्टिविटीज़:** फ्रेंच कॉलोनी की फोटो वॉक, प्रोमेनेड बीच और ऑरोविले।\n` +
        `   • **खर्च:** 3 दिन का खर्च **₹7,000 – ₹9,000**।\n\n` +
        `📊 **₹10,000 का प्रैक्टिकल खर्च ब्रेकडाउन:**\n` +
        `• 🏨 स्टे (होस्टल/होमस्टे 3 रातें): ₹2,500 – ₹3,200\n` +
        `• 🚂 सफर (स्लीपर ट्रेन/बस): ₹1,800 – ₹2,500\n` +
        `• 🍛 खाना-पीना (लोकल कैफे और थाली): ₹2,000 – ₹2,500\n` +
        `• 🛵 लोकल ट्रांसपोर्ट (स्कूटर/साइकिल): ₹1,500 – ₹2,000\n` +
        `• 💵 **कुल:** ₹10,000 के अंदर!\n\n` +
        `आप इनमें से किस जगह जाना पसंद करेंगे?`;
    }

    return `💰 **Top Travel Destinations You Can Visit for Under ₹10,000 (INR)**\n\n` +
      `₹10,000 is an exciting, realistic budget for a 3-to-4 day getaway in India when planned smartly with trains, boutique hostels/homestays, and local dining! Here are 4 top destinations:\n\n` +
      `1. **Gokarna & Dandeli (Karnataka)**\n` +
      `   • **Highlights:** Pristine beaches (OM Beach, Kudle), scenic 5-beach cliff trek, Kali river rafting and jungle camps in Dandeli.\n` +
      `   • **Total Estimated Cost (3 Days):** **₹6,500 – ₹8,500**.\n\n` +
      `2. **Hampi (UNESCO World Heritage Site)**\n` +
      `   • **Highlights:** Ancient Vijayanagara architectural ruins, Virupaksha temple, boulder climbing, renting bicycles for ₹100/day, serene Tungabhadra sunsets.\n` +
      `   • **Total Estimated Cost (3 Days):** **₹5,500 – ₹7,500**.\n\n` +
      `3. **Rishikesh (Uttarakhand)**\n` +
      `   • **Highlights:** 16 km Ganga white-water river rafting (₹600–₹1,000), riverside hostels (Zostel/goSTOPS from ₹500/night), cliff jumping, magical evening Ganga Aarti at Triveni Ghat.\n` +
      `   • **Total Estimated Cost (3 Days):** **₹7,500 – ₹9,500**.\n\n` +
      `4. **Pondicherry (French Heritage & Coastal Bliss)**\n` +
      `   • **Highlights:** Yellow colonial French Quarter, Promenade Beach walk, Matrimandir / Auroville, delicious fresh bakeries.\n` +
      `   • **Total Estimated Cost (3 Days):** **₹7,000 – ₹9,000**.\n\n` +
      `📊 **How Your ₹10,000 Covers Everything (Itemized Allocation):**\n` +
      `• 🏨 **Accommodation (3 nights in hostel dorm / homestay):** ₹2,500 – ₹3,200\n` +
      `• 🚂 **Transportation (Train Sleeper / State KSRTC bus):** ₹1,800 – ₹2,500\n` +
      `• 🍛 **Food & Drinks (Authentic regional eateries):** ₹2,000 – ₹2,500\n` +
      `• 🛵 **Local Transit & Sightseeing (Scooter rent / entry passes):** ₹1,500 – ₹2,000\n` +
      `• 💵 **Total:** Within your ₹10,000 limit!\n\n` +
      `Which of these sounds like your kind of getaway?`;
  }

  function getSnowColdPlacesResponse(lang) {
    if (lang === 'kn') {
      return `❄️ **ಹಿಮಪಾತ ಮತ್ತು ತಂಪಾದ ಗಿರಿಧಾಮಗಳು (Snow & Cold Destinations)**\n\n` +
        `ನೀವು ಹಿಮ (Snow), ಹಿಮಪಾತ ಮತ್ತು ತಂಪಾದ ಪರ್ವತಗಳ ಅನುಭವ ಪಡೆಯಲು ಬಯಸಿದರೆ, ಇಲ್ಲಿವೆ ಅತ್ಯುತ್ತಮ ತಾಣಗಳು:\n\n` +
        `1. **ಮನಾಲೀ & ಸೋಲಾಂಗ್ ವ್ಯಾಲಿ (ಹಿಮಾಚಲ ಪ್ರದೇಶ)**\n` +
        `   • **ವಿಶೇಷತೆ:** ಭಾರಿ ಹಿಮಪಾತ, ಸ್ಕೀಯಿಂಗ್, ಸ್ನೋಬೋರ್ಡಿಂಗ್, ಅಟಲ್ ಟನಲ್.\n` +
        `   • **ಅತ್ಯುತ್ತಮ ಸಮಯ:** ಡಿಸೆಂಬರ್ ಅಂತ್ಯದಿಂದ ಫೆಬ್ರವರಿ ವರೆಗೆ.\n\n` +
        `2. **ಗುಲ್ಮಾರ್ಗ್ & ಪಹಲ್ಗಾಮ್ (ಕಾಶ್ಮೀರ - "ಭೂಮಿಯ ಮೇಲಿನ ಸ್ವರ್ಗ")**\n` +
        `   • **ವಿಶೇಷತೆ:** ವಿಶ್ವದ ಅತಿ ಎತ್ತರದ ಗೊಂಡೋಲಾ ಕೇಬಲ್ ಕಾರ್ (13,780 ಅಡಿ), ದಟ್ಟ ಹಿಮದ ಹೊದಿಕೆ.\n` +
        `   • **ಅತ್ಯುತ್ತಮ ಸಮಯ:** ಡಿಸೆಂಬರ್ ನಿಂದ ಮಾರ್ಚ್.\n\n` +
        `3. **ಶಿಮ್ಲಾ & ಕುಫ್ರಿ (ಹಿಮಾಚಲ ಪ್ರದೇಶ)**\n` +
        `   • **ವಿಶೇಷತೆ:** ಮಲ್ಲ ರೋಡ್, ಐಸ್ ಸ್ಕೇಟಿಂಗ್ ರಿಂಕ್, ಹಿಮಾಲಯನ್ ನೇಚರ್ ಪಾರ್ಕ್.\n\n` +
        `4. **ಸ್ವಿಟ್ಜರ್ಲೆಂಡ್ (ಮೌಂಟ್ ಟಿಟ್ಲಿಸ್ & ಜರ್ಮಟ್ - ಅಂತಾರಾಷ್ಟ್ರೀಯ)**\n` +
        `   • ಆಲ್ಪ್ಸ್ ಪರ್ವತ ಶ್ರೇಣಿ, ವರ್ಷವಿಡೀ ಹಿಮಾವೃತ ಗ್ಲೇಸಿಯರ್ 3000.\n\n` +
        `🧥 **ಪ್ಯಾಕಿಂಗ್ ಟಿಪ್ಸ್:** ಥರ್ಮಲ್ ಇನ್‌ವೇರ್, ವಾಟರ್‌ಪ್ರೂಫ್ ಡೌನ್ ಜಾಕೆಟ್, ಸ್ನೋ ಬೂಟ್ಸ್ ಮತ್ತು ಕೈಗವಸುಗಳನ್ನು ಮರೆಯಬೇಡಿ!`;
    }

    if (lang === 'hi' || lang === 'hinglish') {
      return `❄️ **बर्फबारी और ठंडी जगहों के टॉप टूरिस्ट स्पॉट्स (Snow & Winter Wonderlands)**\n\n` +
        `अगर आपको असली बर्फ (Snowfall) और ठंडी वादियों का मजा लेना है, तो ये जगहें सबसे बेहतरीन हैं:\n\n` +
        `1. **मनाली और सोलांग वैली / रोहतांग (हिमाचल प्रदेश)**\n` +
        `   • **हाइलाइट्स:** चारों तरफ सफेद बर्फ की चादर, स्कीइंग, स्नो स्कूटर और अटल टनल का शानदार नजारा।\n` +
        `   • **बेस्ट टाइम फॉर स्नो:** 25 दिसंबर से फरवरी तक।\n\n` +
        `2. **गुलमर्ग और पहलगाम (कश्मीर - जन्नत-ए-कश्मीर)**\n` +
        `   • **हाइलाइट्स:** दुनिया का सबसे ऊंचा गोंडोला केबल कार (13,780 फीट), पाउडर जैसी मुलायम बर्फ, और स्नोफॉल।\n` +
        `   • **बेस्ट टाइम:** दिसंबर से मार्च।\n\n` +
        `3. **शिमला और कुफरी (हिमाचल प्रदेश)**\n` +
        `   • **हाइलाइट्स:** एशिया का एकमात्र प्राकृतिक आइस स्केटिंग रिंक, कुफरी में याक की सवारी और माल रोड पर वॉक।\n` +
        `   • **बेस्ट टाइम:** जनवरी से मध्य-फरवरी।\n\n` +
        `4. **स्विट्जरलैंड (माउंट टिट्लिस और मैटरहॉर्न - इंटरनेशनल)**\n` +
        `   • स्विस आल्प्स, ग्लेशियर वॉक और दुनिया की पहली घूमने वाली रोटेयर केबल कार।\n\n` +
        `🧥 **पैकिंग सलाह:** थर्मल इनर, वाटरप्रूफ जैकेट, स्नो ग्रिप वाले जूते और सनग्लासेस साथ रखना बिल्कुल न भूलें!\n\n` +
        `क्या आप भारत के अंदर (जैसे मनाली या कश्मीर) जाना चाहते हैं या इंटरनेशनल टूर प्लान कर रहे हैं?`;
    }

    return `❄️ **Breathtaking Cold Places with Guaranteed Snow & Winter Charm**\n\n` +
      `If you're craving pure white snow blankets, thrilling snow sports, and cozy fireside evenings, here are the premier destinations:\n\n` +
      `1. **Manali & Solang Valley / Rohtang Pass (Himachal Pradesh)**\n` +
      `   • **What makes it magical:** Heavy winter snowfall, skiing, snowboarding, tube rides, snowmobiling, and the scenic drive through the engineering marvel Atal Tunnel.\n` +
      `   • **Peak Snow Months:** **Late December to February**.\n` +
      `   • **Estimated Budget:** ₹8,000 – ₹14,000 per person (3–4 days).\n\n` +
      `2. **Gulmarg & Pahalgam (Kashmir — "Paradise on Earth")**\n` +
      `   • **What makes it magical:** World's highest operating Gondola cable car ascending to 13,780 ft at Apharwat Peak, powdery ski slopes, and postcard-perfect snow pines.\n` +
      `   • **Peak Snow Months:** **December to March**.\n` +
      `   • **Estimated Budget:** ₹15,000 – ₹25,000 per person (4–5 days).\n\n` +
      `3. **Shimla & Kufri (Himachal Pradesh)**\n` +
      `   • **What makes it magical:** Historic British-era Ridge, Asia's oldest natural outdoor ice skating rink, and horse/yak rides in snowy Kufri.\n` +
      `   • **Peak Snow Months:** **January to mid-February**.\n\n` +
      `4. **Switzerland (Mount Titlis & Zermatt — International Escape)**\n` +
      `   • **What makes it magical:** The mighty Swiss Alps, Glacier 3000, revolving Rotair cable car, and iconic views of the Matterhorn.\n` +
      `   • **Peak Snow Months:** Year-round on high glaciers; valley snow from November to April.\n\n` +
      `🧥 **Essential Packing Advice:** Heavy thermal base layers, waterproof windcheater/down jacket, snow-traction trekking boots, and UV sunglasses (snow glare is intense!).\n\n` +
      `Are you planning a trip within India (like Manali/Kashmir) or dreaming of an international snowy escape to Switzerland?`;
  }

  function getFriendsTripResponse(lang) {
    if (lang === 'kn') {
      return `🎉 **ಸ್ನೇಹಿತರೊಂದಿಗೆ ಮಸ್ತ್ ಪ್ರವಾಸ ತಾಣಗಳು (Trips for Friends)**\n\n` +
        `ಗೆಳೆಯರ ಗುಂಪಿನೊಂದಿಗೆ ಪ್ರವಾಸ ಮಾಡುವಾಗ ಅಡ್ವೆಂಚರ್, ನೈಟ್‌ಲೈಫ್ ಮತ್ತು ಮಜಾ ಮುಖ್ಯ! ಇಲ್ಲಿವೆ ಟಾಪ್ 4 ತಾಣಗಳು:\n\n` +
        `1. **ಉತ್ತರ ಗೋವಾ (ವಾಗತೋರ್ & ಅಂಜುನಾ):** ವಾಟರ್ ಸ್ಪೋರ್ಟ್ಸ್, ಸ್ಕೂಟರ್ ರೈಡ್, ಬೀಚ್ ಶ್ಯಾಕ್‌ಗಳು ಮತ್ತು ನೈಟ್‌ಲೈಫ್.\n` +
        `2. **ರಿಷಿಕೇಶ (ಉತ್ತರಾಖಂಡ):** ಗಂಗಾ ನದಿಯಲ್ಲಿ ರೋಮಾಂಚಕ ವೈಟ್ ವಾಟರ್ ರಾಫ್ಟಿಂಗ್, ಕ್ಲಿಫ್ ಜಂಪಿಂಗ್ ಮತ್ತು ಕ್ಯಾಂಪ್‌ಫೈಯರ್ ನೈಟ್ಸ್.\n` +
        `3. **ಕಸೋಲ್ & ತೋಷ್ (ಹಿಮಾಚಲ ಪ್ರದೇಶ):** ಪರ್ವತಗಳ ಚಾರಣ, ಕನ್ಫ್ಯೂಷನ್ ಇಲ್ಲದ ಕೂಲ್ ಮೌಂಟೇನ್ ಕೆಫೆಗಳು, ಪ್ರಕೃತಿಯ ಮಡಿಲು.\n` +
        `4. **ಗೋಕರ್ಣ (ಕರ್ನಾಟಕ):** 5-ಬೀಚ್ ಟ್ರೆಕ್, ಓಂ ಬೀಚ್ ವಾಲಿಬಾಲ್, ಬಜೆಟ್ ಬೀಚ್ ಶ್ಯಾಕ್‌ಗಳು.\n\n` +
        `💡 **ಸ್ನೇಹಿತರ ಗ್ರೂಪ್ ಲಾಭ:** ರೂಮ್ ಮತ್ತು ಕ್ಯಾಬ್ ವೆಚ್ಚವನ್ನು ಶೇರ್ ಮಾಡಿಕೊಳ್ಳುವುದರಿಂದ ಪ್ರತಿ ವ್ಯಕ್ತಿಗೆ 30%–40% ಖರ್ಚು ಉಳಿತಾಯವಾಗುತ್ತದೆ!`;
    }

    if (lang === 'hi' || lang === 'hinglish') {
      return `🎉 **दोस्तों के साथ मस्ती और एडवेंचर वाले टॉप ट्रिप्स (Trips for Friends)**\n\n` +
        `दोस्तों के ग्रुप के साथ ट्रिप पर एडवेंचर, नाइटलाइफ और फ्रीडम सबसे जरूरी होता है! ये 4 जगहें सबसे बेस्ट हैं:\n\n` +
        `1. **नॉर्थ गोवा (वागातोर, बागा और मोरजिम):**\n` +
        `   • दोस्तों के साथ स्कूटी का काफिला, जेट स्की/पैरासेलिंग, बीच पार्टीज और लेट-नाइट कैफे।\n` +
        `2. **ऋषिकेश (उत्तराखंड):**\n` +
        `   • 16 किमी गंगा रिवर राफ्टिंग, 30 फीट ऊंची क्लिफ जंपिंग, और रात में बोनफायर के साथ कैंपिंग।\n` +
        `3. **कसोल और तोश (हिमाचल प्रदेश):**\n` +
        `   • पार्वती वैली के खूबसूरत ट्रेक्स, नदी किनारे कैफे में मैगी और चाय, और खीरगंगा गर्म पानी के कुंड में नहाना।\n` +
        `4. **गोकर्ण (कर्नाटक):**\n` +
        `   • बीचेस का 5-किलोमीटर ट्रेक, बीच पर वॉलीबॉल, और बजट-फ्रेंडली बीच हट्स।\n\n` +
        `💡 **ग्रुप बेनिफिट:** होटल रूम, हॉस्टल डॉर्म या विला शेयर करने से हर दोस्त का खर्च 35% तक कम हो जाता है!\n\n` +
        `आपके दोस्तों को एडवेंचर/ट्रेकिंग ज्यादा पसंद है या बीच और नाइटलाइफ?`;
    }

    return `🎉 **High-Energy, Adventure & Fun Trips Designed for Friends & Groups**\n\n` +
      `When traveling with a squad of friends, the best trips combine thrills, outdoor bonding, flexibility, and lively evening vibes! Here are the 4 top destinations:\n\n` +
      `1. **North Goa (Vagator, Anjuna & Morjim)**\n` +
      `   • **Group Highlights:** Renting a fleet of scooters, parasailing & jet skiing at Calangute/Baga, clifftop sunsets at Chapora Fort ("Dil Chahta Hai" vibes), and beach shack dining.\n` +
      `   • **Estimated Group Spend:** ₹5,000 – ₹8,000 per person for 3 days.\n\n` +
      `2. **Rishikesh (Uttarakhand — Adventure Capital)**\n` +
      `   • **Group Highlights:** 16 km white-water river rafting through Grade III/IV rapids, thrilling 30-ft cliff jumping, riverside swiss tents camping, and evening bonfires under starry skies.\n` +
      `   • **Estimated Group Spend:** ₹6,500 – ₹9,000 per person for 3 days.\n\n` +
      `3. **Kasol & Tosh / Kheerganga (Himachal Pradesh)**\n` +
      `   • **Group Highlights:** Parvati Valley treks, chill wooden mountain cafes, natural hot water springs of Kheerganga, and stargazing.\n` +
      `   • **Estimated Group Spend:** ₹7,000 – ₹10,500 per person for 4 days.\n\n` +
      `4. **Gokarna (Coastal Karnataka)**\n` +
      `   • **Group Highlights:** The famous 5-Beach Trek (Belekan to Kudle), playing beach volleyball on OM beach, and renting rustic beach huts.\n` +
      `   • **Estimated Group Spend:** ₹4,500 – ₹7,000 per person for 3 days.\n\n` +
      `💡 **Squad Advantage:** Booking 4-bed or 6-bed hostel dorm rooms (Zostel/The Hosteller) and splitting rental vehicles easily slashes costs by 30%–45% per traveler!\n\n` +
      `Do your friends prefer thrilling mountain adventures or relaxing beach vibes and music?`;
  }

  function getMakeCheaperResponse(destination, lang) {
    const dest = destination || 'Goa';

    if (dest.toLowerCase().includes('kerala')) {
      return `💰 **How to Cut Your Kerala Trip Costs by 40% to 60% (Actionable Budget Hacks)**\n\n` +
        `You can experience the absolute best of Kerala while keeping expenses remarkably low:\n\n` +
        `1. **Transport (Save ₹4,000–₹8,000):**\n` +
        `   • Avoid private taxis (₹2,500–₹3,500/day). Take **Indian Railways trains** between Kochi, Alleppey, and Trivandrum (Second Seating / Sleeper ₹50–₹180).\n` +
        `   • Ride state **KSRTC Fast Passenger buses** for scenic mountain journeys to Munnar (just ₹120–₹160 from Kochi).\n\n` +
        `2. **Backwater Alternative (Save ₹8,000–₹14,000):**\n` +
        `   • Private houseboats cost ₹8,000–₹18,000/night.\n` +
        `   • **Smart Move:** Board the **Government SWTD Public Water Ferry** from Alleppey to Kottayam (only **₹25 to ₹40** for 2.5 hours through the exact same backwater canals!) or split an hourly motorized Shikara boat (**₹600–₹800/hr** for 3–4 people).\n\n` +
        `3. **Homestays & Hostels (Save ₹2,000/night):**\n` +
        `   • Stay in registered family homestays or backpacker hostels (Zostel Kochi/Alleppey) for **₹700–₹1,200/night** with authentic homemade breakfast.\n\n` +
        `4. **Dining (Save ₹800/day):**\n` +
        `   • Relish traditional Kerala banana-leaf **Sadya / Vegetarian Thali** at Indian Coffee Houses and local Udupi restaurants for just **₹80–₹120**.\n\n` +
        `💵 **Adjusted Daily Budget:** **₹1,200 – ₹1,800 per person/day** (All-inclusive)!`;
    }

    // Default Goa / Generic
    return `💰 **How to Make Your ${dest} Trip Significantly Cheaper**\n\n` +
      `Here is a proven, highly effective strategy to slash your expenses by **40%–50%**:\n\n` +
      `1. **Transport Savings:**\n` +
      `   • Rent an Activa scooter for **₹350–₹450/day** instead of hiring cabs (which charge ₹1,500–₹2,500 per day).\n` +
      `   • Travel between cities via state buses or trains instead of private airport taxis.\n\n` +
      `2. **Accommodation Savings:**\n` +
      `   • Book boutique hostels (Zostel, The Hosteller) or local guesthouses for **₹600–₹1,100/night** instead of luxury beachside resorts (₹5,000+/night).\n\n` +
      `3. **Dining Smart:**\n` +
      `   • Eat where the locals eat! Coastal fish thalis, fresh local bakeries, and street eats cost **₹120–₹200/meal**, whereas beachfront luxury shacks charge ₹800–₹1,500.\n\n` +
      `4. **Free Attractions:**\n` +
      `   • Beaches, forts, scenic sunset clifftops, waterfalls, and heritage quarters are completely free to enjoy!\n\n` +
      `💵 **Adjusted Daily Spend:** Down to **₹1,300 – ₹1,900 per person/day**!`;
  }

  function getVagueTripClarification(lang) {
    if (lang === 'kn') {
      return `ಖಂಡಿತ! ನೀವು ಯಾವ ಸ್ಥಳದ ಬಗ್ಗೆ ಯೋಚಿಸುತ್ತಿದ್ದೀರಿ, ಅಥವಾ ನಿಮ್ಮ ಬಜೆಟ್‌ಗೆ ತಕ್ಕಂತೆ ಸುಂದರ ಸ್ಥಳಗಳನ್ನು ನಾನೇ ಸೂಚಿಸಬೇಕೇ? 😊\n\n` +
        `ಉದಾಹರಣೆಗೆ: ಗೋವಾ, ಕೇರಳ, ಮನಾಲೀ, ಕೂರ್ಗ್, ಅಥವಾ ಜೈಪುರ.`;
    }
    if (lang === 'kanglish') {
      return `Kanditha! Neevu yavudhadru specific destination nodtidira, athva naane best places suggest madla? 😊\n\n` +
        `Example: Goa, Kerala, Manali, Gokarna, athva Coorg.`;
    }
    if (lang === 'hi') {
      return `ज़रूर! आप किस जगह की यात्रा के बारे में सोच रहे हैं, या क्या आप चाहते हैं कि मैं कुछ बेहतरीन जगहें सुझाऊँ? 😊\n\n` +
        `जैसे: गोवा, मनाली, केरल, जयपुर, या ऋषिकेश।`;
    }
    if (lang === 'hinglish') {
      return `Sure! Aap kaunsi destination ke baare me soch rahe hain, ya kya aap chahte hain ki main kuch places suggest karun? 😊\n\n` +
        `Jaise: Goa, Kerala, Manali, Jaipur, ya Rishikesh.`;
    }
    return `Sure! Which destination are you thinking about, or would you like me to suggest some places? 😊\n\n` +
      `For example, let me know if you'd like beach vibes (Goa, Gokarna), tranquil hills (Manali, Ooty), backwaters (Kerala), or heritage palaces (Jaipur)!`;
  }

  function getWaterfallsBelagaviResponse(lang) {
    return `🌊 **Magnificent Waterfalls Near Belagavi, Karnataka**\n\n` +
      `Belagavi (Belgaum) is nestled along the lush Western Ghats, making it a gateway to some of South India's most spectacular waterfalls:\n\n` +
      `1. **Gokak Falls** *(~65 km from Belagavi)*\n` +
      `   • Known as the **"Niagara of Karnataka"**, where the Ghataprabha River plunges 52 meters (171 ft) over sandstone cliffs into a horseshoe gorge.\n` +
      `   • **Highlight:** Walk across the thrilling 201-meter historic hanging suspension bridge built in 1907.\n\n` +
      `2. **Godchinamalaki Falls** *(~55 km from Belagavi)*\n` +
      `   • A stunning two-tier cascade on the Markandeya River located in a peaceful, verdant valley near Gokak.\n` +
      `   • First drop of 25 meters followed by a second drop of 20 meters over stepped rock formations.\n\n` +
      `3. **Vajrapoha Falls** *(~60 km from Belagavi, near Jamboti)*\n` +
      `   • An offbeat, pristine 200-meter waterfall on the Mandovi River tucked inside the dense tropical evergreen forests of Jamboti.\n` +
      `   • Ideal for nature treks and adventure enthusiasts.\n\n` +
      `4. **Tillari Falls & Dam** *(~45 km from Belagavi)*\n` +
      `   • Situated on the Karnataka-Maharashtra border with misty viewpoints, deep valleys, and lush forested slopes.\n\n` +
      `5. **Dudhsagar Falls** *(~105 km via Castle Rock / Kulem)*\n` +
      `   • A world-renowned 4-tiered giant (310m tall) on the Karnataka-Goa border. Accessible via rail or jeep safari.\n\n` +
      `📅 **Best Time to Visit:** **July to November** (during and post-monsoon), when the rivers are in full flow.\n` +
      `💡 **Travel Tip:** Rent a private cab or self-drive vehicle from Belagavi, and wear sturdy footwear with good grip.`;
  }

  function getPythonProgramResponse() {
    return `🐍 **Python Programming & Algorithm Solution**\n\n` +
      `Here is a clean, modern Python program demonstrating functions, data structures, and formatted output:\n\n` +
      `\`\`\`python\n` +
      `# Practical Python Example: Word Frequency & Analytics Counter\n` +
      `from collections import Counter\n` +
      `import re\n\n` +
      `def analyze_text(text):\n` +
      `    # Normalize and extract words\n` +
      `    words = re.findall(r'\\b[a-z]+\\b', text.lower())\n` +
      `    total_words = len(words)\n` +
      `    unique_words = len(set(words))\n` +
      `    frequency = Counter(words)\n` +
      `    \n` +
      `    print(f"Total Words: {total_words}")\n` +
      `    print(f"Unique Words: {unique_words}")\n` +
      `    print("\\nTop 3 Most Frequent Words:")\n` +
      `    for word, count in frequency.most_common(3):\n` +
      `        print(f"  • '{word}': {count} occurrences")\n` +
      `        \n` +
      `    return frequency\n\n` +
      `# Test execution:\n` +
      `sample = "Artificial intelligence and machine learning empower intelligent software systems and AI agents."\n` +
      `analyze_text(sample)\n` +
      `\`\`\`\n\n` +
      `### Key Concepts Shown:\n` +
      `• \`re.findall\`: Regex tokenization.\n` +
      `• \`collections.Counter\`: Efficient hash-map based tallying ($O(n)$ time complexity).\n` +
      `• F-string interpolation for readable logging.`;
  }

  function getExplainAiResponse() {
    return `🤖 **Understanding Artificial Intelligence (AI)**\n\n` +
      `**Artificial Intelligence (AI)** refers to computer systems and software engineered to perform tasks that typically require human cognition—such as pattern recognition, visual perception, decision-making, and natural language understanding.\n\n` +
      `### Core Pillars of Modern AI:\n` +
      `1. **Machine Learning (ML):** Algorithms that improve automatically through experience and training data rather than rigid hardcoded instructions.\n` +
      `2. **Deep Learning (Neural Networks):** Multi-layered artificial networks inspired by the human brain that power computer vision, speech recognition, and modern Large Language Models (LLMs like ChatGPT and Gemini).\n` +
      `3. **Natural Language Processing (NLP):** Enables machines to interpret, converse, and generate human languages (powers chatbots like Wayvora AI!).\n` +
      `4. **Computer Vision:** Enables computers to process visual inputs from photos and video feeds.\n\n` +
      `### Real-World Applications:\n` +
      `• **Technology & Software:** Code completion, automated testing, conversational assistants.\n` +
      `• **Healthcare:** Accelerated drug discovery and medical imaging diagnostics.\n` +
      `• **Autonomous Vehicles:** Real-time navigation and obstacle detection.\n` +
      `• **Travel & Hospitality:** Automated itinerary curation, dynamic fare pricing, and personalized recommendations.\n\n` +
      `Would you like to explore how neural networks function or discuss how AI is utilized in specific industries?`;
  }

  function getWhoAreYouResponse(lang) {
    if (lang === 'kn') {
      return `ನಮಸ್ಕಾರ! 🙏 ನಾನು ನಿಮ್ಮ **Wayvora AI Assistant**.\n\n` +
        `ನಾನು ChatGPT ಯಂತೆಯೇ ಸರ್ವತೋಮುಖ ಬುದ್ಧಿಮತ್ತೆಯುಳ್ಳ AI ಸಹಾಯಕಿಯಾಗಿದ್ದೇನೆ. ನಾನು ಈ ಕೆಳಗಿನ ವಿಷಯಗಳಲ್ಲಿ ನಿಮಗೆ ನೆರವಾಗಬಲ್ಲೆ:\n\n` +
        `• 💻 **ಕಂಪ್ಯೂಟರ್ ಸೈನ್ಸ್ & ಪ್ರೋಗ್ರಾಮಿಂಗ್:** Python, JavaScript, Java, C++, SQL, HTML/CSS, React, ಡೇಟಾ ಸ್ಟ್ರಕ್ಚರ್ಸ್ ಮತ್ತು ಅಲ್ಗಾರಿದಮ್‌ಗಳು.\n` +
        `• 🛡️ **ಸೈಬರ್ ಸೆಕ್ಯುರಿಟಿ & ನೆಟ್‌ವರ್ಕಿಂಗ್:** OSI ಮಾದರಿ, TCP/IP, DNS, SSL/TLS, ಎನ್‌ಕ್ರಿಪ್ಶನ್ ಮತ್ತು ವೆಬ್ ಸೆಕ್ಯುರಿಟಿ.\n` +
        `• 🤖 **ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ (AI):** ಮೆಷಿನ್ ಲರ್ನಿಂಗ್, ಡೀಪ್ ಲರ್ನಿಂಗ್, ಟ್ರಾನ್ಸ್‌ಫಾರ್ಮರ್ಸ್ ಮತ್ತು ಕ್ಲೌಡ್ ತಂತ್ರಜ್ಞಾನ.\n` +
        `• 🌐 **ಭಾಷಾ ಅನುವಾದಗಳು:** ಇಂಗ್ಲಿಷ್, ಕನ್ನಡ (ಕನ್ನಡ) ಮತ್ತು ಹಿಂದಿ ಭಾಷಾಂತರ, ಶಬ್ದಾರ್ಥಗಳು ಮತ್ತು ವ್ಯಾಕರಣ.\n` +
        `• ✍️ **ಬರವಣಿಗೆ & ಸಾರಾಂಶ:** ವೃತ್ತಿಪರ ಇಮೇಲ್‌ಗಳು, ರಿಸೈನ್ ಪತ್ರ, ಕವರ್ ಲೆಟರ್, ರೆಸ್ಯೂಮ್ ಟಿಪ್ಸ್ ಮತ್ತು ಸಾರಾಂಶ.\n` +
        `• 📐 **ಗಣಿತ ಮತ್ತು ವಿಜ್ಞಾನ:** ಹಂತ-ಹಂತದ ಲೆಕ್ಕಾಚಾರಗಳು, ಬೀಜಗಣಿತ, ಭೌತಶಾಸ್ತ್ರ, ರಸಾಯನಶಾಸ್ತ್ರ ಮತ್ತು ಜೀವಶಾಸ್ತ್ರ.\n` +
        `• 🏖️ **ವಿಶ್ವಾದ್ಯಂತ ಪ್ರವಾಸ ಯೋಜನೆ:** ಗೋವಾ, ಕೇರಳ, ಕರ್ನಾಟಕ, ಭಾರತ ಮತ್ತು ವಿಶ್ವದ ಯಾವುದೇ ನಗರಗಳಿಗೆ ದಿನವಾರು ಪ್ರವಾಸ ಪ್ಲಾನ್ ಮತ್ತು ಬಜೆಟ್ ವಿವರಗಳು!\n\n` +
        `ಇಂದು ನೀವು ಯಾವ ವಿಷಯದ ಬಗ್ಗೆ ಚರ್ಚಿಸಲು ಅಥವಾ ಕಲಿಯಲು ಇಷ್ಟಪಡುತ್ತೀರಿ?`;
    }
    if (lang === 'hi' || lang === 'hinglish') {
      return `नमस्ते! 🙏 मैं आपका **Wayvora AI Assistant** हूँ।\n\n` +
        `मैं ChatGPT की तरह एक पूर्ण, बहुआयामी और बुद्धिमान AI सहायक हूँ। मैं इन सभी क्षेत्रों में आपकी सहायता कर सकता हूँ:\n\n` +
        `• 💻 **कंप्यूटर साइंस और कोडिंग:** Python, JavaScript, Java, C++, SQL, React, डेटा स्ट्रक्चर और एल्गोरिदम।\n` +
        `• 🛡️ **साइबर सिक्योरिटी और नेटवर्किंग:** OSI मॉडल, TCP/IP, DNS, फायरवॉल, एन्क्रिप्शन और वेब सुरक्षा।\n` +
        `• 🤖 **आर्टिफिशियल इंटेलिजेंस (AI):** मशीन लर्निंग, डीप लर्निंग, न्यूरल नेटवर्क और क्लाउड कंप्यूटिंग।\n` +
        `• 🌐 **भाषा अनुवाद और शब्दावली:** अंग्रेज़ी, हिंदी और कन्नड़ अनुवाद, शब्दों के सटीक अर्थ और व्याकरण।\n` +
        `• ✍️ **राइटिंग और सारांश:** प्रोफेशनल ईमेल्स, लीव एप्लीकेशन, रेज़्युमे टिप्स और सारांश निर्माण।\n` +
        `• 📐 **गणित और विज्ञान:** स्टेप-बाय-स्टेप गणितीय हल, फिजिक्स, केमिस्ट्री और बायोलॉजी।\n` +
        `• 🏖️ **ट्रैवल प्लानिंग और गाइड:** गोवा, केरल, भारत और दुनिया भर के लिए कस्टमाइज्ड डे-बाय-डे यात्रा योजनाएँ और बजट!\n\n` +
        `आज आप किस विषय पर बात करना या सीखना चाहते हैं?`;
    }
    return `Hello! 👋 I'm **Wayvora AI**, your versatile general-purpose AI assistant and intelligent travel concierge.\n\n` +
      `Just like ChatGPT, I can help you with virtually **any topic**:\n\n` +
      `• 💻 **Computer Science & Coding:** Python, JavaScript, TypeScript, Java, C++, SQL, React, Data Structures, Algorithms, Git, and Debugging.\n` +
      `• 🛡️ **Cybersecurity & Networking:** OSI 7-Layer Model, TCP/IP, DNS, SSL/TLS, Cryptography, Firewalls, DDoS, and Web Security.\n` +
      `• 🤖 **Artificial Intelligence & Tech:** Machine Learning, Deep Learning, Neural Networks, Transformers, LLMs, Cloud (AWS/GCP), and Docker.\n` +
      `• 🌐 **Languages & Translations:** English, Kannada (ಕನ್ನಡ), Hindi (हिंदी), Word Definitions, Pronunciation, Synonyms, and Grammar.\n` +
      `• ✍️ **Writing & Summarization:** Professional Leave & Business Emails, Cover Letters, Resumes, Text Summarization, and Tone Refinement.\n` +
      `• 📐 **Mathematics & Science:** Step-by-Step Problem Solving, Algebra, Calculus, Newton's Laws, Chemistry, and Biology.\n` +
      `• 🎯 **Career & Interview Prep:** Technical Coding Roadmaps, Behavioral STAR Method, and Resume Optimization.\n` +
      `• 🏖️ **Worldwide Travel Planning:** Custom Day-by-Day Itineraries, Budget Estimates in ₹ INR, Live Weather Telemetry, and Regional Dining.\n\n` +
      `What would you like to explore or work on today?`;
  }

  // -------------------------------------------------------------
  // 6. MASTER CONVERSATION PROCESSOR
  // -------------------------------------------------------------
  async function processConversation(messages, liveWeatherFetcher) {
    if (!Array.isArray(messages) || messages.length === 0) {
      return getWhoAreYouResponse('en');
    }

    const lastUserMsg = messages.filter(m => m.role === 'user').pop();
    if (!lastUserMsg) return getWhoAreYouResponse('en');

    const query = lastUserMsg.content.trim();
    const context = extractContext(messages);
    const intent = parseIntent(query, context);
    const lang = context.language || 'en';

    // 1. General Greetings & Identity
    if (intent.type === 'greeting') {
      if (lang === 'kn') return `ನಮಸ್ಕಾರ! 🙏 ನಾನು Wayvora AI ಅಸಿಸ್ಟೆಂಟ್. ನಾನು ನಿಮಗೆ ಕೋಡಿಂಗ್, ವಿಜ್ಞಾನ, ಭಾಷಾಂತರ ಅಥವಾ ಪ್ರವಾಸ ಯೋಜನೆಯಲ್ಲಿ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?`;
      if (lang === 'kanglish') return `Namaskara! 🙏 Naanu nimma Wayvora AI Assistant. Coding, science, translations athva travel plan ge hege help madli?`;
      if (lang === 'hi') return `नमस्ते! 🙏 मैं आपका Wayvora AI साथी हूँ। मैं कोडिंग, साइंस, भाषा अनुवाद या ट्रैवल में आपकी क्या मदद करूँ?`;
      if (lang === 'hinglish') return `Hello! 🙏 Main aapka Wayvora AI Assistant hun. Coding, general knowledge, translation ya travel planning me main aapki kya madad karun?`;
      return `Hello! 👋 I'm **Wayvora AI**, your versatile conversational assistant. Whether you need coding help, translations, math solutions, writing assistance, or custom travel plans—how can I help you today?`;
    }

    if (intent.type === 'who_are_you') {
      return getWhoAreYouResponse(lang);
    }

    // Specific Kannada Translation & Word Meaning
    if (intent.type === 'kannada_query') {
      return getKannadaTranslationOrMeaning(query);
    }

    // Featured Travel Inquiries
    if (intent.type === 'india_3day_trip') {
      return getIndia3DayTripResponse(lang);
    }
    if (intent.type === 'goa_places_to_visit') {
      return getGoaPlacesToVisitResponse(lang);
    }
    if (intent.type === 'best_destinations_india') {
      return getBestDestinationsIndiaResponse();
    }
    if (intent.type === 'budget_international_trips') {
      return getBudgetInternationalTripsResponse();
    }
    if (intent.type === 'estimate_travel_budget') {
      return getEstimateTravelBudgetResponse();
    }
    if (intent.type === 'bali_best_time') {
      return getBaliBestTimeResponse();
    }

    // 2. Computer Science & Programming
    if (intent.type === 'computer_science') {
      return getComputerScienceResponse(query, lang);
    }

    // 3. Cybersecurity & Networking
    if (intent.type === 'cybersecurity_networking') {
      return getCybersecurityNetworkingResponse(query, lang);
    }

    // 4. Artificial Intelligence & Technology
    if (intent.type === 'ai_technology') {
      return getAiTechnologyResponse(query, lang);
    }

    // 5. English Vocabulary, Word Meanings & Grammar
    if (intent.type === 'vocabulary_grammar') {
      return getVocabularyGrammarResponse(query, lang);
    }

    // 6. Multilingual Translation (Kannada, Hindi, English, etc.)
    if (intent.type === 'translation') {
      return getTranslationResponse(query, lang);
    }

    // 7. Writing, Rewriting & Summarization
    if (intent.type === 'writing_summarization') {
      return getWritingSummarizationResponse(query, lang);
    }

    // 8. Mathematics & Science
    if (intent.type === 'math_science') {
      return getMathScienceResponse(query, lang);
    }

    // 9. Career Guidance & Interview Preparation
    if (intent.type === 'career_interview') {
      return getCareerInterviewResponse(query, lang);
    }

    // 10. General Knowledge & Everyday Inquiries
    if (intent.type === 'general_knowledge') {
      return getGeneralKnowledgeResponse(query, lang);
    }

    // 11. Currency Conversion
    if (intent.type === 'currency_conversion') {
      return `💱 **Wayvora Worldwide Currency Conversion & Travel Estimates**\n\n` +
        `Here are current benchmark exchange rates for top travel destinations:\n\n` +
        `• **1 USD ($)** ≈ **₹86.50 INR** | **€0.92 EUR** | **£0.79 GBP** | **¥153 JPY** | **1.52 AUD** | **3.67 AED**\n` +
        `• **1 EUR (€)** ≈ **₹94.02 INR** | **$1.087 USD** | **£0.859 GBP** | **¥166.3 JPY**\n` +
        `• **1 GBP (£)** ≈ **₹109.50 INR** | **$1.266 USD** | **€1.165 EUR**\n\n` +
        `💡 You can switch the active display currency anytime using the **Currency Selector** dropdown in the top navigation bar!`;
    }

    // 12. Weather Intent (Live Telemetry via Open-Meteo)
    if (intent.type === 'weather') {
      if (typeof liveWeatherFetcher === 'function') {
        const live = await liveWeatherFetcher(intent.target);
        if (live) {
          return `🌤️ **Live Weather Telemetry for ${live.place}**\n\n` +
            `• **Current Temperature:** **${live.tempC}°C** (${live.tempF}°F)\n` +
            `• **Condition:** ${live.condition}\n` +
            `• **Relative Humidity:** ${live.humidity}%\n` +
            `• **Wind Speed:** ${live.wind} km/h\n` +
            `• **Today's Expected Range:** Low ${live.low}°C / High ${live.high}°C\n\n` +
            `💡 *Weather Insight:* ${live.tempC > 28 ? 'Warm and sunny—wear light breathable clothing and stay well-hydrated!' : (live.tempC < 15 ? 'Chilly weather—carry warm layers and jackets!' : 'Pleasant and comfortable for outdoor activities and sightseeing!')}\n\n` +
            `*(Verified live data via Open-Meteo API)*`;
        }
      }
      return `For **${intent.target}**, you can also check instant real-time satellite forecasts anytime using the **☀️ Live Weather** button in the top navigation bar!`;
    }

    // 13. Travel: Make Cheaper / Budget Reduction
    if (intent.type === 'make_cheaper') {
      return getMakeCheaperResponse(intent.destination, lang);
    }

    // 14. Travel: Snow / Cold places
    if (intent.type === 'snow_cold_places') {
      return getSnowColdPlacesResponse(lang);
    }

    // 15. Travel: Family cheap trip
    if (intent.type === 'family_cheap_trip') {
      return getFamilyCheapTripResponse(lang);
    }

    // 16. Travel: Friends trip
    if (intent.type === 'friends_trip') {
      return getFriendsTripResponse(lang);
    }

    // 17. Travel: Specific budget constraint (e.g. 10000 rupees)
    if (intent.type === 'budget_destinations') {
      return getBudget10kResponse(lang);
    }

    // 18. Travel: Waterfalls near Belagavi
    if (intent.type === 'waterfalls_belagavi') {
      return getWaterfallsBelagaviResponse(lang);
    }

    // 19. Travel: Duration follow-up (e.g. "4 days" when Kerala was active)
    if (intent.type === 'duration_followup') {
      const dest = intent.destination || 'Goa';
      if (dest.toLowerCase().includes('goa')) return getGoaItinerary(intent.days, lang);
      if (dest.toLowerCase().includes('kerala')) return getKeralaItinerary(intent.days, lang);
      return `Awesome! A **${intent.days}-day trip to ${dest}** is a fantastic duration.\n\n` +
        `Would you like a day-by-day itinerary with sightseeing and hotels, or a realistic cost breakdown in ₹ INR?`;
    }

    // 20. Travel: Concrete Destination Itinerary
    if (intent.type === 'destination_itinerary') {
      const dest = intent.destination || 'Goa';
      if (dest.toLowerCase().includes('goa')) return getGoaItinerary(intent.days, lang);
      if (dest.toLowerCase().includes('kerala')) return getKeralaItinerary(intent.days, lang);
      return `Great choice! Planning a **${intent.days || 3}-day trip to ${dest}**.\n\n` +
        `• **Highlights:** Top landmarks, cultural spots, and scenic viewpoints.\n` +
        `• **Budget Tip:** Booking local transport and homestays saves 30%–40%.\n\n` +
        `Would you like an itemized daily schedule or food recommendations for ${dest}?`;
    }

    // 21. Travel: Vague Trip Planning
    if (intent.type === 'vague_trip_plan') {
      if (intent.days) {
        return `Great! For a ${intent.days}-day trip, which kind of destination do you have in mind? 😊\n\n` +
          `• **Beaches & Coastal Chill:** Goa or Gokarna\n` +
          `• **Snow & Mountain Escapes:** Manali, Shimla, or Kashmir\n` +
          `• **Royal Palaces & Culture:** Jaipur or Udaipur\n` +
          `• **Tranquil Backwaters & Tea Hills:** Munnar or Kerala\n\n` +
          `Let me know what matches your mood or budget, and I'll curate the full day-by-day itinerary for you!`;
      }
      return getVagueTripClarification(lang);
    }

    // 22. Travel: Food / Cuisine follow-up
    if (intent.type === 'food_followup') {
      const dest = intent.destination || 'Goa';
      if (dest.toLowerCase().includes('goa')) {
        return `🍲 **Iconic Goan Cuisine to Savor in ${dest}:**\n\n` +
          `• **Goan Fish Curry with Steamed Rice:** The soul of Goan dining, infused with coconut milk and tangy kokum.\n` +
          `• **Prawn Balchão:** Spicy, fiery pickled prawns cooked in coconut vinegar and red chilies.\n` +
          `• **Pork/Chicken Vindaloo:** World-famous Goan-Portuguese delicacy.\n` +
          `• **Poee (Traditional Goan Bread):** Freshly baked crusty whole wheat pocket bread.\n` +
          `• **Bebinca:** Legendary 7-layer Goan coconut egg dessert baked over wood fires.\n\n` +
          `💡 *Budget Tip:* Authentic roadside local eateries in Panaji or Mapusa charge just **₹120–₹180** for a full Goan Fish Thali!`;
      }
      if (dest.toLowerCase().includes('kerala')) {
        return `🍲 **Must-Try Authentic Kerala Delicacies in ${dest}:**\n\n` +
          `• **Kerala Sadya:** Grand vegetarian feast served on a banana leaf with over 20 dishes (Avial, Sambar, Thoran, Payasam).\n` +
          `• **Appam with Vegetable / Chicken Stew:** Soft, lacy fermented rice pancakes with fragrant coconut milk stew.\n` +
          `• **Karimeen Pollichathu:** Fresh backwater pearl spot fish marinated in shallots and wrapped in charred banana leaves.\n` +
          `• **Malabar Parotta & Beef/Chicken Curry:** Flaky layered flatbread with aromatic spices.\n\n` +
          `💡 *Budget Tip:* You can enjoy a generous traditional Sadya at local Indian Coffee Houses for only **₹80–₹120**!`;
      }
      return `🍲 In **${dest}**, be sure to explore authentic street food markets and heritage cafes to experience true regional flavors at reasonable prices!`;
    }

    // 23. Travel: Transport follow-up
    if (intent.type === 'transport_followup') {
      const dest = intent.destination || 'Goa';
      return `✈️ **How to Reach ${dest} Efficiently:**\n\n` +
        `• **By Air:** Direct flights connect to major domestic and international carriers.\n` +
        `• **By Rail:** Regular express and superfast trains connect all major railway stations.\n` +
        `• **By Road:** Government state buses (KSRTC, Kadamba, MSRTC) operate daily sleeper and AC services.\n\n` +
        `Once you arrive, renting a scooter or self-drive vehicle is the most flexible and economical way to explore!`;
    }

    // 24. Default General Conversational Exploration
    return getDynamicExplorationResponse(query, lang);
  }

  // -------------------------------------------------------------
  // EXPORTS
  // -------------------------------------------------------------
  return {
    detectLanguage,
    extractContext,
    parseIntent,
    processConversation,
    getComputerScienceResponse,
    getCybersecurityNetworkingResponse,
    getAiTechnologyResponse,
    getVocabularyGrammarResponse,
    getTranslationResponse,
    getWritingSummarizationResponse,
    getMathScienceResponse,
    getCareerInterviewResponse,
    getGeneralKnowledgeResponse,
    getDynamicExplorationResponse,
    getGoaItinerary,
    getKeralaItinerary,
    getFamilyCheapTripResponse,
    getBudget10kResponse,
    getSnowColdPlacesResponse,
    getFriendsTripResponse,
    getMakeCheaperResponse,
    getVagueTripClarification,
    getKannadaTranslationOrMeaning,
    getWhatIsCybersecurityResponse,
    getIndia3DayTripResponse,
    getGoaPlacesToVisitResponse,
    getBestDestinationsIndiaResponse,
    getBudgetInternationalTripsResponse,
    getEstimateTravelBudgetResponse,
    getBaliBestTimeResponse
  };
});
