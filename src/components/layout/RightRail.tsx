import React from "react";

export interface RightRailProps {
  children?: React.ReactNode;
  className?: string;
  width?: string;
}

export default function RightRail({
  children,
  className = "",
  width = "w-[280px] xl:w-[300px]",
}: RightRailProps) {
  if (!children) return null;

  return (
    <aside
      className={`hidden lg:block shrink-0 ${width} ${className}`}
      aria-label="Contextual panel"
    >
      <div className="sticky top-20 max-h-[calc(100vh-5.5rem)] overflow-y-auto space-y-6 pt-6 pb-12 pr-2 scrollbar-thin">
        {children}
      </div>
    </aside>
  );
}
