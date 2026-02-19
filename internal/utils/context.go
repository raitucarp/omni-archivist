package utils

import (
	"context"
	"errors"

	"github.com/firebase/genkit/go/genkit"
)

func GenkitFromContext(ctx context.Context) (gk *genkit.Genkit, err error) {
	gk, ok := ctx.Value("genkit").(*genkit.Genkit)

	if !ok {
		err = errors.New("Cannot find genkit")
		return
	}

	return
}
