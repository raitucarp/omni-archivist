package metadata

type Meta struct {
	ScienceField ScienceField `yaml:"science_field" json:"science_field" jsonschema:"description=The field of science relevant to the story"`
	Genre        SciFiGenre   `yaml:"genre" json:"genre" jsonschema:"description=The genre of the story, e.g., science fiction, fantasy, mystery"`
	Vocabs       []Vocab      `yaml:"vocabs" json:"vocabs" jsonschema:"description=List of vocabulary words used in the story"`
}

type MiceContext string

const (
	MilieuOpenContext     MiceContext = "MO"
	MilieuCloseContext    MiceContext = "MC"
	InquiryOpenContext    MiceContext = "IO"
	InquiryCloseContext   MiceContext = "IC"
	CharacterOpenContext  MiceContext = "CO"
	CharacterCloseContext MiceContext = "CC"
	EventOpenContext      MiceContext = "EO"
	EventCloseContext     MiceContext = "EC"
)

type SceneSequel struct {
	Scene   Scene       `yaml:"scene" json:"scene" jsonschema:"description=The scene details"`
	Sequel  Sequel      `yaml:"sequel" json:"sequel" jsonschema:"description=The sequel details"`
	Context MiceContext `yaml:"context" json:"context" jsonschema:"enum=MO,enum=MC,enum=IO,enum=IC,enum=CO,enum=CC,enum=EO,enum=EC,description=MICE Framework context"`
}

type Metadata struct {
	Story Story `yaml:"story" json:"story" jsonschema:"description=The main story details"`
	Meta  Meta  `yaml:"meta" json:"meta" jsonschema:"description=Additional metadata about the story"`
}
