package write

import (
	"context"

	"github.com/urfave/cli/v3"
)

type WriteCommandKind string

const (
	WriteSynopsisCommand        WriteCommandKind = "synopsis"
	WriteCharactersCommand      WriteCommandKind = "characters"
	WriteSceneStructuresCommand WriteCommandKind = "scene_structures"
	WriteStructureCommand       WriteCommandKind = "structure"
	WriteStoryCommand           WriteCommandKind = "story"
	WriteRewriteStoryCommand    WriteCommandKind = "rewrite"
)

func (wk WriteCommandKind) String() string {
	return string(wk)
}

type WriteCommand struct {
	context *context.Context
	*cli.Command
}

func (w *WriteCommand) CliCommand() *cli.Command {
	return w.Command
}

func NewWriteCommand(ctx context.Context) *WriteCommand {

	writeSynopsisCommand := &cli.Command{
		Name:    WriteSynopsisCommand.String(),
		Aliases: []string{"syn"},
		Action:  writeSynopsisAction,
	}

	writeCharactersCommand := &cli.Command{
		Name:    WriteCharactersCommand.String(),
		Aliases: []string{"c"},
		Action:  writeCharactersAction,
	}

	writeStructureCommand := &cli.Command{
		Name:    WriteStructureCommand.String(),
		Aliases: []string{"s"},
		Action:  writeStructuresAction,
	}

	writeSceneStructureCommand := &cli.Command{
		Name:    WriteSceneStructuresCommand.String(),
		Aliases: []string{"ss"},
		Action:  writeSceneStructureAction,
	}

	writeStoryCommand := &cli.Command{
		Name:    WriteStoryCommand.String(),
		Aliases: []string{"st"},
		Action:  writeStoryAction,
	}

	rewriteStoryCommand := &cli.Command{
		Name:    WriteRewriteStoryCommand.String(),
		Aliases: []string{"rw"},
		Action:  rewriteStoryAction,
	}

	writeCommand := &WriteCommand{
		context: &ctx,
		Command: &cli.Command{
			Name:    "write",
			Aliases: []string{"w"},
			Commands: []*cli.Command{
				writeSynopsisCommand,
				writeCharactersCommand,
				writeStructureCommand,
				writeSceneStructureCommand,
				writeStoryCommand,
				rewriteStoryCommand,
			},
		},
	}

	return writeCommand
}
