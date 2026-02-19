package check

import (
	"context"

	"github.com/urfave/cli/v3"
)

type CheckCommand struct {
	context *context.Context
	*cli.Command
}

func (c *CheckCommand) CliCommand() *cli.Command {
	c.Command.Action = c.action
	return c.Command
}

func NewCheckCommand(ctx context.Context) *CheckCommand {
	return &CheckCommand{
		context: &ctx,
		Command: &cli.Command{
			Name:    "check",
			Aliases: []string{"c"},
			Usage:   "check ",
		},
	}
}
