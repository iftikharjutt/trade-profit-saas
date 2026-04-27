import React from 'react';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

interface RiskAssessmentProps {
    riskData: any;
}

export const RiskAssessment = ({ riskData }: RiskAssessmentProps) => {
    if (!riskData) return null;

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBg = (score: number) => {
        if (score >= 80) return 'bg-green-50';
        if (score >= 50) return 'bg-yellow-50';
        return 'bg-red-50';
    };

    const getIcon = (score: number) => {
        if (score >= 80) return <ShieldCheck className="text-green-600" />;
        if (score >= 50) return <Shield className="text-yellow-600" />;
        return <ShieldAlert className="text-red-600" />;
    };

    return (
        <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg ${getScoreBg(riskData.averageRiskScore)}`}>
                    {getIcon(riskData.averageRiskScore)}
                </div>
                <div>
                    <h2 className="font-bold text-gray-900 text-lg">Risk Intelligence</h2>
                    <p className="text-xs text-gray-500 font-medium">Composite score based on your risk management</p>
                </div>
            </div>

            <div className="flex items-center justify-center mb-8">
                <div className="relative flex items-center justify-center">
                    <svg className="w-32 h-32 transform -rotate-90">
                        <circle
                            cx="64"
                            cy="64"
                            r="58"
                            stroke="currentColor"
                            strokeWidth="10"
                            fill="transparent"
                            className="text-gray-100"
                        />
                        <circle
                            cx="64"
                            cy="64"
                            r="58"
                            stroke="currentColor"
                            strokeWidth="10"
                            fill="transparent"
                            strokeDasharray={364.4}
                            strokeDashoffset={364.4 - (364.4 * riskData.averageRiskScore) / 100}
                            className={`${getScoreColor(riskData.averageRiskScore)} transition-all duration-1000 ease-out`}
                        />
                    </svg>
                    <span className={`absolute text-3xl font-black ${getScoreColor(riskData.averageRiskScore)}`}>
                        {Math.round(riskData.averageRiskScore)}
                    </span>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Recent Executions</h3>
                {riskData.assessments.slice(0, 3).map((a: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b last:border-0 border-gray-50">
                        <span className="text-sm font-medium text-gray-700">{a.asset}</span>
                        <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full ${getScoreColor(a.score).replace('text', 'bg')}`} 
                                    style={{ width: `${a.score}%` }}
                                />
                            </div>
                            <span className={`text-xs font-bold w-6 text-right ${getScoreColor(a.score)}`}>{a.score}</span>
                        </div>
                    </div>
                ))}
            </div>
            
            <button className="w-full mt-6 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-black transition-colors">
                View Risk Strategy
            </button>
        </div>
    );
};
