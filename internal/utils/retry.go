package utils

import (
	"log"
	"time"

	"github.com/avast/retry-go/v5"
)

// NewPromptRetrier returns a typed retrier configured with exponential backoff and informative logging
// to handle transient API 503/429 spikes from Google AI.
func NewPromptRetrier[T any](opName string) *retry.RetrierWithData[T] {
	return retry.NewWithData[T](
		retry.Attempts(6),
		retry.Delay(2*time.Second),
		retry.DelayType(retry.BackOffDelay),
		retry.MaxDelay(20*time.Second),
		retry.OnRetry(func(n uint, err error) {
			log.Printf("⚠️ [%s] Attempt %d failed: %v. Retrying with exponential backoff...", opName, n+1, err)
		}),
	)
}

// NewVoidRetrier returns a retrier for operations without a return value.
func NewVoidRetrier(opName string) *retry.Retrier {
	return retry.New(
		retry.Attempts(6),
		retry.Delay(2*time.Second),
		retry.DelayType(retry.BackOffDelay),
		retry.MaxDelay(20*time.Second),
		retry.OnRetry(func(n uint, err error) {
			log.Printf("⚠️ [%s] Attempt %d failed: %v. Retrying with exponential backoff...", opName, n+1, err)
		}),
	)
}
