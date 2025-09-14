document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  
  // Total loading time: 14 seconds (13s animation + 1s buffer)
  const LOADING_DURATION = 14000;
  
  // Prevent scrolling during loading
  let scrollPosition = 0;
  
  function disableScroll() {
    scrollPosition = window.pageYOffset;
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollPosition}px`;
    body.style.width = '100%';
  }
  
  function enableScroll() {
    body.style.removeProperty('overflow');
    body.style.removeProperty('position');
    body.style.removeProperty('top');
    body.style.removeProperty('width');
    window.scrollTo(0, scrollPosition);
    body.classList.remove('loading');
  }
  
  // Disable scrolling immediately
  disableScroll();
  
  // Prevent wheel, touch, and keyboard scrolling
  function preventDefault(e) {
    e.preventDefault();
  }
  
  function preventDefaultForScrollKeys(e) {
    const scrollKeys = {
      37: true, // left
      38: true, // up
      39: true, // right
      40: true, // down
      32: true, // spacebar
      33: true, // page up
      34: true, // page down
      35: true, // end
      36: true  // home
    };
    
    if (scrollKeys[e.keyCode]) {
      preventDefault(e);
      return false;
    }
  }
  
  // Add event listeners to prevent scrolling
  const scrollEvents = ['wheel', 'DOMMouseScroll', 'mousewheel', 'touchmove'];
  scrollEvents.forEach(event => {
    window.addEventListener(event, preventDefault, { passive: false });
  });
  
  window.addEventListener('keydown', preventDefaultForScrollKeys, false);
  
  // Remove loading state and enable scrolling after animation completes
  setTimeout(() => {
    // Remove event listeners
    scrollEvents.forEach(event => {
      window.removeEventListener(event, preventDefault, { passive: false });
    });
    
    window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
    
    // Enable scrolling
    enableScroll();
    
    // Add completion sound effect (optional - commented out)
    // const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LHeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjm96MaOOQgYYrzr4nVsE');
    
    console.log('Windows 98 boot sequence complete');
  }, LOADING_DURATION);
  
  // Add double-click functionality to desktop icons
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    let clickCount = 0;
    let clickTimer = null;
    
    card.addEventListener('click', (e) => {
      clickCount++;
      
      if (clickCount === 1) {
        // Single click - select icon
        card.style.background = 'rgba(0, 0, 128, 0.3)';
        card.style.color = '#ffffff';
        
        clickTimer = setTimeout(() => {
          clickCount = 0;
          // Deselect after timeout
          card.style.background = '';
          card.style.color = '';
        }, 500);
        
      } else if (clickCount === 2) {
        // Double click - open/navigate
        clearTimeout(clickTimer);
        clickCount = 0;
        
        // Add opening animation
        card.classList.add('double-clicked');
        
        // If it's a link, follow it after animation
        const link = card.closest('a');
        if (link) {
          setTimeout(() => {
            window.open(link.href, '_blank');
          }, 200);
        }
        
        setTimeout(() => {
          card.classList.remove('double-clicked');
          card.style.background = '';
          card.style.color = '';
        }, 300);
      }
    });
  });
  
  // Add Windows 98 system sounds simulation (visual feedback)
  const logo = document.querySelector('.logo');
  if (logo) {
    logo.addEventListener('click', () => {
      // Simulate start menu click
      logo.style.background = '#c3c3c3';
      logo.style.border = '2px inset #c0c0c0';
      
      setTimeout(() => {
        logo.style.background = '#c0c0c0';
        logo.style.border = '2px outset #c0c0c0';
      }, 150);
    });
  }
  
  // Add random system glitches for liminal effect (after loading)
  setTimeout(() => {
    setInterval(() => {
      if (Math.random() < 0.05) { // 5% chance every 3 seconds
        const navbar = document.querySelector('.navbar');
        if (navbar) {
          navbar.classList.add('window-shake');
          setTimeout(() => {
            navbar.classList.remove('window-shake');
          }, 200);
        }
      }
    }, 3000);
  }, LOADING_DURATION);
  
  // Simulate memory leak warnings (liminal effect)
  setTimeout(() => {
    setInterval(() => {
      if (Math.random() < 0.02) { // 2% chance every 10 seconds
        console.warn('System resources running low');
      }
    }, 10000);
  }, LOADING_DURATION);
});