/**
 * =========================================================================
 * NILEX FASHIONHOUSE - ANIMATIONS & FLUID MOTION ENGINE
 * Slogan: "Flow like the nile"
 * =========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    initRiverCanvas();
    initScrollReveals();
    initHeaderScroll();
    initScrollTopButton();
});

/**
 * Nile River Flowing Water Particles Canvas
 */
function initRiverCanvas() {
    const canvas = document.getElementById('river-canvas');
    if (!canvas) return;

    // Respect reduced-motion setting
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const backParticles = [];
    const frontParticles = [];

    const backColors = [
        'rgba(56, 189, 248, 0.14)',  // Cyan wave back
        'rgba(212, 175, 55, 0.12)',   // Gold shimmer back
        'rgba(14, 116, 144, 0.14)',  // Deep Nile teal back
        'rgba(248, 246, 240, 0.10)'   // Alabaster foam back
    ];

    const frontColors = [
        'rgba(56, 189, 248, 0.32)',  // Cyan wave front
        'rgba(212, 175, 55, 0.28)',   // Gold shimmer front
        'rgba(14, 116, 144, 0.28)',  // Deep Nile teal front
        'rgba(248, 246, 240, 0.20)'   // Alabaster foam front
    ];

    function setupParticles() {
        backParticles.length = 0;
        frontParticles.length = 0;

        const totalParticleCount = Math.min(Math.floor(width / 24), 80);
        const backCount = Math.floor(totalParticleCount * 0.45);
        const frontCount = totalParticleCount - backCount;

        // Back layer: smaller radius (~0.5-1.5px), slower speed, lower opacity
        for (let i = 0; i < backCount; i++) {
            backParticles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.0 + 0.5,
                color: backColors[Math.floor(Math.random() * backColors.length)],
                speedX: Math.random() * 0.2 + 0.08,
                speedY: Math.sin(Math.random() * Math.PI * 2) * 0.15,
                angle: Math.random() * Math.PI * 2,
                waveFrequency: 0.0015 + Math.random() * 0.002
            });
        }

        // Front layer: larger radius (~1.0-3.5px), faster speed, higher opacity
        for (let i = 0; i < frontCount; i++) {
            frontParticles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2.5 + 1.0,
                color: frontColors[Math.floor(Math.random() * frontColors.length)],
                speedX: Math.random() * 0.45 + 0.2,
                speedY: Math.sin(Math.random() * Math.PI * 2) * 0.3,
                angle: Math.random() * Math.PI * 2,
                waveFrequency: 0.002 + Math.random() * 0.003
            });
        }
    }

    setupParticles();

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        setupParticles();
    });

    const waveBands = [
        {
            color: 'rgba(56, 189, 248, 0.08)', // Cyan band
            lineWidth: 1.5,
            yStart: 90,
            yStep: 160,
            freq: 0.0035,
            amp: 22,
            speed: 0.9
        },
        {
            color: 'rgba(212, 175, 55, 0.07)', // Gold band
            lineWidth: 1.5,
            yStart: 140,
            yStep: 170,
            freq: 0.0028,
            amp: 18,
            speed: 0.75
        },
        {
            color: 'rgba(56, 189, 248, 0.06)', // Sub-cyan band
            lineWidth: 1.2,
            yStart: 190,
            yStep: 180,
            freq: 0.0045,
            amp: 25,
            speed: 1.1
        }
    ];

    function drawAndAnimateParticles(layer) {
        for (let i = 0; i < layer.length; i++) {
            const p = layer[i];
            p.angle += p.waveFrequency;
            p.x += p.speedX;
            p.y += Math.sin(p.angle) * 0.4 + p.speedY;

            // Wrap around edges
            if (p.x > width + 20) p.x = -20;
            if (p.y > height + 20) p.y = -20;
            if (p.y < -20) p.y = height + 20;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        const time = Date.now() * 0.001;

        // 1. Draw back layer particles (distant/background parallax)
        drawAndAnimateParticles(backParticles);

        // 2. Draw 2-3 layered wave bands with alternating brand colors
        for (let b = 0; b < waveBands.length; b++) {
            const band = waveBands[b];
            ctx.strokeStyle = band.color;
            ctx.lineWidth = band.lineWidth;

            for (let y = band.yStart; y < height; y += band.yStep) {
                ctx.beginPath();
                for (let x = 0; x < width; x += 25) {
                    const waveY = y + Math.sin(x * band.freq + time * band.speed + y) * band.amp;
                    if (x === 0) ctx.moveTo(x, waveY);
                    else ctx.lineTo(x, waveY);
                }
                ctx.stroke();
            }
        }

        // 3. Draw front layer particles (closer/foreground motion)
        drawAndAnimateParticles(frontParticles);

        // 4. Occasional slow light-sweep for subtle sparkle
        const sweepCycle = 15; // 15-second loop
        const cycleTime = time % sweepCycle;
        const sweepDuration = 4.5; // active sweep duration in seconds

        if (cycleTime < sweepDuration) {
            const progress = cycleTime / sweepDuration;
            const sweepOpacity = Math.sin(progress * Math.PI) * 0.07; // peak opacity ~0.07
            const sweepX = -0.3 * width + progress * 1.6 * width;
            const sweepY = height * 0.35 + Math.sin(progress * Math.PI) * (height * 0.15);
            const sweepRadius = Math.max(width, height) * 0.55;

            const sweepGrad = ctx.createRadialGradient(sweepX, sweepY, 0, sweepX, sweepY, sweepRadius);
            sweepGrad.addColorStop(0, `rgba(245, 231, 178, ${sweepOpacity})`);
            sweepGrad.addColorStop(0.4, `rgba(56, 189, 248, ${sweepOpacity * 0.5})`);
            sweepGrad.addColorStop(1, 'rgba(4, 10, 18, 0)');

            ctx.fillStyle = sweepGrad;
            ctx.fillRect(0, 0, width, height);
        }

        requestAnimationFrame(animate);
    }

    animate();
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

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optional: unobserve once revealed
                // observer.unobserve(entry.target);
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
