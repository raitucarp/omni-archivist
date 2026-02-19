package metadata

type Character struct {
	Name        string `yaml:"name" json:"name" jsonschema:"description=The character's full name"`
	Gender      string `yaml:"gender" json:"gender" jsonschema:"description=The character's gender"`
	Description string `yaml:"description" json:"description" jsonschema:"description=A brief description of the character's appearance and personality"`
	Role        string `yaml:"role" json:"role" jsonschema:"description=The character's role in the story, e.g., protagonist, antagonist, sidekick"`
	Motivation  string `yaml:"motivation" json:"motivation" jsonschema:"description=The character's motivation"`
	Conflict    string `yaml:"conflict" json:"conflict" jsonschema:"description=The character's conflict"`
}
