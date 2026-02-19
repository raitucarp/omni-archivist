package metadata

import (
	"os"
	"path/filepath"

	"github.com/goccy/go-yaml"
	"github.com/raitucarp/omni-archivist/internal/utils"
)

func Write(m Metadata) (err error) {

	metadataContent, yamlErr := yaml.Marshal(m)
	if yamlErr != nil {
		return yamlErr
	}

	todayStoryPath := utils.TodayStoryFullPath()
	err = os.WriteFile(filepath.Join(todayStoryPath, "metadata.yml"), metadataContent, 0644)
	if err != nil {
		return
	}

	return
}
