export function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children }) {
  return <div className="p-6 border-b border-white/10">{children}</div>;
}

export function CardTitle({ children }) {
  return <h3 className="text-xl font-semibold text-white">{children}</h3>;
}

export function CardDescription({ children }) {
  return <p className="text-sm text-white/60">{children}</p>;
}

export function CardContent({ children }) {
  return <div className="p-6">{children}</div>;
}
