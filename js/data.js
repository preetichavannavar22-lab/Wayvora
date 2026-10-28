/**
 * Wayvora - Curated Destinations Dataset
 * Comprehensive travel data for global destinations with attractions, budget, tips, and weather.
 */

const DESTINATIONS = [
  {
    id: "paris",
    name: "Paris",
    country: "France",
    region: "Europe",
    tagline: "The City of Light, art, fashion, and romance",
    shortDescription: "Immerse yourself in world-class art at the Louvre, marvel at the Eiffel Tower, and stroll down cobblestone Parisian boulevards lined with historic cafes.",
    fullOverview: "Paris, France's capital, is a major European city and a global center for art, fashion, gastronomy, and culture. Its 19th-century cityscape is crisscrossed by wide boulevards and the River Seine. Beyond such landmarks as the Eiffel Tower and the 12th-century, Gothic Notre-Dame cathedral, the city is known for its cafe culture and designer boutiques along the Rue du Faubourg Saint-Honoré.",
    heroImage: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80",
    cardImage: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1431274172761-fca41d930114?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.9,
    reviewsCount: 1420,
    bestTimeToVisit: "April to October",
    seasonTag: "Spring & Autumn",
    budgetLevel: "$$",
    currency: "EUR",
    dailyBudgetEstimated: 150,
    budgetBreakdown: {
      accommodation: "€90 / night",
      food: "€35 / day",
      transport: "€10 / day",
      activities: "€25 / day"
    },
    tags: ["Culture", "Romance", "Art", "Foodie", "Historic"],
    trending: true,
    popular: true,
    weather: {
      temp: "19°C",
      condition: "Mild & Sunny",
      bestMonths: "May - Sep"
    },
    topAttractions: [
      {
        id: "paris-eiffel",
        name: "Eiffel Tower",
        description: "Iconic wrought-iron lattice monument on the Champ de Mars with panoramic views.",
        duration: "2 - 3 Hours",
        category: "Landmark",
        image: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "paris-louvre",
        name: "Louvre Museum",
        description: "The world's largest art museum, home to the Mona Lisa and Venus de Milo.",
        duration: "3 - 4 Hours",
        category: "Museum",
        image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "paris-montmartre",
        name: "Montmartre & Sacré-Cœur",
        description: "Bohemian hilltop district famed for artists, picturesque cafes, and the white basilica.",
        duration: "3 Hours",
        category: "Neighborhood",
        image: "https://images.unsplash.com/photo-1431274172761-fca41d930114?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "paris-seine-cruise",
        name: "Seine River Sunset Cruise",
        description: "Glide beneath historic bridges while enjoying glowing vistas of illuminated monuments.",
        duration: "1.5 Hours",
        category: "Experience",
        image: "https://images.unsplash.com/photo-1431274172761-fca41d930114?auto=format&fit=crop&w=600&q=80"
      }
    ],
    thingsToDo: [
      "Indulge in fresh croissants and espresso at a Saint-Germain café",
      "Wander through the Luxembourg Gardens during golden hour",
      "Explore vintage book stalls along the Seine embankment",
      "Browse boutique fashion in Le Marais district"
    ],
    travelTips: [
      "Purchase a Paris Museum Pass to skip ticket lines at over 50 attractions.",
      "The metro is the fastest and most affordable way to navigate the 20 arrondissements.",
      "Always greet shopkeepers with a polite 'Bonjour' upon entering.",
      "Tap water in Paris is safe and readily available at ornate Wallace fountains."
    ]
  },
  {
    id: "dubai",
    name: "Dubai",
    country: "United Arab Emirates",
    region: "Middle East",
    tagline: "Futuristic architecture, luxury shopping, and desert thrills",
    shortDescription: "Marvel at futuristic skyscrapers piercing the clouds, embark on exhilarating desert safaris, and experience ultra-modern luxury.",
    fullOverview: "Dubai is a city and emirate in the United Arab Emirates known for luxury shopping, ultramodern architecture, and a lively nightlife scene. Burj Khalifa, an 830m-tall tower, dominates the skyscraper-filled skyline. At its foot lies Dubai Fountain, with jets and lights choreographed to music. On artificial islands just offshore is Atlantis, The Palm, a resort with water and marine-animal parks.",
    heroImage: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80",
    cardImage: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.8,
    reviewsCount: 1180,
    bestTimeToVisit: "November to March",
    seasonTag: "Winter",
    budgetLevel: "$$",
    currency: "AED",
    dailyBudgetEstimated: 750,
    budgetBreakdown: {
      accommodation: "AED 440 / night",
      food: "AED 180 / day",
      transport: "AED 55 / day",
      activities: "AED 150 / day"
    },
    tags: ["Luxury", "Skyline", "Desert", "Shopping", "Adventure"],
    trending: true,
    popular: true,
    weather: {
      temp: "26°C",
      condition: "Pleasant & Clear",
      bestMonths: "Nov - Mar"
    },
    topAttractions: [
      {
        id: "dubai-burj-khalifa",
        name: "Burj Khalifa Observation Deck",
        description: "The world's tallest architectural marvel with sweeping 360-degree desert and gulf views.",
        duration: "2 Hours",
        category: "Landmark",
        image: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "dubai-desert-safari",
        name: "Arabian Desert Safari",
        description: "Dune bashing, camel riding, sandboarding, and traditional BBQ dinner under starlit skies.",
        duration: "6 Hours",
        category: "Adventure",
        image: "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "dubai-palm-jumeirah",
        name: "Palm Jumeirah & The View",
        description: "Famous palm tree-shaped archipelago featuring ultra-luxury resorts and beach clubs.",
        duration: "3 Hours",
        category: "Island & Scenic",
        image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "dubai-marina-walk",
        name: "Dubai Marina & Yacht Cruise",
        description: "Stroll along waterfront promenades or set sail on a sunset catamaran through the marina.",
        duration: "2.5 Hours",
        category: "Leisure",
        image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80"
      }
    ],
    thingsToDo: [
      "Watch the dazzling Dubai Fountain choreography at twilight",
      "Shop for gold and exotic spices in Old Dubai's traditional souks",
      "Ride the abra water taxi across Dubai Creek",
      "Visit the Museum of the Future with its groundbreaking calligraphic facade"
    ],
    travelTips: [
      "Visit between November and March when daytime temperatures are remarkably comfortable.",
      "Dress modestly when visiting historic neighborhoods, government buildings, and mosques.",
      "The Dubai Metro is exceptionally clean, air-conditioned, and connects major attractions.",
      "Friday afternoons and weekends are peak hours for malls and fountain displays."
    ]
  },
  {
    id: "bali",
    name: "Bali",
    country: "Indonesia",
    region: "Asia",
    tagline: "Tropical paradise, emerald rice terraces, and sacred temples",
    shortDescription: "Find tranquility in lush jungle retreats, catch epic ocean swells along southern beaches, and uncover rich spiritual heritage.",
    fullOverview: "Bali is an Indonesian island known for its forested volcanic mountains, iconic rice paddies, pristine beaches, and coral reefs. The island is home to religious sites such as cliffside Uluwatu Temple. To the south, the beachside city of Kuta has lively bars, while Seminyak, Sanur, and Nusa Dua are popular resort towns. The island is also renowned for its yoga and meditation retreats.",
    heroImage: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=80",
    cardImage: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.9,
    reviewsCount: 1650,
    bestTimeToVisit: "April to October",
    seasonTag: "Dry Season",
    budgetLevel: "$",
    currency: "IDR",
    dailyBudgetEstimated: 1000000,
    budgetBreakdown: {
      accommodation: "Rp 550,000 / night",
      food: "Rp 240,000 / day",
      transport: "Rp 120,000 / day",
      activities: "Rp 190,000 / day"
    },
    tags: ["Beaches", "Tropical", "Spiritual", "Nature", "Budget-Friendly"],
    trending: true,
    popular: true,
    weather: {
      temp: "28°C",
      condition: "Tropical Breeze",
      bestMonths: "Apr - Oct"
    },
    topAttractions: [
      {
        id: "bali-tegallalang",
        name: "Tegallalang Rice Terraces",
        description: "Breathtaking stepped emerald green paddies carved into steep hillsides near Ubud.",
        duration: "2 - 3 Hours",
        category: "Nature",
        image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "bali-uluwatu",
        name: "Uluwatu Sea Temple",
        description: "Perched dramatically on a 70-meter limestone cliff overlooking crashing Indian Ocean waves.",
        duration: "2.5 Hours",
        category: "Temple & Sunset",
        image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "bali-ubud-monkey",
        name: "Sacred Monkey Forest Sanctuary",
        description: "Mystical jungle nature reserve and Hindu temple complex inhabited by hundreds of macaque monkeys.",
        duration: "2 Hours",
        category: "Wildlife",
        image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "bali-nusa-penida",
        name: "Nusa Penida Kelingking Beach",
        description: "Famous coastal T-Rex rock formation and turquoise waters just a short boat ride from Bali.",
        duration: "Full Day",
        category: "Coastal Adventure",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
      }
    ],
    thingsToDo: [
      "Witness an enchanting Kecak Fire Dance performance at Uluwatu at sunset",
      "Attend a sunrise yoga session amidst organic rice fields in Ubud",
      "Surf the beginner and intermediate breaks along Canggu beach",
      "Sample authentic Nasi Campur and fresh coconut water at a local warung"
    ],
    travelTips: [
      "Rent a scooter only if you are an experienced rider; alternatively, hire private drivers for $35-$45/day.",
      "Wear a sarong (usually provided or rented at entrances) when entering Balinese temples.",
      "Carry cash (Indonesian Rupiah) as many traditional markets and small restaurants don't accept cards.",
      "Respect religious daily offerings (Canang Sari) laid on sidewalks and entranceways."
    ]
  },
  {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    region: "Asia",
    tagline: "Neon-lit metropolis where ancient tradition meets bleeding-edge technology",
    shortDescription: "Explore electric cyber districts, serene Meiji shrines, world-renowned culinary alleys, and cherry blossom-draped parks.",
    fullOverview: "Tokyo, Japan’s busy capital, mixes the ultramodern and the traditional, from neon-lit skyscrapers to historic temples. The opulent Meiji Shinto Shrine is known for its towering gate and surrounding woods. The Imperial Palace sits amid large public gardens. The city's many museums offer exhibits ranging from classical art in the Tokyo National Museum to a reconstructed kabuki theater.",
    heroImage: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=80",
    cardImage: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.95,
    reviewsCount: 1980,
    bestTimeToVisit: "March to May & September to November",
    seasonTag: "Spring & Autumn",
    budgetLevel: "$$",
    currency: "JPY",
    dailyBudgetEstimated: 22000,
    budgetBreakdown: {
      accommodation: "¥12,500 / night",
      food: "¥5,500 / day",
      transport: "¥1,500 / day",
      activities: "¥3,000 / day"
    },
    tags: ["Metropolis", "Tech", "Culture", "Foodie", "Modern"],
    trending: true,
    popular: true,
    weather: {
      temp: "21°C",
      condition: "Clear & Crisp",
      bestMonths: "Mar - May, Oct - Nov"
    },
    topAttractions: [
      {
        id: "tokyo-shibuya-crossing",
        name: "Shibuya Crossing & Hachiko",
        description: "The world's busiest pedestrian intersection illuminated by towering giant LED screens.",
        duration: "1.5 Hours",
        category: "Iconic Spot",
        image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "tokyo-sensoji",
        name: "Senso-ji Temple Asakusa",
        description: "Tokyo's oldest and most revered Buddhist temple with the bustling Nakamise shopping street.",
        duration: "2.5 Hours",
        category: "Historic Temple",
        image: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "tokyo-shinjuku-gyoen",
        name: "Shinjuku Gyoen National Garden",
        description: "Expansive tranquil park blending traditional Japanese, English, and French garden styles.",
        duration: "2 - 3 Hours",
        category: "Garden",
        image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "tokyo-teamlab",
        name: "teamLab Planets Digital Art",
        description: "Immersive sensory digital art museum where visitors walk through water and light installations.",
        duration: "2 Hours",
        category: "Art & Tech",
        image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80"
      }
    ],
    thingsToDo: [
      "Slurp hot steaming artisanal tonkotsu ramen at an alleyway counter",
      "Hunt for retro video games and anime collectibles in Akihabara",
      "Stroll under the glowing red lanterns of Omoide Yokocho",
      "Gaze out over Mount Fuji from the Tokyo Skytree observation deck"
    ],
    travelTips: [
      "Get an IC card (Suica or Pasmo) on your phone or at the station for seamless subway and train travel.",
      "Tipping is not customary in Japan and can even cause polite confusion.",
      "Carry a pocket trash bag as public trash bins are rare throughout Tokyo streets.",
      "Download a translation app to scan kanji menus at local izakayas."
    ]
  },
  {
    id: "switzerland",
    name: "Switzerland",
    country: "Switzerland",
    region: "Europe",
    tagline: "Alpine majesty, glistening lakes, and postcard-perfect mountain villages",
    shortDescription: "Ride panoramic mountain trains past snow-capped peaks, cruise crystal-clear glacial lakes, and savor world-famous chocolate and cheese.",
    fullOverview: "Switzerland is a mountainous Central European nation home to numerous lakes, villages, and the high peaks of the Alps. Its cities contain medieval quarters, with landmarks like capital Bern’s Zytglogge clock tower and Lucerne’s wooden chapel bridge. The country is also renowned for its ski resorts, hiking trails, banking industry, and Swiss watches and chocolate.",
    heroImage: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1600&q=80",
    cardImage: "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.95,
    reviewsCount: 1540,
    bestTimeToVisit: "June to September & December to March",
    seasonTag: "Year-Round",
    budgetLevel: "$$",
    currency: "CHF",
    dailyBudgetEstimated: 195,
    budgetBreakdown: {
      accommodation: "CHF 115 / night",
      food: "CHF 45 / day",
      transport: "CHF 20 / day",
      activities: "CHF 30 / day"
    },
    tags: ["Mountains", "Nature", "Scenic", "Adventure", "Alpine"],
    trending: true,
    popular: true,
    weather: {
      temp: "17°C",
      condition: "Alpine Fresh",
      bestMonths: "Jun - Sep, Dec - Mar"
    },
    topAttractions: [
      {
        id: "swiss-matterhorn",
        name: "Zermatt & The Matterhorn",
        description: "Car-free alpine jewel featuring the dramatic pyramid peak of the world's most photographed mountain.",
        duration: "Full Day",
        category: "Mountain",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "swiss-jungfraujoch",
        name: "Jungfraujoch - Top of Europe",
        description: "Ride Europe's highest railway station into a world of year-round snow, ice palaces, and glaciers.",
        duration: "4 - 5 Hours",
        category: "Alpine Wonder",
        image: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "swiss-lucerne",
        name: "Lake Lucerne & Chapel Bridge",
        description: "Historic wooden covered bridge adorned with 17th-century paintings, set against alpine shores.",
        duration: "3 Hours",
        category: "Historic Lake",
        image: "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "swiss-lauterbrunnen",
        name: "Lauterbrunnen Valley of 72 Waterfalls",
        description: "Lush glacial valley flanked by vertical cliffs and thunderous cascading waterfalls.",
        duration: "4 Hours",
        category: "Scenic Nature",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80"
      }
    ],
    thingsToDo: [
      "Board the Glacier Express for a scenic journey through deep gorges and high mountain passes",
      "Savor authentic bubbling Gruyère cheese fondue at a cozy rustic chalet",
      "Hike the floral trails from First to the mirror-like Bachalpsee lake",
      "Take a relaxing steamboat paddle cruise across Lake Geneva"
    ],
    travelTips: [
      "Invest in a Swiss Travel Pass for unlimited travel across trains, panoramic boats, and urban buses.",
      "Switzerland is very cashless; contactless debit and credit cards are welcomed everywhere.",
      "Mountain weather changes swiftly—always dress in breathable layers and bring rain protection.",
      "Tap water flowing from city fountains is pristine, refreshing alpine spring water."
    ]
  },
  {
    id: "london",
    name: "London",
    country: "United Kingdom",
    region: "Europe",
    tagline: "Centuries of royal history, theatrical brilliance, and cultural diversity",
    shortDescription: "Discover timeless monuments from Big Ben to the Tower of London, world-class free museums, and vibrant neighborhood markets.",
    fullOverview: "London, the capital of England and the United Kingdom, is a 21st-century city with history stretching back to Roman times. At its center stand the imposing Houses of Parliament, the iconic 'Big Ben' clock tower and Westminster Abbey, site of British monarch coronations. Across the Thames River, the London Eye observation wheel provides panoramic views of the South Bank cultural complex.",
    heroImage: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1600&q=80",
    cardImage: "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.85,
    reviewsCount: 1610,
    bestTimeToVisit: "May to September",
    seasonTag: "Summer & Spring",
    budgetLevel: "$$",
    currency: "GBP",
    dailyBudgetEstimated: 135,
    budgetBreakdown: {
      accommodation: "£80 / night",
      food: "£32 / day",
      transport: "£10 / day",
      activities: "£16 / day"
    },
    tags: ["History", "Culture", "Museums", "City Break", "Theaters"],
    trending: false,
    popular: true,
    weather: {
      temp: "18°C",
      condition: "Mild & Breezy",
      bestMonths: "May - Sep"
    },
    topAttractions: [
      {
        id: "london-tower-bridge",
        name: "Tower Bridge & Tower of London",
        description: "Victorian suspension bridge paired with the thousand-year-old royal fortress housing the Crown Jewels.",
        duration: "3 Hours",
        category: "Historic Landmark",
        image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "london-british-museum",
        name: "The British Museum",
        description: "World-leading museum of history, art, and culture housing the Rosetta Stone and Parthenon sculptures.",
        duration: "3 Hours",
        category: "Museum",
        image: "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "london-big-ben",
        name: "Big Ben & Westminster Abbey",
        description: "The heartbeat of British democracy and royalty standing beside the River Thames.",
        duration: "2 Hours",
        category: "Monument",
        image: "https://images.unsplash.com/photo-1486299267070-83823f5448dd?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "london-covent-garden",
        name: "Covent Garden & West End",
        description: "Bustling piazza filled with street performers, craft markets, and acclaimed West End theater musicals.",
        duration: "3 Hours",
        category: "Entertainment",
        image: "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&w=600&q=80"
      }
    ],
    thingsToDo: [
      "Experience afternoon tea with warm scones, clotted cream, and strawberry jam",
      "Browse colorful street food stalls and antique vendors at Borough Market",
      "Catch an award-winning musical in London's famous West End theater district",
      "Stroll through royal Kensington Gardens and Hyde Park"
    ],
    travelTips: [
      "Most major national museums (British Museum, Natural History, Tate Modern) have completely free admission!",
      "Use contactless bank cards or Apple/Google Pay for tap-in tap-out transit on the Tube and red double-decker buses.",
      "Stand on the right side of escalators on the London Underground at all times.",
      "Bring a compact umbrella; London showers can arrive unexpectedly in any season."
    ]
  },
  {
    id: "new-york",
    name: "New York",
    country: "United States",
    region: "Americas",
    tagline: "The city that never sleeps, radiating endless energy and iconic skyline",
    shortDescription: "Feel the vibrant electric pulse of Times Square, gaze from soaring skyscraper observatories, and take peaceful walks through Central Park.",
    fullOverview: "New York City comprises 5 boroughs sitting where the Hudson River meets the Atlantic Ocean. At its core is Manhattan, a densely populated borough that’s among the world’s major commercial, financial, and cultural centers. Its iconic sites range from skyscrapers such as the Empire State Building and sprawling Central Park to Broadway theater staged in neon-lit Times Square.",
    heroImage: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1600&q=80",
    cardImage: "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.8,
    reviewsCount: 1780,
    bestTimeToVisit: "April to June & September to November",
    seasonTag: "Spring & Autumn",
    budgetLevel: "$$",
    currency: "USD",
    dailyBudgetEstimated: 230,
    budgetBreakdown: {
      accommodation: "$140 / night",
      food: "$55 / day",
      transport: "$10 / day",
      activities: "$30 / day"
    },
    tags: ["Metropolis", "Skyline", "Broadway", "Culture", "Nightlife"],
    trending: false,
    popular: true,
    weather: {
      temp: "22°C",
      condition: "Bright & Sunny",
      bestMonths: "May - Jun, Sep - Oct"
    },
    topAttractions: [
      {
        id: "ny-central-park",
        name: "Central Park",
        description: "843 acres of green meadows, tranquil lakes, bridges, and winding forested paths in the heart of Manhattan.",
        duration: "3 - 4 Hours",
        category: "Park & Scenic",
        image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "ny-times-square",
        name: "Times Square & Broadway",
        description: "The buzzing heart of the theater district dazzling with giant digital billboards and live Broadway shows.",
        duration: "2 Hours",
        category: "City Pulse",
        image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "ny-summit-one",
        name: "Summit One Vanderbilt / Empire State",
        description: "Mirrored infinity observation rooms offering jaw-dropping views over Manhattan's skyline.",
        duration: "2 Hours",
        category: "Viewpoint",
        image: "https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "ny-brooklyn-bridge",
        name: "Brooklyn Bridge Walk",
        description: "Historic 19th-century suspension bridge linking Manhattan and Brooklyn with waterfront skyline views.",
        duration: "1.5 Hours",
        category: "Iconic Walk",
        image: "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=600&q=80"
      }
    ],
    thingsToDo: [
      "Walk the High Line elevated rail park through Chelsea and the Meatpacking District",
      "Grab a classic New York dollar slice of piping hot cheesy pizza",
      "Board the Staten Island Ferry for unbeatable free views of the Statue of Liberty",
      "Explore international food vendors at Chelsea Market"
    ],
    travelTips: [
      "The NYC Subway operates 24/7. Use OMNY to tap your phone or credit card directly at turnstiles.",
      "Tipping 18-20% is customary in sit-down restaurants and bars.",
      "Book Broadway tickets early or check the TKTS booth in Times Square for day-of discounted seats.",
      "Wear your most comfortable walking shoes—you will easily clock 15,000+ steps per day."
    ]
  },
  {
    id: "maldives",
    name: "Maldives",
    country: "Maldives",
    region: "Asia",
    tagline: "Overwater villas, crystal turquoise lagoons, and untouched coral reefs",
    shortDescription: "Unwind in barefoot luxury suspended above crystal-clear waters, swim alongside manta rays, and watch sensational tropical sunsets.",
    fullOverview: "The Maldives is a tropical nation in the Indian Ocean composed of 26 ring-shaped atolls, which are made up of more than 1,000 coral islands. It’s known for its beaches, blue lagoons, and extensive reefs. The capital, Malé, has a bustling fish market, restaurants, and shops on the main road, Majeedhee Magu, and the 17th-century Hukuru Miskiy (also known as Friday Mosque) made of carved white coral.",
    heroImage: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1600&q=80",
    cardImage: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.95,
    reviewsCount: 1290,
    bestTimeToVisit: "November to April",
    seasonTag: "Dry Monsoon",
    budgetLevel: "$$",
    currency: "USD",
    dailyBudgetEstimated: 290,
    budgetBreakdown: {
      accommodation: "$200 / night",
      food: "$55 / day",
      transport: "$20 / day",
      activities: "$35 / day"
    },
    tags: ["Luxury", "Beaches", "Romantic", "Islands", "Diving"],
    trending: true,
    popular: true,
    weather: {
      temp: "29°C",
      condition: "Tropical Sunshine",
      bestMonths: "Dec - Apr"
    },
    topAttractions: [
      {
        id: "maldives-coral-reef",
        name: "Baa Atoll UNESCO Biosphere",
        description: "World-renowned marine reserve where travelers snorkel with gentle whale sharks and manta rays.",
        duration: "4 - 5 Hours",
        category: "Marine Adventure",
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "maldives-sandbank",
        name: "Private Sandbank Sunset Picnic",
        description: "Secluded pure white sandbank surrounded by endless turquoise water for an unforgettable picnic.",
        duration: "3 Hours",
        category: "Romantic",
        image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "maldives-underwater-dining",
        name: "Underwater Restaurant Experience",
        description: "Dine five meters below sea level surrounded by colorful tropical fish and vibrant coral formations.",
        duration: "2 Hours",
        category: "Luxury Dining",
        image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "maldives-watersports",
        name: "Catamaran Sailing & Dolphin Cruise",
        description: "Sail across serene atolls as pods of wild spinner dolphins leap beside the bow.",
        duration: "2.5 Hours",
        category: "Ocean Wildlife",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
      }
    ],
    thingsToDo: [
      "Step directly from your private overwater bungalow deck into warm lagoon waters",
      "Experience night snorkeling with glowing bioluminescent plankton",
      "Treat yourself to an open-air beachfront massage to the soundtrack of gentle waves",
      "Learn traditional Maldivian line fishing under twilight skies"
    ],
    travelTips: [
      "Speedboat transfers are ideal for resorts near Malé, while distant atolls require breathtaking scenic seaplanes.",
      "The Maldives is a 100% Muslim nation; public local islands have modest dress codes, while private resort islands are relaxed.",
      "Bring reef-safe sunscreen to protect delicate coral ecosystems.",
      "All-inclusive resort packages often provide the best value for dining and watersports."
    ]
  },
  {
    id: "kerala",
    name: "Kerala",
    country: "India",
    region: "Asia",
    tagline: "God's Own Country: tranquil backwaters, tea hills, and Ayurvedic wellness",
    shortDescription: "Drift aboard traditional thatched houseboats along palm-fringed backwaters, breathe crisp mountain air in Munnar's tea estates, and discover ancient spice culture.",
    fullOverview: "Kerala, a state on India's tropical Malabar Coast, has nearly 600km of Arabian Sea shoreline. It's known for its palm-lined beaches and backwaters, a network of canals. Inland are the Western Ghats, mountains whose slopes support tea, coffee and spice plantations as well as wildlife. National parks like Periyar and Silent Valley are home to elephants, tigers and rare bird species.",
    heroImage: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1600&q=80",
    cardImage: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.85,
    reviewsCount: 1120,
    bestTimeToVisit: "September to March",
    seasonTag: "Winter & Post-Monsoon",
    budgetLevel: "$",
    currency: "INR",
    dailyBudgetEstimated: 4200,
    budgetBreakdown: {
      accommodation: "₹2,200 / night",
      food: "₹1,000 / day",
      transport: "₹500 / day",
      activities: "₹500 / day"
    },
    tags: ["Nature", "Backwaters", "Wellness", "Culture", "Budget-Friendly"],
    trending: true,
    popular: true,
    weather: {
      temp: "27°C",
      condition: "Lush & Tropical",
      bestMonths: "Oct - Mar"
    },
    topAttractions: [
      {
        id: "kerala-alleppey-backwaters",
        name: "Alleppey Houseboat Cruise",
        description: "Float through serene emerald canals, paddy fields, and peaceful villages on a traditional Kettuvallam.",
        duration: "Overnight / 6 Hours",
        category: "Backwater Experience",
        image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "kerala-munnar-tea",
        name: "Munnar Tea Plantations",
        description: "Rolling mist-shrouded green hills carpeted with lush tea gardens and colonial-era estates.",
        duration: "Full Day",
        category: "Hill Station",
        image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "kerala-kochi-fort",
        name: "Fort Kochi & Chinese Fishing Nets",
        description: "Colonial port town steeped in Portuguese and Dutch architecture with famous shore-operated lift nets.",
        duration: "3 Hours",
        category: "Heritage",
        image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "kerala-periyar-wildlife",
        name: "Periyar National Park Thekkady",
        description: "Protected wildlife sanctuary around a scenic lake where herds of wild elephants roam the banks.",
        duration: "4 Hours",
        category: "Wildlife & Forest",
        image: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=600&q=80"
      }
    ],
    thingsToDo: [
      "Experience an authentic Kerala Sadya banquet served on fresh banana leaves",
      "Revitalize your body with traditional Ayurvedic herbal oil massage therapies",
      "Watch a mesmerizing Kathakali classical dance drama with elaborate makeup and costumes",
      "Tour aromatic spice gardens smelling fresh cardamom, cinnamon, and cloves"
    ],
    travelTips: [
      "October through March offers the most pleasant climate with clear skies and mild humidity.",
      "Pre-book government-certified houseboats from the DTPC Alleppey jetty for transparent pricing.",
      "Try local specialty dishes like Appam with coconut vegetable stew and Karimeen Pollichathu.",
      "The state is very safe and boasts India's highest literacy and health standards."
    ]
  },
  {
    id: "goa",
    name: "Goa",
    country: "India",
    region: "Asia",
    tagline: "Sun-drenched golden shores, Portuguese heritage, and vibrant coastal vibes",
    shortDescription: "Bask on sun-kissed beaches, explore colorful Latin quarters in Fontainhas, sample zesty coastal seafood, and soak in bohemian nightlife.",
    fullOverview: "Goa is a state in western India with coastlines stretching along the Arabian Sea. Its long history as a Portuguese colony prior to 1961 is evident in its preserved 17th-century churches and the area’s tropical spice plantations. Goa is also known for its beaches, ranging from popular stretches at Baga and Palolem to those in laid-back fishing villages such as Agonda.",
    heroImage: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=80",
    cardImage: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.75,
    reviewsCount: 1390,
    bestTimeToVisit: "November to February",
    seasonTag: "Winter Season",
    budgetLevel: "$",
    currency: "INR",
    dailyBudgetEstimated: 3800,
    budgetBreakdown: {
      accommodation: "₹2,000 / night",
      food: "₹1,000 / day",
      transport: "₹400 / day",
      activities: "₹400 / day"
    },
    tags: ["Beaches", "Nightlife", "Seafood", "Colonial", "Budget-Friendly"],
    trending: true,
    popular: true,
    weather: {
      temp: "29°C",
      condition: "Sunny & Warm",
      bestMonths: "Nov - Feb"
    },
    topAttractions: [
      {
        id: "goa-palolem",
        name: "Palolem Beach South Goa",
        description: "Crescent-shaped serene beach backed by leaning coconut palms, colorful beach shacks, and calm waters.",
        duration: "Half Day",
        category: "Beach & Relaxation",
        image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "goa-fontainhas",
        name: "Fontainhas Latin Quarter",
        description: "Charming heritage quarter of Panaji with bright yellow, terracotta, and indigo Portuguese villas.",
        duration: "2 Hours",
        category: "Historic Walk",
        image: "https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "goa-dudhsagar",
        name: "Dudhsagar Waterfalls",
        description: "Spectacular four-tiered waterfall cascading like a sea of milk amidst dense Western Ghats jungle.",
        duration: "5 - 6 Hours",
        category: "Nature & Trek",
        image: "https://images.unsplash.com/photo-1546853020-ca4909aef454?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "goa-fort-aguada",
        name: "Fort Aguada & Lighthouse",
        description: "Well-preserved 17th-century Portuguese coastal fortress overlooking the Mandovi River and Arabian Sea.",
        duration: "2 Hours",
        category: "Historical Fortress",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
      }
    ],
    thingsToDo: [
      "Rent a scooter to explore secluded beaches like Butterfly Beach and Ashvem",
      "Feast on fiery Goan fish curry, prawn balchão, and fresh poi bread",
      "Dance to sunset beats at lively beachfront shacks in Anjuna and Vagator",
      "Take a sunset cruise on the Mandovi River with Goan folk music"
    ],
    travelTips: [
      "Rent a two-wheeler (scooter) for easy navigation along narrow coastal village roads ($5-$7/day).",
      "North Goa offers high-energy beach clubs and markets; South Goa offers tranquil unspoiled beaches and luxury.",
      "Respect beach safety flags and avoid swimming in rough monsoon surf.",
      "Sample local cashew feni and traditional Bebinca layer cake."
    ]
  },
  {
    id: "rome",
    name: "Rome",
    country: "Italy",
    region: "Europe",
    tagline: "The Eternal City of emperors, gladiators, and timeless culinary romance",
    shortDescription: "Walk through living ancient history at the Colosseum, toss a coin into the Trevi Fountain, and savor hand-spun pasta in Trastevere.",
    fullOverview: "Rome is the capital city of Italy. It is also the capital of the Lazio region. With 2.8 million residents, it is the country's most populated commune. Rome is located in the central-western portion of the Italian Peninsula, along the shores of the Tiber. The Vatican City is an independent country within the city boundaries of Rome.",
    heroImage: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1600&q=80",
    cardImage: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.88,
    reviewsCount: 1450,
    bestTimeToVisit: "April to June & September to October",
    seasonTag: "Spring & Autumn",
    budgetLevel: "$$",
    currency: "EUR",
    dailyBudgetEstimated: 140,
    budgetBreakdown: {
      accommodation: "€80 / night",
      food: "€35 / day",
      transport: "€8 / day",
      activities: "€20 / day"
    },
    tags: ["History", "Architecture", "Foodie", "Culture", "Monuments"],
    trending: false,
    popular: true,
    weather: {
      temp: "23°C",
      condition: "Sunny & Warm",
      bestMonths: "Apr - Jun, Sep - Oct"
    },
    topAttractions: [
      {
        id: "rome-colosseum",
        name: "Colosseum & Roman Forum",
        description: "The monumental 2,000-year-old amphitheater and the ancient civic heart of the Roman Empire.",
        duration: "3 - 4 Hours",
        category: "Ancient Monument",
        image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "rome-vatican",
        name: "Vatican Museums & Sistine Chapel",
        description: "Michelangelo’s legendary ceiling frescoes and the majestic St. Peter’s Basilica.",
        duration: "4 Hours",
        category: "Art & Religion",
        image: "https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "rome-trevi-fountain",
        name: "Trevi Fountain & Spanish Steps",
        description: "Baroque marble masterwork where legend promises tossing a coin ensures your return to Rome.",
        duration: "1.5 Hours",
        category: "Baroque Landmark",
        image: "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "rome-trastevere",
        name: "Trastevere Historic Quarter",
        description: "Charming labyrinth of cobblestone alleys draped in ivy, brimming with lively trattorias.",
        duration: "2.5 Hours",
        category: "Neighborhood & Dining",
        image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80"
      }
    ],
    thingsToDo: [
      "Relish authentic Carbonara, Cacio e Pepe, and crispy Roman-style pizza",
      "Treat yourself to artisanal pistachio and stracciatella gelato near the Pantheon",
      "Climb to the Gianicolo hill for an unforgettable sunset view over Rome's terracotta rooftops",
      "Marvel at the unreinforced concrete dome and open oculus of the ancient Pantheon"
    ],
    travelTips: [
      "Book Colosseum and Vatican skip-the-line tickets weeks in advance to avoid 3-hour queues.",
      "Public drinking fountains ('Nasoni') flow continuously with ice-cold drinking water throughout the city.",
      "Cover shoulders and knees when visiting churches including St. Peter's Basilica.",
      "Validate metro and bus tickets immediately after boarding to avoid hefty fines."
    ]
  },
  {
    id: "santorini",
    name: "Santorini",
    country: "Greece",
    region: "Europe",
    tagline: "Whitewashed cliffside villages, cobalt blue domes, and volcanic Aegean sunsets",
    shortDescription: "Gaze at jaw-dropping caldera panoramas from Oia, swim on volcanic black sand beaches, and taste crisp volcanic Assyrtiko wines.",
    fullOverview: "Santorini is one of the Cyclades islands in the Aegean Sea. It was devastated by a volcanic eruption in the 16th century BC, forever shaping its rugged landscape. The whitewashed, cubiform houses of its 2 principal towns, Fira and Oia, cling to cliffs above an underwater caldera (crater). They overlook the sea, small islands to the west and beaches made up of black, red and white lava pebbles.",
    heroImage: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1600&q=80",
    cardImage: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.92,
    reviewsCount: 1310,
    bestTimeToVisit: "April to October",
    seasonTag: "Summer & Shoulder Season",
    budgetLevel: "$$",
    currency: "EUR",
    dailyBudgetEstimated: 180,
    budgetBreakdown: {
      accommodation: "€110 / night",
      food: "€40 / day",
      transport: "€12 / day",
      activities: "€22 / day"
    },
    tags: ["Romantic", "Scenic", "Islands", "Beaches", "Luxury"],
    trending: true,
    popular: true,
    weather: {
      temp: "25°C",
      condition: "Aegean Sunshine",
      bestMonths: "May - Oct"
    },
    topAttractions: [
      {
        id: "santorini-oia-sunset",
        name: "Oia Village & Castle Sunset",
        description: "World's most celebrated sunset viewpoint over whitewashed windmills and azure caldera waters.",
        duration: "3 Hours",
        category: "Iconic Sunset",
        image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "santorini-caldera-cruise",
        name: "Catamaran Caldera & Hot Springs Cruise",
        description: "Sail past volcanic islets, swim in thermal sulfur hot springs, and enjoy Greek barbecue at sea.",
        duration: "5 Hours",
        category: "Boat Adventure",
        image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "santorini-red-beach",
        name: "Red Beach & Akrotiri Ruins",
        description: "Unique rust-red volcanic cliffs meeting azure waters beside the ancient Minoan Bronze Age city.",
        duration: "3 Hours",
        category: "Volcanic Beach",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "santorini-fira-walk",
        name: "Fira to Oia Caldera Cliff Trail",
        description: "Scenic 10km cliffside hiking route offering dramatic unobstructed views of the Mediterranean crater.",
        duration: "3.5 Hours",
        category: "Scenic Hike",
        image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=80"
      }
    ],
    thingsToDo: [
      "Sip crisp mineral-rich Assyrtiko wine at a clifftop winery estate",
      "Swim in the deep crystal waters off the dock below Ammoudi Bay",
      "Feast on freshly caught grilled octopus and Greek feta salad",
      "Stay in a traditional cave house carved directly into volcanic rock"
    ],
    travelTips: [
      "Wear sturdy flat shoes with good grip; village paths are made of slick polished stone and steep stairs.",
      "Arrive at Oia's Byzantine Castle at least 90 minutes before sunset to secure a great viewing spot.",
      "Tap water is desalinated and not meant for drinking; stick to bottled or filtered water.",
      "May and September/October offer pleasant weather and far fewer crowds than peak July/August."
    ]
  },
  {
    id: "india",
    name: "India",
    country: "India",
    region: "Asia",
    tagline: "India – Land of timeless heritage, vibrant cultures, and boundless wonders",
    shortDescription: "Explore 28 diverse states, 8 union territories, royal heritage palaces, golden beaches, and the serene Himalayas across India.",
    fullOverview: "India is a vast South Asian country with diverse terrain – from soaring snow-capped Himalayan peaks to the sun-kissed Indian Ocean coastline – and a rich civilization spanning over five millennia. Journey through ancient Mughal fortresses, royal Rajasthani palaces, spiritual riverbanks along the sacred Ganges, emerald palm backwaters in Kerala, and vibrant culinary epicenters. From 28 distinct states and 8 union territories, India is a treasure trove of culture, wildlife, and breathtaking natural wonders.",
    heroImage: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1600&q=80",
    cardImage: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80"
    ],
    rating: 4.95,
    reviewsCount: 3850,
    bestTimeToVisit: "October to March",
    seasonTag: "Pleasant Winter & Autumn",
    budgetLevel: "$",
    currency: "INR",
    dailyBudgetEstimated: 4000,
    budgetBreakdown: {
      accommodation: "₹2,000 / night",
      food: "₹1,000 / day",
      transport: "₹500 / day",
      activities: "₹500 / day"
    },
    tags: ["Culture", "Heritage", "Himalayas", "Mountains", "Beaches", "Foodie", "Romantic", "Luxury", "Major Hub", "Delhi", "Mumbai", "Bengaluru", "Jaipur", "Goa", "Kerala", "Varanasi", "Taj Mahal"],
    trending: true,
    popular: true,
    isMajorDestination: true,
    weather: {
      temp: "26°C",
      condition: "Sunny & Pleasant",
      bestMonths: "Oct - Mar"
    },
    topAttractions: [
      {
        id: "in-place-taj-mahal",
        name: "Taj Mahal, Agra",
        description: "World wonder and universal monument of love crafted in pure white ivory marble.",
        duration: "3 Hours",
        category: "World Wonder",
        image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "in-place-jaipur-forts",
        name: "Amber Fort & Palaces, Jaipur",
        description: "Regal Rajput architecture with hilltop ramparts and sweeping views of Maota Lake.",
        duration: "Half Day",
        category: "Royal Fort",
        image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "in-place-varanasi-ghats",
        name: "Ganga Ghats & Aarti, Varanasi",
        description: "Ancient spiritual steps along the sacred Ganges with atmospheric evening fire rituals.",
        duration: "Evening",
        category: "Spiritual",
        image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=600&q=80"
      },
      {
        id: "in-place-kerala-backwaters",
        name: "Kerala Backwaters, Alleppey",
        description: "Serene interconnected canals and emerald lagoons cruised on traditional thatched houseboats.",
        duration: "Full Day",
        category: "Scenic Nature",
        image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80"
      }
    ],
    thingsToDo: [
      "Embark on the iconic Golden Triangle circuit: Delhi, Agra, and Jaipur",
      "Cruise through tranquil palm-fringed backwaters on a luxury Alleppey houseboat",
      "Experience the spiritual evening Ganga Aarti on the historic ghats of Varanasi",
      "Explore 28 vibrant states and 8 union territories, each with unique cuisine, language, and culture"
    ],
    travelTips: [
      "Apply for an Indian e-Visa online prior to travel for seamless airport immigration.",
      "Carry breathable cotton layers for tropical plains and warm thermals for Himalayan regions.",
      "Digital payments (UPI/cards) are widely accepted across cities, but keep cash for local markets.",
      "Savor local culinary specialties – every state boasts its own distinct aromatic spice blends."
    ]
  }
];

