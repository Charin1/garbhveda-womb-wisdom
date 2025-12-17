# GarbhVeda - Womb Wisdom

*GarbhVeda is a tribute to the timeless wisdom of Garbh Sanskar, reimagined for the modern family.*

[![Status](https://img.shields.io/badge/status-beta-blue)](https://github.com/charin1/mcp-nocode-db)

⚠️ This project is currently in **beta**. While it is more stable than earlier development versions, it may still contain bugs and is **not yet production-ready**.

---

**GarbhVeda** is a holistic Garbh Sanskar application that bridges ancient Vedic wisdom with modern neuroscience. It is designed to nurture the unborn child through specific daily activities that stimulate brain development, foster emotional bonding, and promote spiritual well-being for the mother.



---

## 🚀 Run Locally


Follow these steps to get the project up and running on your local machine.

### 1. Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js**: Required for the frontend.
    *   **Mac**: `brew install node`
    *   **Windows**: Download and install from [nodejs.org](https://nodejs.org/).
    *   **Check**: Run `node -v` (should be v18 or higher).
*   **Python**: Required for the backend.
    *   **Mac**: `brew install python`
    *   **Windows**: Download and install from [python.org](https://python.org/).
    *   **Check**: Run `python3 --version` (should be 3.9 or higher).
*   **Gemini API Key**: You need an API key from Google's Gemini to power the AI features.
    *   Get it here: [Google AI Studio](https://aistudio.google.com/app/apikey)
*   **Groq API Key (Optional)**: For faster AI responses using Groq's LLMs.
    *   Get it here: [Groq Console](https://console.groq.com/keys)

### 2. Clone the Repository

```bash
git clone <repository-url>
cd garbhveda-womb-wisdom
```

### 3. Backend Setup (Python)

The backend handles AI processing and data management.

1.  **Navigate to the project root.**
2.  **Create a virtual environment:**
    ```bash
    python3 -m venv backend/venv
    ```
3.  **Activate the virtual environment:**
    *   **Mac/Linux:**
        ```bash
        source backend/venv/bin/activate
        ```
    *   **Windows (Command Prompt):**
        ```bash
        backend\venv\Scripts\activate
        ```
    *   **Windows (PowerShell):**
        ```bash
        backend\venv\Scripts\Activate.ps1
        ```
4.  **Install dependencies:**
    ```bash
    pip install -r backend/requirements.txt
    ```
5.  **Start the Backend Server:**
    ```bash
    uvicorn backend.main:app --reload --port 8000
    ```
    *Keep this terminal open.*

### 4. Frontend Setup (React)

The frontend is the user interface of the application.

1.  **Open a NEW terminal window.**
2.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Configure Environment Variables:**
    *   Create a file named `.env.local` in the **project root folder** (one level up from frontend).
    *   Add your API Keys:
        ```env
        VITE_GEMINI_API_KEY=your_gemini_api_key_here
        GROQ_API_KEY=your_groq_api_key_here  # Optional
        ```
5.  **Start the Frontend:**
    ```bash
    npm run dev
    ```
6.  **Open the App:**
    *   Visit `http://localhost:5173` (or the URL shown in the terminal).

---

## 🌟 Features Showcase

GarbhVeda offers two distinct modes: **Mom Mode** for the expecting mother and **Dad Mode** for the supportive partner.

### 👩 Mom Mode

Designed to nurture the mother and child through four pillars of well-being.

#### 🏠 Home Tab: Physical & Bio-Rhythm

*   **Sattvic Diet Planner**: Get personalized, nutritious recipes based on Ayurvedic principles.

*   **Yoga for Two**: Validated yoga poses safe for pregnancy, tailored to your trimester.

*   **Daily Sankalpa**: Set a positive intention for the day to guide your thoughts and actions.
*   **Mood Tracker**: Log your emotional state to track your well-being over time.

#### 🧠 Learn Tab: Math & Logic

*   **Einstein Hour**: Engage in logic puzzles and brain teasers to stimulate the baby's developing intellect.

*   **Rhythmic Math**: Learn and practice math concepts through rhythm and patterns, enhancing neural connectivity.

*   **Financial Wisdom**: Practical tips and planning tools for new parents to prepare financially.

*   **Creative Visualization**: Use AI to generate calming and inspiring art based on positive prompts.


#### ❤️ Connect Tab: Emotional Bonding

*   **Garbh Samvad**: A unique chat interface to "talk" to your baby, fostering an early emotional bond.

*   **Scrapbook**: A digital timeline to save memories, thoughts, and milestones of your pregnancy journey.

*   **Kick Counter**: A simple tool to track baby's movements and ensure their well-being.

#### 🌟 Soul Tab: Spirituality

*   **Raaga Ritu**: Classical music therapy (Raagas) chosen for their therapeutic effects on pregnancy.

*   **Mantra Naad**: A chanting companion for powerful mantras like Om and Gayatri Mantra.

*   **Inner Journeys**: Guided meditations and visualizations for deep relaxation.
*   **Dream Journal**: Record and interpret your vivid pregnancy dreams with AI assistance.

*   **Vedic Name Finder**: Find meaningful names based on Vedic astrology and preferences.


---

### 👨 Dad Mode

A dedicated experience for fathers to be an active part of the pregnancy journey.

*   **Seva Tracker**: Gamify your support! Track tasks like massages, cooking, or cleaning to earn "Seva Points".

*   **Dad Jokes**: A daily dose of humor to keep the atmosphere light and stress-free.

*   **Pitra Vani**: Record voice messages, stories, or lullabies for your unborn child to recognize your voice.

*   **Kick Game**: Interact with the baby by tracking kicks together as a fun activity.
*   **Protector Visualization**: Guided meditation specifically for the father to embrace his role as a protector.

*   **Bio-Rhythm Sync**: A breathing exercise tool to sync your breath with your partner's, fostering deep connection.

---

## 🔒 Security

*   **Authentication**: API Key protection via `X-API-Key` header (configurable via `API_ACCESS_KEY` env var).
*   **CORS Policy**: Restricted to local development ports (3000, 5173).
*   **Environment Variables**: Sensitive keys (Gemini, Groq) managed via `.env` files and never exposed to the client.

## 🛠️ Tech Stack

### Backend (Python)
*   **Framework**: FastAPI (High-performance web framework)
*   **Server**: Uvicorn (ASGI server)
*   **AI Integration**:
    *   **Google Gemini**: `google-genai` SDK for multimodal generation (text, audio, vision).
    *   **Groq**: `groq` SDK for high-speed inference (Llama 3, Mixtral).
*   **Prompt Management**:
    *   **Jinja2**: Templating engine for dynamic prompts.
    *   **PyYAML**: For structured prompt metadata.
*   **Utilities**: `python-dotenv` for environment configuration.

### Frontend (React)
*   **Core**: React 18+, Vite (Build tool)
*   **Styling**: Tailwind CSS (Utility-first styling), Framer Motion (Animations)
*   **Icons**: Lucide React
*   **State Management**: React Hooks
*   **API Client**: Axios

### Services & Tools
*   **LLM Service**: Custom factory pattern (`llm_service.py`) switching between Gemini and Groq.
*   **Prompt Loader**: Custom utility to load prompts from Markdown/YAML.
*   **YouTube Search**: ReAct Agent using Gemini Grounding / Web Scraping for finding valid resources.

---

## 📱 Usage Guide

1.  **Onboarding**: When you first load the app, enter your name and current pregnancy week. This personalizes all content (Yoga, Diet, Baby Development info).
2.  **Navigation**: Use the bottom navigation bar to switch between the four main pillars.
3.  **Role Switch**: Click the profile icon in the top right to switch between **Mom Mode** and **Dad Mode**.
4.  **Settings**: Click the gear icon ⚙️ to configure:
    *   **AI Model Provider**: Choose between Gemini or Groq
    *   **Model Selection**: Pick specific models (e.g., llama-3.3-70b, gemini-2.0-flash)
    *   **API Keys**: Enter your Groq API key for faster responses
5.  **Refresh Content**: Most cards have a refresh button to generate new AI content for the day.


## 🩺 Medical Disclaimer

**IMPORTANT: PLEASE READ CAREFULLY**

This application, including all its features (Sattvic Diet, Yoga, etc.), is designed for **educational and supportive purposes only**. It does **NOT** constitute medical advice, diagnosis, or treatment.

*   **Consult Your Doctor**: Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition or pregnancy.
*   **Safety First**: Before starting any new diet, exercise (including Yoga), or wellness routine, please obtain approval from your healthcare provider.
*   **Emergency**: If you experience any pain, discomfort, or medical emergency, stop using the app immediately and contact your doctor or emergency services.

By using GarbhVeda, you acknowledge that you are doing so voluntarily and at your own risk. The creators of this app are not responsible for any adverse effects resulting from the use of the information or tools provided herein.
