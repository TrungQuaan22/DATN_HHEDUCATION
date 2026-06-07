import React from "react";
import { cn } from "@/lib/utils/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full bg-off-black border text-cream rounded px-4 py-3.5 placeholder:text-muted-text/30 focus:outline-none transition-all text-[15px] disabled:opacity-50 disabled:cursor-not-allowed min-h-[100px]",
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

Textarea.displayName = "Textarea";

