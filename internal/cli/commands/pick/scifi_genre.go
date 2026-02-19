package pick

import (
	"context"

	"github.com/firebase/genkit/go/genkit"
	"github.com/raitucarp/omni-archivist/internal/metadata"
	"github.com/raitucarp/omni-archivist/internal/utils"
	"github.com/urfave/cli/v3"
)

func scifiGenreAction(ctx context.Context, cmd *cli.Command) (err error) {

	gk, err := utils.GenkitFromContext(ctx)
	if err != nil {
		return
	}

	currentMetadata, err := metadata.Read()
	if err != nil {
		return
	}

	name := currentMetadata.Meta.ScienceField.Name
	description := currentMetadata.Meta.ScienceField.Description
	scienceField := metadata.ScienceField{
		Name:        name,
		Description: description,
	}

	scifiGenrePrompt := genkit.LookupDataPrompt[metadata.ScienceField, *metadata.SciFiGenre](gk, "scifi_genre")
	genre, _, err := scifiGenrePrompt.Execute(ctx, scienceField)

	if err != nil {
		return err
	}

	currentMetadata.Meta.Genre.Name = genre.Name
	currentMetadata.Meta.Genre.Description = genre.Description

	err = metadata.Write(currentMetadata)
	if err != nil {
		return err
	}

	return nil
}
