'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { BookOpen, FileText } from 'lucide-react';

interface SiteHeaderProps {
  storyTitle?: string;
  storySlug?: string[];
  activeTab?: 'story' | 'metadata';
  onTabChange?: (tab: 'story' | 'metadata') => void;
}

export function SiteHeader({ storyTitle, storySlug, activeTab, onTabChange }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  const storyBaseUrl = storySlug ? `/stories/${storySlug.join('/')}/` : undefined;
  const metadataUrl = storySlug ? `/stories/${storySlug.join('/')}/metadata/` : undefined;

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 280);

          if (storyTitle) {
            const prose = document.querySelector('.story-prose-body');
            if (prose) {
              const proseRect = prose.getBoundingClientRect();
              const totalHeight = prose.scrollHeight;
              const windowH = window.innerHeight;
              const scrollOffset = -proseRect.top;
              let p = 0;
              if (totalHeight > 0) {
                p = (scrollOffset / (totalHeight - windowH * 0.5)) * 100;
                p = Math.max(0, Math.min(100, p));
              }
              setProgress(p);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [storyTitle]);

  const renderNavTabs = (
    className?: string,
    iconSize = 'w-4 h-4',
    padding = 'px-3.5 py-1.5',
    textClass = 'text-sm'
  ) => {
    if (!storyTitle || (!storySlug && !onTabChange)) return null;

    const storyButton = storyBaseUrl ? (
      <Link
        href={storyBaseUrl}
        onClick={() => onTabChange?.('story')}
        className={`flex items-center gap-1.5 ${padding} rounded-lg transition-all cursor-pointer ${
          activeTab === 'story'
            ? 'bg-[#bb3e03] text-white dark:bg-[#ee9b00] dark:text-[#001219] font-bold shadow-sm'
            : 'text-foreground/75 hover:text-foreground hover:bg-muted/60'
        }`}
      >
        <BookOpen className={iconSize} />
        <span>Story</span>
      </Link>
    ) : (
      <button
        type="button"
        onClick={() => onTabChange?.('story')}
        className={`flex items-center gap-1.5 ${padding} rounded-lg transition-all cursor-pointer ${
          activeTab === 'story'
            ? 'bg-[#bb3e03] text-white dark:bg-[#ee9b00] dark:text-[#001219] font-bold shadow-sm'
            : 'text-foreground/75 hover:text-foreground hover:bg-muted/60'
        }`}
      >
        <BookOpen className={iconSize} />
        <span>Story</span>
      </button>
    );

    const metadataButton = metadataUrl ? (
      <Link
        href={metadataUrl}
        onClick={() => onTabChange?.('metadata')}
        className={`flex items-center gap-1.5 ${padding} rounded-lg transition-all cursor-pointer ${
          activeTab === 'metadata'
            ? 'bg-[#005f73] text-white dark:bg-[#0a9396] dark:text-white font-bold shadow-sm'
            : 'text-foreground/75 hover:text-foreground hover:bg-muted/60'
        }`}
      >
        <FileText className={iconSize} />
        <span>Metadata</span>
      </Link>
    ) : (
      <button
        type="button"
        onClick={() => onTabChange?.('metadata')}
        className={`flex items-center gap-1.5 ${padding} rounded-lg transition-all cursor-pointer ${
          activeTab === 'metadata'
            ? 'bg-[#005f73] text-white dark:bg-[#0a9396] dark:text-white font-bold shadow-sm'
            : 'text-foreground/75 hover:text-foreground hover:bg-muted/60'
        }`}
      >
        <FileText className={iconSize} />
        <span>Metadata</span>
      </button>
    );

    return (
      <nav
        className={`flex items-center bg-card border border-border p-0.5 sm:p-1 rounded-lg sm:rounded-xl font-semibold shadow-sm ${textClass} ${
          className || ''
        }`}
      >
        {storyButton}
        {metadataButton}
      </nav>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md shadow-sm transition-all duration-300">
      {/* 1. Topmost Reading Progress Bar (Crisp, unblurred, topmost in header) */}
      {storyTitle && (
        <div
          className="absolute top-0 left-0 h-[3.5px] z-[100] transition-all duration-100 ease-out pointer-events-none"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #ee9b00 0%, #ca6702 35%, #94d2bd 70%, #0a9396 100%)',
            boxShadow: '0 0 14px rgba(238, 155, 0, 0.95), 0 0 6px rgba(10, 147, 150, 0.8)',
          }}
          aria-hidden="true"
        />
      )}

      {/* Header Bar */}
      <div className={`mx-auto flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3 transition-all ${storyTitle ? 'max-w-7xl' : 'max-w-6xl'}`}>
        {/* Row 1 Left: Brand & Desktop Scrolled Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link href="/" className="flex items-center gap-1.5 group shrink-0" title="Omni Archivist Home">
            <span className="text-base sm:text-lg text-[#bb3e03] dark:text-[#ee9b00] drop-shadow-[0_0_8px_rgba(238,155,0,0.5)] transition-transform group-hover:scale-110">◈</span>
            <span className="font-brand font-semibold tracking-wider text-xs sm:text-sm text-foreground/85 group-hover:text-foreground transition-colors">
              OMNI ARCHIVIST
            </span>
            <span className="hidden lg:inline-block text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-[#005f73]/10 dark:bg-[#0a9396]/15 text-[#005f73] dark:text-[#94d2bd] border border-[#005f73]/20 dark:border-[#94d2bd]/30">
              12026 HE
            </span>
          </Link>

          {/* Desktop Scrolled Title (hidden on mobile, shown on md+) */}
          {storyTitle && (
            <div className={`hidden md:flex items-center gap-2 border-l border-border/60 pl-3 min-w-0 transition-all duration-300 ${scrolled ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'}`}>
              <span className="font-display font-bold text-sm lg:text-base truncate max-w-xs md:max-w-md lg:max-w-xl text-foreground">
                {storyTitle}
              </span>
            </div>
          )}
        </div>

        {/* Row 1 Right: Navigation Tabs & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Desktop Tabs (Story / Metadata) */}
          {renderNavTabs('hidden md:flex')}

          {/* Mobile Tabs in Row 1 when at top (not yet scrolled) */}
          {!scrolled && renderNavTabs('md:hidden', 'w-3.5 h-3.5', 'px-2.5 py-1', 'text-xs')}

          <Link
            href="/"
            className="hidden sm:inline-block text-sm font-semibold text-foreground/80 hover:text-foreground transition-colors px-2 py-1"
          >
            Anthology
          </Link>

          <Link
            href="/about/"
            className="text-sm font-semibold text-foreground/80 hover:text-foreground transition-colors px-2 py-1"
          >
            About
          </Link>

          <ThemeToggle />
        </div>
      </div>

      {/* Row 2 on Mobile: Scrolled Story Title & Tabs Bar (Integrated right in the top navigation) */}
      {storyTitle && scrolled && (
        <div className="md:hidden border-t border-border/60 px-3.5 py-2 bg-background/95 backdrop-blur-md flex items-center justify-between gap-2.5 animate-in slide-in-from-top-1 duration-200">
          <span className="font-display font-bold text-sm sm:text-base text-foreground truncate min-w-0 flex-1">
            {storyTitle}
          </span>

          {renderNavTabs('shrink-0', 'w-3.5 h-3.5', 'px-2.5 py-1', 'text-xs')}
        </div>
      )}
    </header>
  );
}
