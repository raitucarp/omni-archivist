package pick

import (
	"context"
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

	vocabs, _, err := vocabsPrompt.Execute(ctx, metadata.Meta{
		ScienceField: currentMetadata.Meta.ScienceField,
		Genre:        currentMetadata.Meta.Genre,
		Vocabs:       []metadata.Vocab{},
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

	currentMetadata.Meta.Vocabs = []metadata.Vocab{}

	for lexFile, entries := range vocabEntriesMap {
		for _, entry := range entries {
			vocab := metadata.Vocab{
				LexCategory: lexFile,
				Word:        entry.Lemma.WrittenForm,
			}

			for _, synset := range entry.Synsets() {
				if synset.Lexfile == lexFile {
					vocab.Definition += strings.Join(synset.Definitions, ".")
				}
			}

			currentMetadata.Meta.Vocabs = append(currentMetadata.Meta.Vocabs, vocab)
		}
	}

	err = metadata.Write(currentMetadata)
	if err != nil {
		return err
	}
	return nil
}
