import React from 'react';
import { DollarSign, Percent, BarChart3, Activity, TrendingUp, TrendingDown, Target, ShieldAlert } from 'lucide-react';

interface StatsGridProps {
    summary: any;
}

export const StatsGrid = ({ summary }: StatsGridProps) => {
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Net Profit" 
            value={`$${summary?.totalNetProfit?.toLocaleString()}`} 
            icon={<DollarSign className="text-green-600" />}
            trend={summary?.totalNetProfit >= 0 ? 'up' : 'down'}
            subtitle="Realized PnL"
          />
          <StatCard 
            title="Profit Factor" 
            value={summary?.profitFactor || '0.00'} 
            icon={<Target className="text-blue-600" />}
            subtitle="Gross Win / Gross Loss"
          />
          <StatCard 
            title="Expectancy" 
            value={`$${summary?.expectancy || '0.00'}`} 
            icon={<BarChart3 className="text-purple-600" />}
            subtitle="Avg profit per trade"
          />
          <StatCard 
            title="Max Drawdown" 
            value={`$${summary?.maxDrawdown?.toLocaleString()}`} 
            icon={<ShieldAlert className="text-red-600" />}
            subtitle="Peak-to-valley dip"
          />
        </div>
    );
};

function StatCard({ title, value, icon, trend, subtitle }: any) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="rounded-lg bg-gray-50 p-2">{icon}</div>
        {trend && (
          <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
            {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{title}</p>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}
