// Main JavaScript functionality for the portfolio

let asciiTextInstance = null;

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeASCIIText();
    initializeScrollEffects();
    initializeNavigation();
    initializeAnimations();
    initializeParticles();
});

// Initialize ASCII Text component
function initializeASCIIText() {
    const container = document.querySelector('.ascii-container');
    if (container && typeof createASCIIText === 'function') {
        asciiTextInstance = createASCIIText({
            text: 'hello_world',
            enableWaves: true,
            asciiFontSize: 8,
            textFontSize: 200,
            textColor: '#fdf9f3',
            planeBaseHeight: 8
        }, container);
    }
}

// Navigation functionality
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    const sections = document.querySelectorAll('section[id]');
    
    // Smooth scroll to sections
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Update active navigation item on scroll
    function updateActiveNav() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.pageYOffset >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav(); // Initial call
}

// Scroll effects
function initializeScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.about-card, .project-card, .section-header');
    animateElements.forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
    
    // Parallax effect for background
    function handleParallax() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        const backgroundContainer = document.querySelector('.background-container');
        if (backgroundContainer) {
            backgroundContainer.style.transform = `translateY(${rate}px)`;
        }
        
        // Update floating orbs
        const orbs = document.querySelectorAll('.orb');
        orbs.forEach((orb, index) => {
            const speed = 0.2 + (index * 0.1);
            const yPos = scrolled * speed;
            orb.style.transform = `translateY(${yPos}px)`;
        });
    }
    
    window.addEventListener('scroll', throttle(handleParallax, 16));
}

// Initialize animations
function initializeAnimations() {
    // Add CSS for scroll animations
    const style = document.createElement('style');
    style.textContent = `
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .animate-on-scroll.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .about-card.animate-on-scroll.animate-in {
            transition-delay: calc(var(--delay, 0) * 0.1s);
        }
    `;
    document.head.appendChild(style);
    
    // Set staggered delays for about cards
    const aboutCards = document.querySelectorAll('.about-card');
    aboutCards.forEach((card, index) => {
        card.style.setProperty('--delay', index);
    });
    
    // Typing animation for terminal
    const terminalLines = document.querySelectorAll('.terminal-line');
    terminalLines.forEach((line, index) => {
        line.style.opacity = '0';
        line.style.animation = `fadeInUp 0.5s ease forwards ${index * 0.1}s`;
    });
    
    // Add fade in up animation
    const fadeInUpCSS = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    style.textContent += fadeInUpCSS;
}

// Initialize particle system for enhanced visual effects
function initializeParticles() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1';
    canvas.style.opacity = '0.3';
    
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: 0, y: 0 };
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    function createParticle() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1,
            opacity: Math.random() * 0.5 + 0.2,
            color: Math.random() > 0.5 ? '#4fc3f7' : '#ba68c8'
        };
    }
    
    function initParticles() {
        particles = [];
        for (let i = 0; i < 50; i++) {
            particles.push(createParticle());
        }
    }
    
    function updateParticles() {
        particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Mouse interaction
            const dx = mouse.x - particle.x;
            const dy = mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const force = (100 - distance) / 100;
                particle.vx -= dx * force * 0.01;
                particle.vy -= dy * force * 0.01;
            }
            
            // Boundaries
            if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
            
            // Keep in bounds
            particle.x = Math.max(0, Math.min(canvas.width, particle.x));
            particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        });
    }
    
    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            ctx.globalAlpha = particle.opacity;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw connections
        particles.forEach((particle, i) => {
            particles.slice(i + 1).forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    ctx.globalAlpha = (100 - distance) / 100 * 0.2;
                    ctx.strokeStyle = particle.color;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(otherParticle.x, otherParticle.y);
                    ctx.stroke();
                }
            });
        });
    }
    
    function animate() {
        updateParticles();
        drawParticles();
        requestAnimationFrame(animate);
    }
    
    // Event listeners
    window.addEventListener('resize', resizeCanvas);
    document.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    
    // Initialize
    resizeCanvas();
    initParticles();
    animate();
}

// Utility function for scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Throttle function for performance
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Debounce function for resize events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Enhanced glitch effect for text
function initializeGlitchEffect() {
    const glitchText = document.querySelector('.glitch-text');
    if (glitchText) {
        setInterval(() => {
            if (Math.random() > 0.95) {
                glitchText.style.animation = 'none';
                glitchText.offsetHeight; // Trigger reflow
                glitchText.style.animation = null;
            }
        }, 100);
    }
}

// Initialize theme switching (day/night cycle)
function initializeThemeSystem() {
    const root = document.documentElement;
    let isDarkMode = true;
    
    // Create theme toggle button
    const themeToggle = document.createElement('button');
    themeToggle.innerHTML = '🌙';
    themeToggle.className = 'theme-toggle glass-button';
    themeToggle.style.position = 'fixed';
    themeToggle.style.bottom = '20px';
    themeToggle.style.right = '20px';
    themeToggle.style.zIndex = '1000';
    themeToggle.style.width = '50px';
    themeToggle.style.height = '50px';
    themeToggle.style.borderRadius = '50%';
    themeToggle.style.fontSize = '20px';
    
    document.body.appendChild(themeToggle);
    
    themeToggle.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        themeToggle.innerHTML = isDarkMode ? '🌙' : '☀️';
        
        if (isDarkMode) {
            root.style.setProperty('--dark-bg', '#0a0a0f');
            root.style.setProperty('--text-primary', '#ffffff');
        } else {
            root.style.setProperty('--dark-bg', '#f5f5f5');
            root.style.setProperty('--text-primary', '#333333');
        }
    });
}

