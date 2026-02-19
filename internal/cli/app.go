package cli

import (
	"context"
	"os"

	"github.com/raitucarp/omni-archivist/internal/cli/commands/check"
	"github.com/raitucarp/omni-archivist/internal/cli/commands/pick"
	"github.com/raitucarp/omni-archivist/internal/cli/commands/write"
	urfave "github.com/urfave/cli/v3"
)

type App struct {
	*urfave.Command
	ctx context.Context
}

func NewApp(ctx context.Context, version string) *App {
	app := &App{
		ctx: ctx,
		Command: &urfave.Command{
			Name:    "omni-archivist",
			Usage:   "Omni Archivist",
			Version: version,
		},
	}

	app.Command.Commands = app.commands()

	return app
}

func (app *App) Run() error {
	return app.Command.Run(app.ctx, os.Args)
}

func (app *App) commands() []*urfave.Command {
	checkCmd := check.NewCheckCommand(app.ctx)
	writeCmd := write.NewWriteCommand(app.ctx)
	pickCmd := pick.NewPickCommand(app.ctx)

	return []*urfave.Command{
		checkCmd.CliCommand(),
		writeCmd.CliCommand(),
		pickCmd.CliCommand(),
	}
}
