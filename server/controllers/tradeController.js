const db = require('../db'); // Assume a DB helper is configured
const { calculatePosition } = require('../services/profitService');

exports.getTrades = async (req, res) => {
    try {
        const userId = req.user.id; // From JWT middleware
        const trades = await db.all('SELECT * FROM trades WHERE user_id = ? ORDER BY date DESC', [userId]);
        res.json(trades);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch trades" });
    }
};

exports.addTrade = async (req, res) => {
    const { product_name, type, price, quantity } = req.body;
    const userId = req.user.id;

    if (!product_name || !type || !price || !quantity) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        await db.run(
            'INSERT INTO trades (user_id, product_name, type, price, quantity) VALUES (?, ?, ?, ?, ?)',
            [userId, product_name, type, price, quantity]
        );
        res.status(201).json({ message: "Trade recorded successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to record trade" });
    }
};

exports.getPortfolioSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const trades = await db.all('SELECT * FROM trades WHERE user_id = ?', [userId]);
        
        // Group trades by product
        const products = [...new Set(trades.map(t => t.product_name))];
        const summary = products.map(p => {
            const productTrades = trades.filter(t => t.product_name === p);
            return {
                product: p,
                ...calculatePosition(productTrades)
            };
        });

        const totalRealizedProfit = summary.reduce((sum, s) => sum + s.realizedProfit, 0);
        const totalInvestment = summary.reduce((sum, s) => sum + (s.currentQuantity * s.averagePrice), 0);

        res.json({
            totalInvestment,
            totalRealizedProfit,
            assets: summary
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to calculate summary" });
    }
};