// Matrix rain effect for background enhancement
function initializeMatrixRain() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0';
    canvas.style.opacity = '0.1';
    
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let drops = [];
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const columns = Math.floor(canvas.width / 10);
        drops = [];
        for (let i = 0; i < columns; i++) {
            drops[i] = Math.random() * -100;
        }
    }
    
    function drawMatrix() {
        ctx.fillStyle = 'rgba(10, 10, 15, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#4fc3f7';
        ctx.font = '10px IBM Plex Mono';
        
        for (let i = 0; i < drops.length; i++) {
            const char = String.fromCharCode(Math.floor(Math.random() * 128) + 32);
            ctx.fillText(char, i * 10, drops[i]);
            
            if (drops[i] > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i] += 10;
        }
    }
    
    function animateMatrix() {
        drawMatrix();
        requestAnimationFrame(animateMatrix);
    }
    
    window.addEventListener('resize', debounce(resizeCanvas, 250));
    resizeCanvas();
    animateMatrix();
}

// Sound effects system (optional, can be muted)
function initializeSoundSystem() {
    let audioContext;
    let isMuted = true; // Default to muted
    
    function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }
    
    function playTone(frequency, duration, volume = 0.1) {
        if (isMuted || !audioContext) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration - 0.01);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }
    
    // Add sound to button interactions
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('glass-button') || 
            e.target.closest('.glass-button')) {
            initAudio();
            playTone(800, 0.1, 0.05);
        }
    });
    
    // Add sound toggle
    const soundToggle = document.createElement('button');
    soundToggle.innerHTML = '🔇';
    soundToggle.className = 'sound-toggle glass-button';
    soundToggle.style.position = 'fixed';
    soundToggle.style.bottom = '80px';
    soundToggle.style.right = '20px';
    soundToggle.style.zIndex = '1000';
    soundToggle.style.width = '50px';
    soundToggle.style.height = '50px';
    soundToggle.style.borderRadius = '50%';
    soundToggle.style.fontSize = '16px';
    
    document.body.appendChild(soundToggle);
    
    soundToggle.addEventListener('click', () => {
        isMuted = !isMuted;
        soundToggle.innerHTML = isMuted ? '🔇' : '🔊';
        if (!isMuted) initAudio();
    });
}

// Performance monitor
function initializePerformanceMonitor() {
    let fps = 0;
    let lastTime = performance.now();
    let frameCount = 0;
    
    function calculateFPS() {
        frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - lastTime >= 1000) {
            fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
            frameCount = 0;
            lastTime = currentTime;
            
            // Adjust particle count based on performance
            if (fps < 30 && window.particleSystem) {
                // Reduce particles if FPS is low
                console.log(`FPS: ${fps} - Optimizing performance`);
            }
        }
        
        requestAnimationFrame(calculateFPS);
    }
    
    // Only run in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        calculateFPS();
        
        // Show FPS counter
        const fpsCounter = document.createElement('div');
        fpsCounter.style.position = 'fixed';
        fpsCounter.style.top = '10px';
        fpsCounter.style.left = '10px';
        fpsCounter.style.color = '#4fc3f7';
        fpsCounter.style.fontFamily = 'IBM Plex Mono';
        fpsCounter.style.fontSize = '12px';
        fpsCounter.style.zIndex = '9999';
        fpsCounter.style.background = 'rgba(0,0,0,0.5)';
        fpsCounter.style.padding = '5px';
        fpsCounter.style.borderRadius = '3px';
        
        document.body.appendChild(fpsCounter);
        
        setInterval(() => {
            fpsCounter.textContent = `FPS: ${fps}`;
        }, 1000);
    }
}

// Initialize all enhanced features
document.addEventListener('DOMContentLoaded', function() {
    // Core functionality
    initializeASCIIText();
    initializeScrollEffects();
    initializeNavigation();
    initializeAnimations();
    
    // Enhanced features
    initializeParticles();
    initializeGlitchEffect();
    initializeThemeSystem();
    initializeMatrixRain();
    initializeSoundSystem();
    initializePerformanceMonitor();
    
    // Add loading complete class
    document.body.classList.add('loaded');
});

// Handle page visibility change for performance
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Pause animations when tab is not visible
        document.body.classList.add('paused');
    } else {
        // Resume animations when tab becomes visible
        document.body.classList.remove('paused');
    }
});

// Clean up on page unload
window.addEventListener('beforeunload', function() {
    if (asciiTextInstance && asciiTextInstance.dispose) {
        asciiTextInstance.dispose();
    }
});