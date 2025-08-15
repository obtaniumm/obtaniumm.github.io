import { initializeTheme, toggleTheme } from './js/theme.js';

initializeTheme();

document.addEventListener('DOMContentLoaded', () => {
  const themeSwitcher = document.querySelector('.theme-switcher');
  if (themeSwitcher) {
    themeSwitcher.addEventListener('click', toggleTheme);
    
    // Add idle breathing animation
    themeSwitcher.classList.add('idle');
    
    // Remove idle animation on interaction
    themeSwitcher.addEventListener('mouseenter', () => {
      themeSwitcher.classList.remove('idle');
    });
    
    themeSwitcher.addEventListener('mouseleave', () => {
      setTimeout(() => {
        themeSwitcher.classList.add('idle');
      }, 2000);
    });
  }
  
  // Add scroll effect to navbar
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }
  
  // Add staggered animation delays to cards
  const cards = document.querySelectorAll('.card');
  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.2}s`;
  });
});