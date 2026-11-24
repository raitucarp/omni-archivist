package metadata

import (
	"bytes"
	"os"
	"path/filepath"

	"github.com/goccy/go-yaml"
	"github.com/raitucarp/omni-archivist/internal/utils"
)

// sanitizeYAMLBytes strips disallowed ASCII control characters (0x00-0x08, 0x0B, 0x0C, 0x0E-0x1F, 0x7F)
// that break strict YAML 1.2 parsers such as yq when emitted by LLMs.
func sanitizeYAMLBytes(data []byte) []byte {
	return bytes.Map(func(r rune) rune {
		if (r >= 0x00 && r <= 0x08) || r == 0x0B || r == 0x0C || (r >= 0x0E && r <= 0x1F) || r == 0x7F {
			return -1
		}
		return r
	}, data)
}

func Write(m Metadata) (err error) {

	metadataContent, yamlErr := yaml.Marshal(m)
	if yamlErr != nil {
		return yamlErr
	}

	metadataContent = sanitizeYAMLBytes(metadataContent)

	todayStoryPath := utils.TodayStoryFullPath()
	err = os.WriteFile(filepath.Join(todayStoryPath, "metadata.yml"), metadataContent, 0644)
	if err != nil {
		return
	}

	return
}
