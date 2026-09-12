package metadata

import (
	"testing"
)

func TestRandomAesthetic(t *testing.T) {
	for i := 0; i < 10; i++ {
		a := RandomAesthetic()
		if a.ArtStyle == "" {
			t.Errorf("expected ArtStyle to be non-empty")
		}
		if a.ColorPalette == "" {
			t.Errorf("expected ColorPalette to be non-empty")
		}
		if a.Composition == "" {
			t.Errorf("expected Composition to be non-empty")
		}
		if a.Lighting == "" {
			t.Errorf("expected Lighting to be non-empty")
		}
		if a.Mood == "" {
			t.Errorf("expected Mood to be non-empty")
		}
		summary := a.Summary()
		if len(summary) == 0 {
			t.Errorf("expected summary to be non-empty")
		}
	}
}
