import React from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon | React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  const renderIcon = () => {
    if (!icon) return null;
    
    if (typeof icon === "function" || (icon as any).render) {
      const IconComponent = icon as LucideIcon;
      return <IconComponent className="w-12 h-12 text-muted-text/50 mb-3" />;
    }
    
    return icon;
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-6 text-center rounded-lg border border-border-dark bg-deep-black/30 max-w-md mx-auto w-full ${className}`}
    >
      {renderIcon()}
      <h3 className="text-base font-bold text-cream leading-tight">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-muted-text mt-2 max-w-xs leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5 w-full flex justify-center">{action}</div>}
    </div>
  );
}
