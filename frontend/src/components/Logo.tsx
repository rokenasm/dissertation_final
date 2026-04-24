interface Props {
  variant?: "light" | "dark";
  showTitle?: boolean;
}

export default function Logo({ variant = "dark", showTitle = false }: Props) {
  const color = variant === "light" ? "#ffffff" : "#0c2343";
  const dot = "#1856a6";

  return (
    <div className="logo" aria-label="RMBuild">
      <div className="logo-main" style={{ color }}>
        <span className="logo-text">RMBuild</span>
        <span className="logo-dot" style={{ background: dot }} />
      </div>
      {showTitle && (
        <div className="logo-meta" style={{ color }}>
          <span className="logo-rule" />
          <span className="logo-est">est. 2026</span>
          <span className="logo-rule" />
        </div>
      )}
    </div>
  );
}
