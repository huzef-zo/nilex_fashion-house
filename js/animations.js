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

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // Particle pool
    const particleCount = Math.min(Math.floor(width / 35), 45);
    const particles = [];

    const colors = [
        'rgba(56, 189, 248, 0.25)',  // Cyan wave
        'rgba(212, 175, 55, 0.2)',   // Gold shimmer
        'rgba(14, 116, 144, 0.2)',  // Deep Nile teal
        'rgba(248, 246, 240, 0.15)'  // Alabaster foam
    ];

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2.5 + 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedX: Math.random() * 0.4 + 0.15,
            speedY: Math.sin(Math.random() * Math.PI * 2) * 0.25,
            angle: Math.random() * Math.PI * 2,
            waveFrequency: 0.002 + Math.random() * 0.003,
            waveAmplitude: 15 + Math.random() * 25
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Draw gentle flowing river waves
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
        ctx.lineWidth = 1.5;
        const time = Date.now() * 0.001;

        for (let y = 100; y < height; y += 180) {
            ctx.beginPath();
            for (let x = 0; x < width; x += 20) {
                const waveY = y + Math.sin(x * 0.004 + time + y) * 20;
                if (x === 0) ctx.moveTo(x, waveY);
                else ctx.lineTo(x, waveY);
            }
            ctx.stroke();
        }

        // Draw & update particles
        particles.forEach((p) => {
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
        });

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
