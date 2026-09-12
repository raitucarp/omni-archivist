'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { BookOpen, FileText } from 'lucide-react';

interface SiteHeaderProps {
  storyTitle?: string;
  activeTab?: 'story' | 'metadata';
  onTabChange?: (tab: 'story' | 'metadata') => void;
}

export function SiteHeader({ storyTitle, activeTab, onTabChange }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 280);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/85 backdrop-blur-md transition-all duration-300">
      <div className={`mx-auto flex items-center justify-between px-4 sm:px-6 py-3 transition-all ${storyTitle ? 'max-w-7xl' : 'max-w-6xl'}`}>
        {/* Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <span className="text-xl text-[#ee9b00] drop-shadow-[0_0_8px_rgba(238,155,0,0.5)] transition-transform group-hover:scale-110">◈</span>
            <span className="font-brand font-bold tracking-wider text-base sm:text-lg text-foreground">OMNI ARCHIVIST</span>
            <span className="hidden sm:inline-block text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#0a9396]/15 text-[#94d2bd] border border-[#94d2bd]/30">
              12026 HE
            </span>
          </Link>

          {/* Scrolled Title in Header */}
          {storyTitle && (
            <div className={`hidden md:flex items-center gap-2 border-l border-border/60 pl-3 min-w-0 transition-all duration-300 ${scrolled ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'}`}>
              <span className="font-display font-semibold text-sm truncate max-w-md text-foreground/90">
                {storyTitle}
              </span>
            </div>
          )}
        </div>

        {/* Story / Metadata Navigation Tabs & Theme Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          {storyTitle && onTabChange && (
            <nav className="flex items-center bg-card/70 border border-border/70 p-1 rounded-lg text-xs sm:text-sm font-medium">
              <button
                type="button"
                onClick={() => onTabChange('story')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
                  activeTab === 'story'
                    ? 'bg-[#ee9b00] text-[#001219] font-semibold shadow-[0_0_10px_rgba(238,155,0,0.4)]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Story</span>
              </button>
              <button
                type="button"
                onClick={() => onTabChange('metadata')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer ${
                  activeTab === 'metadata'
                    ? 'bg-[#0a9396] text-[#f5eedf] font-semibold shadow-[0_0_10px_rgba(10,147,150,0.4)]'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Metadata</span>
              </button>
            </nav>
          )}

          <Link
            href="/"
            className="hidden sm:inline-block text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
          >
            Anthology
          </Link>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
