export default function HaitiNursingBrand({compact=false}:{compact?:boolean}) {
  const size=compact?42:50
  return (
    <span className="hnep-brand-lockup">
      <span className="hnep-brand-icon" style={{width:size,height:size}}>
        <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden="true">
          <defs>
            <linearGradient id="hnepBg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#0a2f86"/>
              <stop offset="1" stopColor="#0c6bd8"/>
            </linearGradient>
            <linearGradient id="hnepRed" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ff2b37"/>
              <stop offset="1" stopColor="#b80f1e"/>
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="60" height="60" rx="15" fill="url(#hnepBg)"/>
          <path d="M23 11h18v8h7v18H16V19h7z" fill="#fff"/>
          <path d="M31 18c2-2 5-1 6 1 1 2 0 4-1 5l2 2c-2 1-4 1-5 0-2 2-5 1-6-1-1-2 0-4 1-5l3-2z" fill="#0b3b92"/>
          <path d="M10 39c7-3 13-3 22 3 9-6 15-6 22-3v13c-8-3-14-2-22 4-8-6-14-7-22-4V39z" fill="#fff"/>
          <path d="M10 43c7-3 13-3 22 3 9-6 15-6 22-3" fill="none" stroke="#0d4ca6" strokeWidth="3"/>
          <path d="M10 48c7-3 13-3 22 3 9-6 15-6 22-3" fill="none" stroke="url(#hnepRed)" strokeWidth="3"/>
        </svg>
      </span>
      <span className="hnep-brand-copy">
        <strong>Haiti Nursing</strong>
        <small>Exam Prep</small>
      </span>
    </span>
  )
}
