"use client";

import React, { useEffect, useState } from 'react';
import { reportService, tradeService } from '@/lib/api';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { EquityCurve } from '@/components/dashboard/EquityCurve';
import { TradeList } from '@/components/dashboard/TradeList';
import { RiskAssessment } from '@/components/dashboard/RiskAssessment';
import { PlusCircle, Activity, Zap, Brain, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null);
  const [equityCurve, setEquityCurve] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [psychology, setPsychology] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [reportData, tradeData] = await Promise.all([
          reportService.getSummary(),
          tradeService.getTrades({ limit: 10 }),
        ]);
        setSummary(reportData.summary);
        setEquityCurve(reportData.equityCurve);
        setPsychology(reportData.psychology);
        setTrades(tradeData.trades);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, []);

  if (loading && !summary) return (
    <div className="flex h-screen items-center justify-center bg-[#0a0a0b] text-white">
        <div className="text-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
            <p className="mt-6 font-black text-xl tracking-tighter uppercase italic">Syncing Position Engine...</p>
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
                <span className="text-xl font-black tracking-tighter italic">TRADE<span className="text-indigo-500">OPS</span></span>
            </div>
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                    <Zap size={14} className="text-indigo-400" />
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Enterprise Engine</span>
                </div>
                <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg">JD</div>
            </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 pt-10 space-y-10">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight italic uppercase">Command Center</h1>
            <p className="text-gray-500 font-medium mt-1">Advanced position intelligence and behavioral analytics.</p>
          </div>
          
          <button className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-sm font-black text-white hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20 active:scale-95 uppercase tracking-widest">
            <PlusCircle size={20} /> Execute Order
          </button>
        </header>

        <StatsGrid summary={summary} />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-10">
                <div className="bg-gray-900/20 rounded-3xl border border-gray-800 p-8 shadow-2xl">
                    <EquityCurve data={equityCurve} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Psychological Insight Card */}
                    <div className="rounded-3xl border border-gray-800 bg-gray-900/40 p-8 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                                <Brain size={24} />
                            </div>
                            <h2 className="font-black text-white text-lg tracking-tight uppercase italic">Cognitive Insights</h2>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Current Streak</span>
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-black ${psychology?.streak?.type === 'WIN' ? 'text-green-500' : 'text-red-500'}`}>
                                        {psychology?.streak?.count} {psychology?.streak?.type}S
                                    </span>
                                    {psychology?.streak?.type === 'WIN' ? <TrendingUp size={16} className="text-green-500" /> : <TrendingDown size={16} className="text-red-500" />}
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                                <p className="text-sm leading-relaxed text-gray-300 italic font-medium">
                                    "{psychology?.insights}"
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Behavior Alert Card */}
                    <div className="rounded-3xl border border-gray-800 bg-gray-900/40 p-8 shadow-xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                                <AlertCircle size={24} />
                            </div>
                            <h2 className="font-black text-white text-lg tracking-tight uppercase italic">Behavioral Alerts</h2>
                        </div>
                        <div className="space-y-4">
                            <BehaviorItem 
                                label="Discipline Score" 
                                value={`${psychology?.behavior?.disciplineScore}/100`} 
                                status={psychology?.behavior?.disciplineScore > 70 ? 'GOOD' : 'CRITICAL'} 
                            />
                            <BehaviorItem 
                                label="Loss Chasing" 
                                value={psychology?.behavior?.chasingLosses ? 'DETECTED' : 'NONE'} 
                                status={psychology?.behavior?.chasingLosses ? 'CRITICAL' : 'GOOD'} 
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900/40 rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
                    <TradeList trades={trades} />
                </div>
            </div>
            
            <div className="space-y-10">
                <RiskAssessment riskData={{ averageRiskScore: psychology?.behavior?.disciplineScore, assessments: [] }} />
                
                <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-indigo-600 to-purple-700 p-8 shadow-2xl shadow-indigo-600/10">
                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">Edge Finder</h2>
                    <p className="text-white/70 text-sm font-medium leading-relaxed">
                        Our position engine has identified that your 4H LONG trades have a 68% higher win rate than your scalps.
                    </p>
                    <button className="mt-6 w-full py-3 bg-white text-indigo-700 font-black rounded-xl text-xs uppercase tracking-widest hover:bg-gray-100 transition shadow-xl">
                        Unlock Advanced Insights
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function BehaviorItem({ label, value, status }: any) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</span>
            <div className="flex items-center gap-2">
                <span className={`text-sm font-black ${status === 'GOOD' ? 'text-green-500' : 'text-red-500'}`}>{value}</span>
                <div className={`h-1.5 w-1.5 rounded-full ${status === 'GOOD' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>
        </div>
    )
}
