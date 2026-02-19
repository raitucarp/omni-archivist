package utils

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"time"

	_ "github.com/joho/godotenv/autoload"
)

var artifactDir = os.Getenv("ARTIFACTS_DIR")

func TodayStoryFullPath() string {
	now := time.Now()
	directoryPath := filepath.Join(artifactDir,
		strconv.Itoa(now.Year()),
		fmt.Sprintf("%02d", now.Month()),
		fmt.Sprintf("%02d", now.Day()),
	)
	return directoryPath
}
