document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Toggle Logic ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    // Check Local Storage
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        body.classList.add('dark-mode');
        // If button exists, update icon
        if (themeToggleBtn) {
            const themeIcon = themeToggleBtn.querySelector('i');
            if (themeIcon) {
                themeIcon.classList.remove('fa-moon');
                themeIcon.classList.add('fa-sun');
            }
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            const themeIcon = themeToggleBtn.querySelector('i');

            if (body.classList.contains('dark-mode')) {
                if (themeIcon) {
                    themeIcon.classList.remove('fa-moon');
                    themeIcon.classList.add('fa-sun');
                }
                localStorage.setItem('theme', 'dark');
            } else {
                if (themeIcon) {
                    themeIcon.classList.remove('fa-sun');
                    themeIcon.classList.add('fa-moon');
                }
                localStorage.setItem('theme', 'light');
            }
        });
    }
    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Social Sidebar Toggle
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const socialSidebar = document.querySelector('.social-sidebar');

    if (sidebarToggle && socialSidebar) {
        sidebarToggle.addEventListener('click', () => {
            const isExpanded = socialSidebar.classList.toggle('active');
            sidebarToggle.setAttribute('aria-expanded', isExpanded);
        });

        // Swipe Support
        let touchStartX = 0;
        let touchEndX = 0;
        const minSwipeDistance = 50;

        socialSidebar.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        socialSidebar.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        const handleSwipe = () => {
            if (touchEndX > touchStartX + minSwipeDistance) {
                // Swipe Right -> Open
                socialSidebar.classList.add('active');
            } else if (touchStartX > touchEndX + minSwipeDistance) {
                // Swipe Left -> Close
                socialSidebar.classList.remove('active');
            }
        };
    }

    // Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                // Close mobile menu if open
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    const icon = mobileBtn.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }

                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Simple Intersection Observer for Fade-in effects
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.section').forEach(section => {
        section.classList.add('fade-in'); // Add class via JS to ensure it only applies when JS works
        observer.observe(section);
    });



});

// --- Pull-Down Navbar Logic ---
const navbar = document.querySelector('.navbar');
const navbarHandle = document.getElementById('navbar-handle');
const heroSection = document.getElementById('hero'); // Assuming hero has id="hero"
let navbarTimeout;

// 1. Scroll Trigger: Show Handle when past Hero
window.addEventListener('scroll', () => {
    const heroHeight = heroSection ? heroSection.offsetHeight : 500;
    const scrollPos = window.scrollY;

    // Logic:
    // - If at top (in Hero): Navbar is absolute (static). Handle hidden.
    // - If scrolled past Hero: Navbar hides (becomes fixed-hidden). Handle appears.

    if (scrollPos > heroHeight - 100) {
        // Past Hero
        if (!navbar.classList.contains('fixed-active')) {
            navbar.classList.add('fixed-hidden');
            navbarHandle.classList.add('visible');
        }
    } else {
        // In Hero (Top)
        navbar.classList.remove('fixed-hidden', 'fixed-active');
        navbarHandle.classList.remove('visible');
        clearTimeout(navbarTimeout); // Clear timer if we go back to top
    }
});

// 2. Handle Click: Show Navbar
if (navbarHandle) {
    navbarHandle.addEventListener('click', () => {
        navbar.classList.remove('fixed-hidden');
        navbar.classList.add('fixed-active');
        navbarHandle.classList.remove('visible'); // Hide handle when navbar is open
        resetNavbarTimer();
    });
}

// 3. Auto-Retract Timer
function resetNavbarTimer() {
    clearTimeout(navbarTimeout);
    navbarTimeout = setTimeout(() => {
        // Only retract if we are scrolled down (fixed mode)
        if (navbar.classList.contains('fixed-active')) {
            navbar.classList.remove('fixed-active');
            navbar.classList.add('fixed-hidden');
            navbarHandle.classList.add('visible'); // Show handle again
        }
    }, 5000); // 5 seconds
}

// Reset timer on interaction with navbar
if (navbar) {
    navbar.addEventListener('mousemove', resetNavbarTimer);
    navbar.addEventListener('click', resetNavbarTimer);
    navbar.addEventListener('touchstart', resetNavbarTimer);
}

