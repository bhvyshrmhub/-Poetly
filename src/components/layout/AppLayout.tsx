"use client";

import React from "react";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";
import RightRail from "./RightRail";

export interface AppLayoutProps {
  children: React.ReactNode;
  rightRail?: React.ReactNode;
  maxWidth?: "feed" | "reading" | "wide" | "full";
  noSidebar?: boolean;
  className?: string;
  contentClassName?: string;
}

export default function AppLayout({
  children,
  rightRail,
  maxWidth = "feed",
  noSidebar = false,
  className = "",
  contentClassName = "",
}: AppLayoutProps) {
  return (
    <div
      className={`w-full max-w-[1360px] mx-auto px-2 sm:px-4 lg:px-8 flex gap-6 lg:gap-8 min-h-[calc(100vh-var(--nav-height,60px))] pb-20 md:pb-8 ${className}`}
    >
      {/* Desktop & Tablet Sidebar */}
      {!noSidebar && (
        <aside className="hidden md:block w-[240px] lg:w-[260px] shrink-0">
          <div className="sticky top-[calc(var(--nav-height,60px)+1rem)] max-h-[calc(100vh-var(--nav-height,60px)-2rem)] overflow-y-auto scrollbar-thin">
            <Sidebar />
          </div>
        </aside>
      )}

      {/* Main Center Content */}
      <MainContent
        maxWidth={maxWidth}
        className={`pb-12 ${contentClassName}`}
      >
        {children}
      </MainContent>

      {/* Optional Contextual Right Rail */}
      {rightRail && <RightRail>{rightRail}</RightRail>}
    </div>
  );
}
