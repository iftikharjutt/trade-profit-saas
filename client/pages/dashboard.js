import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
    const [summary, setSummary] = useState({ totalInvestment: 0, totalRealizedProfit: 0, assets: [] });

    useEffect(() => {
        const fetchSummary = async () => {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/trades/summary', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSummary(res.data);
        };
        fetchSummary();
    }, []);

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Trading Dashboard</h1>
            
            {/* Step 8: Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-white shadow rounded-lg">
                    <p className="text-gray-500 uppercase text-sm">Total Investment</p>
                    <p className="text-2xl font-bold">Rs. {summary.totalInvestment.toLocaleString()}</p>
                </div>
                <div className="p-6 bg-white shadow rounded-lg">
                    <p className="text-gray-500 uppercase text-sm">Realized Profit</p>
                    <p className={`text-2xl font-bold ${summary.totalRealizedProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        Rs. {summary.totalRealizedProfit.toLocaleString()}
                    </p>
                </div>
                <div className="p-6 bg-white shadow rounded-lg">
                    <p className="text-gray-500 uppercase text-sm">Active Assets</p>
                    <p className="text-2xl font-bold">{summary.assets.length}</p>
                </div>
            </div>

            {/* Asset Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
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
                        {summary.assets.map((asset, i) => (
                            <tr key={i}>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{asset.product}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">Rs. {asset.averagePrice.toFixed(2)}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">{asset.currentQuantity}</td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-green-600 font-bold">Rs. {asset.realizedProfit.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
