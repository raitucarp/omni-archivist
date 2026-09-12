package compile

import (
	"context"

	"github.com/urfave/cli/v3"
)

type CompileCommand struct {
	context *context.Context
	*cli.Command
}

func (c *CompileCommand) CliCommand() *cli.Command {
	return c.Command
}

func NewCompileCommand(ctx context.Context) *CompileCommand {
	epubCommand := &cli.Command{
		Name:    "epub",
		Aliases: []string{"e"},
		Usage:   "Compile stories into an EPUB anthology",
		Flags: []cli.Flag{
			&cli.StringFlag{
				Name:    "dir",
				Aliases: []string{"d"},
				Usage:   "Source directory of stories (defaults to ARTIFACTS_DIR or artifacts)",
			},
			&cli.StringFlag{
				Name:    "output",
				Aliases: []string{"o"},
				Usage:   "Output filename for the compiled EPUB",
			},
		},
		Action: compileEpubAction,
	}

	cmd := &CompileCommand{
		context: &ctx,
		Command: &cli.Command{
			Name:    "compile",
			Aliases: []string{"cmp"},
			Usage:   "Compile generated stories into publications",
			Commands: []*cli.Command{
				epubCommand,
			},
		},
	}

	return cmd
}
