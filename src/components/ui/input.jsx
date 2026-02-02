export function Input({ className = "", ...props }) {
  return (
    <input
      className={`h-10 w-full rounded-lg border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 ${className}`}
      style={{ 
        borderColor: 'var(--border)',
        focusRingColor: 'var(--primary)'
      }}
      {...props}
    />
  );
}
