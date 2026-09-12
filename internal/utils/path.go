package utils

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"time"

	_ "github.com/joho/godotenv/autoload"
)

func ArtifactsDir() string {
	dir := os.Getenv("ARTIFACTS_DIR")
	if dir == "" {
		return "artifacts"
	}
	return dir
}

func TodayStoryFullPath() string {
	now := time.Now()
	directoryPath := filepath.Join(ArtifactsDir(),
		strconv.Itoa(now.Year()),
		fmt.Sprintf("%02d", now.Month()),
		fmt.Sprintf("%02d", now.Day()),
	)
	return directoryPath
}
