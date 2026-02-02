export function Label({ children, className = "", ...props }) {
  return (
    <label
      className={`text-sm font-semibold text-foreground block mb-2 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}
