package write

import (
	"context"
	"encoding/base64"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/firebase/genkit/go/ai"
	"github.com/firebase/genkit/go/genkit"
	"github.com/raitucarp/omni-archivist/internal/metadata"
	"github.com/raitucarp/omni-archivist/internal/utils"
	"github.com/urfave/cli/v3"
	"google.golang.org/genai"
)

type CoverPromptInput struct {
	Title     string                   `json:"title"`
	Subtitle  string                   `json:"subtitle"`
	Synopsis  string                   `json:"synopsis"`
	Setting   *metadata.Setting        `json:"setting,omitempty"`
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

	log.Println("==> Synthesizing visual cover prompt from setting and aesthetic seeds...")
	retrier := utils.NewPromptRetrier[*CoverPromptOutput]("Cover Prompt")

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
	log.Printf("Generated Cover Prompt: %s\n", aesthetic.Prompt)

	// 3. Generate cover image using Gemini Flash Image / Imagen 3 / Imagen Fast via Genkit
	imageModel := os.Getenv("IMAGEN_MODEL")
	if imageModel == "" {
		imageModel = "googleai/gemini-3.1-flash-image"
	}

	modelCandidates := []string{
		imageModel,
		"googleai/gemini-2.5-flash-image",
		"googleai/imagen-3.0-generate-002",
		"googleai/imagen-3.0-fast-generate-001",
	}

	var uniqueCandidates []string
	seen := make(map[string]bool)
	for _, m := range modelCandidates {
		if !seen[m] {
			seen[m] = true
			uniqueCandidates = append(uniqueCandidates, m)
		}
	}

	var resp *ai.ModelResponse
	var genErr error

	for _, m := range uniqueCandidates {
		log.Printf("==> Generating cover illustration using model: %s...\n", m)
		imagenRetrier := utils.NewPromptRetrier[*ai.ModelResponse]("Image Generation (" + m + ")")
		resp, genErr = imagenRetrier.Do(func() (*ai.ModelResponse, error) {
			opts := []ai.GenerateOption{
				ai.WithModelName(m),
				ai.WithPrompt(aesthetic.Prompt),
			}
			if strings.Contains(m, "image") && !strings.Contains(m, "imagen") {
				opts = append(opts, ai.WithConfig(genai.GenerateContentConfig{
					ResponseModalities: []string{"IMAGE", "TEXT"},
				}))
			}
			r, gErr := genkit.Generate(ctx, gk, opts...)
			if gErr != nil {
				return nil, gErr
			}
			return r, nil
		})
		if genErr == nil && resp != nil {
			break
		}
		log.Printf("⚠️ Image model %s failed (%v). Attempting fallback if available...\n", m, genErr)
	}

	if genErr != nil || resp == nil {
		return fmt.Errorf("failed to generate cover image across candidate models: %w", genErr)
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
	currentMetadata.Story.Aesthetic = &aesthetic
	currentMetadata.Story.CoverPath = coverFileName
	if err := metadata.Write(currentMetadata); err != nil {
		return fmt.Errorf("failed to update metadata with cover info: %w", err)
	}

	return nil
}
