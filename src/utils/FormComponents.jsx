export const FlowSelectorCard = ({ title, subtitle, onClick, selected, icon }) => (
  <div
    onClick={onClick}
    className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
      selected ? 'border-blue-500 bg-blue-50 dark:bg-gray-700 shadow-lg' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:shadow-md'
    }`}
  >
    <div className="flex items-center gap-4">
      <div className="text-2xl">{icon}</div>
      <div>
        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>
    </div>
  </div>
);

export const FormSection = ({ title, children }) => (
    <div className="mb-8">
        <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-4 border-b pb-2 dark:border-gray-700">
          {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children}
        </div>
    </div>
);

export const FormInput = ({ label, name, value, onChange, type = "text", required = false }) => (
    <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
        />
    </div>
);

export const FormSelect = ({ label, name, value, onChange, children, required = false, disabled = false }) => (
    <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition disabled:bg-gray-100"
        >
            {children}
        </select>
    </div>
);
