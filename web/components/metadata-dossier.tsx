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
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      {/* 1. Dossier Master Header */}
      <section className="p-6 sm:p-10 rounded-3xl bg-card border border-border shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#bb3e03] dark:via-[#ee9b00] to-transparent" />
        
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-[#bb3e03]/10 dark:bg-[#ee9b00]/15 text-[#bb3e03] dark:text-[#ee9b00] border border-[#bb3e03]/25 dark:border-[#ee9b00]/30">
            ◈ SEMIOTIC TRANSMISSION DOSSIER
          </span>
          <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-[#005f73]/10 dark:bg-[#0a9396]/15 text-[#005f73] dark:text-[#94d2bd] border border-[#005f73]/25 dark:border-[#0a9396]/30">
            {scienceField}
          </span>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-muted text-foreground border border-border">
            {genre}
          </span>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-muted text-foreground border border-border">
            {readingTime}
          </span>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border">
            {dateStr}
          </span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground mb-2">
          {title}
        </h1>
        {subtitle && (
          <p className="font-prose italic text-xl sm:text-2xl text-[#bb3e03] dark:text-[#ee9b00] mb-6">
            {subtitle}
          </p>
        )}

        {/* Blurb & Logline */}
        <div className="space-y-4 pt-2">
          {story?.logline && (
            <div className="p-4 rounded-xl bg-muted/60 border-l-3 border-[#bb3e03] dark:border-[#ee9b00]">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#bb3e03] dark:text-[#ee9b00] font-bold block mb-1">
                Logline
              </span>
              <p className="font-prose italic text-base sm:text-lg text-foreground leading-relaxed">
                “{story.logline}”
              </p>
            </div>
          )}

          {story?.blurb && (
            <div className="text-sm sm:text-base font-prose text-foreground/90 leading-relaxed">
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider block mb-1">
                Archival Blurb
              </span>
              <p>{story.blurb}</p>
            </div>
          )}

          {story?.synopsis && (
            <div className="text-sm sm:text-base font-prose text-foreground/90 leading-relaxed bg-muted/40 p-5 rounded-xl border border-border">
              <span className="font-mono text-xs text-[#005f73] dark:text-[#94d2bd] uppercase tracking-wider font-bold block mb-1.5">
                Narrative Synopsis
              </span>
              <p>{story.synopsis}</p>
            </div>
          )}

          {/* Meta Field Descriptions */}
          {(meta?.science_field?.description || meta?.genre?.description) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {meta?.science_field?.description && (
                <div className="p-4 rounded-xl bg-card border border-border text-xs leading-relaxed">
                  <span className="font-mono uppercase font-semibold text-[#005f73] dark:text-[#94d2bd] block mb-1">
                    Science Domain: {scienceField}
                  </span>
                  <p className="text-foreground/80">{meta.science_field.description}</p>
                </div>
              )}
              {meta?.genre?.description && (
                <div className="p-4 rounded-xl bg-card border border-border text-xs leading-relaxed">
                  <span className="font-mono uppercase font-semibold text-[#bb3e03] dark:text-[#ee9b00] block mb-1">
                    Genre Archetype: {genre}
                  </span>
                  <p className="text-foreground/80">{meta.genre.description}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 2. Theme & Speculative Inquiry */}
      {theme && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-[#bb3e03] dark:text-[#ee9b00]">
            <Sparkles className="w-5 h-5" />
            <h2 className="font-display font-bold text-xl uppercase tracking-wider text-foreground">
              Philosophical & Thematic Premise
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {theme.central_premise && (
              <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
                <h3 className="text-xs font-mono uppercase tracking-widest text-[#005f73] dark:text-[#94d2bd] font-bold mb-2">
                  Central Premise
                </h3>
                <p className="font-prose text-base leading-relaxed text-foreground">
                  {theme.central_premise}
                </p>
              </div>
            )}

            {theme.speculative_inquiry && (
              <div className="p-5 rounded-2xl bg-card border border-border shadow-sm">
                <h3 className="text-xs font-mono uppercase tracking-widest text-[#bb3e03] dark:text-[#ee9b00] font-bold mb-2">
                  Speculative Inquiry
                </h3>
                <p className="font-prose italic text-base leading-relaxed text-foreground">
                  “{theme.speculative_inquiry}”
                </p>
              </div>
            )}
          </div>

          {theme.motifs && theme.motifs.length > 0 && (
            <div className="p-4 rounded-2xl bg-muted/50 border border-border flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-muted-foreground uppercase font-semibold">
                Thematic Motifs:
              </span>
              {theme.motifs.map((m, idx) => (
                <span
                  key={idx}
                  className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-card border border-border text-foreground"
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
          <div className="flex items-center gap-2 text-[#005f73] dark:text-[#94d2bd]">
            <Globe className="w-5 h-5" />
            <h2 className="font-display font-bold text-xl uppercase tracking-wider text-foreground">
              Setting & Deep-Time Chronotope
            </h2>
          </div>

          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-6">
            {setting.chronotope && (
              <div className="p-4 rounded-2xl bg-[#005f73]/5 dark:bg-[#0a9396]/10 border border-[#005f73]/20 dark:border-[#0a9396]/30">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#005f73] dark:text-[#94d2bd] block mb-1">
                  Chronotope Matrix
                </span>
                <p className="font-prose italic text-base text-foreground leading-relaxed">
                  “{setting.chronotope}”
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {setting.macro && (
                <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                    Macro Setting
                  </span>
                  <p className="text-xs font-prose text-foreground leading-relaxed">{setting.macro}</p>
                </div>
              )}
              {setting.meso && (
                <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                    Meso Setting
                  </span>
                  <p className="text-xs font-prose text-foreground leading-relaxed">{setting.meso}</p>
                </div>
              )}
              {setting.micro && (
                <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                    Micro Setting
                  </span>
                  <p className="text-xs font-prose text-foreground leading-relaxed">{setting.micro}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {setting.topography && (
                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                    Geological Topography
                  </span>
                  <p className="text-xs sm:text-sm font-prose text-foreground leading-relaxed">{setting.topography}</p>
                </div>
              )}
              {setting.atmosphere && (
                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-bold">
                    Atmospheric Sensory Landscape
                  </span>
                  <p className="text-xs sm:text-sm font-prose text-foreground leading-relaxed">{setting.atmosphere}</p>
                </div>
              )}
            </div>

            {setting.function && (
              <div className="flex items-center gap-2 pt-1 text-xs font-mono">
                <span className="text-muted-foreground uppercase font-semibold">Narrative Setting Function:</span>
                <span className="px-2.5 py-1 rounded-md bg-muted text-foreground border border-border font-medium">
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
          <div className="flex items-center gap-2 text-[#bb3e03] dark:text-[#ee9b00]">
            <Users className="w-5 h-5" />
            <h2 className="font-display font-bold text-xl uppercase tracking-wider text-foreground">
              Dramatis Personae & Actant Architecture
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {characters.map((char, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-card border border-border shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <h3 className="font-display font-bold text-xl text-foreground">
                        {char.name || 'Unnamed Agent'}
                      </h3>
                      {char.role && (
                        <p className="text-xs font-mono text-[#005f73] dark:text-[#94d2bd] font-semibold mt-0.5">
                          {char.role}
                        </p>
                      )}
                    </div>
                    {char.actant_role && (
                      <span className="text-xs font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-[#bb3e03]/10 dark:bg-[#ee9b00]/15 text-[#bb3e03] dark:text-[#ee9b00] border border-[#bb3e03]/30 dark:border-[#ee9b00]/30 shrink-0">
                        {capitalizeWords(char.actant_role)}
                      </span>
                    )}
                  </div>

                  {char.description && (
                    <p className="text-xs sm:text-sm font-prose text-foreground/90 leading-relaxed italic border-l-2 border-border pl-3">
                      {char.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] font-mono">
                    {char.gender && (
                      <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                        Gender: {capitalizeWords(char.gender)}
                      </span>
                    )}
                    {char.complexity && (
                      <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                        Complexity: {capitalizeWords(char.complexity)}
                      </span>
                    )}
                    {char.development && (
                      <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                        Dev: {capitalizeWords(char.development)}
                      </span>
                    )}
                    {char.characterisation && (
                      <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                        Char: {capitalizeWords(char.characterisation)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-border text-xs">
                  {char.motivation && (
                    <div className="p-3 rounded-xl bg-muted/40 border border-border">
                      <span className="font-mono uppercase font-bold text-[#005f73] dark:text-[#94d2bd] block mb-0.5">
                        Drive & Motivation:
                      </span>
                      <p className="font-prose text-foreground/90 leading-relaxed">{char.motivation}</p>
                    </div>
                  )}
                  {char.conflict && (
                    <div className="p-3 rounded-xl bg-muted/40 border border-border">
                      <span className="font-mono uppercase font-bold text-[#bb3e03] dark:text-[#ee9b00] block mb-0.5">
                        Internal / External Conflict:
                      </span>
                      <p className="font-prose text-foreground/90 leading-relaxed">{char.conflict}</p>
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
          <div className="flex items-center gap-2 text-[#005f73] dark:text-[#94d2bd]">
            <GitMerge className="w-5 h-5" />
            <h2 className="font-display font-bold text-xl uppercase tracking-wider text-foreground">
              Narrative Architecture & MICEC Quotient
            </h2>
          </div>

          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-6">
            {structure.type_use && (
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-muted-foreground uppercase font-bold">Disaster Structural Pattern:</span>
                <span className="px-3 py-1 rounded-full bg-[#bb3e03]/10 dark:bg-[#ee9b00]/15 text-[#bb3e03] dark:text-[#ee9b00] font-bold border border-[#bb3e03]/25 dark:border-[#ee9b00]/30">
                  {formatVal(structure.type_use)}
                </span>
              </div>
            )}

            {structure.kind && structure.kind.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono text-muted-foreground uppercase font-semibold">
                  Thread Sequence:
                </span>
                {structure.kind.map((k, idx) => (
                  <span
                    key={idx}
                    className="w-8 h-8 rounded-lg bg-[#005f73]/10 dark:bg-[#0a9396]/15 text-[#005f73] dark:text-[#94d2bd] border border-[#005f73]/30 dark:border-[#0a9396]/30 font-mono font-bold flex items-center justify-center text-sm"
                  >
                    {k}
                  </span>
                ))}
              </div>
            )}

            {structure.logic && structure.logic.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider font-bold block">
                  Thread Logic Progression:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {structure.logic.map((l, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-muted/40 border border-border font-prose text-xs sm:text-sm text-foreground leading-relaxed"
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
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-[#bb3e03] dark:text-[#ee9b00]">
              <Layers className="w-5 h-5" />
              <h2 className="font-display font-bold text-xl uppercase tracking-wider text-foreground">
                Scene-Sequel Dramatic Units ({sceneSequels.length} Cycles)
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={expandAllScenes}
                className="px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-foreground border border-border cursor-pointer"
              >
                Expand All
              </button>
              <button
                type="button"
                onClick={collapseAllScenes}
                className="px-2.5 py-1 rounded bg-muted hover:bg-muted/80 text-foreground border border-border cursor-pointer"
              >
                Collapse All
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {sceneSequels.map((unit, idx) => {
              const isExpanded = !!expandedScenes[idx];
              const scene = unit.scene;
              const sequel = unit.sequel;
              const context = unit.context ? formatVal(unit.context) : `Act ${idx + 1}`;

              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden transition-all"
                >
                  {/* Scene-Sequel Header Accordion Trigger */}
                  <button
                    type="button"
                    onClick={() => toggleScene(idx)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-full bg-[#bb3e03]/10 dark:bg-[#ee9b00]/15 text-[#bb3e03] dark:text-[#ee9b00] border border-[#bb3e03]/25 dark:border-[#ee9b00]/30 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display font-bold text-sm sm:text-base text-foreground truncate">
                            {scene?.goal?.description ? scene.goal.description.slice(0, 75) + '...' : `Dramatic Cycle #${idx + 1}`}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                            Context: {context}
                          </span>
                          {scene?.disaster?.outcome && (
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#bb3e03]/10 dark:bg-[#ee9b00]/15 text-[#bb3e03] dark:text-[#ee9b00]">
                              {formatVal(scene.disaster.outcome)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-muted-foreground shrink-0 ml-2">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </button>

                  {/* Expanded Body */}
                  {isExpanded && (
                    <div className="p-4 sm:p-6 pt-0 space-y-6 border-t border-border/60">
                      {/* Part A: SCENE */}
                      {scene && (
                        <div className="space-y-4">
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#005f73] dark:text-[#94d2bd] flex items-center gap-1.5">
                            ◈ PART A: SCENE (Action & Conflict)
                          </span>

                          {/* Goal */}
                          {scene.goal && (
                            <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                              <span className="font-mono text-xs font-bold uppercase text-foreground">
                                Scene Goal:
                              </span>
                              <p className="font-prose text-xs sm:text-sm text-foreground leading-relaxed">
                                {formatVal(scene.goal.description)}
                              </p>
                              {(scene.goal.stakes?.external || scene.goal.stakes?.internal) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                                  {scene.goal.stakes.external && (
                                    <div className="p-2.5 rounded bg-card border border-border">
                                      <span className="font-mono text-[10px] uppercase text-muted-foreground block font-semibold">
                                        External Stakes:
                                      </span>
                                      <span className="font-prose text-foreground/90">{formatVal(scene.goal.stakes.external)}</span>
                                    </div>
                                  )}
                                  {scene.goal.stakes.internal && (
                                    <div className="p-2.5 rounded bg-card border border-border">
                                      <span className="font-mono text-[10px] uppercase text-muted-foreground block font-semibold">
                                        Internal Stakes:
                                      </span>
                                      <span className="font-prose text-foreground/90">{formatVal(scene.goal.stakes.internal)}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Conflict & Escalation */}
                          {scene.conflict && (
                            <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold uppercase text-foreground">
                                  Conflict:
                                </span>
                                {scene.conflict.opposition?.type && (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-card text-[#bb3e03] dark:text-[#ee9b00] border border-border font-semibold">
                                    Type: {formatVal(scene.conflict.opposition.type)}
                                  </span>
                                )}
                              </div>
                              {scene.conflict.opposition?.description && (
                                <p className="font-prose text-xs sm:text-sm text-foreground leading-relaxed">
                                  {formatVal(scene.conflict.opposition.description)}
                                </p>
                              )}
                              {scene.conflict.escalation?.beats && scene.conflict.escalation.beats.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                  <span className="font-mono text-[10px] uppercase text-muted-foreground block font-bold">
                                    Escalation Beats:
                                  </span>
                                  <ul className="list-disc list-inside space-y-1 text-xs font-prose text-foreground/90">
                                    {scene.conflict.escalation.beats.map((beat, bIdx) => (
                                      <li key={bIdx}>{formatVal(beat)}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Disaster */}
                          {scene.disaster && (
                            <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold uppercase text-[#bb3e03] dark:text-[#ee9b00]">
                                  Disaster Outcome:
                                </span>
                                <span className="text-xs font-mono font-bold text-foreground">
                                  {formatVal(scene.disaster.outcome)}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                                {scene.disaster.consequence?.plot && (
                                  <div className="p-2.5 rounded bg-card border border-border">
                                    <span className="font-mono text-[10px] uppercase text-muted-foreground block font-semibold">
                                      Plot Consequence:
                                    </span>
                                    <span className="font-prose text-foreground/90">{formatVal(scene.disaster.consequence.plot)}</span>
                                  </div>
                                )}
                                {scene.disaster.consequence?.character && (
                                  <div className="p-2.5 rounded bg-card border border-border">
                                    <span className="font-mono text-[10px] uppercase text-muted-foreground block font-semibold">
                                      Character Consequence:
                                    </span>
                                    <span className="font-prose text-foreground/90">{formatVal(scene.disaster.consequence.character)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Part B: SEQUEL */}
                      {sequel && (
                        <div className="space-y-4 pt-2 border-t border-border/40">
                          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#bb3e03] dark:text-[#ee9b00] flex items-center gap-1.5">
                            ◈ PART B: SEQUEL (Reaction, Dilemma & Decision)
                          </span>

                          {/* Reaction */}
                          {sequel.reaction && (
                            <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2 text-xs">
                              <span className="font-mono text-xs font-bold uppercase text-foreground block">
                                Reaction & Processing:
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {sequel.reaction.emotional?.immediate && (
                                  <div className="p-2.5 rounded bg-card border border-border">
                                    <span className="font-mono text-[10px] uppercase text-muted-foreground block font-semibold">
                                      Emotional Reaction:
                                    </span>
                                    <span className="font-prose text-foreground/90">{formatVal(sequel.reaction.emotional.immediate)}</span>
                                  </div>
                                )}
                                {sequel.reaction.physical && (
                                  <div className="p-2.5 rounded bg-card border border-border">
                                    <span className="font-mono text-[10px] uppercase text-muted-foreground block font-semibold">
                                      Physical Reaction:
                                    </span>
                                    <span className="font-prose text-foreground/90">{formatVal(sequel.reaction.physical)}</span>
                                  </div>
                                )}
                              </div>
                              {(sequel.reaction.processing || sequel.processing) && (
                                <div className="p-2.5 rounded bg-card border border-border">
                                  <span className="font-mono text-[10px] uppercase text-muted-foreground block font-semibold">
                                    Cognitive Processing:
                                  </span>
                                  <span className="font-prose text-foreground/90">
                                    {formatVal(sequel.reaction.processing || sequel.processing)}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Dilemma Options */}
                          {sequel.dilemma?.options && sequel.dilemma.options.length > 0 && (
                            <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2.5 text-xs">
                              <span className="font-mono text-xs font-bold uppercase text-foreground block">
                                Dilemma Options Considered:
                              </span>
                              <div className="space-y-2">
                                {sequel.dilemma.options.map((opt, oIdx) => (
                                  <div key={oIdx} className="p-3 rounded-lg bg-card border border-border space-y-1">
                                    <span className="font-mono text-[11px] font-bold text-[#bb3e03] dark:text-[#ee9b00] block">
                                      Option {oIdx + 1}: {formatVal(opt.choice)}
                                    </span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                                      {opt.cost && (
                                        <div>
                                          <span className="text-muted-foreground font-mono font-semibold">Cost: </span>
                                          <span className="text-foreground/90">{formatVal(opt.cost)}</span>
                                        </div>
                                      )}
                                      {opt.risk && (
                                        <div>
                                          <span className="text-muted-foreground font-mono font-semibold">Risk: </span>
                                          <span className="text-foreground/90">{formatVal(opt.risk)}</span>
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
                            <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2 text-xs">
                              <span className="font-mono text-xs font-bold uppercase text-[#005f73] dark:text-[#94d2bd] block">
                                Final Decision:
                              </span>
                              {sequel.decision.chosen_option && (
                                <p className="font-prose font-semibold text-foreground text-sm">
                                  {formatVal(sequel.decision.chosen_option)}
                                </p>
                              )}
                              {sequel.decision.rationale && (
                                <div className="p-2.5 rounded bg-card border border-border">
                                  <span className="font-mono text-[10px] uppercase text-muted-foreground block font-semibold">
                                    Rationale:
                                  </span>
                                  <span className="font-prose text-foreground/90">{formatVal(sequel.decision.rationale)}</span>
                                </div>
                              )}
                              {sequel.decision.new_goal && (
                                <div className="p-2.5 rounded bg-card border border-border">
                                  <span className="font-mono text-[10px] uppercase text-muted-foreground block font-semibold">
                                    New Goal for Next Cycle:
                                  </span>
                                  <span className="font-prose text-foreground/90">{formatVal(sequel.decision.new_goal)}</span>
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
          <div className="flex items-center gap-2 text-[#005f73] dark:text-[#94d2bd]">
            <Compass className="w-5 h-5" />
            <h2 className="font-display font-bold text-xl uppercase tracking-wider text-foreground">
              Discourse Semiotics & Voice
            </h2>
          </div>

          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-6">
            {/* Narration */}
            {discourse.narration && (
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground block">
                  Narratological Modes:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  {discourse.narration.voice && (
                    <div className="p-3 rounded-xl bg-muted/40 border border-border">
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Voice</span>
                      <span className="font-semibold text-foreground">{capitalizeWords(discourse.narration.voice)}</span>
                    </div>
                  )}
                  {discourse.narration.level && (
                    <div className="p-3 rounded-xl bg-muted/40 border border-border">
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Level</span>
                      <span className="font-semibold text-foreground">{capitalizeWords(discourse.narration.level)}</span>
                    </div>
                  )}
                  {discourse.narration.focalisation && (
                    <div className="p-3 rounded-xl bg-muted/40 border border-border">
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Focalisation</span>
                      <span className="font-semibold text-foreground">{capitalizeWords(discourse.narration.focalisation)}</span>
                    </div>
                  )}
                  {discourse.narration.reliability && (
                    <div className="p-3 rounded-xl bg-muted/40 border border-border">
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Reliability</span>
                      <span className="font-semibold text-foreground">{capitalizeWords(discourse.narration.reliability)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Language & Tone */}
            {(discourse.language || discourse.language_style || story?.pov) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {discourse.language?.tone && (
                  <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-1 text-xs">
                    <span className="font-mono text-muted-foreground uppercase font-bold block">
                      Tone & Atmosphere
                    </span>
                    <p className="font-prose text-foreground">{formatVal(discourse.language.tone)}</p>
                  </div>
                )}
                {discourse.language?.diction && (
                  <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-1 text-xs">
                    <span className="font-mono text-muted-foreground uppercase font-bold block">
                      Diction Quality
                    </span>
                    <p className="font-prose text-foreground">{capitalizeWords(discourse.language.diction)}</p>
                  </div>
                )}
                {story?.pov && (
                  <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-1 text-xs">
                    <span className="font-mono text-muted-foreground uppercase font-bold block">
                      Point of View (POV)
                    </span>
                    <p className="font-prose text-foreground">{capitalizeWords(story.pov)}</p>
                  </div>
                )}
                {discourse.language?.mode_balance && (
                  <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-1 text-xs">
                    <span className="font-mono text-muted-foreground uppercase font-bold block">
                      Mode Balance
                    </span>
                    <p className="font-prose text-foreground">{capitalizeWords(discourse.language.mode_balance)}</p>
                  </div>
                )}
              </div>
            )}

            {/* Figures of Speech */}
            {discourse.language?.figures_of_speech && discourse.language.figures_of_speech.length > 0 && (
              <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2 text-xs">
                <span className="font-mono text-muted-foreground uppercase font-bold block">
                  Figures of Speech & Metaphors
                </span>
                <ul className="list-disc list-inside space-y-1 font-prose text-foreground">
                  {discourse.language.figures_of_speech.map((fig, fIdx) => (
                    <li key={fIdx}>{formatVal(fig)}</li>
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
          <div className="flex items-center gap-2 text-[#bb3e03] dark:text-[#ee9b00]">
            <Palette className="w-5 h-5" />
            <h2 className="font-display font-bold text-xl uppercase tracking-wider text-foreground">
              Visual Concept & Aesthetic Architecture
            </h2>
          </div>

          <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {aesthetic.art_style && (
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                  <span className="font-mono text-[10px] uppercase text-muted-foreground block font-bold">Art Style</span>
                  <span className="font-prose text-foreground">{formatVal(aesthetic.art_style)}</span>
                </div>
              )}
              {aesthetic.color_palette && (
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                  <span className="font-mono text-[10px] uppercase text-muted-foreground block font-bold">Color Palette</span>
                  <span className="font-prose text-foreground">{formatVal(aesthetic.color_palette)}</span>
                </div>
              )}
              {aesthetic.lighting && (
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                  <span className="font-mono text-[10px] uppercase text-muted-foreground block font-bold">Lighting</span>
                  <span className="font-prose text-foreground">{formatVal(aesthetic.lighting)}</span>
                </div>
              )}
              {aesthetic.composition && (
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                  <span className="font-mono text-[10px] uppercase text-muted-foreground block font-bold">Composition</span>
                  <span className="font-prose text-foreground">{formatVal(aesthetic.composition)}</span>
                </div>
              )}
              {aesthetic.mood && (
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                  <span className="font-mono text-[10px] uppercase text-muted-foreground block font-bold">Mood</span>
                  <span className="font-prose text-foreground">{formatVal(aesthetic.mood)}</span>
                </div>
              )}
              {aesthetic.subject_matter && (
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border">
                  <span className="font-mono text-[10px] uppercase text-muted-foreground block font-bold">Subject Matter</span>
                  <span className="font-prose text-foreground">{formatVal(aesthetic.subject_matter)}</span>
                </div>
              )}
            </div>

            {(aesthetic.prompt || story?.image_prompt) && (
              <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2 text-xs">
                <span className="font-mono text-xs font-bold uppercase text-[#bb3e03] dark:text-[#ee9b00] block">
                  Algorithmic Concept Generation Prompt:
                </span>
                <p className="font-prose text-foreground leading-relaxed italic bg-card p-3 rounded-lg border border-border">
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
          <div className="flex items-center gap-2 text-[#005f73] dark:text-[#94d2bd]">
            <BookMarked className="w-5 h-5" />
            <h2 className="font-display font-bold text-xl uppercase tracking-wider text-foreground">
              Speculative Lexicon ({vocabs.length} Terms)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {vocabs.map((term, vIdx) => (
              <div
                key={vIdx}
                className="p-3.5 rounded-xl bg-card border border-border shadow-sm flex flex-col justify-between space-y-1.5"
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-display font-bold text-sm text-foreground">
                      {formatVal(term.word)}
                    </span>
                    {term.lex_category && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                        {formatVal(term.lex_category)}
                      </span>
                    )}
                  </div>
                  {term.definition && (
                    <p className="font-prose text-xs text-foreground/80 leading-relaxed pt-1">
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
