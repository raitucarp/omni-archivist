package write

import (
	"context"
	"errors"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/firebase/genkit/go/genkit"
	"github.com/goccy/go-yaml"
	"github.com/raitucarp/omni-archivist/internal/metadata"
	"github.com/raitucarp/omni-archivist/internal/utils"
	"github.com/urfave/cli/v3"
)

type DraftInput struct {
	Structure string `json:"structure"`
	Story     string `json:"story"`
}

type FinalStory struct {
	Paragraphs []string `json:"paragraphs" yaml:"paragraphs" jsonschema:"description=Story by paragraphs"`
	Title      string   `yaml:"title" json:"title" jsonschema:"description=A newly reimagined title crafted with profound meaning and distinctive structure and language"`
	Subtitle   string   `yaml:"subtitle" json:"subtitle" jsonschema:"description=Subtitle of story"`
}

func rewriteStoryAction(ctx context.Context, command *cli.Command) (err error) {
	gk, err := utils.GenkitFromContext(ctx)
	if err != nil {
		return
	}

	currentMetadata, err := metadata.Read()
	if err != nil {
		return
	}

	genkit.DefineSchemaFor[FinalStory](gk)
	genkit.DefineSchemaFor[DraftInput](gk)
	rewriteStoryPrompt := genkit.LookupDataPrompt[DraftInput, *FinalStory](gk, "rewrite")

	todayStoryPath := utils.TodayStoryFullPath()
	filename := "draft.md"
	storyFilePath := filepath.Join(todayStoryPath, filename)

	draft, err := os.ReadFile(storyFilePath)
	if err != nil {
		return
	}

	structure, err := yaml.Marshal(currentMetadata)
	if err != nil {
		return
	}

	input := DraftInput{
		Structure: string(structure),
		Story:     string(draft),
	}
	log.Println("Rewrite story of", currentMetadata.Story.Title)
	log.Println("Rewrite story with length", len(input.Story))
	log.Println("Rewrite story with yaml structure", len(input.Structure))
	finalStory, _, err := rewriteStoryPrompt.Execute(ctx, input)

	if err != nil {
		return
	}

	if len(finalStory.Paragraphs) <= 0 {
		err = errors.New("No story")
		return
	}

	finalStoryPath := filepath.Join(todayStoryPath, "story.md")
	log.Println("Rewrite story with number of paragraphs", len(finalStory.Paragraphs))
	err = os.WriteFile(finalStoryPath, []byte(
		strings.Join(finalStory.Paragraphs, "\n\n"),
	), 0755)
	if err != nil {
		return
	}

	currentMetadata.Story.Title = finalStory.Title
	currentMetadata.Story.Subtitle = finalStory.Subtitle
	log.Println("Rewrite story title", currentMetadata.Story.Title)
	log.Println("Rewrite story subtitle", currentMetadata.Story.Subtitle)
	err = metadata.Write(currentMetadata)

	return
}
