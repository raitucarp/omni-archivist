import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllStories } from '@/lib/artifacts';
import { StoryReaderView } from '@/components/story-reader-view';

interface StoryPageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  const stories = getAllStories();
  const paths: { slug: string[] }[] = [];
  for (const s of stories) {
    // 1. Reading view: /stories/YYYY/MM/DD/
    paths.push({ slug: s.slug });
    // 2. Dedicated metadata dossier: /stories/YYYY/MM/DD/metadata/
    paths.push({ slug: [...s.slug, 'metadata'] });
  }
  return paths;
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const stories = getAllStories();

  const isMetadata = slug.length > 0 && slug[slug.length - 1] === 'metadata';
  const storySlug = isMetadata ? slug.slice(0, -1) : slug;
  const slugPath = storySlug.join('/');
  const story = stories.find((s) => s.slug.join('/') === slugPath);

  if (!story) {
    return {
      title: 'Story Not Found — Omni Archivist',
    };
  }

  if (isMetadata) {
    return {
      title: `${story.title} — Archival Metadata Dossier | Omni Archivist`,
      description: `Complete narratological, linguistic, and structural metadata dossier for "${story.title}" (${story.genre} / ${story.scienceField}).`,
    };
  }

  return {
    title: `${story.title} — Omni Archivist`,
    description: story.logline || story.blurb || story.synopsis,
  };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { slug } = await params;
  const stories = getAllStories();

  const isMetadata = slug.length > 0 && slug[slug.length - 1] === 'metadata';
  const storySlug = isMetadata ? slug.slice(0, -1) : slug;
  const slugPath = storySlug.join('/');
  const story = stories.find((s) => s.slug.join('/') === slugPath);

  if (!story) {
    notFound();
  }

  return <StoryReaderView story={story} initialTab={isMetadata ? 'metadata' : 'story'} />;
}
