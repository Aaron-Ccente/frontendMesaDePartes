import React, { useState } from 'react';

export const Accordion = ({ title, children, defaultOpen = false, className = '' }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={`border rounded-lg mb-4 overflow-hidden dark:border-dark-border bg-white dark:bg-dark-surface ${className}`}>
            <button
                type="button"
                className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-dark-bg-tertiary hover:bg-gray-100 dark:hover:bg-dark-bg-secondary transition-colors text-left"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-semibold text-gray-700 dark:text-gray-200">{title}</span>
                <span className={`transform transition-transform duration-200 text-gray-500 ${isOpen ? 'rotate-180' : ''}`}>
                    ▼
                </span>
            </button>
            
            {isOpen && (
                <div className="p-4 border-t dark:border-dark-border">
                    {children}
                </div>
            )}
        </div>
    );
};
