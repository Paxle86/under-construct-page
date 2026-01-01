/**
 * PAX.EDU.VN - Lightweight Floating Particles
 * Inspired by Antigravity style - minimal and elegant
 */

// Lightweight particle system using Canvas 2D
class FloatingParticles {
    constructor() {
        this.canvas = document.getElementById('bg-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 30; // Reduced count for performance
        this.mouse = { x: null, y: null };
        this.animationId = null;

        this.init();
    }

    init() {
        this.resize();
        this.createParticles();
        this.bindEvents();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3,
                opacity: Math.random() * 0.5 + 0.2,
                hue: Math.random() * 60 + 200 // Blue to purple range
            });
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.resize();
            this.createParticles();
        });

        // Subtle mouse interaction
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    drawParticle(p) {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = `hsla(${p.hue}, 70%, 70%, ${p.opacity})`;
        this.ctx.fill();
    }

    updateParticle(p) {
        // Gentle floating motion
        p.x += p.speedX;
        p.y += p.speedY;

        // Subtle mouse repulsion
        if (this.mouse.x && this.mouse.y) {
            const dx = p.x - this.mouse.x;
            const dy = p.y - this.mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 150) {
                const force = (150 - dist) / 150 * 0.02;
                p.x += dx * force;
                p.y += dy * force;
            }
        }

        // Wrap around edges
        if (p.x < -10) p.x = this.canvas.width + 10;
        if (p.x > this.canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = this.canvas.height + 10;
        if (p.y > this.canvas.height + 10) p.y = -10;
    }

    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    const opacity = (1 - dist / 120) * 0.15;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(147, 112, 219, ${opacity})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw connections first (behind particles)
        this.drawConnections();

        // Update and draw particles
        this.particles.forEach(p => {
            this.updateParticle(p);
            this.drawParticle(p);
        });

        this.animationId = requestAnimationFrame(() => this.animate());
    }
}

// Countdown Timer
class CountdownTimer {
    constructor() {
        // Target: 30 days from now
        this.targetDate = new Date();
        this.targetDate.setDate(this.targetDate.getDate() + 30);

        this.elements = {
            days: document.getElementById('days'),
            hours: document.getElementById('hours'),
            minutes: document.getElementById('minutes'),
            seconds: document.getElementById('seconds')
        };

        this.update();
        setInterval(() => this.update(), 1000);
    }

    update() {
        const now = new Date();
        const diff = this.targetDate - now;

        if (diff <= 0) {
            Object.values(this.elements).forEach(el => {
                if (el) el.textContent = '00';
            });
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (this.elements.days) this.elements.days.textContent = String(days).padStart(2, '0');
        if (this.elements.hours) this.elements.hours.textContent = String(hours).padStart(2, '0');
        if (this.elements.minutes) this.elements.minutes.textContent = String(minutes).padStart(2, '0');
        if (this.elements.seconds) this.elements.seconds.textContent = String(seconds).padStart(2, '0');
    }
}

// Email Form Handler
class EmailForm {
    constructor() {
        this.form = document.getElementById('notify-form');
        this.input = document.getElementById('email-input');
        this.button = this.form?.querySelector('button');

        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    handleSubmit(e) {
        e.preventDefault();

        const email = this.input?.value.trim();
        if (!email || !this.validateEmail(email)) {
            this.showMessage('Vui lòng nhập email hợp lệ', 'error');
            return;
        }

        // Simulate submission
        if (this.button) {
            this.button.textContent = 'Đang gửi...';
            this.button.disabled = true;
        }

        setTimeout(() => {
            this.showMessage('Cảm ơn bạn! Chúng tôi sẽ thông báo khi ra mắt.', 'success');
            if (this.input) this.input.value = '';
            if (this.button) {
                this.button.textContent = 'Thông Báo Cho Tôi';
                this.button.disabled = false;
            }
        }, 1000);
    }

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    showMessage(text, type) {
        // Remove existing message
        const existing = document.querySelector('.form-message');
        if (existing) existing.remove();

        const message = document.createElement('div');
        message.className = `form-message ${type}`;
        message.textContent = text;
        message.style.cssText = `
            margin-top: 1rem;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            font-size: 0.9rem;
            text-align: center;
            animation: fadeIn 0.3s ease;
            background: ${type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
            color: ${type === 'success' ? '#10b981' : '#ef4444'};
            border: 1px solid ${type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
        `;

        this.form.appendChild(message);

        setTimeout(() => message.remove(), 5000);
    }
}

// Smooth scroll reveal animation
class ScrollReveal {
    constructor() {
        this.elements = document.querySelectorAll('.feature-card');
        this.observer = new IntersectionObserver(
            (entries) => this.handleIntersect(entries),
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        this.elements.forEach(el => this.observer.observe(el));
    }

    handleIntersect(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize lightweight particle system
    new FloatingParticles();

    // Initialize countdown
    new CountdownTimer();

    // Initialize email form
    new EmailForm();

    // Initialize scroll reveal
    new ScrollReveal();

    console.log('🚀 PAX.EDU.VN - Lightweight version loaded');
});
