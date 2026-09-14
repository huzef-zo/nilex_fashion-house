/**
 * =========================================================================
 * NILEX FASHIONHOUSE - 3D INTERACTIVE ROTATABLE & ZOOMABLE VIEWER ENGINE
 * Slogan: "Flow like the nile"
 * =========================================================================
 */

let currentActiveProduct = null;
let currentImageIndex = 0;
let productGalleryImages = [];

// 3D Spatial State
const state3D = {
    rotX: 0,           // Pitch (Tilt up/down)
    rotY: 0,           // Yaw (360° Turntable Orbit)
    rotZ: 0,           // Roll
    zoom: 1,           // Scale (0.8x - 3.5x)
    minZoom: 0.8,
    maxZoom: 3.5,
    isDragging: false,
    isAutoOrbit: false,
    orbitSpeed: 0.35,  // Degrees per frame
    lastMouseX: 0,
    lastMouseY: 0,
    animFrameId: null
};

document.addEventListener('DOMContentLoaded', () => {
    init3DViewer();
});

function init3DViewer() {
    const modal = document.getElementById('product-lightbox');
    if (!modal) return;

    // Close button
    const closeBtn = modal.querySelector('.lightbox-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeProductModal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeProductModal();
    });

    // 3D Viewport element
    const viewport = modal.querySelector('#lightbox-3d-viewport');
    const scene = modal.querySelector('#lightbox-3d-scene');

    // Prev / Next Photo Buttons
    const prevBtn = modal.querySelector('.lightbox-prev-btn');
    const nextBtn = modal.querySelector('.lightbox-next-btn');
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPreviousImage(); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNextImage(); });

    // 3D Toolbar Buttons
    const btnAutoOrbit = modal.querySelector('#btn-3d-auto-orbit');
    const btnZoomIn = modal.querySelector('#btn-3d-zoom-in');
    const btnZoomOut = modal.querySelector('#btn-3d-zoom-out');
    const btnReset = modal.querySelector('#btn-3d-reset');
    const btnPresetFront = modal.querySelector('#btn-3d-preset-front');
    const btnPresetAngle = modal.querySelector('#btn-3d-preset-angle');

    if (btnAutoOrbit) {
        btnAutoOrbit.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleAutoOrbit();
        });
    }

    if (btnZoomIn) btnZoomIn.addEventListener('click', (e) => { e.stopPropagation(); adjust3DZoom(0.25); });
    if (btnZoomOut) btnZoomOut.addEventListener('click', (e) => { e.stopPropagation(); adjust3DZoom(-0.25); });
    if (btnReset) btnReset.addEventListener('click', (e) => { e.stopPropagation(); reset3DView(); });
    if (btnPresetFront) btnPresetFront.addEventListener('click', (e) => { e.stopPropagation(); set3DPreset(0, 0); });
    if (btnPresetAngle) btnPresetAngle.addEventListener('click', (e) => { e.stopPropagation(); set3DPreset(-8, 28); });

    // Interactive 3D Orbit by Mouse Dragging
    if (viewport) {
        viewport.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            state3D.isDragging = true;
            state3D.lastMouseX = e.clientX;
            state3D.lastMouseY = e.clientY;
            viewport.classList.add('is-dragging');
            // Hide hint badge once user interacts
            const hint = modal.querySelector('.viewer-3d-hint-badge');
            if (hint) hint.style.opacity = '0';
        });

        window.addEventListener('mousemove', (e) => {
            if (!state3D.isDragging) return;
            const deltaX = e.clientX - state3D.lastMouseX;
            const deltaY = e.clientY - state3D.lastMouseY;

            state3D.rotY += deltaX * 0.6;
            state3D.rotX = Math.max(Math.min(state3D.rotX - deltaY * 0.4, 45), -45);

            state3D.lastMouseX = e.clientX;
            state3D.lastMouseY = e.clientY;

            // Optional 360 photo switching if multiple angles exist
            checkMultiAngleSwitch();

            apply3DTransform();
        });

        window.addEventListener('mouseup', () => {
            if (state3D.isDragging) {
                state3D.isDragging = false;
                viewport.classList.remove('is-dragging');
            }
        });

        // Mouse Wheel Zoom
        viewport.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY < 0 ? 0.2 : -0.2;
            adjust3DZoom(delta);
        }, { passive: false });

        // Double-click toggle zoom
        viewport.addEventListener('dblclick', (e) => {
            e.preventDefault();
            if (state3D.zoom > 1.2) {
                reset3DView();
            } else {
                state3D.zoom = 2.0;
                apply3DTransform();
            }
        });

        // Touch Drag & Orbit for Mobile
        let touchStartX = 0;
        let touchStartY = 0;
        let initialPinchDist = null;
        let initialPinchZoom = 1;

        viewport.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                state3D.isDragging = true;
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            } else if (e.touches.length === 2) {
                state3D.isDragging = false;
                initialPinchDist = getTouchDist(e.touches);
                initialPinchZoom = state3D.zoom;
            }
        }, { passive: true });

        viewport.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1 && state3D.isDragging) {
                const deltaX = e.touches[0].clientX - touchStartX;
                const deltaY = e.touches[0].clientY - touchStartY;

                state3D.rotY += deltaX * 0.8;
                state3D.rotX = Math.max(Math.min(state3D.rotX - deltaY * 0.5, 45), -45);

                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;

                apply3DTransform();
            } else if (e.touches.length === 2 && initialPinchDist) {
                const currentDist = getTouchDist(e.touches);
                const scaleFactor = currentDist / initialPinchDist;
                state3D.zoom = Math.min(Math.max(initialPinchZoom * scaleFactor, state3D.minZoom), state3D.maxZoom);
                apply3DTransform();
            }
        }, { passive: true });

        viewport.addEventListener('touchend', (e) => {
            if (e.touches.length === 0) {
                state3D.isDragging = false;
                initialPinchDist = null;
            }
        });
    }

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('active')) return;

        if (e.key === 'Escape') closeProductModal();
        else if (e.key === 'ArrowLeft') state3D.rotY -= 15;
        else if (e.key === 'ArrowRight') state3D.rotY += 15;
        else if (e.key === 'ArrowUp') state3D.rotX = Math.min(state3D.rotX + 10, 45);
        else if (e.key === 'ArrowDown') state3D.rotX = Math.max(state3D.rotX - 10, -45);
        else if (e.key === '+' || e.key === '=') adjust3DZoom(0.25);
        else if (e.key === '-' || e.key === '_') adjust3DZoom(-0.25);
        else if (e.key === '0') reset3DView();
        else if (e.key === ' ') { e.preventDefault(); toggleAutoOrbit(); }

        apply3DTransform();
    });
}

