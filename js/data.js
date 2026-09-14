/**
 * =========================================================================
 * NILEX FASHIONHOUSE - MEN'S EXCLUSIVE BRAND & PRODUCTS DATA STORE
 * Slogan: "Flow like the nile"
 * =========================================================================
 * 
 * 💡 HOW TO ADD / UPDATE IMAGES & PRODUCTS EASILY:
 * -------------------------------------------------------------------------
 * 1. Put your images into the `assets/images/` folder (or any subfolder).
 *    Example: `assets/images/my-hoodie-1.jpg` or use web URLs directly.
 * 2. To add a new Product:
 *    Scroll down to the desired Collection -> Subcollection -> `products` array.
 *    Copy and paste a product block and update the title, coverImage, and gallery!
 * 3. `coverImage`: The primary thumbnail shown on the showcase card.
 * 4. `gallery`: An array of additional image paths/URLs for the lightbox modal.
 * =========================================================================
 */

const NILEX_BRAND_INFO = {
    name: "NILEX",
    tagline: "Flow like the nile",
    category: "Men's Exclusive Fashionhouse",
    description: "Premium men's clothing store in Bishoftu featuring modern streetwear, flowing luxury linens, effortless casuals, and signature essentials.",
    location: "Bishoftu, Next to Farmi Cafe",
    mapsUrl: "https://maps.app.goo.gl/r3yCgR7Ek4SWK1767?g_st=atm",
    phone: "0980818485",
    phoneFormatted: "+251 980 818 485",
    phoneTel: "tel:+251980818485",
    telegramHandle: "@ezana62",
    telegramUrl: "https://t.me/ezana62",
    tiktokHandle: "@nilexfashion1",
    tiktokUrl: "https://www.tiktok.com/@nilexfashion1",
    logoPath: "assets/images/logo.jpg",
    established: "2024",
    hours: "Mon - Sun: 9:00 AM - 8:30 PM",
};

/**
 * MEN'S COLLECTIONS HIERARCHY:
 * Collection -> Sub-Collections -> Products -> Photos (Cover + Gallery)
 */
