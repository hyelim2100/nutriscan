// Get DOM elements
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const imageInput  = document.getElementById('imageInput');
const scanBtn     = document.getElementById('scanBtn');
const resultBox   = document.getElementById('resultBox');
const pingBtn     = document.getElementById('pingBtn');
const root = document.documentElement;           // <html>
const themeToggle  = document.getElementById('themeToggle');

function applyTheme(theme) {
  if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark');
    themeToggle.setAttribute('aria-pressed', 'true');
    themeToggle.textContent = '🌙';
  } else {
    root.removeAttribute('data-theme'); // default light
    themeToggle.setAttribute('aria-pressed', 'false');
    themeToggle.textContent = '🌞';
  }
  localStorage.setItem('nutriscan-theme', theme);
}

// Initialize theme on page load
(function initTheme() {
  const saved = localStorage.getItem('nutriscan-theme');
  const initial = saved === 'dark' ? 'dark' : 'light';
  applyTheme(initial);
})();

// Toggle theme on button click
themeToggle.addEventListener('click', () => {
  const isDark = root.getAttribute('data-theme') === 'dark';
  applyTheme(isDark ? 'light' : 'dark');
});