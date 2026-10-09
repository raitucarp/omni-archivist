package compile

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/firebase/genkit/go/genkit"
	"github.com/goccy/go-yaml"
	"github.com/raitucarp/epub"
	"github.com/raitucarp/omni-archivist/internal/metadata"
	"github.com/raitucarp/omni-archivist/internal/utils"
	"github.com/urfave/cli/v3"
)

type StoryItem struct {
	DirPath   string
	Date      time.Time
	Metadata  metadata.Metadata
	StoryMD   string
	CoverPath string
}

type AnthologyStoryInput struct {
	Title        string `json:"title"`
	Subtitle     string `json:"subtitle"`
	Genre        string `json:"genre"`
	ScienceField string `json:"science_field"`
	Logline      string `json:"logline"`
	Synopsis     string `json:"synopsis"`
	Theme        string `json:"theme"`
}

type AnthologyPrefaceInput struct {
	Title      string                `json:"title"`
	YearHE     int                   `json:"year_he"`
	WeekNumber int                   `json:"week_number"`
	Stories    []AnthologyStoryInput `json:"stories"`
}

type AnthologyPrefaceOutput struct {
	Subtitle string `json:"subtitle" jsonschema:"description=A concise, evocative subtitle summarizing the thematic synthesis of the stories"`
	Preface  string `json:"preface" jsonschema:"description=An eloquent curatorial preface/overview essay for the anthology in Markdown format, synthesizing the themes, worlds, and loglines"`
}

