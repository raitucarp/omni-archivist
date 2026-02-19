package metadata

type Vocab struct {
	LexCategory string `yaml:"lex_category" json:"lex_category" jsonschema:"description=The part of speech, e.g., noun, verb, adjective"`
	Word        string `yaml:"word" json:"word" jsonschema:"description=The vocabulary word"`
	Definition  string `yaml:"definition" json:"definition" jsonschema:"description=The meaning of the word"`
}
