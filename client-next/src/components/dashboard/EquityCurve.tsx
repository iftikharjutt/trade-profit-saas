import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EquityCurveProps {
    data: any[];
}

export const EquityCurve = ({ data }: EquityCurveProps) => {
    return (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-bold text-gray-900">Equity Curve</h2>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
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
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
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
    );
};
