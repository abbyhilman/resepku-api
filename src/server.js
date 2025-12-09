// Import library
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const { initializeDatabase } = require('./config/migrations');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');
const { generalLimiter } = require('./middleware/rateLimiter.middleware');

// Inisialisasi App
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// 1. Helmet - Set security headers
app.use(helmet({
    contentSecurityPolicy: false, // Disable for now to avoid conflicts, can enable later
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    },
    frameguard: {
        action: 'deny' // Prevent clickjacking
    },
    noSniff: true, // Prevent MIME type sniffing
}));

// 2. CORS Configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*', // In production, set specific origins in .env
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));

// 3. Body Parser with size limits (prevent large payload attacks)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Note: mongoSanitize and hpp middleware removed due to compatibility issues with Express 5.x
// They were causing "Cannot set property query" errors
// Alternative protection:
// - SQL injection: Already protected via parameterized queries
// - Parameter pollution: Handled by input validation middleware

// 6. General Rate Limiting (100 requests per 15 minutes)
app.use('/api/', generalLimiter);

// 7. Request Logging (for debugging)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// ============================================
// ROUTES
// ============================================

// --- Import Routes ---
const authRoutes = require('./routes/auth.routes');
const recipesRoutes = require('./routes/recipes.routes');
const searchRoutes = require('./routes/search.routes');
const interactionRoutes = require('./routes/interaction.routes');
const usersRoutes = require('./routes/users.routes');

// --- Register Routes ---
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/recipes', recipesRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1', interactionRoutes); // For /recipes/:id/reviews and /users/saved
app.use('/api/v1/users', usersRoutes); // User management endpoints

// --- Route Testing Dasar ---
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to the Recipe API v1',
        version: '1.0.0',
        // endpoints: {
        //     auth: '/api/v1/auth',
        //     recipes: '/api/v1/recipes',
        //     search: '/api/v1/search',
        //     reviews: '/api/v1/recipes/:id/reviews',
        //     saved: '/api/v1/users/saved'
        // }
    });
});

// ============================================
// ERROR HANDLING
// ============================================

// --- Middleware Error Handling ---
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
    try {
        // Initialize database tables
        await initializeDatabase();

        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📊 Database: ${process.env.DB_NAME} at ${process.env.DB_HOST}`);
            console.log(`🔗 API Documentation: http://localhost:${PORT}/`);
            console.log(`🔒 Security: Helmet, Rate Limiting, XSS Protection enabled`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();