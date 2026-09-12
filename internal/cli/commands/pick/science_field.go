package pick

import (
	"context"
	"log"

	"github.com/raitucarp/omni-archivist/internal/metadata"
	"github.com/samber/lo"
	"github.com/urfave/cli/v3"
)

func scienceFieldAction(ctx context.Context, cmd *cli.Command) (err error) {
	m, err := metadata.Read()
	if err != nil {
		return err
	}

	s := lo.Sample(metadata.ScienceFields)

	m.Meta.ScienceField.Name = s.Name
	m.Meta.ScienceField.Description = s.Description

	log.Printf("==> Selected Science Field: %s (%s)\n", s.Name, s.Description)

	err = metadata.Write(m)
	if err != nil {
		return err
	}

	return
}
