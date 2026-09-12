package compile

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestPagesCompilation(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "omni_pages_test_*")
	if err != nil {
		t.Fatalf("failed to create temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	outDir := filepath.Join(tempDir, "public")

	// Verify static assets generation
	err = writeStaticAssets(outDir)
	if err != nil {
		t.Fatalf("failed writing static assets: %v", err)
	}

	cssBytes, err := os.ReadFile(filepath.Join(outDir, "assets", "css", "style.css"))
	if err != nil || len(cssBytes) == 0 {
		t.Fatalf("expected style.css to be written, got err: %v", err)
	}
	if !strings.Contains(string(cssBytes), "--font-prose") {
		t.Errorf("style.css missing --font-prose definition")
	}

	jsBytes, err := os.ReadFile(filepath.Join(outDir, "assets", "js", "theme.js"))
	if err != nil || len(jsBytes) == 0 {
		t.Fatalf("expected theme.js to be written, got err: %v", err)
	}
	if !strings.Contains(string(jsBytes), "omni-theme") {
		t.Errorf("theme.js missing theme toggle logic")
	}

	// Verify reading time estimator
	rt := estimateReadingTime("one two three four five six seven eight nine ten")
	if rt != "1 min read" {
		t.Errorf("expected '1 min read', got %s", rt)
	}

	// Verify volume gradient generation
	var dummyStories []StoryItem
	dummyStories = append(dummyStories, StoryItem{DirPath: "artifacts/2026/09/12"})
	grad := computeVolumeGradient(dummyStories)
	if !strings.HasPrefix(grad, "linear-gradient") {
		t.Errorf("expected linear-gradient, got %s", grad)
	}
}
