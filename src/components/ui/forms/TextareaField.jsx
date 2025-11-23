const TextareaField = ({ label, name, value, onChange, placeholder = '', rows = 3, required = false, error = null }) => {
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-600 dark:text-dark-text-secondary">{label}</label>
            <textarea
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                required={required}
                className={`mt-1 form-input w-full ${error ? 'border-red-500' : ''}`}
            />
            {error && <span className="text-red-500 text-sm">{error}</span>}
        </div>
    );
};

export default TextareaField;
