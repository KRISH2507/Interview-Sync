import * as React from "react";
import { cn } from "../../lib/utils";

const Progress = React.forwardRef(({ className, value, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "relative h-2.5 w-full overflow-hidden rounded-full bg-secondary shadow-sm",
            className
        )}
        {...props}
    >
        <div
            className="h-full w-full flex-1 bg-gradient-primary transition-all duration-500 ease-smooth shadow-success-glow"
            style={{ width: `${value}%` }}
        />
    </div>
));

Progress.displayName = "Progress";

export { Progress };
