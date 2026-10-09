package pick

import (
	"context"
	"log"
	"strings"

	"github.com/firebase/genkit/go/genkit"
	"github.com/raitucarp/gown"
	"github.com/raitucarp/omni-archivist/internal/metadata"
	"github.com/raitucarp/omni-archivist/internal/utils"
	"github.com/urfave/cli/v3"
)

type VocabCount struct {
	Name  string `json:"name" jsonschema:"description=Lexical name"`
	Count int    `json:"count" jsonschema:"description=count"`
}

type VocabCounts []VocabCount

func vocabsCompositionAction(ctx context.Context, cmd *cli.Command) (err error) {
	gk, err := utils.GenkitFromContext(ctx)
	if err != nil {
		return
	}

	currentMetadata, err := metadata.Read()
	if err != nil {
		return err
	}

	genkit.DefineSchemaFor[metadata.Meta](gk)
	genkit.DefineSchemaFor[VocabCounts](gk)

	vocabsPrompt := genkit.LookupDataPrompt[metadata.Meta, *VocabCounts](gk, "vocabs")

	log.Printf("==> Generating vocabulary composition for science field '%s' and genre '%s'...\n",
		currentMetadata.Meta.ScienceField.Name, currentMetadata.Meta.Genre.Name)
	retrier := utils.NewPromptRetrier[*VocabCounts]("Vocabs Composition")
	vocabs, err := retrier.Do(func() (*VocabCounts, error) {
		res, _, pErr := vocabsPrompt.Execute(ctx, metadata.Meta{
			ScienceField: currentMetadata.Meta.ScienceField,
			Genre:        currentMetadata.Meta.Genre,
			Vocabs:       []metadata.Vocab{},
		})
		if pErr != nil {
			return nil, pErr
		}
		return res, nil
	})

	if err != nil {
		return err
	}

	lexRes, err := gown.ReadLexicalResource()
	if err != nil {
		return err
	}

	vocabEntriesMap := map[string]gown.LexicalEntries{}
	nounAllKinds := lexRes.Nouns().AllKind()
	verbAllKinds := lexRes.Verbs().AllKind()
	adjectiveAllKinds := lexRes.Adjectives().AllKind()

	for _, v := range *vocabs {
		if v.Count <= 0 {
			continue
		}

		if nounKind, ok := nounAllKinds[gown.NounKind(v.Name)]; ok {
			vocabEntriesMap[v.Name] = gown.LexicalEntries(nounKind.Random(v.Count))
		}

		if verbKind, ok := verbAllKinds[gown.VerbKind(v.Name)]; ok {
			vocabEntriesMap[v.Name] = gown.LexicalEntries(verbKind.Random(v.Count))
		}

		if v.Name == "adverb.all" {
			vocabEntriesMap[v.Name] = gown.LexicalEntries(lexRes.Adverbs().Random(v.Count))
		}

		if adjectivesKind, ok := adjectiveAllKinds[gown.AdjectiveKind(v.Name)]; ok {
			vocabEntriesMap[v.Name] = gown.LexicalEntries(adjectivesKind.Random(v.Count))
		}
	}

	// Guarantee that adverb.all always has at least 1-2 entries to serve as the story's thematic adverb
	if len(vocabEntriesMap["adverb.all"]) == 0 {
		vocabEntriesMap["adverb.all"] = gown.LexicalEntries(lexRes.Adverbs().Random(2))
	}

	currentMetadata.Meta.Vocabs = []metadata.Vocab{}
	var adverbWords []string

	for lexFile, entries := range vocabEntriesMap {
		for _, entry := range entries {
			vocab := metadata.Vocab{
				LexCategory: lexFile,
				Word:        entry.Lemma.WrittenForm,
			}

			if lexFile == "adverb.all" {
				adverbWords = append(adverbWords, entry.Lemma.WrittenForm)
			}

			for _, synset := range entry.Synsets() {
				if synset.Lexfile == lexFile {
					vocab.Definition += strings.Join(synset.Definitions, ".")
				}
			}

			currentMetadata.Meta.Vocabs = append(currentMetadata.Meta.Vocabs, vocab)
		}
	}

	currentMetadata.Meta.AdverbTheme = strings.Join(adverbWords, ", ")
	log.Printf("==> Selected Thematic Adverb(s): %s\n", currentMetadata.Meta.AdverbTheme)

	err = metadata.Write(currentMetadata)
	if err != nil {
		return err
	}
	return nil
}
