// Entry point for Express server
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session');
const routes = require('./routes/submissions');
const { errorHandler } = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers and CORS
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN, credentials: true }));
// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// Session for DSpace auth
app.use(
  session({
    name: 'DSpaceSession',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);
// API routes
app.use('/api/submissions', routes);
// Error handler
app.use(errorHandler);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));