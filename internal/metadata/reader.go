package metadata

import (
	"os"
	"path/filepath"

	"github.com/goccy/go-yaml"
	"github.com/raitucarp/omni-archivist/internal/utils"
)

func Read() (m Metadata, err error) {
	content, err := ReadTodayArtifact()
	if err != nil {
		return
	}

	err = yaml.Unmarshal([]byte(content), &m)
	if err != nil {
		return
	}

	return
}

func ReadTodayArtifact() (artifact []byte, err error) {
	todayStoryPath := utils.TodayStoryFullPath()
	artifact, err = os.ReadFile(filepath.Join(todayStoryPath, "metadata.yml"))
	if err != nil {
		return
	}

	return
}
