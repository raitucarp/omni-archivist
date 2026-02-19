package check

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"github.com/goccy/go-yaml"
	"github.com/raitucarp/omni-archivist/internal/metadata"
	"github.com/raitucarp/omni-archivist/internal/utils"
	"github.com/urfave/cli/v3"
)

func createMetadataIfNotExists(artifactPath string) (err error) {
	m := metadata.Metadata{}
	metadataContent, yamlErr := yaml.Marshal(m)
	if yamlErr != nil {
		return yamlErr
	}

	metadataPath := filepath.Join(artifactPath, "metadata.yml")
	_, err = os.Stat(metadataPath)
	if err == nil {
		fmt.Printf("File %s already exists\n", metadataPath)
		return nil
	}

	if !os.IsNotExist(err) {
		return fmt.Errorf("error checking file: %w", err)
	}

	dir := filepath.Dir(metadataPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	file, err := os.Create(metadataPath)
	if err != nil {
		return fmt.Errorf("error creating file: %w", err)
	}
	defer file.Close()

	fmt.Printf("Created file: %s\n", metadataPath)

	_, err = file.Write(metadataContent)
	if err != nil {
		return
	}

	return
}

func (c *CheckCommand) action(ctx context.Context, cmd *cli.Command) (err error) {
	directoryPath := utils.TodayStoryFullPath()

	err = createMetadataIfNotExists(directoryPath)
	if err != nil {
		return err
	}

	return nil
}
