package compile

import (
	"bytes"
	"context"
	"fmt"
	"html/template"
	"io"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/urfave/cli/v3"
	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/parser"
	"github.com/yuin/goldmark/renderer/html"
)

type VolumeGroup struct {
	YearHE     int
	GregYear   int
	WeekNumber int
	VolumeID   string // "12026-w37"
	Title      string // "Omni Archivist #37 12026"
	Subtitle   string
	DateRange  string
	Gradient   string
	Stories    []StoryItem
}

type SiteStoryView struct {
	Title        string
	Subtitle     string
	DateStr      string
	YearHE       int
	WeekNumber   int
	ScienceField string
	Genre        string
	Logline      string
	ContentHTML  template.HTML
	CoverURL     string
	StoryURL     string
	VolumeURL    string
	VolumeTitle  string
	AestheticTag string
	ReadingTime  string
	Theme        string
	Topography   string
	Atmosphere   string
	Voice        string
}

func compilePagesAction(ctx context.Context, cmd *cli.Command) error {
	rootDir := cmd.String("dir")
	if rootDir == "" {
		rootDir = "artifacts"
	}

	outDir := cmd.String("output")
	if outDir == "" {
		outDir = "public"
	}

	cname := cmd.String("cname")
	if cname == "" {
		cname = "omni-archivist.raitucarp.name"
	}

	fmt.Printf("Compiling static site from '%s' to '%s' (CNAME: %s)...\n", rootDir, outDir, cname)

	// Ensure output directories exist
	if err := os.MkdirAll(filepath.Join(outDir, "assets", "css"), 0755); err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Join(outDir, "assets", "js"), 0755); err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Join(outDir, "assets", "covers"), 0755); err != nil {
		return err
	}

	// Write CNAME
	if cname != "" {
		cnamePath := filepath.Join(outDir, "CNAME")
		if err := os.WriteFile(cnamePath, []byte(cname+"\n"), 0644); err != nil {
			return fmt.Errorf("failed writing CNAME: %w", err)
		}
	}

	// Write CSS & JS assets
	if err := writeStaticAssets(outDir); err != nil {
		return fmt.Errorf("failed writing static assets: %w", err)
	}

	// Scan stories
	var stories []StoryItem
	_ = filepath.Walk(rootDir, func(path string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() {
			return nil
		}
		if filepath.Base(path) == "story.md" {
			dir := filepath.Dir(path)
			item, sErr := loadStoryItemWithDate(dir, path, rootDir, info)
			if sErr == nil && len(item.StoryMD) > 0 {
				stories = append(stories, item)
			}
		}
		return nil
	})

	// Sort stories chronologically descending (newest first)
	sort.Slice(stories, func(i, j int) bool {
		return stories[i].Date.After(stories[j].Date)
	})

	// Group stories by Volume (Week & Year HE)
	volumeMap := make(map[string]*VolumeGroup)
	var volumeKeys []string

	for _, st := range stories {
		yearHE := 10000 + st.Date.Year()
		_, weekNum := st.Date.ISOWeek()
		volKey := fmt.Sprintf("%d-w%02d", yearHE, weekNum)

		if _, exists := volumeMap[volKey]; !exists {
			volumeMap[volKey] = &VolumeGroup{
				YearHE:     yearHE,
				GregYear:   st.Date.Year(),
				WeekNumber: weekNum,
				VolumeID:   volKey,
				Title:      fmt.Sprintf("Omni Archivist #%d %d", weekNum, yearHE),
				Stories:    []StoryItem{},
			}
			volumeKeys = append(volumeKeys, volKey)
		}
		volumeMap[volKey].Stories = append(volumeMap[volKey].Stories, st)
	}

	// Sort volume keys descending (newest week first)
	sort.Slice(volumeKeys, func(i, j int) bool {
		return volumeKeys[i] > volumeKeys[j]
	})

	var volumes []*VolumeGroup
	for _, vk := range volumeKeys {
		vg := volumeMap[vk]
		// Generate combined gradient from stories in volume
		vg.Gradient = computeVolumeGradient(vg.Stories)

		// Compute date range
		if len(vg.Stories) > 0 {
			oldest := vg.Stories[len(vg.Stories)-1].Date
			newest := vg.Stories[0].Date
			if oldest.Format("Jan 02") == newest.Format("Jan 02") {
				vg.DateRange = newest.Format("January 02, 2006")
			} else {
				vg.DateRange = fmt.Sprintf("%s – %s", oldest.Format("Jan 02"), newest.Format("Jan 02, 2006"))
			}
		}
		volumes = append(volumes, vg)
	}

	// Setup Goldmark Markdown converter
	md := goldmark.New(
		goldmark.WithExtensions(extension.GFM),
		goldmark.WithParserOptions(parser.WithAutoHeadingID()),
		goldmark.WithRendererOptions(html.WithUnsafe()),
	)

	// Render Single Stories and copy covers
	for _, vg := range volumes {
		for _, st := range vg.Stories {
			dateRel := fmt.Sprintf("%d/%02d/%02d", st.Date.Year(), st.Date.Month(), st.Date.Day())
			storyDir := filepath.Join(outDir, "stories", strconv.Itoa(st.Date.Year()), fmt.Sprintf("%02d", st.Date.Month()), fmt.Sprintf("%02d", st.Date.Day()))
			if err := os.MkdirAll(storyDir, 0755); err != nil {
				return err
			}

			// Copy cover if present
			coverWebPath := ""
			if st.CoverPath != "" {
				coverExt := filepath.Ext(st.CoverPath)
				destCoverDir := filepath.Join(outDir, "assets", "covers", strconv.Itoa(st.Date.Year()), fmt.Sprintf("%02d", st.Date.Month()), fmt.Sprintf("%02d", st.Date.Day()))
				_ = os.MkdirAll(destCoverDir, 0755)
				destCoverFile := filepath.Join(destCoverDir, "cover"+coverExt)
				if copyErr := copyFile(st.CoverPath, destCoverFile); copyErr == nil {
					coverWebPath = fmt.Sprintf("../../../../assets/covers/%s/cover%s", dateRel, coverExt)
				}
			}

			// Render story markdown to HTML
			var mdBuf bytes.Buffer
			_ = md.Convert([]byte(st.StoryMD), &mdBuf)

			title := st.Metadata.Story.Title
			if title == "" {
				title = "Untitled Transmission"
			}
			subtitle := st.Metadata.Story.Subtitle
			logline := st.Metadata.Story.Blurb
			if logline == "" {
				logline = st.Metadata.Story.Synopsis
			}

			view := SiteStoryView{
				Title:        title,
				Subtitle:     subtitle,
				DateStr:      fmt.Sprintf("%s (Year %d HE)", st.Date.Format("January 02, 2006"), vg.YearHE),
				YearHE:       vg.YearHE,
				WeekNumber:   vg.WeekNumber,
				ScienceField: st.Metadata.Meta.ScienceField.Name,
				Genre:        st.Metadata.Meta.Genre.Name,
				Logline:      logline,
				ContentHTML:  template.HTML(mdBuf.String()),
				CoverURL:     coverWebPath,
				StoryURL:     fmt.Sprintf("/stories/%s/", dateRel),
				VolumeURL:    fmt.Sprintf("../../../../volumes/%s/", vg.VolumeID),
				VolumeTitle:  vg.Title,
				ReadingTime:  estimateReadingTime(st.StoryMD),
				Theme:        st.Metadata.Story.Theme.CentralPremise,
				Topography:   st.Metadata.Story.Setting.Topography,
				Atmosphere:   st.Metadata.Story.Setting.Atmosphere,
				Voice:        string(st.Metadata.Story.Discourse.Narration.Voice),
				AestheticTag: string(st.Metadata.Story.Aesthetic.Mood),
			}

			storyHTMLPath := filepath.Join(storyDir, "index.html")
			if err := renderStoryPage(storyHTMLPath, view); err != nil {
				return fmt.Errorf("error rendering story page %s: %w", storyHTMLPath, err)
			}
		}
	}

	// Render Volume Pages
	for _, vg := range volumes {
		volDir := filepath.Join(outDir, "volumes", vg.VolumeID)
		if err := os.MkdirAll(volDir, 0755); err != nil {
			return err
		}
		volHTMLPath := filepath.Join(volDir, "index.html")
		if err := renderVolumePage(volHTMLPath, vg); err != nil {
			return fmt.Errorf("error rendering volume page %s: %w", volHTMLPath, err)
		}
	}

	// Render Index Page
	indexHTMLPath := filepath.Join(outDir, "index.html")
	if err := renderIndexPage(indexHTMLPath, volumes); err != nil {
		return fmt.Errorf("error rendering index page: %w", err)
	}

	fmt.Printf("Successfully generated GitHub Pages static site in '%s' (%d volumes, %d stories)!\n", outDir, len(volumes), len(stories))
	return nil
}

