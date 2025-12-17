import React, { useState, useRef } from 'react';
import { UserProfile } from '../../types';
import { Mic, Square, Play, Save, RefreshCw } from 'lucide-react';

interface PitraVaniProps {
    user: UserProfile;
    onUpdateUser: (user: UserProfile) => void;
    onBack: () => void;
}

const STORIES = [
    {
        id: 'story_bravery',
        title: 'The Lion\'s Roar',
        content: "Little one, listen closely. In the jungle of life, courage is not the absence of fear, but the triumph over it. Like a lion protecting its pride, I will always stand guard for you. Your heart beats with the strength of a thousand drums. Be brave, be kind, and know that you are never alone."
    },
    {
        id: 'story_logic',
        title: 'The River of Wisdom',
        content: "Imagine a river, my child. It flows around obstacles, never stopping, always finding a way. That is logic. That is wisdom. When you face a wall, be like the water—adapt, flow, and overcome. Your mind is a powerful tool, sharper than any sword. Use it well."
    },
    {
        id: 'story_adventure',
        title: 'The Mountain Top',
        content: "We are going to climb mountains together, you and I. The view from the top is beautiful, but the climb is where the character is built. Every step you take, I will be right there to catch you if you stumble. Dream big, little explorer. The world is waiting for you."
    }
];

const PitraVani: React.FC<PitraVaniProps> = ({ user, onUpdateUser, onBack }) => {
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const currentStory = STORIES[currentStoryIndex];

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please allow permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            // Stop all tracks
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleSave = () => {
        if (!audioBlob) return;

        // In a real app, we'd save the blob to IndexedDB here.
        // For this demo, we'll just update the user metadata to say it's recorded.
        // We can't store the blob in localStorage comfortably.

        const newRecord = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            storyTitle: currentStory.title,
            // audioBlob: audioBlob // Omitted for localStorage limit reasons in this demo
        };

        const updatedHistory = [...(user.pitraVaniHistory || []), newRecord];
        onUpdateUser({ ...user, pitraVaniHistory: updatedHistory });

        alert("Recording saved to Memory Jar!");
        setAudioBlob(null);
        setAudioUrl(null);
    };

    const nextStory = () => {
        setCurrentStoryIndex((prev) => (prev + 1) % STORIES.length);
        setAudioBlob(null);
        setAudioUrl(null);
    };

    return (
        <div className="space-y-6 animate-fade-in text-slate-100">
            {/* Header */}
            <div className="flex items-center gap-2 text-slate-400 cursor-pointer mb-4" onClick={onBack}>
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">←</div>
                <span className="font-semibold text-sm">Back to Dashboard</span>
            </div>

            <div className="text-center mb-6">
                <h1 className="text-2xl font-serif font-bold text-amber-500 mb-1">Pitra Vani</h1>
                <p className="text-slate-400 text-sm">The Voice of Strength</p>
            </div>

            {/* Story Card */}
            <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-lg">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-white mb-2">{currentStory.title}</h3>
                    <p className="text-slate-300 font-serif text-lg leading-relaxed italic">
                        "{currentStory.content}"
                    </p>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-center gap-6">
                    {!audioUrl ? (
                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isRecording
                                    ? 'bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse'
                                    : 'bg-slate-700 hover:bg-slate-600 border-2 border-slate-500'
                                }`}
                        >
                            {isRecording ? <Square fill="white" className="text-white" /> : <Mic size={32} className="text-white" />}
                        </button>
                    ) : (
                        <div className="flex gap-4">
                            <button
                                onClick={() => { const audio = new Audio(audioUrl); audio.play(); }}
                                className="px-6 py-3 bg-sky-600 hover:bg-sky-500 rounded-xl text-white font-bold flex items-center gap-2"
                            >
                                <Play size={20} /> Playback
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-bold flex items-center gap-2"
                            >
                                <Save size={20} /> Save
                            </button>
                            <button
                                onClick={() => setAudioUrl(null)}
                                className="px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-300"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    <p className="text-xs text-slate-500">
                        {isRecording ? "Recording... Read the text above aloud." : "Tap the mic to start recording."}
                    </p>
                </div>
            </div>

            <div className="text-center">
                <button onClick={nextStory} className="text-sm text-slate-400 hover:text-white flex items-center justify-center gap-2 mx-auto">
                    <RefreshCw size={14} /> Try another story
                </button>
            </div>

            {/* History Preview */}
            {user.pitraVaniHistory?.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-800">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Memory Jar</h4>
                    <div className="space-y-2">
                        {user.pitraVaniHistory.slice(-3).map((record, i) => (
                            <div key={i} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 flex justify-between items-center">
                                <span className="text-sm text-slate-300">{record.storyTitle}</span>
                                <span className="text-xs text-slate-500">{new Date(record.date).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PitraVani;
