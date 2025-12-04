const winston = require('winston');
const path = require('path');
const db = require('../config/database');

// Create Winston logger instance
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Write to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Write to file
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/app.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Log security events to database
const logToDatabase = (level, userId, action, ipAddress, userAgent, details) => {
  const query = `
    INSERT INTO logs (level, user_id, action, ip_address, user_agent, details)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [level, userId, action, ipAddress, userAgent, JSON.stringify(details)], (err) => {
    if (err) {
      logger.error('Failed to write to database log:', err.message);
    }
  });
};

// Security event logging functions
const securityLogger = {
  loginSuccess: (req, userId, username) => {
    const message = `Successful login: ${username}`;
    logger.info(message);
    logToDatabase('info', userId, 'login_success', req.ip, req.get('user-agent'), { username });
  },

  loginFailure: (req, email, reason) => {
    const message = `Failed login attempt for: ${email} - ${reason}`;
    logger.warn(message);
    logToDatabase('warn', null, 'login_failure', req.ip, req.get('user-agent'), { email, reason });
  },

  logout: (req, userId, username) => {
    const message = `User logged out: ${username}`;
    logger.info(message);
    logToDatabase('info', userId, 'logout', req.ip, req.get('user-agent'), { username });
  },

  registration: (req, userId, username, email) => {
    const message = `New user registered: ${username}`;
    logger.info(message);
    logToDatabase('info', userId, 'registration', req.ip, req.get('user-agent'), { username, email });
  },

  accessDenied: (req, userId, resource) => {
    const message = `Access denied to ${resource}`;
    logger.warn(message);
    logToDatabase('warn', userId, 'access_denied', req.ip, req.get('user-agent'), { resource });
  },

  adminAction: (req, userId, action, targetId) => {
    const message = `Admin action: ${action} on ${targetId}`;
    logger.info(message);
    logToDatabase('info', userId, `admin_${action}`, req.ip, req.get('user-agent'), { targetId });
  },

  suspiciousActivity: (req, userId, activity, details) => {
    const message = `Suspicious activity detected: ${activity}`;
    logger.warn(message);
    logToDatabase('warn', userId, 'suspicious_activity', req.ip, req.get('user-agent'), { activity, ...details });
  }
};

module.exports = { logger, securityLogger };
