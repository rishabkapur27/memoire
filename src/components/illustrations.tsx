/** Line drawings in the spirit of an engraved menu. Decorative only. */

export function Boule({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 140" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round">
      <path d="M18 104c0-44 37-78 82-78s82 34 82 78c0 10-6 16-16 16H34c-10 0-16-6-16-16Z" strokeWidth="2.5" />
      <path d="M58 52c18 10 30 30 34 56M100 40c10 14 14 40 10 68M142 52c-14 12-22 32-22 56" strokeWidth="2" />
      <path d="M40 92c6-4 12-6 18-6M150 86c6 0 12 2 16 6" strokeWidth="1.2" opacity=".6" />
      <path d="M10 126h180" strokeWidth="1.2" opacity=".5" />
      {Array.from({ length: 18 }).map((_, i) => (
        <circle key={i} cx={30 + ((i * 37) % 140)} cy={70 + ((i * 23) % 40)} r=".9" fill="currentColor" stroke="none" opacity=".5" />
      ))}
    </svg>
  );
}

export function Baguette({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 70" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round">
      <path d="M14 46c20-26 160-40 206-30 10 2 10 12 2 18-36 22-170 34-200 26-10-3-12-8-8-14Z" strokeWidth="2.5" />
      {[52, 92, 132, 172].map((x) => (
        <path key={x} d={`M${x} ${40 - (x - 52) / 12}c10-8 22-12 32-12`} strokeWidth="2" />
      ))}
    </svg>
  );
}

export function WheatSprig({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 120" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5">
      <path d="M20 118V20" />
      {[30, 46, 62, 78].map((y) => (
        <g key={y}>
          <path d={`M20 ${y}c-8-2-12-8-12-14 6 2 11 7 12 14Z`} />
          <path d={`M20 ${y}c8-2 12-8 12-14-6 2-11 7-12 14Z`} />
        </g>
      ))}
      <path d="M20 22c-3-6-2-12 0-16 2 4 3 10 0 16Z" />
    </svg>
  );
}