// --- Pharma-Glow Effect Logic (Exact Implementation) ---
const initPharmaGlow = () => {
    const glowElements = document.querySelectorAll('.pharma-glow');

    const centerOfElement = ($el) => {
        const { left, top, width, height } = $el.getBoundingClientRect();
        return [width / 2, height / 2];
    }

    const pointerPositionRelativeToElement = ($el, e) => {
        const pos = [e.clientX, e.clientY];
        const { left, top, width, height } = $el.getBoundingClientRect();
        const x = pos[0] - left;
        const y = pos[1] - top;
        const px = clamp((100 / width) * x, 0, 100);
        const py = clamp((100 / height) * y, 0, 100);
        return { pixels: [x, y], percent: [px, py] }
    }

    const angleFromPointerEvent = ($el, dx, dy) => {
        let angleRadians = 0;
        let angleDegrees = 0;
        if (dx !== 0 || dy !== 0) {
            angleRadians = Math.atan2(dy, dx);
            angleDegrees = angleRadians * (180 / Math.PI) + 90;
            if (angleDegrees < 0) {
                angleDegrees += 360;
            }
        }
        return angleDegrees;
    }

    const distanceFromCenter = ($el, x, y) => {
        const [cx, cy] = centerOfElement($el);
        return [x - cx, y - cy];
    }

    const closenessToEdge = ($el, x, y) => {
        const [cx, cy] = centerOfElement($el);
        const [dx, dy] = distanceFromCenter($el, x, y);
        let k_x = Infinity;
        let k_y = Infinity;
        if (dx !== 0) {
            k_x = cx / Math.abs(dx);
        }
        if (dy !== 0) {
            k_y = cy / Math.abs(dy);
        }
        return clamp((1 / Math.min(k_x, k_y)), 0, 1);
    }

    const round = (value, precision = 3) => parseFloat(value.toFixed(precision));

    const clamp = (value, min = 0, max = 100) =>
        Math.min(Math.max(value, min), max);

    glowElements.forEach($el => {
        // Ensure glow span exists
        if (!$el.querySelector('.glow')) {
            const glowSpan = document.createElement('span');
            glowSpan.className = 'glow';
            $el.prepend(glowSpan);
        }

        $el.addEventListener("pointermove", (e) => {
            const position = pointerPositionRelativeToElement($el, e);
            const [px, py] = position.pixels;
            const [perx, pery] = position.percent;
            const [dx, dy] = distanceFromCenter($el, px, py);
            const edge = closenessToEdge($el, px, py);
            const angle = angleFromPointerEvent($el, dx, dy);

            $el.style.setProperty('--pointer-x', `${round(perx)}%`);
            $el.style.setProperty('--pointer-y', `${round(pery)}%`);
            $el.style.setProperty('--pointer-°', `${round(angle)}deg`);
            $el.style.setProperty('--pointer-d', `${round(edge * 100)}`);

            $el.classList.remove('animating');
        });

        $el.addEventListener("pointerleave", () => {
            $el.style.setProperty('--pointer-d', '0');
        });
    });
};

// --- Services Slider Draggable Momentum Logic ---
class ServicesDragger {
    constructor() {
        this.track = document.querySelector('.services-track');
        if (!this.track) return;

        // Container for hover detection
        this.container = this.track.parentElement;

        this.isDragging = false;
        this.isHovered = false;
        this.startX = 0;
        this.currentX = 0;
        this.scrollLeft = 0;
        this.velocity = 0;
        this.lastX = 0;
        this.lastTime = 0;
        this.animationId = null;

        // Configuration
        this.autoScrollSpeed = -2.5; // Faster continuous speed
        this.lerpFactor = 0.05; // Smoothness of transition to auto-speed

        this.init();
    }

    init() {
        this.track.addEventListener('mousedown', this.onStart.bind(this));
        this.track.addEventListener('touchstart', this.onStart.bind(this), { passive: true });

        window.addEventListener('mousemove', this.onMove.bind(this));
        window.addEventListener('touchmove', this.onMove.bind(this), { passive: false });

        window.addEventListener('mouseup', this.onEnd.bind(this));
        window.addEventListener('touchend', this.onEnd.bind(this));

        // Hover listeners
        if (this.container) {
            this.container.addEventListener('mouseenter', () => this.isHovered = true);
            this.container.addEventListener('mouseleave', () => this.isHovered = false);
        }

        // Trackpad / Scroll support
        this.track.addEventListener('wheel', this.onWheel.bind(this), { passive: false });

        // Start animation loop
        this.animate();
    }