func loadStoryItemWithDate(dir, storyMDPath, rootDir string, info os.FileInfo) (StoryItem, error) {
	item, err := loadStoryItem(dir, storyMDPath)
	if err != nil {
		return item, err
	}

	// Attempt parsing date from path: rootDir/YYYY/MM/DD
	rel, rErr := filepath.Rel(rootDir, dir)
	if rErr == nil {
		parts := strings.Split(filepath.ToSlash(rel), "/")
		if len(parts) >= 3 {
			y, yErr := strconv.Atoi(parts[0])
			m, mErr := strconv.Atoi(parts[1])
			d, dErr := strconv.Atoi(parts[2])
			if yErr == nil && mErr == nil && dErr == nil {
				item.Date = time.Date(y, time.Month(m), d, 12, 0, 0, 0, time.UTC)
				return item, nil
			}
		}
	}

	item.Date = info.ModTime()
	return item, nil
}

func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, in)
	return err
}

func estimateReadingTime(text string) string {
	words := len(strings.Fields(text))
	mins := words / 200
	if mins < 1 {
		mins = 1
	}
	return fmt.Sprintf("%d min read", mins)
}

func computeVolumeGradient(stories []StoryItem) string {
	// Ocean Sunset Palette & Variants
	// Ink Black: #001219, Dark Teal: #005f73, Dark Cyan: #0a9396, Pearl Aqua: #94d2bd
	// Wheat: #e9d8a6, Golden Orange: #ee9b00, Burnt Caramel: #ca6702, Rusty Spice: #bb3e03
	type colorStop struct {
		c1, c2, c3, c4 string
	}
	palettes := []colorStop{
		{"#001219", "#005f73", "#0a9396", "#ee9b00"}, // Ocean Depths to Golden Sunset
		{"#001219", "#9b2226", "#bb3e03", "#ee9b00"}, // Midnight Red to Fiery Sunset
		{"#00222e", "#0a9396", "#94d2bd", "#e9d8a6"}, // Oceanic Shimmer to Sunlit Wheat
		{"#001219", "#ae2012", "#ca6702", "#94d2bd"}, // Ancient Iron & Caramel Seafoam
		{"#001219", "#005f73", "#ee9b00", "#e9d8a6"}, // Deep Ink to Sunlit Gold
	}

	hash := 0
	for _, s := range stories {
		for _, b := range s.DirPath {
			hash = (hash*37 + int(b)) % len(palettes)
		}
	}
	p := palettes[hash]
	return fmt.Sprintf("linear-gradient(135deg, %s 0%%, %s 35%%, %s 70%%, %s 100%%)", p.c1, p.c2, p.c3, p.c4)
}

