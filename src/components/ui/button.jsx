import * as React from "react";
import { cva } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-primary text-primary-foreground shadow-md hover:shadow-lg hover:scale-105 active:scale-95 hover:shadow-glow",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-lg",
        outline:
          "border-2 border-primary bg-transparent text-primary hover:bg-primary/10 hover:border-primary/80 hover:shadow-md",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md",
        ghost: "text-foreground hover:bg-primary/10 hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
        accent:
          "bg-gradient-accent text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95",
        success:
          "bg-gradient-success text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95",
        glass:
          "glass text-foreground hover:shadow-md hover:scale-105 active:scale-95 border border-primary/20",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  return (
    <motion.button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      whileHover={{ scale: variant === 'link' || variant === 'ghost' ? 1 : 1.02 }}
      whileTap={{ scale: variant === 'link' || variant === 'ghost' ? 1 : 0.98 }}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
