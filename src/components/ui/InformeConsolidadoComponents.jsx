export const InfoCard = ({ title, children }) => (
    <div className="bg-white dark:bg-dark-surface p-5 rounded-xl shadow-sm border dark:border-dark-border">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3 border-b pb-2 dark:border-dark-border">
            {title}
        </h3>
        <div className="space-y-4 text-sm">
            {children}
        </div>
    </div>
);

export const ReadOnlyField = ({ label, value }) => (
    <div>
        <span className="block font-semibold text-gray-600 dark:text-gray-400 text-sm">{label}:</span>
        <p className="text-gray-800 dark:text-gray-200 text-sm">{value || 'N/A'}</p>
    </div>
);

export const EditableField = ({ label, name, value, onChange, isTextarea = false, rows = 3, placeholder = '' }) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-dark-text-secondary mb-1">{label}</label>
        {isTextarea ? (
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                rows={rows}
                className="form-input w-full font-mono text-sm"
                placeholder={placeholder}
            />
        ) : (
            <input
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                className="form-input w-full"
                placeholder={placeholder}
            />
        )}
    </div>
);