    onStart(e) {
        this.isDragging = true;
        this.startX = e.pageX || e.touches[0].pageX;
        this.lastX = this.startX;
        this.lastTime = performance.now();
        this.velocity = 0;

        this.track.style.cursor = 'grabbing';
        this.track.style.transition = 'none';

        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.animate();
    }

    onMove(e) {
        if (!this.isDragging) return;

        const x = e.pageX || e.touches[0].pageX;
        const now = performance.now();
        const dt = now - this.lastTime;
        const dx = x - this.lastX;

        // Update velocity
        if (dt > 0) {
            this.velocity = dx / dt * 20; // Scale for feel
        }

        this.currentX += dx;
        this.lastX = x;
        this.lastTime = now;

        this.updatePosition();
    }

    onEnd() {
        if (!this.isDragging) return;
        this.isDragging = false;
        this.track.style.cursor = 'grab';
    }

    onWheel(e) {
        const isHorizontalIntent = Math.abs(e.deltaX) > Math.abs(e.deltaY);

        if (isHorizontalIntent) {
            e.preventDefault();
            const scrollAmount = e.deltaX;
            this.velocity = -scrollAmount * 0.5;
            this.currentX -= scrollAmount;
            this.updatePosition();
        }
    }

    updatePosition() {
        const cardWidth = 350 + 30; // Card + Gap
        const totalCards = 5;
        const trackWidth = cardWidth * totalCards;

        // Infinite wrap logic
        if (this.currentX > 0) {
            this.currentX -= trackWidth;
        } else if (this.currentX < -trackWidth) {
            this.currentX += trackWidth;
        }

        this.track.style.transform = `translateX(${this.currentX}px)`;
    }

    animate() {
        if (!this.isDragging) {
            // Determine target speed
            let targetVelocity = this.isHovered ? 0 : this.autoScrollSpeed;

            // Smoothly interpolate current velocity towards target velocity
            this.velocity += (targetVelocity - this.velocity) * this.lerpFactor;

            // Apply velocity
            this.currentX += this.velocity;
            this.updatePosition();
        }

        this.animationId = requestAnimationFrame(this.animate.bind(this));
    }
}

// Hero Sequence Animation
class HeroSequence {
    constructor() {
        this.canvas = document.getElementById('hero-sequence');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        // Prefer the track for scroll calculations, fallback to hero if track missing
        this.track = document.querySelector('.hero-scrollytelling-track');
        this.heroSection = document.getElementById('hero');

        // Configuration
        this.frameCount = 90;
        this.images = [];
        this.imagesLoaded = 0;
        this.currentFrame = this.frameCount - 1;
        this.framePrefix = 'ezgif-frame-';
        this.framePath = 'assets/hero section background/';

        this.init();
    }

