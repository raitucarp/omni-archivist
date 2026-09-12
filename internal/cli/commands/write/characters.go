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

	retrier := retry.NewWithData[*Characters](
		retry.Attempts(10),
		retry.Delay(1*time.Second),
	)

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

	currentMetadata.Story.Characters = []metadata.Character{}
	for _, char := range *characters {
		currentMetadata.Story.Characters = append(currentMetadata.Story.Characters, char)
	}

	err = metadata.Write(currentMetadata)

	return
}
