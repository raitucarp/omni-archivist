package main

import (
	"context"
	"log"
	"os"

	"github.com/firebase/genkit/go/genkit"
	"github.com/firebase/genkit/go/plugins/googlegenai"
	_ "github.com/joho/godotenv/autoload"
	"github.com/raitucarp/omni-archivist/internal/cli"
)

var gx *genkit.Genkit
var ctx context.Context
var model = os.Getenv("GEMINI_MODEL")

func init() {
	if model == "" {
		log.Fatal("GEMINI_MODEL environment variable is not set")
	}

	backgroundContext := context.Background()

	gx = genkit.Init(backgroundContext,
		genkit.WithPlugins(&googlegenai.GoogleAI{}),
		genkit.WithDefaultModel(model),
	)

	ctx = context.WithValue(backgroundContext, "genkit", gx)
}

func main() {
	app := cli.NewApp(ctx, "0.1.0")

	if err := app.Run(); err != nil {
		log.Fatal(err)
	}
}
