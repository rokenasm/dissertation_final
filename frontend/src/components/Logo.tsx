interface Props {
  variant?: "light" | "dark";
  showTitle?: boolean;
}

export default function Logo({ variant = "dark", showTitle = false }: Props) {
  const color = variant === "light" ? "#f5f1e8" : "#1a1d24";
  const red = "#c84d3a";

  return (
    <div className="logo" aria-label="RMBuild">
      <div className="logo-main" style={{ color }}>
        <span className="logo-text">RMBuild</span>
        <span className="logo-dot" style={{ background: red }} />
      </div>
      {showTitle && (
        <div className="logo-meta" style={{ color }}>
          <span className="logo-rule" />
          <span className="logo-est">est. 2026 — Surrey</span>
          <span className="logo-rule" />
        </div>
      )}
    </div>
  );
}
