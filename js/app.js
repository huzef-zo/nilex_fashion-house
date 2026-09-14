/**
 * =========================================================================
 * NILEX FASHIONHOUSE - MEN'S EXCLUSIVE MAIN APPLICATION LOGIC
 * Slogan: "Flow like the nile"
 * =========================================================================
 */

// Application Navigation State
const appState = {
    currentCollectionId: null,
    currentSubcollectionId: null,
    searchQuery: '',
    allCollections: []
};

document.addEventListener('DOMContentLoaded', () => {
    // Initialize data from data.js
    appState.allCollections = window.NILEX_COLLECTIONS || [];

    // Initialize UI components
    bindBrandInfo();
    initNavigation();
    initShowcaseView();
    initSearch();
    initMobileNav();
});

/**
 * Automatically bind brand information to all matching data attributes in HTML
 */
function bindBrandInfo() {
    const brand = window.NILEX_BRAND_INFO;
    if (!brand) return;

    // Update phone links
    document.querySelectorAll('[data-brand="phone-link"]').forEach(el => {
        el.href = brand.phoneTel;
    });

    document.querySelectorAll('[data-brand="phone-text"]').forEach(el => {
        el.textContent = brand.phone;
    });

    // Update Maps links
    document.querySelectorAll('[data-brand="maps-link"]').forEach(el => {
        el.href = brand.mapsUrl;
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
    });

    // Update Telegram links
    document.querySelectorAll('[data-brand="telegram-link"]').forEach(el => {
        el.href = brand.telegramUrl;
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
    });

    document.querySelectorAll('[data-brand="telegram-handle"]').forEach(el => {
        el.textContent = brand.telegramHandle;
    });

    // Update TikTok links
    document.querySelectorAll('[data-brand="tiktok-link"]').forEach(el => {
        el.href = brand.tiktokUrl;
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
    });

    document.querySelectorAll('[data-brand="tiktok-handle"]').forEach(el => {
        el.textContent = brand.tiktokHandle;
    });

    // Update Location text
    document.querySelectorAll('[data-brand="location-text"]').forEach(el => {
        el.textContent = brand.location;
    });
}

/**
 * Sets up the dynamic showcase view based on state
 */
function initShowcaseView() {
    renderCurrentView();
}

/**
 * Master View Controller
 */
