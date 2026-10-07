"use client";

import React from "react";
import AppShell from "../AppShell";

export interface TemplateBaseProps {
  children: React.ReactNode;
  rightRail?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

/**
 * Type A: Feed Template (e.g. /home)
 * Structured with Sidebar + Main Feed + Contextual Right Rail
 */
export function FeedTemplate({
  children,
  rightRail,
  className,
  contentClassName,
}: TemplateBaseProps) {
  return (
    <AppShell
      maxWidth="feed"
      rightRail={rightRail}
      className={className}
      contentClassName={contentClassName}
    >
      {children}
    </AppShell>
  );
}

/**
 * Type B: Discovery Template (e.g. /explore, /search, /trending)
 * Structured with Sidebar + Discovery Tabs & Content
 */
export function DiscoveryTemplate({
  children,
  rightRail,
  className,
  contentClassName,
}: TemplateBaseProps) {
  return (
    <AppShell
      maxWidth="feed"
      rightRail={rightRail}
      className={className}
      contentClassName={contentClassName}
    >
      {children}
    </AppShell>
  );
}

/**
 * Type C & D: Profile & Collections Template (e.g. /profile, /collections)
 * Structured with Sidebar + Header + Tabbed list or shelves
 */
export function CollectionTemplate({
  children,
  rightRail,
  className,
  contentClassName,
}: TemplateBaseProps) {
  return (
    <AppShell
      maxWidth="feed"
      rightRail={rightRail}
      className={className}
      contentClassName={contentClassName}
    >
      {children}
    </AppShell>
  );
}

/**
 * Type E: Focused List Template (e.g. /notifications, /saved)
 * Centered comfortable list without unnecessary right column
 */
export function CenteredListTemplate({
  children,
  className,
  contentClassName,
}: Omit<TemplateBaseProps, "rightRail">) {
  return (
    <AppShell
      maxWidth="feed"
      className={className}
      contentClassName={contentClassName}
    >
      {children}
    </AppShell>
  );
}

/**
 * Type F: Writing Canvas Template (e.g. /write)
 * Immersive editor canvas within the Poetly shell
 */
export function WritingTemplate({
  children,
  rightRail,
  className,
  contentClassName,
}: TemplateBaseProps) {
  return (
    <AppShell
      maxWidth="wide"
      rightRail={rightRail}
      className={className}
      contentClassName={contentClassName}
    >
      {children}
    </AppShell>
  );
}

/**
 * Type G: Literary Reading Template (e.g. /poem/[id])
 * Distraction-free typography, comfortable 42rem reading measure
 */
export function ReadingTemplate({
  children,
  rightRail,
  className,
  contentClassName,
}: TemplateBaseProps) {
  return (
    <AppShell
      maxWidth="reading"
      rightRail={rightRail}
      className={className}
      contentClassName={contentClassName}
    >
      {children}
    </AppShell>
  );
}
