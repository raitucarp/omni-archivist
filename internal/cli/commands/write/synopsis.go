package write

import (
	"context"
	"time"

	"github.com/avast/retry-go/v5"
	"github.com/firebase/genkit/go/genkit"
	"github.com/raitucarp/omni-archivist/internal/metadata"
	"github.com/raitucarp/omni-archivist/internal/utils"
	"github.com/urfave/cli/v3"
)

type SynopsisResult struct {
	Synopsis    string `yaml:"synopsis" json:"synopsis" jsonschema:"description=A brief overview of the story's plot, characters, and setting, 4 to 6 paragraphs"`
	Logline     string `yaml:"logline" json:"logline" jsonschema:"description=A one-sentence summary of the story's main plot"`
	Blurb       string `yaml:"blurb" json:"blurb" jsonschema:"description=A short summary or teaser of the story"`
	Title       string `yaml:"title" json:"title" jsonschema:"description=Title of story"`
	Subtitle    string `yaml:"subtitle" json:"subtitle" jsonschema:"description=Subtitle of title of story"`
	POV         string `yaml:"pov" json:"pov" jsonschema:"enum=first_person,enum=third_person_limited,enum=third_person_omniscient,description=Story point of view determines the narrator's perspective, influencing reader intimacy and information access."`
	ImagePrompt string `yaml:"image_prompt" json:"image_prompt" jsonschema:"description=Prompt for generating a visual, an image that represents the story."`
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
	genkit.DefineSchemaFor[SynopsisResult](gk)
	synopsisPrompt := genkit.LookupDataPrompt[metadata.Meta, *SynopsisResult](gk, "synopsis")

	retrier := retry.NewWithData[*SynopsisResult](
		retry.Attempts(25),
		retry.Delay(500*time.Millisecond),
	)

	synopsisResult, err := retrier.Do(func() (synopsisResult *SynopsisResult, err error) {
		synopsisResult, _, err = synopsisPrompt.Execute(ctx, currentMetadata.Meta)

		if err != nil {
			return
		}
		return
	})

	if err != nil {
		return
	}

	currentMetadata.Story.Synopsis = synopsisResult.Synopsis
	currentMetadata.Story.Blurb = synopsisResult.Blurb
	currentMetadata.Story.Logline = synopsisResult.Logline
	currentMetadata.Story.Title = synopsisResult.Title
	currentMetadata.Story.Subtitle = synopsisResult.Subtitle
	currentMetadata.Story.POV = synopsisResult.POV
	currentMetadata.Story.ImagePrompt = synopsisResult.ImagePrompt

	err = metadata.Write(currentMetadata)

	return
}
