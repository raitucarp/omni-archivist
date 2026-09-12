package metadata

// PlotConflict represents the core agon or conflict of the story (Chapter 2: Plot).
type PlotConflict struct {
	Type        string `yaml:"type,omitempty" json:"type,omitempty" jsonschema:"enum=character_vs_character,enum=character_vs_nature,enum=character_vs_society,enum=character_vs_technology,enum=character_vs_self,description=Primary conflict category"`
	Description string `yaml:"description,omitempty" json:"description,omitempty" jsonschema:"description=Detailed explanation of the opposing forces and stakes"`
}

// PlotArc represents the classical dramatic structure (Freytag's pyramid).
type PlotArc struct {
	Exposition       string `yaml:"exposition" json:"exposition" jsonschema:"description=Introduction of existing world order and baseline state"`
	IncitingIncident string `yaml:"inciting_incident" json:"inciting_incident" jsonschema:"description=Event that disrupts equilibrium and triggers the main action"`
	RisingAction     string `yaml:"rising_action" json:"rising_action" jsonschema:"description=Escalation of obstacles, decisions, and stakes"`
	Climax           string `yaml:"climax" json:"climax" jsonschema:"description=The decisive turning point or highest point of conflict"`
	FallingAction    string `yaml:"falling_action" json:"falling_action" jsonschema:"description=Immediate aftermath and consequences of the climax"`
	Resolution       string `yaml:"resolution" json:"resolution" jsonschema:"description=New equilibrium or altered reality reached at the end"`
}

// Plot encapsulates the emplotment of events.
type Plot struct {
	Conflict PlotConflict `yaml:"conflict" json:"conflict" jsonschema:"description=Core conflict driving the narrative"`
	Arc      PlotArc      `yaml:"arc" json:"arc" jsonschema:"description=Dramatic arc of events"`
}
