export function Button({
  children,
  variant = "default",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";

  const variants = {
    default:
      "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20",
    outline:
      "border border-white/20 text-white hover:bg-white/10",
    ghost:
      "text-white hover:bg-white/10",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