    init() {
        this.resizeCanvas();

        // Debounce resize to prevent excessive calculations
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.resizeCanvas();
            }, 100);
        });

        this.preloadImages(() => {
            this.renderFrame(this.frameCount - 1);
            this.setupScrollListener();
        });
    }

    resizeCanvas() {
        // Set canvas resolution to match display size for sharp rendering
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // Re-render current frame after resize
        if (this.images[this.currentFrame]) {
            this.renderFrame(this.currentFrame);
        }
    }

    preloadImages(callback) {
        let loadedCount = 0;
        // Check if we already have images loaded (optional optimization if re-run)
        if (this.images.length === this.frameCount) {
            callback();
            return;
        }

        for (let i = 1; i <= this.frameCount; i++) {
            const img = new Image();
            // Pad number with zeros (001, 002, etc.)
            const frameNumber = i.toString().padStart(3, '0');
            img.src = `${this.framePath}${this.framePrefix}${frameNumber}.png`;

            img.onload = () => {
                this.images[i - 1] = img;
                loadedCount++;
                if (loadedCount === this.frameCount) {
                    callback();
                }
            };

            // Handle error minimally to avoid hanging
            img.onerror = () => {
                // If specific frames are missing, we just skip/warn
                // console.warn(`Failed to load frame ${i}`);
                loadedCount++;
                if (loadedCount === this.frameCount) {
                    callback();
                }
            }
        }
    }

    renderFrame(frameIndex) {
        if (frameIndex < 0 || frameIndex >= this.frameCount) return;

        const img = this.images[frameIndex];
        if (!img) return;

        // Draw Image Cover Logic (simulate object-fit: cover)
        const canvasRatio = this.canvas.width / this.canvas.height;
        const imgRatio = img.width / img.height;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (canvasRatio > imgRatio) {
            // Canvas is wider than image
            drawWidth = this.canvas.width;
            drawHeight = drawWidth / imgRatio;
        } else {
            // Canvas is taller than image
            drawHeight = this.canvas.height;
            drawWidth = drawHeight * imgRatio;
        }

        // Apply 20% zoom
        const scaleFactor = 1.2;
        drawWidth *= scaleFactor;
        drawHeight *= scaleFactor;

        // Center the image
        offsetX = (this.canvas.width - drawWidth) / 2;
        offsetY = (this.canvas.height - drawHeight) / 2;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

        // Optional dark overlay for text readability
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    setupScrollListener() {
        window.addEventListener('scroll', () => {
            const scrollContainer = this.track || document.body;

            // Calculate scrollable distance: 
            // The distance the sticky element travels relative to the container 
            // is effectively (Container Height - Stuck Element Height).
            // Usually viewport height for the stuck element.

            const trackHeight = scrollContainer.offsetHeight;
            const viewportHeight = window.innerHeight;
            const scrollDesc = trackHeight - viewportHeight;

            if (scrollDesc <= 0) return; // Should not happen with 400vh

            // Calculate current scroll position relative to the start of the track
            const trackTop = scrollContainer.offsetTop;
            const currentScroll = window.scrollY;
            const relativeScroll = currentScroll - trackTop;

            let progress = relativeScroll / scrollDesc;

            // Clamp progress between 0 and 1
            progress = Math.max(0, Math.min(1, progress));

            // Map progress to frame index (Reversed: End -> Start)
            const rawIndex = Math.floor(progress * (this.frameCount - 1));
            const frameIndex = (this.frameCount - 1) - rawIndex;

            if (this.currentFrame !== frameIndex) {
                this.currentFrame = frameIndex;
                requestAnimationFrame(() => this.renderFrame(frameIndex));
            }
        });
    }
}

// Services Background Animation
class ServicesBackground {
    constructor() {
        this.canvas = document.getElementById("services-bg");
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext("2d");
        this.signs = [];
        this.mouse = { x: 0, y: 0 };
        this.gridLength = 12; // Increased grid density
        this.mouseOver = false;
        this.mouseMoved = false;

        // Brand Colors
        this.color = "rgba(90, 176, 213, 0.4)"; // Light Blue with 40% opacity

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener("resize", this.resize.bind(this));

        // Create sign grid
        for (let i = 0; i < this.gridLength; i++) {
            this.signs[i] = [];
            for (let j = 0; j < this.gridLength; j++) {
                const sign = new this.Plus();
                sign.init(this.canvas, this.gridLength, i, j);
                this.signs[i][j] = sign;
            }
        }

        // Event Listeners
        const section = document.getElementById('services');
        if (section) {
            section.addEventListener("mousemove", this.onMouseMove.bind(this));
            section.addEventListener("touchmove", this.onMouseMove.bind(this), { passive: false });
            section.addEventListener("mouseenter", () => this.mouseOver = true);
            section.addEventListener("touchstart", (e) => {
                this.mouseOver = true;
                this.onMouseMove(e);
            }, { passive: true });
            section.addEventListener("mouseleave", this.onMouseLeave.bind(this));
            section.addEventListener("touchend", this.onMouseLeave.bind(this));
        }

        // Animation Loop using GSAP
        gsap.ticker.add(this.draw.bind(this));
    }

    resize() {
        this.canvas.width = this.canvas.parentElement.offsetWidth;
        this.canvas.height = this.canvas.parentElement.offsetHeight;

        // Re-calc positions if needed (simplified: just updating canvas dims usually enough for next draw)
        if (this.signs.length > 0) {
            for (let i = 0; i < this.gridLength; i++) {
                for (let j = 0; j < this.gridLength; j++) {
                    if (this.signs[i][j]) {
                        this.signs[i][j].calculatePosition(this.canvas, this.gridLength, i, j);
                    }
                }
            }
        }
    }

