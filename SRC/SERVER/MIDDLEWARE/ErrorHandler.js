import Logger from '../UTILS/Logger.js'; // Ensure the path and case are correct

// Custom error class for better error management
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Identifies if the error is operational or programming error
    }
}

// Middleware for handling errors
export const errorHandler = (err, req, res, next) => {
    // Set default values for response
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    // Log the error using Logger.error() method
    Logger.error(`${err.statusCode}: ${err.message}`);

    // Send response to client
    res.status(err.statusCode).json({
        status: 'error',
        statusCode: err.statusCode,
        message: err.message,
        // Optionally include stack trace in development mode only
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    Logger.error(`Unhandled Rejection: ${err.message}`);
    console.error('Unhandled Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    Logger.error(`Uncaught Exception: ${err.message}`);
    console.error('Uncaught Exception:', err);
});

export { AppError };
