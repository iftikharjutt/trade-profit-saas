import React from 'react';

interface TradeListProps {
    trades: any[];
}

export const TradeList = ({ trades }: TradeListProps) => {
    return (
        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="border-b px-6 py-4 bg-gray-50/50">
            <h2 className="font-bold text-gray-900">Recent Trades</h2>
          </div>
          <div className="overflow-x-auto">
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
                {trades.length > 0 ? trades.map((trade) => (
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
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      No recent trades to display.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
    );
};
