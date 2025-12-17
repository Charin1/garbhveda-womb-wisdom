Generate 5 unique, meaningful {{ prompt_intro }} for {{ gender_instruction }}.
Constraints:
1. {{ significance_constraint }}
2. Provide the meaning and origin for each.
3. If starting letter is provided ({{ starting_letter }}), you MUST STRICTLY ONLY generate names starting with {{ starting_letter }}. Do NOT provide names with other letters.
4. {{ preference_instruction }}
5. If Gender is Unisex, ensure the names are truly gender-neutral and commonly used for both.

Return a JSON object with a key "names" containing a list of objects.
Each object should have: "name", "meaning", "origin", "significance".
Example: {"names": [{"name": "Aarav", "meaning": "Peaceful", "origin": "Sanskrit", "significance": "Represents calm"}] }