    onMouseMove(e) {
        if (e.targetTouches && e.targetTouches[0]) {
            e = e.targetTouches[0];
        }
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
        this.mouseMoved = true;
    }

    onMouseLeave() {
        this.mouseOver = false;

        for (let i = 0; i < this.gridLength; i++) {
            for (let j = 0; j < this.gridLength; j++) {
                const sign = this.signs[i][j];
                gsap.to(sign, { duration: 0.3, x: 0, y: 0, scale: 1 });
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.mouseOver && this.mouseMoved) {
            this.calculateSigns();
            this.mouseMoved = false;
        }

        for (let i = 0; i < this.gridLength; i++) {
            for (let j = 0; j < this.gridLength; j++) {
                const sign = this.signs[i][j];
                sign.draw(this.ctx, this.color);
            }
        }
    }

    calculateSigns() {
        for (let i = 0; i < this.gridLength; i++) {
            for (let j = 0; j < this.gridLength; j++) {
                const sign = this.signs[i][j];
                const hypLimit = Math.min(this.canvas.width, this.canvas.height) / (this.gridLength + 1) / 2;
                const d = this.dist([sign.left, sign.top], [this.mouse.x, this.mouse.y]);
                const ax = this.mouse.x - sign.left;
                const ay = this.mouse.y - sign.top;
                const angle = Math.atan2(ay, ax);

                let hyp = hypLimit;
                if (d < hypLimit + sign.width) {
                    hyp = d;
                    gsap.to(sign, { duration: 0.3, scale: 2 });
                } else {
                    gsap.to(sign, { duration: 0.3, scale: 1 });
                }

                gsap.to(sign, {
                    duration: 0.3,
                    x: Math.cos(angle) * hyp,
                    y: Math.sin(angle) * hyp
                });
            }
        }
    }

    dist([x1, y1], [x2, y2]) {
        const dx = x1 - x2;
        const dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy) || 1;
    }

    // Inner definition for Plus sign
    Plus = class {
        constructor() {
            this.x = 0;
            this.y = 0;
            this.top = 0;
            this.left = 0;
            this.height = 0;
            this.width = 0;
            this.scale = 1;
        }

        init(c, gridLength, i, j) {
            this.calculatePosition(c, gridLength, i, j);
        }

        calculatePosition(c, gridLength, i, j) {
            const min = Math.min(c.width, c.height);
            this.left = c.width / (gridLength + 1) * (i + 1);
            this.top = c.height / (gridLength + 1) * (j + 1);
            this.width = min / 50;
            this.height = min / 50;
        }

        draw(ctx, color) {
            ctx.save();
            ctx.beginPath();
            ctx.setTransform(
                this.scale,
                0,
                0,
                this.scale,
                this.left + this.x,
                this.top + this.y
            );
            ctx.lineWidth = 2;
            ctx.strokeStyle = color;

            ctx.moveTo(0, -this.height / 2);
            ctx.lineTo(0, this.height / 2);

            ctx.moveTo(-this.width / 2, 0);
            ctx.lineTo(this.width / 2, 0);

            ctx.stroke();
            ctx.closePath();
            ctx.restore();
        }
    }
}

