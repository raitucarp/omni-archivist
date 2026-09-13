package metadata

// Narration models the communicative act between narrator and narratee (Chapter 5: Narration).
type Narration struct {
	Voice        string `yaml:"voice" json:"voice" jsonschema:"enum=first_person_autodiegetic,enum=first_person_homodiegetic,enum=third_person_heterodiegetic,enum=second_person,description=Narrative person and diegetic position"`
	Level        string `yaml:"level" json:"level" jsonschema:"enum=extradiegetic,enum=intradiegetic,description=Narrative level: extradiegetic (external narrator) or intradiegetic (story within a story)"`
	Focalisation string `yaml:"focalisation" json:"focalisation" jsonschema:"enum=zero_omniscient,enum=internal_fixed,enum=internal_variable,enum=external_objective,description=Focalisation: zero (omniscient), internal (fixed or variable), external (objective)"`
	Reliability  string `yaml:"reliability" json:"reliability" jsonschema:"enum=reliable,enum=unreliable,description=Narrator reliability: reliable or unreliable"`
}

// LanguageStyle models stylistic and rhetorical choices of the narrative discourse (Chapter 6: Language).
type LanguageStyle struct {
	Tone            string   `yaml:"tone" json:"tone" jsonschema:"description=Dominant emotional and stylistic tone, e.g., wonder, clinical, melancholic, noir"`
	Diction         string   `yaml:"diction" json:"diction" jsonschema:"enum=technical_scientific,enum=elevated_literary,enum=lyrical_poetic,enum=gritty_colloquial,description=Level of diction and vocabulary register"`
	FiguresOfSpeech []string `yaml:"figures_of_speech" json:"figures_of_speech" jsonschema:"description=Primary figures of speech utilized (metaphor, metonymy, oxymoron, simile, personification)"`
	ModeBalance     string   `yaml:"mode_balance" json:"mode_balance" jsonschema:"enum=mimesis_dominant,enum=balanced,enum=diegesis_dominant,description=Balance between mimesis (showing/scene) and diegesis (telling/summary)"`
	SentenceRhythm  string   `yaml:"sentence_rhythm,omitempty" json:"sentence_rhythm,omitempty" jsonschema:"enum=syncopated_variable,enum=staccato_urgent,enum=periodic_flowing,enum=contemplative_loose,description=Syntactic structure and sentence cadence (e.g., syncopated variation between short visceral clauses and expansive compound-complex sentences)"`
	Foregrounding   string   `yaml:"foregrounding,omitempty" json:"foregrounding,omitempty" jsonschema:"description=Techniques of linguistic foregrounding and defamiliarization to prevent cliché and standard prose patterns"`
}

// Discourse encapsulates narrative discourse and language.
type Discourse struct {
	Narration Narration     `yaml:"narration" json:"narration" jsonschema:"description=Narrator perspective, voice, and focalisation"`
	Language  LanguageStyle `yaml:"language" json:"language" jsonschema:"description=Language style, diction, and figurative expression"`
}
