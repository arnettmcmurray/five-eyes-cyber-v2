export function FiveEyesLogo({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ flexShrink: 0 }}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2L4 5v6.5C4 18 12 22 12 22s8-4 8-10.5V5L12 2zm0 5.5c.5 2 2 3.5 4 4-2 .5-3.5 2-4 4-.5-2-2-3.5-4-4 2-.5 3.5-2 4-4z"
      />
    </svg>
  );
}
