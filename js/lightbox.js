/**
 * =========================================================================
 * NILEX FASHIONHOUSE - PLAIN FULL-SCREEN PRODUCT IMAGE VIEWER
 * Slogan: "Flow like the nile"
 * =========================================================================
 */

let currentActiveProduct = null;

const viewerState = {
    zoom: 1,
    minZoom: 1,
    maxZoom: 4,
    panX: 0,
    panY: 0,
    isDragging: false,
    startX: 0,
    startY: 0,
    initialPinchDist: null,
    initialPinchZoom: 1
};

document.addEventListener('DOMContentLoaded', () => {
    initLightbox();
});

function initLightbox() {
    const modal = document.getElementById('product-lightbox');
    if (!modal) return;

    const closeBtn = modal.querySelector('.lightbox-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeProductModal();
        });
    }

    const stage = document.getElementById('lightbox-stage');
    const mainImg = document.getElementById('lightbox-main-img');

    // Close on clicking backdrop (outside the main image)
    modal.addEventListener('click', (e) => {
        if (mainImg && !mainImg.contains(e.target)) {
            closeProductModal();
        }
    });

    if (mainImg) {
        mainImg.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        // Mouse Drag / Pan when Zoomed In
        mainImg.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            if (viewerState.zoom > 1) {
                viewerState.isDragging = true;
                viewerState.startX = e.clientX - viewerState.panX;
                viewerState.startY = e.clientY - viewerState.panY;
                if (stage) stage.classList.add('is-dragging');
            }
        });
    }

    window.addEventListener('mousemove', (e) => {
        if (!viewerState.isDragging) return;
        viewerState.panX = e.clientX - viewerState.startX;
        viewerState.panY = e.clientY - viewerState.startY;
        applyTransform();
    });

    window.addEventListener('mouseup', () => {
        if (viewerState.isDragging) {
            viewerState.isDragging = false;
            if (stage) stage.classList.remove('is-dragging');
        }
    });

    if (stage) {
        // Mouse Wheel Zoom
        stage.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomFactor = e.deltaY < 0 ? 1.25 : 0.8;
            const newZoom = Math.min(Math.max(viewerState.zoom * zoomFactor, viewerState.minZoom), viewerState.maxZoom);

            if (newZoom === 1) {
                viewerState.panX = 0;
                viewerState.panY = 0;
            }
            viewerState.zoom = newZoom;
            applyTransform();
        }, { passive: false });

        // Double-click toggle zoom
        stage.addEventListener('dblclick', (e) => {
            e.preventDefault();
            if (viewerState.zoom > 1.1) {
                resetViewer();
            } else {
                viewerState.zoom = 2.5;
                applyTransform();
            }
        });

        // Touch Gestures: Pinch & Pan & Double-Tap
        let lastTapTime = 0;

        stage.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                const currentTime = Date.now();
                const tapLength = currentTime - lastTapTime;
                if (tapLength < 300 && tapLength > 0) {
                    e.preventDefault();
                    if (viewerState.zoom > 1.1) {
                        resetViewer();
                    } else {
                        viewerState.zoom = 2.5;
                        applyTransform();
                    }
                    lastTapTime = 0;
                    return;
                }
                lastTapTime = currentTime;

                if (viewerState.zoom > 1) {
                    viewerState.isDragging = true;
                    viewerState.startX = e.touches[0].clientX - viewerState.panX;
                    viewerState.startY = e.touches[0].clientY - viewerState.panY;
                }
            } else if (e.touches.length === 2) {
                viewerState.isDragging = false;
                viewerState.initialPinchDist = getTouchDist(e.touches);
                viewerState.initialPinchZoom = viewerState.zoom;
            }
        }, { passive: false });

        stage.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1 && viewerState.isDragging && viewerState.zoom > 1) {
                e.preventDefault();
                viewerState.panX = e.touches[0].clientX - viewerState.startX;
                viewerState.panY = e.touches[0].clientY - viewerState.startY;
                applyTransform();
            } else if (e.touches.length === 2 && viewerState.initialPinchDist) {
                e.preventDefault();
                const currentDist = getTouchDist(e.touches);
                const scaleFactor = currentDist / viewerState.initialPinchDist;
                const newZoom = Math.min(Math.max(viewerState.initialPinchZoom * scaleFactor, viewerState.minZoom), viewerState.maxZoom);
                if (newZoom === 1) {
                    viewerState.panX = 0;
                    viewerState.panY = 0;
                }
                viewerState.zoom = newZoom;
                applyTransform();
            }
        }, { passive: false });

        stage.addEventListener('touchend', (e) => {
            if (e.touches.length < 2) {
                viewerState.initialPinchDist = null;
            }
            if (e.touches.length === 0) {
                viewerState.isDragging = false;
            }
        });
    }

    // Keyboard controls (Escape to close)
    window.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('active')) return;
        if (e.key === 'Escape') closeProductModal();
    });
}

function getTouchDist(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function applyTransform() {
    const mainImg = document.getElementById('lightbox-main-img');
    if (!mainImg) return;

    if (viewerState.zoom <= 1) {
        viewerState.panX = 0;
        viewerState.panY = 0;
    }

    mainImg.style.transform = `translate(${viewerState.panX}px, ${viewerState.panY}px) scale(${viewerState.zoom})`;
}

function resetViewer() {
    viewerState.zoom = 1;
    viewerState.panX = 0;
    viewerState.panY = 0;
    viewerState.isDragging = false;
    applyTransform();
}

/**
 * Opens full-screen view for a product image (coverImage only)
 */
function openProductModal(product) {
    if (!product) return;
    currentActiveProduct = product;

    const modal = document.getElementById('product-lightbox');
    const mainImg = document.getElementById('lightbox-main-img');
    if (!modal || !mainImg) return;

    mainImg.src = product.coverImage || 'assets/images/logo.jpg';

    resetViewer();

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    const modal = document.getElementById('product-lightbox');
    if (!modal) return;

    modal.classList.remove('active');
    document.body.style.overflow = '';
    currentActiveProduct = null;
    resetViewer();
}

// Global Export
if (typeof window !== 'undefined') {
    window.openProductModal = openProductModal;
    window.closeProductModal = closeProductModal;
}
