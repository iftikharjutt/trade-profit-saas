"use client";

import React, { useEffect, useState } from 'react';
import { reportService, tradeService } from '@/lib/api';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Activity, DollarSign, Percent, BarChart3,
  Trash2, PlusCircle
} from 'lucide-react';

export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [equityCurve, setEquityCurve] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [reportData, tradeData] = await Promise.all([
          reportService.getSummary(),
          tradeService.getTrades({ limit: 10 })
        ]);
        setSummary(reportData.summary);
        setEquityCurve(reportData.equityCurve);
        setTrades(tradeData.trades);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Trading Analytics</h1>
          <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 transition">
            <PlusCircle size={20} /> Add Trade
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Net Profit" 
            value={`$${summary?.totalNetProfit.toLocaleString()}`} 
            icon={<DollarSign className="text-green-600" />}
            trend={summary?.totalNetProfit >= 0 ? 'up' : 'down'}
          />
          <StatCard 
            title="Win Rate" 
            value={`${summary?.winRate}%`} 
            icon={<Percent className="text-blue-600" />}
          />
          <StatCard 
            title="Avg ROI" 
            value={`${summary?.avgROI}%`} 
            icon={<BarChart3 className="text-purple-600" />}
          />
          <StatCard 
            title="Max Drawdown" 
            value={`$${summary?.maxDrawdown.toLocaleString()}`} 
            icon={<Activity className="text-red-600" />}
          />
        </div>

        {/* Equity Curve */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-bold text-gray-900">Equity Curve</h2>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityCurve}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(str) => new Date(str).toLocaleDateString()}
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip 
                  labelFormatter={(str) => new Date(str).toLocaleDateString()}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#4f46e5" 
                  fillOpacity={1} 
                  fill="url(#colorBalance)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Trades */}
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="border-b px-6 py-4 bg-gray-50/50">
            <h2 className="font-bold text-gray-900">Recent Trades</h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-gray-50/50 text-gray-500">
                <th className="px-6 py-3 font-semibold">Asset</th>
                <th className="px-6 py-3 font-semibold">Type</th>
                <th className="px-6 py-3 font-semibold">Entry/Exit</th>
                <th className="px-6 py-3 font-semibold">PnL</th>
                <th className="px-6 py-3 font-semibold">ROI</th>
                <th className="px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade.id} className="border-b hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">{trade.asset_name}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded px-2 py-0.5 text-xs font-bold ${
                      trade.position_type === 'LONG' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {trade.position_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {trade.entry_price} / {trade.exit_price || '-'}
                  </td>
                  <td className={`px-6 py-4 font-bold ${
                    trade.pnl_net >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trade.pnl_net ? `$${trade.pnl_net.toLocaleString()}` : '-'}
                  </td>
                  <td className={`px-6 py-4 font-bold ${
                    trade.pnl_percent >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trade.pnl_percent ? `${trade.pnl_percent}%` : '-'}
                  </td>
                  <td className="px-6 py-4 capitalize">{trade.status.toLowerCase()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: any) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="rounded-lg bg-gray-100 p-2">{icon}</div>
        {trend && (
          <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
            {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
