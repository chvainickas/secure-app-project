# Secure Task Manager

A Personal Task Manager web application demonstrating secure application programming practices. This project contains two branches showcasing vulnerable (insecure) and hardened (secure) implementations.

## Project Overview

This application allows users to:
- Register and login to their account
- Create, read, update, and delete personal tasks
- Search tasks by title or description
- Admin users can manage all users and tasks

## Technology Stack

- **Backend:** Node.js, Express.js
- **Database:** SQLite3
- **Templating:** EJS
- **Authentication:** Session-based with express-session

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm

### Quick Start

```bash
# Clone the repository
git clone https://github.com/chvainickas/secure-app-project.git
cd secure-app-project

# Run the initialization script
./init.sh
```

Or manually:

```bash
# Install dependencies
npm install

# Initialize the database
npm run init-db

# Start the application
npm start
```

The application will be available at **http://localhost:3000**

### Default Credentials

- **Email:** admin@example.com
- **Password:** admin123

## Branch Structure

### Insecure Branch

Contains intentional security vulnerabilities for educational purposes:

| Vulnerability | Location | OWASP Category |
|--------------|----------|----------------|
| SQL Injection (login) | `src/controllers/authController.js` | A03:2021 Injection |
| SQL Injection (search) | `src/controllers/taskController.js` | A03:2021 Injection |
| Plain Text Passwords | `src/controllers/authController.js` | A02:2021 Cryptographic Failures |
| Reflected XSS | `src/views/search-results.ejs` | A03:2021 Injection |
| Stored XSS | `src/views/tasks.ejs` | A03:2021 Injection |
| DOM-based XSS | `public/js/app.js` | A03:2021 Injection |
| Broken Access Control | `src/routes/admin.js` | A01:2021 Broken Access Control |

### Secure Branch

Contains security fixes and hardening measures:

| Security Measure | Implementation |
|-----------------|----------------|
| SQL Injection Prevention | Parameterized queries with `?` placeholders |
| Password Hashing | bcrypt with cost factor 12 |
| XSS Prevention | EJS auto-escaping with `<%= %>` |
| CSRF Protection | csurf middleware with hidden tokens |
| Access Control | requireAdmin middleware |
| Session Security | HttpOnly, SameSite, secure cookies, session regeneration |
| Security Headers | Helmet.js (CSP, X-Frame-Options, etc.) |
| Logging | Winston logger for security events |

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment (development/production) | development |
| SESSION_SECRET | Session encryption key | (generated) |

### Database

SQLite database is stored at `database.sqlite3` in the project root.

Tables:
- `users` - User accounts (id, username, email, password, role)
- `tasks` - User tasks (id, user_id, title, description, timestamps)
- `sessions` - Session storage
- `logs` - Security event logs

## Testing Vulnerabilities (Insecure Branch)

```bash
# Switch to insecure branch
git checkout insecure
./init.sh
```

### SQL Injection Test

```bash
# Bypass authentication
curl -X POST http://localhost:3000/auth/login \
  -d "email=' OR '1'='1' --&password=anything"
```

### XSS Test

1. **Reflected XSS:** Search for `<script>alert('XSS')</script>`
2. **Stored XSS:** Create task with title `<script>alert('XSS')</script>`
3. **DOM XSS:** Visit `http://localhost:3000/tasks?message=<img src=x onerror=alert(1)>`

### Broken Access Control Test

Login as regular user, then visit `http://localhost:3000/admin`

## Security Dependencies (Secure Branch)

```json
{
  "bcrypt": "Password hashing",
  "helmet": "Security headers",
  "csurf": "CSRF protection",
  "winston": "Security logging",
  "express-validator": "Input validation",
  "cookie-parser": "Secure cookie handling"
}
```

## Project Structure

```
secure-app-project/
├── src/
│   ├── config/
│   │   └── initDb.js          # Database initialization
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   ├── taskController.js  # Task CRUD operations
│   │   └── adminController.js # Admin panel logic
│   ├── routes/
│   │   ├── auth.js            # Auth routes
│   │   ├── tasks.js           # Task routes
│   │   └── admin.js           # Admin routes
│   ├── utils/
│   │   └── logger.js          # Winston security logger
│   ├── views/
│   │   ├── login.ejs
│   │   ├── register.ejs
│   │   ├── tasks.ejs
│   │   ├── new-task.ejs
│   │   ├── edit-task.ejs
│   │   ├── search-results.ejs
│   │   └── admin.ejs
│   └── server.js              # Express application
├── public/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── logs/                       # Log files (secure branch)
├── package.json
├── init.sh                     # Initialization script
└── README.md
```

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm run init-db` | Initialize/reset database |

## License

ISC
