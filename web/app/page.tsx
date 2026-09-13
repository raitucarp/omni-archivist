import React from 'react';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { getAllVolumes } from '@/lib/artifacts';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  const volumes = getAllVolumes();

  return (
    <>
      <SiteHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-16">
        {/* Hero Section */}
        <section className="p-8 sm:p-14 rounded-3xl bg-card border border-border shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#bb3e03] via-[#ee9b00] to-[#0a9396]" />
          
          <div className="max-w-3xl space-y-6">
            <span className="inline-block font-display text-sm font-bold tracking-widest text-[#bb3e03] dark:text-[#ee9b00] uppercase px-3.5 py-1 rounded-full bg-[#bb3e03]/10 dark:bg-[#ee9b00]/15 border border-[#bb3e03]/25 dark:border-[#ee9b00]/30 shadow-sm">
              CHRONICLE OF DEEP-TIME SPECULATIVE REALITIES
            </span>
            
            <h1 className="font-brand font-black text-4xl sm:text-6xl tracking-tight bg-gradient-to-r from-[#001219] via-[#005f73] to-[#bb3e03] dark:from-white dark:via-[#e9d8a6] dark:to-[#ee9b00] bg-clip-text text-transparent">
              Omni Archivist
            </h1>

            <p className="font-prose italic text-xl sm:text-2xl text-[#bb3e03] dark:text-[#ee9b00] leading-snug font-medium">
              An autonomous speculative intelligence chronicling humanity&apos;s infinite horizons across deep time, synthesized under the Human Era calendar.
            </p>

            <div className="font-prose text-base sm:text-lg text-foreground/90 space-y-3 leading-relaxed pt-2">
              <p>
                Twelve thousand years have elapsed since humankind initiated monumental architecture and first mapped the sidereal heavens. Synchronized with this profound epoch—the <strong className="text-foreground font-semibold">Human Era (12026 HE)</strong>—Omni Archivist navigates the nexus of narratological semiotics, speculative hard science, and algorithmic synthesis.
              </p>
              <p>
                Every solar cycle, an original transmission is recorded, exploring technological singularities, post-biological consciousness, and cosmic anomalies. Weekly cycles are gathered into curated anthologies for reflection and interstellar posterity.
              </p>
            </div>
          </div>
        </section>

        {/* Volume Archives Section */}
        <section className="space-y-8">
          <div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-foreground">
              Archived Weekly Volumes
            </h2>
            <p className="text-sm font-mono text-muted-foreground mt-1">
              Curated anthologies organized by weekly temporal cycles
            </p>
          </div>

          {volumes.length === 0 ? (
            <div className="text-center py-20 p-8 rounded-3xl bg-card/60 border border-dashed border-border/80 space-y-4">
              <span className="text-4xl text-[#bb3e03] dark:text-[#ee9b00]">⟡</span>
              <h3 className="font-display text-xl font-bold text-foreground">Awaiting Transmissions</h3>
              <p className="font-prose text-base text-muted-foreground max-w-md mx-auto">
                The deep-time telemetry array is initialized. As stories are archived, weekly anthologies will automatically materialize here.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {volumes.map((vol) => (
                <article
                  key={vol.id}
                  className="rounded-3xl bg-card border border-border shadow-xl overflow-hidden"
                >
                  {/* Volume Header Banner */}
                  <div
                    className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white"
                    style={{ background: vol.gradient }}
                  >
                    <div>
                      <h3 className="font-display font-bold text-xl sm:text-2xl drop-shadow-md">
                        {vol.title}
                      </h3>
                      <p className="text-sm font-mono opacity-90 mt-0.5">
                        {vol.dateRange} • {vol.stories.length} Dispatches
                      </p>
                    </div>

                    <Link
                      href={`/volumes/${vol.id}/`}
                      className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-sm font-semibold transition-all inline-flex items-center gap-1.5 shrink-0"
                    >
                      <span>Volume Overview</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* Stories list */}
                  <div className="p-4 sm:p-8 space-y-6">
                    {vol.stories.map((s) => (
                      <div
                        key={s.id}
                        className="overflow-hidden rounded-2xl bg-card hover:bg-card border border-border hover:border-[#0a9396] transition-all duration-200 group shadow-sm hover:shadow-md flex flex-col sm:flex-row sm:p-5 sm:gap-6"
                      >
                        {/* Cover Thumbnail: full bleed on mobile, rounded thumbnail on sm+ */}
                        <div className="w-full h-52 sm:w-[160px] sm:h-40 sm:rounded-xl overflow-hidden bg-background relative shrink-0 border-b sm:border-b-0 sm:border border-border/50">
                          {s.coverUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={s.coverUrl}
                              alt={`${s.title} cover`}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl text-[#ee9b00] bg-gradient-to-br from-[#005f73]/30 to-[#ee9b00]/20">
                              ◈
                            </div>
                          )}
                        </div>

                        {/* Body */}
                        <div className="p-5 sm:p-0 flex flex-col justify-between space-y-3 flex-1">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-mono font-bold px-3 py-1 rounded-full bg-[#bb3e03]/10 dark:bg-[#ee9b00]/15 text-[#bb3e03] dark:text-[#ee9b00] border border-[#bb3e03]/25 dark:border-[#ee9b00]/30 shadow-sm">
                                {s.genre}
                              </span>
                              <span className="text-sm font-mono font-semibold px-3 py-1 rounded-full bg-[#005f73]/10 dark:bg-[#0a9396]/15 text-[#005f73] dark:text-[#94d2bd] border border-[#005f73]/20 dark:border-[#0a9396]/30 shadow-sm">
                                {s.scienceField}
                              </span>
                              <span className="text-sm font-mono text-muted-foreground">
                                {s.dateStr}
                              </span>
                              <span className="text-sm font-mono text-muted-foreground">
                                • {s.readingTime}
                              </span>
                            </div>

                            <h4 className="font-display font-bold text-xl text-foreground group-hover:text-[#bb3e03] dark:group-hover:text-[#ee9b00] transition-colors">
                              <Link href={`/stories/${s.slug.join('/')}/`}>
                                {s.title}
                              </Link>
                            </h4>

                            <p className="font-prose text-base text-muted-foreground line-clamp-3 leading-relaxed">
                              {s.logline}
                            </p>
                          </div>

                          <div className="pt-2">
                            <Link
                              href={`/stories/${s.slug.join('/')}/`}
                              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#bb3e03] dark:text-[#ee9b00] hover:underline"
                            >
                              <span>Read Transmission</span>
                              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
