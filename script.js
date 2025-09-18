import ASCIIText from './components/ASCIIText.js';
import PixelBlast from './components/PixelBlast.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize PixelBlast background
  const pixelBlastContainer = document.getElementById('pixel-blast-container');
  if (pixelBlastContainer) {
    // Create PixelBlast component
    const pixelBlastElement = document.createElement('div');
    pixelBlastElement.style.width = '100%';
    pixelBlastElement.style.height = '100%';
    pixelBlastElement.style.position = 'absolute';
    pixelBlastContainer.appendChild(pixelBlastElement);
    
    // Initialize PixelBlast with React-like props
    const pixelBlast = new PixelBlast({
      variant: 'circle',
      pixelSize: 6,
      color: '#B19EEF',
      patternScale: 3,
      patternDensity: 1.2,
      pixelSizeJitter: 0.5,
      enableRipples: true,
      rippleSpeed: 0.4,
      rippleThickness: 0.12,
      rippleIntensityScale: 1.5,
      liquid: true,
      liquidStrength: 0.12,
      liquidRadius: 1.2,
      liquidWobbleSpeed: 5,
      speed: 0.6,
      edgeFade: 0.25,
      transparent: true
    });
  }
  
  // Initialize ASCII Text
  const asciiContainer = document.getElementById('ascii-text-container');
  if (asciiContainer) {
    // Create ASCII Text component
    const asciiText = new ASCIIText({
      text: 'obtanium',
      enableWaves: true,
      asciiFontSize: 8,
      textFontSize: 200,
      textColor: '#fdf9f3',
      planeBaseHeight: 8
    });
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
        // Theme switching logic would go here
        console.log('Theme switched!');
      }, 500);
    });
  }
  
  // Enhanced card interactions
  const cards = document.querySelectorAll('.card');
  cards.forEach((card, index) => {
    // Add stagger animation delay
    card.style.setProperty('--stagger-index', index);
    
    // Add hover sound effect simulation
    card.addEventListener('mouseenter', () => {
      card.classList.add('animate-elastic-bounce');
    });
    
    card.addEventListener('mouseleave', () => {
      card.classList.remove('animate-elastic-bounce');
    });
    
    // Add click ripple effect
    card.addEventListener('click', (e) => {
      const ripple = document.createElement('div');
      ripple.style.position = 'absolute';
      ripple.style.borderRadius = '50%';
      ripple.style.background = 'rgba(255, 255, 255, 0.3)';
      ripple.style.transform = 'scale(0)';
      ripple.style.animation = 'ripple 0.6s linear';
      ripple.style.left = (e.clientX - card.offsetLeft) + 'px';
      ripple.style.top = (e.clientY - card.offsetTop) + 'px';
      ripple.style.width = ripple.style.height = '20px';
      ripple.style.marginLeft = ripple.style.marginTop = '-10px';
      
      card.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
  
  // Add CSS for ripple animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
  
  // Parallax effect for floating orbs
  const floatingOrbs = document.querySelectorAll('.floating-orb');
  window.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    floatingOrbs.forEach((orb, index) => {
      const speed = (index + 1) * 0.02;
      const x = (mouseX - 0.5) * speed * 100;
      const y = (mouseY - 0.5) * speed * 100;
      
      orb.style.transform = `translate(${x}px, ${y}px)`;
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
      }
    });
  }, observerOptions);
  
  // Observe all cards for scroll animations
  cards.forEach(card => {
    observer.observe(card);
  });
  
  console.log('🌈 Frutiger Aero experience initialized!');
});