package write

import (
	"context"

	"github.com/firebase/genkit/go/genkit"
	"github.com/raitucarp/omni-archivist/internal/metadata"
	"github.com/raitucarp/omni-archivist/internal/utils"
	"github.com/urfave/cli/v3"
)

func writeStructuresAction(ctx context.Context, command *cli.Command) (err error) {
	gk, err := utils.GenkitFromContext(ctx)
	if err != nil {
		return
	}

	currentMetadata, err := metadata.Read()
	if err != nil {
		return
	}

	genkit.DefineSchemaFor[metadata.Story](gk)
	genkit.DefineSchemaFor[metadata.Structure](gk)
	structurePrompt := genkit.LookupDataPrompt[metadata.Story, *metadata.Structure](gk, "structure")

	structure, _, err := structurePrompt.Execute(ctx, currentMetadata.Story)

	if err != nil {
		return
	}

	currentMetadata.Story.Structure = metadata.Structure{}
	currentMetadata.Story.Structure = *structure

	err = metadata.Write(currentMetadata)

	return
}
