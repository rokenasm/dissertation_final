interface Props {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
}

export default function Logo({ variant = "dark", size = "md" }: Props) {
  const color = variant === "light" ? "#ffffff" : "#0a1f3d";
  const accent = "#00b4d8";
  const sizeMap = { sm: 28, md: 36, lg: 48 };
  const h = sizeMap[size];

  return (
    <div className="logo" aria-label="RMBuild">
      <svg width={h} height={h} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4" width="40" height="40" rx="6" stroke={color} strokeWidth="2.5" />
        <line x1="12" y1="10" x2="12" y2="38" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="24" y1="10" x2="24" y2="38" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
        <line x1="36" y1="10" x2="36" y2="38" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <span className="logo-text" style={{ color }}>
        <strong>RM</strong>Build
      </span>
    </div>
  );
}
