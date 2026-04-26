const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'your_ultra_secret_key';

// Step 5: Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Routes
const tradeRoutes = require('./routes/trades');
app.use('/api/trades', authenticateToken, tradeRoutes);

app.listen(5000, () => console.log('SaaS Backend running on port 5000'));