// Certificate Background Particles
class CertificateParticles {
    constructor() {
        this.canvas = document.getElementById('cert-bg-canvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.balls = [];
        this.BALL_NUM = 30; // Number of particles
        this.R = 2; // Radius
        this.balls = [];
        this.alpha_f = 0.03;
        this.link_line_width = 0.8;
        this.dis_limit = 260;
        this.mouse_in = false;
        this.mouse_ball = {
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            r: 0,
            type: 'mouse'
        };

        // Brand Color: Navy Blue #0e2b5c -> 14, 43, 92
        this.ball_color = { r: 14, g: 43, b: 92 };

        this.init();
    }

    init() {
        this.resize();
        this.initBalls(this.BALL_NUM);

        // Resize Listener
        window.addEventListener('resize', () => this.resize());

        // Mouse Listeners (bound to the card/canvas)
        this.canvas.addEventListener('mouseenter', () => {
            this.mouse_in = true;
            this.balls.push(this.mouse_ball);
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.mouse_in = false;
            this.balls = this.balls.filter(b => !b.hasOwnProperty('type'));
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse_ball.x = e.clientX - rect.left;
            this.mouse_ball.y = e.clientY - rect.top;
        });

        // Start Loop
        this.render();
    }

    resize() {
        // Use parent dimensions
        const parent = this.canvas.parentElement;
        this.can_w = parent.offsetWidth;
        this.can_h = parent.offsetHeight;

        this.canvas.width = this.can_w;
        this.canvas.height = this.can_h;
    }

    initBalls(num) {
        this.balls = [];
        for (let i = 0; i < num; i++) {
            this.balls.push({
                x: this.randomSidePos(this.can_w),
                y: this.randomSidePos(this.can_h),
                vx: this.getRandomSpeed('top')[0],
                vy: this.getRandomSpeed('top')[1],
                r: this.R,
                alpha: 1,
                phase: this.randomNumFrom(0, 10)
            });
        }
    }

    getRandomSpeed(pos) {
        const min = -0.5;
        const max = 0.5;
        switch (pos) {
            case 'top': return [this.randomNumFrom(min, max), this.randomNumFrom(0.1, max)];
            case 'right': return [this.randomNumFrom(min, -0.1), this.randomNumFrom(min, max)];
            case 'bottom': return [this.randomNumFrom(min, max), this.randomNumFrom(min, -0.1)];
            case 'left': return [this.randomNumFrom(0.1, max), this.randomNumFrom(min, max)];
            default: return [0, 0];
        }
    }

    randomSidePos(length) {
        return Math.ceil(Math.random() * length);
    }

    randomNumFrom(min, max) {
        return Math.random() * (max - min) + min;
    }

    renderBalls() {
        this.balls.forEach(b => {
            if (!b.hasOwnProperty('type')) {
                this.ctx.fillStyle = `rgba(${this.ball_color.r},${this.ball_color.g},${this.ball_color.b},${b.alpha})`;
                this.ctx.beginPath();
                this.ctx.arc(b.x, b.y, this.R, 0, Math.PI * 2, true);
                this.ctx.closePath();
                this.ctx.fill();
            }
        });
    }

    updateBalls() {
        this.balls.forEach(b => {
            if (b.type === 'mouse') return; // Don't move mouse ball automatically

            b.x += b.vx;
            b.y += b.vy;

            // Boundary checks (wrap around or bounce? User script wrapped with buffer)
            if (b.x > -(50) && b.x < (this.can_w + 50) && b.y > -(50) && b.y < (this.can_h + 50)) {
                // Inside, do nothing special
            } else {
                // If went too far, reset? The original script just filtered them into new_balls. 
                // Let's implement simple wrapping for continuous effect or bounce.
                // The original script logic: new_balls.push(b) only if inside. So they die if they leave?
                // And addBallIfy adds new ones. Okay.
            }

            // Alpha phase
            b.phase += this.alpha_f;
            b.alpha = Math.abs(Math.cos(b.phase));
        });

        // Remove balls that are out of bounds
        this.balls = this.balls.filter(b => {
            if (b.type === 'mouse') return true;
            return b.x > -50 && b.x < (this.can_w + 50) && b.y > -50 && b.y < (this.can_h + 50);
        });

        // Add new balls if needed
        if (this.balls.length < this.BALL_NUM) {
            this.balls.push({
                x: this.randomSidePos(this.can_w),
                y: this.randomSidePos(this.can_h),
                vx: this.getRandomSpeed('top')[0],
                vy: this.getRandomSpeed('top')[1],
                r: this.R,
                alpha: 1,
                phase: this.randomNumFrom(0, 10)
            });
        }
    }

    renderLines() {
        let fraction, alpha;
        for (let i = 0; i < this.balls.length; i++) {
            for (let j = i + 1; j < this.balls.length; j++) {
                const dist = this.getDisOf(this.balls[i], this.balls[j]);
                fraction = dist / this.dis_limit;

                if (fraction < 1) {
                    alpha = (1 - fraction).toString();
                    // Line color: same navy blue but with alpha
                    this.ctx.strokeStyle = `rgba(${this.ball_color.r},${this.ball_color.g},${this.ball_color.b},${alpha})`;
                    this.ctx.lineWidth = this.link_line_width;

                    this.ctx.beginPath();
                    this.ctx.moveTo(this.balls[i].x, this.balls[i].y);
                    this.ctx.lineTo(this.balls[j].x, this.balls[j].y);
                    this.ctx.stroke();
                    this.ctx.closePath();
                }
            }
        }
    }

    getDisOf(b1, b2) {
        const dx = Math.abs(b1.x - b2.x);
        const dy = Math.abs(b1.y - b2.y);
        return Math.sqrt(dx * dx + dy * dy);
    }

    render() {
        this.ctx.clearRect(0, 0, this.can_w, this.can_h);
        this.renderBalls();
        this.renderLines();
        this.updateBalls();
        requestAnimationFrame(this.render.bind(this));
    }
}

// Counter Animation for Arsenal Section
class CounterAnimation {
    constructor() {
        this.counters = document.querySelectorAll('.arsenal-number');

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            rootMargin: '100px', // Expand detection area for Safari/3D
            threshold: 0 // Trigger as soon as any pixel is detected
        };

