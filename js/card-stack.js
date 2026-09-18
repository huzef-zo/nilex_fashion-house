/**
 * =========================================================================
 * NILEX FASHIONHOUSE - REUSABLE CARD STACK CAROUSEL COMPONENT
 * Slogan: "Flow like the nile"
 * =========================================================================
 */

class CardStack {
    /**
     * @param {HTMLElement} container - Container element where the stack will be mounted
     * @param {Object} options - Stack configuration
     * @param {Array} options.items - Array of item objects
     * @param {string} options.cardShape - 'squarish' (4:5 / 1:1) or 'portrait' (2:3)
     * @param {Function} options.getItemData - Function(item) returning { name, tagline, description, coverImage, badge, countText }
     * @param {Function} options.onSelect - Function(item, index) called when front card is tapped/clicked
     */
    constructor(container, options) {
        this.container = container;
        this.items = options.items || [];
        this.cardShape = options.cardShape || 'squarish';
        this.getItemData = options.getItemData || ((item) => ({
            name: item.name || '',
            tagline: item.tagline || '',
            description: item.description || '',
            coverImage: item.coverImage || '',
            badge: item.badge || '',
            countText: item.countText || ''
        }));
        this.renderCard = options.renderCard || null;
        this.onCardCreated = options.onCardCreated || null;
        this.onSelect = options.onSelect || (() => {});

        this.currentIndex = 0;
        this.isDragging = false;
        this.startX = 0;
        this.currentX = 0;
        this.dragDeltaX = 0;
        this.hasMoved = false;
        this.dragThreshold = 40; // minimum pixels to count as a drag swipe

        this.cards = [];
        this.resizeHandler = this.handleResize.bind(this);

        this.init();
    }

    init() {
        if (!this.container || this.items.length === 0) return;

        this.container.innerHTML = '';

        // Main Wrapper
        this.wrapper = document.createElement('div');
        this.wrapper.className = `card-stack-wrapper ${this.cardShape}-stack`;

        // Stage for overlapping cards
        this.stage = document.createElement('div');
        this.stage.className = 'card-stack-stage';

        // Render each card
        this.items.forEach((item, index) => {
            const data = this.getItemData(item);
            const card = document.createElement('article');
            card.className = `card-stack-card ${this.cardShape}`;
            card.dataset.index = index;

            if (this.renderCard) {
                card.innerHTML = this.renderCard(item, data, index);
            } else {
                card.innerHTML = `
                    <div class="stack-card-inner">
                        <img class="stack-card-image" src="${data.coverImage}" alt="${data.name}" loading="lazy" onerror="this.src='assets/images/logo.jpg'">
                        <div class="stack-card-overlay"></div>
                        <div class="stack-card-top-bar">
                            ${data.badge ? `<span class="stack-card-badge" title="${data.badge}">${data.badge}</span>` : '<span></span>'}
                            ${data.countText ? `<span class="stack-card-count">${data.countText}</span>` : ''}
                        </div>
                        <div class="stack-card-content">
                            <h3 class="stack-card-title">${data.name}</h3>
                        </div>
                    </div>
                `;
            }

            if (this.onCardCreated) {
                this.onCardCreated(card, item, index);
            }

            this.stage.appendChild(card);
            this.cards.push(card);
        });

        this.wrapper.appendChild(this.stage);

        // Controls Bar (Prev/Next buttons & Dots)
        if (this.items.length > 1) {
            const controls = document.createElement('div');
            controls.className = 'card-stack-controls';

            const prevBtn = document.createElement('button');
            prevBtn.className = 'stack-nav-btn stack-prev-btn';
            prevBtn.setAttribute('aria-label', 'Previous Card');
            prevBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
            `;
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.prev();
            });

            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'stack-dots-container';
            this.dots = [];

            this.items.forEach((_, idx) => {
                const dot = document.createElement('button');
                dot.className = `stack-dot ${idx === 0 ? 'active' : ''}`;
                dot.setAttribute('aria-label', `Go to card ${idx + 1}`);
                dot.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.goTo(idx);
                });
                dotsContainer.appendChild(dot);
                this.dots.push(dot);
            });

            const nextBtn = document.createElement('button');
            nextBtn.className = 'stack-nav-btn stack-next-btn';
            nextBtn.setAttribute('aria-label', 'Next Card');
            nextBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
            `;
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.next();
            });

