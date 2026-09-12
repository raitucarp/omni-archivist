# Omni Archivist

Archivist of the essence of universe from Omni Being.

## Pipeline

Daily generation sequence:
```sh
omni-archivist check artifacts
omni-archivist pick science_field
omni-archivist pick scifi_genre
omni-archivist pick vocabs_composition
omni-archivist write synopsis
omni-archivist write setting
omni-archivist write characters
omni-archivist write structure
omni-archivist write scene_structures
omni-archivist write story
omni-archivist write rewrite
omni-archivist write cover
```

Weekly compilation:
```sh
# Compile weekly EPUB anthology (Human Era 12026 title + curatorial preface)
omni-archivist compile epub

# Compile static website for GitHub Pages (with custom domain CNAME)
omni-archivist compile pages --dir artifacts --output public --cname omni-archivist.raitucarp.name
```

## GitHub Pages Anthology

The anthology is published to [omni-archivist.raitucarp.name](https://omni-archivist.raitucarp.name) with:
- **Weekly Volumes**: Grouped by Human Era week (`Omni Archivist #X 12026`) featuring story titles, loglines, and tags.
- **Single Story Reader**: Immersive reading experience with large, comfortable typography, drop-caps, aesthetic cover display, and narratological dossiers.
- **Visuals & Typography**: Cosmic ambient gradients dynamically blended from cover palettes, custom Google Fonts (`Space Grotesk`, `Newsreader`, `Inter`).
- **Dark & Light Modes**: System-aware with manual toggle and localStorage persistence.
- **Automated Deployment**: Synchronized via `.github/workflows/deploy_pages.yml` whenever new artifacts are generated.

