'use client';

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CollapsibleDivProps {
  children: React.ReactNode;
  className?: string;
  initialCollapsed?: boolean;
  variant?: 'white' | 'grey';
}

export function CollapsibleDiv({ 
  children, 
  className,
  initialCollapsed = false,
  variant = 'grey'
}: CollapsibleDivProps) {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);

  const variantStyles = {
    white: "bg-white dark:bg-gray-900",
    grey: "bg-gray-50 dark:bg-gray-800"
  };

  return (
    <div className={cn(
      "relative",
      variantStyles[variant],
      "border border-gray-200 dark:border-gray-700 rounded-lg",
      className
    )}>
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        isCollapsed ? "max-h-[120px]" : "max-h-none",
        "overflow-hidden"
      )}>
        <div className={cn(
          "relative",
          isCollapsed && "mask-bottom"
        )}>
          <div className="px-5 py-4">{children}</div>
        </div>
      </div>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          "absolute right-0 top-0 bottom-0 w-6",
          variant === 'white' ? "bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600",
          "transition-colors flex items-center justify-center rounded-r-lg border-l border-gray-200 dark:border-gray-700"
        )}
        aria-label="Toggle content height"
      >
        {isCollapsed ? (
          <ChevronDown className="h-4 w-4 text-gray-700 dark:text-gray-300" />
        ) : (
          <ChevronUp className="h-4 w-4 text-gray-700 dark:text-gray-300" />
        )}
      </button>
    </div>
  );
} 