function renderCurrentView() {
    const container = document.getElementById('showcase-dynamic-container');
    if (!container) return;

    // Apply smooth fade-transition
    container.classList.add('fading');

    setTimeout(() => {
        container.innerHTML = '';

        if (appState.searchQuery.trim() !== '') {
            renderSearchResults(container);
        } else if (appState.currentCollectionId && appState.currentSubcollectionId) {
            renderProductsView(container);
        } else if (appState.currentCollectionId) {
            renderSubcollectionsView(container);
        } else {
            renderCollectionsView(container);
        }

        updateBreadcrumbs();
        container.classList.remove('fading');

        // Scroll gracefully to top of showcase section if navigated deep
        if (appState.currentCollectionId) {
            const showcaseSection = document.getElementById('collections');
            if (showcaseSection) {
                const navHeight = 90;
                const top = showcaseSection.getBoundingClientRect().top + window.pageYOffset - navHeight;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        }
    }, 180);
}

/**
 * LEVEL 1: Render All Men's Collections Grid
 */
function renderCollectionsView(container) {
    const grid = document.createElement('div');
    grid.className = 'collections-grid';

    appState.allCollections.forEach((col) => {
        const productCount = window.getCollectionProductCount ? window.getCollectionProductCount(col) : 0;
        const subCount = col.subcollections ? col.subcollections.length : 0;

        const card = document.createElement('article');
        card.className = 'collection-card';
        card.innerHTML = `
            <div class="collection-img-wrap">
                <img src="${col.coverImage}" alt="${col.name}" loading="lazy" onerror="this.src='assets/images/logo.jpg'">
            </div>
            <div class="collection-overlay"></div>
            <span class="collection-badge-tag">${col.badge || 'Men\'s Collection'}</span>
            <span class="collection-item-counter">${subCount} Categories • ${productCount} Pieces</span>
            
            <div class="collection-content">
                <h3 class="collection-name">${col.name}</h3>
                <p class="collection-tagline">${col.tagline || ''}</p>
                <p class="collection-description">${col.description || ''}</p>
                <div class="btn-explore-collection">
                    <span>Explore Collection</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            appState.currentCollectionId = col.id;
            appState.currentSubcollectionId = null;
            appState.searchQuery = '';
            const searchInput = document.getElementById('collection-search-input');
            if (searchInput) searchInput.value = '';
            renderCurrentView();
        });

        grid.appendChild(card);
    });

    container.appendChild(grid);
}

/**
 * LEVEL 2: Render Sub-Collections Grid
 */
function renderSubcollectionsView(container) {
    const collection = appState.allCollections.find(c => c.id === appState.currentCollectionId);
    if (!collection) {
        appState.currentCollectionId = null;
        renderCollectionsView(container);
        return;
    }

    // Banner Header
    const banner = document.createElement('div');
    banner.className = 'category-header-banner';
    banner.innerHTML = `
        <div class="category-banner-info">
            <span class="section-eyebrow">${collection.badge || 'Men\'s Collection'}</span>
            <h2 class="category-banner-title">${collection.name}</h2>
            <p class="category-banner-desc">${collection.description || ''}</p>
        </div>
        <button class="btn-back-action" id="btn-back-to-collections">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>All Collections</span>
        </button>
    `;

    container.appendChild(banner);

    // Subcollections Grid
    const subGrid = document.createElement('div');
    subGrid.className = 'subcollections-grid';

    if (collection.subcollections && collection.subcollections.length > 0) {
        collection.subcollections.forEach((sub) => {
            const count = sub.products ? sub.products.length : 0;
            const subCard = document.createElement('div');
            subCard.className = 'subcollection-card';
            subCard.innerHTML = `
                <div class="subcol-img-wrap">
                    <img src="${sub.coverImage}" alt="${sub.name}" loading="lazy" onerror="this.src='assets/images/logo.jpg'">
                    <span class="subcol-count-pill">${count} Lookbook Pieces</span>
                </div>
                <div class="subcol-details">
                    <h3 class="subcol-title">${sub.name}</h3>
                    <p class="subcol-description">${sub.description || ''}</p>
                    <div class="btn-explore-collection">
                        <span>Browse Pieces</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </div>
                </div>
            `;

            subCard.addEventListener('click', () => {
                appState.currentSubcollectionId = sub.id;
                renderCurrentView();
            });

            subGrid.appendChild(subCard);
        });
    }

    container.appendChild(subGrid);

    // Bind Back Button
    const backBtn = banner.querySelector('#btn-back-to-collections');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            appState.currentCollectionId = null;
            appState.currentSubcollectionId = null;
            renderCurrentView();
        });
    }
}

/**
 * LEVEL 3: Render Products & Lookbook Items Grid
 */
function renderProductsView(container) {
    const collection = appState.allCollections.find(c => c.id === appState.currentCollectionId);
    if (!collection) return;

    const subcollection = (collection.subcollections || []).find(s => s.id === appState.currentSubcollectionId);
    if (!subcollection) return;

    // Header Banner
    const banner = document.createElement('div');
    banner.className = 'category-header-banner';
    banner.innerHTML = `
        <div class="category-banner-info">
            <span class="section-eyebrow">${collection.name}</span>
            <h2 class="category-banner-title">${subcollection.name}</h2>
            <p class="category-banner-desc">${subcollection.description || 'Click any piece to inspect, zoom, rotate, or inquire directly.'}</p>
        </div>
        <button class="btn-back-action" id="btn-back-to-subcollections">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>${collection.name}</span>
        </button>
    `;
    container.appendChild(banner);

    // Products Grid
    const prodGrid = document.createElement('div');
    prodGrid.className = 'products-grid';

    const products = subcollection.products || [];

    if (products.length === 0) {
        prodGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: var(--text-secondary);">
                <p style="font-size: 1.1rem; margin-bottom: 12px;">No pieces currently listed in this category.</p>
                <p style="font-size: 0.9rem;">You can easily add images and product details in <code>js/data.js</code>!</p>
            </div>
        `;
    } else {
        products.forEach((product) => {
            const photoCount = (product.gallery && product.gallery.length) || (product.coverImage ? 1 : 0);

            const card = document.createElement('article');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-media-wrap">
                    <img src="${product.coverImage}" alt="${product.name}" loading="lazy" onerror="this.src='assets/images/logo.jpg'">
                    <span class="product-badge-overlay">${product.tag || 'Men\'s'}</span>
                    <span class="product-gallery-pill">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        <span>${photoCount} ${photoCount === 1 ? 'Photo' : 'Photos'}</span>
                    </span>
                    <div class="product-hover-action-overlay">
                        <span class="btn-quick-view">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                <line x1="11" y1="8" x2="11" y2="14"></line>
                                <line x1="8" y1="11" x2="14" y2="11"></line>
                            </svg>
                            View & Zoom
                        </span>
                    </div>
                </div>
                <div class="product-info-wrap">
                    <span class="product-code-meta">${product.code || product.id}</span>
                    <h3 class="product-item-title">${product.name}</h3>
                    <div class="product-card-actions">
                        <button class="btn-card-inquire" title="Inquire on Telegram">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.88.03-.24.38-.49 1.03-.75 4.04-1.76 6.74-2.92 8.09-3.49 3.85-1.6 4.65-1.88 5.17-1.89.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.21-.04.34z"/>
                            </svg>
                            <span>Inquire Piece</span>
                        </button>
                        <a href="tel:+251980818485" class="btn-card-call" title="Call directly">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                            </svg>
                        </a>
                    </div>
                </div>
            `;

            // Open Lightbox on card click
            card.querySelector('.product-media-wrap').addEventListener('click', () => {
                if (window.openProductModal) window.openProductModal(product);
            });

            card.querySelector('.btn-card-inquire').addEventListener('click', (e) => {
                e.stopPropagation();
                const inquiryMsg = encodeURIComponent(`Hello Nilex Fashionhouse! I would like to inquire about: ${product.name} (${product.code || product.id})`);
                window.open(`https://t.me/ezana62?text=${inquiryMsg}`, '_blank', 'noopener,noreferrer');
            });

            prodGrid.appendChild(card);
        });
    }

    container.appendChild(prodGrid);

    // Bind Back Button
    const backBtn = banner.querySelector('#btn-back-to-subcollections');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            appState.currentSubcollectionId = null;
            renderCurrentView();
        });
    }
}