            controls.appendChild(prevBtn);
            controls.appendChild(dotsContainer);
            controls.appendChild(nextBtn);
            this.wrapper.appendChild(controls);
        }

        // Live Caption Box Below Stack
        this.captionBox = document.createElement('div');
        this.captionBox.className = 'stack-caption-box';
        this.wrapper.appendChild(this.captionBox);

        this.container.appendChild(this.wrapper);

        // Bind Drag and Touch events
        this.bindEvents();

        // Initial layout calculation
        this.updateLayout();
        this.updateCaption();

        window.addEventListener('resize', this.resizeHandler);
    }

    bindEvents() {
        // Touch events for mobile/touch devices (swipe-to-cycle, tap-to-open)
        const onTouchStart = (e) => {
            if (!e.touches || e.touches.length === 0) return;
            this.isDragging = true;
            this.hasMoved = false;
            this.startX = e.touches[0].clientX;
            this.currentX = this.startX;
            this.dragDeltaX = 0;
            this.stage.classList.add('is-dragging');
        };

        const onTouchMove = (e) => {
            if (!this.isDragging || !e.touches || e.touches.length === 0) return;
            this.currentX = e.touches[0].clientX;
            const delta = this.currentX - this.startX;

            if (Math.abs(delta) > 5) {
                this.hasMoved = true;
            }

            this.dragDeltaX = delta;
            this.updateLayout(true); // pass true for realtime dragging transform
        };

        const onTouchEnd = () => {
            if (!this.isDragging) return;
            this.isDragging = false;
            this.stage.classList.remove('is-dragging');

            if (this.hasMoved && Math.abs(this.dragDeltaX) >= this.dragThreshold) {
                if (this.dragDeltaX < 0) {
                    this.next();
                } else {
                    this.prev();
                }
            } else if (!this.hasMoved) {
                // Clean tap on front card
                const frontCard = this.cards[this.currentIndex];
                if (frontCard) {
                    const item = this.items[this.currentIndex];
                    this.onSelect(item, this.currentIndex);
                }
            }

            this.dragDeltaX = 0;
            this.updateLayout();
        };

        this.stage.addEventListener('touchstart', onTouchStart, { passive: true });
        this.stage.addEventListener('touchmove', onTouchMove, { passive: true });
        this.stage.addEventListener('touchend', onTouchEnd);
        this.stage.addEventListener('touchcancel', onTouchEnd);

        // Continuous Hover-Scrub for Desktop (mouse / fine pointer)
        const onHoverScrub = (e) => {
            if (e.pointerType === 'touch') return;
            if (this.items.length <= 1) return;

            const rect = this.wrapper.getBoundingClientRect();
            if (!rect.width) return;

            const mouseXFraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const scrubIndex = Math.round(mouseXFraction * (this.items.length - 1));

            if (scrubIndex !== this.currentIndex && scrubIndex >= 0 && scrubIndex < this.items.length) {
                this.goTo(scrubIndex);
            }
        };

        this.wrapper.addEventListener('pointermove', onHoverScrub);

        // Click handling: clicking the front card triggers navigation
        this.cards.forEach((card, idx) => {
            card.addEventListener('click', (e) => {
                if (this.hasMoved) return; // Ignore if user was swiping on touch
                e.stopPropagation();
                if (idx === this.currentIndex) {
                    const item = this.items[idx];
                    this.onSelect(item, idx);
                } else {
                    this.goTo(idx);
                }
            });
        });
    }

    getClientX(e) {
        if (e.touches && e.touches.length > 0) {
            return e.touches[0].clientX;
        }
        return e.clientX;
    }

    handleResize() {
        if (!document.body.contains(this.container)) {
            window.removeEventListener('resize', this.resizeHandler);
            return;
        }
        this.updateLayout();
    }

    goTo(index) {
        if (index < 0 || index >= this.items.length) return;
        this.currentIndex = index;
        this.updateLayout();
        this.updateCaption();
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.items.length;
        this.updateLayout();
        this.updateCaption();
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
        this.updateLayout();
        this.updateCaption();
    }

    updateCaption() {
        if (!this.captionBox) return;
        const currentItem = this.items[this.currentIndex];
        if (!currentItem) return;

        const data = this.getItemData(currentItem);
        const taglineHtml = data.tagline ? `<p class="caption-tagline">${data.tagline}</p>` : '';
        const descHtml = data.description ? `<p class="caption-desc">${data.description}</p>` : '';

        if (!data.tagline && !data.description) {
            this.captionBox.style.display = 'none';
        } else {
            this.captionBox.style.display = '';
            this.captionBox.innerHTML = `
                <div class="caption-content-inner">
                    <span class="caption-counter">${this.currentIndex + 1} / ${this.items.length}</span>
                    ${taglineHtml}
                    ${descHtml}
                </div>
            `;
        }

        // Update Dots
        if (this.dots) {
            this.dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === this.currentIndex);
            });
        }
    }

    /**
     * Calculates card transforms for the mountain / fan silhouette
     */
    updateLayout(isDraggingLive = false) {
        const stageWidth = this.stage.clientWidth || window.innerWidth;
        const isMobile = window.innerWidth <= 600;
        const total = this.items.length;

        // Responsive offset step and scaling based on screen size
        let stepX = isMobile ? Math.min(stageWidth * 0.22, 65) : Math.min(stageWidth * 0.28, 180);
        let scaleStep = isMobile ? 0.12 : 0.15;
        let rotationStep = isMobile ? 3 : 5;

        // Max visible cards on each side
        const maxSide = isMobile ? 1 : 2;

        this.cards.forEach((card, idx) => {
            // Calculate raw offset relative to currentIndex
            let offset = idx - this.currentIndex;

            // Handle shortest distance wrapping if total > 3
            if (total > 3) {
                if (offset > total / 2) offset -= total;
                if (offset < -total / 2) offset += total;
            }

            // Real-time drag shift
            let dragOffset = 0;
            if (isDraggingLive && this.dragDeltaX !== 0) {
                const cardWidth = card.clientWidth || 280;
                dragOffset = this.dragDeltaX / cardWidth;
            }

            const effectiveOffset = offset + dragOffset;
            const absOffset = Math.abs(effectiveOffset);

            // Is card visible within maxSide range
            if (absOffset > maxSide + 0.8) {
                card.style.opacity = '0';
                card.style.pointerEvents = 'none';
                card.style.transform = `translate3d(${effectiveOffset * stepX * 1.5}px, 40px, -200px) scale(0.5)`;
                card.style.zIndex = '0';
                return;
            }

            card.style.pointerEvents = absOffset < 0.3 ? 'auto' : 'none';

            // Z-Index: Front card gets highest z-index
            const zIndex = 100 - Math.round(absOffset * 10);
            card.style.zIndex = zIndex;

            // Compute transforms
            const translateX = effectiveOffset * stepX;
            const scale = Math.max(0.65, 1 - absOffset * scaleStep);
            const rotateY = effectiveOffset * -rotationStep; // Gentle 3D fan tilt
            const translateY = absOffset * (isMobile ? 12 : 18); // Slight arch down for mountain shape
            const opacity = Math.max(0, 1 - absOffset * 0.35);

            // Apply style
            card.style.transform = `translate3d(${translateX}px, ${translateY}px, 0px) scale(${scale}) rotateY(${rotateY}deg)`;
            card.style.opacity = opacity;

            if (isDraggingLive) {
                card.style.transition = 'none';
            } else {
                card.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.45s ease, box-shadow 0.45s ease';
            }

            // Toggle active class on front card
            card.classList.toggle('is-front', absOffset < 0.3);
        });
    }

    destroy() {
        window.removeEventListener('resize', this.resizeHandler);
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Attach to window object
window.CardStack = CardStack;