func compileEpubAction(ctx context.Context, cmd *cli.Command) error {
	rootDir := cmd.String("dir")
	if rootDir == "" {
		rootDir = utils.ArtifactsDir()
	}

	targetYear := int(cmd.Int("year"))
	targetWeek := int(cmd.Int("week"))

	fmt.Printf("Scanning stories in: %s\n", rootDir)

	var allStories []StoryItem

	err := filepath.Walk(rootDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if info.IsDir() {
			return nil
		}
		if filepath.Base(path) == "story.md" {
			dir := filepath.Dir(path)
			storyItem, sErr := loadStoryItem(dir, path)
			if sErr == nil && len(storyItem.StoryMD) > 0 {
				allStories = append(allStories, storyItem)
			}
		}
		return nil
	})

	if err != nil {
		return fmt.Errorf("failed scanning directory %s: %w", rootDir, err)
	}

	if len(allStories) == 0 {
		return fmt.Errorf("no stories (story.md) found in %s", rootDir)
	}

	// Sort stories chronologically
	sort.Slice(allStories, func(i, j int) bool {
		return allStories[i].DirPath < allStories[j].DirPath
	})

	// Filter stories if targetYear or targetWeek specified
	var stories []StoryItem
	for _, s := range allStories {
		if !s.Date.IsZero() {
			sYear, sWeek := s.Date.ISOWeek()
			if targetYear > 0 {
				normYear := targetYear
				if normYear > 10000 {
					normYear -= 10000
				}
				if sYear != normYear && s.Date.Year() != normYear {
					continue
				}
			}
			if targetWeek > 0 && sWeek != targetWeek {
				continue
			}
		}
		stories = append(stories, s)
	}

	if len(stories) == 0 {
		if targetYear > 0 || targetWeek > 0 {
			return fmt.Errorf("no stories found matching year %d, week %d in %s", targetYear, targetWeek, rootDir)
		}
		return fmt.Errorf("no stories found in %s", rootDir)
	}

	now := time.Now()
	var yearHE, weekNumber int

	if targetYear > 0 && targetWeek > 0 {
		normYear := targetYear
		if normYear < 10000 {
			normYear += 10000
		}
		yearHE = normYear
		weekNumber = targetWeek
	} else if len(stories) > 0 && !stories[len(stories)-1].Date.IsZero() {
		lastStoryDate := stories[len(stories)-1].Date
		yearHE = 10000 + lastStoryDate.Year()
		_, weekNumber = lastStoryDate.ISOWeek()
	} else {
		yearHE = 10000 + now.Year()
		_, weekNumber = now.ISOWeek()
	}

	outputPath := cmd.String("output")
	if outputPath == "" {
		outputPath = fmt.Sprintf("omni-archivist-%d-w%02d.epub", yearHE, weekNumber)
	}

	anthologyTitle := fmt.Sprintf("Omni Archivist #%d %d", weekNumber, yearHE)
	fmt.Printf("Compiling %d stories into '%s' -> %s\n", len(stories), anthologyTitle, outputPath)

	// Synthesize Subtitle and Preface
	subtitle, prefaceText := generatePrefaceAndSubtitle(ctx, anthologyTitle, yearHE, weekNumber, stories)
	fmt.Printf("Anthology Subtitle: %s\n", subtitle)

	pubID := fmt.Sprintf("urn:omni-archivist:compilation:%d-w%02d", yearHE, weekNumber)
	w := epub.New(pubID)

	w.Title(anthologyTitle)
	if subtitle != "" {
		w.Description(subtitle)
	}
	w.Author("Omni Archivist")
	w.Languages("en")
	w.Date(now)

	// Set cover if available
	for i := len(stories) - 1; i >= 0; i-- {
		if stories[i].CoverPath != "" {
			if _, cErr := os.Stat(stories[i].CoverPath); cErr == nil {
				fmt.Printf("Using cover from %s\n", stories[i].CoverPath)
				_ = w.CoverFile(stories[i].CoverPath)
				break
			}
		}
	}

	var tocItems []epub.TOC

	// 1. Add Preface / Overview as the first document in the EPUB
	prefaceFilename := "preface.md"
	var prefaceMD strings.Builder
	prefaceMD.WriteString(fmt.Sprintf("# Preface: Curatorial Overview\n\n"))
	if subtitle != "" {
		prefaceMD.WriteString(fmt.Sprintf("*%s*\n\n", subtitle))
	}
	prefaceMD.WriteString(fmt.Sprintf("**Chronicle Date:** Year %d Human Era (HE) | Week #%d\n\n---\n\n", yearHE, weekNumber))
	prefaceMD.WriteString(prefaceText)

	resPreface, pErr := w.AddMarkdown(prefaceFilename, []byte(prefaceMD.String()))
	if pErr == nil {
		tocItems = append(tocItems, epub.TOC{
			Title: "Preface: Curatorial Overview",
			Href:  resPreface.Href,
		})
		fmt.Println("Added Preface to Table of Contents")
	}

	// 2. Add each story as a chapter
	for i, story := range stories {
		title := story.Metadata.Story.Title
		if title == "" {
			title = fmt.Sprintf("Story %02d", i+1)
		}

		var sb strings.Builder
		sb.WriteString(fmt.Sprintf("# %s\n\n", title))
		if story.Metadata.Story.Subtitle != "" {
			sb.WriteString(fmt.Sprintf("*%s*\n\n", story.Metadata.Story.Subtitle))
		}
		if story.Metadata.Meta.Genre.Name != "" || story.Metadata.Meta.ScienceField.Name != "" {
			sb.WriteString(fmt.Sprintf("**Sub-genre:** %s | **Science Field:** %s\n\n",
				story.Metadata.Meta.Genre.Name, story.Metadata.Meta.ScienceField.Name))
		}
		if story.Metadata.Story.Blurb != "" {
			sb.WriteString(fmt.Sprintf("> %s\n\n", story.Metadata.Story.Blurb))
		}
		sb.WriteString("---\n\n")
		sb.WriteString(story.StoryMD)

		filename := fmt.Sprintf("chapter-%02d.md", i+1)
		res, aErr := w.AddMarkdown(filename, []byte(sb.String()))
		if aErr != nil {
			fmt.Printf("Warning: failed adding story %s: %v\n", title, aErr)
		} else {
			fmt.Printf("Added chapter %d: %s\n", i+1, title)
			tocItems = append(tocItems, epub.TOC{
				Title: title,
				Href:  res.Href,
			})
		}
	}

	toc := epub.TOC{
		Title: "Table of Contents",
		Items: tocItems,
	}
	if err := w.TableOfContents("toc", toc); err != nil {
		return fmt.Errorf("failed setting table of contents: %w", err)
	}

	if err := w.Write(outputPath); err != nil {
		return fmt.Errorf("failed to write EPUB %s: %w", outputPath, err)
	}

	fmt.Printf("Successfully generated EPUB: %s\n", outputPath)
	return nil
}

