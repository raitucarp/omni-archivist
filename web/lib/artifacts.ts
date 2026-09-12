import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

export interface StoryMetadata {
  story?: {
    title?: string;
    subtitle?: string;
    blurb?: string;
    logline?: string;
    synopsis?: string;
    theme?: {
      central_premise?: string;
      speculative_inquiry?: string;
      motifs?: string[];
    };
    setting?: {
      macro?: string;
      meso?: string;
      micro?: string;
      topography?: string;
      atmosphere?: string;
      chronotope?: string;
    };
    structure?: {
      kind?: string[];
      logic?: string[];
      type_use?: string;
    };
    characters?: Array<{
      name?: string;
      gender?: string;
      role?: string;
      actant_role?: string;
      complexity?: string;
      development?: string;
      description?: string;
      motivation?: string;
      conflict?: string;
    }>;
    scene_sequels?: Array<{
      scene?: {
        goal?: { description?: string; stakes?: { external?: string; internal?: string } };
        conflict?: { opposition?: { type?: string; description?: string }; escalation?: { beats?: string[] } };
        disaster?: { outcome?: string; consequence?: { plot?: string; character?: string } };
      };
      sequel?: {
        reaction?: { emotional?: { immediate?: string }; physical?: string };
        dilemma?: { options?: string[] };
        decision?: { rationale?: string };
      };
    }>;
    discourse?: {
      narration?: {
        voice?: string;
        focalisation?: string;
        speed?: string;
        order?: string;
        frequency?: string;
      };
      language_style?: {
        syntax?: string;
        diction?: string;
      };
    };
  };
  meta?: {
    science_field?: { name?: string; domains?: string[] };
    genre?: { name?: string; tropes?: string[] };
  };
}

export interface StoryItem {
  id: string; // "2026-09-12"
  slug: string[]; // ["2026", "09", "12"]
  year: number;
  month: number;
  day: number;
  yearHE: number;
  weekNum: number;
  volumeId: string; // "12026-w37"
  volumeTitle: string; // "Omni Archivist #37 12026"
  dateStr: string; // "September 12, 2026"
  title: string;
  subtitle: string;
  blurb: string;
  logline: string;
  synopsis: string;
  scienceField: string;
  genre: string;
  readingTime: string;
  wordCount: number;
  contentMD: string;
  coverUrl: string | null;
  metadata: StoryMetadata;
}

export interface VolumeItem {
  id: string; // "12026-w37"
  title: string; // "Omni Archivist #37 12026"
  yearHE: number;
  weekNum: number;
  dateRange: string;
  gradient: string;
  stories: StoryItem[];
}

function getArtifactsDir(): string {
  const p1 = path.resolve(process.cwd(), '../artifacts');
  if (fs.existsSync(p1)) return p1;
  const p2 = path.resolve(process.cwd(), 'artifacts');
  if (fs.existsSync(p2)) return p2;
  return p1;
}

// Compute ISO week
function getISOWeek(date: Date): number {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

function computeGradient(str: string): string {
  const palettes = [
    ['#001219', '#005f73', '#0a9396', '#ee9b00'],
    ['#001219', '#9b2226', '#bb3e03', '#ee9b00'],
    ['#00222e', '#0a9396', '#94d2bd', '#e9d8a6'],
    ['#001219', '#ae2012', '#ca6702', '#94d2bd'],
    ['#001219', '#005f73', '#ee9b00', '#e9d8a6'],
  ];
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 37 + str.charCodeAt(i)) % palettes.length;
  }
  const p = palettes[h];
  return `linear-gradient(135deg, ${p[0]} 0%, ${p[1]} 35%, ${p[2]} 70%, ${p[3]} 100%)`;
}

