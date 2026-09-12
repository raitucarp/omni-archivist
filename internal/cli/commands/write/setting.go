package write

import (
	"context"
	"log"

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

	log.Println("==> Constructing multi-scalar sci-fi setting (macro, meso, micro, topography, atmosphere)...")
	retrier := utils.NewPromptRetrier[*metadata.Setting]("Write Setting")

	settingResult, err := retrier.Do(func() (*metadata.Setting, error) {
		res, _, pErr := settingPrompt.Execute(ctx, currentMetadata.Story)
		if pErr != nil {
			return nil, pErr
		}
		return res, nil
	})

	if err != nil {
		return err
	}

	log.Printf("Setting Constructed: Function=%s, Chronotope=%s\n", settingResult.Function, settingResult.Chronotope)
	currentMetadata.Story.Setting = settingResult
	err = metadata.Write(currentMetadata)
	return err
}