func generatePrefaceAndSubtitle(ctx context.Context, title string, yearHE, weekNumber int, stories []StoryItem) (string, string) {
	var storyInputs []AnthologyStoryInput
	for _, s := range stories {
		st := s.Metadata.Story
		storyInputs = append(storyInputs, AnthologyStoryInput{
			Title:        st.Title,
			Subtitle:     st.Subtitle,
			Genre:        s.Metadata.Meta.Genre.Name,
			ScienceField: s.Metadata.Meta.ScienceField.Name,
			Logline:      st.Logline,
			Synopsis:     st.Synopsis,
			Theme:        st.Theme.CentralPremise,
		})
	}

	gk, err := utils.GenkitFromContext(ctx)
	if err == nil && gk != nil {
		genkit.DefineSchemaFor[AnthologyStoryInput](gk)
		genkit.DefineSchemaFor[AnthologyPrefaceInput](gk)
		genkit.DefineSchemaFor[AnthologyPrefaceOutput](gk)

		prefacePrompt := genkit.LookupDataPrompt[AnthologyPrefaceInput, *AnthologyPrefaceOutput](gk, "preface")
		if prefacePrompt != nil {
			input := AnthologyPrefaceInput{
				Title:      title,
				YearHE:     yearHE,
				WeekNumber: weekNumber,
				Stories:    storyInputs,
			}

			retrier := utils.NewPromptRetrier[*AnthologyPrefaceOutput]("Compile Preface")
			result, pErr := retrier.Do(func() (*AnthologyPrefaceOutput, error) {
				res, _, doErr := prefacePrompt.Execute(ctx, input)
				return res, doErr
			})

			if pErr == nil && result != nil && result.Preface != "" {
				return result.Subtitle, result.Preface
			}
		}
	}

	// Deterministic Fallback if Genkit is unavailable or offline
	var loglines []string
	for _, si := range storyInputs {
		ll := si.Logline
		if ll == "" {
			ll = si.Subtitle
		}
		if ll != "" {
			loglines = append(loglines, fmt.Sprintf("- ***%s***: %s", si.Title, ll))
		}
	}

	fallbackSubtitle := "A Curated Tapestry of Speculative Realities and Cosmic Inquiries"
	fallbackPreface := fmt.Sprintf(
		"Welcome to this bi-weekly compilation from the **Omni Archivist**, recorded in the year **%d Human Era (HE)**.\n\n"+
			"Twelve millennia have passed since humanity first traced the motions of the wandering stars and laid the foundations of civilization. In this anthology, we gather the narratives that map the periphery of human cognition, technological transcendence, and existential wonder.\n\n"+
			"### Stories in this Volume\n\n%s\n\n"+
			"May these dispatches offer a reflective aperture into the myriad possible futures of humankind.",
		yearHE, strings.Join(loglines, "\n\n"),
	)

	return fallbackSubtitle, fallbackPreface
}

