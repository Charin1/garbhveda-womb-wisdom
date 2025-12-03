import React from 'react';
import { Trash2 } from 'lucide-react';
import Button from './Button';

interface ResetButtonProps {
    onReset: () => void;
    variant?: 'icon' | 'button';
    className?: string;
}

const ResetButton: React.FC<ResetButtonProps> = ({
    onReset,
    variant = 'icon',
    className = ''
}) => {
    const handleReset = () => {
        // Show confirmation dialog
        const confirmed = window.confirm(
            '⚠️ Reset All Data?\n\n' +
            'This will permanently delete:\n' +
            '• Your profile and settings\n' +
            '• Mood history and dream journal\n' +
            '• Chat history and scrapbook\n' +
            '• All progress and favorites\n' +
            '• Seva points and promises (for fathers)\n\n' +
            'This action cannot be undone. Are you sure?'
        );

        if (confirmed) {
            // Double confirmation for safety
            const doubleCheck = window.confirm(
                '⚠️ Final Confirmation\n\n' +
                'Are you absolutely sure you want to delete all data?\n' +
                'This is your last chance to cancel.'
            );

            if (doubleCheck) {
                onReset();
                // Show success message
                setTimeout(() => {
                    alert('✓ All data has been reset successfully.\n\nYou can now start fresh!');
                }, 100);
            }
        }
    };

    if (variant === 'button') {
        return (
            <Button
                variant="danger"
                onClick={handleReset}
                className={className}
            >
                <Trash2 size={16} className="mr-2" />
                Reset All Data
            </Button>
        );
    }

    // Icon variant (for header)
    return (
        <div
            className={`w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center cursor-pointer hover:bg-red-100 transition-colors ${className}`}
            onClick={handleReset}
            title="Reset all data"
        >
            <Trash2 size={18} />
        </div>
    );
};

export default ResetButton;
