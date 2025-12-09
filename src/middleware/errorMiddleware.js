// src/middleware/errorMiddleware.js

/**
 * 404 Not Found handler
 * Catches all requests to undefined routes
 */
function notFoundHandler(req, res, next) {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
}

/**
 * Global error handler
 * Catches all errors thrown in the application
 * Hides sensitive information in production
 */
function errorHandler(err, req, res, next) {
    // Log error for debugging (server-side only)
    console.error('='.repeat(80));
    console.error('ERROR OCCURRED:');
    console.error('Message:', err.message);
    console.error('URL:', req.originalUrl);
    console.error('Method:', req.method);
    console.error('IP:', req.ip);
    console.error('Timestamp:', new Date().toISOString());
    if (process.env.NODE_ENV === 'development') {
        console.error('Stack:', err.stack);
    }
    console.error('='.repeat(80));

    // Default to 500 server error
    const statusCode = err.statusCode || 500;

    // Determine if we should show detailed error
    const isDevelopment = process.env.NODE_ENV === 'development';

    // In production, hide sensitive error details
    const errorResponse = {
        success: false,
        message: isDevelopment ? err.message : (statusCode === 500 ? 'Internal Server Error' : err.message)
    };

    // Only include stack trace in development
    if (isDevelopment && err.stack) {
        errorResponse.stack = err.stack;
    }

    // Only include error details in development
    if (isDevelopment && err.details) {
        errorResponse.details = err.details;
    }

    res.status(statusCode).json(errorResponse);
}

module.exports = {
    notFoundHandler,
    errorHandler
};
