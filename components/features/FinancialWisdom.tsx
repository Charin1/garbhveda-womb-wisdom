import React from 'react';
import { TrendingUp, DollarSign, PiggyBank } from 'lucide-react';

const FINANCE_TIPS = [
    {
        id: 'budgeting',
        title: 'Baby Budgeting 101',
        content: 'Start by listing one-time costs (crib, stroller) vs recurring costs (diapers, formula). Set aside 10% of monthly income for the "Baby Fund".',
        icon: <PiggyBank size={20} />
    },
    {
        id: 'investing',
        title: 'Compound Interest for Kids',
        content: 'Opening a savings account early allows compound interest to work its magic. Even small monthly contributions grow significantly over 18 years.',
        icon: <TrendingUp size={20} />
    },
    {
        id: 'emergency',
        title: 'Emergency Fund',
        content: 'Aim to have 3-6 months of expenses saved. This reduces financial stress, which directly benefits your health and the baby.',
        icon: <DollarSign size={20} />
    }
];

interface FinancialWisdomProps {
    onBack: () => void;
}

const FinancialWisdom: React.FC<FinancialWisdomProps> = ({ onBack }) => {
    return (
        <div className="space-y-6 animate-fade-in text-gray-800">
            {/* Header */}
            <div className="flex items-center gap-2 text-sage-600 cursor-pointer mb-4" onClick={onBack}>
                <div className="w-8 h-8 rounded-full bg-sage-50 flex items-center justify-center">←</div>
                <span className="font-semibold text-sm">Back to Learn</span>
            </div>

            <div className="text-center mb-6">
                <h2 className="text-2xl font-serif text-emerald-700">Financial Wisdom</h2>
                <p className="text-gray-500 text-sm">Planning for a secure future</p>
            </div>

            <div className="space-y-4">
                {FINANCE_TIPS.map(tip => (
                    <div key={tip.id} className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-50 hover:border-emerald-200 transition-colors">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                                {tip.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 mb-2">{tip.title}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">{tip.content}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center mt-6">
                <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider">Did you know?</p>
                <p className="text-sm text-emerald-700 mt-1">Planning activities stimulate the prefrontal cortex, keeping your mind sharp.</p>
            </div>
        </div>
    );
};

export default FinancialWisdom;
