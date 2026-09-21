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
    allCollections: []
};

document.addEventListener('DOMContentLoaded', () => {
    // Initialize data from data.js
    appState.allCollections = window.NILEX_COLLECTIONS || [];

    // Initialize UI components
    bindBrandInfo();
    initNavigation();
    initShowcaseView();
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

    // Update Telegram Channel links
    document.querySelectorAll('[data-brand="telegram-channel-link"]').forEach(el => {
        el.href = brand.telegramChannelUrl;
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
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

        if (appState.currentCollectionId && appState.currentSubcollectionId) {
            renderProductsView(container);
        } else if (appState.currentCollectionId) {
            const collection = appState.allCollections.find(c => c.id === appState.currentCollectionId);
            if (collection && (!collection.subcollections || collection.subcollections.length === 0)) {
                renderProductsView(container);
            } else {
                renderSubcollectionsView(container);
            }
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
 * LEVEL 1: Render All Men's Collections as a Card Stack Fan Carousel
 */
function renderCollectionsView(container) {
    const stackContainer = document.createElement('div');
    stackContainer.className = 'collections-stack-wrapper';
    container.appendChild(stackContainer);

    if (window.CardStack) {
        new window.CardStack(stackContainer, {
            items: appState.allCollections,
            cardShape: 'squarish',
            getItemData: (col) => {
                const productCount = window.getCollectionProductCount ? window.getCollectionProductCount(col) : 0;
                const subCount = col.subcollections ? col.subcollections.length : 0;
                const countText = subCount > 0
                    ? `${subCount} Categories • ${productCount} Pieces`
                    : `${productCount} Lookbook Pieces`;
                return {
                    name: col.name,
                    tagline: col.tagline || '',
                    description: col.description || '',
                    coverImage: col.coverImage,
                    badge: col.badge || "Men's Collection",
                    countText: countText
                };
            },
            onSelect: (col) => {
                appState.currentCollectionId = col.id;
                appState.currentSubcollectionId = null;
                renderCurrentView();
            }
        });
    }
}

/**
 * LEVEL 2: Render Sub-Collections as a Portrait Card Stack Fan Carousel
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

    // Subcollections Stack Container
    const stackContainer = document.createElement('div');
    stackContainer.className = 'subcollections-stack-wrapper';
    container.appendChild(stackContainer);

    if (window.CardStack && collection.subcollections && collection.subcollections.length > 0) {
        new window.CardStack(stackContainer, {
            items: collection.subcollections,
            cardShape: 'portrait',
            getItemData: (sub) => {
                const count = sub.products ? sub.products.length : 0;
                return {
                    name: sub.name,
                    tagline: '',
                    description: sub.description || '',
                    coverImage: sub.coverImage,
                    badge: collection.name,
                    countText: `${count} Lookbook Pieces`
                };
            },
            onSelect: (sub) => {
                appState.currentSubcollectionId = sub.id;
                renderCurrentView();
            }
        });
    }

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
 * LEVEL 3: Render Products & Lookbook Items Stack
 */
function renderProductsView(container) {
    const collection = appState.allCollections.find(c => c.id === appState.currentCollectionId);
    if (!collection) return;

    const subcollection = (collection.subcollections || []).find(s => s.id === appState.currentSubcollectionId);

    let eyebrowText = collection.name;
    let titleText = subcollection ? subcollection.name : collection.name;
    let descText = subcollection ? (subcollection.description || 'Click any piece to inspect, zoom, or inquire directly.') : (collection.description || 'Click any piece to inspect, zoom, or inquire directly.');
    let backBtnText = subcollection ? collection.name : 'All Collections';

    if (!subcollection) {
        eyebrowText = collection.badge || "Men's Collection";
    }

    // Header Banner
    const banner = document.createElement('div');
    banner.className = 'category-header-banner';
    banner.innerHTML = `
        <div class="category-banner-info">
            <span class="section-eyebrow">${eyebrowText}</span>
            <h2 class="category-banner-title">${titleText}</h2>
            <p class="category-banner-desc">${descText}</p>
        </div>
        <button class="btn-back-action" id="btn-back-action">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>${backBtnText}</span>
        </button>
    `;
    container.appendChild(banner);

    const products = subcollection ? (subcollection.products || []) : (collection.products || []);

    if (products.length === 0) {
        const emptyBox = document.createElement('div');
        emptyBox.style.textAlign = 'center';
        emptyBox.style.padding = '60px';
        emptyBox.style.color = 'var(--text-secondary)';
        emptyBox.innerHTML = `
            <p style="font-size: 1.1rem; margin-bottom: 12px;">No pieces currently listed in this category.</p>
            <p style="font-size: 0.9rem;">You can easily add images to this subcollection's <code>images/</code> folder!</p>
        `;
        container.appendChild(emptyBox);
    } else if (window.CardStack) {
        const stackContainer = document.createElement('div');
        stackContainer.className = 'products-stack-wrapper';
        container.appendChild(stackContainer);

        new window.CardStack(stackContainer, {
            items: products,
            cardShape: 'portrait',
            getItemData: (prod) => ({
                name: '',
                tagline: '',
                description: '',
                coverImage: prod.coverImage,
                badge: '',
                countText: ''
            }),
            renderCard: (prod, data) => {
                const badgeHtml = prod.tag ? `<span class="product-badge-overlay">${escapeHtml(prod.tag)}</span>` : '';
                const codeStr = escapeHtml(prod.code || prod.id || '');
                return `
                    <div class="stack-card-inner">
                        <img class="stack-card-image" src="${prod.coverImage}" alt="${codeStr}" loading="lazy" onerror="this.src='assets/images/logo.jpg'">
                        <div class="stack-card-overlay"></div>
                        ${badgeHtml ? `<div class="stack-card-top-bar">${badgeHtml}</div>` : ''}
                        <div class="product-stack-content">
                            <span class="product-code-meta">${codeStr}</span>
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
                    </div>
                `;
            },
            onCardCreated: (cardEl, prod) => {
                const stopAll = (e) => {
                    e.stopPropagation();
                };

                const inquireBtn = cardEl.querySelector('.btn-card-inquire');
                if (inquireBtn) {
                    inquireBtn.addEventListener('touchstart', stopAll, { passive: true });
                    inquireBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const codeStr = prod.code || prod.id;
                        const inquiryMsg = encodeURIComponent(`Hello Nilex Fashionhouse! I would like to inquire about piece: ${codeStr}`);
                        window.open(`https://t.me/ezana62?text=${inquiryMsg}`, '_blank', 'noopener,noreferrer');
                    });
                }

                const callBtn = cardEl.querySelector('.btn-card-call');
                if (callBtn) {
                    callBtn.addEventListener('touchstart', stopAll, { passive: true });
                    callBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                    });
                }
            },
            onSelect: (prod) => {
                if (window.openProductModal) {
                    window.openProductModal(prod);
                }
            }
        });
    }

    // Bind Back Button
    const backBtn = banner.querySelector('#btn-back-action');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (subcollection) {
                appState.currentSubcollectionId = null;
            } else {
                appState.currentCollectionId = null;
                appState.currentSubcollectionId = null;
            }
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

            const hasSubcollections = col.subcollections && col.subcollections.length > 0;
            const isColActive = !appState.currentSubcollectionId && hasSubcollections;

            if (hasSubcollections) {
                const colBtn = document.createElement('button');
                colBtn.className = `breadcrumb-btn ${isColActive ? 'active' : ''}`;
                colBtn.textContent = col.name;
                colBtn.addEventListener('click', () => {
                    appState.currentSubcollectionId = null;
                    renderCurrentView();
                });
                breadcrumbContainer.appendChild(colBtn);
            } else {
                const colSpan = document.createElement('span');
                colSpan.className = 'breadcrumb-btn active';
                colSpan.textContent = col.name;
                breadcrumbContainer.appendChild(colSpan);
            }
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
