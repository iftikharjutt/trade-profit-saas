"use client";

import React, { useEffect, useState } from 'react';
import { reportService, tradeService, portfolioService } from '@/lib/api';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { EquityCurve } from '@/components/dashboard/EquityCurve';
import { TradeList } from '@/components/dashboard/TradeList';
import { RiskAssessment } from '@/components/dashboard/RiskAssessment';
import { PlusCircle, Wallet, Activity, ArrowUpRight, Zap } from 'lucide-react';

export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [equityCurve, setEquityCurve] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [riskData, setRiskData] = useState<any>(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [reportData, tradeData, portfolioData, riskResp] = await Promise.all([
          reportService.getSummary(),
          tradeService.getTrades({ limit: 10 }),
          portfolioService.getPortfolios(),
          reportService.getRiskAssessment().catch(() => null) // May fail if not PRO
        ]);
        setSummary(reportData.summary);
        setEquityCurve(reportData.equityCurve);
        setTrades(tradeData.trades);
        setPortfolios(portfolioData);
        setRiskData(riskResp);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  const handlePortfolioChange = async (id: string) => {
    setSelectedPortfolio(id);
    setLoading(true);
    try {
        const params = id === "all" ? { limit: 10 } : { portfolio_id: id, limit: 10 };
        const tradeData = await tradeService.getTrades(params);
        setTrades(tradeData.trades);
    } catch (err) {
        console.error("Filter error:", err);
    } finally {
        setLoading(false);
    }
  };

  if (loading && !summary) return (
    <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
            <p className="mt-6 font-bold text-xl tracking-tight">SECURING EXCHANGE DATA...</p>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white pb-12">
      <nav className="border-b border-gray-800 bg-[#0a0a0b]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="rounded bg-indigo-600 p-1.5 text-white shadow-lg shadow-indigo-500/20">
                    <Activity size={20} />
                </div>
                <span className="text-xl font-black tracking-tighter italic">TRADE<span className="text-indigo-500 italic">OPS</span></span>
            </div>
            <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                    <Zap size={14} className="text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-300 uppercase">Pro Access</span>
                </div>
                <button className="text-sm font-bold text-gray-400 hover:text-white transition-colors">ACCOUNT</button>
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black shadow-lg">JD</div>
            </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 pt-10 space-y-10">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between bg-gray-800/20 p-8 rounded-3xl border border-gray-800 shadow-2xl">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live Performance Terminal</p>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Intelligence Dashboard</h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative group">
                <select 
                    value={selectedPortfolio}
                    onChange={(e) => handlePortfolioChange(e.target.value)}
                    className="appearance-none rounded-xl border border-gray-700 bg-gray-900 pl-11 pr-11 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all hover:border-gray-600 cursor-pointer shadow-xl"
                >
                    <option value="all">ALL PORTFOLIOS</option>
                    {portfolios.map(p => (
                        <option key={p.id} value={p.id}>{p.name.toUpperCase()}</option>
                    ))}
                </select>
                <Wallet className="absolute left-4 top-3.5 text-indigo-400" size={18} />
                <ArrowUpRight className="absolute right-4 top-3.5 text-gray-500 group-hover:text-indigo-400 transition-colors" size={18} />
            </div>

            <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-black text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20 active:scale-95">
                <PlusCircle size={20} /> EXECUTE TRADE
            </button>
          </div>
        </header>

        <StatsGrid summary={summary} />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-10">
                <div className="bg-gray-900/40 p-1 rounded-3xl border border-gray-800">
                    <EquityCurve data={equityCurve} />
                </div>
                <div className="bg-gray-900/40 p-1 rounded-3xl border border-gray-800">
                    <TradeList trades={trades} />
                </div>
            </div>
            
            <div className="space-y-10">
                <RiskAssessment riskData={riskData} />

                {/* Performance Analytics Card */}
                <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-8 shadow-xl">
                    <h2 className="font-black text-white text-lg mb-6 tracking-tight uppercase italic">Strategy Integrity</h2>
                    <div className="space-y-6">
                        <MetricRow label="Trade Expectancy" value={`$${summary?.expectancy || '0.00'}`} sub="Profit/Trade" />
                        <MetricRow label="Profit Factor" value={summary?.profitFactor || '0.00'} sub="Win/Loss Ratio" />
                        <MetricRow label="Total Executions" value={summary?.totalTrades || '0'} sub="Volume" />
                    </div>
                    <div className="mt-10 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                        <p className="text-xs font-bold text-indigo-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                            <Activity size={14} /> AI Recommendation
                        </p>
                        <p className="text-[13px] leading-relaxed text-gray-300">
                            Your <span className="text-indigo-400 font-bold">Expectancy</span> is positive. Maintain current leverage. Strategy shows high resilience in current market regime.
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function MetricRow({ label, value, sub }: any) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-bold text-white tracking-tight">{label}</p>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-0.5">{sub}</p>
            </div>
            <span className="text-xl font-black text-indigo-400 tabular-nums">{value}</span>
        </div>
    )
}
