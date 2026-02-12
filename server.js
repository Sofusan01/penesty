const app = require('./app');
const PORT = process.env.PORT || 3000;

// IMPORTANT: bind 0.0.0.0 for production
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});