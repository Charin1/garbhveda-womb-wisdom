import React, { useState } from 'react';
import { Utensils, Check, RefreshCw } from 'lucide-react';

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
    },
    {
        id: 'ghee_rice',
        title: 'Turmeric Ghee Rice',
        benefits: 'Anti-inflammatory & energy',
        ingredients: ['1 cup rice', '1 tbsp ghee', '1/2 tsp turmeric', 'Cumin'],
        time: '15 mins'
    },
    {
        id: 'dates_milk',
        title: 'Dates & Milk Smoothie',
        benefits: 'Calcium & natural sugars',
        ingredients: ['3 dates', '1 cup milk', 'Cardamom powder'],
        time: '5 mins'
    },
    {
        id: 'vegetable_soup',
        title: 'Gentle Vegetable Broth',
        benefits: 'Hydration & minerals',
        ingredients: ['Carrots', 'Spinach', 'Ginger', 'Salt'],
        time: '20 mins'
    }
];

const VEDIC_QUOTES = [
    '"When the diet is pure, the mind becomes pure." - Chandogya Upanishad',
    '"You are what you eat. By food alone can you become pure." - Taittiriya Upanishad',
    '"Food is Brahman. From food all beings are born." - Taittiriya Upanishad',
    '"Let food be thy medicine and medicine be thy food." - Ancient Wisdom',
    '"The wise eat to live, not live to eat." - Bhagavad Gita',
    '"Pure food creates pure thoughts and pure thoughts lead to God." - Vedic Saying'
];

interface DietPlannerProps {
    onBack: () => void;
    week: number;
}

const DietPlanner: React.FC<DietPlannerProps> = ({ onBack, week }) => {
    // State for random recipe selection
    const [recipeIndices, setRecipeIndices] = useState<number[]>(() => {
        const index = week % SATTVIC_RECIPES.length;
        return [index, (index + 1) % SATTVIC_RECIPES.length];
    });
    const [quoteIndex, setQuoteIndex] = useState<number>(() => week % VEDIC_QUOTES.length);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            // Get two random unique indices for recipes
            const available = Array.from({ length: SATTVIC_RECIPES.length }, (_, i) => i);
            const firstIndex = available[Math.floor(Math.random() * available.length)];
            available.splice(available.indexOf(firstIndex), 1);
            const secondIndex = available[Math.floor(Math.random() * available.length)];
            setRecipeIndices([firstIndex, secondIndex]);

            // Get random quote index
            setQuoteIndex(Math.floor(Math.random() * VEDIC_QUOTES.length));

            setIsRefreshing(false);
        }, 500);
    };

    const featuredRecipes = recipeIndices.map(idx => SATTVIC_RECIPES[idx]);

    return (
        <div className="space-y-6 animate-fade-in text-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sage-600 cursor-pointer" onClick={onBack}>
                    <div className="w-8 h-8 rounded-full bg-sage-50 flex items-center justify-center">←</div>
                    <span className="font-semibold text-sm">Back to Routine</span>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="p-2 rounded-full bg-sage-100 hover:bg-sage-200 transition-all disabled:opacity-50"
                    title="Refresh recipes"
                >
                    <RefreshCw size={18} className={`text-sage-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
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
                <p className="text-sm text-saffron-800 italic">{VEDIC_QUOTES[quoteIndex]}</p>
            </div>
        </div>
    );
};

export default DietPlanner;
