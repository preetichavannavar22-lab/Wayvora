/**
 * Wayvora - India Travel Dataset
 * Comprehensive catalog of all 28 States, 8 Union Territories, 
 * 16 Popular Cities, and 12 Iconic Tourist Places.
 * Includes precise coordinates for real-time Open-Meteo weather forecasts.
 */

const INDIA_DESTINATIONS = [
  // ==========================================
  // STATES OF INDIA (28 STATES)
  // ==========================================
  {
    id: "in-state-andhra-pradesh",
    name: "Andhra Pradesh",
    category: "state",
    categoryLabel: "State",
    zone: "South",
    image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Sun-drenched Coromandel coastline, the sacred hills of Tirumala, and rich architectural heritage.",
    fullOverview: "Andhra Pradesh boasts an extensive coastline along the Bay of Bengal, revered pilgrimage centers including Tirupati Balaji, the verdant Araku Valley, and historic Buddhist monuments at Amaravati.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 17.6868, lon: 83.2185, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Tirumala Venkateswara Temple", description: "World-renowned hill shrine attracting millions of pilgrims annually.", duration: "Half Day", image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80" },
      { name: "Araku Valley", description: "Scenic hill station famous for coffee plantations and tribal culture.", duration: "Full Day", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80" },
      { name: "Borra Caves", description: "Million-year-old limestone caves featuring striking stalactites and stalagmites.", duration: "2 - 3 Hours", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Pre-book Tirupati darshan tickets well in advance", "Sample spicy Andhra coastal curries and Gongura pachadi", "Visit Araku during the winter harvest season"],
    tags: ["Pilgrimage", "Coastline", "Hills", "Cuisine"]
  },
  {
    id: "in-state-arunachal-pradesh",
    name: "Arunachal Pradesh",
    category: "state",
    categoryLabel: "State",
    zone: "North-East",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    shortDescription: "The Land of Dawn-lit Mountains, home to ancient Buddhist monasteries and snow-clad Himalayan passes.",
    fullOverview: "Nestled in the eastern Himalayas, Arunachal Pradesh is a biodiversity haven characterized by pristine valleys, rugged passes like Sela Pass, and the revered 400-year-old Tawang Monastery.",
    bestTimeToVisit: "October to April",
    coordinates: { lat: 27.5861, lon: 91.8594, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Tawang Monastery", description: "India's largest monastery perched high above the Tawang Chu valley.", duration: "Half Day", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80" },
      { name: "Sela Pass", description: "Breathtaking high-altitude pass at 13,700 ft with frozen lakes.", duration: "2 - 3 Hours", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80" },
      { name: "Ziro Valley", description: "Picturesque UNESCO tentative valley known for the Apatani tribe and music festivals.", duration: "Full Day", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Inner Line Permit (ILP) is mandatory for domestic visitors; PAP for foreign tourists", "Carry warm thermal wear even in spring", "Hire high-clearance 4WD vehicles for mountain roads"],
    tags: ["Himalayas", "Monasteries", "Tribal Culture", "Adventure"]
  },
  {
    id: "in-state-assam",
    name: "Assam",
    category: "state",
    categoryLabel: "State",
    zone: "North-East",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Lush rolling tea estates, the mighty Brahmaputra river, and one-horned rhinos in Kaziranga.",
    fullOverview: "Assam is the gateway to Northeast India, famous for world-renowned Assam black tea, golden Muga silk, the UNESCO World Heritage Kaziranga National Park, and the ancient Kamakhya Temple.",
    bestTimeToVisit: "November to May",
    coordinates: { lat: 26.1445, lon: 91.7362, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Kaziranga National Park", description: "Sanctuary for two-thirds of the world's great one-horned rhinoceroses.", duration: "Full Day", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80" },
      { name: "Kamakhya Temple", description: "One of the oldest and most revered Shakti Peethas perched on Nilachal Hill.", duration: "2 - 3 Hours", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" },
      { name: "Majuli Island", description: "The world's largest river island, known for neo-Vaishnavite Satras.", duration: "Full Day", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Book early morning elephant safari in Kaziranga for rhino sightings", "Visit tea factory tasting rooms in Jorhat", "Respect local temple dress codes"],
    tags: ["Wildlife", "Tea Gardens", "Brahmaputra", "Heritage"]
  },
  {
    id: "in-state-bihar",
    name: "Bihar",
    category: "state",
    categoryLabel: "State",
    zone: "East",
    image: "https://images.unsplash.com/photo-1663026334663-5026b4f43ac6?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Cradle of Buddhism and Jainism, featuring sacred Bodh Gaya and ancient ruins of Nalanda.",
    fullOverview: "Bihar is one of India's richest historical epicenters. It is where Siddhartha Gautama attained enlightenment beneath the Bodhi tree in Bodh Gaya, and where Nalanda University enlightened scholars of antiquity.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 24.6961, lon: 84.9869, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Mahabodhi Temple", description: "UNESCO World Heritage site marking the spot of Gautama Buddha's enlightenment.", duration: "Half Day", image: "https://images.unsplash.com/photo-1609137144820-2228f41656fd?auto=format&fit=crop&w=600&q=80" },
      { name: "Nalanda University Ruins", description: "5th-century monastic university ruins that attracted scholars from across Asia.", duration: "3 - 4 Hours", image: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=600&q=80" },
      { name: "Rajgir Ropeway & Peace Pagoda", description: "Vishwa Shanti Stupa atop Ratnagiri Hill accessed by scenic chairlift.", duration: "2 - 3 Hours", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Spend quiet contemplative time in the Bodhi tree meditation grounds", "Try traditional Bihari Litti Chokha", "Visit during the winter monastic festivals"],
    tags: ["Buddhism", "History", "Pilgrimage", "Heritage"]
  },
  {
    id: "in-state-chhattisgarh",
    name: "Chhattisgarh",
    category: "state",
    categoryLabel: "State",
    zone: "Central",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    shortDescription: "The 'Niagara of India' at Chitrakote Falls, dense sal forests, and indigenous tribal craftsmanship.",
    fullOverview: "Chhattisgarh is an eco-tourism gem of Central India. Famous for the roaring horseshoe-shaped Chitrakote waterfall, ancient brick temples at Sirpur, and Bell Metal (Dhokra) art.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 19.2057, lon: 81.7042, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Chitrakote Waterfalls", description: "Broadest waterfall in India on the Indravati river, stunning during monsoon and winter.", duration: "Half Day", image: "https://images.unsplash.com/photo-1598890777032-bde13fba5be3?auto=format&fit=crop&w=600&q=80" },
      { name: "Kanger Valley National Park", description: "Dense jungle with subterranean limestone caves (Kotumsar) and Tirathgarh falls.", duration: "Full Day", image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80" },
      { name: "Sirpur Heritage Complex", description: "7th-century brick Laxman Temple and Buddhist monastery excavations.", duration: "3 - 4 Hours", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Buy authentic Dhokra bell-metal artifacts directly from artisan cooperatives in Bastar", "Visit during the 75-day Bastar Dussehra carnival", "Hire local guides for cavern explorations"],
    tags: ["Waterfalls", "Forests", "Tribal Art", "Eco-Tourism"]
  },
  {
    id: "in-state-goa",
    name: "Goa",
    category: "state",
    categoryLabel: "State",
    zone: "West",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Golden tropical beaches, vibrant Portuguese colonial architecture, and serene coastal sunsets.",
    fullOverview: "India's premier coastal retreat offers sun-drenched Arabian Sea shores, Portuguese heritage churches, lively beach shacks, spice plantations, and fresh seafood.",
    bestTimeToVisit: "November to March",
    coordinates: { lat: 15.4909, lon: 73.8278, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Basilica of Bom Jesus", description: "UNESCO World Heritage site holding the mortal remains of St. Francis Xavier.", duration: "1 - 2 Hours", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80" },
      { name: "Dudhsagar Falls", description: "Majestic four-tiered white waterfall deep in Bhagwan Mahaveer Sanctuary.", duration: "Half Day", image: "https://images.unsplash.com/photo-1598890777032-bde13fba5be3?auto=format&fit=crop&w=600&q=80" },
      { name: "Palolem & Anjuna Beaches", description: "From tranquil crescent bays in South Goa to vibrant flea markets in North Goa.", duration: "Full Day", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Rent a scooter to explore coastal roads at your own pace", "Enjoy authentic Goan fish curry with poi bread", "Visit Fontainhas Latin Quarter in Panaji for photos"],
    tags: ["Beaches", "Portuguese Architecture", "Nightlife", "Seafood"]
  },
  {
    id: "in-state-gujarat",
    name: "Gujarat",
    category: "state",
    categoryLabel: "State",
    zone: "West",
    image: "https://images.unsplash.com/photo-1678038737507-91ac7e9f7843?auto=format&fit=crop&w=800&q=80",
    shortDescription: "The white salt desert of the Rann of Kutch, Asiatic lions in Gir, and world's tallest Statue of Unity.",
    fullOverview: "Gujarat is a land of vibrant traditions, featuring the world-famous Rann Utsav on the white desert, the sacred Dwarkadhish temple, Mahatma Gandhi's Sabarmati Ashram, and the 182m Statue of Unity.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 23.2156, lon: 72.6369, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "White Rann of Kutch", description: "Vast dazzling salt marsh glowing under full-moon nights during Rann Utsav.", duration: "Full Day", image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80" },
      { name: "Statue of Unity", description: "World's tallest statue (182 meters) dedicated to Sardar Vallabhbhai Patel.", duration: "Half Day", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" },
      { name: "Gir National Park", description: "The sole global natural habitat of the endangered Asiatic Lion.", duration: "Half Day", image: "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Book tent city accommodations early for Rann Utsav", "Savor Gujarati thali with dhokla and jalebi fafda", "Pre-book Gir jeep safari permits online"],
    tags: ["White Desert", "Wildlife", "Heritage", "Festivals"]
  },
  {
    id: "in-state-haryana",
    name: "Haryana",
    category: "state",
    categoryLabel: "State",
    zone: "North",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Historic battlefield of Kurukshetra, the Sultanpur bird sanctuary, and modern skyscraper hubs.",
    fullOverview: "Haryana marries epic history—the setting of the Mahabharata and Panipat battles—with modern innovation in Gurugram, alongside the lush gardens of Pinjore and Sultanpur bird reserve.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 28.4595, lon: 77.0266, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Brahma Sarovar & Kurukshetra", description: "Vast ancient water tank and pilgrimage center from Mahabharata lore.", duration: "Half Day", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80" },
      { name: "Yadavindra Gardens, Pinjore", description: "17th-century terraced Mughal gardens with cascading fountains and pavilions.", duration: "2 - 3 Hours", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" },
      { name: "Sultanpur National Park", description: "Winter bird sanctuary hosting migratory birds from Europe and Siberia.", duration: "3 - 4 Hours", image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Bring binoculars for winter birdwatching at Sultanpur", "Try authentic Haryanvi bajra khichdi with white butter", "Explore modern Gurugram's craft breweries and CyberHub"],
    tags: ["History", "Bird Sanctuary", "Gardens", "Modern Hub"]
  },
  {
    id: "in-state-himachal-pradesh",
    name: "Himachal Pradesh",
    category: "state",
    categoryLabel: "State",
    zone: "North",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Snow-covered peaks, apple orchards of Shimla, paragliding in Bir Billing, and Tibetan vibes in Dharamshala.",
    fullOverview: "Known as the Land of Gods (Devbhumi), Himachal Pradesh is crowned with towering Himalayan ranges, alpine rivers like Beas, the Dalai Lama's home in McLeod Ganj, and dramatic valleys like Spiti.",
    bestTimeToVisit: "March to June & Sept to Dec",
    coordinates: { lat: 31.1048, lon: 77.1734, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Shimla Mall Road & Ridge", description: "Colonial summer capital featuring Christ Church and panoramic mountain views.", duration: "Half Day", image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80" },
      { name: "Manali & Solang Valley", description: "Adventure paradise with skiing, zorbing, and access to Rohtang Pass.", duration: "Full Day", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80" },
      { name: "Dharamshala & McLeod Ganj", description: "Tibetan spiritual epicenter, Tsuglagkhang complex, and Bhagsu waterfalls.", duration: "Full Day", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Carry mountain sickness tablets if ascending through Atal Tunnel to high altitudes", "Taste traditional Himachali Siddu with ghee", "Book world-class paragliding tandem flights in Bir Billing"],
    tags: ["Himalayas", "Snow", "Adventure", "Tibetan Culture"]
  },
  {
    id: "in-state-jharkhand",
    name: "Jharkhand",
    category: "state",
    categoryLabel: "State",
    zone: "East",
    image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80",
    shortDescription: "The Land of Forests, cascading Hundru and Jonha waterfalls, and spiritual Parasnath hills.",
    fullOverview: "Jharkhand is endowed with mineral wealth, lush forests, striking waterfalls around Ranchi, the sacred Jain shrine Shikharji atop Parasnath Hill, and Betla National Park.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 23.3441, lon: 85.3096, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Hundru & Dassam Falls", description: "Spectacular rocky waterfalls cascading from the Subarnarekha river.", duration: "Half Day", image: "https://images.unsplash.com/photo-1598890777032-bde13fba5be3?auto=format&fit=crop&w=600&q=80" },
      { name: "Shikharji (Parasnath Hill)", description: "Highest peak in Jharkhand and the most revered Jain pilgrimage tirth.", duration: "Full Day", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80" },
      { name: "Betla National Park", description: "Rich biodiversity sanctuary home to tigers, elephants, and historic Chero forts.", duration: "Full Day", image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Pack comfortable hiking boots for waterfall treks", "Try traditional Dhuska with ghugni", "Travel between October and February for pleasant weather"],
    tags: ["Waterfalls", "Forests", "Pilgrimage", "Trekking"]
  },
  {
    id: "in-state-karnataka",
    name: "Karnataka",
    category: "state",
    categoryLabel: "State",
    zone: "South",
    image: "https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Ancient Vijayanagara ruins of Hampi, royal Mysore Palace, coffee-rich Coorg hills, and Silicon Valley Bengaluru.",
    fullOverview: "Karnataka seamlessly blends grand empires and technological brilliance. Discover the boulder-strewn UNESCO ruins of Hampi, the dazzling illuminated palace of Mysore, misty Western Ghats coffee estates, and Gokarna's serene beaches.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 12.9716, lon: 77.5946, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Hampi Monument Group", description: "UNESCO World Heritage site with boulder-strewn ruins of the 14th-century Vijayanagara Empire.", duration: "1 - 2 Days", image: "https://images.unsplash.com/photo-1631983097767-099c77bf880d?auto=format&fit=crop&w=600&q=80" },
      { name: "Mysore Palace", description: "Indo-Saracenic royal residence glowing with 100,000 light bulbs on Sunday evenings.", duration: "Half Day", image: "https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=600&q=80" },
      { name: "Coorg (Kodagu)", description: "Scotland of India with rolling coffee estates, spice gardens, and Abbey Falls.", duration: "1 - 2 Days", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Rent a bicycle to explore the vast ruins of Hampi", "Witness Sunday night illuminations at Mysore Palace", "Taste authentic Mysore Masala Dosa and filter coffee"],
    tags: ["Heritage", "Palaces", "Coffee Hills", "Tech Hub"]
  },
  {
    id: "in-state-kerala",
    name: "Kerala",
    category: "state",
    categoryLabel: "State",
    zone: "South",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
    shortDescription: "God's Own Country, serene emerald backwaters, rolling Munnar tea terraces, and Ayurvedic rejuvenation.",
    fullOverview: "Flanked by the Arabian Sea and the Western Ghats, Kerala is famed for serene houseboat cruises through Alleppey backwaters, misty Munnar tea hills, Kathakali dance theatre, and historic Fort Kochi.",
    bestTimeToVisit: "September to March",
    coordinates: { lat: 9.9312, lon: 76.2673, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Alleppey Backwaters", description: "Drift in traditional thatched Kettuvallam houseboats through serene canals.", duration: "1 - 2 Days", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80" },
      { name: "Munnar Tea Hills", description: "Expansive high-altitude tea plantations, Eravikulam National Park, and Anamudi peak.", duration: "1 - 2 Days", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80" },
      { name: "Fort Kochi & Chinese Nets", description: "Atmospheric seaside town with historic synagogue, spice markets, and cantilevered nets.", duration: "Half Day", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Book an overnight houseboat cruise with freshly cooked Kerala sadhya", "Experience traditional Ayurvedic herbal rejuvenation massage", "Catch a live Kathakali or Kalaripayattu performance"],
    tags: ["Backwaters", "Tea Hills", "Ayurveda", "Beaches"]
  },
  {
    id: "in-state-madhya-pradesh",
    name: "Madhya Pradesh",
    category: "state",
    categoryLabel: "State",
    zone: "Central",
    image: "https://images.unsplash.com/photo-1587019158091-1a103c5dd17f?auto=format&fit=crop&w=800&q=80",
    shortDescription: "The Heart of India, erotic Khajuraho temples, ancient Sanchi Stupa, and dense tiger reserves of Bandhavgarh.",
    fullOverview: "Madhya Pradesh contains India's highest tiger population across Bandhavgarh and Kanha, magnificent UNESCO-listed Khajuraho temples, the Buddhist Stupa of Sanchi, and the marble rocks of Bhedaghat.",
    bestTimeToVisit: "October to April",
    coordinates: { lat: 23.2599, lon: 77.4126, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Khajuraho Group of Monuments", description: "UNESCO marvel of intricate medieval sandstone temples depicting life and spirituality.", duration: "1 Day", image: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=600&q=80" },
      { name: "Bandhavgarh & Kanha Tiger Reserves", description: "World's top safari sanctuaries for spotting royal Bengal tigers in the wild.", duration: "2 Days", image: "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=600&q=80" },
      { name: "Sanchi Great Stupa", description: "Commissioned by Emperor Ashoka in 3rd century BCE, the oldest stone structure in India.", duration: "Half Day", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Book national park safari permits 90 days in advance", "Take an evening boat ride through the illuminated Marble Rocks at Bhedaghat", "Sample Indore's legendary Sarafa Bazaar midnight street food"],
    tags: ["Tigers", "UNESCO Heritage", "Temples", "Wild Safari"]
  },
  {
    id: "in-state-maharashtra",
    name: "Maharashtra",
    category: "state",
    categoryLabel: "State",
    zone: "West",
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Financial heartbeat Mumbai, ancient rock-cut Ajanta & Ellora caves, and misty Sahyadri hill forts.",
    fullOverview: "Maharashtra combines the electric cosmopolitan energy of Mumbai, the ancient rock-cut masterworks of Ajanta and Ellora, Shivaji Maharaj's hilltop forts, and lush Sahyadri hill stations like Lonavala and Mahabaleshwar.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 19.0760, lon: 72.8777, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Gateway of India & Marine Drive", description: "Iconic Mumbai seaside monument and Queen's Necklace coastline promenade.", duration: "Half Day", image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80" },
      { name: "Ajanta & Ellora Caves", description: "UNESCO rock-hewn wonders including the monolithic Kailasa Temple, carved from a single cliff.", duration: "1 - 2 Days", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" },
      { name: "Sahyadri Forts & Lonavala", description: "Trek historic mountain bastions like Rajmachi, Sinhagad, and Lohagad amidst lush clouds.", duration: "Full Day", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Take the morning boat from Gateway of India to Elephanta Island", "Eat hot Vada Pav, Misal Pav, and Puran Poli", "Visit during Ganesh Chaturthi to experience unmatched festive fervor"],
    tags: ["Metropolis", "Rock Caves", "Hill Forts", "Coastline"]
  },
  {
    id: "in-state-manipur",
    name: "Manipur",
    category: "state",
    categoryLabel: "State",
    zone: "North-East",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    shortDescription: "The Jewel of India, world's only floating national park on Loktak Lake, and classical Manipuri Raas Leela.",
    fullOverview: "Manipur is celebrated for its natural splendor, the unique floating phumdis (vegetation islands) of Loktak Lake, the endangered Sangai brow-antlered deer, and the all-women-run market Ima Keithel.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 24.8170, lon: 93.9368, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Loktak Lake & Sendra Island", description: "Largest freshwater lake in Northeast India with circular floating phumdi masses.", duration: "Full Day", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80" },
      { name: "Keibul Lamjao National Park", description: "The world's only floating national park, sanctuary to the dancing Sangai deer.", duration: "Half Day", image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80" },
      { name: "Ima Keithel (Mother's Market)", description: "500-year-old historic bazaar operated solely by thousands of women traders.", duration: "2 - 3 Hours", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Stay at an eco-resort on Sendra Island overlooking Loktak Lake", "Purchase handwoven Manipuri shawls at Ima Keithel", "Attend the colorful Sangai Festival in late November"],
    tags: ["Floating Lake", "Wildlife", "Handlooms", "Culture"]
  },
  {
    id: "in-state-meghalaya",
    name: "Meghalaya",
    category: "state",
    categoryLabel: "State",
    zone: "North-East",
    image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80",
    shortDescription: "The Abode of Clouds, bio-engineered living root bridges, and crystal-clear waters of the Umngot River.",
    fullOverview: "Meghalaya boasts Cherrapunji and Mawsynram (the wettest places on earth), jaw-dropping plunge waterfalls like Nohkalikai, ancient Khasi living root bridges bio-engineered from rubber trees, and transparent river boating at Dawki.",
    bestTimeToVisit: "October to April",
    coordinates: { lat: 25.5788, lon: 91.8933, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Double Decker Living Root Bridge", description: "Spectacular multi-century living tree-root suspension bridges in Nongriat village.", duration: "Full Day Trek", image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80" },
      { name: "Dawki & Umngot River", description: "Glass-like river where wooden boats appear to levitate on crystal clear water.", duration: "Half Day", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80" },
      { name: "Cherrapunji & Nohkalikai Falls", description: "Tallest plunge waterfall in India (1,115 ft) amidst swirling misty canyons.", duration: "Full Day", image: "https://images.unsplash.com/photo-1598890777032-bde13fba5be3?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Prepare for a 3,500-step hike to reach Nongriat root bridges; start early in the morning", "Boating at Dawki is best from November to February for peak water clarity", "Carry light waterproof jackets even during dry months"],
    tags: ["Living Root Bridges", "Waterfalls", "Caves", "Crystal Rivers"]
  },
  {
    id: "in-state-mizoram",
    name: "Mizoram",
    category: "state",
    categoryLabel: "State",
    zone: "North-East",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
    shortDescription: "The Land of the Highlanders, rolling bamboo hills, pristine Vantawng Falls, and vibrant Cheraw dance.",
    fullOverview: "Mizoram is a peaceful hill state known for high literacy, vibrant tribal traditions, scenic bamboo forests, the majestic Vantawng waterfall, and ridge-top capital Aizawl.",
    bestTimeToVisit: "November to March",
    coordinates: { lat: 23.7271, lon: 92.7176, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Aizawl Ridge & Solomon's Temple", description: "Scenic clifftop capital city with panoramic viewpoints and white marble church.", duration: "Half Day", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80" },
      { name: "Vantawng Falls", description: "Highest uninterrupted waterfall in Mizoram surrounded by dense bamboo jungles.", duration: "Half Day", image: "https://images.unsplash.com/photo-1598890777032-bde13fba5be3?auto=format&fit=crop&w=600&q=80" },
      { name: "Reiek Peak", description: "Dramatic mountain peak offering panoramic views extending toward Bangladesh plains.", duration: "3 - 4 Hours", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Obtain an Inner Line Permit (ILP) before arriving", "Experience the energetic Cheraw bamboo dance during Chapchar Kut festival", "Respect Sunday church observances when shops remain closed"],
    tags: ["Highlands", "Bamboo Hills", "Waterfalls", "Culture"]
  },
  {
    id: "in-state-nagaland",
    name: "Nagaland",
    category: "state",
    categoryLabel: "State",
    zone: "North-East",
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Land of Festivals, the legendary Hornbill festival, emerald Dzukou Valley, and historic Kohima War Cemetery.",
    fullOverview: "Nagaland is world-famous for its colorful Naga warrior heritage, the iconic Hornbill Festival in Kisama, the high-altitude Dzukou Valley carpeted with lilies, and scenic mountain villages.",
    bestTimeToVisit: "October to May (December for Hornbill Festival)",
    coordinates: { lat: 25.6751, lon: 94.1086, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Kisama Heritage Village & Hornbill Festival", description: "Cultural village hosting the grand 10-day celebration of Naga tribes in December.", duration: "Full Day", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80" },
      { name: "Dzukou Valley", description: "Breathtaking green valley with rolling hills, rare Dzukou lilies, and winding streams.", duration: "Full Day Trek", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80" },
      { name: "Kohima War Cemetery", description: "Tranquil Commonwealth memorial commemorating soldiers of the WWII Battle of Kohima.", duration: "1 - 2 Hours", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Book Hornbill Festival accommodations 4 - 6 months in advance", "Wear good trekking shoes for the Dzukou Valley hike", "Obtain the required ILP permit"],
    tags: ["Hornbill Festival", "Valleys", "Tribal Culture", "Hiking"]
  },
  {
    id: "in-state-odisha",
    name: "Odisha",
    category: "state",
    categoryLabel: "State",
    zone: "East",
    image: "https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80",
    shortDescription: "The monumental Sun Temple of Konark, sacred Jagannath Temple in Puri, and tranquil Chilika Lake.",
    fullOverview: "Odisha is home to the architectural chariot marvel of the Konark Sun Temple, the annual Rath Yatra of Puri, Asia's largest brackish lagoon at Chilika (hosting migratory birds and Irrawaddy dolphins), and classical Odissi dance.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 19.8876, lon: 86.0945, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Konark Sun Temple", description: "13th-century UNESCO World Heritage architectural marvel shaped as a gargantuan 24-wheel chariot.", duration: "3 - 4 Hours", image: "https://images.unsplash.com/photo-1609137144820-2228f41656fd?auto=format&fit=crop&w=600&q=80" },
      { name: "Puri Jagannath Temple & Golden Beach", description: "Sacred Char Dham shrine and clean Blue Flag certified beach.", duration: "Half Day", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80" },
      { name: "Chilika Lake", description: "Expansive lagoon sanctuary home to rare Irrawaddy dolphins and millions of winter flamingos.", duration: "Half Day", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Take an early morning boat ride at Chilika Lake (Satapada) to spot dolphins", "Taste authentic Chhena Poda (baked cottage cheese dessert)", "Hire an authorized ASI guide to explain the intricate stone carvings at Konark"],
    tags: ["Sun Temple", "Pilgrimage", "Lagoon", "Beaches"]
  },
  {
    id: "in-state-punjab",
    name: "Punjab",
    category: "state",
    categoryLabel: "State",
    zone: "North",
    image: "https://images.unsplash.com/photo-1609947017136-9daf32a5eb16?auto=format&fit=crop&w=800&q=80",
    shortDescription: "The spiritual radiance of Amritsar's Golden Temple, Wagah Border ceremony, and world-famous Punjabi hospitality.",
    fullOverview: "Punjab is the land of five rivers, warm hospitality, the sanctified Golden Temple (Harmandir Sahib), the patriotic electric atmosphere of the Wagah Border retreat, rich mustard fields, and rich culinary feasts.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 31.6200, lon: 74.8765, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "The Golden Temple (Harmandir Sahib)", description: "Revered spiritual sanctum covered in pure gold foil, offering free meals to 100,000 visitors daily.", duration: "Half Day", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80" },
      { name: "Wagah Border Ceremony", description: "High-spirited, synchronised military drill between India and Pakistan border security.", duration: "3 - 4 Hours", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" },
      { name: "Jallianwala Bagh & Partition Museum", description: "Historic memorial garden and world's first museum chronicling the 1947 Partition.", duration: "2 - 3 Hours", image: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Cover your head and remove footwear before entering the Golden Temple complex", "Partake in the Langar (community kitchen) service", "Feast on authentic Amritsari Kulcha with Chole and thick Lassi"],
    tags: ["Golden Temple", "Heritage", "Hospitality", "Foodie"]
  },
  {
    id: "in-state-rajasthan",
    name: "Rajasthan",
    category: "state",
    categoryLabel: "State",
    zone: "West",
    image: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=800&q=80",
    shortDescription: "The Land of Kings, towering desert forts of Jaipur, golden dunes of Jaisalmer, and romantic lakes of Udaipur.",
    fullOverview: "Rajasthan is India's royal heartland. Admire pink sandstone palaces in Jaipur, romantic lake palaces in Udaipur, blue alleyways in Jodhpur, and camel safaris across the Thar Desert in Jaisalmer.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 26.9124, lon: 75.7873, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Amer Fort & Hawa Mahal (Jaipur)", description: "Grand hilltop Rajput stronghold with mirror palace (Sheesh Mahal) and honeycomb facade.", duration: "Full Day", image: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=600&q=80" },
      { name: "City Palace & Lake Pichola (Udaipur)", description: "Fairytale white palaces reflecting on shimmering tranquil waters.", duration: "1 - 2 Days", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" },
      { name: "Jaisalmer Fort & Thar Desert", description: "Living golden sandstone fort and magical desert camps under starry skies.", duration: "1 - 2 Days", image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Take a sunset boat ride on Lake Pichola in Udaipur", "Stay overnight in a luxury desert tent in the Sam sand dunes", "Try authentic Dal Baati Churma and Ker Sangri"],
    tags: ["Forts", "Palaces", "Desert", "Royalty"]
  },
  {
    id: "in-state-sikkim",
    name: "Sikkim",
    category: "state",
    categoryLabel: "State",
    zone: "North-East",
    image: "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Kangchenjunga panoramic vistas, sacred glacial Tsomgo Lake, and tranquil Rumtek Buddhist monastery.",
    fullOverview: "India's first 100% organic state, Sikkim is cradled by the world's 3rd highest peak Kangchenjunga. Highlights include colorful Tibetan monasteries, high alpine passes (Nathu La), and rhododendron sanctuaries.",
    bestTimeToVisit: "March to May & October to mid-December",
    coordinates: { lat: 27.3389, lon: 88.6065, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Tsomgo Lake & Nathu La Pass", description: "Sacred glacial lake at 12,310 ft and historic Indo-China Silk Route pass.", duration: "Full Day", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80" },
      { name: "Rumtek Monastery", description: "Seat of the Karma Kagyu lineage, housing priceless Buddhist relics and thangkas.", duration: "2 - 3 Hours", image: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=600&q=80" },
      { name: "Yumthang Valley of Flowers", description: "Snow-capped valley bursting with 24 species of rhododendrons during spring.", duration: "Full Day", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Nathu La Pass and North Sikkim require special permits arranged 24 hrs prior", "Savor steaming Thukpa and Momos on Gangtok's pedestrian MG Marg", "Carry warm windproof jackets and gloves"],
    tags: ["Himalayas", "Glacial Lakes", "Organic", "Monasteries"]
  },
  {
    id: "in-state-tamil-nadu",
    name: "Tamil Nadu",
    category: "state",
    categoryLabel: "State",
    zone: "South",
    image: "https://images.unsplash.com/photo-1692173248120-59547c3d4653?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Towering Dravidian temple gopurams of Madurai, UNESCO Shore Temple in Mahabalipuram, and misty Nilgiri tea hills.",
    fullOverview: "Tamil Nadu is a bastion of Dravidian art, architecture, and Carnatic music. Marvel at the soaring gopurams of Meenakshi Temple, UNESCO rock relief carvings in Mahabalipuram, and colonial charm in Ooty.",
    bestTimeToVisit: "November to March",
    coordinates: { lat: 13.0827, lon: 80.2707, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Meenakshi Amman Temple (Madurai)", description: "Legendary temple complex crowned with 14 colorful carved gopurams reaching 170 ft.", duration: "Half Day", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80" },
      { name: "Mahabalipuram Shore Temple & Relic Bas-Reliefs", description: "7th-century coastal stone temples and Arjuna's Penance rock carving.", duration: "Half Day", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" },
      { name: "Nilgiri Mountain Railway & Ooty", description: "UNESCO heritage toy train winding through misty Nilgiri tea hills and pine forests.", duration: "1 - 2 Days", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Dress conservatively when visiting Dravidian temples (covered shoulders & knees)", "Ride the historic Nilgiri toy train between Mettupalayam and Ooty", "Enjoy traditional South Indian filter coffee and Chettinad feasts"],
    tags: ["Dravidian Temples", "UNESCO Heritage", "Hill Station", "Classical Arts"]
  },
  {
    id: "in-state-telangana",
    name: "Telangana",
    category: "state",
    categoryLabel: "State",
    zone: "South",
    image: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80",
    shortDescription: "The City of Pearls Hyderabad, majestic Golconda Fort, Charminar, and world-famous Hyderabadi Biryani.",
    fullOverview: "Telangana fuses royal Nizami heritage with cutting-edge tech innovation. Discover the 16th-century Charminar, the acoustic marvels of Golconda Fort, the Ramappa Temple (UNESCO), and Ramoji Film City.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 17.3850, lon: 78.4867, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Charminar & Laad Bazaar", description: "Iconic 1591 monument with four minarets flanked by shimmering pearl and bangle markets.", duration: "2 - 3 Hours", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" },
      { name: "Golconda Fort & Sound/Light Show", description: "Monumental diamond capital fort known for ingenious acoustic engineering.", duration: "Half Day", image: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=600&q=80" },
      { name: "Ramappa Temple (Kakatiya UNESCO)", description: "13th-century sandstone temple built with floating bricks and sculptural carvings.", duration: "Half Day", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Try world-famous authentic Hyderabadi Dum Biryani and Irani Chai with Osmania biscuits", "Test the clap echo at Golconda Fort's Fateh Darwaza", "Shop for genuine cultured pearls near Charminar"],
    tags: ["Nizami Heritage", "Forts", "Biryani", "Tech Capital"]
  },
  {
    id: "in-state-tripura",
    name: "Tripura",
    category: "state",
    categoryLabel: "State",
    zone: "North-East",
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80",
    shortDescription: "The floating water palace of Neermahal, Ujjayanta Palace, and massive rock-carvings of Unakoti.",
    fullOverview: "Tripura is celebrated for its Manikya dynasty palaces, the lake palace Neermahal floating in Rudrasagar Lake, and the archaeological wonder of Unakoti featuring colossal rock bas-reliefs of Lord Shiva.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 23.8315, lon: 91.2868, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Neermahal Water Palace", description: "Enchanting royal palace standing in the middle of Rudrasagar Lake, blending Hindu and Mughal styles.", duration: "Half Day", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" },
      { name: "Unakoti Heritage Site", description: "Ancient pilgrimage place with rock carvings of Shiva dating back to the 7th-9th centuries.", duration: "Half Day", image: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=600&q=80" },
      { name: "Ujjayanta Palace", description: "Grand white neoclassical royal palace in Agartala housing Northeast India's premier museum.", duration: "2 - 3 Hours", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Take a motorboat ride to reach Neermahal Palace in the evening", "Try local bamboo shoot delicacies (Mui Borok)", "Visit during the Diwali festival at the 500-year-old Tripura Sundari Temple"],
    tags: ["Water Palace", "Rock Carvings", "Museums", "Heritage"]
  },
  {
    id: "in-state-uttar-pradesh",
    name: "Uttar Pradesh",
    category: "state",
    categoryLabel: "State",
    zone: "North",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
    shortDescription: "The iconic Taj Mahal in Agra, sacred Ganga Aarti along the ghats of Varanasi, and royal Awadhi Lucknow.",
    fullOverview: "Uttar Pradesh is the spiritual and architectural cradle of India. Stand before the world wonder Taj Mahal in Agra, witness the timeless Ganga Aarti rituals in Varanasi, and indulge in Awadhi royal cuisine in Lucknow.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 27.1751, lon: 78.0421, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Taj Mahal (Agra)", description: "UNESCO World Wonder of white marble, Emperor Shah Jahan's timeless monument to love.", duration: "Half Day", image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80" },
      { name: "Varanasi Ghats & Ganga Aarti", description: "Spiritual morning boat ride and mesmerizing evening twilight fire ceremonies on the sacred Ganges.", duration: "1 - 2 Days", image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=600&q=80" },
      { name: "Bara Imambara (Lucknow)", description: "Mughal architectural marvel featuring the intricate acoustic maze (Bhool Bhulaiya).", duration: "2 - 3 Hours", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Visit Taj Mahal at sunrise for ethereal lighting and fewer crowds (closed on Fridays)", "Hire an experienced hand-rowed boat for Varanasi sunrise cruise", "Taste Lucknow's tender Galouti and Kakori kebabs"],
    tags: ["Taj Mahal", "Varanasi", "Mughal Architecture", "Ganges"]
  },
  {
    id: "in-state-uttarakhand",
    name: "Uttarakhand",
    category: "state",
    categoryLabel: "State",
    zone: "North",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Yoga capital Rishikesh, Queen of Hills Mussoorie, Jim Corbett tiger reserve, and snows of Auli.",
    fullOverview: "Uttarakhand (Devbhumi) offers white-water river rafting and ashrams in Rishikesh, skiing slopes in Auli with Nanda Devi views, sacred Char Dham pilgrimages (Badrinath & Kedarnath), and India's oldest national park, Corbett.",
    bestTimeToVisit: "March to June & September to November",
    coordinates: { lat: 30.1087, lon: 78.2916, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Rishikesh & Ganga Ghats", description: "Global yoga capital with suspension bridges Laxman Jhula, river rafting, and evening Aarti.", duration: "1 - 2 Days", image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=600&q=80" },
      { name: "Jim Corbett National Park", description: "India's pioneer national park renowned for wild Bengal tigers and scenic Dhikala grasslands.", duration: "1 - 2 Days", image: "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=600&q=80" },
      { name: "Auli Ski Resort", description: "Premier Himalayan skiing meadow offering 360-degree views of Nanda Devi peak.", duration: "1 - 2 Days", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Pre-book Corbett tiger safari zone permits months in advance", "Try thrilling white-water rafting from Marine Drive to Rishikesh", "Take the 4km cable car ride from Joshimath to Auli"],
    tags: ["Yoga", "Rafting", "Skiing", "Himalayas"]
  },
  {
    id: "in-state-west-bengal",
    name: "West Bengal",
    category: "state",
    categoryLabel: "State",
    zone: "East",
    image: "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Cultural soul Kolkata, toy train in misty Darjeeling tea gardens, and the mangrove Sundarbans.",
    fullOverview: "West Bengal stretches from the Himalayan tea estates of Darjeeling to the mangrove delta of the Sundarbans. Celebrate art and literature in Kolkata, Victoria Memorial, and savor iconic Bengali sweets like Rosogolla.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 22.5726, lon: 88.3639, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Victoria Memorial & Howrah Bridge (Kolkata)", description: "Grand white marble colonial monument and world-famous cantilever bridge across Hooghly River.", duration: "Half Day", image: "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=600&q=80" },
      { name: "Darjeeling Himalayan Railway & Tiger Hill", description: "UNESCO toy train and breathtaking sunrise views of Kangchenjunga over emerald tea gardens.", duration: "1 - 2 Days", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80" },
      { name: "Sundarbans National Park", description: "World's largest mangrove forest delta and UNESCO habitat of swimming Royal Bengal Tigers.", duration: "2 Days", image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Visit Kolkata during Durga Puja to experience world's largest public art installation festival", "Wake up at 4 AM for Tiger Hill sunrise over Kangchenjunga", "Taste authentic Kathi Rolls and Mishti Doi"],
    tags: ["Cultural Capital", "Tea Estates", "Mangroves", "Heritage"]
  },

  // ==========================================
  // UNION TERRITORIES OF INDIA (8 UTs)
  // ==========================================
  {
    id: "in-ut-andaman-nicobar",
    name: "Andaman and Nicobar Islands",
    category: "ut",
    categoryLabel: "Union Territory",
    zone: "South",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Pristine turquoise waters, world-famous Radhanagar Beach, vibrant coral reefs, and Cellular Jail.",
    fullOverview: "An archipelago of emerald islands in the Bay of Bengal, the Andamans are celebrated for world-class scuba diving at Havelock Island, bioluminescent night kayaking, and historic Cellular Jail in Port Blair.",
    bestTimeToVisit: "October to May",
    coordinates: { lat: 11.6234, lon: 92.7265, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Radhanagar Beach (Havelock)", description: "Voted one of Asia's finest beaches, known for silky white sand and turquoise sunsets.", duration: "Half Day", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80" },
      { name: "Cellular Jail National Memorial", description: "Historic colonial prison in Port Blair with stirring evening light and sound tribute.", duration: "2 - 3 Hours", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" },
      { name: "Elephant Beach Scuba Diving", description: "Thriving coral reefs with sea turtles, clownfish, and crystal-clear scuba diving.", duration: "Half Day", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Pre-book inter-island catamaran ferry tickets (Makruzz/Green Ocean) between Port Blair and Havelock", "Radhanagar Beach is best visited during afternoon golden hour", "Avoid entering protected indigenous tribal reserve zones"],
    tags: ["Islands", "Beaches", "Scuba Diving", "Colonial History"]
  },
  {
    id: "in-ut-chandigarh",
    name: "Chandigarh",
    category: "ut",
    categoryLabel: "Union Territory",
    zone: "North",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    shortDescription: "India's premier planned city designed by Le Corbusier, famous for Nek Chand's Rock Garden and Sukhna Lake.",
    fullOverview: "Serving as joint capital for Punjab and Haryana, Chandigarh is a masterpiece of modern urban architecture. Features the UNESCO-listed Capitol Complex, whimsical Rock Garden built from recycled waste, and peaceful Sukhna Lake.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 30.7333, lon: 76.7794, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Nek Chand's Rock Garden", description: "Whimsical 40-acre wonderland of sculptures crafted entirely from industrial and urban scrap.", duration: "2 - 3 Hours", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80" },
      { name: "Sukhna Lake", description: "Serene man-made reservoir at the foothills of the Shivalik range offering paddle boating.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80" },
      { name: "Zakir Hussain Rose Garden", description: "Asia's largest rose garden showcasing 50,000 rose bushes across 1,600 varieties.", duration: "1 - 2 Hours", image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Rent a Smart Bike to cruise the city's tree-lined avenues and grid sectors", "Visit the Rock Garden early in the morning to avoid midday heat", "Enjoy boating at Sukhna Lake during sunset"],
    tags: ["Planned City", "Architecture", "Gardens", "Lakes"]
  },
  {
    id: "in-ut-dadra-nagar-haveli-daman-diu",
    name: "Dadra and Nagar Haveli and Daman and Diu",
    category: "ut",
    categoryLabel: "Union Territory",
    zone: "West",
    image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Portuguese sea-fortresses, serene palm-lined beaches, and relaxed Arabian Sea coastal vibes.",
    fullOverview: "This coastal union territory features historic Portuguese sea bastions like Diu Fort, quiet sandy beaches such as Devka and Nagoa Beach, and lush forested tribal retreats at Silvassa.",
    bestTimeToVisit: "October to April",
    coordinates: { lat: 20.3974, lon: 72.8328, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Diu Fort & Lighthouse", description: "Massive 16th-century stone fortress surrounded by crashing ocean waves on three sides.", duration: "Half Day", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80" },
      { name: "Nagoa Beach (Diu)", description: "Curved crescent beach lined with rare African Hoka palm trees offering water sports.", duration: "Half Day", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80" },
      { name: "Moti Daman Fort & Churches", description: "Colonial ramparts, the Church of Bom Jesus, and Portuguese colonial streets.", duration: "2 - 3 Hours", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Explore Diu island on a rented bicycle or scooter", "Walk along the cannon-lined sea ramparts of Diu Fort", "Enjoy coastal seafood shacks along Nagoa Beach"],
    tags: ["Sea Forts", "Portuguese Heritage", "Beaches", "Coastline"]
  },
  {
    id: "in-ut-delhi",
    name: "Delhi (NCT)",
    category: "ut",
    categoryLabel: "Union Territory",
    zone: "North",
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
    shortDescription: "India's storied capital, home to Mughal wonders Red Fort & Humayun's Tomb, and vibrant Chandni Chowk.",
    fullOverview: "Delhi bridges antiquity and modernity. Discover the towering Qutub Minar, red sandstone walls of Red Fort, serene lotus-shaped Bahá'í temple, India Gate, and the chaotic aromas of Old Delhi's spice bazaar.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 28.6139, lon: 77.2090, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Humayun's Tomb & Qutub Minar", description: "UNESCO Mughal garden tomb prototype for Taj Mahal and world's tallest brick minaret.", duration: "Half Day", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80" },
      { name: "Red Fort & Chandni Chowk", description: "Imposing 17th-century Mughal citadel and Old Delhi's bustling street food maze.", duration: "Half Day", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" },
      { name: "India Gate & Kartavya Path", description: "Ceremonial war memorial arch and grand boulevard leading to Rashtrapati Bhavan.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Use the efficient Delhi Metro network to easily navigate between monuments", "Take a cycle-rickshaw culinary food tour through Chandni Chowk", "Visit monuments early morning to beat queues"],
    tags: ["Capital", "Mughal Monuments", "Street Food", "Heritage"]
  },
  {
    id: "in-ut-jammu-kashmir",
    name: "Jammu and Kashmir",
    category: "ut",
    categoryLabel: "Union Territory",
    zone: "North",
    image: "https://images.unsplash.com/photo-1564329494258-3f72215ba175?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Paradise on Earth, iconic Dal Lake shikara rides, Gulmarg ski gondola, and Pahalgam valley.",
    fullOverview: "Kashmir is renowned worldwide for its majestic snow-draped Pir Panjal mountains, floating wooden houseboats and flower shikaras on Dal Lake, Gulmarg's high-altitude gondola, and saffron fields in Pampore.",
    bestTimeToVisit: "March to October (Winter Dec-Feb for snow skiing)",
    coordinates: { lat: 34.0837, lon: 74.7973, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Dal Lake & Shikara Cruise", description: "Glide across tranquil waters past floating lotus gardens, houseboats, and morning vegetable markets.", duration: "Half Day", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80" },
      { name: "Gulmarg Gondola & Ski Slopes", description: "One of the world's highest cable cars rising to 13,057 ft on Apharwat Peak.", duration: "Full Day", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80" },
      { name: "Pahalgam & Betaab Valley", description: "Picturesque valley framed by pine forests, Lidder River, and snow peaks.", duration: "Full Day", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Stay at least one night in a carved cedar houseboat on Dal or Nigeen Lake", "Book Gulmarg Gondola Phase 2 tickets online well in advance", "Sip warming Kashmiri Kahwa tea infused with saffron and crushed almonds"],
    tags: ["Snow", "Dal Lake", "Shikara", "Skiing", "Paradise"]
  },
  {
    id: "in-ut-ladakh",
    name: "Ladakh",
    category: "ut",
    categoryLabel: "Union Territory",
    zone: "North",
    image: "https://images.unsplash.com/photo-1652204597589-962156b9483d?auto=format&fit=crop&w=800&q=80",
    shortDescription: "The Land of High Passes, cobalt Pangong Tso, sand dunes of Nubra Valley, and ancient monasteries.",
    fullOverview: "A high-altitude moonscape of stark beauty, Ladakh captivates travelers with shimmering turquoise lakes like Pangong Tso, high passes like Khardung La, double-humped Bactrian camels in Nubra Valley, and cliffside gompas.",
    bestTimeToVisit: "May to September",
    coordinates: { lat: 34.1526, lon: 77.5771, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Pangong Tso Lake", description: "Breathtaking 134km endorheic lake changing colors from turquoise to azure against barren peaks.", duration: "1 - 2 Days", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80" },
      { name: "Nubra Valley & Hunder Sand Dunes", description: "High-altitude desert valley where Bactrian camels roam white dunes framed by snow peaks.", duration: "1 - 2 Days", image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80" },
      { name: "Thiksey & Hemis Monasteries", description: "Dramatic 12-storey hilltop Tibetan gompa resembling the Potala Palace of Lhasa.", duration: "Half Day", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Acclimatize in Leh for at least 48 hours before traveling to Pangong or Khardung La", "Hydrate constantly and carry Diamox for mountain sickness prevention", "Protect against intense high-altitude UV rays with sunglasses and sunscreen"],
    tags: ["High Passes", "Lakes", "Monasteries", "Desert Dunes"]
  },
  {
    id: "in-ut-lakshadweep",
    name: "Lakshadweep",
    category: "ut",
    categoryLabel: "Union Territory",
    zone: "South",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
    shortDescription: "India's coral paradise, emerald atolls, shallow lagoons, and untouched diving reefs.",
    fullOverview: "A remote archipelago of 36 coral islands in the Arabian Sea, Lakshadweep is celebrated for pristine turquoise lagoons, coconut palm groves, sea turtles, and untouched scuba diving at Bangaram and Agatti.",
    bestTimeToVisit: "October to mid-May",
    coordinates: { lat: 10.5667, lon: 72.6417, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Bangaram Island Atoll", description: "Teardrop-shaped uninhabited island encircled by shallow luminescent turquoise lagoons.", duration: "1 - 2 Days", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80" },
      { name: "Agatti Island Lagoon", description: "Spectacular flight landing runway stretching into the sea flanked by azure waters.", duration: "Half Day", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80" },
      { name: "Kavaratti Marine Aquarium", description: "Capital island known for water sports, glass-bottom boats, and vibrant coral gardens.", duration: "Half Day", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Entry permit is mandatory for all visitors; obtain through authorized tour operators", "Pack reef-safe sunscreen to protect delicate coral reefs", "Cash is preferred as ATMs are limited across islands"],
    tags: ["Atolls", "Lagoons", "Coral Reefs", "Scuba"]
  },
  {
    id: "in-ut-puducherry",
    name: "Puducherry",
    category: "ut",
    categoryLabel: "Union Territory",
    zone: "South",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    shortDescription: "French colonial White Town, serene Promenade Beach, vibrant boutique cafes, and spiritual Auroville.",
    fullOverview: "Puducherry (formerly Pondicherry) offers a charming French Riviera ambiance with mustard-yellow colonial villas, bougainvillea-draped balconies, the experimental universal township of Auroville, and the Sri Aurobindo Ashram.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 11.9416, lon: 79.8083, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "French Quarter (White Town)", description: "Picturesque colonial boulevards lined with pastel villas, art galleries, and chic cafes.", duration: "Half Day", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80" },
      { name: "Auroville & Matrimandir", description: "Global experimental city dedicated to human unity, featuring the golden globe meditation dome.", duration: "Half Day", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" },
      { name: "Promenade Rock Beach", description: "Lively seafront promenade closed to motor vehicles in the evenings for peaceful strolls.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Rent a vintage bicycle to explore White Town's cobblestone streets", "Pre-book passes online to view the Matrimandir inner meditation chamber", "Savor wood-fired French sourdough pizzas and artisanal croissants"],
    tags: ["French Quarter", "Auroville", "Promenade", "Boutique Cafes"]
  },

  // ==========================================
  // POPULAR CITIES OF INDIA (16 CITIES)
  // ==========================================
  {
    id: "in-city-bengaluru",
    name: "Bengaluru",
    category: "city",
    categoryLabel: "Popular City",
    zone: "South",
    image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80",
    shortDescription: "India's Silicon Valley and Garden City, celebrated for craft breweries, Lalbagh botanical gardens, and pleasant climate.",
    fullOverview: "Bengaluru (Bangalore) combines pleasant year-round weather, sprawling botanical parks, 19th-century Tudor-style Bangalore Palace, vibrant craft beer microbreweries, and high-tech corporate campuses.",
    bestTimeToVisit: "Year-Round (September to March is optimal)",
    coordinates: { lat: 12.9716, lon: 77.5946, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Lalbagh Botanical Garden & Glass House", description: "Historical 240-acre botanical haven with centuries-old trees and annual flower shows.", duration: "2 - 3 Hours", image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80" },
      { name: "Bangalore Palace", description: "Tudor-style royal estate with fortified towers, stained glass, and royal memorabilia.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=600&q=80" },
      { name: "Indiranagar & Koramangala Breweries", description: "Lively hubs of artisanal craft breweries, specialty coffee shops, and live indie music.", duration: "Evening", image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Use Namma Metro to bypass peak surface traffic", "Have breakfast at legendary Vidyarthi Bhavan for crispy butter Masala Dosa", "Explore Cubbon Park on Sunday mornings when roads are pedestrianized"],
    tags: ["Silicon Valley", "Breweries", "Gardens", "Palaces"]
  },
  {
    id: "in-city-mumbai",
    name: "Mumbai",
    category: "city",
    categoryLabel: "Popular City",
    zone: "West",
    image: "https://images.unsplash.com/photo-1560264280-88b68371db39?auto=format&fit=crop&w=800&q=80",
    shortDescription: "The City of Dreams, seaside Marine Drive promenade, Bollywood glamour, and historic Victorian Gothic architecture.",
    fullOverview: "India's financial capital and cinematic epicenter, Mumbai pulsates with boundless ambition. Marvel at the Gateway of India, UNESCO Victorian Gothic buildings, street food stalls on Juhu Beach, and twilight along Marine Drive.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 19.0760, lon: 72.8777, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Gateway of India & Colaba", description: "Iconic basalt arch on the Arabian Sea waterfront facing the historic Taj Mahal Palace Hotel.", duration: "2 - 3 Hours", image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80" },
      { name: "Marine Drive (Queen's Necklace)", description: "3km-long seaside boulevard illuminated like a sparkling string of pearls at dusk.", duration: "1 - 2 Hours", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80" },
      { name: "Chhatrapati Shivaji Maharaj Terminus (CSMT)", description: "UNESCO-listed Victorian Gothic railway terminus featuring grand vaulted stone ceilings.", duration: "1 Hour", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Take an evening stroll along Marine Drive with a cutting chai", "Catch a ferry from Gateway to the rock-cut Elephanta Caves", "Savor street-side Vada Pav and Pav Bhaji at Sardar Refreshments"],
    tags: ["Financial Capital", "Bollywood", "Marine Drive", "Victorian Gothic"]
  },
  {
    id: "in-city-delhi",
    name: "Delhi",
    category: "city",
    categoryLabel: "Popular City",
    zone: "North",
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
    shortDescription: "The historic heart of India, grand Mughal monuments, sprawling spice bazaars, and world-class street cuisine.",
    fullOverview: "Delhi encompasses seven historical cities within one dynamic metropolis. Highlights include the sandstone majesty of Red Fort, the soaring spire of Qutub Minar, Humayun's Garden Tomb, and shopping at Dilli Haat.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 28.6139, lon: 77.2090, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Qutub Minar Complex", description: "73m soaring red sandstone minaret dating back to 1192 surrounded by ancient ruins.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80" },
      { name: "Humayun's Tomb", description: "Pristine Persian-style Mughal garden tomb that inspired the Taj Mahal.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=600&q=80" },
      { name: "Lotus Temple", description: "Iconic flowerlike Bahá'í House of Worship welcoming individuals of all faiths to meditate.", duration: "1 - 2 Hours", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Use the Delhi Metro Tourist Card for unlimited daily rides", "Eat Chole Bhature at Sita Ram Diwan Chand in Paharganj", "Visit the Craft Museum and National Gallery of Modern Art"],
    tags: ["Capital", "Heritage", "Mughal", "Shopping"]
  },
  {
    id: "in-city-hyderabad",
    name: "Hyderabad",
    category: "city",
    categoryLabel: "Popular City",
    zone: "South",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    shortDescription: "City of Pearls, majestic Charminar, Golconda Fort's acoustic echoes, and authentic fragrant Dum Biryani.",
    fullOverview: "Hyderabad marries opulent Nizami heritage with Cyberabad's cutting-edge technology. Experience the iconic Charminar, the grandeur of Chowmahalla Palace, the impregnable Golconda fortress, and world-famous culinary culture.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 17.3850, lon: 78.4867, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Charminar & Mecca Masjid", description: "The beating heart of Old Hyderabad, surrounded by vibrant pearl and bangle souks.", duration: "2 - 3 Hours", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" },
      { name: "Golconda Fort", description: "Vast medieval fortress where the Koh-i-Noor diamond was once stored.", duration: "Half Day", image: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=600&q=80" },
      { name: "Chowmahalla Palace", description: "Opulent seat of the Asaf Jahi dynasty featuring vintage Rolls Royce cars and crystal chandeliers.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Indulge in authentic Mutton Dum Biryani at Paradise or Cafe Bahar", "Shop for traditional lac bangles in Laad Bazaar", "Stay for the evening sound and light show at Golconda Fort"],
    tags: ["Pearls", "Biryani", "Nizam Palaces", "Fortresses"]
  },
  {
    id: "in-city-chennai",
    name: "Chennai",
    category: "city",
    categoryLabel: "Popular City",
    zone: "South",
    image: "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Gateway to South India, expansive Marina Beach, ancient Kapaleeshwarar Temple, and Carnatic music.",
    fullOverview: "Chennai is a cultural epicenter of South India, famous for Marina Beach (one of the world's longest natural urban beaches), the 7th-century Dravidian Kapaleeshwarar Temple in Mylapore, and classical music and dance academies.",
    bestTimeToVisit: "November to February",
    coordinates: { lat: 13.0827, lon: 80.2707, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Kapaleeshwarar Temple (Mylapore)", description: "Dravidian temple dedicated to Shiva with a rainbow-hued, intricately carved gopuram.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80" },
      { name: "Marina Beach Promenade", description: "13km coastal stretch lively with sea breeze, sunset corn carts, and lighthouse views.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80" },
      { name: "San Thome Basilica", description: "Neo-Gothic cathedral built over the tomb of St. Thomas the Apostle.", duration: "1 Hour", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Attend Carnatic concerts in sabhas during the December Music Season", "Savor Murugan Idli Shop's soft steamed idlis with four types of chutney", "Walk through Mylapore's temple tank lanes during morning hours"],
    tags: ["Marina Beach", "Dravidian Temples", "Music", "Cuisine"]
  },
  {
    id: "in-city-kolkata",
    name: "Kolkata",
    category: "city",
    categoryLabel: "Popular City",
    zone: "East",
    image: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=800&q=80",
    shortDescription: "The City of Joy, cultural and literary heart, Victoria Memorial, Howrah Bridge, and yellow taxi cabs.",
    fullOverview: "Kolkata possesses an unmistakable soulful intellectual charm. Discover the grand Victoria Memorial, the bustling flower market under Howrah Bridge, historic tramways, College Street bookstalls, and rich culinary feasts.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 22.5726, lon: 88.3639, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Victoria Memorial & Maidan", description: "Pristine white marble museum set in lush sprawling gardens commemorating Queen Victoria.", duration: "Half Day", image: "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=600&q=80" },
      { name: "Howrah Bridge & Mullick Ghat Flower Market", description: "Iconic cantilever steel bridge and Asia's largest vibrant morning flower bazaar.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=600&q=80" },
      { name: "Dakshineswar Kali Temple & Belur Math", description: "Sacred 19th-century riverfront temple associated with Ramakrishna Paramahamsa.", duration: "3 - 4 Hours", image: "https://images.unsplash.com/photo-1609137144820-2228f41656fd?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Ride Asia's oldest operating electric tram through vintage Kolkata streets", "Taste traditional Sondesh, Rosogolla, and Mishti Doi from historic sweetmakers", "Have coffee at the historic Indian Coffee House on College Street"],
    tags: ["City of Joy", "Literature", "Victoria Memorial", "Art"]
  },
  {
    id: "in-city-pune",
    name: "Pune",
    category: "city",
    categoryLabel: "Popular City",
    zone: "West",
    image: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Oxford of the East, rich Maratha history at Shaniwar Wada, Aga Khan Palace, and lively student cafes.",
    fullOverview: "Pune harmonizes grand Maratha empire heritage with a vibrant youth culture. Explore the storied ruins of Shaniwar Wada, Mahatma Gandhi's memorial at Aga Khan Palace, and gateway treks into the scenic Western Ghats.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 18.5204, lon: 73.8567, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Shaniwar Wada", description: "18th-century fortified seat of the Peshwa rulers of the Maratha Empire.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=600&q=80" },
      { name: "Aga Khan Palace", description: "Italian-arched historic palace where Mahatma Gandhi and Kasturba Gandhi were interned.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" },
      { name: "Sinhagad Fort", description: "Clifftop battle fortress offering panoramic valley views and traditional village food.", duration: "Half Day", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Trek to Sinhagad Fort on a misty morning and enjoy Pithla Bhakri with onion pakoras", "Browse Koregaon Park's trendy leafy cafes and German Bakery", "Buy authentic Chitale Bandhu Bakarwadi"],
    tags: ["Maratha History", "Forts", "Student Culture", "Western Ghats"]
  },
  {
    id: "in-city-jaipur",
    name: "Jaipur",
    category: "city",
    categoryLabel: "Popular City",
    zone: "West",
    image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=800&q=80",
    shortDescription: "The Pink City, royal Amer Fort, honeycomb Hawa Mahal, astronomical Jantar Mantar, and bustling bazaars.",
    fullOverview: "Part of India's Golden Triangle, Jaipur is a royal spectacle. Features the pink terracotta walled city, the hillside Amer Fort with mirror-tiled halls, the City Palace, and the world's largest stone sundial at Jantar Mantar.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 26.9124, lon: 75.7873, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Amer Fort & Maota Lake", description: "Stunning hilltop fortress with Sheesh Mahal (Palace of Mirrors) overlooking reflection lakes.", duration: "3 - 4 Hours", image: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=600&q=80" },
      { name: "Hawa Mahal (Palace of Winds)", description: "Five-story pink facade with 953 ornate windows built for royal women to observe street pageants.", duration: "1 - 2 Hours", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" },
      { name: "City Palace & Jantar Mantar", description: "Active royal royal residence museum and UNESCO astronomical observatory.", duration: "Half Day", image: "https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Book the composite entry ticket covering Amer, Jantar Mantar, and Hawa Mahal", "Take photos of Hawa Mahal from across the street at Wind View Cafe", "Shop for blue pottery, block-printed textiles, and gem jewelry in Johari Bazaar"],
    tags: ["Pink City", "Palaces", "Forts", "Golden Triangle"]
  },
  {
    id: "in-city-ahmedabad",
    name: "Ahmedabad",
    category: "city",
    categoryLabel: "Popular City",
    zone: "West",
    image: "https://images.unsplash.com/photo-1621859294461-2e6e4bf0e689?auto=format&fit=crop&w=800&q=80",
    shortDescription: "India's first UNESCO World Heritage City, Sabarmati Ashram, intricate stepwells, and vibrant street markets.",
    fullOverview: "Ahmedabad is celebrated for its historic walled pol neighborhoods, the peaceful riverside Sabarmati Ashram where Mahatma Gandhi spearheaded the freedom movement, and the architectural wonder of Adalaj Stepwell.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 23.0225, lon: 72.5714, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Sabarmati Ashram", description: "Mahatma Gandhi's peaceful riverside headquarters from which the historic Salt March began.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1621859294461-2e6e4bf0e689?auto=format&fit=crop&w=600&q=80" },
      { name: "Adalaj Stepwell (Vav)", description: "Spectacular 15th-century five-story subterranean stepwell with carved stone pillars.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" },
      { name: "Sidi Saiyyed Mosque", description: "Famous for the exquisitely carved 'Tree of Life' marble stone latticework jali.", duration: "1 Hour", image: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Join the guided morning heritage walking tour through the old city pols", "Experience the nocturnal street food frenzy at Manek Chowk", "Visit during the International Kite Festival in January (Uttarayan)"],
    tags: ["UNESCO City", "Gandhi Ashram", "Stepwells", "Heritage Walk"]
  },
  {
    id: "in-city-kochi",
    name: "Kochi",
    category: "city",
    categoryLabel: "Popular City",
    zone: "South",
    image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80",
    shortDescription: "The Queen of the Arabian Sea, iconic Chinese fishing nets, spice heritage of Jew Town, and Kochi-Muziris Biennale.",
    fullOverview: "Kochi (Cochin) is a fascinating maritime trading port. Explore the cantilevered Chinese fishing nets along Fort Kochi beach, Portuguese architecture in St. Francis Church, Jewish synagogue in Mattancherry, and world-renowned art biennale.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 9.9312, lon: 76.2673, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Fort Kochi & Chinese Fishing Nets", description: "Historic seaside neighborhood with cantilevered timber fishing nets worked by fishermen.", duration: "Half Day", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80" },
      { name: "Mattancherry Palace & Jew Town", description: "Portuguese Dutch Palace with Hindu murals and historic 16th-century Paradesi Synagogue.", duration: "2 - 3 Hours", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80" },
      { name: "Kathakali Performance Center", description: "Traditional theatrical performance showcasing intricate facial makeup and mudras.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Arrive 1 hour early at Kathakali performances to witness the intricate ritual facial makeup", "Shop for authentic black pepper, cardamom, and cinnamon in Jew Town", "Take the public water ferry between Ernakulam and Fort Kochi for scenic coastal views"],
    tags: ["Arabian Sea", "Spice Route", "Chinese Nets", "Art Biennale"]
  },
  {
    id: "in-city-mysuru",
    name: "Mysuru",
    category: "city",
    categoryLabel: "Popular City",
    zone: "South",
    image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=800&q=80",
    shortDescription: "The City of Palaces, glowing Mysore Palace, fragrant sandalwood, silk sarees, and Chamundi Hill.",
    fullOverview: "Mysuru (Mysore) is the royal jewel of Karnataka. Admire the Indo-Saracenic splendor of Mysore Palace, climb Chamundi Hill, stroll Devaraja market filled with mounds of fragrant spices and flowers, and enjoy authentic Mysore Pak.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 12.2958, lon: 76.6394, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Mysore Palace (Amba Vilas)", description: "Magnificent royal palace glowing with 100,000 bulbs on Sunday evenings and festivals.", duration: "Half Day", image: "https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=600&q=80" },
      { name: "Chamundi Hill & Nandi Monolith", description: "Hilltop temple dedicated to Goddess Chamundeshwari with a giant 16ft monolithic Nandi bull.", duration: "2 - 3 Hours", image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?auto=format&fit=crop&w=600&q=80" },
      { name: "Brindavan Gardens", description: "Terraced Mughal-style garden famous for symmetrical illuminated musical fountains.", duration: "Evening", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Witness the Sunday evening palace illumination from 7:00 PM to 7:45 PM", "Buy pure Mysore Silk sarees directly from KSIC showroom", "Taste melt-in-mouth Mysore Pak at legendary Guru Sweet Mart"],
    tags: ["Palaces", "Royalty", "Silk", "Sandalwood"]
  },
  {
    id: "in-city-varanasi",
    name: "Varanasi",
    category: "city",
    categoryLabel: "Popular City",
    zone: "North",
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
    shortDescription: "The world's oldest living city, holy Ganges ghats, transformative evening Ganga Aarti, and narrow spiritual alleys.",
    fullOverview: "Varanasi (Kashi / Benares) is the spiritual capital of India. Witness the cycle of life and devotion along 84 sacred riverfront ghats, take a sunrise boat ride, and experience the mesmerizing evening Ganga Aarti at Dashashwamedh Ghat.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 25.3176, lon: 82.9739, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Dashashwamedh & Assi Ghats", description: "The most sacred ghats where daily morning sun prayers and grand evening fire Aarti unfold.", duration: "Half Day", image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=600&q=80" },
      { name: "Kashi Vishwanath Golden Temple", description: "One of the twelve sacred Jyotirlingas, recently revitalized with an expansive temple corridor.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=600&q=80" },
      { name: "Sarnath Deer Park & Stupa", description: "Where Gautama Buddha delivered his first sermon after attaining enlightenment.", duration: "Half Day", image: "https://images.unsplash.com/photo-1609137144820-2228f41656fd?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Hire a traditional rowing wooden boat for sunrise along the ghats", "Arrive by 6:00 PM at Dashashwamedh Ghat to get a good viewing spot for Ganga Aarti", "Sample blue lassi, Banarasi paan, and piping hot kachori jalebi"],
    tags: ["Oldest City", "Ganges", "Ganga Aarti", "Spirituality"]
  },
  {
    id: "in-city-goa",
    name: "Goa (Coastal City Hubs)",
    category: "city",
    categoryLabel: "Popular City",
    zone: "West",
    image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Panaji's Latin Quarter Fontainhas, vibrant coastal markets, lively beach clubs, and seaside seafood shacks.",
    fullOverview: "Goa's urban and beach hubs (Panaji, Candolim, Anjuna, and Margao) blend Mediterranean pastel charm with laid-back beach life. Stroll through the Latin Quarter of Fontainhas and dine in heritage Portuguese mansions.",
    bestTimeToVisit: "November to March",
    coordinates: { lat: 15.4909, lon: 73.8278, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Fontainhas Latin Quarter (Panaji)", description: "Heritage neighborhood of colorful 18th-century Portuguese mansions and quaint cafes.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80" },
      { name: "Anjuna & Vagator Cliffs", description: "Dramatic red laterite cliffs, Chapora Fort views, and lively beach flea markets.", duration: "Half Day", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80" },
      { name: "Old Goa Portuguese Cathedrals", description: "Se Cathedral and Church of St. Francis of Assisi displaying Portuguese Manueline architecture.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Walk through Fontainhas early morning for optimal photography lighting", "Try Goan pork vindaloo or prawn balchão with feni cocktail", "Rent a self-drive car or scooter for flexible coastal hopping"],
    tags: ["Latin Quarter", "Coastal Hub", "Beaches", "Portuguese Style"]
  },
  {
    id: "in-city-chandigarh",
    name: "Chandigarh",
    category: "city",
    categoryLabel: "Popular City",
    zone: "North",
    image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80",
    shortDescription: "The City Beautiful, wide boulevards, Le Corbusier architecture, Rock Garden, and Sukhna Lake.",
    fullOverview: "Chandigarh is India's cleanest and most modern master-planned metropolis. Explore Le Corbusier's architectural landmarks, Nek Chand's creative Rock Garden, serene Sukhna Lake, and Sector 17 shopping plazas.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 30.7333, lon: 76.7794, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Rock Garden of Chandigarh", description: "Sculpture park made of domestic and industrial waste ceramic mosaics.", duration: "2 - 3 Hours", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80" },
      { name: "Sukhna Lake Promenade", description: "Picturesque 3km water body with jogging tracks, boating, and scenic sunset views.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80" },
      { name: "Le Corbusier Centre & Capitol Complex", description: "UNESCO World Heritage modern architecture complex with the iconic Open Hand monument.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Pre-register online to tour the UNESCO Capitol Complex", "Enjoy evening boating at Sukhna Lake", "Explore lively street food in Sector 8 and Sector 35"],
    tags: ["City Beautiful", "Modern Architecture", "Le Corbusier", "Clean City"]
  },
  {
    id: "in-city-lucknow",
    name: "Lucknow",
    category: "city",
    categoryLabel: "Popular City",
    zone: "North",
    image: "https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=800&q=80",
    shortDescription: "The City of Nawabs, Awadhi royal dining, intricate Chikankari embroidery, and Bara Imambara's labyrinth.",
    fullOverview: "Lucknow is the refined cultural center of the Nawabs of Awadh. Famous for the gravity-defying unsupported arch of Bara Imambara, delicate handwoven Chikankari embroidery, and legendary culinary royalty.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 26.8467, lon: 80.9462, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Bara Imambara & Bhool Bhulaiya", description: "Architectural wonder with a giant central hall built without pillar supports and a 3D labyrinth.", duration: "Half Day", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" },
      { name: "Chota Imambara & Rumi Darwaza", description: "Ornate palace of lights filled with Belgian glass chandeliers and 60ft Turkish gateway.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=600&q=80" },
      { name: "Hazratganj Shopping Promenade", description: "Colonial shopping boulevard featuring Victorian lampposts and Chikankari boutiques.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Hire an authorized guide to navigate the tricky labyrinth (Bhool Bhulaiya)", "Feast on melt-in-the-mouth Tunday Kababi kebabs with Sheermal", "Shop for authentic hand-embroidered Chikankari kurtas in Chowk"],
    tags: ["Nawabs", "Awadhi Cuisine", "Imambara", "Chikankari"]
  },
  {
    id: "in-city-srinagar",
    name: "Srinagar",
    category: "city",
    categoryLabel: "Popular City",
    zone: "North",
    image: "https://images.unsplash.com/photo-1564327287902-0ccf559d839e?auto=format&fit=crop&w=800&q=80",
    shortDescription: "The Summer Capital of Kashmir, serene Dal Lake houseboats, Mughal gardens, and Kashmiri saffron.",
    fullOverview: "Set in the Kashmir Valley along the Jhelum River, Srinagar is famous for its serene carved wooden houseboats on Dal Lake, terraced Mughal gardens (Shalimar & Nishat), Pashmina shawls, and floating markets.",
    bestTimeToVisit: "April to October (Tulip Festival in April)",
    coordinates: { lat: 34.0837, lon: 74.7973, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Dal Lake Houseboats & Shikara Ride", description: "Iconic wooden houseboats with carved walnut interiors and peaceful shikara boat rides.", duration: "Half Day", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80" },
      { name: "Mughal Gardens (Shalimar & Nishat Bagh)", description: "Terraced water gardens with fountains and historic chinar trees overlooking Dal Lake.", duration: "2 - 3 Hours", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80" },
      { name: "Indira Gandhi Tulip Garden", description: "Asia's largest tulip garden boasting over 1.5 million blooming tulips in spring.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Wake up early (5:30 AM) to experience Dal Lake's floating vegetable market by boat", "Taste an authentic multi-course Kashmiri Wazwan feast", "Buy certified pure GI-tagged saffron from Pampore"],
    tags: ["Dal Lake", "Mughal Gardens", "Tulips", "Houseboats"]
  },

  // ==========================================
  // POPULAR TOURIST PLACES (12 ICONIC PLACES)
  // ==========================================
  {
    id: "in-place-taj-mahal",
    name: "Taj Mahal",
    category: "tourist_place",
    categoryLabel: "Tourist Landmark",
    zone: "North",
    image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
    shortDescription: "UNESCO World Wonder and universal monument of love, crafted in pure ivory-white marble in Agra.",
    fullOverview: "Commissioned in 1632 by Mughal Emperor Shah Jahan for his beloved wife Mumtaz Mahal, the Taj Mahal is a masterpiece of symmetry and marble inlay craftsmanship on the banks of the Yamuna River.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 27.1751, lon: 78.0421, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Main Marble Mausoleum & Inlay Art", description: "Exquisite Pietra Dura semiprecious stone floral inlay and calligraphy.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80" },
      { name: "Mehtab Bagh (Moonlight Garden)", description: "Charbagh garden complex directly across the Yamuna offering postcard sunset views.", duration: "1 - 2 Hours", image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80" },
      { name: "Agra Fort", description: "Massive red sandstone imperial residence where Shah Jahan spent his final years gazing at the Taj.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["The Taj Mahal is closed to general tourists every Friday", "Enter via the East Gate at sunrise (around 6:00 AM) for golden morning light and minimal crowds", "Leave large bags, food, and tripods behind to clear security quickly"],
    tags: ["World Wonder", "Mughal", "Marble", "Romance"]
  },
  {
    id: "in-place-goa-beaches",
    name: "Goa Beaches",
    category: "tourist_place",
    categoryLabel: "Tourist Landmark",
    zone: "West",
    image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80",
    shortDescription: "World-renowned golden Arabian Sea shores, lively water sports, sun-drenched beach shacks, and tropical sunsets.",
    fullOverview: "Stretching along 100km of coastline, Goa's beaches range from lively northern hubs (Baga, Calangute, Anjuna) with water sports and night flea markets, to tranquil southern havens (Palolem, Agonda, Butterfly Beach) ideal for quiet relaxation.",
    bestTimeToVisit: "November to March",
    coordinates: { lat: 15.5494, lon: 73.7535, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Palolem Beach Crescent", description: "Scenic sheltered southern cove with colorful beachfront wooden huts and dolphin boat trips.", duration: "Full Day", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80" },
      { name: "Anjuna & Vagator Red Cliffs", description: "Iconic hippie flea market and sunset views from the cliffside ramparts of Chapora Fort.", duration: "Half Day", image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80" },
      { name: "Morjim & Ashwem Beaches", description: "Quiet serene shores known as olive ridley turtle nesting sites and upscale beach shacks.", duration: "Half Day", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Head South (Palolem/Agonda) for tranquility; head North (Vagator/Anjuna) for energetic beach clubs", "Always swim within marked lifeguard zones", "Catch stunning sunsets with fresh coconut water at beachside shacks"],
    tags: ["Beaches", "Sunsets", "Water Sports", "Coastline"]
  },
  {
    id: "in-place-hampi",
    name: "Hampi",
    category: "tourist_place",
    categoryLabel: "Tourist Landmark",
    zone: "South",
    image: "https://images.unsplash.com/photo-1631983097767-099c77bf880d?auto=format&fit=crop&w=800&q=80",
    shortDescription: "UNESCO World Heritage boulder-strewn landscape and monumental ruins of the 14th-century Vijayanagara Empire.",
    fullOverview: "Hampi is an open-air historical wonderland. Set against gigantic ochre granite boulders and the Tungabhadra River, discover the iconic stone chariot at Vijaya Vittala Temple, Virupaksha Temple, and the royal Lotus Mahal.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 15.3350, lon: 76.4600, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Vijaya Vittala Temple & Stone Chariot", description: "Iconic stone chariot shrine and musical stone pillars producing resonant acoustic notes.", duration: "2 - 3 Hours", image: "https://images.unsplash.com/photo-1631983097767-099c77bf880d?auto=format&fit=crop&w=600&q=80" },
      { name: "Virupaksha Temple", description: "Seventh-century working temple dedicated to Shiva with a 160ft soaring entrance tower.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=600&q=80" },
      { name: "Matanga Hill & Sunset Viewpoint", description: "Highest vantage point in Hampi offering 360-degree panoramic views of ruins and boulder terrain.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Rent a bicycle or electric scooter to explore the expansive ruins (covering over 25 sq km)", "Climb Matanga Hill for an unforgettable sunrise over the ancient monuments", "Cross the Tungabhadra River on a traditional round coracle boat"],
    tags: ["UNESCO Ruins", "Stone Chariot", "Boulders", "History"]
  },
  {
    id: "in-place-mysore-palace",
    name: "Mysore Palace",
    category: "tourist_place",
    categoryLabel: "Tourist Landmark",
    zone: "South",
    image: "https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Grand Indo-Saracenic royal seat of the Wodeyars, illuminated by nearly 100,000 lights every weekend.",
    fullOverview: "One of India's most visited architectural landmarks, Mysore Palace (Amba Vilas) features ornate domes, stained glass ceilings from Scotland, sculpted columns, and the golden royal throne.",
    bestTimeToVisit: "October to March (Dasara Festival is spectacular)",
    coordinates: { lat: 12.3052, lon: 76.6552, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Durbar Hall & Kalyana Mantapa", description: "Magnificent marriage pavilion with peacock-themed stained glass and vaulted ceilings.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=600&q=80" },
      { name: "Palace Illumination Ceremony", description: "The entire palace glows golden with 100,000 bulbs accompanied by royal police band music.", duration: "45 Minutes", image: "https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=600&q=80" },
      { name: "Residential Museum & Royal Armory", description: "Fascinating collection of royal weapons, costumes, musical instruments, and miniature paintings.", duration: "1 Hour", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Illumination happens on Sundays and public holidays from 7:00 PM to 7:45 PM", "Audio guides in multiple international languages are available at the entrance", "Footwear must be deposited at designated security counters before entering palace halls"],
    tags: ["Royal Palace", "Illumination", "Architecture", "Heritage"]
  },
  {
    id: "in-place-kerala-backwaters",
    name: "Kerala Backwaters",
    category: "tourist_place",
    categoryLabel: "Tourist Landmark",
    zone: "South",
    image: "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Idyllic network of palm-fringed canals, tranquil lagoons, and traditional thatched Kettuvallam houseboats.",
    fullOverview: "The Kerala backwaters form an interconnected 900km labyrinth of lakes, rivers, and canals in Alleppey and Kumarakom. Drift aboard luxurious houseboats past paddy fields, water lilies, and idyllic village life.",
    bestTimeToVisit: "September to March",
    coordinates: { lat: 9.4981, lon: 76.3388, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Overnight Houseboat Cruise (Alleppey)", description: "Glide through tranquil canals with private chef preparing fresh Karimeen fish and Malabar curries.", duration: "1 Night", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80" },
      { name: "Vembanad Lake Sunset", description: "India's longest lake hosting snake boat races and bird sanctuaries at Kumarakom.", duration: "Half Day", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80" },
      { name: "Canoe Village Tours", description: "Small country boat tours navigating narrow village canals inaccessible to large houseboats.", duration: "2 - 3 Hours", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Book an overnight houseboat that includes local lunch, evening tea, and breakfast", "Opt for canoe village rides in narrow channels for a more intimate look at local life", "Carry insect repellent for evening hours on the water"],
    tags: ["Backwaters", "Houseboat", "Tranquility", "Nature"]
  },
  {
    id: "in-place-golden-temple",
    name: "Golden Temple",
    category: "tourist_place",
    categoryLabel: "Tourist Landmark",
    zone: "North",
    image: "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Harmandir Sahib in Amritsar, spiritual beacon of Sikhism, coated in pure gold over sacred Amrit Sarovar waters.",
    fullOverview: "The Golden Temple is one of humanity's most welcoming sacred sanctuaries. The gilded shrine sits in the middle of a holy pool (Amrit Sarovar), where divine kirtan hymns echo continuously and the Langar feeds over 100,000 visitors free every day.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 31.6200, lon: 74.8765, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Harmandir Sahib Sanctum", description: "Two-story gold-plated sanctum where the holy Guru Granth Sahib is enshrined.", duration: "1 - 2 Hours", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80" },
      { name: "Akal Takht & Amrit Sarovar", description: "Highest seat of Sikh temporal authority and the surrounding sacred water tank.", duration: "1 - 2 Hours", image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80" },
      { name: "Guru Ka Langar (Community Kitchen)", description: "The world's largest community kitchen operated by dedicated volunteers feeding all humanity without distinction.", duration: "1 Hour", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Cover your head with a scarf and wash your feet before entering", "Volunteer for 30 minutes in the Langar to experience the selfless spirit of Seva", "Visit late at night (around 10 PM) for the serene Palki Sahib ceremony"],
    tags: ["Golden Temple", "Spirituality", "Langar", "Amritsar"]
  },
  {
    id: "in-place-jaipur-forts",
    name: "Jaipur Forts and Palaces",
    category: "tourist_place",
    categoryLabel: "Tourist Landmark",
    zone: "West",
    image: "https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Majestic Rajput military and royal bastions: Amer Fort, Jaigarh Fort, and Nahargarh Fort overlooking the Pink City.",
    fullOverview: "Jaipur's triumvirate of hilltop citadels represents the zenith of Rajput fort architecture. Amer Fort features shimmering mirror mosaics; Jaigarh houses the world's largest cannon on wheels; Nahargarh offers breathtaking sunset panoramas.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 26.9855, lon: 75.8513, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Amer Fort & Sheesh Mahal", description: "Lavish palace with convex mirror inlays that illuminate the hall with a single candle.", duration: "Half Day", image: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=600&q=80" },
      { name: "Nahargarh Fort Sunset Viewpoint", description: "Perched along the Aravalli ridge offering breathtaking sunset vistas across Jaipur city.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80" },
      { name: "Jaigarh Fort & Jaivana Cannon", description: "Imposing military garrison housing Jaivana, once the world's largest wheeled cannon.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Walk the scenic subterranean tunnel connecting Amer Fort to Jaigarh Fort", "Nahargarh Padao open-air restaurant is famous for evening skyline views", "Wear comfortable shoes for walking up stone ramparts"],
    tags: ["Rajput Forts", "Sheesh Mahal", "Sunsets", "Jaipur"]
  },
  {
    id: "in-place-varanasi-ghats",
    name: "Varanasi Ghats",
    category: "tourist_place",
    categoryLabel: "Tourist Landmark",
    zone: "North",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80",
    shortDescription: "84 stone stairways lining the holy Ganges River, site of ancient rituals, morning baths, and evening Aarti.",
    fullOverview: "The Ghats of Varanasi form the spiritual amphitheater of India. From the holy morning dip at Assi Ghat to the grand choreographic fire offerings at Dashashwamedh and the sacred flames at Manikarnika, life and transcendence converge here.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 25.3076, lon: 83.0107, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Dashashwamedh Ghat Evening Aarti", description: "Spectacular daily ritual where priests in saffron robes perform multi-tiered brass lamp ceremonies.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=600&q=80" },
      { name: "Assi Ghat Subah-e-Banaras", description: "Spiritual morning awakening with classical sitar, Vedic chants, and yoga on the riverbank.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=600&q=80" },
      { name: "Chet Singh & Scindia Ghats", description: "Historic fortress ghats and the famous partially submerged Shiva temple.", duration: "1 - 2 Hours", image: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Take an evening boat and float a leaf diya (candle with marigolds) down the Ganges", "Walk the entire ghat stretch from Assi to Dashashwamedh in the early morning", "Photography of cremation ceremonies at Manikarnika Ghat is strictly forbidden"],
    tags: ["Ganga Ghats", "Aarti", "Ganges River", "Sacred Rituals"]
  },
  {
    id: "in-place-ladakh",
    name: "Ladakh",
    category: "tourist_place",
    categoryLabel: "Tourist Landmark",
    zone: "North",
    image: "https://images.unsplash.com/photo-1685555845405-1503f76a5462?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Dramatic moonscapes, Khardung La pass, Pangong Tso's azure waters, and high-altitude monasteries.",
    fullOverview: "A remote Himalayan plateau known as Little Tibet. Marvel at the dramatic colors of Pangong Lake, ride two-humped camels through the white sand dunes of Nubra Valley, and experience ancient Buddhist chanting at Hemis Monastery.",
    bestTimeToVisit: "May to September",
    coordinates: { lat: 34.1526, lon: 77.5771, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Pangong Tso & Spangmik", description: "World's highest saltwater lake spanning India and Tibet, famous for changing hues.", duration: "1 - 2 Days", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80" },
      { name: "Nubra Valley & Khardung La Pass", description: "Cross one of the highest motorable passes in the world (17,982 ft) into the valley of flowers.", duration: "2 Days", image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80" },
      { name: "Magnetic Hill & Indus Zanskar Confluence", description: "Optical gravity-defying hill and dramatic meeting of two differently colored Himalayan rivers.", duration: "Half Day", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Acclimatize in Leh for at least 48 hours to avoid Acute Mountain Sickness (AMS)", "Carry warm layers as temperature drops sharply after sunset even in summer", "Cash is necessary as network signals for digital payments can be scarce"],
    tags: ["Himalayas", "Moonscape", "Pangong Lake", "High Altitude"]
  },
  {
    id: "in-place-andaman-nicobar",
    name: "Andaman & Nicobar Islands",
    category: "tourist_place",
    categoryLabel: "Tourist Landmark",
    zone: "South",
    image: "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Tropical emerald paradise, Radhanagar Beach, crystal-clear scuba diving, and Cellular Jail memorial.",
    fullOverview: "An island sanctuary surrounded by the Bay of Bengal and Andaman Sea. Features Asia's top-rated Radhanagar Beach on Havelock Island, coral reef snorkeling at Elephant Beach, and sea-walking at Neil Island.",
    bestTimeToVisit: "October to May",
    coordinates: { lat: 11.9846, lon: 92.9510, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Radhanagar Beach (Havelock / Swaraj Dweep)", description: "Sugar-white powder sand and calm crystalline waters surrounded by lush mahua trees.", duration: "Half Day", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80" },
      { name: "Scuba Diving & Coral Reefs", description: "Vibrant coral reefs with sea anemones, manta rays, reef sharks, and sea turtles.", duration: "Half Day", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80" },
      { name: "Cellular Jail Light and Sound Show", description: "Moving historical tribute to freedom fighters incarcerated during the colonial era.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Book ferry tickets (Makruzz or Nautika) between Port Blair and Havelock in advance", "Scuba diving is suitable for both beginners and certified divers", "Carry cash since ATM connectivity can be intermittent on smaller islands"],
    tags: ["Islands", "Beaches", "Coral Diving", "White Sand"]
  },
  {
    id: "in-place-ooty",
    name: "Ooty (Udhagamandalam)",
    category: "tourist_place",
    categoryLabel: "Tourist Landmark",
    zone: "South",
    image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Queen of Hill Stations, UNESCO Nilgiri Mountain Railway toy train, Doddabetta Peak, and tea estates.",
    fullOverview: "Nestled in the Nilgiri Blue Mountains of Tamil Nadu, Ooty is famous for its cool colonial climate, the scenic toy train winding through tunnels and viaducts, emerald tea gardens, and the botanical garden.",
    bestTimeToVisit: "October to June",
    coordinates: { lat: 11.4102, lon: 76.6950, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Nilgiri Mountain Railway (Toy Train)", description: "UNESCO World Heritage heritage steam engine train chugging through mountain bridges.", duration: "Half Day", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80" },
      { name: "Doddabetta Peak & Telescope House", description: "Highest mountain peak in the Nilgiri range (8,652 ft) offering sweeping valley views.", duration: "2 - 3 Hours", image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80" },
      { name: "Ooty Botanical Gardens & Rose Garden", description: "22-hectare botanical gardens established in 1848 with fossilized tree trunks.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Book the toy train tickets on IRCTC months in advance; first class provides best window views", "Visit a working tea factory in Coonoor and sample Nilgiri black tea", "Try local handmade Ooty chocolates"],
    tags: ["Hill Station", "Toy Train", "Tea Gardens", "Nilgiris"]
  },
  {
    id: "in-place-coorg",
    name: "Coorg (Kodagu)",
    category: "tourist_place",
    categoryLabel: "Tourist Landmark",
    zone: "South",
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
    shortDescription: "Scotland of India, aromatic coffee & spice plantations, Abbey Falls, and Tibetan golden temple at Bylakuppe.",
    fullOverview: "Cradled in the Western Ghats of Karnataka, Coorg is an aromatic hill sanctuary covered with coffee bushes, cardamom, and black pepper. Highlights include Abbey Falls, Dubare Elephant Camp, and Namdroling Monastery.",
    bestTimeToVisit: "October to March",
    coordinates: { lat: 12.4244, lon: 75.7382, tz: "Asia/Kolkata" },
    topAttractions: [
      { name: "Namdroling Tibetan Golden Temple (Bylakuppe)", description: "Magnificent Tibetan monastery complex featuring three 40ft towering gilded Buddha statues.", duration: "2 - 3 Hours", image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80" },
      { name: "Abbey & Iruppu Falls", description: "Roaring waterfalls tucked into lush private coffee and spice plantations.", duration: "2 Hours", image: "https://images.unsplash.com/photo-1598890777032-bde13fba5be3?auto=format&fit=crop&w=600&q=80" },
      { name: "Dubare Elephant Camp", description: "Riverside camp on the Kaveri River where visitors can participate in elephant bathing and feeding.", duration: "Half Day", image: "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=600&q=80" }
    ],
    travelTips: ["Stay in a heritage coffee plantation homestay for an authentic Kodava experience", "Taste spicy Pandi Curry (or bamboo shoot curry) with Akki Roti", "Buy freshly roasted Arabica and Robusta coffee beans directly from estates"],
    tags: ["Coffee Plantations", "Waterfalls", "Western Ghats", "Homestays"]
  }
];

// Helper service for querying India destinations
const IndiaDataService = {
  getAll() {
    return INDIA_DESTINATIONS;
  },

  getById(id) {
    return INDIA_DESTINATIONS.find(d => d.id === id);
  },

  getByCategory(category) {
    if (category === "all") return INDIA_DESTINATIONS;
    if (category === "states_uts") {
      return INDIA_DESTINATIONS.filter(d => d.category === "state" || d.category === "ut");
    }
    return INDIA_DESTINATIONS.filter(d => d.category === category);
  },

  getStates() {
    return this.getByCategory("state");
  },

  getUnionTerritories() {
    return this.getByCategory("ut");
  },

  getCities() {
    return this.getByCategory("city");
  },

  getTouristPlaces() {
    return this.getByCategory("tourist_place");
  },

  search(query, category = "all", zone = "all") {
    let list = this.getByCategory(category);

    if (zone && zone !== "all") {
      list = list.filter(d => d.zone === zone);
    }

    if (!query || !query.trim()) return list;

    const q = query.toLowerCase().trim();
    return list.filter(d => {
      const matchName = d.name.toLowerCase().includes(q);
      const matchDesc = d.shortDescription.toLowerCase().includes(q);
      const matchZone = d.zone.toLowerCase().includes(q);
      const matchTags = d.tags && d.tags.some(t => t.toLowerCase().includes(q));
      const matchAttractions = d.topAttractions && d.topAttractions.some(a => a.name.toLowerCase().includes(q));
      return matchName || matchDesc || matchZone || matchTags || matchAttractions;
    });
  }
};

// Expose globally
window.INDIA_DESTINATIONS = INDIA_DESTINATIONS;
window.IndiaDataService = IndiaDataService;
