const categories = [
    "Trending",
    "Beachfront",
    "Rooms",
    "Iconic Cities",
    "Mountains",
    "Castles",
    "Amazing Pools",
    "Camping",
    "Farms",
    "Arctic",
    "Domes",
    "Boats",
    "Luxury"
];

const standardAmenities = [
    "Wifi",
    "Kitchen",
    "Free parking",
    "Air conditioning",
    "Dedicated workspace",
    "Pool",
    "TV",
    "Washer",
    "Patio or balcony",
    "Mountain view"
];

const sampleListings = [
    {
        title: "Cozy Beachfront Cottage",
        description:
            "Escape to this charming beachfront cottage for a relaxing getaway. Enjoy stunning ocean views and direct private access to the sandy beach.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=800&q=60"
        },
        price: 1500,
        location: "Malibu, California",
        country: "United States",
        category: "Beachfront",
        amenities: ["Wifi", "Kitchen", "Free parking", "Air conditioning", "Patio or balcony"],
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 2
    },
    {
        title: "Modern Loft in Downtown",
        description:
            "Stay in the heart of the city in this stylish loft apartment. Floor-to-ceiling windows, high-speed fiber internet, and walking distance to top restaurants.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=60"
        },
        price: 1200,
        location: "New York City, New York",
        country: "United States",
        category: "Iconic Cities",
        amenities: ["Wifi", "Kitchen", "Air conditioning", "Dedicated workspace", "TV"],
        maxGuests: 2,
        bedrooms: 1,
        bathrooms: 1
    },
    {
        title: "Peaceful Mountain Cabin Retreat",
        description:
            "Unplug and unwind in this peaceful handcrafted mountain cabin. Surrounded by pine forests and wildlife, it's the perfect sanctuary to recharge.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=60"
        },
        price: 1000,
        location: "Aspen, Colorado",
        country: "United States",
        category: "Mountains",
        amenities: ["Wifi", "Kitchen", "Free parking", "Mountain view", "Patio or balcony"],
        maxGuests: 6,
        bedrooms: 3,
        bathrooms: 2
    },
    {
        title: "Historic Villa in Tuscany",
        description:
            "Experience the romance of Tuscany in this beautifully restored 18th-century stone villa. Explore rolling olive groves, vineyards, and private gardens.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=60"
        },
        price: 2500,
        location: "Florence, Tuscany",
        country: "Italy",
        category: "Castles",
        amenities: ["Wifi", "Kitchen", "Free parking", "Pool", "Patio or balcony"],
        maxGuests: 8,
        bedrooms: 4,
        bathrooms: 3
    },
    {
        title: "Secluded Treehouse Getaway",
        description:
            "Live among the treetops in this unique cedar treehouse retreat. Fall asleep to gentle breezes and birdsong in a true nature lover's paradise.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=60"
        },
        price: 800,
        location: "Portland, Oregon",
        country: "United States",
        category: "Camping",
        amenities: ["Wifi", "Free parking", "Patio or balcony"],
        maxGuests: 2,
        bedrooms: 1,
        bathrooms: 1
    },
    {
        title: "Cancun Oceanfront Paradise",
        description:
            "Step out of your sliding glass door right onto the warm powdery sand. Features panoramic Caribbean views and resort-style amenities.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=60"
        },
        price: 2000,
        location: "Cancun, Quintana Roo",
        country: "Mexico",
        category: "Beachfront",
        amenities: ["Wifi", "Kitchen", "Pool", "Air conditioning", "Patio or balcony"],
        maxGuests: 5,
        bedrooms: 2,
        bathrooms: 2
    },
    {
        title: "Rustic Waterfront Cabin by Lake Tahoe",
        description:
            "Spend peaceful mornings kayaking on the mirror-smooth lake and cozy evenings by the stone fireplace. Outdoor relaxation at its best.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=60"
        },
        price: 900,
        location: "Lake Tahoe, California",
        country: "United States",
        category: "Mountains",
        amenities: ["Wifi", "Kitchen", "Free parking", "Patio or balcony"],
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 1
    },
    {
        title: "Luxury Penthouse with Skyline Views",
        description:
            "Indulge in high-end urban luxury with 360-degree views of the metropolitan skyline, private infinity hot tub, and designer Italian furnishings.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1622396481328-9b1b78cdd9fd?auto=format&fit=crop&w=800&q=60"
        },
        price: 3500,
        location: "Los Angeles, California",
        country: "United States",
        category: "Luxury",
        amenities: ["Wifi", "Kitchen", "Pool", "Air conditioning", "Dedicated workspace", "TV"],
        maxGuests: 6,
        bedrooms: 3,
        bathrooms: 3
    },
    {
        title: "Alpine Ski-In / Ski-Out Chalet",
        description:
            "Hit the world-class powder slopes directly from your boot room. Panoramic snowy mountain vistas, Finnish sauna, and heated outdoor terrace.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=800&q=60"
        },
        price: 3000,
        location: "Verbier, Valais",
        country: "Switzerland",
        category: "Arctic",
        amenities: ["Wifi", "Kitchen", "Free parking", "Mountain view", "Sauna"],
        maxGuests: 8,
        bedrooms: 4,
        bathrooms: 3
    },
    {
        title: "Serengeti Safari Tented Lodge",
        description:
            "Experience the thrill of the African savannah in total comfort. Watch wildlife gather at sunrise from your private wooden deck.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=800&q=60"
        },
        price: 4000,
        location: "Serengeti National Park",
        country: "Tanzania",
        category: "Camping",
        amenities: ["Wifi", "Pool", "Free parking", "Patio or balcony"],
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 2
    },
    {
        title: "Historic Canal House Suite",
        description:
            "Stay in a UNESCO world heritage 17th-century canal house with exposed wooden beams, high ceilings, and picturesque water views.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=60"
        },
        price: 1800,
        location: "Amsterdam, North Holland",
        country: "Netherlands",
        category: "Iconic Cities",
        amenities: ["Wifi", "Kitchen", "Dedicated workspace", "TV"],
        maxGuests: 3,
        bedrooms: 1,
        bathrooms: 1
    },
    {
        title: "Private Overwater Island Villa",
        description:
            "Have an entire turquoise lagoon to yourself. Featuring direct ocean steps, glass floor viewing panels, and private butler service.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=800&q=60"
        },
        price: 6000,
        location: "Baa Atoll",
        country: "Maldives",
        category: "Luxury",
        amenities: ["Wifi", "Air conditioning", "Pool", "Patio or balcony"],
        maxGuests: 2,
        bedrooms: 1,
        bathrooms: 2
    },
    {
        title: "Traditional Thatch Cottage",
        description:
            "Escape to the picturesque Cotswolds in this postcard-perfect limestone cottage surrounded by English rose gardens and country walking paths.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1602088113235-229c19758e9f?auto=format&fit=crop&w=800&q=60"
        },
        price: 1200,
        location: "Cotswolds, Gloucestershire",
        country: "United Kingdom",
        category: "Farms",
        amenities: ["Wifi", "Kitchen", "Free parking", "Patio or balcony"],
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 1
    },
    {
        title: "Santorini Cliffside Cave Villa with Infinity Pool",
        description:
            "Dramatically perched above the Aegean caldera with unmatched sunset views, white Cycladic curves, and a heated private cave plunge pool.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?auto=format&fit=crop&w=800&q=60"
        },
        price: 2800,
        location: "Oia, Santorini",
        country: "Greece",
        category: "Amazing Pools",
        amenities: ["Wifi", "Air conditioning", "Pool", "Patio or balcony"],
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 2
    },
    {
        title: "Futuristic Glamping Geodesic Dome",
        description:
            "Stargaze through the transparent dome canopy in complete comfort. Includes outdoor cedar hot tub, plush memory foam king bed, and wood stove.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1488462237308-ecaa28b729d7?auto=format&fit=crop&w=800&q=60"
        },
        price: 850,
        location: "Moab, Utah",
        country: "United States",
        category: "Domes",
        amenities: ["Wifi", "Free parking", "Patio or balcony", "Hot tub"],
        maxGuests: 2,
        bedrooms: 1,
        bathrooms: 1
    },
    {
        title: "Chic Shibuya Designer Studio",
        description:
            "Ultra-clean minimalist Tokyo apartment located minutes away from Shibuya Crossing. Fast pocket Wi-Fi, washer-dryer, and modern Japanese bathroom.",
        image: {
            filename: "listingimage",
            url: "https://images.unsplash.com/photo-1480796927426-f609979314bd?auto=format&fit=crop&w=800&q=60"
        },
        price: 1400,
        location: "Shibuya, Tokyo",
        country: "Japan",
        category: "Rooms",
        amenities: ["Wifi", "Air conditioning", "Kitchen", "Washer", "TV"],
        maxGuests: 2,
        bedrooms: 1,
        bathrooms: 1
    }
];

module.exports = { data: sampleListings };