// --------------------------------------------------------------------------
// HTML Page Renderers
// --------------------------------------------------------------------------

const baseHeadTemplate = `
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ .Title }} | Omni Archivist</title>
  <meta name="description" content="{{ .Description }}">
  
  <!-- Preconnect and Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600;700&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;0,7..72,600;0,7..72,700;1,7..72,400;1,7..72,500;1,7..72,600&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <link rel="stylesheet" href="{{ .AssetPrefix }}assets/css/style.css?v=12026.3">
  <script src="{{ .AssetPrefix }}assets/js/theme.js"></script>
</head>
<body>
  <div class="ambient-glow"></div>
  <header class="site-header">
    <div class="header-container">
      <a href="{{ .AssetPrefix }}index.html" class="brand">
        <span class="brand-symbol">◈</span>
        <span class="brand-text">OMNI ARCHIVIST</span>
        <span class="badge-he">12026 HE</span>
      </a>
      <nav class="nav-links">
        <a href="{{ .AssetPrefix }}index.html" class="nav-item">Anthology</a>
        <button id="themeToggle" class="theme-btn" aria-label="Toggle light/dark theme" title="Toggle Theme">
          <span class="theme-icon light-icon">☀</span>
          <span class="theme-icon dark-icon">🌙</span>
        </button>
      </nav>
    </div>
  </header>
  <main class="site-main">
`

const baseFootTemplate = `
  </main>
  <footer class="site-footer">
    <div class="footer-container">
      <div class="footer-meta">
        <div class="footer-brand">◈ OMNI ARCHIVIST</div>
        <p class="footer-desc">Autonomous deep-time chronicle archiving speculative realities across the Human Era.</p>
      </div>
      <div class="footer-bottom">
        <span>Recorded under Human Era Calendar (HE 12026)</span>
        <span>•</span>
        <span>Generated with Genkit & Semiometrics</span>
      </div>
    </div>
  </footer>
</body>
</html>
`

func renderIndexPage(outputPath string, volumes []*VolumeGroup) error {
	var bodyBuf bytes.Buffer

	// Hero Introduction
	bodyBuf.WriteString(`
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-badge">CHRONICLE OF DEEP-TIME SPECULATIVE REALITIES</div>
        <h1 class="hero-title">Omni Archivist</h1>
        <p class="hero-lead">
          An autonomous speculative intelligence chronicling humanity's infinite horizons across deep time, synthesized under the Human Era calendar.
        </p>
        <div class="hero-essay">
          <p>
            Twelve thousand years have elapsed since humankind initiated monumental architecture and first mapped the sidereal heavens. Synchronized with this profound epoch—the <strong>Human Era (12026 HE)</strong>—Omni Archivist navigates the nexus of narratological semiotics, speculative hard science, and algorithmic synthesis.
          </p>
          <p>
            Every solar cycle, an original transmission is recorded, exploring technological singularities, post-biological consciousness, and cosmic anomalies. Weekly cycles are gathered into curated anthologies for reflection and interstellar posterity.
          </p>
        </div>
      </div>
    </section>
  `)

	// Volume Listings or Empty State
	if len(volumes) == 0 {
		bodyBuf.WriteString(`
    <section class="archive-section">
      <div class="empty-state">
        <div class="empty-icon">⟡</div>
        <h2 class="empty-title">Awaiting Daily Transmissions</h2>
        <p class="empty-desc">
          The deep-time telemetry array is initialized. As daily speculative transmissions are generated and committed to the artifacts archive, weekly anthologies will automatically materialize here.
        </p>
        <div class="empty-status">
          <span class="pulse-dot"></span> Array Online • Epoch 12026 HE
        </div>
      </div>
    </section>
    `)
	} else {
		bodyBuf.WriteString(`
    <section class="archive-section">
      <div class="section-header">
        <h2 class="section-title">Archived Weekly Volumes</h2>
        <p class="section-subtitle">Anthologies curated by weekly temporal cycles</p>
      </div>
      <div class="volumes-container">
    `)

		for _, vg := range volumes {
			bodyBuf.WriteString(fmt.Sprintf(`
        <article class="volume-card" style="--volume-gradient: %s;">
          <div class="volume-header">
            <div class="volume-meta">
              <span class="volume-number">%s</span>
              <span class="volume-dates">%s</span>
            </div>
            <a href="volumes/%s/index.html" class="volume-permalink">Volume Overview →</a>
          </div>
          <div class="stories-list">
      `, vg.Gradient, vg.Title, vg.DateRange, vg.VolumeID))

			for _, s := range vg.Stories {
				dateRel := fmt.Sprintf("%d/%02d/%02d", s.Date.Year(), s.Date.Month(), s.Date.Day())
				title := s.Metadata.Story.Title
				if title == "" {
					title = "Untitled Transmission"
				}
				logline := s.Metadata.Story.Blurb
				if logline == "" {
					logline = s.Metadata.Story.Synopsis
				}
				if len(logline) > 280 {
					logline = logline[:277] + "..."
				}

				coverImgHTML := ""
				if s.CoverPath != "" {
					coverExt := filepath.Ext(s.CoverPath)
					coverSrc := fmt.Sprintf("assets/covers/%s/cover%s", dateRel, coverExt)
					coverImgHTML = fmt.Sprintf(`<div class="story-thumb"><img src="%s" alt="%s cover" loading="lazy" /></div>`, coverSrc, title)
				} else {
					coverImgHTML = `<div class="story-thumb story-thumb-placeholder"><span>◈</span></div>`
				}

				genre := s.Metadata.Meta.Genre.Name
				if genre == "" {
					genre = "Speculative Fiction"
				}
				science := s.Metadata.Meta.ScienceField.Name

				bodyBuf.WriteString(fmt.Sprintf(`
            <div class="story-card">
              %s
              <div class="story-card-body">
                <div class="story-tags">
                  <span class="tag tag-genre">%s</span>
                  %s
                  <span class="tag tag-date">%s</span>
                </div>
                <h3 class="story-title">
                  <a href="stories/%s/index.html">%s</a>
                </h3>
                <p class="story-logline">%s</p>
                <div class="story-action">
                  <a href="stories/%s/index.html" class="read-link">Read Transmission <span>⟶</span></a>
                </div>
              </div>
            </div>
        `, coverImgHTML, genre, renderTag(science), s.Date.Format("Jan 02"), dateRel, title, logline, dateRel))
			}

			bodyBuf.WriteString(`
          </div>
        </article>
      `)
		}

		bodyBuf.WriteString(`
      </div>
    </section>
    `)
	}

	headData := struct {
		Title       string
		Description string
		AssetPrefix string
	}{
		Title:       "Omni Archivist — Deep-Time Speculative Anthology",
		Description: "An autonomous chronicle of speculative futures, hard science fiction, and cosmic anomalies across the Human Era (12026 HE).",
		AssetPrefix: "",
	}

	tHead, err := template.New("head").Parse(baseHeadTemplate)
	if err != nil {
		return err
	}
	var fullHTML bytes.Buffer
	if err := tHead.Execute(&fullHTML, headData); err != nil {
		return err
	}
	fullHTML.Write(bodyBuf.Bytes())
	fullHTML.WriteString(baseFootTemplate)

	return os.WriteFile(outputPath, fullHTML.Bytes(), 0644)
}

