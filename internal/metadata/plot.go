package metadata

// PlotConflict represents the core agon or conflict of the story (Chapter 2: Plot).
type PlotConflict struct {
	Type        string `yaml:"type,omitempty" json:"type,omitempty" jsonschema:"enum=character_vs_character,enum=character_vs_nature,enum=character_vs_society,enum=character_vs_technology,enum=character_vs_self,enum=character_vs_ideas,description=Primary conflict category"`
	Description string `yaml:"description,omitempty" json:"description,omitempty" jsonschema:"description=Detailed explanation of the opposing forces and stakes"`
}

// PlotArc represents the classical dramatic structure (Freytag's pyramid).
type PlotArc struct {
	Exposition       string `yaml:"exposition,omitempty" json:"exposition,omitempty" jsonschema:"description=Introduction of existing world order and baseline state"`
	IncitingIncident string `yaml:"inciting_incident,omitempty" json:"inciting_incident,omitempty" jsonschema:"description=Event that disrupts equilibrium and triggers the main action"`
	RisingAction     string `yaml:"rising_action,omitempty" json:"rising_action,omitempty" jsonschema:"description=Escalation of obstacles, decisions, and stakes"`
	Climax           string `yaml:"climax,omitempty" json:"climax,omitempty" jsonschema:"description=The decisive turning point or highest point of conflict"`
	FallingAction    string `yaml:"falling_action,omitempty" json:"falling_action,omitempty" jsonschema:"description=Immediate aftermath and consequences of the climax"`
	Resolution       string `yaml:"resolution,omitempty" json:"resolution,omitempty" jsonschema:"description=New equilibrium or altered reality reached at the end"`
}

// Plot encapsulates the emplotment of events (Chapter 2: Plot).
type Plot struct {
	Conflict        PlotConflict `yaml:"conflict" json:"conflict" jsonschema:"description=Core conflict driving the narrative"`
	Arc             PlotArc      `yaml:"arc" json:"arc" jsonschema:"description=Dramatic arc of events (Freytag's pyramid)"`
	Order           string       `yaml:"order,omitempty" json:"order,omitempty" jsonschema:"enum=chronological,enum=analepsis,enum=prolepsis,enum=achrony,description=Emplotment order: chronological, analepsis (flashbacks), prolepsis (flashforwards), or achrony"`
	Duration        string       `yaml:"duration,omitempty" json:"duration,omitempty" jsonschema:"enum=scene_dominant,enum=summary_dominant,enum=balanced_ellipsis,description=Narrative pacing and duration"`
	Frequency       string       `yaml:"frequency,omitempty" json:"frequency,omitempty" jsonschema:"enum=singulative,enum=repetitive,enum=iterative,description=Narrative frequency (Genette): singulative, repetitive, or iterative"`
	MicroEmplotment string       `yaml:"micro_emplotment,omitempty" json:"micro_emplotment,omitempty" jsonschema:"enum=suspense_driven,enum=surprise_driven,enum=balanced,description=Micro emplotment mechanism: suspense, surprise, or balanced"`
}

