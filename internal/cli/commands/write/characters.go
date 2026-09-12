package write

import (
	"context"
	"log"

	"github.com/firebase/genkit/go/genkit"
	"github.com/raitucarp/omni-archivist/internal/metadata"
	"github.com/raitucarp/omni-archivist/internal/utils"
	"github.com/urfave/cli/v3"
)

type Characters []metadata.Character

func writeCharactersAction(ctx context.Context, command *cli.Command) (err error) {
	gk, err := utils.GenkitFromContext(ctx)
	if err != nil {
		return
	}

	currentMetadata, err := metadata.Read()
	if err != nil {
		return err
	}

	genkit.DefineSchemaFor[metadata.Story](gk)
	genkit.DefineSchemaFor[Characters](gk)
	charactersPrompt := genkit.LookupDataPrompt[metadata.Story, *Characters](gk, "characters")

	log.Println("==> Designing story characters and actant roles...")
	retrier := utils.NewPromptRetrier[*Characters]("Write Characters")

	characters, err := retrier.Do(func() (*Characters, error) {
		chars, _, pErr := charactersPrompt.Execute(ctx, currentMetadata.Story)
		if pErr != nil {
			return nil, pErr
		}
		return chars, nil
	})

	if err != nil {
		return err
	}

	log.Printf("Generated %d Characters:\n", len(*characters))
	for _, c := range *characters {
		log.Printf("  - %s (%s): %s\n", c.Name, c.Role, c.Description)
	}

	currentMetadata.Story.Characters = []metadata.Character{}
	for _, char := range *characters {
		currentMetadata.Story.Characters = append(currentMetadata.Story.Characters, char)
	}

	err = metadata.Write(currentMetadata)

	return
}
