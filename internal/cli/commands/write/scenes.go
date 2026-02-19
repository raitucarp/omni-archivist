package write

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/avast/retry-go/v5"
	"github.com/firebase/genkit/go/genkit"
	"github.com/goccy/go-yaml"
	"github.com/raitucarp/omni-archivist/internal/metadata"
	"github.com/raitucarp/omni-archivist/internal/utils"
	"github.com/urfave/cli/v3"
)

type SceneSequels []metadata.SceneSequel

func writeSceneStructureAction(ctx context.Context, command *cli.Command) (err error) {
	gk, err := utils.GenkitFromContext(ctx)
	if err != nil {
		return
	}

	currentMetadata, err := metadata.Read()
	if err != nil {
		return
	}

	genkit.DefineSchemaFor[metadata.Story](gk)
	genkit.DefineSchemaFor[SceneSequels](gk)
	sceneSequelStructurePrompt := genkit.LookupDataPrompt[metadata.Story, *SceneSequels](gk, "scene_structure")

	sceneSequelStructures, _, err := sceneSequelStructurePrompt.Execute(ctx, currentMetadata.Story)

	if err != nil {
		return
	}

	currentMetadata.Story.SceneSequels = []metadata.SceneSequel{}
	currentMetadata.Story.SceneSequels = *sceneSequelStructures

	err = metadata.Write(currentMetadata)

	return
}

type StoryInput struct {
	Structure     string `json:"structure" yaml:"structure"`
	SceneSequel   string `json:"scene_sequel" yaml:"scene_sequel"`
	PreviousScene string `json:"previous_scene" yaml:"previous_scene"`
	UsePrevious   bool   `json:"use_previous"`
}

type StoryOutput struct {
	Story string `json:"story"`
}

func writeStoryAction(ctx context.Context, command *cli.Command) (err error) {
	gk, err := utils.GenkitFromContext(ctx)
	if err != nil {
		return
	}

	currentMetadata, err := metadata.Read()
	if err != nil {
		return
	}

	storyStructureYaml, err := yaml.Marshal(currentMetadata)
	if err != nil {
		return
	}

	genkit.DefineSchemaFor[StoryInput](gk)
	genkit.DefineSchemaFor[StoryOutput](gk)
	scenesPrompt := genkit.LookupDataPrompt[StoryInput, *StoryOutput](gk, "scenes")

	todayStoryPath := utils.TodayStoryFullPath()
	filename := "draft.md"
	storyFilePath := filepath.Join(todayStoryPath, filename)

	err = os.WriteFile(storyFilePath, []byte(""), 0644)
	if err != nil {
		log.Fatal(err)
		return
	}

	retrier := retry.New(
		retry.Attempts(25),
		retry.Delay(500*time.Millisecond),
	)

	for sceneIndex, sceneSequel := range currentMetadata.Story.SceneSequels {
		log.Println("---")
		log.Println("Write scene #", sceneIndex)

		err := retrier.Do(
			func() (err error) {
				previousScenes, err := os.ReadFile(storyFilePath)
				if err != nil {
					fmt.Printf("Error reading file: %v\n", err)
					return
				}
				log.Println("Read previous scene, with length", len(string(previousScenes)))
				sceneSequelYaml, err := yaml.Marshal(sceneSequel)
				if err != nil {
					log.Fatalf("%v", err)
					return
				}

				storyInput := StoryInput{
					Structure:     string(storyStructureYaml),
					SceneSequel:   string(sceneSequelYaml),
					PreviousScene: string(previousScenes),
					UsePrevious:   sceneIndex != 0,
				}

				sceneStory, _, err := scenesPrompt.Execute(ctx, storyInput)
				if err != nil {
					log.Printf("Error executing prompt: %v\n", err)
					return
				}

				if sceneStory.Story == "" {
					err = errors.New("No story")
					return
				}

				combinedScenes := string(previousScenes)
				combinedScenes = strings.Join([]string{combinedScenes, sceneStory.Story}, "\n\n")

				log.Println("Write scene #", sceneIndex, len(string(combinedScenes)))
				err = os.WriteFile(storyFilePath, []byte(combinedScenes), 0644)
				if err != nil {
					log.Fatal(err)
				}

				return
			},
		)
		if err != nil {
			continue
		}
	}

	return
}
