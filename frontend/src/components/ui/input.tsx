import React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "w-full bg-off-black border text-cream rounded px-4 py-3.5 placeholder:text-muted-text/30 focus:outline-none transition-all text-base disabled:opacity-50 disabled:cursor-not-allowed",
          error
            ? "border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500"
            : "border-border-dark focus:border-brand-pink/50 focus:ring-1 focus:ring-brand-pink/50",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

