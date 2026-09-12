package metadata

// Setting models the spatial existents of the narrative (Chapter 3: Setting).
// It arranges environments where story events occur, along with their sensory atmosphere and functions.
type Setting struct {
	Macro      string `yaml:"macro" json:"macro" jsonschema:"description=Cosmic, planetary, or societal scale environment"`
	Meso       string `yaml:"meso" json:"meso" jsonschema:"description=Regional, urban, station, or facility scale environment"`
	Micro      string `yaml:"micro" json:"micro" jsonschema:"description=Immediate rooms, chambers, or physical spaces"`
	Topography string `yaml:"topography" json:"topography" jsonschema:"description=Geographical and physical layout of the environment"`
	Atmosphere string `yaml:"atmosphere" json:"atmosphere" jsonschema:"description=Sensory texture including climate, lighting, sounds, and smells"`
	Function   string `yaml:"function,omitempty" json:"function,omitempty" jsonschema:"enum=decorative,enum=functional_causal,enum=symbolic,enum=affective,description=Function of setting in the narrative: decorative background, causal plot driver, symbolic meaning, or psychological/affective reflection"`
	Chronotope string `yaml:"chronotope" json:"chronotope" jsonschema:"description=Bakhtinian chronotope: the intrinsic connectedness of temporal and spatial relationships in the sci-fi setting"`
}
