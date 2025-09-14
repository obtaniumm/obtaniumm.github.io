document.addEventListener('DOMContentLoaded', () => {
  // Add glitch effect to navbar on scroll
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('glitch-effect');
      } else {
        navbar.classList.remove('glitch-effect');
      }
    });
  }
  
  // Add random glitch effects to cards
  const cards = document.querySelectorAll('.card');
  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 2}s`;
    
    // Random glitch effect
    setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every interval
        card.classList.add('glitch-effect');
        setTimeout(() => {
          card.classList.remove('glitch-effect');
        }, 200);
      }
    }, 3000);
  });
  
  // Add random text glitch to hero title
  const heroTitle = document.querySelector('.hero h1');
  if (heroTitle) {
    setInterval(() => {
      if (Math.random() < 0.15) { // 15% chance
        heroTitle.classList.add('glitch-effect');
        setTimeout(() => {
          heroTitle.classList.remove('glitch-effect');
        }, 300);
      }
    }, 2000);
  }
  
  // Add terminal-like typing effect to hero details
  const heroDetails = document.querySelectorAll('.hero-details p');
  heroDetails.forEach((p, index) => {
    const text = p.textContent;
    p.textContent = '';
    
    setTimeout(() => {
      let i = 0;
      const typeInterval = setInterval(() => {
        if (i < text.length) {
          p.textContent = '> ' + text.slice(0, i + 1);
          i++;
        } else {
          clearInterval(typeInterval);
        }
      }, 50);
    }, index * 800 + 1000);
  });
});