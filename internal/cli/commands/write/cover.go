package write

import (
	"context"
	"encoding/base64"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/avast/retry-go/v5"
	"github.com/firebase/genkit/go/ai"
	"github.com/firebase/genkit/go/genkit"
	"github.com/raitucarp/omni-archivist/internal/metadata"
	"github.com/raitucarp/omni-archivist/internal/utils"
	"github.com/urfave/cli/v3"
)

type CoverPromptInput struct {
	Title     string                   `json:"title"`
	Subtitle  string                   `json:"subtitle"`
	Synopsis  string                   `json:"synopsis"`
	Setting   metadata.Setting         `json:"setting"`
	Aesthetic metadata.VisualAesthetic `json:"aesthetic"`
}

type CoverPromptOutput struct {
	SubjectMatter string `json:"subject_matter" jsonschema:"description=The central visual subject or focal moment"`
	Prompt        string `json:"prompt" jsonschema:"description=Vivid descriptive prompt for the image generation model"`
}

func writeCoverAction(ctx context.Context, command *cli.Command) (err error) {
	gk, err := utils.GenkitFromContext(ctx)
	if err != nil {
		return err
	}

	currentMetadata, err := metadata.Read()
	if err != nil {
		return err
	}

	if currentMetadata.Story.Synopsis == "" {
		return fmt.Errorf("synopsis is empty; please run 'write synopsis' before generating cover")
	}

	// 1. Generate randomized visual aesthetic seeds
	aesthetic := metadata.RandomAesthetic()
	fmt.Printf("Selected Aesthetic: %s\n", aesthetic.Summary())

	// 2. Harmonize aesthetic seeds with story synopsis via Gemini
	genkit.DefineSchemaFor[metadata.Setting](gk)
	genkit.DefineSchemaFor[metadata.VisualAesthetic](gk)
	genkit.DefineSchemaFor[CoverPromptInput](gk)
	genkit.DefineSchemaFor[CoverPromptOutput](gk)

	coverPromptTemplate := genkit.LookupDataPrompt[CoverPromptInput, *CoverPromptOutput](gk, "cover_prompt")
	input := CoverPromptInput{
		Title:     currentMetadata.Story.Title,
		Subtitle:  currentMetadata.Story.Subtitle,
		Synopsis:  currentMetadata.Story.Synopsis,
		Setting:   currentMetadata.Story.Setting,
		Aesthetic: aesthetic,
	}

	retrier := retry.NewWithData[*CoverPromptOutput](
		retry.Attempts(5),
		retry.Delay(500*time.Millisecond),
	)

	promptResult, err := retrier.Do(func() (*CoverPromptOutput, error) {
		res, _, pErr := coverPromptTemplate.Execute(ctx, input)
		if pErr != nil {
			return nil, pErr
		}
		return res, nil
	})
	if err != nil {
		return fmt.Errorf("failed to generate cover prompt: %w", err)
	}

	aesthetic.SubjectMatter = promptResult.SubjectMatter
	aesthetic.Prompt = promptResult.Prompt
	fmt.Printf("Generated Cover Prompt: %s\n", aesthetic.Prompt)

	// 3. Generate cover image using Imagen 3 model via Genkit
	imageModel := os.Getenv("IMAGEN_MODEL")
	if imageModel == "" {
		imageModel = "googleai/imagen-3.0-generate-002"
	}

	fmt.Printf("Generating cover image using model: %s...\n", imageModel)
	resp, err := genkit.Generate(ctx, gk,
		ai.WithModelName(imageModel),
		ai.WithPrompt(aesthetic.Prompt),
	)
	if err != nil {
		return fmt.Errorf("failed to generate cover image with %s: %w", imageModel, err)
	}

	// 4. Extract image bytes from response
	var imageBytes []byte
	for _, part := range resp.Message.Content {
		if part.Kind == ai.PartMedia {
			dataURI := part.Text
			// Format: data:<mime>;base64,<encoded>
			parts := strings.SplitN(dataURI, ",", 2)
			encoded := dataURI
			if len(parts) == 2 {
				encoded = parts[1]
			}
			decoded, bErr := base64.StdEncoding.DecodeString(encoded)
			if bErr == nil && len(decoded) > 0 {
				imageBytes = decoded
				break
			}
		}
	}

	if len(imageBytes) == 0 {
		return fmt.Errorf("no valid image data returned from image generation model")
	}

	// 5. Save cover file to today's story folder
	targetDir := utils.TodayStoryFullPath()
	if err := os.MkdirAll(targetDir, 0755); err != nil {
		return fmt.Errorf("failed to create directory %s: %w", targetDir, err)
	}

	coverFileName := "cover.png"
	coverFilePath := filepath.Join(targetDir, coverFileName)
	if err := os.WriteFile(coverFilePath, imageBytes, 0644); err != nil {
		return fmt.Errorf("failed to save cover image to %s: %w", coverFilePath, err)
	}
	fmt.Printf("Cover successfully saved to: %s\n", coverFilePath)

	// 6. Update story metadata
	currentMetadata.Story.Aesthetic = aesthetic
	currentMetadata.Story.CoverPath = coverFileName
	if err := metadata.Write(currentMetadata); err != nil {
		return fmt.Errorf("failed to update metadata with cover info: %w", err)
	}

	return nil
}
