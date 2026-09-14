// 1. Initialize Lenis (Smooth Scroll) - Optimized Integration
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
});
// Connect Lenis to GSAP Ticker for perfect sync (Fixes Jitter/Lag)
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
// Disable GSAP lag smoothing to prevent conflicts with Lenis
gsap.ticker.lagSmoothing(0);
// Sync GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger, TextPlugin);

// 2. Custom Cursor Logic (Magnetic)
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');
let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;
window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    // Dot follows instantly
    gsap.to(cursorDot, { x: mouseX, y: mouseY, duration: 0 });
});
// Smooth outline follow loop
function animateCursor() {
    let dt = 0.2; // ease factor
    cursorX += (mouseX - cursorX) * dt;
    cursorY += (mouseY - cursorY) * dt;
    cursorOutline.style.left = cursorX + "px";
    cursorOutline.style.top = cursorY + "px";
    requestAnimationFrame(animateCursor);
}
animateCursor();
// Magnetic Buttons
const magneticBtns = document.querySelectorAll('.magnetic-btn');
magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.3 });
        gsap.to(cursorOutline, { scale: 1.5, opacity: 0.5, duration: 0.3 });
    });
    btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.3 });
        gsap.to(cursorOutline, { scale: 1, opacity: 1, duration: 0.3 });
    });
});

// 3. Loader Sequence & Initialization
window.addEventListener("load", () => {
    // Make body visible (CSS hid it to prevent FOUC)
    gsap.set("body", { autoAlpha: 1 });
    // Explicitly set initial states for hero elements to avoid CSS conflicts
    gsap.set(".hero-reveal", { y: 100, autoAlpha: 0 });
    gsap.set(".hero-img-container", { scale: 0.9, autoAlpha: 0 });
    gsap.set("#navbar", { autoAlpha: 0 });

    // Split the preloader name into individual letters for a staggered reveal.
    // (Vanilla split — no SplitText plugin required.)
    const loaderNameEl = document.getElementById('loader-name');
    let nameLetters = [];
    if (loaderNameEl) {
        const fullName = loaderNameEl.textContent;
        loaderNameEl.setAttribute('aria-label', fullName);
        const frag = document.createDocumentFragment();
        [...fullName].forEach((ch) => {
            const span = document.createElement('span');
            span.className = 'loader-letter';
            span.setAttribute('aria-hidden', 'true');
            span.textContent = ch === ' ' ? '\u00A0' : ch;
            frag.appendChild(span);
        });
        loaderNameEl.textContent = '';
        loaderNameEl.appendChild(frag);
        nameLetters = loaderNameEl.querySelectorAll('.loader-letter');
        gsap.set(nameLetters, { yPercent: 130, opacity: 0, rotate: 6 });
    }

    // Cycle a short role/stack line beneath the name while everything loads
    const loaderRoleEl = document.getElementById('loader-role');
    const loaderRoles = ["Frontend Engineer", "Software Engineer", "React · GSAP · Node", "Building With Purpose"];
    let roleIndex = 0;
    let roleInterval = null;
    if (loaderRoleEl) {
        roleInterval = setInterval(() => {
            roleIndex = (roleIndex + 1) % loaderRoles.length;
            gsap.to(loaderRoleEl, {
                yPercent: -110, opacity: 0, duration: 0.28, ease: "power2.in",
                onComplete: () => {
                    loaderRoleEl.textContent = loaderRoles[roleIndex];
                    gsap.fromTo(loaderRoleEl,
                        { yPercent: 110, opacity: 0 },
                        { yPercent: 0, opacity: 1, duration: 0.32, ease: "power3.out" }
                    );
                }
            });
        }, 550);
    }

    const tl = gsap.timeline({
        onComplete: () => {
            if (roleInterval) clearInterval(roleInterval);
            // Safety: Ensure loader is gone from DOM flow
            gsap.set("#loader", { display: "none" });
            gsap.set("#loader-curtain", { display: "none" });
            // Refresh ScrollTrigger to ensure pinned sections are correct after load
            ScrollTrigger.refresh();
        }
    });
    // Name letters stagger in first
    if (nameLetters.length) {
        tl.to(nameLetters, {
            yPercent: 0, opacity: 1, rotate: 0,
            duration: 0.8, ease: "power4.out", stagger: 0.03
        });
    }
    // Counter + progress bar
    let count = { val: 0 };
    tl.to(count, {
        val: 100,
        duration: 2,
        ease: "power2.inOut",
        onUpdate: () => {
            const el = document.getElementById('loader-percent');
            if(el) el.innerText = Math.floor(count.val) + "%";
            const fill = document.getElementById('loader-progress-fill');
            if (fill) fill.style.width = count.val + "%";
        }
    }, nameLetters.length ? "-=0.35" : 0)
    // Curtain Up
    .to('#loader', { yPercent: -100, duration: 0.8, ease: "power4.inOut" })
    .to('#loader-curtain', { yPercent: -100, duration: 0.8, ease: "power4.inOut" }, "-=0.6")
    // Hero Entry
    .to('#navbar', { autoAlpha: 1, duration: 0.5 })
    .to('.hero-reveal', {
        y: 0,
        autoAlpha: 1,
        scale: 1,
        stagger: 0.1,
        duration: 1,
        ease: "power3.out"
    }, "-=0.5")
     .to('.hero-img-container', {
        autoAlpha: 1,
        scale: 1,
        duration: 1.2,
        ease: "power3.out"
    }, "-=1.0")
    // Typewriter start
    .add(() => {
        gsap.to('#typewriter', {
            text: "Frontend Engineer | Software Engineer",
            duration: 3,
            ease: "none"
        });
    }, "-=0.5");
});
// Backup timeout in case window.load fails (e.g., slow image)
setTimeout(() => {
    if (document.querySelector('.loader-overlay').style.display !== 'none') {
        gsap.set("body", { autoAlpha: 1 });
        gsap.to('#loader', { yPercent: -100, duration: 0.5 });
        gsap.set(".hero-reveal", { y: 0, autoAlpha: 1 });
        gsap.set("#navbar", { autoAlpha: 1 });
    }
}, 5000);

