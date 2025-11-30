# GarbhVeda - Womb Wisdom

[![Status](https://img.shields.io/badge/status-beta-blue)](https://github.com/charin1/mcp-nocode-db)

⚠️ This project is currently in **beta**. While it is more stable than earlier development versions, it may still contain bugs and is **not yet production-ready**.

**GarbhVeda** is a holistic Garbh Sanskar application that bridges ancient Vedic wisdom with modern neuroscience. It is designed to nurture the unborn child through specific daily activities that stimulate brain development, foster emotional bonding, and promote spiritual well-being for the mother.

## 🌟 Features

### � Mom Mode
Designed to nurture the mother and child through four pillars of well-being.

#### 🧘 Physical & Bio-Rhythm (Home Tab)
- **Sattvic Diet Planner**: Recipes for pure, nutritious food.
- **Yoga for Two**: Trimester-specific yoga poses with benefits.
- **Daily Sankalpa**: Start the day with a positive intention.
- **Mood Tracker**: Log and visualize emotional well-being.

#### 🧠 Math & Logic (Learn Tab)
- **Einstein Hour**: Logic puzzles and brain teasers.
- **Rhythmic Math**: Learn math concepts through rhythm and music.
- **Financial Wisdom**: Tips for financial planning for new parents.
- **Creative Visualization**: AI-generated art prompts.

#### ❤️ Emotional Bonding (Connect Tab)
- **Garbh Samvad**: Chat interface to "talk" to your baby.
- **Scrapbook**: A timeline of memories and milestones.
- **Labor Prep**: Contraction timer and labor visualization.
- **Kick Counter**: Track baby's movements.

#### 🌟 Spirituality (Soul Tab)
- **Raaga Ritu**: Classical music therapy.
- **Mantra Naad**: Chanting counter and player.
- **Inner Journeys**: Guided visualizations.
- **Dream Journal**: Record and interpret pregnancy dreams.

### 👨 Dad Mode
A dedicated experience for fathers to be an active part of the pregnancy journey.
- **Seva Tracker**: Gamified tracking of support tasks to earn "Seva Points".
- **Pitra Vani**: Record voice messages and promises for the unborn child.
- **Kick Game**: Interact with the baby by tracking kicks.
- **Dad Jokes**: A daily dose of humor to keep the atmosphere light.
- **Bio-Rhythm Sync**: Breathing exercises to sync with the partner.
- **Protector Visualization**: Guided meditation for the father.

### ✨ Smart Features
- **Offline Fallback**: Verified, high-quality content is available even when AI generation is offline.
- **Responsive Design**: Optimized for Mobile, Tablet, and Desktop.
- **Generative AI**: Dynamic content generation powered by Google Gemini.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS
- **AI Integration**: Google Gemini API (`@google/genai`)
- **Icons**: Lucide React
- **State Management**: React Hooks & Context (Local State)

## 🚀 Run Locally

**Prerequisites:**
- Node.js (v18 or higher recommended)
- A Google Gemini API Key

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd garbhveda-womb-wisdom
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   - Create a `.env.local` file in the root directory.
   - Add your Gemini API key:
     ```env
     VITE_GEMINI_API_KEY=your_api_key_here
     ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open in Browser:**
   Navigate to `http://localhost:5173` (or the URL shown in your terminal).

## 📱 Usage

1. **Onboarding**: Enter your name and current pregnancy week to personalize your journey.
2. **Daily Activities**: Navigate through the tabs (Home, Learn, Connect, Soul) to complete your daily activities.
3. **Switch Role**: Toggle between Mother and Father modes using the profile icon or switch button.
4. **Reset**: You can reset your profile from the Home screen if needed.


## Status

This project is still in its early stages. Expect breaking changes.

---

*GarbhVeda is a tribute to the timeless wisdom of Garbh Sanskar, reimagined for the modern mother.*
