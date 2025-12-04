import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, PiggyBank, Wallet, CreditCard, RefreshCw } from 'lucide-react';
import { FinancialTip } from '../../types';
import { getFinancialWisdom } from '../../services/api';

const ICON_MAP = {
    PiggyBank: <PiggyBank size={20} />,
    TrendingUp: <TrendingUp size={20} />,
    DollarSign: <DollarSign size={20} />,
    Wallet: <Wallet size={20} />,
    CreditCard: <CreditCard size={20} />
};

interface FinancialWisdomProps {
    onBack: () => void;
}

const FinancialWisdom: React.FC<FinancialWisdomProps> = ({ onBack }) => {
    const [tips, setTips] = useState<FinancialTip[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchWisdom = async () => {
        try {
            const data = await getFinancialWisdom();
            if (data && data.tips) {
                setTips(data.tips);
            }
        } catch (error) {
            console.error("Failed to fetch financial wisdom", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchWisdom();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchWisdom();
    };

    return (
        <div className="space-y-6 animate-fade-in text-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sage-600 cursor-pointer" onClick={onBack}>
                    <div className="w-8 h-8 rounded-full bg-sage-50 flex items-center justify-center">←</div>
                    <span className="font-semibold text-sm">Back to Learn</span>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing || loading}
                    className="p-2 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
                </button>
            </div>

            <div className="text-center mb-6">
                <h2 className="text-2xl font-serif text-emerald-700">Financial Wisdom</h2>
                <p className="text-gray-500 text-sm">Planning for a secure future</p>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-50 animate-pulse">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-emerald-50 rounded-full shrink-0"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-emerald-50 rounded w-3/4"></div>
                                    <div className="h-3 bg-emerald-50 rounded w-full"></div>
                                    <div className="h-3 bg-emerald-50 rounded w-5/6"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {tips.map(tip => (
                        <div key={tip.id} className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-50 hover:border-emerald-200 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                                    {ICON_MAP[tip.icon] || <DollarSign size={20} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-2">{tip.title}</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">{tip.content}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center mt-6">
                <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider">Did you know?</p>
                <p className="text-sm text-emerald-700 mt-1">Planning activities stimulate the prefrontal cortex, keeping your mind sharp.</p>
            </div>
        </div>
    );
};

export default FinancialWisdom;
