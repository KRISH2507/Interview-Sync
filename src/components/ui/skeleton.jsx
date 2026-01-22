import { cn } from "../../lib/utils";

export function Skeleton({ className, ...props }) {
    return (
        <div
            className={cn(
                "animate-shimmer shimmer-bg rounded-md bg-muted",
                className
            )}
            {...props}
        />
    );
}
