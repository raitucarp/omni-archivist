package utils_test

import (
	"context"
	"errors"
	"testing"

	"github.com/firebase/genkit/go/genkit"
	"github.com/firebase/genkit/go/plugins/googlegenai"
	"github.com/raitucarp/omni-archivist/internal/utils"
)

func TestGenkitPromptLoading(t *testing.T) {
	t.Setenv("GEMINI_API_KEY", "dummy-key")
	ctx := context.Background()
	gk := genkit.Init(ctx,
		genkit.WithPlugins(&googlegenai.GoogleAI{}),
		genkit.WithDefaultModel("googleai/gemini-flash-latest"),
		genkit.WithPromptDir("../../prompts"),
	)
	if gk == nil {
		t.Fatal("expected genkit instance to be non-nil")
	}

	p := genkit.LookupPrompt(gk, "scifi_genre")
	if p == nil {
		t.Fatal("expected scifi_genre prompt to be loaded")
	}
}

func TestPromptRetrier(t *testing.T) {
	retrier := utils.NewPromptRetrier[string]("TestOp")
	attempts := 0
	res, err := retrier.Do(func() (string, error) {
		attempts++
		if attempts < 2 {
			return "", errors.New("temporary error 503")
		}
		return "success", nil
	})
	if err != nil {
		t.Fatalf("expected success, got %v", err)
	}
	if res != "success" {
		t.Fatalf("expected 'success', got %s", res)
	}
	if attempts != 2 {
		t.Fatalf("expected 2 attempts, got %d", attempts)
	}
}
