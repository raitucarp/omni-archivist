import React from 'react';
import { notFound } from 'next/navigation';
import { getAllStories } from '@/lib/artifacts';
import { StoryReaderView } from '@/components/story-reader-view';

interface StoryPageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateStaticParams() {
  const stories = getAllStories();
  return stories.map((s) => ({ slug: s.slug }));
}

export default async function StoryPage({ params }: StoryPageProps) {
  const { slug } = await params;
  const stories = getAllStories();
  const slugPath = slug.join('/');
  const story = stories.find((s) => s.slug.join('/') === slugPath);

  if (!story) {
    notFound();
  }

  return <StoryReaderView story={story} />;
}
