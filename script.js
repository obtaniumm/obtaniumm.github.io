import { initializeTheme, toggleTheme } from './js/theme.js';

initializeTheme();

document.addEventListener('DOMContentLoaded', () => {
  const themeSwitcher = document.querySelector('.theme-switcher');
  if (themeSwitcher) {
    themeSwitcher.addEventListener('click', toggleTheme);
  }
});