package write

import (
	"context"

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

	characters, _, err := charactersPrompt.Execute(ctx, currentMetadata.Story)

	if err != nil {
		return
	}

	currentMetadata.Story.Characters = []metadata.Character{}
	for _, char := range *characters {
		currentMetadata.Story.Characters = append(currentMetadata.Story.Characters, char)
	}

	err = metadata.Write(currentMetadata)

	return
}