/**
 * Renders global real-time search results across all items
 */
function renderSearchResults(container) {
    const query = appState.searchQuery.toLowerCase().trim();

    // Banner Header
    const banner = document.createElement('div');
    banner.className = 'category-header-banner';
    banner.innerHTML = `
        <div class="category-banner-info">
            <span class="section-eyebrow">Search Results</span>
            <h2 class="category-banner-title">Matching "${escapeHtml(appState.searchQuery)}"</h2>
            <p class="category-banner-desc">Pieces found across men's collections</p>
        </div>
        <button class="btn-back-action" id="btn-clear-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span>Clear Search</span>
        </button>
    `;
    container.appendChild(banner);

    // Collect all matching products
    const matchingProducts = [];

    appState.allCollections.forEach(col => {
        if (col.subcollections) {
            col.subcollections.forEach(sub => {
                if (sub.products) {
                    sub.products.forEach(p => {
                        const matchText = `${p.name} ${p.tag || ''} ${p.code || ''} ${col.name} ${sub.name}`.toLowerCase();
                        if (matchText.includes(query)) {
                            matchingProducts.push({
                                product: p,
                                collectionName: col.name,
                                subcollectionName: sub.name
                            });
                        }
                    });
                }
            });
        }
    });

    const resultsGrid = document.createElement('div');
    resultsGrid.className = 'products-grid';

    if (matchingProducts.length === 0) {
        resultsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px; color: var(--text-secondary);">
                <p style="font-size: 1.2rem; color: var(--ivory); margin-bottom: 10px;">No matching pieces found for "${escapeHtml(appState.searchQuery)}".</p>
                <p style="font-size: 0.9rem;">Try searching for terms like "hoodie", "linen", "tee", "cargo", "jacket", or "bag".</p>
            </div>
        `;
    } else {
        matchingProducts.forEach(({ product, collectionName, subcollectionName }) => {
            const photoCount = (product.gallery && product.gallery.length) || 1;
            const card = document.createElement('article');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-media-wrap">
                    <img src="${product.coverImage}" alt="${product.name}" loading="lazy" onerror="this.src='assets/images/logo.jpg'">
                    <span class="product-badge-overlay">${subcollectionName}</span>
                    <span class="product-gallery-pill">${photoCount} Photos</span>
                    <div class="product-hover-action-overlay">
                        <span class="btn-quick-view">View & Zoom</span>
                    </div>
                </div>
                <div class="product-info-wrap">
                    <span class="product-code-meta">${collectionName} • ${product.code || product.id}</span>
                    <h3 class="product-item-title">${product.name}</h3>
                    <div class="product-card-actions">
                        <button class="btn-card-inquire">
                            <span>Inquire Piece</span>
                        </button>
                    </div>
                </div>
            `;

            card.addEventListener('click', () => {
                if (window.openProductModal) window.openProductModal(product);
            });

            resultsGrid.appendChild(card);
        });
    }

    container.appendChild(resultsGrid);

    const clearBtn = banner.querySelector('#btn-clear-search');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            appState.searchQuery = '';
            const searchInput = document.getElementById('collection-search-input');
            if (searchInput) searchInput.value = '';
            renderCurrentView();
        });
    }
}

