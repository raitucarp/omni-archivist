package utils_test

import (
	"context"
	"errors"
	"testing"
	"time"

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

func TestSmartRetryDelay(t *testing.T) {
	// 1. Check regex parsing with retryDelay:27s
	err429 := errors.New("Error 429, Details: [map[retryDelay:27s]]")
	delay := utils.SmartRetryDelay(0, err429, nil)
	if delay < 30 {
		t.Fatalf("expected delay >= 30s for 27s retryDelay, got %v", delay)
	}

	// 2. Check "Please retry in 27.5s"
	errRetryIn := errors.New("Please retry in 27.5s., Status: RESOURCE_EXHAUSTED")
	delay2 := utils.SmartRetryDelay(0, errRetryIn, nil)
	if delay2 < 30 {
		t.Fatalf("expected delay >= 30s, got %v", delay2)
	}

	// 3. Check generic 503
	err503 := errors.New("Error 503, Message: This model is currently experiencing high demand.")
	delay3 := utils.SmartRetryDelay(1, err503, nil)
	if delay3 != 20*time.Second {
		t.Fatalf("expected 20s for attempt 2 on 503, got %v", delay3)
	}
}