func loadStoryItem(dir, storyMDPath string) (StoryItem, error) {
	var item StoryItem
	item.DirPath = dir

	// Parse date from directory path (e.g. .../2026/10/08 or ...\2026\10\08)
	cleanPath := filepath.ToSlash(filepath.Clean(dir))
	parts := strings.Split(cleanPath, "/")
	if len(parts) >= 3 {
		yStr := parts[len(parts)-3]
		mStr := parts[len(parts)-2]
		dStr := parts[len(parts)-1]
		if y, err := strconv.Atoi(yStr); err == nil && y > 1000 {
			if m, err := strconv.Atoi(mStr); err == nil && m >= 1 && m <= 12 {
				if d, err := strconv.Atoi(dStr); err == nil && d >= 1 && d <= 31 {
					item.Date = time.Date(y, time.Month(m), d, 12, 0, 0, 0, time.UTC)
				}
			}
		}
	}

	storyBytes, err := os.ReadFile(storyMDPath)
	if err != nil {
		return item, err
	}
	item.StoryMD = string(storyBytes)

	metaPath := filepath.Join(dir, "metadata.yml")
	if metaBytes, mErr := os.ReadFile(metaPath); mErr == nil {
		_ = yaml.Unmarshal(metaBytes, &item.Metadata)
	}

	// Check for cover image in story directory
	for _, coverName := range []string{"cover.png", "cover.jpg", "cover.jpeg"} {
		cp := filepath.Join(dir, coverName)
		if _, statErr := os.Stat(cp); statErr == nil {
			item.CoverPath = cp
			break
		}
	}

	return item, nil
}

type WeekSummary struct {
	Year       int      `json:"year"`
	YearHE     int      `json:"year_he"`
	WeekNumber int      `json:"week_number"`
	PaddedWeek string   `json:"padded_week"`
	Tag        string   `json:"tag"`
	Title      string   `json:"title"`
	EpubFile   string   `json:"epub_file"`
	StoryCount int      `json:"story_count"`
	StoryDirs  []string `json:"story_dirs,omitempty"`
}

func compileWeeksAction(ctx context.Context, cmd *cli.Command) error {
	rootDir := cmd.String("dir")
	if rootDir == "" {
		rootDir = utils.ArtifactsDir()
	}

	type weekKey struct {
		year int
		week int
	}

	weekMap := make(map[weekKey][]StoryItem)

	err := filepath.Walk(rootDir, func(path string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() {
			return nil
		}
		if filepath.Base(path) == "story.md" {
			dir := filepath.Dir(path)
			storyItem, sErr := loadStoryItem(dir, path)
			if sErr == nil && len(storyItem.StoryMD) > 0 && !storyItem.Date.IsZero() {
				sYear, sWeek := storyItem.Date.ISOWeek()
				k := weekKey{year: sYear, week: sWeek}
				weekMap[k] = append(weekMap[k], storyItem)
			}
		}
		return nil
	})

	if err != nil {
		return fmt.Errorf("failed scanning directory %s: %w", rootDir, err)
	}

	var keys []weekKey
	for k := range weekMap {
		keys = append(keys, k)
	}

	sort.Slice(keys, func(i, j int) bool {
		if keys[i].year != keys[j].year {
			return keys[i].year < keys[j].year
		}
		return keys[i].week < keys[j].week
	})

	var summaries []WeekSummary
	for _, k := range keys {
		sList := weekMap[k]
		yearHE := 10000 + k.year
		paddedWeek := fmt.Sprintf("%02d", k.week)
		var dirs []string
		for _, s := range sList {
			dirs = append(dirs, s.DirPath)
		}
		summaries = append(summaries, WeekSummary{
			Year:       k.year,
			YearHE:     yearHE,
			WeekNumber: k.week,
			PaddedWeek: paddedWeek,
			Tag:        fmt.Sprintf("v%d.w%d", yearHE, k.week),
			Title:      fmt.Sprintf("Omni Archivist #%d %d", k.week, yearHE),
			EpubFile:   fmt.Sprintf("omni-archivist-%d-w%s.epub", yearHE, paddedWeek),
			StoryCount: len(sList),
			StoryDirs:  dirs,
		})
	}

	if cmd.Bool("json") {
		b, mErr := json.MarshalIndent(summaries, "", "  ")
		if mErr != nil {
			return mErr
		}
		fmt.Println(string(b))
		return nil
	}

	for _, s := range summaries {
		fmt.Printf("%s\t%s\t%s\t(%d stories)\n", s.Tag, s.Title, s.EpubFile, s.StoryCount)
	}
	return nil
}
