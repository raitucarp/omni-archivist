package pick

import (
	"context"

	"github.com/urfave/cli/v3"
)

type PickCommandKind string

const (
	PickScienceFieldCommand      PickCommandKind = "science_field"
	PickSciFiGenreCommand        PickCommandKind = "scifi_genre"
	PickVocabsCompositionCommand PickCommandKind = "vocabs_composition"
)

func (p PickCommandKind) String() string {
	return string(p)
}

type PickCommand struct {
	context *context.Context
	*cli.Command
}

func (p PickCommand) CliCommand() *cli.Command {
	return p.Command
}

func NewPickCommand(ctx context.Context) *PickCommand {

	scienceFieldCommand := &cli.Command{
		Name:    PickScienceFieldCommand.String(),
		Aliases: []string{"sf"},
		Action:  scienceFieldAction,
	}

	scifiGenreCommand := &cli.Command{
		Name:    PickSciFiGenreCommand.String(),
		Aliases: []string{"sg"},
		Action:  scifiGenreAction,
	}

	vocabsCompositionCommand := &cli.Command{
		Name:    PickVocabsCompositionCommand.String(),
		Aliases: []string{"vc"},
		Action:  vocabsCompositionAction,
	}

	pickCommand := &PickCommand{
		context: &ctx,
		Command: &cli.Command{
			Name:    "pick",
			Aliases: []string{"p"},
			Commands: []*cli.Command{
				scienceFieldCommand,
				scifiGenreCommand,
				vocabsCompositionCommand,
			},
		},
	}

	return pickCommand
}
