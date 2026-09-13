'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ChevronUp, ChevronDown, Target, ArrowUp, Type } from 'lucide-react';

export function ReadingCompanion() {
  const [progress, setProgress] = useState(0);
  const [focusMode, setFocusMode] = useState(false);
  const [fontLevel, setFontLevel] = useState(1); // 0: small, 1: default, 2: large, 3: xl
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const activeIndexRef = useRef(0);

  const fontSizes = ['1.22rem', '1.42rem', '1.65rem', '1.9rem'];

  useEffect(() => {
    const prose = document.querySelector('.story-prose-body');
    if (!prose) return;

    const paragraphs = Array.from(prose.querySelectorAll('p'));
    if (paragraphs.length === 0) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // 1. Calculate reading progress
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

          // 2. Determine active paragraph
          const focalZone = windowH * 0.38;
          let closestIndex = 0;
          let minDistance = Infinity;

          paragraphs.forEach((pEl, idx) => {
            const rect = pEl.getBoundingClientRect();
            const pMid = rect.top + rect.height / 2;
            const dist = Math.abs(pMid - focalZone);
            if (dist < minDistance) {
              minDistance = dist;
              closestIndex = idx;
            }
          });

          if (closestIndex !== activeIndexRef.current) {
            if (paragraphs[activeIndexRef.current]) {
              paragraphs[activeIndexRef.current].classList.remove('active-reading-p');
            }
            activeIndexRef.current = closestIndex;
            if (paragraphs[activeIndexRef.current]) {
              paragraphs[activeIndexRef.current].classList.add('active-reading-p');
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
  }, []);

  // Toggle Focus Mode class on prose
  useEffect(() => {
    const prose = document.querySelector('.story-prose-body');
    if (prose) {
      if (focusMode) {
        prose.classList.add('focus-mode-active');
      } else {
        prose.classList.remove('focus-mode-active');
      }
    }
  }, [focusMode]);

  // Adjust font size on prose
  useEffect(() => {
    const prose = document.querySelector('.story-prose-body') as HTMLElement;
    if (prose) {
      prose.style.fontSize = fontSizes[fontLevel];
    }
  }, [fontLevel]);

  const scrollToParagraph = (offset: number) => {
    const prose = document.querySelector('.story-prose-body');
    if (!prose) return;
    const paragraphs = Array.from(prose.querySelectorAll('p'));
    if (paragraphs.length === 0) return;

    let nextIdx = activeIndexRef.current + offset;
    if (nextIdx < 0) nextIdx = 0;
    if (nextIdx >= paragraphs.length) nextIdx = paragraphs.length - 1;

    const targetP = paragraphs[nextIdx];
    const targetY = targetP.getBoundingClientRect().top + window.pageYOffset - window.innerHeight * 0.35;

    window.scrollTo({
      top: targetY,
      behavior: 'smooth',
    });

    paragraphs.forEach((p) => p.classList.remove('active-reading-p'));
    targetP.classList.add('active-reading-p');
    activeIndexRef.current = nextIdx;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* 1. Bottom-Left: Font Size Controls */}
      <div className="fixed bottom-14 left-3 sm:bottom-6 sm:left-6 z-40 flex items-center gap-1.5 p-1.5 rounded-full bg-card/90 backdrop-blur-md border border-border/80 shadow-lg text-xs font-semibold">
        <span className="px-1.5 text-muted-foreground flex items-center gap-1">
          <Type className="w-3.5 h-3.5 text-[#bb3e03] dark:text-[#ee9b00]" />
        </span>
        <button
          type="button"
          onClick={() => setFontLevel((prev) => Math.max(0, prev - 1))}
          disabled={fontLevel === 0}
          className="w-7 h-7 rounded-full bg-muted/60 hover:bg-[#bb3e03] dark:hover:bg-[#ee9b00] hover:text-white dark:hover:text-[#001219] disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center justify-center cursor-pointer"
          title="Smaller font size"
          aria-label="Decrease font size"
        >
          A-
        </button>
        <button
          type="button"
          onClick={() => setFontLevel((prev) => Math.min(fontSizes.length - 1, prev + 1))}
          disabled={fontLevel === fontSizes.length - 1}
          className="w-7 h-7 rounded-full bg-muted/60 hover:bg-[#bb3e03] dark:hover:bg-[#ee9b00] hover:text-white dark:hover:text-[#001219] disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center justify-center cursor-pointer"
          title="Larger font size"
          aria-label="Increase font size"
        >
          A+
        </button>
      </div>

      {/* 3. Bottom-Right: Vertical Controls Cluster */}
      <div className="fixed bottom-14 right-3 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2.5">
        {/* Desktop Vertical Stack / Mobile Expandable Menu */}
        <div
          className={`flex flex-col items-center gap-2.5 transition-all duration-300 ${
            mobileExpanded ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Previous Paragraph (Round button with icon) */}
          <button
            type="button"
            onClick={() => scrollToParagraph(-1)}
            className="w-10 h-10 rounded-full bg-card/90 backdrop-blur-md border border-border/80 text-foreground hover:border-[#bb3e03] dark:hover:border-[#ee9b00] hover:text-[#bb3e03] dark:hover:text-[#ee9b00] hover:scale-105 shadow-md flex items-center justify-center transition-all cursor-pointer"
            title="Previous Paragraph (Shortcut: K)"
            aria-label="Previous Paragraph"
          >
            <ChevronUp className="w-5 h-5" />
          </button>

          {/* Next Paragraph (Round button with icon) */}
          <button
            type="button"
            onClick={() => scrollToParagraph(1)}
            className="w-10 h-10 rounded-full bg-card/90 backdrop-blur-md border border-border/80 text-foreground hover:border-[#bb3e03] dark:hover:border-[#ee9b00] hover:text-[#bb3e03] dark:hover:text-[#ee9b00] hover:scale-105 shadow-md flex items-center justify-center transition-all cursor-pointer"
            title="Next Paragraph (Shortcut: J)"
            aria-label="Next Paragraph"
          >
            <ChevronDown className="w-5 h-5" />
          </button>

          {/* Focus Mode Toggle (With Icon & Label) */}
          <button
            type="button"
            onClick={() => setFocusMode((prev) => !prev)}
            className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
              focusMode
                ? 'bg-[#bb3e03] text-white border-[#bb3e03] dark:bg-[#ee9b00] dark:text-[#001219] dark:border-[#ee9b00] shadow-[0_0_14px_rgba(238,155,0,0.6)]'
                : 'bg-card/90 backdrop-blur-md border-border/80 text-foreground hover:border-[#bb3e03] dark:hover:border-[#ee9b00] hover:text-[#bb3e03] dark:hover:text-[#ee9b00]'
            }`}
            title="Toggle Focus Mode: Blurs non-active paragraphs (Shortcut: F)"
            aria-label="Toggle Focus Mode"
          >
            <Target className="w-3.5 h-3.5" />
            <span>Focus</span>
          </button>

          {/* Back to Top (Bottom-most at right) */}
          <button
            type="button"
            onClick={scrollToTop}
            className="w-10 h-10 rounded-full bg-card/90 backdrop-blur-md border border-border/80 text-foreground hover:border-[#bb3e03] dark:hover:border-[#ee9b00] hover:text-[#bb3e03] dark:hover:text-[#ee9b00] hover:scale-105 shadow-md flex items-center justify-center transition-all cursor-pointer"
            title="Scroll to Top"
            aria-label="Scroll to Top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile FAB Trigger (Visible only on <= 768px) */}
        <button
          type="button"
          onClick={() => setMobileExpanded((prev) => !prev)}
          className="md:hidden w-12 h-12 rounded-full bg-gradient-to-br from-[#bb3e03] to-[#ca6702] dark:from-[#ee9b00] dark:to-[#ca6702] text-white dark:text-[#001219] font-black text-xl shadow-[0_8px_20px_rgba(238,155,0,0.5)] border-2 border-white/25 flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
          style={{ transform: mobileExpanded ? 'rotate(45deg)' : 'none' }}
          aria-label="Toggle Reading Companion"
          title="Reading Companion"
        >
          ◈
        </button>
      </div>
    </>
  );
}
