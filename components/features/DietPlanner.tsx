import React from 'react';
import { Utensils, Check } from 'lucide-react';

const SATTVIC_RECIPES = [
    {
        id: 'almond_milk',
        title: 'Saffron Almond Milk',
        benefits: 'Brain development & immunity',
        ingredients: ['1 cup milk', '5 soaked almonds', '2 strands saffron', '1 tsp honey'],
        time: '5 mins'
    },
    {
        id: 'khichdi',
        title: 'Moong Dal Khichdi',
        benefits: 'Easy digestion & protein',
        ingredients: ['1/2 cup rice', '1/2 cup moong dal', 'Ghee', 'Cumin seeds'],
        time: '20 mins'
    },
    {
        id: 'fruit_bowl',
        title: 'Pomegranate & Walnut Bowl',
        benefits: 'Iron & Omega-3',
        ingredients: ['1 cup pomegranate', '5 walnuts', 'Mint leaves'],
        time: '5 mins'
    }
];

interface DietPlannerProps {
    onBack: () => void;
    week: number;
}

const DietPlanner: React.FC<DietPlannerProps> = ({ onBack, week }) => {
    // Simple logic to rotate recipes based on week to simulate dynamic content
    const rotationIndex = week % 3;
    const featuredRecipes = [
        SATTVIC_RECIPES[rotationIndex],
        SATTVIC_RECIPES[(rotationIndex + 1) % 3]
    ];

    return (
        <div className="space-y-6 animate-fade-in text-gray-800">
            {/* Header */}
            <div className="flex items-center gap-2 text-sage-600 cursor-pointer mb-4" onClick={onBack}>
                <div className="w-8 h-8 rounded-full bg-sage-50 flex items-center justify-center">←</div>
                <span className="font-semibold text-sm">Back to Routine</span>
            </div>

            <div className="text-center mb-6">
                <h2 className="text-2xl font-serif text-sage-700">Nourishing Your Body</h2>
                <p className="text-gray-500 text-sm">Gentle ideas to fuel you and your baby</p>
            </div>

            <div className="bg-rose-quartz-50 p-4 rounded-xl mb-6 border border-rose-quartz-100">
                <p className="text-sm text-rose-quartz-800 italic text-center">
                    "Listen to your body, mama. These are just wholesome suggestions to add a little sparkle to your day. Enjoy what feels right!"
                </p>
            </div>

            <div className="space-y-4">
                {featuredRecipes.map(recipe => (
                    <div key={recipe.id} className="bg-white p-5 rounded-2xl shadow-sm border border-sage-100">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-lg text-sage-800">{recipe.title}</h3>
                            <span className="text-xs bg-sage-50 text-sage-600 px-2 py-1 rounded-full">{recipe.time}</span>
                        </div>
                        <p className="text-sm text-saffron-600 font-medium mb-3">✨ {recipe.benefits}</p>

                        <div className="bg-gray-50 p-3 rounded-xl">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Ingredients</p>
                            <ul className="grid grid-cols-2 gap-2">
                                {recipe.ingredients.map((ing, i) => (
                                    <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-sage-400"></div>
                                        {ing}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-saffron-50 p-4 rounded-xl border border-saffron-100 text-center">
                <p className="text-sm text-saffron-800 italic">"When the diet is pure, the mind becomes pure." - Chandogya Upanishad</p>
            </div>
        </div>
    );
};

export default DietPlanner;
