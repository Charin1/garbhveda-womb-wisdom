import React, { useState } from 'react';
import { Dream } from '../types';
import { interpretDream } from '../services/geminiService';
import Button from './Button';
import { Moon, Sparkles, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface DreamJournalProps {
  dreams: Dream[];
  onSaveDream: (dream: Dream) => void;
}

const DreamJournal: React.FC<DreamJournalProps> = ({ dreams, onSaveDream }) => {
  const [newDreamText, setNewDreamText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(false);

  const handleInterpret = async () => {
    if (!newDreamText.trim()) return;
    
    setIsAnalyzing(true);
    const result = await interpretDream(newDreamText);
    
    const newDream: Dream = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      content: newDreamText,
      interpretation: result?.interpretation || "Unable to interpret at this moment, but your feelings are valid.",
      affirmation: result?.affirmation || "I am calm and at peace."
    };
    
    onSaveDream(newDream);
    setNewDreamText('');
    setIsAnalyzing(false);
    setShowInput(false);
    setExpandedId(newDream.id); // Auto expand result
  };

  const toggleExpand = (id: string) => {
      setExpandedId(expandedId === id ? null : id);
  }

  return (
    <div className="space-y-4 animate-fade-in">
       <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 border border-indigo-100 shadow-sm">
           <div className="flex justify-between items-center mb-4">
               <h3 className="text-xl font-serif text-indigo-900 flex items-center gap-2">
                   <Moon size={20} className="text-indigo-400" fill="currentColor"/> Dream Journal
               </h3>
               <button 
                onClick={() => setShowInput(!showInput)}
                className="text-indigo-600 text-sm font-medium hover:bg-indigo-100 px-3 py-1 rounded-full transition-colors"
               >
                   {showInput ? 'Cancel' : '+ New Entry'}
               </button>
           </div>

           {showInput && (
               <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100 mb-6 animate-fade-in">
                   <textarea
                     className="w-full h-32 p-3 bg-gray-50 rounded-lg text-sm border-0 focus:ring-2 focus:ring-indigo-200 resize-none outline-none mb-3"
                     placeholder="Describe your dream... (e.g., I was swimming in a clear blue ocean...)"
                     value={newDreamText}
                     onChange={(e) => setNewDreamText(e.target.value)}
                   />
                   <div className="flex justify-end">
                       <Button 
                         onClick={handleInterpret} 
                         disabled={!newDreamText.trim()}
                         isLoading={isAnalyzing}
                         className="bg-indigo-500 hover:bg-indigo-600"
                         size="sm"
                       >
                           <Sparkles size={16} className="mr-2"/> Interpret Dream
                       </Button>
                   </div>
               </div>
           )}

           <div className="space-y-3">
               {dreams.length === 0 && !showInput && (
                   <div className="text-center py-8 text-indigo-300">
                       <Moon size={40} className="mx-auto mb-2 opacity-30"/>
                       <p className="text-sm">No dreams recorded yet.</p>
                       <p className="text-xs">Record vivid dreams to find their hidden wisdom.</p>
                   </div>
               )}

               {dreams.slice().reverse().map((dream) => (
                   <div key={dream.id} className="bg-white rounded-xl border border-indigo-50 overflow-hidden shadow-sm hover:shadow-md transition-all">
                       <div 
                        onClick={() => toggleExpand(dream.id)}
                        className="p-4 flex justify-between items-center cursor-pointer bg-white"
                       >
                           <div>
                               <p className="text-xs text-gray-400 mb-1">
                                   {new Date(dream.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric'})}
                               </p>
                               <p className="text-sm font-medium text-gray-800 line-clamp-1">{dream.content}</p>
                           </div>
                           {expandedId === dream.id ? <ChevronUp size={16} className="text-gray-300"/> : <ChevronDown size={16} className="text-gray-300"/>}
                       </div>
                       
                       {expandedId === dream.id && (
                           <div className="px-4 pb-4 pt-0 bg-indigo-50/30">
                               <div className="h-px w-full bg-indigo-50 mb-3"></div>
                               <p className="text-gray-600 text-sm mb-4 italic">"{dream.content}"</p>
                               
                               <div className="bg-white p-3 rounded-lg border border-indigo-100 mb-2">
                                   <p className="text-xs font-bold text-indigo-400 uppercase mb-1 flex items-center gap-1">
                                       <Sparkles size={12}/> Interpretation
                                   </p>
                                   <p className="text-sm text-indigo-900 leading-relaxed">{dream.interpretation}</p>
                               </div>

                               <div className="bg-sage-50 p-3 rounded-lg border border-sage-100">
                                   <p className="text-xs font-bold text-sage-500 uppercase mb-1">Affirmation</p>
                                   <p className="text-sm text-sage-800 font-medium">✨ {dream.affirmation}</p>
                               </div>
                           </div>
                       )}
                   </div>
               ))}
           </div>
       </div>
    </div>
  );
};

export default DreamJournal;
