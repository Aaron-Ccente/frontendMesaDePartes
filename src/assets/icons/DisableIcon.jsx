function DisableIcon({ size = 6 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none"
      viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
      className={`w-${size} h-${size}`}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M4.5 20.25a8.25 8.25 0 1 1 15 0" />
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M14.25 13.5l3 3m0-3l-3 3" />
    </svg>
  )
}

export default DisableIcon