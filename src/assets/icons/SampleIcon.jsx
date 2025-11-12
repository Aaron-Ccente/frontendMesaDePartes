const SampleIcon = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <line x1="6" y1="21" x2="18" y2="21" />
    <path d="M7 21v-14a1 1 0 0 1 1 -1h8a1 1 0 0 1 1 1v14" />
    <line x1="8" y1="15" x2="16" y2="15" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="8" y1="9" x2="16" y2="9" />
  </svg>
);

export default SampleIcon;
