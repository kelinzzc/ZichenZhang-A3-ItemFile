const express = require('express');
const path = require('path');
const app = express();
const PORT = 3001;

// Static files
app.use(express.static('.'));

// Admin side
app.get('/admin-side*', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-side', 'index.html'));
});

// Client side
app.get('/client-side*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client-side', 'index.html'));
});

app.get('/', (req, res) => {
    res.redirect('/client-side/');
});

app.listen(PORT, () => {
    console.log('Frontend server started successfully');
    console.log(`Client: http://localhost:${PORT}/client-side/`);
    console.log(`Admin: http://localhost:${PORT}/admin-side/`);
    console.log(`API Test: http://localhost:${PORT}/test-api.html`);
});