func renderVolumePage(outputPath string, vg *VolumeGroup) error {
	var bodyBuf bytes.Buffer

	bodyBuf.WriteString(fmt.Sprintf(`
    <div class="reader-container">
      <div class="breadcrumb">
        <a href="../../index.html">← All Volumes</a>
      </div>

      <header class="volume-page-header" style="--volume-gradient: %s;">
        <div class="volume-badge">CURATED ANTHOLOGY</div>
        <h1 class="volume-page-title">%s</h1>
        <p class="volume-page-dates">%s • %d Dispatches</p>
      </header>

      <section class="volume-stories-section">
        <h2 class="section-title">Transmissions in this Volume</h2>
        <div class="stories-list">
  `, vg.Gradient, vg.Title, vg.DateRange, len(vg.Stories)))

	for _, s := range vg.Stories {
		dateRel := fmt.Sprintf("%d/%02d/%02d", s.Date.Year(), s.Date.Month(), s.Date.Day())
		title := s.Metadata.Story.Title
		if title == "" {
			title = "Untitled Transmission"
		}
		logline := s.Metadata.Story.Blurb
		if logline == "" {
			logline = s.Metadata.Story.Synopsis
		}

		coverImgHTML := ""
		if s.CoverPath != "" {
			coverExt := filepath.Ext(s.CoverPath)
			coverSrc := fmt.Sprintf("../../assets/covers/%s/cover%s", dateRel, coverExt)
			coverImgHTML = fmt.Sprintf(`<div class="story-thumb"><img src="%s" alt="%s cover" loading="lazy" /></div>`, coverSrc, title)
		} else {
			coverImgHTML = `<div class="story-thumb story-thumb-placeholder"><span>◈</span></div>`
		}

		genre := s.Metadata.Meta.Genre.Name
		science := s.Metadata.Meta.ScienceField.Name

		bodyBuf.WriteString(fmt.Sprintf(`
          <div class="story-card">
            %s
            <div class="story-card-body">
              <div class="story-tags">
                <span class="tag tag-genre">%s</span>
                %s
                <span class="tag tag-date">%s</span>
              </div>
              <h3 class="story-title">
                <a href="../../stories/%s/index.html">%s</a>
              </h3>
              <p class="story-logline">%s</p>
              <div class="story-action">
                <a href="../../stories/%s/index.html" class="read-link">Read Transmission <span>⟶</span></a>
              </div>
            </div>
          </div>
      `, coverImgHTML, genre, renderTag(science), s.Date.Format("Jan 02"), dateRel, title, logline, dateRel))
	}

	bodyBuf.WriteString(`
        </div>
      </section>
    </div>
  `)

	headData := struct {
		Title       string
		Description string
		AssetPrefix string
	}{
		Title:       vg.Title,
		Description: fmt.Sprintf("Weekly anthology %s from the Omni Archivist.", vg.Title),
		AssetPrefix: "../../",
	}

	tHead, err := template.New("head").Parse(baseHeadTemplate)
	if err != nil {
		return err
	}
	var fullHTML bytes.Buffer
	if err := tHead.Execute(&fullHTML, headData); err != nil {
		return err
	}
	fullHTML.Write(bodyBuf.Bytes())
	fullHTML.WriteString(baseFootTemplate)

	return os.WriteFile(outputPath, fullHTML.Bytes(), 0644)
}