// 4. Parallax Elements
gsap.utils.toArray('.parallax-element').forEach(el => {
    const speed = el.getAttribute('data-speed');
    gsap.to(el, {
        y: (i, target) => ScrollTrigger.maxScroll(window) * speed,
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 0
        }
    });
});

// 5. Marquee Animation
gsap.to(".marquee-track", {
    xPercent: -50,
    ease: "none",
    duration: 20,
    repeat: -1
});

// 5b. Interactive Hero Grid — a cursor-reactive dot field behind the hero
// copy. Dots get pushed away from the pointer and spring back on their own.
// Skipped entirely for prefers-reduced-motion; density drops on touch
// devices where there's no hover to react to anyway.
function initHeroGrid() {
    const canvas = document.getElementById('hero-grid');
    const heroSection = canvas ? canvas.closest('section') : null;
    if (!canvas || !heroSection) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    const spacing = isCoarse ? 48 : 34;
    const radius = isCoarse ? 70 : 140;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0, height = 0, dots = [];
    const pointer = { x: -9999, y: -9999 };
    let rafId = null;

    function resize() {
        const rect = heroSection.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        dots = [];
        for (let y = spacing / 2; y < height; y += spacing) {
            for (let x = spacing / 2; x < width; x += spacing) {
                dots.push({ x, y, ox: x, oy: y, vx: 0, vy: 0 });
            }
        }
    }

    function onPointerMove(e) {
        const rect = heroSection.getBoundingClientRect();
        pointer.x = e.clientX - rect.left;
        pointer.y = e.clientY - rect.top;
    }
    function onPointerLeave() {
        pointer.x = -9999;
        pointer.y = -9999;
    }

    function tick() {
        ctx.clearRect(0, 0, width, height);
        for (const d of dots) {
            const dx = d.x - pointer.x;
            const dy = d.y - pointer.y;
            const dist = Math.hypot(dx, dy);
            let targetX = d.ox;
            let targetY = d.oy;
            if (dist < radius) {
                const force = 1 - dist / radius;
                const safeDist = dist || 1;
                targetX = d.ox + (dx / safeDist) * force * 24;
                targetY = d.oy + (dy / safeDist) * force * 24;
            }
            d.vx += (targetX - d.x) * 0.12;
            d.vy += (targetY - d.y) * 0.12;
            d.vx *= 0.82;
            d.vy *= 0.82;
            d.x += d.vx;
            d.y += d.vy;

            const displaced = Math.hypot(d.x - d.ox, d.y - d.oy);
            ctx.beginPath();
            ctx.arc(d.x, d.y, 1.3 + Math.min(1.4, displaced * 0.05), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(13, 110, 104, ${0.3 + Math.min(0.4, displaced * 0.012)})`;
            ctx.fill();
        }
        rafId = requestAnimationFrame(tick);
    }

    resize();
    window.addEventListener('resize', resize);
    heroSection.addEventListener('mousemove', onPointerMove);
    heroSection.addEventListener('mouseleave', onPointerLeave);

    // Only animate while the hero is actually in view — no wasted cycles
    // once the visitor has scrolled past it.
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                if (!rafId) tick();
            } else if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
                ctx.clearRect(0, 0, width, height);
            }
        });
    }, { threshold: 0.05 });
    observer.observe(heroSection);
}
initHeroGrid();

// 6. Functional Location Map (Leaflet)
// NOTE: coordinates are set to Lagos, Nigeria. Swap LOCATION.lat/lng (and the
// popup copy below) for your own city if you're based elsewhere.
const LOCATION = { lat: 6.5244, lng: 3.3792, label: "Lagos, Nigeria" };
function initLocationMap() {
    const mount = document.getElementById('leaflet-map');
    if (!mount || typeof L === 'undefined') return;

    const map = L.map(mount, {
        center: [LOCATION.lat, LOCATION.lng],
        zoom: 11,
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: true
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19,
        subdomains: 'abcd'
    }).addTo(map);

    const icon = L.divIcon({
        className: '',
        html: '<div style="position:relative;"><div class="map-pin-pulse"></div><div class="map-pin-marker"></div></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9]
    });

    L.marker([LOCATION.lat, LOCATION.lng], { icon }).addTo(map)
        .bindPopup(`<strong>${LOCATION.label}</strong><br>Available for remote work worldwide`, { className: 'map-popup', closeButton: false })
        .openPopup();

    // Re-render tiles correctly once the reveal animation finishes sizing the box
    setTimeout(() => map.invalidateSize(), 600);
    window.addEventListener('resize', () => map.invalidateSize());
}
initLocationMap();

// Reveal animation for the map shell (bi-directional, matches the rest of the page)
gsap.from("#map-container", {
    scale: 0.92,
    opacity: 0,
    duration: 0.8,
    ease: "back.out(1.4)",
    scrollTrigger: {
        trigger: "#map-container",
        start: "top 75%",
        end: "bottom top",
        toggleActions: "play reverse play reverse"
    }
});

// 7. General Reveal Animations (Bi-directional)
gsap.utils.toArray('[data-gsap="fade"]').forEach(el => {
    gsap.from(el, {
        scrollTrigger: {
            trigger: el,
            start: "top 90%",
            end: "bottom top",
            toggleActions: "play reverse play reverse"
        },
        opacity: 0, y: 20, duration: 0.8
    });
});
gsap.utils.toArray('[data-gsap="slide-up"]').forEach(el => {
    gsap.from(el, {
        scrollTrigger: {
            trigger: el,
            start: "top 85%",
            end: "bottom top",
            toggleActions: "play reverse play reverse"
        },
        y: 100, opacity: 0, duration: 1, ease: "power3.out"
    });
});

// 8. Real Stats (set these to your actual numbers)
const PROJECTS_DONE = 40;
const YEARS_EXPERIENCE = 5;
function setStaticStats() {
    const projEl = document.getElementById('dynamic-projects');
    const expEl = document.getElementById('dynamic-exp');
    if (projEl) projEl.innerText = `${PROJECTS_DONE}+`;
    if (expEl) expEl.innerText = `${YEARS_EXPERIENCE}+`;
}
setStaticStats();

// 9. Live Local Time (set this to your own timezone)
const YOUR_TIMEZONE = 'Africa/Lagos';
function updateLocalClock() {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: YOUR_TIMEZONE,
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        weekday: 'short', hour12: false
    }).formatToParts(now);
    const get = (type) => parts.find(p => p.type === type)?.value ?? '00';
    const els = {
        hours: document.getElementById('clock-hours'),
        minutes: document.getElementById('clock-minutes'),
        seconds: document.getElementById('clock-seconds'),
        day: document.getElementById('clock-day'),
        secBar: document.getElementById('sec-bar'),
        timezone: document.getElementById('clock-timezone')
    };
    if (els.hours) els.hours.innerText = get('hour');
    if (els.minutes) els.minutes.innerText = get('minute');
    if (els.seconds) els.seconds.innerText = get('second');
    if (els.day) els.day.innerText = get('weekday').toUpperCase();
    if (els.secBar) els.secBar.style.width = `${(Number(get('second')) / 60) * 100}%`;
    if (els.timezone) els.timezone.innerText = `TIMEZONE: ${YOUR_TIMEZONE.replace('_', ' ').toUpperCase()}`;
}
setInterval(updateLocalClock, 1000);
updateLocalClock();

// 10. Horizontal Scroll Works — pinned scroll-jack on desktop, plain native
// swipeable snap-scroll on mobile. gsap.matchMedia keeps the two from ever
// running at once, which was the actual cause of the janky mobile feel:
// ScrollTrigger's pin uses an inline style, so it was overriding the CSS
// that tried to turn pinning off below 900px.
const worksWrapper = document.querySelector("#works-wrapper");
const worksProgressFill = document.getElementById('works-progress-fill');
const worksIndexEl = document.getElementById('works-index');
let worksTween = null;
let worksTrigger = null;
const worksMM = gsap.matchMedia();

function visibleWorkItems() {
    return gsap.utils.toArray('.work-item').filter(el => el.dataset.hidden !== "true");
}

function getScrollAmount() {
    const items = visibleWorkItems();
    if (!items.length || !worksWrapper) return 0;
    const last = items[items.length - 1];
    const totalWidth = (last.offsetLeft + last.offsetWidth) - worksWrapper.offsetLeft;
    return -Math.max(0, totalWidth - window.innerWidth);
}

function updateWorksReadout(progress) {
    const total = visibleWorkItems().length;
    if (worksProgressFill) worksProgressFill.style.width = `${progress * 100}%`;
    if (worksIndexEl && total) {
        const current = Math.min(total, Math.floor(progress * total) + 1);
        worksIndexEl.innerText = `${String(current).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    }
}

if (worksWrapper) {
    // Desktop / trackpad — pinned, scrubbed horizontal reel
    worksMM.add("(min-width: 900px)", () => {
        gsap.set(worksWrapper, { x: 0 });
        const total = visibleWorkItems().length;
        if (worksIndexEl) worksIndexEl.innerText = total ? `01 / ${String(total).padStart(2, '0')}` : "00 / 00";
        if (worksProgressFill) worksProgressFill.style.width = "0%";
        if (!total) return;

        worksTween = gsap.to(worksWrapper, { x: getScrollAmount, ease: "none" });
        worksTrigger = ScrollTrigger.create({
            trigger: "#works-container",
            start: "top top",
            end: () => "+=" + Math.max(1, -getScrollAmount()),
            pin: true,
            animation: worksTween,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => updateWorksReadout(self.progress)
        });

        // matchMedia calls this automatically when leaving the breakpoint
        return () => {
            if (worksTrigger) worksTrigger.kill();
            if (worksTween) worksTween.kill();
            gsap.set(worksWrapper, { clearProps: "transform" });
        };
    });

    // Mobile / touch — no pinning at all; CSS handles the native scroll-snap
    // row. We just keep the progress bar and index readout synced to it.
    worksMM.add("(max-width: 899px)", () => {
        const total = visibleWorkItems().length;
        if (worksIndexEl) worksIndexEl.innerText = total ? `01 / ${String(total).padStart(2, '0')}` : "00 / 00";

        const onScroll = () => {
            const max = worksWrapper.scrollWidth - worksWrapper.clientWidth;
            updateWorksReadout(max > 0 ? worksWrapper.scrollLeft / max : 0);
        };
        worksWrapper.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        return () => {
            worksWrapper.removeEventListener('scroll', onScroll);
        };
    });
}

// Soft tilt-on-hover for work cards (desktop only, mirrors the magnetic button feel)
if (window.matchMedia('(hover: hover)').matches) {
    gsap.utils.toArray('.work-item').forEach(item => {
        const inner = item.querySelector('.work-card-light, .work-card-dark');
        if (!inner) return;
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width - 0.5;
            const py = (e.clientY - rect.top) / rect.height - 0.5;
            gsap.to(inner, { rotateX: py * -6, rotateY: px * 6, duration: 0.4, ease: "power2.out", transformPerspective: 800 });
        });
        item.addEventListener('mouseleave', () => {
            gsap.to(inner, { rotateX: 0, rotateY: 0, duration: 0.6, ease: "power3.out" });
        });
    });
}

// 11. Timeline Line Drawing
gsap.to("#scroll-line", {
    height: "100%",
    ease: "none",
    scrollTrigger: {
        trigger: ".timeline-line",
        start: "top center",
        end: "bottom center",
        scrub: 0.5
    }
});
// Force refresh triggers after window load to ensure accurate measurements
window.addEventListener("load", () => {
    ScrollTrigger.refresh();
});
// Service Items Stagger (Bi-directional)
gsap.utils.toArray('[data-gsap="service-item"]').forEach((item, i) => {
    gsap.from(item, {
        scrollTrigger: {
            trigger: item,
            start: "top 90%",
            end: "bottom top",
            toggleActions: "play reverse play reverse"
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        delay: i * 0.1
    });
});

// 12. Scroll-Triggered "Decode" Headings — every [data-scramble] element
// (the markup already had this attribute on several headings with nothing
// wired up behind it) runs through randomized characters once, the first
// time it enters the viewport, then locks into the real text.
function initScrambleHeadings() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%+=-";
    gsap.utils.toArray('[data-scramble]').forEach((el) => {
        const original = el.textContent;
        const len = original.length;
        ScrollTrigger.create({
            trigger: el,
            start: "top 85%",
            once: true,
            onEnter: () => {
                const driver = { p: 0 };
                gsap.to(driver, {
                    p: 1,
                    duration: 0.7,
                    ease: "none",
                    onUpdate: () => {
                        const revealCount = Math.floor(driver.p * len);
                        let out = "";
                        for (let i = 0; i < len; i++) {
                            const ch = original[i];
                            out += (ch === " " || i < revealCount) ? ch : CHARS[(Math.random() * CHARS.length) | 0];
                        }
                        el.textContent = out;
                    },
                    onComplete: () => { el.textContent = original; }
                });
            }
        });
    });
}
initScrambleHeadings();

// 13. Testimonials — one shared trigger staggering all three cards together
// instead of each card watching its own independent trigger.
const testimonialCards = gsap.utils.toArray('.testimonial-card');
if (testimonialCards.length) {
    gsap.from(testimonialCards, {
        scrollTrigger: {
            trigger: '#testimonials',
            start: "top 80%",
            end: "bottom top",
            toggleActions: "play reverse play reverse"
        },
        y: 60,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.15
    });
}