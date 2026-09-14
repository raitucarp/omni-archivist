'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Markdown from 'markdown-to-jsx';
import { SiteHeader } from './site-header';
import { ReadingCompanion } from './reading-companion';
import { MetadataDossier } from './metadata-dossier';
import { StoryItem } from '@/lib/artifacts';
import { ArrowLeft, BookOpen, Clock, Calendar, Sparkles } from 'lucide-react';

interface StoryReaderViewProps {
  story: StoryItem;
  initialTab?: 'story' | 'metadata';
}

export function StoryReaderView({ story, initialTab = 'story' }: StoryReaderViewProps) {
  const [activeTab, setActiveTab] = useState<'story' | 'metadata'>(initialTab);
  const [scrollY, setScrollY] = useState(0);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  React.useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute story statistics
  const wordCount = React.useMemo(() => {
    return story.contentMD.trim().split(/\s+/).filter(Boolean).length;
  }, [story.contentMD]);

  const paragraphCount = React.useMemo(() => {
    return story.contentMD
      .split(/\n\s*\n/)
      .filter((block) => {
        const t = block.trim();
        return t.length > 0 && !t.startsWith('#') && !t.startsWith('---') && !t.startsWith('***');
      }).length;
  }, [story.contentMD]);

  return (
    <>
      <SiteHeader
        storyTitle={story.title}
        storySlug={story.slug}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* Hero Cover Atmospheric Backdrop (Subtle top glow, fades completely before prose) */}
      {activeTab === 'story' && story.coverUrl && (
        <div className="absolute top-0 left-0 right-0 h-[620px] pointer-events-none z-0 overflow-hidden" aria-hidden="true">
          {/* Ambient Blurred Cover Layer */}
          <div
            className="absolute -inset-10 bg-cover bg-center opacity-25 dark:opacity-40"
            style={{
              backgroundImage: `url('${story.coverUrl}')`,
              filter: 'blur(70px) saturate(1.8)',
            }}
          />
          {/* Smooth vertical depth gradient: completely transitions to 100% background before story text */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background"
          />
        </div>
      )}

      {/* Desktop Floating Sticky Stats (Left Center) */}
      {activeTab === 'story' && (
        <aside
          className="hidden xl:flex fixed left-4 2xl:left-8 top-1/2 -translate-y-1/2 z-30 flex-col gap-3 p-4 rounded-2xl bg-card/90 backdrop-blur-md border border-border shadow-xl min-w-[145px] animate-in fade-in duration-300"
          aria-label="Story Metrics"
        >
          <div className="flex items-center gap-1.5 pb-2 border-b border-border/80">
            <span className="text-[#bb3e03] dark:text-[#ee9b00] text-sm">◈</span>
            <span className="font-mono text-xs uppercase font-bold text-[#005f73] dark:text-[#94d2bd] tracking-wider">
              Metrics
            </span>
          </div>

          <div className="space-y-0.5">
            <div className="font-display font-black text-xl text-foreground">
              {wordCount.toLocaleString()}
            </div>
            <div className="text-xs font-mono text-muted-foreground">
              Total Words
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="font-display font-black text-xl text-foreground">
              {paragraphCount}
            </div>
            <div className="text-xs font-mono text-muted-foreground">
              Paragraphs
            </div>
          </div>

          <div className="pt-2 border-t border-border/80 flex items-center gap-1.5 text-xs font-mono font-semibold text-[#bb3e03] dark:text-[#ee9b00]">
            <Clock className="w-3.5 h-3.5" />
            <span>{story.readingTime}</span>
          </div>
        </aside>
      )}

      <main className={`relative z-10 w-full mx-auto px-4 sm:px-6 py-6 sm:py-12 transition-all duration-300 ${activeTab === 'metadata' ? 'max-w-7xl' : 'max-w-4xl'}`}>
        {activeTab === 'story' ? (
          <article className="space-y-10 animate-in fade-in duration-300">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1.5 font-medium">
                <ArrowLeft className="w-4 h-4" />
                <span>Home</span>
              </Link>
              <span>/</span>
              <Link href={`/volumes/${story.volumeId}/`} className="hover:text-foreground transition-colors font-medium">
                {story.volumeTitle}
              </Link>
            </nav>

            {/* Story Hero Header */}
            <header className="space-y-6">
              {story.coverUrl && (
                <div className="w-full max-h-[520px] rounded-3xl overflow-hidden border border-border shadow-2xl relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={story.coverUrl}
                    alt={`${story.title} cover`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-3">
                <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-foreground leading-[1.15] tracking-tight break-words">
                  {story.title}
                </h1>
                {story.subtitle && (
                  <p className="font-prose italic text-xl sm:text-2xl text-[#bb3e03] dark:text-[#ee9b00] font-medium break-words">
                    {story.subtitle}
                  </p>
                )}
              </div>

              {/* Meta Pills */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <span className="text-sm font-mono px-3.5 py-1.5 rounded-full bg-card border border-border text-foreground flex items-center gap-2 shadow-sm">
                  <Calendar className="w-4 h-4 text-[#005f73] dark:text-[#0a9396]" />
                  <span>{story.dateStr} (Year {story.yearHE} HE)</span>
                </span>
                <span className="text-sm font-mono font-bold px-3.5 py-1.5 rounded-full bg-[#bb3e03]/10 dark:bg-[#ee9b00]/15 text-[#bb3e03] dark:text-[#ee9b00] border border-[#bb3e03]/25 dark:border-[#ee9b00]/30 shadow-sm">
                  {story.genre}
                </span>
                <span className="text-sm font-mono font-semibold px-3.5 py-1.5 rounded-full bg-[#005f73]/10 dark:bg-[#0a9396]/15 text-[#005f73] dark:text-[#94d2bd] border border-[#005f73]/20 dark:border-[#0a9396]/30 shadow-sm">
                  {story.scienceField}
                </span>
                <span className="text-sm font-mono px-3.5 py-1.5 rounded-full bg-card border border-border text-foreground flex items-center gap-2 shadow-sm">
                  <Clock className="w-4 h-4 text-[#bb3e03] dark:text-[#ee9b00]" />
                  <span>{story.readingTime}</span>
                </span>
              </div>

              {/* Logline Box */}
              {story.logline && (
                <blockquote className="p-5 sm:p-8 rounded-2xl bg-card border-l-4 border-[#bb3e03] dark:border-[#ee9b00] border-y border-r border-border text-foreground font-prose italic text-base sm:text-xl leading-relaxed shadow-md break-words">
                  “{story.logline}”
                </blockquote>
              )}
            </header>

            {/* Story Prose Body - Responsive Typography (Compact on mobile, centered reading column on desktop) */}
            <section className="story-prose-body font-prose text-base sm:text-[1.36rem] text-foreground max-w-3xl lg:max-w-4xl mx-auto pt-4 pb-28 sm:pb-16">
              <Markdown
                options={{
                  overrides: {
                    p: {
                      component: 'p',
                    },
                    h1: { component: 'h2', props: { className: 'font-display font-bold text-2xl sm:text-3xl mt-10 mb-5 text-foreground' } },
                    h2: { component: 'h2', props: { className: 'font-display font-bold text-xl sm:text-2xl mt-8 mb-4 text-foreground' } },
                    h3: { component: 'h3', props: { className: 'font-display font-bold text-lg sm:text-xl mt-6 mb-3 text-foreground' } },
                    hr: {
                      component: () => (
                        <div className="text-center my-10 sm:my-14 text-[#bb3e03] dark:text-[#ee9b00] tracking-[0.6em] text-sm sm:text-base opacity-80">
                          ◈ ◈ ◈
                        </div>
                      ),
                    },
                  },
                }}
              >
                {story.contentMD}
              </Markdown>
            </section>

            {/* Story Navigation Footer */}
            <footer className="pt-8 pb-12 md:pb-0 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                href={`/volumes/${story.volumeId}/`}
                className="px-5 py-2.5 rounded-xl bg-card border border-border hover:border-[#bb3e03] dark:hover:border-[#ee9b00] hover:text-[#bb3e03] dark:hover:text-[#ee9b00] text-sm font-semibold transition-all inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to {story.volumeTitle}</span>
              </Link>

              <Link
                href={`/stories/${story.slug.join('/')}/metadata/`}
                onClick={() => {
                  setActiveTab('metadata');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-5 py-2.5 rounded-xl bg-[#005f73]/10 dark:bg-[#0a9396]/20 border border-[#005f73]/25 dark:border-[#0a9396]/40 text-[#005f73] dark:text-[#94d2bd] hover:bg-[#005f73]/20 dark:hover:bg-[#0a9396]/30 text-sm font-semibold transition-all inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#bb3e03] dark:text-[#ee9b00]" />
                <span>View Archival Metadata Dossier →</span>
              </Link>
            </footer>
          </article>
        ) : (
          /* Metadata Tab */
          <div className="space-y-8">
            <nav className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <Link
                href={`/stories/${story.slug.join('/')}/`}
                onClick={() => setActiveTab('story')}
                className="hover:text-foreground transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Reading Story</span>
              </Link>
            </nav>

            <MetadataDossier
              metadata={story.metadata}
              title={story.title}
              subtitle={story.subtitle}
              dateStr={story.dateStr}
              scienceField={story.scienceField}
              genre={story.genre}
              readingTime={story.readingTime}
            />
          </div>
        )}
      </main>

      {/* Floating Reading Companion & Mobile Bottom Status Bar (True Viewport Fixed) */}
      {activeTab === 'story' && (
        <>
          <ReadingCompanion />

          {/* Mobile Fixed Bottom Information Bar */}
          <div
            className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border px-4 py-2 pb-[max(0.625rem,env(safe-area-inset-bottom))] shadow-lg flex items-center justify-between text-xs font-mono"
            aria-label="Story Metrics Mobile Bar"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-[#bb3e03] dark:text-[#ee9b00] text-xs">◈</span>
              <span>
                <strong className="text-foreground">{wordCount.toLocaleString()}</strong> words
              </span>
              <span className="opacity-40">•</span>
              <span>
                <strong className="text-foreground">{paragraphCount}</strong> paras
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-semibold text-[#bb3e03] dark:text-[#ee9b00]">
              <Clock className="w-3.5 h-3.5" />
              <span>{story.readingTime}</span>
            </div>
          </div>
        </>
      )}
    </>
  );
}
