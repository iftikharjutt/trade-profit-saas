import React, { useEffect, useState } from 'react';
import { reportService } from '../services/api';

const Dashboard = () => {
    const [summary, setSummary] = useState({ 
        totalInvestment: 0, 
        totalRealizedProfit: 0, 
        activeAssetsCount: 0 
    });
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const data = await reportService.getSummary();
                setSummary(data.summary);
                setAssets(data.assets);
            } catch (err) {
                console.error("Dashboard Load Error:", err);
                setError("Failed to load dashboard data. Please check your connection.");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <div className="p-6 text-center">Loading production data...</div>;
    if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Trading Dashboard</h1>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-white shadow rounded-lg border-l-4 border-blue-500">
                    <p className="text-gray-500 uppercase text-sm font-semibold">Total Investment</p>
                    <p className="text-2xl font-bold">Rs. {summary.totalInvestment.toLocaleString()}</p>
                </div>
                <div className="p-6 bg-white shadow rounded-lg border-l-4 border-green-500">
                    <p className="text-gray-500 uppercase text-sm font-semibold">Realized Profit</p>
                    <p className={`text-2xl font-bold ${summary.totalRealizedProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Rs. {summary.totalRealizedProfit.toLocaleString()}
                    </p>
                </div>
                <div className="p-6 bg-white shadow rounded-lg border-l-4 border-purple-500">
                    <p className="text-gray-500 uppercase text-sm font-semibold">Active Assets</p>
                    <p className="text-2xl font-bold">{summary.activeAssetsCount}</p>
                </div>
            </div>

            {/* Asset Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                    <h2 className="text-lg font-bold">Your Positions</h2>
                </div>
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Asset</th>
                            <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Avg Price</th>
                            <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                            <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase">Realized Profit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.length > 0 ? assets.map((asset, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm font-medium">{asset.product}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">Rs. {asset.avgPrice.toFixed(2)}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{asset.quantity}</td>
                                <td className={`px-5 py-5 border-b border-gray-200 bg-white text-sm font-bold ${asset.realizedProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    Rs. {asset.realizedProfit.toFixed(2)}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center text-gray-500">
                                    No trades found. Start by adding a trade.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
