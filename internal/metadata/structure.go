package metadata

type Structure struct {
	Kind  [4]string `yaml:"kind" json:"kind" jsonschema:"description=A letter of MICE framework e.g: M, I, C or E"`
	Logic [4]string `yaml:"logic" json:"logic" jsonschema:"description=Narrative logic, e.g: World → question → inner change → event"`
	Use   string   `yaml:"type_use" json:"type_use" jsonschema:"description=e.g: External shock reshapes self, Reflective aftermath-driven stories, etc"`
}
