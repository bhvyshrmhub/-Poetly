import React from "react";

export interface MainContentProps {
  children: React.ReactNode;
  maxWidth?: "feed" | "reading" | "wide" | "full";
  className?: string;
  noPadding?: boolean;
}

const maxWidthMap = {
  feed: "max-w-[700px]",
  reading: "max-w-[42rem]",
  wide: "max-w-[960px]",
  full: "max-w-none",
};

export default function MainContent({
  children,
  maxWidth = "feed",
  className = "",
  noPadding = false,
}: MainContentProps) {
  const widthClass = maxWidthMap[maxWidth] || maxWidthMap.feed;
  const paddingClass = noPadding
    ? ""
    : "px-4 sm:px-6 py-6 md:py-8";

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={`flex-1 min-w-0 w-full focus:outline-none ${className}`}
    >
      <div className={`mx-auto w-full ${widthClass} ${paddingClass}`}>
        {children}
      </div>
    </main>
  );
}
