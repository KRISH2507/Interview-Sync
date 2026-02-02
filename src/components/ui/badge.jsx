import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full border font-medium text-xs transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background",
    {
        variants: {
            variant: {
                default:
                    "bg-gradient-primary text-primary-foreground border-primary/30 shadow-sm",
                secondary:
                    "bg-secondary text-secondary-foreground border-secondary/50",
                destructive:
                    "bg-destructive/10 text-destructive border-destructive/30",
                success:
                    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
                warning:
                    "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
                accent:
                    "bg-gradient-accent text-white border-accent/30 shadow-sm",
                outline: "text-foreground border-border bg-transparent",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export function Badge({ className, variant, ...props }) {
    return (
        <span className={cn(badgeVariants({ variant }), "px-3 py-1", className)} {...props} />
