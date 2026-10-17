/**
 * =========================================================================
 * NILEX FASHIONHOUSE - LAYERED MOVING WAVES & RIPPLES ENGINE (CANVAS 2D)
 * Slogan: "Flow like the nile"
 * =========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    initRiverCanvas();
    initScrollReveals();
    initHeaderScroll();
    initScrollTopButton();
});

let isRiverCanvasRunning = false;

/**
 * Nile River Layered Moving Waves, Soft Glints & Ripples Canvas (2D)
 */
function initRiverCanvas() {
    if (isRiverCanvasRunning) return;

    const canvas = document.getElementById('river-canvas');
    if (!canvas) return;

    isRiverCanvasRunning = true;
    canvas.style.display = 'block';

    const ctx = canvas.getContext('2d');

    // Performance detection
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 768);
    const targetFPS = isTouchDevice ? 30 : 60;
    const frameInterval = 1000 / targetFPS;
    const maxDPR = isTouchDevice ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5);
    const sampleStep = 8; // Sample wave path every 8px horizontally

    /**
     * Reduced Motion Handling:
     * If prefers-reduced-motion is enabled, we do not freeze motion completely so that
     * the Nile River atmospheric background remains active. Instead, motion runs at
     * 25% speed with reduced wave amplitudes, and pointer-interaction ripples are disabled.
     */
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const speedScale = prefersReducedMotion ? 0.25 : 1.0;
    const ampScale = prefersReducedMotion ? 0.40 : 1.0;

    let cssWidth = window.innerWidth;
    let cssHeight = window.innerHeight;

    function resizeCanvasBuffer(force = false) {
        const w = window.innerWidth;
        const h = window.innerHeight;

        // Ignore small height changes on mobile caused by address bar toggled showing/hiding
        if (!force && cssWidth === w && Math.abs(cssHeight - h) <= 80) {
            return;
        }

        cssWidth = w;
        cssHeight = h;

        canvas.width = Math.floor(w * maxDPR);
        canvas.height = Math.floor(h * maxDPR);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(maxDPR, maxDPR);
    }

    resizeCanvasBuffer(true);

    window.addEventListener('resize', () => {
        resizeCanvasBuffer(false);
    });

    // 5 Stacked Wave Bands down screen (~15%, 32%, 50%, 68%, 85%)
    const waveBands = [
        {
            heightRatio: 0.15,
            dir: 1,
            colorType: 'cyan',
            sines: [
                { freq: 0.0022, amp: 20, speed: 1.2 },
                { freq: 0.0048, amp: 10, speed: 1.8 },
                { freq: 0.0012, amp: 8,  speed: 0.7 }
            ]
        },
        {
            heightRatio: 0.32,
            dir: -1,
            colorType: 'cyan',
            sines: [
                { freq: 0.0018, amp: 26, speed: 1.0 },
                { freq: 0.0038, amp: 12, speed: 1.5 },
                { freq: 0.0010, amp: 9,  speed: 0.6 }
            ]
        },
        {
            heightRatio: 0.50,
            dir: 1,
            colorType: 'gold',
            sines: [
                { freq: 0.0015, amp: 28, speed: 0.9 },
                { freq: 0.0032, amp: 14, speed: 1.3 },
                { freq: 0.0008, amp: 11, speed: 0.5 }
            ]
        },
        {
            heightRatio: 0.68,
            dir: -1,
            colorType: 'cyan',
            sines: [
                { freq: 0.0020, amp: 24, speed: 1.1 },
                { freq: 0.0042, amp: 11, speed: 1.6 },
                { freq: 0.0014, amp: 8,  speed: 0.65 }
            ]
        },
        {
            heightRatio: 0.85,
            dir: 1,
            colorType: 'cyan',
            sines: [
                { freq: 0.0016, amp: 30, speed: 0.85 },
                { freq: 0.0035, amp: 15, speed: 1.4 },
                { freq: 0.0009, amp: 10, speed: 0.55 }
            ]
        }
    ];

    // Soft glints drifting along wave crests (10 glints)
    const glints = [];
    for (let i = 0; i < 10; i++) {
        glints.push({
            bandIndex: i % waveBands.length,
            xRatio: Math.random(),
            speed: (0.02 + Math.random() * 0.03) * (i % 2 === 0 ? 1 : -1),
            sizeX: 14 + Math.random() * 12,
            sizeY: 3.5 + Math.random() * 2.5,
            fadePhase: Math.random() * Math.PI * 2,
            fadeSpeed: 0.9 + Math.random() * 0.8
        });
    }

    // Ripple Object Pool (Max 12 active)
    const maxRipples = 12;
    const ripplePool = Array.from({ length: maxRipples }, () => ({
        active: false,
        x: 0,
        y: 0,
        startTime: 0,
        duration: 1.6
    }));

    function spawnRipple(x, y, timeSec) {
        let ripple = ripplePool.find(r => !r.active);
        if (!ripple) {
            // Re-use oldest active ripple if pool is exhausted
            let oldestTime = Infinity;
            ripplePool.forEach(r => {
                if (r.startTime < oldestTime) {
                    oldestTime = r.startTime;
                    ripple = r;
                }
            });
        }
        if (ripple) {
            ripple.active = true;
            ripple.x = x;
            ripple.y = y;
            ripple.startTime = timeSec;
        }
    }

    // Interactive pointer event listeners on window
    let lastMoveTime = 0;

    window.addEventListener('pointerdown', (e) => {
        if (prefersReducedMotion) return;
        const nowSec = performance.now() * 0.001;
        spawnRipple(e.clientX, e.clientY, nowSec);
    }, { passive: true });

    window.addEventListener('pointermove', (e) => {
        if (prefersReducedMotion) return;
        const nowMs = performance.now();
        if (nowMs - lastMoveTime >= 120) {
            lastMoveTime = nowMs;
            spawnRipple(e.clientX, e.clientY, nowMs * 0.001);
        }
    }, { passive: true });

    // State variables for animation loop
    let isPaused = false;
    let lastFrameTime = performance.now();
    let nextAutoRippleTime = (performance.now() * 0.001) + 1.0;

    function handleVisibilityChange() {
        if (document.hidden) {
            isPaused = true;
        } else {
            isPaused = false;
            lastFrameTime = performance.now();
            requestAnimationFrame(renderLoop);
        }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    function evaluateWaveY(band, x, timeSec, baseY) {
        let sum = 0;
        for (let s = 0; s < band.sines.length; s++) {
            const sine = band.sines[s];
            sum += Math.sin(x * sine.freq + timeSec * sine.speed * band.dir * speedScale + s) * sine.amp * ampScale;
        }
        return baseY + sum;
    }

    function renderLoop(nowMs) {
        if (isPaused) return;

        // FPS Throttling
        const elapsedMs = nowMs - lastFrameTime;
        if (elapsedMs < frameInterval) {
            requestAnimationFrame(renderLoop);
            return;
        }
        lastFrameTime = nowMs - (elapsedMs % frameInterval);

        const timeSec = nowMs * 0.001;
        const width = cssWidth;
        const height = cssHeight;

        ctx.clearRect(0, 0, width, height);

        // Precompute wave paths for each band
        const bandPaths = [];
        const numSamples = Math.ceil(width / sampleStep) + 1;

        for (let b = 0; b < waveBands.length; b++) {
            const band = waveBands[b];
            const baseY = height * band.heightRatio;
            const points = new Array(numSamples);

            for (let i = 0; i < numSamples; i++) {
                const x = i * sampleStep;
                points[i] = { x, y: evaluateWaveY(band, x, timeSec, baseY) };
            }
            bandPaths.push(points);
        }

        // 1. Draw Wave Band Fills and Crest Lines
        for (let b = 0; b < waveBands.length; b++) {
            const band = waveBands[b];
            const currentPoints = bandPaths[b];
            const isLast = (b === waveBands.length - 1);
            const nextPoints = isLast ? null : bandPaths[b + 1];

            // Build filled band path
            ctx.beginPath();
            ctx.moveTo(currentPoints[0].x, currentPoints[0].y);

            for (let i = 1; i < currentPoints.length; i++) {
                ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
            }

            if (nextPoints) {
                for (let i = nextPoints.length - 1; i >= 0; i--) {
                    ctx.lineTo(nextPoints[i].x, nextPoints[i].y);
                }
            } else {
                ctx.lineTo(width, height);
                ctx.lineTo(0, height);
            }
            ctx.closePath();

            // Band gradient fill
            const topY = currentPoints[0].y;
            const bottomY = nextPoints ? nextPoints[0].y : height;
            const grad = ctx.createLinearGradient(0, topY, 0, Math.max(bottomY, topY + 10));

            if (band.colorType === 'gold') {
                grad.addColorStop(0, 'rgba(212, 175, 55, 0.10)');
                grad.addColorStop(1, 'rgba(212, 175, 55, 0.00)');
            } else {
                grad.addColorStop(0, 'rgba(56, 189, 248, 0.10)');
                grad.addColorStop(1, 'rgba(56, 189, 248, 0.00)');
            }

            ctx.fillStyle = grad;
            ctx.fill();

            // Crest Line with sliding shimmer gradient
            ctx.beginPath();
            ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
            for (let i = 1; i < currentPoints.length; i++) {
                ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
            }

            const shimmerGrad = ctx.createLinearGradient(0, 0, width, 0);
            const shift = (timeSec * 0.12 * band.dir * speedScale) % 1.0;
            const pos1 = (shift + 1.0) % 1.0;
            const pos2 = (shift + 0.5) % 1.0;

            if (band.colorType === 'gold') {
                shimmerGrad.addColorStop(0, 'rgba(212, 175, 55, 0.25)');
                shimmerGrad.addColorStop(pos1, 'rgba(245, 231, 178, 0.65)');
                shimmerGrad.addColorStop(pos2, 'rgba(212, 175, 55, 0.35)');
                shimmerGrad.addColorStop(1, 'rgba(212, 175, 55, 0.25)');
            } else {
                shimmerGrad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
                shimmerGrad.addColorStop(pos1, 'rgba(255, 255, 255, 0.70)');
                shimmerGrad.addColorStop(pos2, 'rgba(56, 189, 248, 0.40)');
                shimmerGrad.addColorStop(1, 'rgba(56, 189, 248, 0.25)');
            }

            ctx.strokeStyle = shimmerGrad;
            ctx.lineWidth = 1.8;
            ctx.stroke();
        }

        // 2. Draw Soft Glints drifting along wave crests
        for (let g = 0; g < glints.length; g++) {
            const glint = glints[g];
            glint.xRatio += glint.speed * 0.016 * speedScale;
            if (glint.xRatio > 1.0) glint.xRatio -= 1.0;
            if (glint.xRatio < 0.0) glint.xRatio += 1.0;

            const glintX = glint.xRatio * width;
            const points = bandPaths[glint.bandIndex];
            const sampleIdx = Math.min(Math.floor(glintX / sampleStep), points.length - 1);
            const glintY = points[sampleIdx] ? points[sampleIdx].y : height * waveBands[glint.bandIndex].heightRatio;

            const fade = Math.sin(timeSec * glint.fadeSpeed * speedScale + glint.fadePhase);
            const alpha = Math.max(0, fade) * 0.35;

            if (alpha > 0.01) {
                ctx.save();
                ctx.beginPath();
                ctx.ellipse(glintX, glintY, glint.sizeX, glint.sizeY, 0, 0, Math.PI * 2);

                const gGrad = ctx.createRadialGradient(glintX, glintY, 0, glintX, glintY, glint.sizeX);
                gGrad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
                gGrad.addColorStop(0.5, `rgba(56, 189, 248, ${alpha * 0.5})`);
                gGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

                ctx.fillStyle = gGrad;
                ctx.fill();
                ctx.restore();
            }
        }

        // 3. Automatic ambient ripple spawn (every 2-3s)
        if (timeSec >= nextAutoRippleTime) {
            spawnRipple(Math.random() * width, Math.random() * height, timeSec);
            nextAutoRippleTime = timeSec + 2.0 + Math.random() * 1.0;
        }

        // 4. Draw Active Expanding Ripples
        for (let r = 0; r < ripplePool.length; r++) {
            const ripple = ripplePool[r];
            if (!ripple.active) continue;

            const ageSec = timeSec - ripple.startTime;
            if (ageSec >= ripple.duration) {
                ripple.active = false;
                continue;
            }

            const progress = ageSec / ripple.duration; // 0 to 1
            const currentRadius = progress * 180;
            const fade = 1.0 - progress;

            const rx = currentRadius;
            const ry = currentRadius * 0.45; // 45% squashed ellipse for perspective

            // Outer Cyan Ring
            ctx.beginPath();
            ctx.ellipse(ripple.x, ripple.y, rx, ry, 0, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.45 * fade})`;
            ctx.lineWidth = 1.8 * fade;
            ctx.stroke();

            // Inner Faint Gold Ring
            if (progress > 0.08) {
                ctx.beginPath();
                ctx.ellipse(ripple.x, ripple.y, rx * 0.68, ry * 0.68, 0, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(212, 175, 55, ${0.28 * fade})`;
                ctx.lineWidth = 1.2 * fade;
                ctx.stroke();
            }
        }

        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);
}

/**
 * IntersectionObserver for Staggered Scroll Reveals
 */
function initScrollReveals() {
    const reveals = document.querySelectorAll('.reveal-on-scroll');
    if (!reveals.length) return;

    const observerOptions = {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, observerOptions);

    reveals.forEach((el) => revealObserver.observe(el));
}

/**
 * Sticky Navbar Header Scroll Styling
 */
function initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, { passive: true });
}

/**
 * Scroll to Top Floating Button
 */
function initScrollTopButton() {
    const scrollBtn = document.querySelector('.floating-scroll-top');
    if (!scrollBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    }, { passive: true });

    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}
