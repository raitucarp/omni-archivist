'use client';

import React, { useState } from 'react';
import { StoryMetadata } from '@/lib/artifacts';
import {
  Compass,
  Users,
  GitMerge,
  BookMarked,
  Globe,
  Sparkles,
  Palette,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface MetadataDossierProps {
  metadata: StoryMetadata;
  title: string;
  subtitle?: string;
  dateStr: string;
  scienceField: string;
  genre: string;
  readingTime: string;
}

function formatVal(str?: string | null): string {
  if (!str) return '';
  return str.replace(/_/g, ' ');
}

function capitalizeWords(str?: string | null): string {
  if (!str) return '';
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
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
  const meta = metadata.meta;
  const theme = story?.theme;
  const setting = story?.setting;
  const structure = story?.structure;
  const characters = story?.characters || [];
  const sceneSequels = story?.scene_sequels || [];
  const discourse = story?.discourse;
  const aesthetic = story?.aesthetic;
  const vocabs = meta?.vocabs || [];

  // Track expanded scene index (default to expanding the first scene)
  const [expandedScenes, setExpandedScenes] = useState<Record<number, boolean>>({
    0: true,
  });

  const toggleScene = (idx: number) => {
    setExpandedScenes((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const expandAllScenes = () => {
    const all: Record<number, boolean> = {};
    sceneSequels.forEach((_, idx) => (all[idx] = true));
    setExpandedScenes(all);
  };

  const collapseAllScenes = () => {
    setExpandedScenes({});
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 sm:space-y-12 animate-in fade-in duration-500 pb-20 overflow-x-hidden">
      {/* 1. Dossier Master Header */}
      <section className="p-4 sm:p-8 lg:p-10 rounded-3xl bg-card border border-border shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[3.5px] bg-gradient-to-r from-[#bb3e03] via-[#ee9b00] to-[#0a9396]" />
        
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs sm:text-sm font-mono font-bold tracking-wider uppercase px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#bb3e03]/10 dark:bg-[#ee9b00]/15 text-[#bb3e03] dark:text-[#ee9b00] border border-[#bb3e03]/25 dark:border-[#ee9b00]/30 shadow-sm shrink-0">
            ◈ TRANSMISSION DOSSIER
          </span>
          <span className="text-xs sm:text-sm font-mono font-semibold px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#005f73]/10 dark:bg-[#0a9396]/15 text-[#005f73] dark:text-[#94d2bd] border border-[#005f73]/25 dark:border-[#0a9396]/30 shadow-sm">
            {scienceField}
          </span>
          <span className="text-xs sm:text-sm font-mono font-medium px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-muted text-foreground border border-border shadow-sm">
            {genre}
          </span>
          <span className="text-xs sm:text-sm font-mono font-medium px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-muted text-foreground border border-border shadow-sm">
            {readingTime}
          </span>
          <span className="text-xs sm:text-sm font-mono px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-muted text-muted-foreground border border-border shadow-sm">
            {dateStr}
          </span>
        </div>

        <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground mb-3 break-words">
          {title}
        </h1>
        {subtitle && (
          <p className="font-prose italic text-lg sm:text-2xl text-[#bb3e03] dark:text-[#ee9b00] font-medium mb-6 break-words">
            {subtitle}
          </p>
        )}

        {/* Blurb & Logline */}
        <div className="space-y-4 pt-1">
          {story?.logline && (
            <div className="p-4 sm:p-6 rounded-2xl bg-muted/40 border-l-4 border-[#bb3e03] dark:border-[#ee9b00] border-y border-r border-border shadow-sm">
              <span className="text-xs sm:text-sm font-mono uppercase tracking-wider text-[#bb3e03] dark:text-[#ee9b00] font-bold block mb-1.5">
                Logline
              </span>
              <p className="font-prose italic text-base sm:text-xl text-foreground leading-relaxed break-words">
                “{story.logline}”
              </p>
            </div>
          )}

          {story?.blurb && (
            <div className="text-base sm:text-lg font-prose text-foreground/90 leading-relaxed bg-card p-4 sm:p-6 rounded-2xl border border-border shadow-sm break-words">
              <span className="font-mono text-xs sm:text-sm text-[#005f73] dark:text-[#94d2bd] uppercase tracking-wider font-bold block mb-2">
                Archival Blurb
              </span>
              <p>{story.blurb}</p>
            </div>
          )}

          {story?.synopsis && (
            <div className="text-base sm:text-lg font-prose text-foreground/90 leading-relaxed bg-card p-4 sm:p-6 rounded-2xl border border-border shadow-sm break-words">
              <span className="font-mono text-xs sm:text-sm text-[#005f73] dark:text-[#94d2bd] uppercase tracking-wider font-bold block mb-2">
                Narrative Synopsis
              </span>
              <p>{story.synopsis}</p>
            </div>
          )}

          {/* Meta Field Descriptions */}
          {(meta?.science_field?.description || meta?.genre?.description) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {meta?.science_field?.description && (
                <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-sm text-base leading-relaxed break-words">
                  <span className="font-mono text-xs sm:text-sm uppercase font-bold text-[#005f73] dark:text-[#94d2bd] block mb-1.5">
                    Science Domain: {scienceField}
                  </span>
                  <p className="text-foreground/90 font-prose">{meta.science_field.description}</p>
                </div>
              )}
              {meta?.genre?.description && (
                <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-sm text-base leading-relaxed break-words">
                  <span className="font-mono text-xs sm:text-sm uppercase font-bold text-[#bb3e03] dark:text-[#ee9b00] block mb-1.5">
                    Genre Archetype: {genre}
                  </span>
                  <p className="text-foreground/90 font-prose">{meta.genre.description}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 2. Theme & Speculative Inquiry */}
      {theme && (
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 text-[#bb3e03] dark:text-[#ee9b00] min-w-0 flex-1">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            <h2 className="font-display font-bold text-lg sm:text-2xl uppercase tracking-wider text-foreground break-words min-w-0">
              Philosophical & Thematic Premise
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {theme.central_premise && (
              <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#005f73] via-[#0a9396] to-transparent" />
                <h3 className="text-xs sm:text-sm font-mono uppercase tracking-wider text-[#005f73] dark:text-[#94d2bd] font-bold mb-2.5">
                  Central Premise
                </h3>
                <p className="font-prose text-base sm:text-lg leading-relaxed text-foreground break-words">
                  {theme.central_premise}
                </p>
              </div>
            )}

            {theme.speculative_inquiry && (
              <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#bb3e03] via-[#ee9b00] to-transparent" />
                <h3 className="text-xs sm:text-sm font-mono uppercase tracking-wider text-[#bb3e03] dark:text-[#ee9b00] font-bold mb-2.5">
                  Speculative Inquiry
                </h3>
                <p className="font-prose italic text-base sm:text-lg leading-relaxed text-foreground font-medium break-words">
                  “{theme.speculative_inquiry}”
                </p>
              </div>
            )}
          </div>

          {theme.motifs && theme.motifs.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-md flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-mono text-muted-foreground uppercase font-bold">
                Thematic Motifs:
              </span>
              {theme.motifs.map((m, idx) => (
                <span
                  key={idx}
                  className="text-xs sm:text-sm font-mono font-medium px-2.5 py-1 rounded-full bg-muted text-foreground border border-border shadow-sm"
                >
                  #{formatVal(m)}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 3. Setting & Deep-Time Chronotope */}
      {setting && (
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 text-[#005f73] dark:text-[#94d2bd] min-w-0 flex-1">
            <Globe className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            <h2 className="font-display font-bold text-lg sm:text-2xl uppercase tracking-wider text-foreground break-words min-w-0">
              Setting & Deep-Time Chronotope
            </h2>
          </div>

          <div className="p-4 sm:p-7 lg:p-9 rounded-3xl bg-card border border-border shadow-xl space-y-5 sm:space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#005f73] via-[#0a9396] to-[#94d2bd]" />

            {setting.chronotope && (
              <div className="p-4 sm:p-6 rounded-2xl bg-muted/40 border-l-4 border-[#005f73] dark:border-[#0a9396] border-y border-r border-border shadow-sm">
                <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[#005f73] dark:text-[#94d2bd] block mb-2">
                  Chronotope Matrix
                </span>
                <p className="font-prose italic text-base sm:text-lg text-foreground leading-relaxed font-medium break-words">
                  “{setting.chronotope}”
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {setting.macro && (
                <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-sm space-y-1.5">
                  <span className="text-xs sm:text-sm font-mono uppercase tracking-wider text-[#005f73] dark:text-[#94d2bd] font-bold block">
                    Macro Setting
                  </span>
                  <p className="text-base font-prose text-foreground leading-relaxed break-words">{setting.macro}</p>
                </div>
              )}
              {setting.meso && (
                <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-sm space-y-1.5">
                  <span className="text-xs sm:text-sm font-mono uppercase tracking-wider text-[#005f73] dark:text-[#94d2bd] font-bold block">
                    Meso Setting
                  </span>
                  <p className="text-base font-prose text-foreground leading-relaxed break-words">{setting.meso}</p>
                </div>
              )}
              {setting.micro && (
                <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-sm space-y-1.5">
                  <span className="text-xs sm:text-sm font-mono uppercase tracking-wider text-[#005f73] dark:text-[#94d2bd] font-bold block">
                    Micro Setting
                  </span>
                  <p className="text-base font-prose text-foreground leading-relaxed break-words">{setting.micro}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {setting.topography && (
                <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-sm space-y-1.5">
                  <span className="text-xs sm:text-sm font-mono uppercase tracking-wider text-muted-foreground font-bold block">
                    Geological Topography
                  </span>
                  <p className="text-base font-prose text-foreground leading-relaxed break-words">{setting.topography}</p>
                </div>
              )}
              {setting.atmosphere && (
                <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border shadow-sm space-y-1.5">
                  <span className="text-xs sm:text-sm font-mono uppercase tracking-wider text-muted-foreground font-bold block">
                    Atmospheric Sensory Landscape
                  </span>
                  <p className="text-base font-prose text-foreground leading-relaxed break-words">{setting.atmosphere}</p>
                </div>
              )}
            </div>

            {setting.function && (
              <div className="flex items-center gap-2.5 pt-1 text-xs sm:text-sm font-mono flex-wrap">
                <span className="text-muted-foreground uppercase font-bold">Narrative Setting Function:</span>
                <span className="px-3 py-1 rounded-lg bg-muted text-foreground border border-border font-semibold shadow-sm">
                  {capitalizeWords(setting.function)}
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 4. Dramatis Personae (Characters) */}
      {characters.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 text-[#bb3e03] dark:text-[#ee9b00] min-w-0 flex-1">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            <h2 className="font-display font-bold text-lg sm:text-2xl uppercase tracking-wider text-foreground break-words min-w-0">
              Dramatis Personae & Actant Architecture
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {characters.map((char, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-7 rounded-3xl bg-card border border-border hover:border-[#0a9396] shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between space-y-5 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#005f73] via-[#0a9396] to-transparent group-hover:from-[#bb3e03] group-hover:via-[#ee9b00] transition-all duration-300" />
                
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-xl sm:text-2xl text-foreground break-words">
                        {char.name || 'Unnamed Agent'}
                      </h3>
                      {char.role && (
                        <p className="text-xs sm:text-sm font-mono text-[#005f73] dark:text-[#94d2bd] font-bold mt-0.5">
                          {char.role}
                        </p>
                      )}
                    </div>
                    {char.actant_role && (
                      <span className="self-start text-xs sm:text-sm font-mono font-bold uppercase px-3 py-1 rounded-full bg-[#bb3e03]/10 dark:bg-[#ee9b00]/15 text-[#bb3e03] dark:text-[#ee9b00] border border-[#bb3e03]/30 dark:border-[#ee9b00]/30 shrink-0 shadow-sm">
                        {capitalizeWords(char.actant_role)}
                      </span>
                    )}
                  </div>

                  {char.description && (
                    <p className="text-base font-prose text-foreground/90 leading-relaxed italic border-l-3 border-[#005f73]/40 dark:border-[#94d2bd]/40 pl-3 break-words">
                      {char.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1 text-xs sm:text-sm font-mono">
                    {char.gender && (
                      <span className="px-2.5 py-1 rounded-lg bg-muted text-foreground/90 border border-border">
                        Gender: <strong className="text-foreground">{capitalizeWords(char.gender)}</strong>
                      </span>
                    )}
                    {char.complexity && (
                      <span className="px-2.5 py-1 rounded-lg bg-muted text-foreground/90 border border-border">
                        Complexity: <strong className="text-foreground">{capitalizeWords(char.complexity)}</strong>
                      </span>
                    )}
                    {char.development && (
                      <span className="px-2.5 py-1 rounded-lg bg-muted text-foreground/90 border border-border">
                        Dev: <strong className="text-foreground">{capitalizeWords(char.development)}</strong>
                      </span>
                    )}
                    {char.characterisation && (
                      <span className="px-2.5 py-1 rounded-lg bg-muted text-foreground/90 border border-border">
                        Char: <strong className="text-foreground">{capitalizeWords(char.characterisation)}</strong>
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-border text-base">
                  {char.motivation && (
                    <div className="p-3.5 sm:p-4 rounded-xl bg-muted/40 border border-border shadow-sm">
                      <span className="font-mono text-xs sm:text-sm uppercase font-bold text-[#005f73] dark:text-[#94d2bd] block mb-1">
                        Drive & Motivation:
                      </span>
                      <p className="font-prose text-foreground leading-relaxed break-words">{char.motivation}</p>
                    </div>
                  )}
                  {char.conflict && (
                    <div className="p-3.5 sm:p-4 rounded-xl bg-muted/40 border border-border shadow-sm">
                      <span className="font-mono text-xs sm:text-sm uppercase font-bold text-[#bb3e03] dark:text-[#ee9b00] block mb-1">
                        Internal / External Conflict:
                      </span>
                      <p className="font-prose text-foreground leading-relaxed break-words">{char.conflict}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Narrative Structure & MICEC Quotient */}
      {structure && (
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 text-[#005f73] dark:text-[#94d2bd] min-w-0 flex-1">
            <GitMerge className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            <h2 className="font-display font-bold text-lg sm:text-2xl uppercase tracking-wider text-foreground break-words min-w-0">
              Narrative Architecture & MICEC Quotient
            </h2>
          </div>

          <div className="p-4 sm:p-7 lg:p-9 rounded-3xl bg-card border border-border shadow-xl space-y-5 sm:space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#005f73] via-[#0a9396] to-[#bb3e03]" />

            {structure.type_use && (
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-mono flex-wrap">
                <span className="text-muted-foreground uppercase font-bold">Disaster Structural Pattern:</span>
                <span className="px-3 py-1 rounded-full bg-[#bb3e03]/10 dark:bg-[#ee9b00]/15 text-[#bb3e03] dark:text-[#ee9b00] font-bold border border-[#bb3e03]/25 dark:border-[#ee9b00]/30 shadow-sm">
                  {formatVal(structure.type_use)}
                </span>
              </div>
            )}

            {structure.kind && structure.kind.length > 0 && (
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs sm:text-sm font-mono text-muted-foreground uppercase font-bold">
                  Thread Sequence:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {structure.kind.map((k, idx) => (
                    <span
                      key={idx}
                      className="w-8 h-8 rounded-xl bg-[#005f73]/10 dark:bg-[#0a9396]/15 text-[#005f73] dark:text-[#94d2bd] border border-[#005f73]/30 dark:border-[#0a9396]/30 font-mono font-bold flex items-center justify-center text-sm shadow-sm"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {structure.logic && structure.logic.length > 0 && (
              <div className="space-y-2.5 pt-1">
                <span className="text-xs sm:text-sm font-mono text-muted-foreground uppercase tracking-wider font-bold block">
                  Thread Logic Progression:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {structure.logic.map((l, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border shadow-sm font-prose text-base text-foreground leading-relaxed break-words"
                    >
                      {formatVal(l)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 6. Complete Scene-Sequel Dramatic Units */}
      {sceneSequels.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2.5 text-[#bb3e03] dark:text-[#ee9b00] min-w-0 flex-1">
              <Layers className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              <h2 className="font-display font-bold text-lg sm:text-2xl uppercase tracking-wider text-foreground break-words min-w-0">
                Scene-Sequel Dramatic Units ({sceneSequels.length} Cycles)
              </h2>
            </div>
            <div className="flex items-center gap-2 text-sm font-mono">
              <button
                type="button"
                onClick={expandAllScenes}
                className="px-3 py-1.5 rounded-xl bg-card hover:bg-muted text-foreground font-semibold border border-border shadow-sm cursor-pointer transition-colors"
              >
                Expand All
              </button>
              <button
                type="button"
                onClick={collapseAllScenes}
                className="px-3 py-1.5 rounded-xl bg-card hover:bg-muted text-foreground font-semibold border border-border shadow-sm cursor-pointer transition-colors"
              >
                Collapse All
              </button>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-5">
            {sceneSequels.map((unit, idx) => {
              const isExpanded = !!expandedScenes[idx];
              const scene = unit.scene;
              const sequel = unit.sequel;
              const context = unit.context ? formatVal(unit.context) : `Act ${idx + 1}`;

              return (
                <div
                  key={idx}
                  className="rounded-3xl bg-card border border-border hover:border-[#0a9396]/60 shadow-lg hover:shadow-xl overflow-hidden transition-all duration-300"
                >
                  {/* Scene-Sequel Header Accordion Trigger - Highly Responsive */}
                  <button
                    type="button"
                    onClick={() => toggleScene(idx)}
                    className="w-full p-4 sm:p-6 flex items-center justify-between text-left hover:bg-muted/30 transition-colors cursor-pointer gap-2.5"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                      <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#bb3e03]/10 dark:bg-[#ee9b00]/15 text-[#bb3e03] dark:text-[#ee9b00] border border-[#bb3e03]/25 dark:border-[#ee9b00]/30 font-mono font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-sm mt-0.5 sm:mt-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1 space-y-1">
                        <span className="font-display font-bold text-sm sm:text-base lg:text-lg text-foreground block truncate">
                          {scene?.goal?.description ? scene.goal.description.slice(0, 75) + '...' : `Dramatic Cycle #${idx + 1}`}
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] sm:text-xs font-mono px-2 py-0.5 rounded-full bg-muted text-foreground/80 border border-border font-medium">
                            Context: {context}
                          </span>
                          {scene?.disaster?.outcome && (
                            <span className="text-[11px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#bb3e03]/10 dark:bg-[#ee9b00]/15 text-[#bb3e03] dark:text-[#ee9b00] border border-[#bb3e03]/25 dark:border-[#ee9b00]/30">
                              {formatVal(scene.disaster.outcome)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-muted-foreground shrink-0 ml-1">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </button>

                  {/* Expanded Body */}
                  {isExpanded && (
                    <div className="p-4 sm:p-7 pt-2 space-y-6 sm:space-y-7 border-t border-border">
                      {/* Part A: SCENE */}
                      {scene && (
                        <div className="space-y-4">
                          <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[#005f73] dark:text-[#94d2bd] flex items-center gap-2">
                            ◈ PART A: SCENE (Action & Conflict)
                          </span>

                          {/* Goal */}
                          {scene.goal && (
                            <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border space-y-2.5">
                              <span className="font-mono text-xs sm:text-sm font-bold uppercase text-[#005f73] dark:text-[#94d2bd] block">
                                Scene Goal:
                              </span>
                              <p className="font-prose text-base sm:text-lg text-foreground leading-relaxed break-words">
                                {formatVal(scene.goal.description)}
                              </p>
                              {(scene.goal.stakes?.external || scene.goal.stakes?.internal) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                  {scene.goal.stakes.external && (
                                    <div className="p-3.5 rounded-xl bg-card border border-border shadow-sm">
                                      <span className="font-mono text-xs uppercase text-muted-foreground block font-bold mb-1">
                                        External Stakes:
                                      </span>
                                      <span className="font-prose text-base text-foreground leading-relaxed break-words">{formatVal(scene.goal.stakes.external)}</span>
                                    </div>
                                  )}
                                  {scene.goal.stakes.internal && (
                                    <div className="p-3.5 rounded-xl bg-card border border-border shadow-sm">
                                      <span className="font-mono text-xs uppercase text-muted-foreground block font-bold mb-1">
                                        Internal Stakes:
                                      </span>
                                      <span className="font-prose text-base text-foreground leading-relaxed break-words">{formatVal(scene.goal.stakes.internal)}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Conflict & Escalation */}
                          {scene.conflict && (
                            <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border space-y-2.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs sm:text-sm font-bold uppercase text-foreground">
                                  Conflict:
                                </span>
                                {scene.conflict.opposition?.type && (
                                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#bb3e03]/10 dark:bg-[#ee9b00]/15 text-[#bb3e03] dark:text-[#ee9b00] border border-[#bb3e03]/25 dark:border-[#ee9b00]/30 font-bold">
                                    Type: {formatVal(scene.conflict.opposition.type)}
                                  </span>
                                )}
                              </div>
                              {scene.conflict.opposition?.description && (
                                <p className="font-prose text-base sm:text-lg text-foreground leading-relaxed break-words">
                                  {formatVal(scene.conflict.opposition.description)}
                                </p>
                              )}
                              {scene.conflict.escalation?.beats && scene.conflict.escalation.beats.length > 0 && (
                                <div className="space-y-2 pt-2 border-t border-border/60">
                                  <span className="font-mono text-xs uppercase text-muted-foreground block font-bold">
                                    Escalation Beats:
                                  </span>
                                  <ul className="list-disc list-inside space-y-1 text-base font-prose text-foreground/90">
                                    {scene.conflict.escalation.beats.map((beat, bIdx) => (
                                      <li key={bIdx} className="break-words">{formatVal(beat)}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Disaster */}
                          {scene.disaster && (
                            <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border space-y-2.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs sm:text-sm font-bold uppercase text-[#bb3e03] dark:text-[#ee9b00]">
                                  Disaster Outcome:
                                </span>
                                <span className="text-xs sm:text-sm font-mono font-bold text-foreground bg-card px-2.5 py-0.5 rounded-full border border-border">
                                  {formatVal(scene.disaster.outcome)}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                {scene.disaster.consequence?.plot && (
                                  <div className="p-3.5 rounded-xl bg-card border border-border shadow-sm">
                                    <span className="font-mono text-xs uppercase text-muted-foreground block font-bold mb-1">
                                      Plot Consequence:
                                    </span>
                                    <span className="font-prose text-base text-foreground leading-relaxed break-words">{formatVal(scene.disaster.consequence.plot)}</span>
                                  </div>
                                )}
                                {scene.disaster.consequence?.character && (
                                  <div className="p-3.5 rounded-xl bg-card border border-border shadow-sm">
                                    <span className="font-mono text-xs uppercase text-muted-foreground block font-bold mb-1">
                                      Character Consequence:
                                    </span>
                                    <span className="font-prose text-base text-foreground leading-relaxed break-words">{formatVal(scene.disaster.consequence.character)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Part B: SEQUEL */}
                      {sequel && (
                        <div className="space-y-4 pt-4 border-t border-border">
                          <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[#bb3e03] dark:text-[#ee9b00] flex items-center gap-2">
                            ◈ PART B: SEQUEL (Reaction, Dilemma & Decision)
                          </span>

                          {/* Reaction */}
                          {sequel.reaction && (
                            <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border space-y-2.5">
                              <span className="font-mono text-xs sm:text-sm font-bold uppercase text-foreground block">
                                Reaction & Processing:
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {sequel.reaction.emotional?.immediate && (
                                  <div className="p-3.5 rounded-xl bg-card border border-border shadow-sm">
                                    <span className="font-mono text-xs uppercase text-muted-foreground block font-bold mb-1">
                                      Emotional Reaction:
                                    </span>
                                    <span className="font-prose text-base text-foreground leading-relaxed break-words">{formatVal(sequel.reaction.emotional.immediate)}</span>
                                  </div>
                                )}
                                {sequel.reaction.physical && (
                                  <div className="p-3.5 rounded-xl bg-card border border-border shadow-sm">
                                    <span className="font-mono text-xs uppercase text-muted-foreground block font-bold mb-1">
                                      Physical Reaction:
                                    </span>
                                    <span className="font-prose text-base text-foreground leading-relaxed break-words">{formatVal(sequel.reaction.physical)}</span>
                                  </div>
                                )}
                              </div>
                              {(sequel.reaction.processing || sequel.processing) && (
                                <div className="p-3.5 rounded-xl bg-card border border-border shadow-sm">
                                  <span className="font-mono text-xs uppercase text-muted-foreground block font-bold mb-1">
                                    Cognitive Processing:
                                  </span>
                                  <span className="font-prose text-base text-foreground leading-relaxed break-words">
                                    {formatVal(sequel.reaction.processing || sequel.processing)}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Dilemma Options */}
                          {sequel.dilemma?.options && sequel.dilemma.options.length > 0 && (
                            <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border space-y-2.5">
                              <span className="font-mono text-xs sm:text-sm font-bold uppercase text-foreground block">
                                Dilemma Options Considered:
                              </span>
                              <div className="space-y-3">
                                {sequel.dilemma.options.map((opt, oIdx) => (
                                  <div key={oIdx} className="p-3.5 sm:p-4 rounded-xl bg-card border border-border shadow-sm space-y-2">
                                    <span className="font-mono text-xs sm:text-sm font-bold text-[#bb3e03] dark:text-[#ee9b00] block break-words">
                                      Option {oIdx + 1}: {formatVal(opt.choice)}
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm pt-1">
                                      {opt.cost && (
                                        <div className="break-words">
                                          <span className="text-muted-foreground font-mono font-bold text-xs">Cost: </span>
                                          <span className="text-foreground font-prose">{formatVal(opt.cost)}</span>
                                        </div>
                                      )}
                                      {opt.risk && (
                                        <div className="break-words">
                                          <span className="text-muted-foreground font-mono font-bold text-xs">Risk: </span>
                                          <span className="text-foreground font-prose">{formatVal(opt.risk)}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Decision */}
                          {sequel.decision && (
                            <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border space-y-2.5">
                              <span className="font-mono text-xs sm:text-sm font-bold uppercase text-[#005f73] dark:text-[#94d2bd] block">
                                Final Decision:
                              </span>
                              {sequel.decision.chosen_option && (
                                <p className="font-prose font-bold text-foreground text-base sm:text-lg break-words">
                                  {formatVal(sequel.decision.chosen_option)}
                                </p>
                              )}
                              {sequel.decision.rationale && (
                                <div className="p-3.5 rounded-xl bg-card border border-border shadow-sm">
                                  <span className="font-mono text-xs uppercase text-muted-foreground block font-bold mb-1">
                                    Rationale:
                                  </span>
                                  <span className="font-prose text-base text-foreground leading-relaxed break-words">{formatVal(sequel.decision.rationale)}</span>
                                </div>
                              )}
                              {sequel.decision.new_goal && (
                                <div className="p-3.5 rounded-xl bg-card border border-border shadow-sm">
                                  <span className="font-mono text-xs uppercase text-muted-foreground block font-bold mb-1">
                                    New Goal for Next Cycle:
                                  </span>
                                  <span className="font-prose text-base text-foreground leading-relaxed break-words">{formatVal(sequel.decision.new_goal)}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 7. Discourse Semiotics & Voice */}
      {discourse && (
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 text-[#005f73] dark:text-[#94d2bd] min-w-0 flex-1">
            <Compass className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            <h2 className="font-display font-bold text-lg sm:text-2xl uppercase tracking-wider text-foreground break-words min-w-0">
              Discourse Semiotics & Voice
            </h2>
          </div>

          <div className="p-4 sm:p-7 lg:p-9 rounded-3xl bg-card border border-border shadow-xl space-y-6 sm:space-y-7 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#005f73] via-[#0a9396] to-[#94d2bd]" />

            {/* Narration */}
            {discourse.narration && (
              <div className="space-y-2.5">
                <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-muted-foreground block">
                  Narratological Modes:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs sm:text-sm font-mono">
                  {discourse.narration.voice && (
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border shadow-sm min-w-0">
                      <span className="text-[11px] text-muted-foreground uppercase block font-bold mb-1">Voice</span>
                      <span className="font-bold text-foreground text-sm sm:text-base break-words">{capitalizeWords(discourse.narration.voice)}</span>
                    </div>
                  )}
                  {discourse.narration.level && (
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border shadow-sm min-w-0">
                      <span className="text-[11px] text-muted-foreground uppercase block font-bold mb-1">Level</span>
                      <span className="font-bold text-foreground text-sm sm:text-base break-words">{capitalizeWords(discourse.narration.level)}</span>
                    </div>
                  )}
                  {discourse.narration.focalisation && (
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border shadow-sm min-w-0">
                      <span className="text-[11px] text-muted-foreground uppercase block font-bold mb-1">Focalisation</span>
                      <span className="font-bold text-foreground text-sm sm:text-base break-words">{capitalizeWords(discourse.narration.focalisation)}</span>
                    </div>
                  )}
                  {discourse.narration.reliability && (
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border shadow-sm min-w-0">
                      <span className="text-[11px] text-muted-foreground uppercase block font-bold mb-1">Reliability</span>
                      <span className="font-bold text-foreground text-sm sm:text-base break-words">{capitalizeWords(discourse.narration.reliability)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Language & Tone */}
            {(discourse.language || discourse.language_style || story?.pov) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {discourse.language?.tone && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border space-y-1 shadow-sm">
                    <span className="font-mono text-xs sm:text-sm text-[#005f73] dark:text-[#94d2bd] uppercase font-bold block mb-1">
                      Tone & Atmosphere
                    </span>
                    <p className="font-prose text-base sm:text-lg text-foreground leading-relaxed break-words">{formatVal(discourse.language.tone)}</p>
                  </div>
                )}
                {discourse.language?.diction && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border space-y-1 shadow-sm">
                    <span className="font-mono text-xs sm:text-sm text-[#005f73] dark:text-[#94d2bd] uppercase font-bold block mb-1">
                      Diction Quality
                    </span>
                    <p className="font-prose text-base sm:text-lg text-foreground leading-relaxed break-words">{capitalizeWords(discourse.language.diction)}</p>
                  </div>
                )}
                {story?.pov && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border space-y-1 shadow-sm">
                    <span className="font-mono text-xs sm:text-sm text-[#bb3e03] dark:text-[#ee9b00] uppercase font-bold block mb-1">
                      Point of View (POV)
                    </span>
                    <p className="font-prose text-base sm:text-lg text-foreground leading-relaxed break-words">{capitalizeWords(story.pov)}</p>
                  </div>
                )}
                {discourse.language?.mode_balance && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border space-y-1 shadow-sm">
                    <span className="font-mono text-xs sm:text-sm text-[#bb3e03] dark:text-[#ee9b00] uppercase font-bold block mb-1">
                      Mode Balance
                    </span>
                    <p className="font-prose text-base sm:text-lg text-foreground leading-relaxed break-words">{capitalizeWords(discourse.language.mode_balance)}</p>
                  </div>
                )}
              </div>
            )}

            {/* Figures of Speech */}
            {discourse.language?.figures_of_speech && discourse.language.figures_of_speech.length > 0 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border space-y-2 shadow-sm">
                <span className="font-mono text-xs sm:text-sm text-muted-foreground uppercase font-bold block">
                  Figures of Speech & Metaphors
                </span>
                <ul className="list-disc list-inside space-y-1 font-prose text-base text-foreground leading-relaxed">
                  {discourse.language.figures_of_speech.map((fig, fIdx) => (
                    <li key={fIdx} className="break-words">{formatVal(fig)}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 8. Visual Concept & Aesthetic Architecture */}
      {aesthetic && (
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 text-[#bb3e03] dark:text-[#ee9b00] min-w-0 flex-1">
            <Palette className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            <h2 className="font-display font-bold text-lg sm:text-2xl uppercase tracking-wider text-foreground break-words min-w-0">
              Visual Concept & Aesthetic Architecture
            </h2>
          </div>

          <div className="p-4 sm:p-7 lg:p-9 rounded-3xl bg-card border border-border shadow-xl space-y-6 sm:space-y-7 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#bb3e03] via-[#ee9b00] to-[#0a9396]" />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {aesthetic.art_style && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border shadow-sm space-y-1">
                  <span className="font-mono text-xs uppercase text-muted-foreground block font-bold">Art Style</span>
                  <span className="font-prose text-base text-foreground font-medium break-words">{formatVal(aesthetic.art_style)}</span>
                </div>
              )}
              {aesthetic.color_palette && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border shadow-sm space-y-1">
                  <span className="font-mono text-xs uppercase text-muted-foreground block font-bold">Color Palette</span>
                  <span className="font-prose text-base text-foreground font-medium break-words">{formatVal(aesthetic.color_palette)}</span>
                </div>
              )}
              {aesthetic.lighting && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border shadow-sm space-y-1">
                  <span className="font-mono text-xs uppercase text-muted-foreground block font-bold">Lighting</span>
                  <span className="font-prose text-base text-foreground font-medium break-words">{formatVal(aesthetic.lighting)}</span>
                </div>
              )}
              {aesthetic.composition && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border shadow-sm space-y-1">
                  <span className="font-mono text-xs uppercase text-muted-foreground block font-bold">Composition</span>
                  <span className="font-prose text-base text-foreground font-medium break-words">{formatVal(aesthetic.composition)}</span>
                </div>
              )}
              {aesthetic.mood && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border shadow-sm space-y-1">
                  <span className="font-mono text-xs uppercase text-muted-foreground block font-bold">Mood</span>
                  <span className="font-prose text-base text-foreground font-medium break-words">{formatVal(aesthetic.mood)}</span>
                </div>
              )}
              {aesthetic.subject_matter && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border shadow-sm space-y-1">
                  <span className="font-mono text-xs uppercase text-muted-foreground block font-bold">Subject Matter</span>
                  <span className="font-prose text-base text-foreground font-medium break-words">{formatVal(aesthetic.subject_matter)}</span>
                </div>
              )}
            </div>

            {(aesthetic.prompt || story?.image_prompt) && (
              <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border space-y-2.5 shadow-sm overflow-hidden">
                <span className="font-mono text-xs sm:text-sm font-bold uppercase text-[#bb3e03] dark:text-[#ee9b00] block">
                  Algorithmic Concept Generation Prompt:
                </span>
                <p className="font-prose text-sm sm:text-base text-foreground leading-relaxed italic bg-card p-3.5 sm:p-4 rounded-xl border border-border shadow-sm break-words">
                  {aesthetic.prompt || story?.image_prompt}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 9. Speculative Lexicon & Vocabularies */}
      {vocabs.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2.5 text-[#005f73] dark:text-[#94d2bd] min-w-0 flex-1">
            <BookMarked className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            <h2 className="font-display font-bold text-lg sm:text-2xl uppercase tracking-wider text-foreground break-words min-w-0">
              Speculative Lexicon ({vocabs.length} Terms)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {vocabs.map((term, vIdx) => (
              <div
                key={vIdx}
                className="p-4 sm:p-5 rounded-2xl bg-card border border-border hover:border-[#0a9396] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-2.5 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-display font-bold text-base sm:text-lg text-foreground group-hover:text-[#005f73] dark:group-hover:text-[#94d2bd] transition-colors break-words">
                      {formatVal(term.word)}
                    </span>
                    {term.lex_category && (
                      <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-muted text-foreground/80 border border-border">
                        {formatVal(term.lex_category)}
                      </span>
                    )}
                  </div>
                  {term.definition && (
                    <p className="font-prose text-sm sm:text-base text-foreground/90 leading-relaxed pt-2 break-words">
                      {term.definition}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
