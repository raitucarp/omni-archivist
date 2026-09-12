import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { getAllVolumes } from '@/lib/artifacts';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface VolumePageProps {
  params: Promise<{ volumeId: string }>;
}

export async function generateStaticParams() {
  const volumes = getAllVolumes();
  return volumes.map((v) => ({ volumeId: v.id }));
}

export default async function VolumePage({ params }: VolumePageProps) {
  const { volumeId } = await params;
  const volumes = getAllVolumes();
  const volume = volumes.find((v) => v.id === volumeId);

  if (!volume) {
    notFound();
  }

  return (
    <>
      <SiteHeader />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Anthology Overview</span>
          </Link>
          <span>/</span>
          <span className="text-foreground font-semibold">{volume.title}</span>
        </div>

        {/* Volume Header Banner */}
        <section
          className="p-8 sm:p-12 rounded-3xl shadow-2xl text-white relative overflow-hidden"
          style={{ background: volume.gradient }}
        >
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 inline-block">
              CURATED WEEKLY ANTHOLOGY
            </span>
            <h1 className="font-display font-black text-3xl sm:text-5xl drop-shadow-md">
              {volume.title}
            </h1>
            <p className="text-base sm:text-lg font-mono opacity-90">
              {volume.dateRange} • {volume.stories.length} Dispatches
            </p>
          </div>
        </section>

        {/* Transmissions */}
        <section className="space-y-6">
          <h2 className="font-display font-bold text-xl sm:text-2xl text-foreground">
            Transmissions in this Volume
          </h2>

          <div className="space-y-6">
            {volume.stories.map((s) => (
              <div
                key={s.id}
                className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-6 p-5 rounded-2xl bg-card/80 hover:bg-card border border-border/80 hover:border-[#ee9b00]/60 transition-all shadow-md group"
              >
                <div className="w-full h-44 sm:h-auto rounded-xl overflow-hidden bg-background relative shrink-0 border border-border/50">
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

                <div className="flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#bb3e03]/10 dark:bg-[#ee9b00]/15 text-[#bb3e03] dark:text-[#ee9b00] border border-[#bb3e03]/25 dark:border-[#ee9b00]/30">
                        {s.genre}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#005f73]/10 dark:bg-[#0a9396]/15 text-[#005f73] dark:text-[#94d2bd] border border-[#005f73]/20 dark:border-[#0a9396]/30">
                        {s.scienceField}
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {s.dateStr}
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        • {s.readingTime}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-xl sm:text-2xl text-foreground group-hover:text-[#bb3e03] dark:group-hover:text-[#ee9b00] transition-colors">
                      <Link href={`/stories/${s.slug.join('/')}/`}>
                        {s.title}
                      </Link>
                    </h3>

                    <p className="font-prose text-sm sm:text-base text-muted-foreground line-clamp-3 leading-relaxed">
                      {s.logline}
                    </p>
                  </div>

                  <div>
                    <Link
                      href={`/stories/${s.slug.join('/')}/`}
                      className="text-xs font-semibold text-[#bb3e03] dark:text-[#ee9b00] hover:text-[#005f73] dark:hover:text-[#94d2bd] transition-colors inline-flex items-center gap-1.5"
                    >
                      <span>Read Transmission</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
