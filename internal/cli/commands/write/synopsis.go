package write

import (
	"context"
	"log"
	"strings"

	"github.com/firebase/genkit/go/genkit"
	"github.com/raitucarp/omni-archivist/internal/metadata"
	"github.com/raitucarp/omni-archivist/internal/utils"
	"github.com/urfave/cli/v3"
)

type SynopsisResult struct {
	Synopsis    string             `yaml:"synopsis" json:"synopsis" jsonschema:"description=A brief overview of the story's plot, characters, and setting, 4 to 6 paragraphs"`
	Logline     string             `yaml:"logline" json:"logline" jsonschema:"description=A punchy, structurally diverse 1-2 sentence hook. Strictly FORBIDDEN to start with 'When...', 'In a world where...', 'In a post-... world', or 'As...'. Focus on an active protagonist, a unique premise, and a specific dramatic dilemma without existential disaster tropes."`
	Blurb       string             `yaml:"blurb" json:"blurb" jsonschema:"description=An engaging 2-3 paragraph teaser. Strictly FORBIDDEN to open with 'In an era where...', 'In a world where...', or 'A sweeping/cerebral examination of...'. Begin with an immediate dramatic intrigue, provocative assertion, or striking sensory detail, highlighting curiosity, wonder, and philosophical tension."`
	Title       string             `yaml:"title" json:"title" jsonschema:"description=A vibrant, distinctive title. Strictly AVOID cliché 'The [Adjective] [Noun]' or repetitive formulas like 'The ... Horizon' or 'The ... Protocol'. Use varied syntactic forms: evocative single words, poetic phrases, action verbs, metaphorical juxtapositions, or unusual questions."`
	Subtitle    string             `yaml:"subtitle" json:"subtitle" jsonschema:"description=An evocative, poetic, or atmospheric secondary header. Strictly AVOID dry academic 'The [Science] of [Collapse]' formulas. Use lyrical counterpoints, contextual coordinates, or philosophical aphorisms."`
	Theme       metadata.Theme     `yaml:"theme,omitempty" json:"theme,omitempty" jsonschema:"description=Core theme, premise, motifs, ideology, morality, and identity"`
	Plot        metadata.Plot      `yaml:"plot,omitempty" json:"plot,omitempty" jsonschema:"description=Core plot conflict, Freytag dramatic arc, and emplotment dynamics"`
	Discourse   metadata.Discourse `yaml:"discourse,omitempty" json:"discourse,omitempty" jsonschema:"description=Discourse narration, focalisation, and style"`
	POV         string             `yaml:"pov" json:"pov" jsonschema:"enum=first_person,enum=third_person_limited,enum=third_person_omniscient,description=Story point of view determines the narrator's perspective, influencing reader intimacy and information access."`
	ImagePrompt string             `yaml:"image_prompt" json:"image_prompt" jsonschema:"description=Prompt for generating a visual, an image that represents the story."`
}

func writeSynopsisAction(ctx context.Context, command *cli.Command) (err error) {
	gk, err := utils.GenkitFromContext(ctx)
	if err != nil {
		return
	}

	currentMetadata, err := metadata.Read()
	if err != nil {
		return err
	}

	// Ensure AdverbTheme is populated if empty from vocabs
	if currentMetadata.Meta.AdverbTheme == "" {
		var adverbs []string
		for _, v := range currentMetadata.Meta.Vocabs {
			if v.LexCategory == "adverb.all" {
				adverbs = append(adverbs, v.Word)
			}
		}
		if len(adverbs) > 0 {
			currentMetadata.Meta.AdverbTheme = strings.Join(adverbs, ", ")
		}
	}

	genkit.DefineSchemaFor[metadata.Meta](gk)
	genkit.DefineSchemaFor[metadata.Theme](gk)
	genkit.DefineSchemaFor[metadata.PlotConflict](gk)
	genkit.DefineSchemaFor[metadata.PlotArc](gk)
	genkit.DefineSchemaFor[metadata.Plot](gk)
	genkit.DefineSchemaFor[metadata.Narration](gk)
	genkit.DefineSchemaFor[metadata.LanguageStyle](gk)
	genkit.DefineSchemaFor[metadata.Discourse](gk)
	genkit.DefineSchemaFor[SynopsisResult](gk)
	synopsisPrompt := genkit.LookupDataPrompt[metadata.Meta, *SynopsisResult](gk, "synopsis")

	log.Println("==> Writing story synopsis, title, theme, plot, and discourse...")
	retrier := utils.NewPromptRetrier[*SynopsisResult]("Write Synopsis")

	synopsisResult, err := retrier.Do(func() (*SynopsisResult, error) {
		res, _, pErr := synopsisPrompt.Execute(ctx, currentMetadata.Meta)
		if pErr != nil {
			return nil, pErr
		}
		return res, nil
	})

	if err != nil {
		return err
	}

	log.Printf("Generated Story Title: %s - %s\n", synopsisResult.Title, synopsisResult.Subtitle)
	log.Printf("Logline: %s\n", synopsisResult.Logline)

	currentMetadata.Story.Synopsis = synopsisResult.Synopsis
	currentMetadata.Story.Blurb = synopsisResult.Blurb
	currentMetadata.Story.Logline = synopsisResult.Logline
	currentMetadata.Story.Title = synopsisResult.Title
	currentMetadata.Story.Subtitle = synopsisResult.Subtitle
	currentMetadata.Story.Theme = &synopsisResult.Theme
	currentMetadata.Story.Plot = &synopsisResult.Plot
	currentMetadata.Story.Discourse = &synopsisResult.Discourse
	currentMetadata.Story.POV = synopsisResult.POV
	currentMetadata.Story.ImagePrompt = synopsisResult.ImagePrompt

	err = metadata.Write(currentMetadata)

	return
}
