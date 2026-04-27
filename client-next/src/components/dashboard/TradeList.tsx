import React from 'react';

interface TradeListProps {
    trades: any[];
}

export const TradeList = ({ trades }: TradeListProps) => {
    return (
        <div className="rounded-xl border border-gray-800 bg-gray-900/40 shadow-sm overflow-hidden">
          <div className="border-b border-gray-800 px-6 py-4 bg-gray-800/50">
            <h2 className="font-black text-white uppercase italic tracking-tight">Position History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/50 text-gray-500">
                  <th className="px-6 py-3 font-black uppercase tracking-widest text-[10px]">Asset</th>
                  <th className="px-6 py-3 font-black uppercase tracking-widest text-[10px]">Side</th>
                  <th className="px-6 py-3 font-black uppercase tracking-widest text-[10px]">Avg Entry/Exit</th>
                  <th className="px-6 py-3 font-black uppercase tracking-widest text-[10px]">Realized PnL</th>
                  <th className="px-6 py-3 font-black uppercase tracking-widest text-[10px]">Executions</th>
                  <th className="px-6 py-3 font-black uppercase tracking-widest text-[10px]">Status</th>
                </tr>
              </thead>
              <tbody>
                {trades.length > 0 ? trades.map((position) => (
                  <tr key={position.id} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-black text-white">{position.asset_symbol}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-md px-2 py-1 text-[10px] font-black tracking-widest ${
                        position.side === 'LONG' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>
                        {position.side}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">
                      {position.avg_entry_price.toFixed(2)} / {position.avg_exit_price?.toFixed(2) || '-'}
                    </td>
                    <td className={`px-6 py-4 font-black ${
                      position.realized_pnl >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {position.realized_pnl ? `$${position.realized_pnl.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-6 py-4">
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
                            {position.executions?.length || 0} FILL{position.executions?.length !== 1 ? 'S' : ''}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`text-[10px] font-black tracking-widest ${position.status === 'CLOSED' ? 'text-gray-500' : 'text-indigo-400 animate-pulse'}`}>
                            {position.status}
                        </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500 font-bold italic">
                      No positions detected in the current regime.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
    );
};
