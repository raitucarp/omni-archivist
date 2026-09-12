package write

import (
	"context"
	"log"

	"github.com/firebase/genkit/go/genkit"
	"github.com/raitucarp/omni-archivist/internal/metadata"
	"github.com/raitucarp/omni-archivist/internal/utils"
	"github.com/urfave/cli/v3"
)

type SynopsisResult struct {
	Synopsis    string             `yaml:"synopsis" json:"synopsis" jsonschema:"description=A brief overview of the story's plot, characters, and setting, 4 to 6 paragraphs"`
	Logline     string             `yaml:"logline" json:"logline" jsonschema:"description=A one-sentence summary of the story's main plot"`
	Blurb       string             `yaml:"blurb" json:"blurb" jsonschema:"description=A short summary or teaser of the story"`
	Title       string             `yaml:"title" json:"title" jsonschema:"description=Title of story"`
	Subtitle    string             `yaml:"subtitle" json:"subtitle" jsonschema:"description=Subtitle of title of story"`
	Theme       metadata.Theme     `yaml:"theme,omitempty" json:"theme,omitempty" jsonschema:"description=Core theme, premise, and motifs"`
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

	genkit.DefineSchemaFor[metadata.Meta](gk)
	genkit.DefineSchemaFor[metadata.Theme](gk)
	genkit.DefineSchemaFor[metadata.Narration](gk)
	genkit.DefineSchemaFor[metadata.LanguageStyle](gk)
	genkit.DefineSchemaFor[metadata.Discourse](gk)
	genkit.DefineSchemaFor[SynopsisResult](gk)
	synopsisPrompt := genkit.LookupDataPrompt[metadata.Meta, *SynopsisResult](gk, "synopsis")

	log.Println("==> Writing story synopsis, title, and discourse...")
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
	currentMetadata.Story.Discourse = &synopsisResult.Discourse
	currentMetadata.Story.POV = synopsisResult.POV
	currentMetadata.Story.ImagePrompt = synopsisResult.ImagePrompt

	err = metadata.Write(currentMetadata)

	return
}
