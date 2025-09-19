import { PixelBlast } from './components/PixelBlast.js';
import { ASCIIText } from './components/ASCIIText.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('initializing...');
  
  // Initialize PixelBlast background with dark theme
  const pixelBlastContainer = document.getElementById('pixel-blast-container');
  if (pixelBlastContainer) {
    try {
      const pixelBlast = new PixelBlast(pixelBlastContainer, {
        variant: 'circle',
        pixelSize: 4,
        color: '#00A8CC',
        patternScale: 2.5,
        patternDensity: 0.8,
        pixelSizeJitter: 0.3,
        enableRipples: true,
        rippleSpeed: 0.3,
        rippleThickness: 0.08,
        rippleIntensityScale: 1.2,
        liquid: true,
        liquidStrength: 0.08,
        liquidRadius: 0.8,
        liquidWobbleSpeed: 3,
        speed: 0.4,
        edgeFade: 0.35,
        transparent: true,
        darkMode: true
      });
      
      console.log('✅ PixelBlast initialized');
    } catch (error) {
      console.warn('⚠️ PixelBlast failed to initialize:', error);
    }
  }
  
  // Initialize ASCII Text with dark theme
  const asciiContainer = document.getElementById('ascii-text-container');
  if (asciiContainer) {
    try {
      const asciiText = new ASCIIText(asciiContainer, {
        text: 'obtanium',
        enableWaves: true,
        asciiFontSize: 6,
        textFontSize: 180,
        textColor: '#FFFFFF',
        planeBaseHeight: 6,
        darkMode: true
      });
      
      console.log('✅ ASCII Text initialized');
    } catch (error) {
      console.warn('⚠️ ASCII Text failed to initialize:', error);
    }
  }
  
  // Enhanced navbar scroll effect
  const navbar = document.querySelector('.navbar');
  let lastScrollY = window.scrollY;
  
  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    lastScrollY = currentScrollY;
  });
  
  // Theme switcher functionality
  const themeSwitcher = document.querySelector('.theme-switcher');
  if (themeSwitcher) {
    themeSwitcher.addEventListener('click', () => {
      // Add click animation
      themeSwitcher.classList.add('loading');
      
      setTimeout(() => {
        themeSwitcher.classList.remove('loading');
        console.log('🎨 Theme switched!');
        // Add theme switching logic here in future
      }, 600);
    });
    
    // Add keyboard support
    themeSwitcher.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        themeSwitcher.click();
      }
    });
  }
  
  // Enhanced card interactions
  const cards = document.querySelectorAll('.card');
  cards.forEach((card, index) => {
    // Add stagger animation delay
    card.style.setProperty('--stagger-index', index);
    
    // Add hover sound effect simulation (visual feedback)
    card.addEventListener('mouseenter', () => {
      card.classList.add('animate-elastic-bounce');
    });
    
    card.addEventListener('mouseleave', () => {
      card.classList.remove('animate-elastic-bounce');
    });
    
    // Add click ripple effect
    card.addEventListener('click', (e) => {
      const ripple = document.createElement('div');
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      ripple.style.position = 'absolute';
      ripple.style.borderRadius = '50%';
      ripple.style.background = 'rgba(0, 168, 204, 0.3)';
      ripple.style.transform = 'scale(0)';
      ripple.style.animation = 'ripple 0.6s linear';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.style.width = ripple.style.height = '40px';
      ripple.style.marginLeft = ripple.style.marginTop = '-20px';
      ripple.style.pointerEvents = 'none';
      
      card.style.position = 'relative';
      card.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
  
  // Add CSS for ripple animation
  if (!document.querySelector('#ripple-styles')) {
    const style = document.createElement('style');
    style.id = 'ripple-styles';
    style.textContent = `
      @keyframes ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Enhanced parallax effect for floating elements
  const floatingElements = document.querySelectorAll('.floating-element, .dark-orb');
  window.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    floatingElements.forEach((element, index) => {
      const speed = (index + 1) * 0.015;
      const x = (mouseX - 0.5) * speed * 50;
      const y = (mouseY - 0.5) * speed * 50;
      
      element.style.transform = `translate(${x}px, ${y}px)`;
    });
  });
  
  // Performance optimization: Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in-up');
        // Stop observing once animated
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe cards and content windows for scroll animations
  cards.forEach(card => observer.observe(card));
  document.querySelectorAll('.content-window').forEach(window => observer.observe(window));
  
  // CTA Button interactions
  const ctaButtons = document.querySelectorAll('.cta-button');
  ctaButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      if (button.classList.contains('primary')) {
        // Scroll to projects
        const projectsSection = document.querySelector('.projects-grid');
        if (projectsSection) {
          projectsSection.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (button.classList.contains('secondary')) {
        // Future contact functionality
        console.log('📧 Contact clicked - implement contact form/modal');
      }
    });
  });
  
  // Add smooth scroll behavior for all internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // Add loading states and error handling
  window.addEventListener('error', (e) => {
    console.warn('⚠️ Script error:', e.error);
  });
  
  window.addEventListener('unhandledrejection', (e) => {
    console.warn('⚠️ Unhandled promise rejection:', e.reason);
  });
  
  // Performance monitoring
  if ('performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log(`⚡ Page loaded in ${Math.round(perfData.loadEventEnd - perfData.fetchStart)}ms`);
      }, 0);
    });
  }
  
  console.log('initialized successfully!');
});