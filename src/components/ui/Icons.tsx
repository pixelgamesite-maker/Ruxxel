export function ArrowRight({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
      <path d="M2 8h11M9 3.5 13.5 8 9 12.5" />
    </svg>
  );
}

export function ArrowUpRight({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" aria-hidden="true">
      <path d="M3.5 10.5 10.5 3.5M4.5 3.5h6v6" />
    </svg>
  );
}

export function CheckPx({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true">
      <path d="M0 4h1v1h1v1h1V5h1V4h1V3h1V2h1v1H7v1H6v1H5v1H4v1H2V6H1V5H0z" />
    </svg>
  );
}

export function XIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

/** The two glowing pixel eyes from the Ruxxell mark. */
export function Eyes({ size = 14 }: { size?: number }) {
  const plus = (x: number) => (
    <path key={x} d={`M${x + 1} 0h1v1h1v1h-1v1h-1V2H${x}V1h1z`} />
  );
  return (
    <svg className="eyes" width={size * 3.2} height={size} viewBox="0 0 11 3" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true">
      {plus(0)}
      {plus(7)}
    </svg>
  );
}
