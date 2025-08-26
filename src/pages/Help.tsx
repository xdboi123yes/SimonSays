import { useState } from "react";
import { HelpCircle, Award, ChevronDown, ChevronUp, Star, Gamepad2, Trophy } from "lucide-react";

interface FAQItem {
    question: string;
    answer: string;
}

const Help = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const faqs: FAQItem[] = [
        {
            question: "How do I play Simon Says?",
            answer: "Simon Says is a memory game where you must repeat a growing sequence of colors. First, watch the sequence of tiles that light up. Then, click on the tiles in the same order. Each round adds one more color to the sequence. The game ends when you make a mistake or choose to stop.",
        },
        {
            question: "How does the scoring system work?",
            answer: "Your score increases with each successful sequence completion. The game features a dynamic multiplier system that increases based on difficulty level and sequence length. Easy mode starts at 1x, Medium at 2x, and Hard at 3x. The multiplier increases further at sequence lengths of 5 (2x), 10 (3x), 13 (4x), 16 (5x), and 20 (6x).",
        },
        {
            question: "What are the different difficulty levels?",
            answer: "There are three difficulty levels: Easy (slower sequences, longer pauses), Medium (moderate speed), and Hard (fast sequences, minimal pauses). The sequence speed gradually increases as you progress, regardless of difficulty level.",
        },
        {
            question: "Can I customize the game tiles?",
            answer: "Yes! In Settings > Theme, you can create custom themes with different colors and shapes (square, circle, or hexagon) for the tiles. You can create multiple themes and switch between them during gameplay.",
        },
        {
            question: "How do I earn achievements?",
            answer: "Achievements are earned by reaching specific score thresholds in a single game: Sharp Starter (5 points), Memory Master (10 points), Reflex Lord (15 points), and Simon Slayer (20 points). View your achievements in the Stats page.",
        },
        {
            question: "How does the leaderboard work?",
            answer: "The leaderboard shows the top scores from all players. You can filter by difficulty level to see rankings for Easy, Medium, Hard, or combined scores. Only your highest score for each difficulty is displayed.",
        },
    ];

    return (
        <div className="container mx-auto max-w-3xl px-4 py-8">
            <div className="flex items-center justify-center mb-8">
                <HelpCircle className="text-indigo-500 h-7 w-7 mr-3" />
                <h1 className="text-3xl font-bold">Help & Information</h1>
            </div>

            <div className="space-y-8">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-6 flex items-center">
                            <Gamepad2 className="h-5 w-5 mr-2 text-slate-500" />
                            How to Play
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium text-lg mb-2">Game Rules</h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Simon Says is a classic memory game where the computer creates a sequence of tile flashes that you need to repeat.
                                    With each successful round, the sequence gets longer and potentially faster, testing your memory and reflexes.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <h3 className="font-medium text-lg mb-2">Game Steps</h3>

                                <div className="flex">
                                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 flex items-center justify-center mr-3 mt-0.5">
                                        1
                                    </span>
                                    <p className="text-slate-600 dark:text-slate-400">Select a difficulty level and click "Start Game" to begin.</p>
                                </div>

                                <div className="flex">
                                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 flex items-center justify-center mr-3 mt-0.5">
                                        2
                                    </span>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        Watch carefully as the tiles light up in a specific sequence.
                                    </p>
                                </div>

                                <div className="flex">
                                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 flex items-center justify-center mr-3 mt-0.5">
                                        3
                                    </span>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        After the sequence is shown, repeat it by clicking on the tiles in the same order.
                                    </p>
                                </div>

                                <div className="flex">
                                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 flex items-center justify-center mr-3 mt-0.5">
                                        4
                                    </span>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        If you repeat the sequence correctly, a new tile will be added and your score will increase based on the
                                        current multiplier.
                                    </p>
                                </div>

                                <div className="flex">
                                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 flex items-center justify-center mr-3 mt-0.5">
                                        5
                                    </span>
                                    <p className="text-slate-600 dark:text-slate-400">
                                        The game continues until you make a mistake or choose to stop. You can end the game at any time by clicking
                                        "Stop Game".
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium text-lg mb-2">Scoring System</h3>
                                <div className="space-y-2 text-slate-600 dark:text-slate-400">
                                    <p>Your score increases based on two factors:</p>
                                    <ul className="list-disc pl-6 space-y-1">
                                        <li>
                                            Base difficulty multiplier:
                                            <ul className="list-disc pl-6 mt-1">
                                                <li>Easy: 1x points</li>
                                                <li>Medium: 2x points</li>
                                                <li>Hard: 3x points</li>
                                            </ul>
                                        </li>
                                        <li>
                                            Sequence length multipliers:
                                            <ul className="list-disc pl-6 mt-1">
                                                <li>5+ tiles: 2x additional multiplier</li>
                                                <li>10+ tiles: 3x additional multiplier</li>
                                                <li>13+ tiles: 4x additional multiplier</li>
                                                <li>16+ tiles: 5x additional multiplier</li>
                                                <li>20+ tiles: 6x additional multiplier</li>
                                            </ul>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium text-lg mb-2">Difficulty Levels</h3>
                                <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                                    <li className="flex items-baseline">
                                        <span className="w-16 font-medium text-green-600 dark:text-green-400">Easy:</span>
                                        <span>Slower sequences with longer pauses between flashes. Perfect for beginners.</span>
                                    </li>
                                    <li className="flex items-baseline">
                                        <span className="w-16 font-medium text-amber-600 dark:text-amber-400">Medium:</span>
                                        <span>Moderate speed with shorter pauses. Good for experienced players.</span>
                                    </li>
                                    <li className="flex items-baseline">
                                        <span className="w-16 font-medium text-red-600 dark:text-red-400">Hard:</span>
                                        <span>Fast sequences with minimal pauses, requiring quick reflexes and strong memory.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-6 flex items-center">
                            <Star className="h-5 w-5 mr-2 text-slate-500" />
                            Features
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <h3 className="font-medium text-lg mb-2">Theme Customization</h3>
                                <p className="text-slate-600 dark:text-slate-400 mb-2">Create your own custom themes in the Settings menu:</p>
                                <ul className="list-disc pl-6 space-y-1 text-slate-600 dark:text-slate-400">
                                    <li>Choose custom colors for each tile</li>
                                    <li>Select from three tile shapes: Square, Circle, or Hexagon</li>
                                    <li>Save multiple themes and switch between them</li>
                                    <li>Share your high scores with different theme combinations</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-medium text-lg mb-2">Game Controls</h3>
                                <ul className="list-disc pl-6 space-y-1 text-slate-600 dark:text-slate-400">
                                    <li>Click or tap tiles to select them</li>
                                    <li>Use number keys 1-9 for keyboard controls (optional)</li>
                                    <li>Stop the game at any time to save your score</li>
                                    <li>Adjust control settings in the Settings menu</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="font-medium text-lg mb-2">Statistics & Progress</h3>
                                <ul className="list-disc pl-6 space-y-1 text-slate-600 dark:text-slate-400">
                                    <li>Track your high scores across different difficulties</li>
                                    <li>View detailed stats including average scores and streaks</li>
                                    <li>Earn achievements as you improve</li>
                                    <li>Compare your scores on the global leaderboard</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-6 flex items-center">
                            <Trophy className="h-5 w-5 mr-2 text-slate-500" />
                            Achievements Guide
                        </h2>

                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            Simon Says features four achievements that you can earn by reaching specific score milestones in a single game:
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                <div className="flex items-center mb-2">
                                    <Award className="h-5 w-5 text-amber-500 mr-2" />
                                    <h3 className="font-medium">Sharp Starter</h3>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Reach a score of 5 points in a single game.</p>
                            </div>

                            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                <div className="flex items-center mb-2">
                                    <Award className="h-5 w-5 text-indigo-500 mr-2" />
                                    <h3 className="font-medium">Memory Master</h3>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Reach a score of 10 points in a single game.</p>
                            </div>

                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                <div className="flex items-center mb-2">
                                    <Award className="h-5 w-5 text-emerald-500 mr-2" />
                                    <h3 className="font-medium">Reflex Lord</h3>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Reach a score of 15 points in a single game.</p>
                            </div>

                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <div className="flex items-center mb-2">
                                    <Award className="h-5 w-5 text-purple-500 mr-2" />
                                    <h3 className="font-medium">Simon Slayer</h3>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Reach a score of 20 points in a single game.</p>
                            </div>
                        </div>

                        <p className="text-slate-600 dark:text-slate-400 mt-4">
                            Your achievements will be permanently recorded and displayed on your Stats page. Try to collect all four!
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold mb-6">Frequently Asked Questions</h2>

                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => toggleFAQ(index)}
                                        className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-700/30 focus:outline-none transition-colors"
                                    >
                                        <span className="font-medium">{faq.question}</span>
                                        {openIndex === index ? (
                                            <ChevronUp className="h-5 w-5 text-slate-400" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-slate-400" />
                                        )}
                                    </button>

                                    {openIndex === index && (
                                        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                                            <p className="text-slate-600 dark:text-slate-400">{faq.answer}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Help;
