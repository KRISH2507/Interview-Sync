export function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-xl border border-border bg-card shadow-smooth hover:shadow-medium transition-all ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children }) {
  return <div className="p-5 border-b border-border/50">{children}</div>;
}

export function CardTitle({ children }) {
  return <h3 className="text-lg font-semibold text-foreground">{children}</h3>;
}

export function CardDescription({ children }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

export function CardContent({ children }) {
  return <div className="p-5">{children}</div>;}