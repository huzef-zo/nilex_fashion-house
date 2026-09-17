/**
 * =========================================================================
 * NILEX FASHIONHOUSE - DATA LOADER
 * Reassembles collection & subcollection global data into NILEX_COLLECTIONS
 * =========================================================================
 */

(function () {
    const collections = [
        Object.assign({}, window.NILEX_COLLECTION_URBAN_STREETWEAR, {
            subcollections: [
                window.NILEX_SUBCOLLECTION_HOODIES_SWEATS,
                window.NILEX_SUBCOLLECTION_TEES_TOPS,
                window.NILEX_SUBCOLLECTION_CARGO_PANTS
            ]
        }),
        Object.assign({}, window.NILEX_COLLECTION_FLOWING_LINENS, {
            subcollections: [
                window.NILEX_SUBCOLLECTION_LINEN_SHIRTS,
                window.NILEX_SUBCOLLECTION_LINEN_COORDS
            ]
        }),
        Object.assign({}, window.NILEX_COLLECTION_CASUAL_JACKETS, {
            subcollections: [
                window.NILEX_SUBCOLLECTION_BOMBERS_JACKETS
            ]
        }),
        Object.assign({}, window.NILEX_COLLECTION_MENS_ACCESSORIES, {
            subcollections: [
                window.NILEX_SUBCOLLECTION_LEATHER_BAGS
            ]
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
