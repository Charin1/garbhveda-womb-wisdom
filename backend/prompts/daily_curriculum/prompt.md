Generate a daily Garbh Sanskar curriculum for Pregnancy Week {{ week }}.
{{ mood_instruction }}

1. **Sankalpa (Intention)**: A virtue for the day (e.g., Compassion, Courage) with a short mantra.
2. **Activities**: Provide exactly 4 distinct activities:
   - One MATH/LOGIC activity (Einstein Hour). MUST include a puzzle and its solution.
   - One ART/CREATIVITY activity (Visualization or Art idea).
   - One SPIRITUALITY activity (Sloka or Moral Story).
   - One BONDING activity (Garbh Samvad - talk to baby prompt).

Return ONLY the JSON object with this exact structure:
{
  "sankalpa": { "virtue": "...", "description": "...", "mantra": "..." },
  "activities": [
    {
      "id": "unique_id",
      "category": "MATH" | "ART" | "SPIRITUALITY" | "BONDING",
      "title": "...",
      "description": "...",
      "durationMinutes": 15,
      "content": "...",
      "solution": "...",
      "resources": [] 
    }
  ]
}
