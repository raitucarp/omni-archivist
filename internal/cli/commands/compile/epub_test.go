package compile

import (
	"os"
	"path/filepath"
	"testing"
)

func TestLoadStoryItem(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "omni_test_*")
	if err != nil {
		t.Fatalf("failed creating temp dir: %v", err)
	}
	defer os.RemoveAll(tempDir)

	storyPath := filepath.Join(tempDir, "story.md")
	metaPath := filepath.Join(tempDir, "metadata.yml")

	storyContent := "# The Quantum Threshold\n\nSpace was folding."
	metaContent := "story:\n  title: 'The Quantum Threshold'\n"

	if err := os.WriteFile(storyPath, []byte(storyContent), 0644); err != nil {
		t.Fatalf("failed writing story.md: %v", err)
	}
	if err := os.WriteFile(metaPath, []byte(metaContent), 0644); err != nil {
		t.Fatalf("failed writing metadata.yml: %v", err)
	}

	item, err := loadStoryItem(tempDir, storyPath)
	if err != nil {
		t.Fatalf("loadStoryItem failed: %v", err)
	}

	if item.StoryMD != storyContent {
		t.Errorf("expected story content %q, got %q", storyContent, item.StoryMD)
	}
	if item.Metadata.Story.Title != "The Quantum Threshold" {
		t.Errorf("expected title 'The Quantum Threshold', got %q", item.Metadata.Story.Title)
	}
}
