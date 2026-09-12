import React from 'react';
import { StoryMetadata } from '@/lib/artifacts';
import { Compass, Users, GitMerge, BookMarked, Globe, Sparkles } from 'lucide-react';

interface MetadataDossierProps {
  metadata: StoryMetadata;
  title: string;
  subtitle?: string;
  dateStr: string;
  scienceField: string;
  genre: string;
  readingTime: string;
}

export function MetadataDossier({
  metadata,
  title,
  subtitle,
  dateStr,
  scienceField,
  genre,
  readingTime,
}: MetadataDossierProps) {
  const story = metadata.story;
  const theme = story?.theme;
  const setting = story?.setting;
  const structure = story?.structure;
  const characters = story?.characters || [];
  const discourse = story?.discourse;

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500 pb-16">
      {/* Dossier Header Banner */}
      <section className="p-6 sm:p-8 rounded-2xl bg-card/80 backdrop-blur-md border border-border/90 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-[#ee9b00]/15 via-[#0a9396]/10 to-transparent pointer-events-none" />
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-[#ee9b00]/15 text-[#ee9b00] border border-[#ee9b00]/30">
            ◈ SEMIOTIC TRANSMISSION DOSSIER
          </span>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#0a9396]/15 text-[#94d2bd] border border-[#0a9396]/30">
            {scienceField}
          </span>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-card border border-border/80 text-muted-foreground">
            {genre}
          </span>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-card border border-border/80 text-muted-foreground">
            {readingTime}
          </span>
        </div>
        <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-foreground mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="font-prose italic text-lg sm:text-xl text-[#ee9b00] mb-4">
            {subtitle}
          </p>
        )}
        {story?.logline && (
          <p className="font-prose text-base sm:text-lg text-foreground/80 leading-relaxed border-l-2 border-[#ee9b00] pl-4">
            {story.logline}
          </p>
        )}
      </section>

      {/* 1. Theme & Speculative Inquiry */}
      {theme && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-[#ee9b00]">
            <Sparkles className="w-5 h-5" />
            <h2 className="font-display font-bold text-xl uppercase tracking-wider">Philosophical & Thematic Premise</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {theme.central_premise && (
              <div className="p-5 rounded-xl bg-card/70 border border-border/80">
                <h3 className="text-xs font-mono uppercase tracking-widest text-[#0a9396] font-semibold mb-2">
                  Central Premise
                </h3>
                <p className="font-prose text-base leading-relaxed text-foreground/90">
                  {theme.central_premise}
                </p>
              </div>
            )}

            {theme.speculative_inquiry && (
              <div className="p-5 rounded-xl bg-card/70 border border-border/80">
                <h3 className="text-xs font-mono uppercase tracking-widest text-[#ee9b00] font-semibold mb-2">
                  Speculative Inquiry
                </h3>
                <p className="font-prose italic text-base leading-relaxed text-foreground/90">
                  “{theme.speculative_inquiry}”
                </p>
              </div>
            )}
          </div>

          {theme.motifs && theme.motifs.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-xs font-mono text-muted-foreground">Thematic Motifs:</span>
              {theme.motifs.map((m, idx) => (
                <span key={idx} className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#005f73]/20 text-[#94d2bd] border border-[#005f73]/40">
                  #{m}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 2. Worldbuilding & Chronotope */}
      {setting && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-[#0a9396]">
            <Globe className="w-5 h-5" />
            <h2 className="font-display font-bold text-xl uppercase tracking-wider">Setting & Deep-Time Chronotope</h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {setting.chronotope && (
              <div className="p-5 rounded-xl bg-gradient-to-r from-card/90 to-card/60 border border-[#0a9396]/40">
                <h3 className="text-xs font-mono uppercase tracking-widest text-[#94d2bd] font-bold mb-2">
                  Chronotope Matrix
                </h3>
                <p className="font-prose text-base leading-relaxed text-foreground/90">
                  {setting.chronotope}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {setting.topography && (
                <div className="p-5 rounded-xl bg-card/70 border border-border/80">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-[#ca6702] font-semibold mb-2">
                    Topography & Geology
                  </h3>
                  <p className="font-prose text-sm leading-relaxed text-foreground/80">
                    {setting.topography}
                  </p>
                </div>
              )}

              {setting.atmosphere && (
                <div className="p-5 rounded-xl bg-card/70 border border-border/80">
                  <h3 className="text-xs font-mono uppercase tracking-widest text-[#0a9396] font-semibold mb-2">
                    Atmosphere & Sensory
                  </h3>
                  <p className="font-prose text-sm leading-relaxed text-foreground/80">
                    {setting.atmosphere}
                  </p>
                </div>
              )}
            </div>

            {(setting.macro || setting.meso || setting.micro) && (
              <div className="p-5 rounded-xl bg-card/70 border border-border/80 space-y-3">
                <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground font-semibold">
                  Structural Scale Breakdown
                </h3>
                {setting.macro && (
                  <div>
                    <span className="text-xs font-mono font-bold text-[#ee9b00] mr-2">[MACRO]</span>
                    <span className="text-sm text-foreground/85 font-prose">{setting.macro}</span>
                  </div>
                )}
                {setting.meso && (
                  <div>
                    <span className="text-xs font-mono font-bold text-[#0a9396] mr-2">[MESO]</span>
                    <span className="text-sm text-foreground/85 font-prose">{setting.meso}</span>
                  </div>
                )}
                {setting.micro && (
                  <div>
                    <span className="text-xs font-mono font-bold text-[#94d2bd] mr-2">[MICRO]</span>
                    <span className="text-sm text-foreground/85 font-prose">{setting.micro}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 3. Character Dossier */}
      {characters.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-[#ee9b00]">
            <Users className="w-5 h-5" />
            <h2 className="font-display font-bold text-xl uppercase tracking-wider">Actant Profiles & Characters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {characters.map((c, idx) => {
              const actantBadge =
                c.actant_role === 'protagonist'
                  ? 'bg-[#ee9b00]/20 text-[#ee9b00] border-[#ee9b00]/40'
                  : c.actant_role === 'deuteragonist'
                  ? 'bg-[#0a9396]/20 text-[#94d2bd] border-[#0a9396]/40'
                  : c.actant_role === 'antagonist'
                  ? 'bg-[#ae2012]/20 text-[#e9d8a6] border-[#ae2012]/40'
                  : 'bg-muted/40 text-muted-foreground border-border/80';

              return (
                <div key={idx} className="p-5 rounded-xl bg-card/80 border border-border/90 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display font-bold text-lg text-foreground">
                      {c.name}
                    </h3>
                    <span className={`text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${actantBadge}`}>
                      {c.actant_role || 'Agent'}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-[#ee9b00] font-mono">
                    {c.role}
                  </p>

                  {c.description && (
                    <p className="font-prose text-sm text-foreground/80 leading-relaxed">
                      {c.description}
                    </p>
                  )}

                  {c.motivation && (
                    <div className="pt-2 border-t border-border/50 text-xs">
                      <span className="font-mono text-muted-foreground font-semibold block mb-0.5">MOTIVATION:</span>
                      <span className="font-prose text-foreground/85">{c.motivation}</span>
                    </div>
                  )}

                  {c.conflict && (
                    <div className="text-xs">
                      <span className="font-mono text-muted-foreground font-semibold block mb-0.5">CONFLICT:</span>
                      <span className="font-prose text-foreground/85">{c.conflict}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Plot Architecture & Structure */}
      {structure && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-[#0a9396]">
            <GitMerge className="w-5 h-5" />
            <h2 className="font-display font-bold text-xl uppercase tracking-wider">Plot Architecture (MICEC Quotient)</h2>
          </div>

          <div className="p-5 rounded-xl bg-card/80 border border-border/90 space-y-4">
            {structure.kind && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-muted-foreground font-semibold">Narrative Structure Threads:</span>
                {structure.kind.map((k, idx) => (
                  <span key={idx} className="w-7 h-7 rounded-lg bg-[#ee9b00]/15 text-[#ee9b00] font-mono font-bold flex items-center justify-center border border-[#ee9b00]/30 text-xs">
                    {k}
                  </span>
                ))}
              </div>
            )}

            {structure.logic && structure.logic.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border/50">
                {structure.logic.map((l, idx) => (
                  <div key={idx} className="text-sm font-prose text-foreground/85 flex items-start gap-2">
                    <span className="text-[#0a9396] font-mono text-xs mt-1">◈</span>
                    <span>{l}</span>
                  </div>
                ))}
              </div>
            )}

            {structure.type_use && (
              <div className="text-xs font-mono text-muted-foreground pt-2">
                Dramatic Dynamic: <span className="text-[#ee9b00] font-semibold">{structure.type_use}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 5. Discourse & Semiotics */}
      {discourse && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-[#94d2bd]">
            <BookMarked className="w-5 h-5" />
            <h2 className="font-display font-bold text-xl uppercase tracking-wider">Discourse & Narration Semiotics</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {discourse.narration?.voice && (
              <div className="p-4 rounded-lg bg-card/70 border border-border/80">
                <span className="text-[11px] font-mono text-muted-foreground uppercase block mb-1">Voice</span>
                <span className="text-sm font-mono font-semibold text-foreground">{discourse.narration.voice}</span>
              </div>
            )}
            {discourse.narration?.focalisation && (
              <div className="p-4 rounded-lg bg-card/70 border border-border/80">
                <span className="text-[11px] font-mono text-muted-foreground uppercase block mb-1">Focalisation</span>
                <span className="text-sm font-mono font-semibold text-foreground">{discourse.narration.focalisation}</span>
              </div>
            )}
            {discourse.narration?.speed && (
              <div className="p-4 rounded-lg bg-card/70 border border-border/80">
                <span className="text-[11px] font-mono text-muted-foreground uppercase block mb-1">Speed</span>
                <span className="text-sm font-mono font-semibold text-foreground">{discourse.narration.speed}</span>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
