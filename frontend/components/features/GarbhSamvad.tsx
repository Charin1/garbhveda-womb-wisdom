import React, { useState, useRef, useEffect } from 'react';
import { Send, Heart, User, Sparkles } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'MOM' | 'BABY';
    timestamp: Date;
}

interface GarbhSamvadProps {
    onBack: () => void;
}

const GarbhSamvad: React.FC<GarbhSamvadProps> = ({ onBack }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: "Namaste Maa! I can hear your heartbeat. It's my favorite song.", sender: 'BABY', timestamp: new Date() }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: 'MOM',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, newMessage]);
        setInputText('');
        setIsTyping(true);

        // Simulate Baby's response (Mock AI)
        setTimeout(() => {
            const responses = [
                "I feel your love, Maa!",
                "That makes me so happy!",
                "Tell me more about the world outside.",
                "I love when you talk to me.",
                "Your voice is so soothing."
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];

            const babyMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: randomResponse,
                sender: 'BABY',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, babyMessage]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-180px)] animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-2 text-sage-600 cursor-pointer mb-4 shrink-0" onClick={onBack}>
                <div className="w-8 h-8 rounded-full bg-sage-50 flex items-center justify-center">←</div>
                <span className="font-semibold text-sm">Back to Connect</span>
            </div>

            <div className="text-center mb-4 shrink-0">
                <h2 className="text-2xl font-serif text-rose-quartz-600 flex items-center justify-center gap-2">
                    <Heart fill="currentColor" size={24} /> Garbh Samvad
                </h2>
                <p className="text-gray-500 text-sm">Heart-to-Heart with your little one</p>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto bg-white rounded-3xl shadow-sm border border-rose-quartz-100 p-4 mb-4">
                <div className="space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'MOM' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === 'MOM'
                                    ? 'bg-rose-quartz-500 text-white rounded-br-none'
                                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                }`}>
                                <p className="text-sm">{msg.text}</p>
                                <p className={`text-[10px] mt-1 opacity-70 ${msg.sender === 'MOM' ? 'text-rose-quartz-100' : 'text-gray-400'}`}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-none flex gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="shrink-0 flex gap-2">
                <input
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message to your baby..."
                    className="flex-1 p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-rose-quartz-200 outline-none shadow-sm"
                />
                <button
                    onClick={handleSend}
                    disabled={!inputText.trim()}
                    className="w-14 h-14 bg-rose-quartz-500 text-white rounded-2xl flex items-center justify-center shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-quartz-600 transition-colors"
                >
                    <Send size={24} />
                </button>
            </div>
        </div>
    );
};

export default GarbhSamvad;