const NILEX_COLLECTIONS = [
    {
        id: "urban-streetwear",
        name: "Urban Flow Streetwear",
        tagline: "Contemporary High-Street Silhouettes & Heavyweight Cotton",
        description: "Heavyweight 500GSM hoodies, relaxed cargo bottoms, drop-shoulder graphic tees, and streetwear outerwear.",
        coverImage: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1200&q=80",
        badge: "Street Luxe",
        subcollections: [
            {
                id: "hoodies-sweats",
                name: "Heavyweight Hoodies & Sweats",
                description: "500GSM French Terry boxy hoodies, clean quarter-zips, and layered pullovers.",
                coverImage: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
                products: [
                    {
                        id: "nlx-hd-01",
                        code: "NLX-HD-001",
                        name: "The Nile Wave 500GSM Boxy Hoodie",
                        tag: "Signature Drop",
                        coverImage: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80",
                        gallery: [
                            "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80",
                            "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1000&q=80",
                            "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1000&q=80"
                        ]
                    },
                    {
                        id: "nlx-hd-02",
                        code: "NLX-HD-002",
                        name: "Midnight Acid-Wash Relaxed Pullover",
                        tag: "New Arrival",
                        coverImage: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1000&q=80",
                        gallery: [
                            "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=1000&q=80",
                            "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80"
                        ]
                    },
                    {
                        id: "nlx-hd-03",
                        code: "NLX-HD-003",
                        name: "Bishoftu Minimalist Quarter-Zip Sweatshirt",
                        tag: "Essential",
                        coverImage: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=80",
                        gallery: [
                            "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=80"
                        ]
                    }
                ]
            },
            {
                id: "tees-tops",
                name: "Oversized Tees & Graphic Tops",
                description: "Heavy compact cotton tees with drop shoulders and custom Nilex typography.",
                coverImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
                products: [
                    {
                        id: "nlx-ts-01",
                        code: "NLX-TS-001",
                        name: "'Flow Like The Nile' Editorial Graphic Tee",
                        tag: "Best Seller",
                        coverImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80",
                        gallery: [
                            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80",
                            "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80"
                        ]
                    },
                    {
                        id: "nlx-ts-02",
                        code: "NLX-TS-002",
                        name: "Vintage Washed Oversized Crewneck Tee",
                        tag: "Daily Essential",
                        coverImage: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80",
                        gallery: [
                            "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80"
                        ]
                    }
                ]
            },
            {
                id: "cargo-pants",
                name: "Tactical Cargo & Parachute Pants",
                description: "Wide-leg utility bottoms, adjustable drawstring hems, and relaxed silhouettes.",
                coverImage: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80",
                products: [
                    {
                        id: "nlx-cg-01",
                        code: "NLX-CG-001",
                        name: "Multi-Pocket Tactical Parachute Cargo",
                        tag: "Trending",
                        coverImage: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1000&q=80",
                        gallery: [
                            "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1000&q=80"
                        ]
                    },
                    {
                        id: "nlx-cg-02",
                        code: "NLX-CG-002",
                        name: "Relaxed Fit Twill Cargo Pant - Sand",
                        tag: "Everyday Fit",
                        coverImage: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80",
                        gallery: [
                            "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80"
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: "flowing-linens",
        name: "Nile Signature Linens & Resort",
        tagline: "Pure Breeze, Natural Fibers & Lakeside Luxury",
        description: "Unstructured 100% natural linen shirts, resort coordinates, and airy relaxed sets for effortless comfort.",
        coverImage: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80",
        badge: "Pure Linen",
        subcollections: [
            {
                id: "linen-shirts",
                name: "Camp Collar & Resort Shirts",
                description: "Breathable open collar linen shirts and relaxed-fit button downs.",
                coverImage: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
                products: [
                    {
                        id: "nlx-ln-01",
                        code: "NLX-LN-001",
                        name: "The Nile Rivercamp Open-Collar Linen Shirt",
                        tag: "Best Seller",
                        coverImage: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80",
                        gallery: [
                            "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80",
                            "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=80"
                        ]
                    },
                    {
                        id: "nlx-ln-02",
                        code: "NLX-LN-002",
                        name: "Azure Sky Textured Band-Collar Linen Shirt",
                        tag: "Seasonal",
                        coverImage: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=80",
                        gallery: [
                            "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=80"
                        ]
                    }
                ]
            },
            {
                id: "linen-coords",
                name: "Linen Co-ord Sets & Kimonos",
                description: "Two-piece matching shirt + short/pant sets and relaxed flowing kimonos.",
                coverImage: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80",
                products: [
                    {
                        id: "nlx-ln-03",
                        code: "NLX-LN-003",
                        name: "Bishoftu Lakeside Sand Washed Linen Co-ord",
                        tag: "Signature Set",
                        coverImage: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1000&q=80",
                        gallery: [
                            "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1000&q=80"
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: "casual-jackets",
        name: "Casual Jackets & Outerwear",
        tagline: "Modern Layering, Bombers & Lightweight Windbreakers",
        description: "Versatile outerwear pieces designed for style and comfort across day and evening.",
        coverImage: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=80",
        badge: "Outerwear",
        subcollections: [
            {
                id: "bombers-jackets",
                name: "Flight Bombers & Utility Jackets",
                description: "Matte memory fabric bombers and relaxed zip-up jackets.",
                coverImage: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80",
                products: [
                    {
                        id: "nlx-jk-01",
                        code: "NLX-JK-001",
                        name: "Matte Black Nilex Flight Bomber Jacket",
                        tag: "Limited Drop",
                        coverImage: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80",
                        gallery: [
                            "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80",
                            "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1000&q=80"
                        ]
                    },
                    {
                        id: "nlx-jk-02",
                        code: "NLX-JK-002",
                        name: "Minimalist Utility Overshirt Jacket - Navy",
                        tag: "Essential",
                        coverImage: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1000&q=80",
                        gallery: [
                            "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1000&q=80"
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: "mens-accessories",
        name: "Men's Accessories & Leather",
        tagline: "Artisanal Ethiopian Leather, Caps & Accents",
        description: "Handcrafted duffle bags, structured caps, crossbody pouches, and signature accessories to complete your look.",
        coverImage: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80",
        badge: "Crafted Leather",
        subcollections: [
            {
                id: "leather-bags",
                name: "Leather Bags & Crossbody Pouches",
                description: "Full-grain genuine leather weekenders, totes, and everyday crossbody bags.",
                coverImage: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
                products: [
                    {
                        id: "nlx-ac-01",
                        code: "NLX-AC-001",
                        name: "The Nilex Voyager Full-Grain Leather Duffle",
                        tag: "Artisanal",
                        coverImage: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80",
                        gallery: [
                            "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80"
                        ]
                    },
                    {
                        id: "nlx-ac-02",
                        code: "NLX-AC-002",
                        name: "Minimalist Leather Crossbody Phone & Card Bag",
                        tag: "Daily Essential",
                        coverImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80",
                        gallery: [
                            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80"
                        ]
                    }
                ]
            }
        ]
    }
];

// Helper to count total products in a collection
function getCollectionProductCount(collection) {
    if (!collection.subcollections) return 0;
    return collection.subcollections.reduce((acc, sub) => {
        return acc + (sub.products ? sub.products.length : 0);
    }, 0);
}

// Export for usage in window
if (typeof window !== 'undefined') {
    window.NILEX_BRAND_INFO = NILEX_BRAND_INFO;
    window.NILEX_COLLECTIONS = NILEX_COLLECTIONS;
    window.getCollectionProductCount = getCollectionProductCount;
}
