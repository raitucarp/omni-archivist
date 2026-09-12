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

func writeStructuresAction(ctx context.Context, command *cli.Command) (err error) {
	gk, err := utils.GenkitFromContext(ctx)
	if err != nil {
		return
	}

	currentMetadata, err := metadata.Read()
	if err != nil {
		return err
	}

	genkit.DefineSchemaFor[metadata.Story](gk)
	genkit.DefineSchemaFor[metadata.Structure](gk)
	structurePrompt := genkit.LookupDataPrompt[metadata.Story, *metadata.Structure](gk, "structure")

	retrier := retry.NewWithData[*metadata.Structure](
		retry.Attempts(10),
		retry.Delay(1*time.Second),
	)

	structure, err := retrier.Do(func() (*metadata.Structure, error) {
		res, _, pErr := structurePrompt.Execute(ctx, currentMetadata.Story)
		if pErr != nil {
			return nil, pErr
		}
		return res, nil
	})

	if err != nil {
		return err
	}

	currentMetadata.Story.Structure = structure

	err = metadata.Write(currentMetadata)

	return
}
