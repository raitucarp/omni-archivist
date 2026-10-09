package metadata

// CharacterIndividuation represents the distinct physical, mental, and behavioural individuation (Chapter 4: Characterisation).
type CharacterIndividuation struct {
	Physical    string `yaml:"physical,omitempty" json:"physical,omitempty" jsonschema:"description=Physical features: bodily form, attire, biological or technological enhancements"`
	Mental      string `yaml:"mental,omitempty" json:"mental,omitempty" jsonschema:"description=Mental features: psychology, intellectual traits, temperament, worldview"`
	Behavioural string `yaml:"behavioural,omitempty" json:"behavioural,omitempty" jsonschema:"description=Behavioural features: habits, speech quirks, mannerisms, social disposition"`
}

type Character struct {
	Name             string                  `yaml:"name" json:"name" jsonschema:"description=The character's full name"`
	Gender           string                  `yaml:"gender" json:"gender" jsonschema:"description=The character's gender"`
	Description      string                  `yaml:"description" json:"description" jsonschema:"description=A brief description of the character's appearance and personality"`
	Role             string                  `yaml:"role" json:"role" jsonschema:"description=The character's functional role in the story, e.g., protagonist, antagonist, sidekick"`
	ActantRole       string                  `yaml:"actant_role,omitempty" json:"actant_role,omitempty" jsonschema:"enum=protagonist,enum=antagonist,enum=foil,enum=mentor,enum=deuteragonist,enum=helper,enum=opponent,description=Actantial narrative role (Greimas model)"`
	Complexity       string                  `yaml:"complexity,omitempty" json:"complexity,omitempty" jsonschema:"enum=flat,enum=round,description=Character complexity (E.M. Forster): flat (built around single quality) or round (complex, multi-faceted)"`
	Development      string                  `yaml:"development,omitempty" json:"development,omitempty" jsonschema:"enum=static,enum=dynamic,description=Character arc: static (unchanged) or dynamic (undergoes transformative change)"`
	Characterisation string                  `yaml:"characterisation,omitempty" json:"characterisation,omitempty" jsonschema:"enum=direct,enum=indirect,enum=mixed,description=Primary method of characterisation: direct narrator description or indirect presentation through dialogue and action"`
	Individuation    *CharacterIndividuation `yaml:"individuation,omitempty" json:"individuation,omitempty" jsonschema:"description=Individuation details (physical, mental, behavioural)"`
	Motivation       string                  `yaml:"motivation" json:"motivation" jsonschema:"description=The character's core motivation"`
	Conflict         string                  `yaml:"conflict" json:"conflict" jsonschema:"description=The character's internal and external conflict"`
}

