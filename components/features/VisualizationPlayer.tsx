import React from 'react';
import { Cloud, Star, Moon } from 'lucide-react';

const VISUALIZATIONS = [
    { id: 'forest', title: 'Enchanted Forest', description: 'Walk through a peaceful forest, connecting with nature.', icon: <Cloud size={24} /> },
    { id: 'ocean', title: 'Ocean of Love', description: 'Float in a warm ocean of unconditional love.', icon: <Star size={24} /> },
    { id: 'light', title: 'Golden Light', description: 'Surround your baby in a protective golden aura.', icon: <Moon size={24} /> }
];

interface VisualizationPlayerProps {
    onBack: () => void;
}

const VisualizationPlayer: React.FC<VisualizationPlayerProps> = ({ onBack }) => {
    return (
        <div className="space-y-6 animate-fade-in text-gray-800">
            {/* Header */}
            <div className="flex items-center gap-2 text-sage-600 cursor-pointer mb-4" onClick={onBack}>
                <div className="w-8 h-8 rounded-full bg-sage-50 flex items-center justify-center">←</div>
                <span className="font-semibold text-sm">Back to Soul</span>
            </div>

            <div className="text-center mb-6">
                <h2 className="text-2xl font-serif text-indigo-700">Inner Journeys</h2>
                <p className="text-gray-500 text-sm">Guided visualizations for bonding</p>
            </div>

            <div className="grid gap-4">
                {VISUALIZATIONS.map(viz => (
                    <div key={viz.id} className="bg-white p-6 rounded-3xl shadow-sm border border-indigo-50 hover:border-indigo-200 transition-all cursor-pointer group">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                {viz.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg mb-1">{viz.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{viz.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VisualizationPlayer;
