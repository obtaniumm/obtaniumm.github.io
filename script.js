import { initializeTheme, toggleTheme } from './js/theme.js';

// Initialize theme system
initializeTheme();

// Add event listener for theme toggle
document.addEventListener('DOMContentLoaded', () => {
  const themeSwitcher = document.querySelector('.theme-switcher');
  if (themeSwitcher) {
    themeSwitcher.addEventListener('click', toggleTheme);
  }
});
