import { DailyCurriculum, ActivityCategory } from "../types";

export const FALLBACK_CURRICULUM: DailyCurriculum = {
    sankalpa: {
        virtue: "Patience (Dhairya)",
        description: "Today, I embrace the slow and beautiful unfolding of life.",
        mantra: "Om Dhritaye Namaha"
    },
    activities: [
        {
            id: "math_1",
            category: ActivityCategory.MATH,
            title: "Einstein Hour: The River Crossing",
            description: "A classic logic puzzle to stimulate your left brain.",
            durationMinutes: 15,
            content: "A farmer has a fox, a chicken, and a sack of grain. He must cross a river with only one of them at a time. If left together, the fox will eat the chicken, or the chicken will eat the grain. How can he get all three across safely?",
            solution: "1. Take chicken across. 2. Return alone. 3. Take fox across. 4. Return with chicken. 5. Take grain across. 6. Return alone. 7. Take chicken across.",
            tags: ["Logic", "Puzzle"],
            isCompleted: false,
            resources: [
                {
                    title: "Logic Puzzles for Pregnancy Brain",
                    url: "https://www.verywellfamily.com/pregnancy-brain-fog-causes-and-tips-2758584", // Generic helpful article
                    description: "Keep your mind sharp with these tips."
                },
                {
                    title: "River Crossing Puzzle Visualized",
                    url: "https://www.mathsisfun.com/puzzles/fox-chicken-grain-solution.html",
                    description: "Visual solution to the puzzle."
                }
            ]
        },
        {
            id: "art_1",
            category: ActivityCategory.ART,
            title: "Creative Visualization: Meeting Your Baby",
            description: "A guided journey to connect with your little one.",
            durationMinutes: 20,
            content: "Close your eyes and visualize a golden cord of light connecting your heart to your baby's heart. Send waves of love, peace, and protection through this cord.",
            visualPrompt: "Imagine a warm, golden light surrounding your womb.",
            tags: ["Visualization", "Bonding"],
            isCompleted: false,
            resources: [
                {
                    title: "Guided Meditation for Pregnancy",
                    url: "https://www.youtube.com/watch?v=h4s0llOpKrU", // Calm Pregnancy Meditation
                    description: "10-Minute Session for Expecting Moms"
                },
                {
                    title: "Meeting Your Baby Visualization",
                    url: "https://www.youtube.com/watch?v=4sF_d5h5GgI", // Meeting Your Baby
                    description: "Prepare your mind for a healthy birth."
                }
            ]
        },
        {
            id: "spirit_1",
            category: ActivityCategory.SPIRITUALITY,
            title: "Story Time: Abhimanyu's Learning",
            description: "The ancient tale of prenatal learning from the Mahabharata.",
            durationMinutes: 15,
            content: "Read or listen to the story of how Abhimanyu learned the secrets of the Chakravyuha while still in his mother Subhadra's womb.",
            tags: ["Mythology", "Garbh Sanskar"],
            isCompleted: false,
            resources: [
                {
                    title: "Abhimanyu's Story - Garbh Sanskar",
                    url: "https://www.youtube.com/watch?v=1u1u1u1u1u1", // Placeholder, replacing with search result
                    description: "How babies learn in the womb."
                },
                {
                    title: "The Science of Garbh Sanskar",
                    url: "https://www.youtube.com/watch?v=2v2v2v2v2v2", // Placeholder
                    description: "Modern science meets ancient wisdom."
                }
            ]
        },
        {
            id: "bond_1",
            category: ActivityCategory.BONDING,
            title: "Garbh Samvad: Talk to Baby",
            description: "The art of communicating with your unborn child.",
            durationMinutes: 10,
            content: "Spend 10 minutes talking to your baby. Tell them about your day, the weather, or how much you love them. Your voice is their favorite sound.",
            tags: ["Communication", "Love"],
            isCompleted: false,
            resources: [
                {
                    title: "Benefits of Talking to Unborn Baby",
                    url: "https://www.healthline.com/health/pregnancy/talking-to-baby-in-womb",
                    description: "Why your voice matters."
                },
                {
                    title: "Scientific Evidence for Prenatal Bonding",
                    url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3753636/",
                    description: "Research on fetal hearing and memory."
                }
            ]
        }
    ]
};
