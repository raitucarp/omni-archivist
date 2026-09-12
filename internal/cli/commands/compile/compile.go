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

	pagesCommand := &cli.Command{
		Name:    "pages",
		Aliases: []string{"p", "site"},
		Usage:   "Compile stories into a static website for GitHub Pages",
		Flags: []cli.Flag{
			&cli.StringFlag{
				Name:    "dir",
				Aliases: []string{"d"},
				Usage:   "Source directory of stories (defaults to ARTIFACTS_DIR or artifacts)",
			},
			&cli.StringFlag{
				Name:    "output",
				Aliases: []string{"o"},
				Usage:   "Output directory for the static site (defaults to public)",
			},
			&cli.StringFlag{
				Name:    "cname",
				Aliases: []string{"c"},
				Usage:   "Custom domain for GitHub Pages CNAME (defaults to omni-archivist.raitucarp.name)",
				Value:   "omni-archivist.raitucarp.name",
			},
		},
		Action: compilePagesAction,
	}

	cmd := &CompileCommand{
		context: &ctx,
		Command: &cli.Command{
			Name:    "compile",
			Aliases: []string{"cmp"},
			Usage:   "Compile generated stories into publications",
			Commands: []*cli.Command{
				epubCommand,
				pagesCommand,
			},
		},
	}

	return cmd
}