/**
 * Updates Breadcrumbs trail dynamically
 */
function updateBreadcrumbs() {
    const breadcrumbContainer = document.getElementById('breadcrumb-trail');
    if (!breadcrumbContainer) return;

    breadcrumbContainer.innerHTML = '';

    // Step 1: All Collections
    const homeBtn = document.createElement('button');
    homeBtn.className = `breadcrumb-btn ${!appState.currentCollectionId ? 'active' : ''}`;
    homeBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span>All Men's Collections</span>
    `;
    homeBtn.addEventListener('click', () => {
        appState.currentCollectionId = null;
        appState.currentSubcollectionId = null;
        appState.searchQuery = '';
        renderCurrentView();
    });
    breadcrumbContainer.appendChild(homeBtn);

    // Step 2: Collection Level
    if (appState.currentCollectionId) {
        const col = appState.allCollections.find(c => c.id === appState.currentCollectionId);
        if (col) {
            const sep = document.createElement('span');
            sep.className = 'breadcrumb-sep';
            sep.textContent = '>';
            breadcrumbContainer.appendChild(sep);

            const colBtn = document.createElement('button');
            colBtn.className = `breadcrumb-btn ${!appState.currentSubcollectionId ? 'active' : ''}`;
            colBtn.textContent = col.name;
            colBtn.addEventListener('click', () => {
                appState.currentSubcollectionId = null;
                appState.searchQuery = '';
                renderCurrentView();
            });
            breadcrumbContainer.appendChild(colBtn);
        }
    }

    // Step 3: Subcollection Level
    if (appState.currentCollectionId && appState.currentSubcollectionId) {
        const col = appState.allCollections.find(c => c.id === appState.currentCollectionId);
        const sub = col && (col.subcollections || []).find(s => s.id === appState.currentSubcollectionId);
        if (sub) {
            const sep2 = document.createElement('span');
            sep2.className = 'breadcrumb-sep';
            sep2.textContent = '>';
            breadcrumbContainer.appendChild(sep2);

            const subBtn = document.createElement('span');
            subBtn.className = 'breadcrumb-btn active';
            subBtn.textContent = sub.name;
            breadcrumbContainer.appendChild(subBtn);
        }
    }
}

/**
 * Real-time Search Input Listener with Debounce
 */
function initSearch() {
    const searchInput = document.getElementById('collection-search-input');
    if (!searchInput) return;

    let debounceTimer = null;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            appState.searchQuery = e.target.value;
            renderCurrentView();
        }, 220);
    });
}

/**
 * Mobile Navigation Menu Controls
 */
function initMobileNav() {
    const toggle = document.querySelector('.mobile-toggle');
    const menu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('open');
        menu.classList.toggle('open');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('open');
            menu.classList.remove('open');
        });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !toggle.contains(e.target) && menu.classList.contains('open')) {
            toggle.classList.remove('open');
            menu.classList.remove('open');
        }
    });
}

/**
 * Smooth scrolling and internal navigation links
 */
function initNavigation() {
    const copyPhoneBtns = document.querySelectorAll('.btn-copy-phone');
    copyPhoneBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const phone = window.NILEX_BRAND_INFO ? window.NILEX_BRAND_INFO.phone : '0980818485';
            navigator.clipboard.writeText(phone).then(() => {
                showToast(`Phone number (${phone}) copied to clipboard!`);
            }).catch(() => {
                showToast(`Call Nilex at: ${phone}`);
            });
        });
    });
}

/**
 * Toast Notice Utility
 */
function showToast(message) {
    let toast = document.getElementById('toast-notice');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notice';
        toast.className = 'toast-notice';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3200);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
