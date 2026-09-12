package utils

import (
	"log"
	"math"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/avast/retry-go/v5"
)

var (
	retryAfterRegex = regexp.MustCompile(`(?i)(?:retryDelay:\s*|retry\s+in\s+)([0-9]+(?:\.[0-9]+)?)s`)
)

// SmartRetryDelay inspects errors returned from Google AI.
// If an explicit rate-limit / retry delay is specified (e.g. 429 quota reset), it respects that duration.
// If 503 UNAVAILABLE / high demand is reported, it increases wait time to allow the model capacity to recover.
func SmartRetryDelay(n uint, err error, config retry.DelayContext) time.Duration {
	if err != nil {
		errStr := err.Error()

		// 1. Check for explicit retryDelay from Google AI (e.g., "Please retry in 27.5s" or "retryDelay:27s")
		if match := retryAfterRegex.FindStringSubmatch(errStr); len(match) > 1 {
			if sec, parseErr := strconv.ParseFloat(match[1], 64); parseErr == nil && sec > 0 {
				delay := time.Duration(math.Ceil(sec)+3) * time.Second
				log.Printf("⏳ Rate limit detected, backing off for %v (requested by API: %vs + 3s buffer)...", delay, match[1])
				return delay
			}
		}

		// 2. Check for 429 or Quota Exceeded without specific seconds
		if strings.Contains(errStr, "429") || strings.Contains(errStr, "RESOURCE_EXHAUSTED") || strings.Contains(errStr, "Quota exceeded") {
			delay := 32 * time.Second
			log.Printf("⏳ Quota exhausted (429), backing off for %v...", delay)
			return delay
		}

		// 3. Check for 503 / Service Unavailable / High demand spikes
		if strings.Contains(errStr, "503") || strings.Contains(errStr, "UNAVAILABLE") || strings.Contains(errStr, "high demand") {
			delay := time.Duration(10*(n+1)) * time.Second
			if delay > 45*time.Second {
				delay = 45 * time.Second
			}
			log.Printf("⏳ High demand/503 spike detected, backing off for %v...", delay)
			return delay
		}
	}

	return retry.BackOffDelay(n, err, config)
}

// NewPromptRetrier returns a typed retrier configured with smart backoff and informative logging
// to handle transient API 503/429 spikes from Google AI.
func NewPromptRetrier[T any](opName string) *retry.RetrierWithData[T] {
	return retry.NewWithData[T](
		retry.Attempts(10),
		retry.Delay(5*time.Second),
		retry.DelayType(SmartRetryDelay),
		retry.MaxDelay(45*time.Second),
		retry.OnRetry(func(n uint, err error) {
			log.Printf("⚠️ [%s] Attempt %d failed: %v. Retrying...", opName, n+1, err)
		}),
	)
}

// NewVoidRetrier returns a retrier for operations without a return value.
func NewVoidRetrier(opName string) *retry.Retrier {
	return retry.New(
		retry.Attempts(10),
		retry.Delay(5*time.Second),
		retry.DelayType(SmartRetryDelay),
		retry.MaxDelay(45*time.Second),
		retry.OnRetry(func(n uint, err error) {
			log.Printf("⚠️ [%s] Attempt %d failed: %v. Retrying...", opName, n+1, err)
		}),
	)
}
