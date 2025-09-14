// Basic Express + EJS setup
const path = require('path');
const express = require('express');

const app = express();

// Set view engine to EJS and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Serve static files from /public
app.use(express.static(path.join(__dirname, '..', 'public')));

// Optional: globals available in all templates
app.locals.siteName = 'NutriScan';

// Per-request locals (e.g., current path)
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

// Routes
app.get('/', (req, res) => {
  // Example data to pass to the page
  const user = { name: 'user' };
  res.render('pages/index', { title: 'Home', user });
});

app.get('/profile', (req, res) => {
  const user = { name: 'user' };
  res.render('pages/profile', { title: 'Profile', user });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
