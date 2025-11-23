const SelectField = ({ label, name, value, onChange, options, required = false, error = null }) => {
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-600 dark:text-dark-text-secondary">{label}</label>
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className={`mt-1 form-select ${error ? 'border-red-500' : ''}`}
            >
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <span className="text-red-500 text-sm">{error}</span>}
        </div>
    );
};

export default SelectField;