        this.observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    // Double check visibility with a small delay logic if needed, 
                    // but intersection observer is usually reliable.
                    this.startCount(counter);
                    observer.unobserve(counter);
                }
            });
        }, observerOptions);

        // Wait for layout to settle (especially with 3D transforms) before observing
        setTimeout(() => {
            this.counters.forEach(counter => {
                this.observer.observe(counter);
            });
        }, 1000); // 1 second delay
    }

    startCount(counter) {
        const targetAttr = counter.getAttribute('data-target');
        if (!targetAttr) return; // robustness check

        const target = parseInt(targetAttr, 10);
        const duration = 2000;
        const frameDuration = 1000 / 60;
        const totalFrames = Math.round(duration / frameDuration);
        // Ensure increment is at least 1 for small numbers to avoid 'stuck at 0' if logic fails
        const increment = target / totalFrames;

        let currentCount = 0;

        const updateCount = () => {
            currentCount += increment;

            if (currentCount < target) {
                counter.innerText = Math.ceil(currentCount).toLocaleString();
                requestAnimationFrame(updateCount);
            } else {
                counter.innerText = target.toLocaleString();
            }
        };

        requestAnimationFrame(updateCount);
    }
}

// GSAP Text Fill Animation
function initTextFillAnimation() {
    gsap.registerPlugin(ScrollTrigger);

    const target = document.querySelector(".js-fill > span");

    if (target && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.to(target, {
            backgroundSize: "200% 100%", /* Expand gradient to cover text */
            ease: "none",
            scrollTrigger: {
                trigger: ".js-fill",
                start: "top 80%",
                end: "bottom 20%",
                scrub: true,
                // markers: true // Debugging
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initPharmaGlow();
    new ServicesDragger();
    new HeroSequence();
    new ServicesBackground();
    new CertificateParticles();
    new CounterAnimation();
    initTextFillAnimation();
    initGlassCardBuild();
});

// Glass Card Construction Animation
function initGlassCardBuild() {
    gsap.registerPlugin(ScrollTrigger);

    const section = document.querySelector('#contact');
    const layers = {
        back: document.querySelector('.layer-back'),
        middle: document.querySelector('.layer-middle'),
        border: document.querySelector('.layer-border'),
        content: document.querySelector('.glass-content')
    };

    if (!section || !layers.back) return;

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: "top 70%", // Start when contact section is 70% down viewport
            end: "center center",
            toggleActions: "play none none reverse"
        }
    });

    // Initial States (Set via GSAP to avoid CSS flashing)

    // 1. Back Layer: Comes from deep Z and below
    tl.from(layers.back, {
        z: -500,
        y: 200,
        opacity: 0,
        rotationX: 45,
        duration: 1.2,
        ease: "power3.out"
    })

        // 2. Middle Layer: Slides in from left with frost effect
        .from(layers.middle, {
            xPercent: -120, // From left
            opacity: 0,
            scale: 0.9,
            duration: 1.2,
            ease: "power2.out"
        }, "-=0.8") // Overlap

        // 3. Border Layer: Snaps in (Scale down from huge)
        .from(layers.border, {
            scale: 1.5,
            opacity: 0,
            duration: 1,
            ease: "elastic.out(1, 0.75)"
        }, "-=0.8")

        // 4. Content fade in
        .to(layers.content, {
            opacity: 1,
            duration: 0.8,
            ease: "power2.out"
        }, "-=0.4");
}
