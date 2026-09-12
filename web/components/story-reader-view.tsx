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
}

export function StoryReaderView({ story }: StoryReaderViewProps) {
  const [activeTab, setActiveTab] = useState<'story' | 'metadata'>('story');
  const [scrollY, setScrollY] = useState(0);

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

  return (
    <>
      <SiteHeader
        storyTitle={story.title}
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

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
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
                <div className="w-full max-h-[480px] rounded-3xl overflow-hidden border border-border shadow-2xl relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={story.coverUrl}
                    alt={`${story.title} cover`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-3">
                <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-foreground leading-[1.15] tracking-tight">
                  {story.title}
                </h1>
                {story.subtitle && (
                  <p className="font-prose italic text-xl sm:text-2xl text-[#bb3e03] dark:text-[#ee9b00] font-medium">
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
                <blockquote className="p-6 sm:p-8 rounded-2xl bg-card border-l-4 border-[#bb3e03] dark:border-[#ee9b00] border-y border-r border-border text-foreground font-prose italic text-lg sm:text-xl leading-relaxed shadow-md">
                  “{story.logline}”
                </blockquote>
              )}
            </header>

            {/* Story Prose Body */}
            <section className="story-prose-body font-prose text-[1.26rem] sm:text-[1.36rem] text-foreground max-w-3xl mx-auto pt-6 pb-16">
              <Markdown
                options={{
                  overrides: {
                    p: {
                      component: 'p',
                      props: {
                        className: 'transition-all duration-300 relative border-l-3 border-transparent pl-0',
                      },
                    },
                    h1: { component: 'h2', props: { className: 'font-display font-bold text-3xl mt-12 mb-6 text-foreground' } },
                    h2: { component: 'h2', props: { className: 'font-display font-bold text-2xl mt-10 mb-5 text-foreground' } },
                    h3: { component: 'h3', props: { className: 'font-display font-bold text-xl mt-8 mb-4 text-foreground' } },
                    hr: {
                      component: () => (
                        <div className="text-center my-14 text-[#bb3e03] dark:text-[#ee9b00] tracking-[0.6em] text-base opacity-80">
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

            {/* Reading Companion Controls */}
            <ReadingCompanion />

            {/* Story Navigation Footer */}
            <footer className="pt-8 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                href={`/volumes/${story.volumeId}/`}
                className="px-5 py-2.5 rounded-xl bg-card border border-border hover:border-[#bb3e03] dark:hover:border-[#ee9b00] hover:text-[#bb3e03] dark:hover:text-[#ee9b00] text-sm font-semibold transition-all inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to {story.volumeTitle}</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('metadata');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-5 py-2.5 rounded-xl bg-[#005f73]/10 dark:bg-[#0a9396]/20 border border-[#005f73]/25 dark:border-[#0a9396]/40 text-[#005f73] dark:text-[#94d2bd] hover:bg-[#005f73]/20 dark:hover:bg-[#0a9396]/30 text-sm font-semibold transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#bb3e03] dark:text-[#ee9b00]" />
                <span>View Archival Metadata Dossier →</span>
              </button>
            </footer>
          </article>
        ) : (
          /* Metadata Tab */
          <div className="space-y-8">
            <nav className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
              <button
                type="button"
                onClick={() => setActiveTab('story')}
                className="hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Reading Story</span>
              </button>
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
    </>
  );
}
