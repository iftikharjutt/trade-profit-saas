/**
 * Profit Service - The Core Engine
 * Handles Weighted Average Price and Realized Profit
 */

const calculatePosition = (trades) => {
    let quantity = 0;
    let avgPrice = 0;
    let realizedProfit = 0;

    for (const trade of trades) {
        if (trade.type === "BUY") {
            // Weighted Average Price: (Old Total Cost + New Cost) / Total Qty
            const totalCost = (avgPrice * quantity) + (trade.price * trade.quantity);
            quantity += trade.quantity;
            avgPrice = quantity > 0 ? totalCost / quantity : 0;
        }

        if (trade.type === "SELL") {
            // Profit = (Sell Price - Purchase Avg Price) * Qty Sold
            const profit = (trade.price - avgPrice) * trade.quantity;
            realizedProfit += profit;
            quantity -= trade.quantity;
        }
    }

    return { 
        currentQuantity: quantity, 
        averagePrice: avgPrice, 
        realizedProfit: realizedProfit 
    };
};

module.exports = { calculatePosition };
