/**
 * =========================================================================
 * NILEX FASHIONHOUSE - DATA LOADER
 * Reassembles collection & subcollection global data into NILEX_COLLECTIONS
 * =========================================================================
 */

(function () {
    const hoodiesSweats = Object.assign({}, window.NILEX_SUBCOLLECTION_HOODIES_SWEATS, {
        products: window.NILEX_GENERATED_PRODUCTS_HOODIES_SWEATS || []
    });
    const teesTops = Object.assign({}, window.NILEX_SUBCOLLECTION_TEES_TOPS, {
        products: window.NILEX_GENERATED_PRODUCTS_TEES_TOPS || []
    });
    const cargoPants = Object.assign({}, window.NILEX_SUBCOLLECTION_CARGO_PANTS, {
        products: window.NILEX_GENERATED_PRODUCTS_CARGO_PANTS || []
    });

    const linenShirts = Object.assign({}, window.NILEX_SUBCOLLECTION_LINEN_SHIRTS, {
        products: window.NILEX_GENERATED_PRODUCTS_LINEN_SHIRTS || []
    });
    const linenCoords = Object.assign({}, window.NILEX_SUBCOLLECTION_LINEN_COORDS, {
        products: window.NILEX_GENERATED_PRODUCTS_LINEN_COORDS || []
    });

    const bombersJackets = Object.assign({}, window.NILEX_SUBCOLLECTION_BOMBERS_JACKETS, {
        products: window.NILEX_GENERATED_PRODUCTS_BOMBERS_JACKETS || []
    });

    const leatherBags = Object.assign({}, window.NILEX_SUBCOLLECTION_LEATHER_BAGS, {
        products: window.NILEX_GENERATED_PRODUCTS_LEATHER_BAGS || []
    });

    const collections = [
        Object.assign({}, window.NILEX_COLLECTION_URBAN_STREETWEAR, {
            subcollections: [hoodiesSweats, teesTops, cargoPants]
        }),
        Object.assign({}, window.NILEX_COLLECTION_FLOWING_LINENS, {
            subcollections: [linenShirts, linenCoords]
        }),
        Object.assign({}, window.NILEX_COLLECTION_CASUAL_JACKETS, {
            subcollections: [bombersJackets]
        }),
        Object.assign({}, window.NILEX_COLLECTION_MENS_ACCESSORIES, {
            subcollections: [leatherBags]
        })
    ];

    function getCollectionProductCount(collection) {
        if (!collection || !collection.subcollections) return 0;
        return collection.subcollections.reduce(function (acc, sub) {
            return acc + (sub && sub.products ? sub.products.length : 0);
        }, 0);
    }

    if (typeof window !== 'undefined') {
        window.NILEX_COLLECTIONS = collections;
        window.getCollectionProductCount = getCollectionProductCount;
    }
})();