func renderStoryPage(outputPath string, view SiteStoryView) error {
	var bodyBuf bytes.Buffer

	coverHTML := ""
	if view.CoverURL != "" {
		coverHTML = fmt.Sprintf(`
      <div class="story-cover-container">
        <img src="%s" alt="%s cover illustration" class="story-hero-cover" />
      </div>
    `, view.CoverURL, view.Title)
	}

	subtitleHTML := ""
	if view.Subtitle != "" {
		subtitleHTML = fmt.Sprintf(`<div class="story-hero-subtitle">%s</div>`, view.Subtitle)
	}

	metaPills := fmt.Sprintf(`
    <div class="story-meta-pills">
      <span class="meta-pill"><span class="pill-label">Epoch:</span> %s</span>
      <span class="meta-pill"><span class="pill-label">Genre:</span> %s</span>
      <span class="meta-pill"><span class="pill-label">Discipline:</span> %s</span>
      <span class="meta-pill"><span class="pill-label">Reading:</span> %s</span>
    </div>
  `, view.DateStr, view.Genre, view.ScienceField, view.ReadingTime)

	loglineBox := ""
	if view.Logline != "" {
		loglineBox = fmt.Sprintf(`
      <blockquote class="story-logline-box">
        <span class="logline-glyph">“</span>
        <p>%s</p>
      </blockquote>
    `, view.Logline)
	}

	// Narratological Dossier / Metadata Footer
	dossierItems := ""
	if view.Theme != "" {
		dossierItems += fmt.Sprintf(`<div><strong>Premise:</strong> %s</div>`, view.Theme)
	}
	if view.Topography != "" {
		dossierItems += fmt.Sprintf(`<div><strong>Setting Topography:</strong> %s</div>`, view.Topography)
	}
	if view.Atmosphere != "" {
		dossierItems += fmt.Sprintf(`<div><strong>Atmosphere:</strong> %s</div>`, view.Atmosphere)
	}
	if view.Voice != "" {
		dossierItems += fmt.Sprintf(`<div><strong>Narrative Voice:</strong> %s</div>`, view.Voice)
	}

	dossierHTML := ""
	if dossierItems != "" {
		dossierHTML = fmt.Sprintf(`
      <aside class="narrative-dossier">
        <h4 class="dossier-title">◈ Archival Semiotic Dossier</h4>
        <div class="dossier-content">%s</div>
      </aside>
    `, dossierItems)
	}

	bodyBuf.WriteString(fmt.Sprintf(`
    <article class="reader-container single-story-view">
      <nav class="breadcrumb">
        <a href="../../../../index.html">← Home</a>
        <span>/</span>
        <a href="%s">%s</a>
      </nav>

      <header class="story-hero-header">
        %s
        <h1 class="story-hero-title">%s</h1>
        %s
        %s
      </header>

      %s

      %s

      <section class="story-prose-body">
        %s
      </section>

      %s

      <footer class="story-navigation-footer">
        <a href="%s" class="btn-return">← Back to %s</a>
        <a href="../../../../index.html" class="btn-return">All Volumes</a>
      </footer>
    </article>
  `, view.VolumeURL, view.VolumeTitle, coverHTML, view.Title, subtitleHTML, metaPills, loglineBox, "", view.ContentHTML, dossierHTML, view.VolumeURL, view.VolumeTitle))

	headData := struct {
		Title       string
		Description string
		AssetPrefix string
	}{
		Title:       view.Title,
		Description: view.Logline,
		AssetPrefix: "../../../../",
	}

	tHead, err := template.New("head").Parse(baseHeadTemplate)
	if err != nil {
		return err
	}
	var fullHTML bytes.Buffer
	if err := tHead.Execute(&fullHTML, headData); err != nil {
		return err
	}
	fullHTML.Write(bodyBuf.Bytes())
	fullHTML.WriteString(baseFootTemplate)

	return os.WriteFile(outputPath, fullHTML.Bytes(), 0644)
}

func renderTag(name string) string {
	if name == "" {
		return ""
	}
	return fmt.Sprintf(`<span class="tag tag-science">%s</span>`, name)
}

// --------------------------------------------------------------------------
// CSS & JS Assets Generator
// --------------------------------------------------------------------------

func writeStaticAssets(outDir string) error {
	cssPath := filepath.Join(outDir, "assets", "css", "style.css")
	jsPath := filepath.Join(outDir, "assets", "js", "theme.js")

	if err := os.MkdirAll(filepath.Dir(cssPath), 0755); err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(jsPath), 0755); err != nil {
		return err
	}

	if err := os.WriteFile(cssPath, []byte(siteCSS), 0644); err != nil {
		return err
	}
	if err := os.WriteFile(jsPath, []byte(siteJS), 0644); err != nil {
		return err
	}
	return nil
}

