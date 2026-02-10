const app = require('./app');
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('----------------------------------------------------');
    console.log(`Server is running!`);
    console.log(`- Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`- Port: ${PORT}`);
    console.log(`- Address: 0.0.0.0 (External access enabled)`);
    console.log('----------------------------------------------------');
});

// Process-level error handling
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // In production, you might want to log this to an external service
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    // Give the server time to finish current requests before exiting
    process.exit(1);
});

// Graceful Shutdown
const shutdown = () => {
    console.log('Shutting down server...');
    server.close(() => {
        console.log('Server closed. Exiting process.');
        process.exit(0);
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
