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

func writeSettingAction(ctx context.Context, command *cli.Command) (err error) {
	gk, err := utils.GenkitFromContext(ctx)
	if err != nil {
		return
	}

	currentMetadata, err := metadata.Read()
	if err != nil {
		return err
	}

	genkit.DefineSchemaFor[metadata.Story](gk)
	genkit.DefineSchemaFor[metadata.Setting](gk)
	settingPrompt := genkit.LookupDataPrompt[metadata.Story, *metadata.Setting](gk, "setting")

	retrier := retry.NewWithData[*metadata.Setting](
		retry.Attempts(10),
		retry.Delay(500*time.Millisecond),
	)

	settingResult, err := retrier.Do(func() (settingResult *metadata.Setting, err error) {
		settingResult, _, err = settingPrompt.Execute(ctx, currentMetadata.Story)
		if err != nil {
			return nil, err
		}
		return settingResult, nil
	})

	if err != nil {
		return err
	}

	currentMetadata.Story.Setting = settingResult
	err = metadata.Write(currentMetadata)
	return err
}
