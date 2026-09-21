/**
 * =========================================================================
 * NILEX FASHIONHOUSE - DATA LOADER
 * Reassembles collection & subcollection global data into NILEX_COLLECTIONS
 * =========================================================================
 */

(function () {
    const FALLBACK_COVER = 'assets/images/logo.jpg';

    // Subcollections
    // Shoes subcollections
    const nike = Object.assign({}, window.NILEX_SUBCOLLECTION_NIKE, {
        coverImage: window.NILEX_COVER_NIKE || FALLBACK_COVER,
        products: window.NILEX_GENERATED_PRODUCTS_NIKE || []
    });
    const jordan = Object.assign({}, window.NILEX_SUBCOLLECTION_JORDAN, {
        coverImage: window.NILEX_COVER_JORDAN || FALLBACK_COVER,
        products: window.NILEX_GENERATED_PRODUCTS_JORDAN || []
    });
    const leather = Object.assign({}, window.NILEX_SUBCOLLECTION_LEATHER, {
        coverImage: window.NILEX_COVER_LEATHER || FALLBACK_COVER,
        products: window.NILEX_GENERATED_PRODUCTS_LEATHER || []
    });
    const birkenstocks = Object.assign({}, window.NILEX_SUBCOLLECTION_BIRKENSTOCKS, {
        coverImage: window.NILEX_COVER_BIRKENSTOCKS || FALLBACK_COVER,
        products: window.NILEX_GENERATED_PRODUCTS_BIRKENSTOCKS || []
    });
    const chelseaBoots = Object.assign({}, window.NILEX_SUBCOLLECTION_CHELSEA_BOOTS, {
        coverImage: window.NILEX_COVER_CHELSEA_BOOTS || FALLBACK_COVER,
        products: window.NILEX_GENERATED_PRODUCTS_CHELSEA_BOOTS || []
    });

    // T-Shirts subcollections
    const oldMoney = Object.assign({}, window.NILEX_SUBCOLLECTION_OLD_MONEY, {
        coverImage: window.NILEX_COVER_OLD_MONEY || FALLBACK_COVER,
        products: window.NILEX_GENERATED_PRODUCTS_OLD_MONEY || []
    });
    const zipUp = Object.assign({}, window.NILEX_SUBCOLLECTION_ZIP_UP, {
        coverImage: window.NILEX_COVER_ZIP_UP || FALLBACK_COVER,
        products: window.NILEX_GENERATED_PRODUCTS_ZIP_UP || []
    });
    const oShape = Object.assign({}, window.NILEX_SUBCOLLECTION_O_SHAPE, {
        coverImage: window.NILEX_COVER_O_SHAPE || FALLBACK_COVER,
        products: window.NILEX_GENERATED_PRODUCTS_O_SHAPE || []
    });
    const collar = Object.assign({}, window.NILEX_SUBCOLLECTION_COLLAR, {
        coverImage: window.NILEX_COVER_COLLAR || FALLBACK_COVER,
        products: window.NILEX_GENERATED_PRODUCTS_COLLAR || []
    });

    // Shirts subcollections
    const sleeve = Object.assign({}, window.NILEX_SUBCOLLECTION_SLEEVE, {
        coverImage: window.NILEX_COVER_SLEEVE || FALLBACK_COVER,
        products: window.NILEX_GENERATED_PRODUCTS_SLEEVE || []
    });
    const noSleeve = Object.assign({}, window.NILEX_SUBCOLLECTION_NO_SLEEVE, {
        coverImage: window.NILEX_COVER_NO_SLEEVE || FALLBACK_COVER,
        products: window.NILEX_GENERATED_PRODUCTS_NO_SLEEVE || []
    });

    // Collections
    const collections = [
        Object.assign({}, window.NILEX_COLLECTION_SHOES, {
            coverImage: window.NILEX_COVER_SHOES || FALLBACK_COVER,
            subcollections: [nike, jordan, leather, birkenstocks, chelseaBoots]
        }),
        Object.assign({}, window.NILEX_COLLECTION_PANTS, {
            coverImage: window.NILEX_COVER_PANTS || FALLBACK_COVER,
            products: window.NILEX_GENERATED_PRODUCTS_PANTS || [],
            subcollections: []
        }),
        Object.assign({}, window.NILEX_COLLECTION_JACKETS, {
            coverImage: window.NILEX_COVER_JACKETS || FALLBACK_COVER,
            products: window.NILEX_GENERATED_PRODUCTS_JACKETS || [],
            subcollections: []
        }),
        Object.assign({}, window.NILEX_COLLECTION_T_SHIRTS, {
            coverImage: window.NILEX_COVER_T_SHIRTS || FALLBACK_COVER,
            subcollections: [oldMoney, zipUp, oShape, collar]
        }),
        Object.assign({}, window.NILEX_COLLECTION_SHIRTS, {
            coverImage: window.NILEX_COVER_SHIRTS || FALLBACK_COVER,
            subcollections: [sleeve, noSleeve]
        }),
        Object.assign({}, window.NILEX_COLLECTION_SWEATERS, {
            coverImage: window.NILEX_COVER_SWEATERS || FALLBACK_COVER,
            products: window.NILEX_GENERATED_PRODUCTS_SWEATERS || [],
            subcollections: []
        })
    ];

    function getCollectionProductCount(collection) {
        if (!collection) return 0;
        if (collection.products && collection.products.length > 0) {
            return collection.products.length;
        }
        if (!collection.subcollections) return 0;
        return collection.subcollections.reduce(function (acc, sub) {
            return acc + (sub && sub.products ? sub.products.length : 0);
        }, 0);
    }

    if (typeof window !== 'undefined') {
        window.NILEX_COLLECTIONS = collections;
        window.getCollectionProductCount = getCollectionProductCount;
    }
})();
