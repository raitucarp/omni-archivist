package metadata

// Theme models the meaning and conceptual core of the narrative (Chapter 7: Theme).
type Theme struct {
	CentralPremise     string   `yaml:"central_premise" json:"central_premise" jsonschema:"description=The core thematic premise and philosophical statement of the story"`
	SpeculativeInquiry string   `yaml:"speculative_inquiry" json:"speculative_inquiry" jsonschema:"description=The scientific or speculative question explored by the narrative"`
	Motifs             []string `yaml:"motifs" json:"motifs" jsonschema:"description=Recurring symbolic objects, sounds, or motifs that represent the theme"`
}