const siteJS = `
// Immediate theme initialization to prevent flash
(function() {
  const saved = localStorage.getItem('omni-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved ? saved : (prefersDark ? 'dark' : 'dark'); // default dark
  document.documentElement.setAttribute('data-theme', theme);
})();

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('omni-theme', next);
  });
});
`

const siteCSS = `
:root {
  --font-display: 'Space Grotesk', -apple-system, sans-serif;
  --font-brand: 'Cinzel', serif;
  --font-prose: 'Literata', 'Cormorant Garamond', Georgia, serif;
  --font-ui: 'Inter', -apple-system, sans-serif;
  
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;
  --radius-full: 9999px;
  
  --transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

[data-theme="dark"] {
  --bg-page: #001219; /* Ink Black */
  --bg-surface: #001e28; /* Midnight Ocean Navy */
  --bg-surface-elevated: #002d3c; /* Undercurrent Teal */
  --bg-card: rgba(0, 24, 34, 0.84); /* Frosted Ink & Teal */
  
  --border-subtle: rgba(148, 210, 189, 0.16); /* Pearl Aqua subtle boundary */
  --border-strong: rgba(238, 155, 0, 0.32); /* Golden Orange accent glow */
  
  --text-main: #f5eedf; /* Sunlit wheat off-white */
  --text-muted: #94d2bd; /* Pearl Aqua */
  --text-faint: #528085; /* Oceanic Muted Teal */
  
  --accent-gold: #ee9b00; /* Golden Orange */
  --accent-cyan: #0a9396; /* Dark Cyan */
  --accent-aqua: #94d2bd; /* Pearl Aqua */
  --accent-wheat: #e9d8a6; /* Wheat */
  --accent-caramel: #ca6702; /* Burnt Caramel */
  --accent-spice: #bb3e03; /* Rusty Spice */
  --accent-iron: #ae2012; /* Oxidized Iron */
  --accent-brownred: #9b2226; /* Brown Red */
  
  --ambient-blur: radial-gradient(circle at 50% 0%, rgba(10, 147, 150, 0.25), rgba(238, 155, 0, 0.15) 35%, rgba(155, 34, 38, 0.1) 65%, transparent 80%);
  --card-shadow: 0 16px 36px -8px rgba(0, 18, 25, 0.85);
  --hero-border: rgba(238, 155, 0, 0.38);
}

[data-theme="light"] {
  --bg-page: #fbf9f4; /* Warm sunlit sands */
  --bg-surface: #ffffff;
  --bg-surface-elevated: #f4eee2; /* Wheat tint */
  --bg-card: rgba(255, 255, 255, 0.9);
  
  --border-subtle: rgba(0, 95, 115, 0.14); /* Dark Teal hairline */
  --border-strong: rgba(202, 103, 2, 0.32); /* Burnt Caramel border */
  
  --text-main: #001219; /* Ink Black */
  --text-muted: #005f73; /* Dark Teal */
  --text-faint: #487e86; /* Oceanic Teal */
  
  --accent-gold: #ca6702; /* Burnt Caramel */
  --accent-cyan: #0a9396; /* Dark Cyan */
  --accent-aqua: #005f73; /* Dark Teal */
  --accent-wheat: #e9d8a6; /* Wheat */
  --accent-caramel: #ca6702;
  --accent-spice: #bb3e03; /* Rusty Spice */
  --accent-iron: #ae2012;
  --accent-brownred: #9b2226;
  
  --ambient-blur: radial-gradient(circle at 50% 0%, rgba(233, 216, 166, 0.4), rgba(238, 155, 0, 0.12) 35%, rgba(10, 147, 150, 0.08) 65%, transparent 80%);
  --card-shadow: 0 16px 32px -8px rgba(0, 18, 25, 0.08);
  --hero-border: rgba(202, 103, 2, 0.35);
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--bg-page);
  color: var(--text-main);
  font-family: var(--font-ui);
  line-height: 1.6;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.ambient-glow {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 600px;
  background: var(--ambient-blur);
  pointer-events: none;
  z-index: 0;
}

/* Header */
.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(var(--bg-page), 0.8);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-subtle);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  color: var(--text-main);
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: 0.08em;
  font-size: 1.1rem;
}

.brand-symbol {
  color: var(--accent-gold);
  font-size: 1.35rem;
  filter: drop-shadow(0 0 8px rgba(238, 155, 0, 0.5));
}

.badge-he {
  font-size: 0.75rem;
  font-family: var(--font-ui);
  font-weight: 700;
  background: rgba(10, 147, 150, 0.18);
  color: var(--accent-aqua);
  border: 1px solid rgba(148, 210, 189, 0.35);
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-full);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.nav-item {
  text-decoration: none;
  color: var(--text-muted);
  font-weight: 500;
  font-size: 0.95rem;
  transition: var(--transition);
}

.nav-item:hover {
  color: var(--text-main);
}

.theme-btn {
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-strong);
  color: var(--text-main);
  padding: 0.45rem 0.7rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: var(--transition);
}

.theme-btn:hover {
  transform: translateY(-1px);
  border-color: var(--accent-gold);
}

[data-theme="dark"] .light-icon { display: inline-block; }
[data-theme="dark"] .dark-icon { display: none; }
[data-theme="light"] .light-icon { display: none; }
[data-theme="light"] .dark-icon { display: inline-block; }

/* Main layout */
.site-main {
  position: relative;
  z-index: 10;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 5rem;
}

/* Hero Section */
.hero-section {
  padding: 3.5rem 2rem;
  margin-bottom: 3.5rem;
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: var(--radius-lg);
  border: 1px solid var(--hero-border);
  box-shadow: var(--card-shadow);
  position: relative;
  overflow: hidden;
}

.hero-section::after {
  content: '';
  position: absolute;
  top: -60px;
  right: -60px;
  width: 380px;
  height: 380px;
  background: radial-gradient(circle, rgba(238, 155, 0, 0.18), rgba(10, 147, 150, 0.12) 50%, transparent 75%);
  pointer-events: none;
}

.hero-badge {
  display: inline-block;
  font-family: var(--font-display);
  font-size: 0.82rem;
  letter-spacing: 0.16em;
  font-weight: 700;
  color: var(--accent-gold);
  margin-bottom: 1rem;
  text-transform: uppercase;
  background: rgba(238, 155, 0, 0.12);
  border: 1px solid rgba(238, 155, 0, 0.28);
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
}

.hero-title {
  font-family: var(--font-brand);
  font-size: clamp(2.6rem, 5.5vw, 4.2rem);
  font-weight: 900;
  letter-spacing: 0.04em;
  line-height: 1.1;
  margin-bottom: 1.25rem;
  background: linear-gradient(135deg, var(--text-main) 15%, var(--accent-gold) 60%, var(--accent-aqua) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-lead {
  font-family: var(--font-prose);
  font-size: 1.45rem;
  font-weight: 500;
  font-style: italic;
  color: var(--accent-wheat);
  max-width: 860px;
  margin-bottom: 2rem;
  line-height: 1.6;
}

[data-theme="light"] .hero-lead {
  color: var(--accent-caramel);
}

.hero-essay {
  font-family: var(--font-prose);
  font-size: 1.32rem;
  color: var(--text-main);
  opacity: 0.94;
  max-width: 880px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  line-height: 1.9;
  letter-spacing: 0.01em;
}

/* Archive & Volume Cards */
.section-header {
  margin-bottom: 2rem;
}

.section-title {
  font-family: var(--font-display);
  font-size: 1.85rem;
  font-weight: 700;
}

.section-subtitle {
  color: var(--text-muted);
  font-size: 1rem;
}

.volumes-container {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.volume-card {
  background: var(--bg-card);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--card-shadow);
  overflow: hidden;
  position: relative;
  transition: var(--transition);
}

.volume-header {
  background: var(--volume-gradient);
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #ffffff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.volume-number {
  font-family: var(--font-display);
  font-size: 1.4rem;
  font-weight: 700;
  display: block;
}

.volume-dates {
  font-size: 0.9rem;
  opacity: 0.85;
}

.volume-permalink {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.45rem 1rem;
  border-radius: var(--radius-full);
  font-size: 0.88rem;
  text-decoration: none;
  font-weight: 600;
  transition: var(--transition);
}

.volume-permalink:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

/* Stories List */
.stories-list {
  padding: 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.story-card {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 1.5rem;
  padding: 1.25rem;
  background: var(--bg-surface-elevated);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  transition: var(--transition);
}

.story-card:hover {
  border-color: var(--accent-cyan);
  transform: translateY(-2px);
}

.story-thumb {
  width: 140px;
  height: 140px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: var(--bg-surface);
  display: flex;
  align-items: center;
  justify-content: center;
}

.story-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.story-card:hover .story-thumb img {
  transform: scale(1.05);
}

.story-thumb-placeholder {
  font-size: 2.5rem;
  color: var(--accent-gold);
  background: linear-gradient(135deg, rgba(0, 95, 115, 0.35), rgba(238, 155, 0, 0.2));
}

.story-card-body {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.story-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.tag {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.15rem 0.55rem;
  border-radius: var(--radius-full);
}

.tag-genre {
  background: rgba(238, 155, 0, 0.16);
  color: var(--accent-gold);
  border: 1px solid rgba(238, 155, 0, 0.35);
}

.tag-science {
  background: rgba(10, 147, 150, 0.18);
  color: var(--accent-aqua);
  border: 1px solid rgba(10, 147, 150, 0.38);
}

.tag-date {
  color: var(--text-faint);
  font-size: 0.78rem;
}

.story-title {
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 0.45rem;
  line-height: 1.25;
}

.story-title a {
  color: var(--text-main);
  text-decoration: none;
  transition: var(--transition);
}

.story-title a:hover {
  color: var(--accent-gold);
}

.story-logline {
  font-family: var(--font-prose);
  color: var(--text-muted);
  font-size: 1.18rem;
  line-height: 1.7;
  margin-bottom: 0.85rem;
}

.story-action {
  align-self: flex-start;
}

.read-link {
  color: var(--accent-gold);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.92rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: var(--transition);
}

.read-link:hover {
  color: var(--accent-aqua);
  gap: 0.6rem;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 5rem 2rem;
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--border-strong);
  max-width: 720px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 3.2rem;
  color: var(--accent-gold);
  filter: drop-shadow(0 0 14px rgba(238, 155, 0, 0.5));
  margin-bottom: 1rem;
}

.empty-title {
  font-family: var(--font-display);
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

.empty-desc {
  font-family: var(--font-prose);
  color: var(--text-muted);
  font-size: 1.25rem;
  line-height: 1.8;
  margin-bottom: 2rem;
}

.empty-status {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.88rem;
  color: var(--accent-aqua);
  background: rgba(0, 95, 115, 0.25);
  border: 1px solid rgba(148, 210, 189, 0.3);
  padding: 0.35rem 0.9rem;
  border-radius: var(--radius-full);
}

.pulse-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--accent-gold);
  box-shadow: 0 0 12px var(--accent-gold);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.95); opacity: 0.7; }
  50% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.7; }
}

/* Single Story Reader Page */
.reader-container {
  max-width: 820px;
  margin: 0 auto;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.92rem;
  margin-bottom: 2.5rem;
  color: var(--text-muted);
}

.breadcrumb a {
  color: var(--text-muted);
  text-decoration: none;
  transition: var(--transition);
}

.breadcrumb a:hover {
  color: var(--accent-cyan);
}

.story-hero-header {
  margin-bottom: 2.5rem;
}

.story-cover-container {
  width: 100%;
  max-height: 480px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: 2.5rem;
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.7);
  border: 1px solid var(--border-strong);
}

.story-hero-cover {
  width: 100%;
  height: 100%;
  max-height: 480px;
  object-fit: cover;
  display: block;
}

.story-hero-title {
  font-family: var(--font-display);
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  font-weight: 700;
  line-height: 1.15;
  margin-bottom: 0.75rem;
}

.story-hero-subtitle {
  font-family: var(--font-prose);
  font-style: italic;
  font-size: 1.45rem;
  color: var(--accent-gold);
  margin-bottom: 1.5rem;
}

.story-meta-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 2rem;
}

.meta-pill {
  font-size: 0.85rem;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-subtle);
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
}

.pill-label {
  color: var(--text-muted);
}

.story-logline-box {
  background: var(--bg-surface-elevated);
  border-left: 4px solid var(--accent-gold);
  padding: 1.75rem 2rem;
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  margin-bottom: 3rem;
  font-family: var(--font-prose);
  font-style: italic;
  font-size: 1.35rem;
  line-height: 1.8;
  color: var(--text-main);
  position: relative;
}

.logline-glyph {
  position: absolute;
  top: 0.5rem;
  left: 0.6rem;
  font-size: 2rem;
  opacity: 0.25;
  font-family: serif;
}

/* Prose Body Typography */
.story-prose-body {
  font-family: var(--font-prose);
  font-size: 1.42rem; /* Distinctly larger, unique literary prose font */
  line-height: 1.95;
  color: var(--text-main);
  margin-bottom: 4rem;
  letter-spacing: 0.005em;
}

.story-prose-body p {
  margin-bottom: 2rem;
}

.story-prose-body p:first-of-type::first-letter {
  font-family: var(--font-brand);
  font-size: 4.2rem;
  float: left;
  line-height: 0.8;
  margin: 0.15rem 0.8rem 0 0;
  color: var(--accent-gold);
}

.story-prose-body h1,
.story-prose-body h2,
.story-prose-body h3 {
  font-family: var(--font-display);
  margin-top: 2.5rem;
  margin-bottom: 1rem;
  line-height: 1.3;
}

.story-prose-body hr {
  border: none;
  text-align: center;
  margin: 3rem 0;
}

.story-prose-body hr::after {
  content: "◈ ◈ ◈";
  color: var(--accent-gold);
  letter-spacing: 0.5em;
  font-size: 0.9rem;
}

.narrative-dossier {
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 1.5rem 1.75rem;
  margin-bottom: 3rem;
}

.dossier-title {
  font-family: var(--font-display);
  font-size: 1.05rem;
  color: var(--accent-gold);
  margin-bottom: 1rem;
}

.dossier-content {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  font-size: 0.95rem;
  color: var(--text-muted);
}

.story-navigation-footer {
  display: flex;
  justify-content: space-between;
  padding-top: 2rem;
  border-top: 1px solid var(--border-subtle);
}

.btn-return {
  text-decoration: none;
  color: var(--text-main);
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-strong);
  padding: 0.6rem 1.25rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 0.95rem;
  transition: var(--transition);
}

.btn-return:hover {
  border-color: var(--accent-gold);
  color: var(--accent-gold);
  transform: translateY(-2px);
}

/* Volume Page Specifics */
.volume-page-header {
  background: var(--volume-gradient);
  padding: 3rem 2.5rem;
  border-radius: var(--radius-lg);
  color: #ffffff;
  margin-bottom: 3rem;
  box-shadow: var(--card-shadow);
}

.volume-badge {
  font-family: var(--font-display);
  font-size: 0.8rem;
  letter-spacing: 0.15em;
  font-weight: 700;
  opacity: 0.85;
  margin-bottom: 0.5rem;
}

.volume-page-title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 0.5rem;
}

.volume-page-dates {
  font-size: 1.1rem;
  opacity: 0.9;
}

/* Footer */
.site-footer {
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-surface);
  padding: 3rem 1.5rem;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.footer-brand {
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--text-main);
}

.footer-desc {
  color: var(--text-muted);
  font-size: 0.92rem;
  margin-top: 0.35rem;
}

.footer-bottom {
  display: flex;
  gap: 0.75rem;
  font-size: 0.85rem;
  color: var(--text-faint);
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-subtle);
}

/* Responsive */
@media (max-width: 768px) {
  .story-card {
    grid-template-columns: 1fr;
  }
  .story-thumb {
    width: 100%;
    height: 200px;
  }
  .hero-section {
    padding: 2rem 1.25rem;
  }
  .volume-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .stories-list {
    padding: 1rem;
  }
  .story-hero-cover {
    max-height: 280px;
  }
  .story-prose-body {
    font-size: 1.15rem;
  }
}
`