export function getAllStories(): StoryItem[] {
  const artifactsDir = getArtifactsDir();
  if (!fs.existsSync(artifactsDir)) return [];

  const stories: StoryItem[] = [];

  function scan(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (entry.name === 'story.md') {
        const storyDir = dir;
        const rel = path.relative(artifactsDir, storyDir);
        const parts = rel.split(path.sep);

        if (parts.length >= 3) {
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10);
          const day = parseInt(parts[2], 10);

          if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
            const yearHE = 10000 + year;
            const weekNum = getISOWeek(date);
            const volumeId = `${yearHE}-w${String(weekNum).padStart(2, '0')}`;
            const volumeTitle = `Omni Archivist #${weekNum} ${yearHE}`;

            const contentMD = fs.readFileSync(fullPath, 'utf8');

            let metaData: StoryMetadata = {};
            const metaPath = path.join(storyDir, 'metadata.yml');
            if (fs.existsSync(metaPath)) {
              try {
                metaData = YAML.parse(fs.readFileSync(metaPath, 'utf8')) || {};
              } catch (e) {
                console.error(`Error parsing ${metaPath}:`, e);
              }
            }

            // Copy cover image if present
            let coverUrl: string | null = null;
            const coverPath = path.join(storyDir, 'cover.png');
            if (fs.existsSync(coverPath)) {
              const pubCoverDir = path.resolve(process.cwd(), 'public', 'covers', String(year), String(month).padStart(2, '0'), String(day).padStart(2, '0'));
              fs.mkdirSync(pubCoverDir, { recursive: true });
              const destPath = path.join(pubCoverDir, 'cover.png');
              try {
                fs.copyFileSync(coverPath, destPath);
                coverUrl = `/covers/${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}/cover.png`;
              } catch (e) {
                console.error(`Error copying cover ${coverPath}:`, e);
              }
            }

            const words = contentMD.trim().split(/\s+/).filter(Boolean).length;
            const mins = Math.max(1, Math.round(words / 200));

            const title = metaData.story?.title || 'Untitled Transmission';
            const subtitle = metaData.story?.subtitle || '';
            const blurb = metaData.story?.blurb || metaData.story?.synopsis || '';
            const logline = metaData.story?.logline || blurb;
            const synopsis = metaData.story?.synopsis || blurb;
            const scienceField = metaData.meta?.science_field?.name || 'Speculative Science';
            const genre = metaData.meta?.genre?.name || 'Science Fiction';

            const dateStr = date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              timeZone: 'UTC',
            });

            stories.push({
              id: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
              slug: [String(year), String(month).padStart(2, '0'), String(day).padStart(2, '0')],
              year,
              month,
              day,
              yearHE,
              weekNum,
              volumeId,
              volumeTitle,
              dateStr,
              title,
              subtitle,
              blurb,
              logline,
              synopsis,
              scienceField,
              genre,
              readingTime: `${mins} min read`,
              wordCount: words,
              contentMD,
              coverUrl,
              metadata: metaData,
            });
          }
        }
      }
    }
  }

  scan(artifactsDir);

  // Sort descending by date (newest first)
  stories.sort((a, b) => {
    const da = new Date(Date.UTC(a.year, a.month - 1, a.day)).getTime();
    const db = new Date(Date.UTC(b.year, b.month - 1, b.day)).getTime();
    return db - da;
  });

  return stories;
}

export function getAllVolumes(): VolumeItem[] {
  const stories = getAllStories();
  const map = new Map<string, StoryItem[]>();

  for (const s of stories) {
    const list = map.get(s.volumeId) || [];
    list.push(s);
    map.set(s.volumeId, list);
  }

  const volumes: VolumeItem[] = [];
  for (const [volId, volStories] of map.entries()) {
    const first = volStories[0];
    const last = volStories[volStories.length - 1];
    let dateRange = first.dateStr;
    if (first.dateStr !== last.dateStr) {
      dateRange = `${last.dateStr} – ${first.dateStr}`;
    }

    volumes.push({
      id: volId,
      title: first.volumeTitle,
      yearHE: first.yearHE,
      weekNum: first.weekNum,
      dateRange,
      gradient: computeGradient(volId),
      stories: volStories,
    });
  }

  volumes.sort((a, b) => b.id.localeCompare(a.id));
  return volumes;
}
