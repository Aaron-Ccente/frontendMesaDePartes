const InputField = ({ label, name, type = 'text', value, onChange, placeholder = '', required = false, error = null }) => {
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-600 dark:text-dark-text-secondary">{label}</label>
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={`mt-1 form-input ${error ? 'border-red-500' : ''}`}
            />
            {error && <span className="text-red-500 text-sm">{error}</span>}
        </div>
    );
};

export default InputField;