// Curated Travel Inspiration Articles
const TRAVEL_ARTICLES = [
  {
    id: "art-1",
    title: "10 Essential Tips for First-Time Solo Travelers",
    category: "Travel Guides",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80",
    snippet: "Master the art of exploring the world independently with confidence, smart packing, and safety insights."
  },
  {
    id: "art-2",
    title: "How to Travel on a Budget Without Sacrificing Experience",
    category: "Smart Planning",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80",
    snippet: "From flight timing to secret neighborhood trattorias, discover how to stretch your travel funds twice as far."
  },
  {
    id: "art-3",
    title: "The Ultimate Seasonal Packing Guide for European Summers",
    category: "Packing Tips",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    snippet: "Pack light, versatile wardrobe essentials that transition seamlessly from cobblestone walks to fine dining."
  }
];

// Helper functions for accessing destination data
const DataService = {
  getAllDestinations() {
    return [...DESTINATIONS];
  },

  getDestinationById(id) {
    const dest = DESTINATIONS.find(d => d.id === id);
    if (dest) return dest;
    if (window.IndiaDataService) {
      const inDest = window.IndiaDataService.getById(id);
      if (inDest) {
        return {
          ...inDest,
          country: "India",
          region: "Asia",
          tagline: inDest.tagline || inDest.shortDescription,
          heroImage: inDest.image,
          cardImage: inDest.image,
          rating: inDest.rating || 4.85,
          reviewsCount: inDest.reviewsCount || 1120,
          currency: "INR",
          dailyBudgetEstimated: inDest.dailyBudgetEstimated || (inDest.category === "city" ? 4800 : (inDest.category === "tourist_place" ? 3600 : 4000)),
          budgetLevel: inDest.category === "city" ? "$$" : "$",
          budgetBreakdown: inDest.budgetBreakdown || {
            accommodation: "₹2,200 / night",
            food: "₹1,000 / day",
            transport: "₹450 / day",
            activities: "₹450 / day"
          },
          seasonTag: inDest.bestTimeToVisit,
          weather: inDest.weather || {
            temp: "26°C",
            condition: "Sunny & Pleasant",
            bestMonths: inDest.bestTimeToVisit
          }
        };
      }
    }
    return null;
  },

  getPopularDestinations() {
    return DESTINATIONS.filter(d => d.popular);
  },

  getTrendingDestinations() {
    return DESTINATIONS.filter(d => d.trending);
  },

  getArticles() {
    return [...TRAVEL_ARTICLES];
  },

  getRegions() {
    const regions = new Set(DESTINATIONS.map(d => d.region));
    return ["All", ...Array.from(regions)];
  },

  getTags() {
    const tags = new Set();
    DESTINATIONS.forEach(d => d.tags.forEach(t => tags.add(t)));
    return Array.from(tags);
  },

  searchDestinations(query, filters = {}) {
    let list = [...DESTINATIONS];

    // Text search query
    if (query && query.trim() !== "") {
      const q = query.trim().toLowerCase();
      if (q === "india") {
        list = list.filter(d => d.id === "india" || d.name.toLowerCase() === "india");
      } else {
        list = list.filter(d => {
          const nameMatch = d.name.toLowerCase().includes(q);
          const countryMatch = d.country.toLowerCase().includes(q);
          const regionMatch = d.region && d.region.toLowerCase().includes(q);
          const tagMatch = d.tags.some(t => t.toLowerCase().includes(q));
          const attractionMatch = d.topAttractions.some(a => 
            a.name.toLowerCase().includes(q) || 
            (a.description && a.description.toLowerCase().includes(q))
          );
          const descMatch = (d.shortDescription && d.shortDescription.toLowerCase().includes(q)) || 
                            (d.fullOverview && d.fullOverview.toLowerCase().includes(q));
          const thingsMatch = d.thingsToDo && d.thingsToDo.some(t => t.toLowerCase().includes(q));
          const inMatch = (d.id === "india" && window.IndiaDataService && window.IndiaDataService.search(q).length > 0);
          return nameMatch || countryMatch || regionMatch || tagMatch || attractionMatch || descMatch || thingsMatch || inMatch;
        });
      }
    }

    // Region filter
    if (filters.region && filters.region !== "All") {
      const reg = filters.region.toLowerCase();
      if (reg === "india") {
        list = list.filter(d => d.id === "india" || d.name.toLowerCase() === "india");
      } else {
        list = list.filter(d => 
          d.region.toLowerCase() === reg || 
          (d.country && d.country.toLowerCase() === reg) ||
          (d.id && d.id.toLowerCase() === reg)
        );
      }
    }

    // Budget filter
    if (filters.budget && filters.budget !== "All") {
      list = list.filter(d => d.budgetLevel === filters.budget);
    }

    // Tag filter
    if (filters.tag && filters.tag !== "All") {
      list = list.filter(d => d.tags.includes(filters.tag));
    }

    // Sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "rating":
          list.sort((a, b) => b.rating - a.rating);
          break;
        case "name":
          list.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "budget-low":
          list.sort((a, b) => {
            const valA = (typeof CurrencyService !== "undefined") ? CurrencyService.convert(a.dailyBudgetEstimated, a.currency || "USD", "USD") : a.dailyBudgetEstimated;
            const valB = (typeof CurrencyService !== "undefined") ? CurrencyService.convert(b.dailyBudgetEstimated, b.currency || "USD", "USD") : b.dailyBudgetEstimated;
            return valA - valB;
          });
          break;
        case "budget-high":
          list.sort((a, b) => {
            const valA = (typeof CurrencyService !== "undefined") ? CurrencyService.convert(a.dailyBudgetEstimated, a.currency || "USD", "USD") : a.dailyBudgetEstimated;
            const valB = (typeof CurrencyService !== "undefined") ? CurrencyService.convert(b.dailyBudgetEstimated, b.currency || "USD", "USD") : b.dailyBudgetEstimated;
            return valB - valA;
          });
          break;
        case "popular":
        default:
          list.sort((a, b) => b.reviewsCount - a.reviewsCount);
          break;
      }
    }

    return list;
  }
};

// Expose globally
if (typeof window !== "undefined") {
  window.DataService = DataService;
  window.DESTINATIONS = DESTINATIONS;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = DataService;
}
