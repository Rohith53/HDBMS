import { existsSync, mkdirSync, appendFileSync, renameSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of the current module (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LOG_DIR = join(__dirname, '../../logs');
const LOG_FILE = join(LOG_DIR, 'app.log');
const MAX_LOG_SIZE = 5 * 1024 * 1024; // 5 MB for log rotation

// Create logs directory if it doesn't exist
if (!existsSync(LOG_DIR)) {
    mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Rotates the log file if it exceeds the maximum size.
 */
function rotateLogFile() {
    try {
        if (existsSync(LOG_FILE) && statSync(LOG_FILE).size > MAX_LOG_SIZE) {
            const timestamp = new Date().toISOString().replace(/:/g, '-');
            const rotatedLogFile = join(LOG_DIR, `app-${timestamp}.log`);
            renameSync(LOG_FILE, rotatedLogFile);
        }
    } catch (error) {
        console.error('Log rotation failed:', error);
    }
}

/**
 * Logger class for logging messages.
 */
class Logger {
    static logLevel = {
        INFO: 'INFO',
        WARNING: 'WARNING',
        ERROR: 'ERROR'
    };

    /**
     * Logs a message to file and console.
     * @param {string} message - The message to log.
     * @param {string} level - Log level (INFO, WARNING, ERROR).
     */
    static log(message, level = Logger.logLevel.INFO) {
        rotateLogFile();

        const timestamp = new Date().toISOString();
        const logMessage = `${timestamp} [${level}]: ${message}\n`;

        // Write log message to file
        try {
            appendFileSync(LOG_FILE, logMessage);
        } catch (err) {
            console.error('Failed to write to log file:', err);
        }

        // Output to console
        console.log(logMessage);
    }

    /**
     * Logs an info message.
     * @param {string} message - The message to log.
     */
    static info(message) {
        Logger.log(message, Logger.logLevel.INFO);
    }

    /**
     * Logs a warning message.
     * @param {string} message - The message to log.
     */
    static warn(message) {
        Logger.log(message, Logger.logLevel.WARNING);
    }

    /**
     * Logs an error message.
     * @param {string | Error} message - The error message or Error object to log.
     */
    static error(message) {
        if (message instanceof Error) {
            Logger.log(`${message.message}\nStack Trace: ${message.stack}`, Logger.logLevel.ERROR);
        } else {
            Logger.log(message, Logger.logLevel.ERROR);
        }
    }
}

export const { info, warn, error } = Logger; // Export as named functions
export default Logger;
