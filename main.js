/**
 * PAX.EDU.VN - Under Construction Page
 * Three.js particle system and interactive animations
 */

// ===== Three.js Scene Setup =====
class ParticleScene {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.scene = new THREE.Scene();
        this.camera = null;
        this.renderer = null;
        this.particles = null;
        this.geometricShape = null;
        this.mouse = { x: 0, y: 0 };
        this.targetMouse = { x: 0, y: 0 };
        this.clock = new THREE.Clock();
        
        this.init();
        this.createParticles();
        this.createGeometricShape();
        this.addEventListeners();
        this.animate();
    }
    
    init() {
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 30;
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        this.container.appendChild(this.renderer.domElement);
    }
    
    createParticles() {
        const particleCount = 1500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        
        // Color palette
        const colorPalette = [
            new THREE.Color(0x6366f1), // Indigo
            new THREE.Color(0x8b5cf6), // Purple
            new THREE.Color(0xa855f7), // Violet
            new THREE.Color(0x22d3ee), // Cyan
            new THREE.Color(0xec4899), // Pink
        ];
        
        for (let i = 0; i < particleCount; i++) {
            // Spherical distribution
            const radius = 20 + Math.random() * 30;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi) - 15;
            
            // Random color from palette
            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
            
            // Random size
            sizes[i] = Math.random() * 2 + 0.5;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        // Custom shader material for better particles
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uSize: { value: 3.0 * this.renderer.getPixelRatio() }
            },
            vertexShader: `
                attribute float size;
                varying vec3 vColor;
                uniform float uTime;
                uniform float uSize;
                
                void main() {
                    vColor = color;
                    vec3 pos = position;
                    
                    // Gentle floating animation
                    pos.y += sin(uTime * 0.5 + position.x * 0.1) * 0.5;
                    pos.x += cos(uTime * 0.3 + position.z * 0.1) * 0.3;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = size * uSize * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    float dist = length(gl_PointCoord - vec2(0.5));
                    if (dist > 0.5) discard;
                    
                    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
                    alpha *= 0.6;
                    
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }
    
    createGeometricShape() {
        // Create an icosahedron (20-sided polyhedron)
        const geometry = new THREE.IcosahedronGeometry(5, 1);
        
        // Wireframe material with gradient effect
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColor1: { value: new THREE.Color(0x6366f1) },
                uColor2: { value: new THREE.Color(0x22d3ee) }
            },
            vertexShader: `
                varying vec3 vPosition;
                varying vec3 vNormal;
                
                void main() {
                    vPosition = position;
                    vNormal = normal;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uTime;
                uniform vec3 uColor1;
                uniform vec3 uColor2;
                varying vec3 vPosition;
                varying vec3 vNormal;
                
                void main() {
                    float mixFactor = (sin(uTime + vPosition.y * 0.5) + 1.0) * 0.5;
                    vec3 color = mix(uColor1, uColor2, mixFactor);
                    
                    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
                    float alpha = 0.3 + fresnel * 0.5;
                    
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            wireframe: true,
            side: THREE.DoubleSide
        });
        
        this.geometricShape = new THREE.Mesh(geometry, material);
        this.geometricShape.position.set(15, 5, -10);
        this.scene.add(this.geometricShape);
        
        // Create second shape
        const geometry2 = new THREE.OctahedronGeometry(3, 0);
        const material2 = material.clone();
        material2.uniforms.uColor1.value = new THREE.Color(0xec4899);
        material2.uniforms.uColor2.value = new THREE.Color(0xa855f7);
        
        this.geometricShape2 = new THREE.Mesh(geometry2, material2);
        this.geometricShape2.position.set(-18, -8, -5);
        this.scene.add(this.geometricShape2);
        
        // Create third shape (torus)
        const geometry3 = new THREE.TorusGeometry(4, 0.5, 16, 50);
        const material3 = material.clone();
        material3.uniforms.uColor1.value = new THREE.Color(0x22d3ee);
        material3.uniforms.uColor2.value = new THREE.Color(0x6366f1);
        
        this.geometricShape3 = new THREE.Mesh(geometry3, material3);
        this.geometricShape3.position.set(-10, 12, -15);
        this.scene.add(this.geometricShape3);
    }
    
    addEventListeners() {
        window.addEventListener('resize', () => this.onResize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    }
    
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    onMouseMove(event) {
        this.targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const elapsed = this.clock.getElapsedTime();
        
        // Smooth mouse following
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;
        
        // Update particles
        if (this.particles) {
            this.particles.rotation.y = elapsed * 0.05;
            this.particles.rotation.x = elapsed * 0.02;
            this.particles.material.uniforms.uTime.value = elapsed;
            
            // React to mouse
            this.particles.rotation.y += this.mouse.x * 0.1;
            this.particles.rotation.x += this.mouse.y * 0.1;
        }
        
        // Animate geometric shapes
        if (this.geometricShape) {
            this.geometricShape.rotation.x = elapsed * 0.3;
            this.geometricShape.rotation.y = elapsed * 0.5;
            this.geometricShape.position.y = 5 + Math.sin(elapsed * 0.5) * 2;
            this.geometricShape.material.uniforms.uTime.value = elapsed;
        }
        
        if (this.geometricShape2) {
            this.geometricShape2.rotation.x = -elapsed * 0.4;
            this.geometricShape2.rotation.z = elapsed * 0.3;
            this.geometricShape2.position.y = -8 + Math.cos(elapsed * 0.4) * 3;
            this.geometricShape2.material.uniforms.uTime.value = elapsed;
        }
        
        if (this.geometricShape3) {
            this.geometricShape3.rotation.x = elapsed * 0.2;
            this.geometricShape3.rotation.y = elapsed * 0.4;
            this.geometricShape3.position.x = -10 + Math.sin(elapsed * 0.3) * 2;
            this.geometricShape3.material.uniforms.uTime.value = elapsed;
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

// ===== Countdown Timer =====
class CountdownTimer {
    constructor() {
        // Set launch date to 30 days from now
        const launchDate = new Date();
        launchDate.setDate(launchDate.getDate() + 30);
        this.targetDate = launchDate.getTime();
        
        this.daysEl = document.getElementById('days');
        this.hoursEl = document.getElementById('hours');
        this.minutesEl = document.getElementById('minutes');
        this.secondsEl = document.getElementById('seconds');
        
        this.update();
        setInterval(() => this.update(), 1000);
    }
    
    update() {
        const now = new Date().getTime();
        const distance = this.targetDate - now;
        
        if (distance < 0) {
            this.daysEl.textContent = '00';
            this.hoursEl.textContent = '00';
            this.minutesEl.textContent = '00';
            this.secondsEl.textContent = '00';
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        this.animateNumber(this.daysEl, days);
        this.animateNumber(this.hoursEl, hours);
        this.animateNumber(this.minutesEl, minutes);
        this.animateNumber(this.secondsEl, seconds);
    }
    
    animateNumber(element, value) {
        const newValue = String(value).padStart(2, '0');
        if (element.textContent !== newValue) {
            element.style.transform = 'translateY(-5px)';
            element.style.opacity = '0.5';
            
            setTimeout(() => {
                element.textContent = newValue;
                element.style.transform = 'translateY(0)';
                element.style.opacity = '1';
            }, 150);
        }
    }
}

// ===== Newsletter Form =====
class NewsletterForm {
    constructor() {
        this.form = document.getElementById('newsletter-form');
        this.input = document.getElementById('email-input');
        this.submitBtn = document.getElementById('submit-btn');
        this.successMessage = document.getElementById('success-message');
        
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        const email = this.input.value.trim();
        if (!this.validateEmail(email)) {
            this.showError();
            return;
        }
        
        // Simulate form submission
        this.submitBtn.disabled = true;
        this.submitBtn.innerHTML = '<span class="btn-text">Đang gửi...</span>';
        
        setTimeout(() => {
            this.form.style.display = 'none';
            this.successMessage.classList.add('show');
            
            // Store email (in a real app, this would be sent to a server)
            console.log('Email registered:', email);
        }, 1500);
    }
    
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    showError() {
        this.input.style.borderColor = '#ef4444';
        this.input.classList.add('shake');
        
        setTimeout(() => {
            this.input.style.borderColor = '';
            this.input.classList.remove('shake');
        }, 500);
    }
}

// ===== Smooth Scroll Animations =====
class ScrollAnimations {
    constructor() {
        this.observeElements();
    }
    
    observeElements() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, options);
        
        document.querySelectorAll('.feature-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
    }
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    
    .shake {
        animation: shake 0.5s ease-in-out;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    .countdown-value {
        transition: transform 0.15s ease, opacity 0.15s ease;
    }
`;
document.head.appendChild(style);

// ===== Initialize Everything =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Three.js scene
    new ParticleScene();
    
    // Initialize countdown
    new CountdownTimer();
    
    // Initialize newsletter form
    new NewsletterForm();
    
    // Initialize scroll animations
    new ScrollAnimations();
    
    // Add loading animation
    document.body.classList.add('loaded');
});

// Add loaded state styles
const loadedStyle = document.createElement('style');
loadedStyle.textContent = `
    body {
        opacity: 0;
        transition: opacity 0.5s ease;
    }
    
    body.loaded {
        opacity: 1;
    }
`;
document.head.appendChild(loadedStyle);
