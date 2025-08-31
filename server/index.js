// Load environment variables
require('dotenv').config();

const express = require('express');
const path = require('path');
const app = express();


const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// app.use(express.json());
// app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});


// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'OK', time: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));