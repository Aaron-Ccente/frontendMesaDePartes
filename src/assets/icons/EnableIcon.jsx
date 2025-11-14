function EnableIcon({ size = 6 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none"
      viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
      className={`w-${size} h-${size}`}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a8.25 8.25 0 1 1 15 0M9 12.75l2.25 2.25L15 11.25" />
    </svg>
  )
}

export default EnableIcon