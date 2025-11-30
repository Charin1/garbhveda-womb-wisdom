import React, { useState } from 'react';
import { Image as ImageIcon, Plus, Calendar } from 'lucide-react';

interface Memory {
    id: string;
    date: string;
    title: string;
    description: string;
    image?: string; // Placeholder for image URL
}

interface ScrapbookProps {
    onBack: () => void;
}

const Scrapbook: React.FC<ScrapbookProps> = ({ onBack }) => {
    const [memories, setMemories] = useState<Memory[]>([
        { id: '1', date: '2023-10-15', title: 'First Kick!', description: 'Felt a tiny flutter today while listening to music.', image: '🦶' },
        { id: '2', date: '2023-11-02', title: 'Ultrasound Day', description: 'Saw your tiny hands waving at us.', image: '👶' }
    ]);

    return (
        <div className="space-y-6 animate-fade-in text-gray-800">
            {/* Header */}
            <div className="flex items-center gap-2 text-sage-600 cursor-pointer mb-4" onClick={onBack}>
                <div className="w-8 h-8 rounded-full bg-sage-50 flex items-center justify-center">←</div>
                <span className="font-semibold text-sm">Back to Connect</span>
            </div>

            <div className="text-center mb-6">
                <h2 className="text-2xl font-serif text-purple-600">Digital Scrapbook</h2>
                <p className="text-gray-500 text-sm">Capturing the journey, one memory at a time</p>
            </div>

            {/* Add Memory Button */}
            <button className="w-full py-4 border-2 border-dashed border-purple-200 rounded-2xl text-purple-400 font-bold flex items-center justify-center gap-2 hover:bg-purple-50 transition-colors">
                <Plus size={20} /> Add New Memory
            </button>

            {/* Timeline */}
            <div className="space-y-6 relative pl-8 border-l-2 border-purple-100 ml-4">
                {memories.map(memory => (
                    <div key={memory.id} className="relative">
                        {/* Dot */}
                        <div className="absolute -left-[41px] top-4 w-5 h-5 bg-purple-200 rounded-full border-4 border-white shadow-sm"></div>

                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-purple-50">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-gray-800">{memory.title}</h3>
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Calendar size={12} /> {memory.date}
                                </span>
                            </div>

                            {memory.image && (
                                <div className="w-full h-32 bg-purple-50 rounded-xl mb-3 flex items-center justify-center text-4xl">
                                    {memory.image}
                                </div>
                            )}

                            <p className="text-sm text-gray-600 leading-relaxed">
                                {memory.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Scrapbook;