function getTouchDist(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Applies 3D transform with dynamic lighting & shadows
 */
function apply3DTransform() {
    const scene = document.getElementById('lightbox-3d-scene');
    const glare = document.getElementById('lightbox-3d-glare');
    const shadow = document.getElementById('lightbox-3d-shadow');
    const zoomLevelEl = document.getElementById('viewer-3d-zoom-level');

    if (!scene) return;

    // Apply 3D perspective rotation and zoom scale
    scene.style.transform = `scale(${state3D.zoom}) rotateX(${state3D.rotX}deg) rotateY(${state3D.rotY}deg) rotateZ(${state3D.rotZ}deg)`;

    // Update dynamic 3D glare light reflection position
    if (glare) {
        const lightX = 50 + (state3D.rotY % 180) * 0.4;
        const lightY = 30 + state3D.rotX * 0.8;
        glare.style.background = `radial-gradient(circle at ${lightX}% ${lightY}%, rgba(255, 255, 255, 0.3) 0%, transparent 60%)`;
    }

    // Update 3D floor shadow offset
    if (shadow) {
        const shadowShiftX = (state3D.rotY % 360) * 0.3;
        shadow.style.transform = `rotateX(90deg) translateZ(-60px) translateX(${shadowShiftX}px)`;
    }

    // Update zoom percentage badge
    if (zoomLevelEl) {
        zoomLevelEl.textContent = `${Math.round(state3D.zoom * 100)}%`;
    }
}

/**
 * Smooth 3D Auto-Orbit Turntable Loop
 */
function runAutoOrbitLoop() {
    if (!state3D.isAutoOrbit) return;

    if (!state3D.isDragging) {
        state3D.rotY = (state3D.rotY + state3D.orbitSpeed) % 360;
        checkMultiAngleSwitch();
        apply3DTransform();
    }

    state3D.animFrameId = requestAnimationFrame(runAutoOrbitLoop);
}

function toggleAutoOrbit() {
    state3D.isAutoOrbit = !state3D.isAutoOrbit;
    const btn = document.getElementById('btn-3d-auto-orbit');
    
    if (state3D.isAutoOrbit) {
        if (btn) btn.classList.add('active');
        runAutoOrbitLoop();
    } else {
        if (btn) btn.classList.remove('active');
        if (state3D.animFrameId) cancelAnimationFrame(state3D.animFrameId);
    }
}

function adjust3DZoom(delta) {
    state3D.zoom = Math.min(Math.max(state3D.zoom + delta, state3D.minZoom), state3D.maxZoom);
    apply3DTransform();
}

function set3DPreset(rotX, rotY) {
    state3D.rotX = rotX;
    state3D.rotY = rotY;
    state3D.zoom = 1;
    apply3DTransform();
}

function reset3DView() {
    state3D.rotX = 0;
    state3D.rotY = 0;
    state3D.rotZ = 0;
    state3D.zoom = 1;
    if (state3D.isAutoOrbit) toggleAutoOrbit();
    apply3DTransform();
}

/**
 * Optional multi-angle photo switching during 360 turntable
 */
function checkMultiAngleSwitch() {
    if (productGalleryImages.length <= 1) return;
    const normalizedY = ((state3D.rotY % 360) + 360) % 360;
    const slice = 360 / productGalleryImages.length;
    const targetIdx = Math.floor(normalizedY / slice) % productGalleryImages.length;

    if (targetIdx !== currentImageIndex) {
        currentImageIndex = targetIdx;
        update3DImageSource();
    }
}

/**
 * Opens the 3D Interactive Modal for a product
 */
function openProductModal(product) {
    if (!product) return;
    currentActiveProduct = product;

    // Collect all photos
    const images = [];
    if (product.coverImage) images.push(product.coverImage);
    if (Array.isArray(product.gallery)) {
        product.gallery.forEach((img) => {
            if (img && !images.includes(img)) images.push(img);
        });
    }
    productGalleryImages = images.length > 0 ? images : ['assets/images/logo.jpg'];
    currentImageIndex = 0;

    const modal = document.getElementById('product-lightbox');
    if (!modal) return;

    // Update Title & Links
    const titleEl = modal.querySelector('#modal-piece-title');
    const telegramBtn = modal.querySelector('#modal-btn-telegram');
    const callBtn = modal.querySelector('#modal-btn-call');

    if (titleEl) {
        titleEl.textContent = `${product.name} ${product.code ? `(${product.code})` : ''}`;
    }

    const inquiryMessage = encodeURIComponent(
        `Hello Nilex Men's Fashionhouse! ✨\n` +
        `I am interested in inquiring about this piece:\n` +
        `• Name: ${product.name}\n` +
        `• Code: ${product.code || product.id}\n` +
        `Please let me know availability and sizing!`
    );

    if (telegramBtn) {
        telegramBtn.href = `https://t.me/ezana62?text=${inquiryMessage}`;
        telegramBtn.target = '_blank';
        telegramBtn.rel = 'noopener noreferrer';
    }

    if (callBtn) {
        const phone = (window.NILEX_BRAND_INFO && window.NILEX_BRAND_INFO.phoneTel) || 'tel:+251980818485';
        callBtn.href = phone;
    }

    // Reset 3D State
    reset3DView();

    // Render Thumbnails
    renderThumbnails();

    // Update Image Source
    update3DImageSource();

    // Show Modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Show 3D Hint Badge initially
    const hint = modal.querySelector('.viewer-3d-hint-badge');
    if (hint) hint.style.opacity = '1';
}

function closeProductModal() {
    const modal = document.getElementById('product-lightbox');
    if (!modal) return;

    modal.classList.remove('active');
    document.body.style.overflow = '';
    currentActiveProduct = null;
    if (state3D.isAutoOrbit) toggleAutoOrbit();
    reset3DView();
}

function renderThumbnails() {
    const strip = document.getElementById('lightbox-thumbnails');
    if (!strip) return;

    strip.innerHTML = '';
    if (productGalleryImages.length <= 1) {
        strip.style.display = 'none';
        return;
    }

    strip.style.display = 'flex';

    productGalleryImages.forEach((imgSrc, idx) => {
        const thumb = document.createElement('div');
        thumb.className = `lightbox-thumb ${idx === currentImageIndex ? 'active' : ''}`;
        thumb.innerHTML = `<img src="${imgSrc}" alt="3D Angle ${idx + 1}" onerror="this.src='assets/images/logo.jpg'">`;
        
        thumb.addEventListener('click', (e) => {
            e.stopPropagation();
            currentImageIndex = idx;
            update3DImageSource();
        });

        strip.appendChild(thumb);
    });
}

function update3DImageSource() {
    const mainImg = document.getElementById('lightbox-main-img');
    if (!mainImg) return;

    const targetSrc = productGalleryImages[currentImageIndex] || 'assets/images/logo.jpg';

    mainImg.src = targetSrc;

    // Update active thumbnail
    const thumbs = document.querySelectorAll('.lightbox-thumb');
    thumbs.forEach((t, i) => {
        if (i === currentImageIndex) t.classList.add('active');
        else t.classList.remove('active');
    });

    // Update arrows display
    const prevBtn = document.querySelector('.lightbox-prev-btn');
    const nextBtn = document.querySelector('.lightbox-next-btn');
    if (prevBtn && nextBtn) {
        if (productGalleryImages.length <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
        }
    }
}

function showNextImage() {
    if (productGalleryImages.length <= 1) return;
    currentImageIndex = (currentImageIndex + 1) % productGalleryImages.length;
    update3DImageSource();
}

function showPreviousImage() {
    if (productGalleryImages.length <= 1) return;
    currentImageIndex = (currentImageIndex - 1 + productGalleryImages.length) % productGalleryImages.length;
    update3DImageSource();
}

// Global Export
if (typeof window !== 'undefined') {
    window.openProductModal = openProductModal;
    window.closeProductModal = closeProductModal;
}
